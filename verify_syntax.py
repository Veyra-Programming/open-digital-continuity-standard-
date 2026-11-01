# Verification script for Cloudflare Worker JS files
import sys

def check_brackets(filename):
    with open(filename, 'r', encoding='utf-8') as f:
        src = f.read()
    stack = []
    i = 0
    line = 1
    col = 1
    in_str = None
    in_line_comment = False
    in_block_comment = False
    in_regex = False
    last_non_ws = ''
    
    while i < len(src):
        ch = src[i]
        nxt = src[i+1] if i+1 < len(src) else ''
        
        if ch == '\n':
            line += 1
            col = 1
            if in_line_comment:
                in_line_comment = False
            i += 1
            continue
        col += 1
        
        if in_line_comment:
            i += 1
            continue
        if in_block_comment:
            if ch == '*' and nxt == '/':
                in_block_comment = False
                i += 2
                continue
            i += 1
            continue
            
        if in_regex:
            if ch == '\\':
                i += 2
                continue
            if ch == '/':
                in_regex = False
            i += 1
            continue
            
        if in_str:
            if ch == '\\':
                i += 2
                continue
            if ch == in_str:
                in_str = None
            i += 1
            continue
            
        if ch == '/' and nxt == '/':
            in_line_comment = True
            i += 2
            continue
        if ch == '/' and nxt == '*':
            in_block_comment = True
            i += 2
            continue
            
        if ch == '/':
            # Check if this slash is a regex literal start
            if last_non_ws in ('=', '(', ',', ':', '[', '!', '&', '|', '?', ';', '{', '}'):
                in_regex = True
                i += 1
                continue
            
        if ch in ('"', "'", '`'):
            in_str = ch
            i += 1
            continue
            
        if not ch.isspace():
            last_non_ws = ch
            
        if ch in '({[':
            stack.append((ch, line, col))
        elif ch in ')}]':
            if not stack:
                print(f'{filename}: Unmatched closing {ch} at line {line}, col {col}')
                return False
            top, tl, tc = stack.pop()
            matches = {')': '(', '}': '{', ']': '['}
            if top != matches[ch]:
                print(f'{filename}: Mismatched {ch} at line {line}, col {col} expected matching for {top} at line {tl}, col {tc}')
                return False
        i += 1
        
    if stack:
        print(f'{filename}: Unclosed brackets: {stack[:5]}')
        return False
    print(f'{filename}: Syntax brackets are 100% BALANCED!')
    return True

res1 = check_brackets(r'E:\ODCS models\api-worker.js')
res2 = check_brackets(r'E:\ODCS models\_worker.js')

if not (res1 and res2):
    sys.exit(1)
print("ALL JS SYNTAX CHECKS PASSED!")
