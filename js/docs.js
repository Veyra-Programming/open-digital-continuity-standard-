/**
 * ODCS Documentation Portal — Dynamic Specification Loader, Markdown Parser,
 * Terminal Code Highlighter & Cyber Interactive Engine
 * Zero external runtime dependencies; supports full offline reading via Service Worker.
 */

const DOCS_MAP = {
  'odc-model': {
    title: 'ODC Master Model (RFC Draft)',
    file: './model/ODC-MODEL.md',
    id: 'RFC-ODCS-001',
    category: 'Core Architecture RFC',
    badge: 'RFC'
  },
  'layer-1': {
    title: 'Layer 1: Local Durability',
    file: './model/layer-1.md',
    id: 'ODCS-SPEC-L1',
    category: 'Durability Layer',
    badge: 'L1'
  },
  'layer-2': {
    title: 'Layer 2: Transport & Sync',
    file: './model/layer-2.md',
    id: 'ODCS-SPEC-L2',
    category: 'Transport & Consensus',
    badge: 'L2'
  },
  'layer-3': {
    title: 'Layer 3: Runtime Adaptation',
    file: './model/layer-3.md',
    id: 'ODCS-SPEC-L3',
    category: 'Environment Adaptation',
    badge: 'L3'
  },
  'layer-4': {
    title: 'Layer 4: Application UX',
    file: './model/layer-4.md',
    id: 'ODCS-SPEC-L4',
    category: 'Continuity Interface',
    badge: 'L4'
  },
  'architecture': {
    title: 'Systems Architecture',
    file: './docs/ARCHITECTURE.md',
    id: 'ODCS-GUIDE-ARCH',
    category: 'System Blueprint',
    badge: 'ARCH'
  },
  'implementation-guide': {
    title: 'Implementation Guide',
    file: './docs/IMPLEMENTATION-GUIDE.md',
    id: 'ODCS-GUIDE-IMPL',
    category: 'Developer Recipes',
    badge: 'GUIDE'
  },
  'brand-identity': {
    title: 'Brand & Logo Identity Specification',
    file: './docs/BRAND-IDENTITY.md',
    id: 'ODCS-SPEC-BRAND',
    category: 'Identity Standard',
    badge: 'BRAND'
  },
  'faq': {
    title: 'Frequently Asked Questions',
    file: './docs/FAQ.md',
    id: 'ODCS-REF-FAQ',
    category: 'Technical Reference',
    badge: 'FAQ'
  }
};

const DOCS_KEYS = [
  'odc-model',
  'layer-1',
  'layer-2',
  'layer-3',
  'layer-4',
  'architecture',
  'implementation-guide',
  'brand-identity',
  'faq'
];

let currentRawMarkdown = '';
let currentDocKey = 'odc-model';

document.addEventListener('DOMContentLoaded', () => {
  initDocNavigation();
  initSearchFilter();
  initScrollEffects();
  initMobileDrawer();
  initSpecActionButtons();
  loadCurrentDocFromHash();

  window.addEventListener('hashchange', () => {
    loadCurrentDocFromHash();
  });
});

/* --------------------------------------------------------------------------
   Navigation & Routing
   -------------------------------------------------------------------------- */
function initDocNavigation() {
  const navItems = document.querySelectorAll('.docs-nav-item');
  const sidebar = document.getElementById('docs-sidebar');

  navItems.forEach(item => {
    const link = item.querySelector('a');
    if (!link) return;
    link.addEventListener('click', () => {
      navItems.forEach(n => n.classList.remove('active'));
      item.classList.add('active');

      // On mobile viewports, automatically close drawer on selection
      if (sidebar && sidebar.classList.contains('mobile-open')) {
        sidebar.classList.remove('mobile-open');
        const toggleBtn = document.getElementById('docs-sidebar-toggle');
        if (toggleBtn) toggleBtn.setAttribute('aria-expanded', 'false');
      }
    });
  });
}

