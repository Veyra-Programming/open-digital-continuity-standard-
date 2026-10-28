# Contributing to the Open Digital Continuity Standard (ODCS)

Thank you for your interest in contributing to ODCS! As an open standard initiative, we welcome contributions across technical specifications, reference implementations, educational material, architecture reviews, and translation.

---

## 🏛️ How the Standard Evolves: The RFC Process

ODCS technical specifications evolve through a structured **Request for Comments (RFC)** lifecycle:

1. **Stage 0: Concept / Idea** — Discussed in GitHub Discussions or Working Group syncs.
2. **Stage 1: Working Draft (WD)** — A formal PR proposing an amendment or addition in `/model` or `/docs`.
3. **Stage 2: Candidate Recommendation (CR)** — Approved by the Architecture Working Group; requires at least two independent reference implementations.
4. **Stage 3: Standard Specification (REC)** — Formally ratified standard release (e.g. v1.0.0).

---

## 🛠️ Contribution Categories

### 1. Specification Amendments
- Edits to `model/ODC-MODEL.md` or layer specifications (`layer-1.md` through `layer-4.md`) must adhere strictly to [RFC 2119] terminology (`MUST`, `SHOULD`, `MAY`).
- Must include rationale, threat model analysis, and potential breaking impacts.

### 2. Code & Reference Implementations
- Located in `/examples`.
- Zero unnecessary external dependencies where possible.
- Pure modern ECMAScript (ES6+) or TypeScript with strict type checking.

### 3. Documentation & Guides
- Real-world integration recipes, framework bindings (React, Vue, Svelte, React Native, Flutter, Go, Rust).
- Case studies from healthcare, civil emergency, IoT, or education.

---

## 📋 Pull Request Checklist

Before submitting a PR:
- [ ] Ensure all markdown files follow GitHub Flavored Markdown standards.
- [ ] Verify that no proprietary or non-open trademarks are used improperly.
- [ ] Check links and code blocks for accuracy.
- [ ] Confirm your agreement with the Apache 2.0 License.