function loadCurrentDocFromHash() {
  const hash = window.location.hash.replace('#', '') || 'odc-model';
  currentDocKey = DOCS_MAP[hash] ? hash : 'odc-model';
  const docConfig = DOCS_MAP[currentDocKey];

  // Update active sidebar item
  document.querySelectorAll('.docs-nav-item').forEach(item => {
    const a = item.querySelector('a');
    if (a && a.getAttribute('href') === `#${currentDocKey}`) {
      item.classList.add('active');
    } else {
      item.classList.remove('active');
    }
  });

  // Update breadcrumb
  const breadcrumb = document.getElementById('docs-current-breadcrumb');
  if (breadcrumb) breadcrumb.textContent = docConfig.title;

  // Update mobile active bar
  const mobileTitle = document.getElementById('docs-mobile-current-title');
  if (mobileTitle) mobileTitle.textContent = docConfig.title;

  // Update category and spec ID badge
  const categoryLbl = document.getElementById('spec-category-label');
  if (categoryLbl) categoryLbl.textContent = docConfig.category;

  const idBadge = document.getElementById('spec-meta-id-badge');
  if (idBadge) idBadge.textContent = docConfig.id;

  fetchAndRenderMarkdown(currentDocKey, docConfig.file);
}

/* --------------------------------------------------------------------------
   Markdown Fetching & Rendering Pipeline
   -------------------------------------------------------------------------- */
async function fetchAndRenderMarkdown(docKey, filePath) {
  const container = document.getElementById('docs-rendered-body');
  if (!container) return;

  // 1. If running under file:// or offline fallback data exists, render directly
  if (window.location.protocol === 'file:' && window.ODCS_EMBEDDED_SPECS && window.ODCS_EMBEDDED_SPECS[docKey]) {
    renderSpecContent(window.ODCS_EMBEDDED_SPECS[docKey], docKey);
    return;
  }

  container.innerHTML = `
    <div style="padding: 40px 0; text-align: center; color: var(--text-dim); font-family: var(--font-mono); font-size: 0.9rem;">
      <span style="display: inline-block; animation: telemetryPulse 1.5s infinite ease-in-out; color: var(--cyan-primary);">⚡</span>
      Loading specification stream...
    </div>
  `;

  // 2. Dynamic fetch over HTTP/HTTPS (supports live dev updates & CDN)
  try {
    const response = await fetch(filePath);
    if (!response.ok) throw new Error(`HTTP error ${response.status}`);
    const mdText = await response.text();
    renderSpecContent(mdText, docKey);
  } catch {
    // 3. Resilient fallback to embedded specs data store
    if (window.ODCS_EMBEDDED_SPECS && window.ODCS_EMBEDDED_SPECS[docKey]) {
      renderSpecContent(window.ODCS_EMBEDDED_SPECS[docKey], docKey);
    } else {
      container.innerHTML = `
        <div style="background: rgba(244, 63, 94, 0.1); border: 1px solid var(--rose-alert); padding: 24px; border-radius: 8px;">
          <h3 style="color: var(--rose-alert); margin-bottom: 8px;">Failed to Stream Specification</h3>
          <p style="color: var(--text-body); font-size: 0.9rem;">Unable to load <code>${filePath}</code>.</p>
        </div>
      `;
    }
  }
}

function renderSpecContent(mdText, docKey) {
  currentRawMarkdown = mdText;
  const container = document.getElementById('docs-rendered-body');
  if (!container) return;

  // Update telemetry metrics (words & reading time)
  updateSpecTelemetry(mdText);

  // Convert markdown to cyber HTML
  container.innerHTML = parseMarkdownToHtml(mdText);

  // Render previous/next pagination cards
  renderPagination(docKey);

  // Attach interactive copy triggers to code cards
  attachCodeCopyButtons();

  // Attach heading anchor copy links
  attachHeadingAnchors();

  // Attach dynamic mouse spotlight tracking to newly created cards
  attachCardMouseSpotlights();

  // Scroll to top of article on change
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function updateSpecTelemetry(mdText) {
  const words = mdText.trim().split(/\s+/).filter(Boolean).length;
  const minutes = Math.max(1, Math.ceil(words / 200));

  const readingTimeEl = document.getElementById('spec-reading-time');
  if (readingTimeEl) readingTimeEl.textContent = `⏱ ~${minutes} min read`;

  const wordCountEl = document.getElementById('spec-word-count');
  if (wordCountEl) wordCountEl.textContent = `~${words.toLocaleString()} words`;
}

/* --------------------------------------------------------------------------
   Lightweight Deterministic Markdown Parser with Terminal Highlighting
   -------------------------------------------------------------------------- */
function parseMarkdownToHtml(markdown) {
  let html = markdown;

  // 1. Fenced Code Blocks -> High-Tech Terminal Card
  html = html.replace(/```([a-z0-9_-]*)\n([\s\S]*?)```/gm, (match, lang, code) => {
    const rawCode = code.trim();
    const cleanLang = (lang || 'code').toLowerCase();
    const highlighted = highlightSyntax(rawCode, cleanLang);
    const langDisplay = cleanLang.toUpperCase();

    return `
      <div class="docs-code-card" data-language="${cleanLang}">
        <div class="code-card-header">
          <div class="terminal-dots">
            <span class="dot dot-red"></span>
            <span class="dot dot-yellow"></span>
            <span class="dot dot-green"></span>
          </div>
          <span class="code-lang-tag">${langDisplay}</span>
          <button type="button" class="copy-code-btn" aria-label="Copy code to clipboard">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
              <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
            </svg>
            <span class="copy-code-label">Copy</span>
          </button>
        </div>
        <pre><code class="language-${cleanLang}">${highlighted}</code></pre>
      </div>
    `;
  });

  // 2. Inline Code
  html = html.replace(/`([^`]+)`/g, (match, code) => `<code>${escapeHtml(code)}</code>`);

  // 3. Headings with Slug IDs for Deep Linking
  html = html.replace(/^### (.*$)/gim, (m, title) => {
    const slug = slugify(title);
    return `<h3 id="${slug}">${title}</h3>`;
  });

  html = html.replace(/^## (.*$)/gim, (m, title) => {
    const slug = slugify(title);
    return `
      <h2 id="${slug}">
        <span>${title}</span>
        <a href="#${slug}" class="heading-anchor" title="Direct section link" aria-label="Link to section">#</a>
      </h2>
    `;
  });

  html = html.replace(/^# (.*$)/gim, (m, title) => {
    return `<h1>${title}</h1>`;
  });

  // 4. Blockquotes -> High-Tech Notice Banners
  html = html.replace(/^\> (.*$)/gim, (match, content) => {
    let calloutType = 'callout-info';
    let headerText = 'SPECIFICATION NOTE';
    let icon = 'ℹ';

    if (content.includes('**Invariant') || content.includes('Invariant:')) {
      calloutType = 'callout-invariant';
      headerText = 'CORE ARCHITECTURE INVARIANT';
      icon = '⚡';
    } else if (content.includes('**Warning') || content.includes('Warning:')) {
      calloutType = 'callout-warning';
      headerText = 'CRITICAL REQUIREMENT';
      icon = '⚠';
    }

    return `
      <div class="docs-callout ${calloutType}">
        <div class="docs-callout-header">
          <span>${icon}</span>
          <span>${headerText}</span>
        </div>
        <p>${content}</p>
      </div>
    `;
  });

  // 5. Tables wrapped in responsive cyber container
  html = html.replace(/\n(\|.+?\|)\n(\|[-:\s|]+?\|)\n((?:\|.+?\|\n?)+)/g, (match, header, divider, rows) => {
    const ths = header.split('|').filter(c => c.trim()).map(c => `<th>${c.trim()}</th>`).join('');
    const trs = rows.trim().split('\n').map(row => {
      const tds = row.split('|').filter(c => c.trim()).map(c => `<td>${c.trim()}</td>`).join('');
      return `<tr>${tds}</tr>`;
    }).join('');
    return `
      <div class="docs-table-wrapper">
        <table>
          <thead><tr>${ths}</tr></thead>
          <tbody>${trs}</tbody>
        </table>
      </div>
    `;
  });

  // 6. Horizontal Rules
  html = html.replace(/^---$/gim, '<hr>');

  // 7. Bold & Italic
  html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  html = html.replace(/\*(.*?)\*/g, '<em>$1</em>');

  // 8. Lists
  html = html.replace(/^\* (.*$)/gim, '<li>$1</li>');
  html = html.replace(/^- (.*$)/gim, '<li>$1</li>');
  html = html.replace(/(<li>.*<\/li>)/gms, '<ul>$1</ul>');
  html = html.replace(/<\/ul>\s*<ul>/g, '');

  // 9. Links
  html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>');

  // 10. Paragraphs
  html = html.split('\n\n').map(p => {
    p = p.trim();
    if (!p) return '';
    if (
      p.startsWith('<h') ||
      p.startsWith('<div') ||
      p.startsWith('<hr') ||
      p.startsWith('<table') ||
      p.startsWith('<ul') ||
      p.startsWith('<ol')
    ) {
      return p;
    }
    return `<p>${p}</p>`;
  }).join('\n');

  return html;
}

/* --------------------------------------------------------------------------
   Pure Vanilla Regex Syntax Highlighter
   Tokenizes keywords, types, globals, functions, numbers, strings & comments
   -------------------------------------------------------------------------- */
function highlightSyntax(code, lang) {
  let out = escapeHtml(code);

  // Preserve comments
  const comments = [];
  out = out.replace(/(\/\/[^\n]*|\/\*[\s\S]*?\*\/|(?<=\s|^)#[^\n]*)/g, (m) => {
    comments.push(m);
    return `___COMMENT_${comments.length - 1}___`;
  });

  // Preserve strings
  const strings = [];
  out = out.replace(/(&quot;.*?&quot;|&#39;.*?&#39;|`.*?`)/g, (m) => {
    strings.push(m);
    return `___STRING_${strings.length - 1}___`;
  });

  // Keywords
  out = out.replace(
    /\b(async|await|const|let|var|function|return|if|else|for|while|class|extends|import|export|from|default|new|try|catch|finally|throw|typeof|instanceof|switch|case|break|continue|null|undefined|true|false)\b/g,
    '<span class="token-kw">$1</span>'
  );

  // Types / Modifiers
  out = out.replace(
    /\b(interface|type|enum|implements|public|private|protected|static|readonly)\b/g,
    '<span class="token-type">$1</span>'
  );

  // Built-ins & Core Architectural Primitives
  out = out.replace(
    /\b(console|window|document|navigator|crypto|Promise|Map|Set|Array|Object|String|Number|Boolean|JSON|Math|Date|RegExp|Error|IndexedDB|SQLite|CRDT|VectorClock|ODCS|WAL|ACID|HLC|UUIDv7)\b/g,
    '<span class="token-builtin">$1</span>'
  );

  // Functions
  out = out.replace(/\b([a-zA-Z_$][a-zA-Z0-9_$]*)(?=\s*\()/g, '<span class="token-fn">$1</span>');

  // Numbers & CSS units
  out = out.replace(/\b(\d+(?:\.\d+)?(?:ms|px|rem|em|%)?)\b/g, '<span class="token-num">$1</span>');

  // Restore strings
  out = out.replace(/___STRING_(\d+)___/g, (_, i) => `<span class="token-str">${strings[i]}</span>`);

  // Restore comments
  out = out.replace(/___COMMENT_(\d+)___/g, (_, i) => `<span class="token-comment">${comments[i]}</span>`);

  return out;
}

function escapeHtml(str) {
  return str.replace(/[&<>'"]/g, tag => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    "'": '&#39;',
    '"': '&quot;'
  }[tag] || tag));
}

function slugify(text) {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .trim()
    .replace(/[\s_-]+/g, '-');
}

/* --------------------------------------------------------------------------
   Interactive Code Card Copy Triggers
   -------------------------------------------------------------------------- */
function attachCodeCopyButtons() {
  const cards = document.querySelectorAll('.docs-code-card');
  cards.forEach(card => {
    const btn = card.querySelector('.copy-code-btn');
    const codeEl = card.querySelector('code');
    const label = card.querySelector('.copy-code-label');
    if (!btn || !codeEl) return;

    btn.addEventListener('click', async () => {
      try {
        await navigator.clipboard.writeText(codeEl.textContent);
        btn.classList.add('copied');
        if (label) label.textContent = '✓ Copied';

        setTimeout(() => {
          btn.classList.remove('copied');
          if (label) label.textContent = 'Copy';
        }, 2200);
      } catch {
        if (label) label.textContent = '✓ Copied';
      }
    });
  });
}

/* --------------------------------------------------------------------------
   Heading Anchor Links & Deep-Link Copying
   -------------------------------------------------------------------------- */
function attachHeadingAnchors() {
  const anchors = document.querySelectorAll('.docs-rendered-body .heading-anchor');
  anchors.forEach(anchor => {
    anchor.addEventListener('click', (e) => {
      e.preventDefault();
      const href = anchor.getAttribute('href');
      const target = document.querySelector(href);
      if (target) {
        target.scrollIntoView({ behavior: 'smooth' });
        history.replaceState(null, '', href);
      }
    });
  });
}

/* --------------------------------------------------------------------------
   Specification Pagination (Previous / Next Spec)
   -------------------------------------------------------------------------- */
function renderPagination(docKey) {
  const container = document.getElementById('docs-pagination');
  if (!container) return;

  const currentIndex = DOCS_KEYS.indexOf(docKey);
  if (currentIndex === -1) {
    container.innerHTML = '';
    return;
  }

  const prevKey = currentIndex > 0 ? DOCS_KEYS[currentIndex - 1] : null;
  const nextKey = currentIndex < DOCS_KEYS.length - 1 ? DOCS_KEYS[currentIndex + 1] : null;

  let html = '';

  if (prevKey && DOCS_MAP[prevKey]) {
    html += `
      <a href="#${prevKey}" class="docs-pagination-card prev" aria-label="Previous specification: ${DOCS_MAP[prevKey].title}">
        <span class="pagination-dir">
          <span>←</span>
          <span>Previous Specification</span>
        </span>
        <span class="pagination-title">${DOCS_MAP[prevKey].title}</span>
      </a>
    `;
  } else {
    html += '<div></div>';
  }

  if (nextKey && DOCS_MAP[nextKey]) {
    html += `
      <a href="#${nextKey}" class="docs-pagination-card next" aria-label="Next specification: ${DOCS_MAP[nextKey].title}">
        <span class="pagination-dir">
          <span>Next Specification</span>
          <span>→</span>
        </span>
        <span class="pagination-title">${DOCS_MAP[nextKey].title}</span>
      </a>
    `;
  }

  container.innerHTML = html;
}

/* --------------------------------------------------------------------------
   Spec Hero Card Action Buttons (Copy Markdown & Download)
   -------------------------------------------------------------------------- */
function initSpecActionButtons() {
  const copyBtn = document.getElementById('btn-copy-raw-spec');
  const copyLabel = document.getElementById('btn-copy-raw-label');
  const downloadBtn = document.getElementById('btn-download-spec');

  if (copyBtn) {
    copyBtn.addEventListener('click', async () => {
      if (!currentRawMarkdown) return;
      try {
        await navigator.clipboard.writeText(currentRawMarkdown);
        if (copyLabel) copyLabel.textContent = '✓ Copied!';
        copyBtn.style.borderColor = 'var(--emerald-resilience)';
        copyBtn.style.color = 'var(--emerald-resilience)';

        setTimeout(() => {
          if (copyLabel) copyLabel.textContent = 'Copy Spec';
          copyBtn.style.borderColor = '';
          copyBtn.style.color = '';
        }, 2200);
      } catch {
        alert('Specification copied to clipboard!');
      }
    });
  }

  if (downloadBtn) {
    downloadBtn.addEventListener('click', () => {
      if (!currentRawMarkdown) return;
      const blob = new Blob([currentRawMarkdown], { type: 'text/markdown;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${currentDocKey}.md`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    });
  }
}

/* --------------------------------------------------------------------------
   Search Filter with Keyboard Shortcuts & Clear Button
   -------------------------------------------------------------------------- */
function initSearchFilter() {
  const searchInput = document.getElementById('docs-search-input');
  const clearBtn = document.getElementById('docs-search-clear');
  if (!searchInput) return;

  function applyFilter(term) {
    const navItems = document.querySelectorAll('.docs-nav-item');
    navItems.forEach(item => {
      const text = item.textContent.toLowerCase();
      if (text.includes(term)) {
        item.style.display = 'block';
      } else {
        item.style.display = 'none';
      }
    });

    if (clearBtn) {
      clearBtn.style.display = term ? 'block' : 'none';
    }
  }

  searchInput.addEventListener('input', (e) => {
    applyFilter(e.target.value.toLowerCase().trim());
  });

  if (clearBtn) {
    clearBtn.addEventListener('click', () => {
      searchInput.value = '';
      applyFilter('');
      searchInput.focus();
    });
  }

  // Keyboard shortcut: '/' or 'Ctrl+K' / 'Cmd+K' focuses search
  window.addEventListener('keydown', (e) => {
    const isInput = ['INPUT', 'TEXTAREA'].includes(document.activeElement.tagName);
    if ((e.key === '/' && !isInput) || ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k')) {
      e.preventDefault();
      searchInput.focus();
      searchInput.select();
    } else if (e.key === 'Escape' && document.activeElement === searchInput) {
      searchInput.value = '';
      applyFilter('');
      searchInput.blur();
    }
  });
}

/* --------------------------------------------------------------------------
   Scroll Progress Indicator & Back-to-Top Button
   -------------------------------------------------------------------------- */
function initScrollEffects() {
  const progressBar = document.getElementById('docs-reading-progress');
  const backToTopBtn = document.getElementById('docs-back-to-top');

  window.addEventListener('scroll', () => {
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;

    // Progress bar width
    if (progressBar && docHeight > 0) {
      const percent = Math.min(100, Math.max(0, (scrollTop / docHeight) * 100));
      progressBar.style.width = `${percent}%`;
    }

    // Back to top visibility
    if (backToTopBtn) {
      if (scrollTop > 320) {
        backToTopBtn.classList.add('visible');
      } else {
        backToTopBtn.classList.remove('visible');
      }
    }
  }, { passive: true });

  if (backToTopBtn) {
    backToTopBtn.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }
}

/* --------------------------------------------------------------------------
   Mobile Drawer Toggle
   -------------------------------------------------------------------------- */
function initMobileDrawer() {
  const toggleBtn = document.getElementById('docs-sidebar-toggle');
  const sidebar = document.getElementById('docs-sidebar');
  if (!toggleBtn || !sidebar) return;

  toggleBtn.addEventListener('click', () => {
    const isOpen = sidebar.classList.toggle('mobile-open');
    toggleBtn.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
  });

  // Close drawer if user clicks outside of sidebar on mobile
  document.addEventListener('click', (e) => {
    if (sidebar.classList.contains('mobile-open')) {
      if (!sidebar.contains(e.target) && !toggleBtn.contains(e.target)) {
        sidebar.classList.remove('mobile-open');
        toggleBtn.setAttribute('aria-expanded', 'false');
      }
    }
  });
}

/* --------------------------------------------------------------------------
   Card Mouse-Tracking Spotlight Illumination
   -------------------------------------------------------------------------- */
function attachCardMouseSpotlights() {
  const targets = document.querySelectorAll(
    '.spec-meta-card, .docs-code-card, .docs-callout, .docs-pagination-card, .docs-sidebar-telemetry'
  );

  targets.forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      card.style.setProperty('--mouse-x', `${x}px`);
      card.style.setProperty('--mouse-y', `${y}px`);
    });
  });
}
