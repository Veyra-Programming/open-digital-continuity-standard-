/**
 * ODCS (Open Digital Continuity Standard) — Premium Interactive Engine
 * Handles Hero Constellation Canvas, 4-Layer Explorer, Conformance Calculator, and Navigation.
 */

// 4-Layer ODC Model Data Store for Interactive Explorer
const ODC_LAYERS_DATA = {
  'layer-4': {
    id: 'LAYER 4',
    title: 'Application & Continuity UX',
    specHref: './docs.html#layer-4',
    invariant: 'The Zero Intent Loss UX Invariant: A user\'s expressed intention shall never be rejected, wiped, or blocked by the UI due to network latency or disconnection.',
    responsibility: 'Human trust, zero-loss input, optimistic state presentation, non-blocking sync affordances, and human-in-the-loop conflict resolution.',
    primitives: 'Optimistic DOM Mutations, Form Intent Auto-Save, Ambient Status Pills, Field-Level Visual Diffing.',
    code: `// Layer 4: Non-blocking optimistic mutation
async function submitPatientRecord(vitals) {
  // 1. Immediately render optimistic state in DOM (<16ms)
  ui.renderOptimisticRecord({ id: vitals.id, status: 'BUFFERED_LOCAL' });

  // 2. Commit transaction to Layer 1 local durability
  await odcs.commitMutation('patients', 'UPDATE', vitals);

  // 3. Ambient continuity badge automatically reflects outbox queue
  ui.updateContinuityBadge();
}`
  },
  'layer-3': {
    id: 'LAYER 3',
    title: 'Runtime & Environmental Adaptation',
    specHref: './docs.html#layer-3',
    invariant: 'The Adaptive Execution Invariant: The system shall continuously observe its physical environment and dynamically scale its execution policies, avoiding hard failures and retry storms.',
    responsibility: 'Multi-tiered active/passive network probing, dynamic operational profiles (Optimal, Constrained, High-Latency, Offline), power & storage governance.',
    primitives: 'Round-Trip Time (RTT) Probing, Exponential Backoff with Jitter, Battery Throttling, Captive Portal Detection.',
    code: `// Layer 3: Dynamic environment policy enforcement
odcs.onEnvironmentChange((metrics) => {
  if (metrics.mode === 'CONSTRAINED_BANDWIDTH') {
    // Suspend heavy media sync; compress delta mutations
    syncEngine.setBatchLimit(5);
    mediaPipeline.pausePrefetch();
  } else if (metrics.mode === 'OPTIMAL_ONLINE') {
    // Open full bidirectional WebSocket streaming
    syncEngine.flushAllOutbox();
  }
});`
  },
  'layer-2': {
    id: 'LAYER 2',
    title: 'Transport, Synchronization & Consensus',
    specHref: './docs.html#layer-2',
    invariant: 'The Eventual Convergence Invariant: Disconnected nodes processing local mutations independently shall automatically reach identical distributed states upon reconnection.',
    responsibility: 'Multi-master delta replication, Conflict-Free Replicated Data Types (CRDTs), Vector Clocks, store-and-forward outbox pipelines.',
    primitives: 'State-based & Op-based CRDTs, LWW-Registers with HLC, AW-ORSet Collections, Merkle DAG Sync.',
    code: `// Layer 2: Vector Clock causality & CRDT Delta Merge
export function mergeRemoteDelta(localState, remoteDelta) {
  // Evaluate causality via Vector Clocks
  if (remoteDelta.clock.isConcurrentWith(localState.clock)) {
    // Deterministic CRDT resolution: Add-Wins ORSet
    return CRDT.mergeAddWins(localState, remoteDelta);
  }
  return CRDT.applyDirectDelta(localState, remoteDelta);
}`
  },
  'layer-1': {
    id: 'LAYER 1',
    title: 'Local Durability & Cryptographic Storage',
    specHref: './docs.html#layer-1',
    invariant: 'The Durability Invariant: No user action, state transition, or mutation acknowledged to upper layers shall ever be lost due to application crashes, battery loss, or power cutoff.',
    responsibility: 'Immutable local authority of record, Write-Ahead Logging (WAL) outbox, ACID snapshot storage, cryptographic tamper-evident hash chaining.',
    primitives: 'Monotonic UUIDv7 Sequence Keys, IndexedDB / SQLite Storage, Merkle Hash Provenance, Quota Protection.',
    code: `// Layer 1: Atomic Write-Ahead Log (WAL) outbox commit
async function recordMutation(mutation) {
  const tx = db.transaction(['outbox_wal', 'entities'], 'readwrite');
  
  // 1. Append to monotonic outbox journal
  tx.store('outbox_wal').add({
    ...mutation,
    id: crypto.randomUUID(), // UUIDv7 monotonic
    status: 'QUEUED_OUTBOX',
    previousHash: await getLastHash()
  });

  // 2. Commit transaction before UI confirmation
  await tx.done;
}`
  }
};

document.addEventListener('DOMContentLoaded', () => {
  initServiceWorker();
  initHeroParticleCanvas();
  initContinuityPill();
  initMasterOfflineSwitch();
  initTypewriterMantra();
  initLayerModelExplorer();
  initConformanceCalculator();
  initMobileMenu();
  initCitationCopy();
  initCardMouseGlow();
});

// 1. Service Worker Registration Guard
function initServiceWorker() {
  if ('serviceWorker' in navigator && window.location.protocol.startsWith('http')) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('./sw.js')
        .then((reg) => console.log('[ODCS] Service Worker active:', reg.scope))
        .catch((err) => console.warn('[ODCS] Service Worker skipped:', err));
    });
  }
}

// 2. Interactive Hero Constellation / Mesh Network Canvas
function initHeroParticleCanvas() {
  const canvas = document.getElementById('hero-particle-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let width, height;
  let particles = [];
  const particleCount = 42;
  const maxDistance = 135;
  const mouse = { x: null, y: null, maxDist: 180 };

  function resize() {
    width = canvas.width = canvas.parentElement.offsetWidth;
    height = canvas.height = canvas.parentElement.offsetHeight;
  }
  resize();
  window.addEventListener('resize', resize);

  window.addEventListener('mousemove', (e) => {
    const rect = canvas.getBoundingClientRect();
    mouse.x = e.clientX - rect.left;
    mouse.y = e.clientY - rect.top;
  });

  window.addEventListener('mouseleave', () => {
    mouse.x = null;
    mouse.y = null;
  });

  class Particle {
    constructor() {
      this.x = Math.random() * width;
      this.y = Math.random() * height;
      this.vx = (Math.random() - 0.5) * 0.7;
      this.vy = (Math.random() - 0.5) * 0.7;
      this.radius = Math.random() * 2 + 1.5;
      this.color = Math.random() > 0.4 ? '#00f0ff' : '#0077fe';
    }

    update() {
      this.x += this.vx;
      this.y += this.vy;

      if (this.x < 0 || this.x > width) this.vx *= -1;
      if (this.y < 0 || this.y > height) this.vy *= -1;
    }

    draw() {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
      ctx.fillStyle = this.color;
      ctx.shadowBlur = 8;
      ctx.shadowColor = this.color;
      ctx.fill();
      ctx.shadowBlur = 0;
    }
  }

  for (let i = 0; i < particleCount; i++) {
    particles.push(new Particle());
  }

  function animate() {
    ctx.clearRect(0, 0, width, height);

    // Draw lines between proximate peer nodes
    for (let i = 0; i < particles.length; i++) {
      particles[i].update();
      particles[i].draw();

      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < maxDistance) {
          const alpha = 1 - dist / maxDistance;
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.strokeStyle = `rgba(0, 240, 255, ${alpha * 0.22})`;
          ctx.lineWidth = 1;
          ctx.stroke();
        }
      }

      // Connect to mouse pointer
      if (mouse.x !== null && mouse.y !== null) {
        const mdx = particles[i].x - mouse.x;
        const mdy = particles[i].y - mouse.y;
        const mdist = Math.sqrt(mdx * mdx + mdy * mdy);
        if (mdist < mouse.maxDist) {
          const mAlpha = 1 - mdist / mouse.maxDist;
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(mouse.x, mouse.y);
          ctx.strokeStyle = `rgba(0, 255, 170, ${mAlpha * 0.35})`;
          ctx.lineWidth = 1.2;
          ctx.stroke();
        }
      }
    }

    requestAnimationFrame(animate);
  }

  animate();
}

// 3. Ambient Continuity Status Pill & Header Telemetry HUD Popover
function initContinuityPill() {
  const pill = document.getElementById('navbar-continuity-pill');
  const label = document.getElementById('navbar-pill-label');
  const popover = document.getElementById('header-node-popover');
  const toggleBtn = document.getElementById('popover-toggle-offline-btn');
  if (!pill) return;

  function setOnlineState(isOnline) {
    if (isOnline) {
      pill.className = 'continuity-pill synced';
      if (label) label.textContent = '(ONLINE)';
      const profile = document.getElementById('popover-net-profile');
      if (profile) {
        profile.textContent = 'Optimal (Fiber 42ms)';
        profile.className = 'popover-stat-val state-optimal';
      }
      if (toggleBtn) toggleBtn.textContent = '⚡ Test Offline Mode';
    } else {
      pill.className = 'continuity-pill offline';
      if (label) label.textContent = '(OFFLINE)';
      const profile = document.getElementById('popover-net-profile');
      if (profile) {
        profile.textContent = 'Partitioned (Autonomous)';
        profile.className = 'popover-stat-val state-offline';
      }
      if (toggleBtn) toggleBtn.textContent = '⚡ Reconnect Online Mesh';
    }
  }

  window.addEventListener('online', () => setOnlineState(true));
  window.addEventListener('offline', () => setOnlineState(false));

  // Toggle HUD Popover on Pill Click
  pill.addEventListener('click', (e) => {
    // If click was inside the toggle button, don't close immediately
    if (e.target.closest('#popover-toggle-offline-btn')) return;

    if (popover) {
      const isOpen = popover.classList.contains('active');
      popover.classList.toggle('active', !isOpen);
      pill.setAttribute('aria-expanded', !isOpen);
    }
  });

  // Keyboard accessibility
  pill.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      pill.click();
    } else if (e.key === 'Escape' && popover && popover.classList.contains('active')) {
      popover.classList.remove('active');
      pill.setAttribute('aria-expanded', 'false');
    }
  });

  // Close popover when clicking outside
  document.addEventListener('click', (e) => {
    if (popover && popover.classList.contains('active')) {
      if (!pill.contains(e.target)) {
        popover.classList.remove('active');
        pill.setAttribute('aria-expanded', 'false');
      }
    }
  });

  // Action button inside header popover
  if (toggleBtn) {
    toggleBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      const heroSwitch = document.getElementById('master-offline-switch');
      if (heroSwitch) {
        heroSwitch.click();
      } else {
        // Toggle state locally if hero switch isn't on current page
        const isCurrentlySynced = pill.classList.contains('synced');
        setOnlineState(!isCurrentlySynced);
      }
    });
  }
}

// 4. Interactive 4-Layer ODC Model Explorer
function initLayerModelExplorer() {
  const tabCards = document.querySelectorAll('.layer-card-tab');
  const detailBox = document.getElementById('layer-detail-box');
  if (!tabCards.length || !detailBox) return;

  tabCards.forEach(tab => {
    tab.addEventListener('click', () => {
      const layerKey = tab.getAttribute('data-layer');
      const data = ODC_LAYERS_DATA[layerKey];
      if (!data) return;

      tabCards.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');

      detailBox.querySelector('.detail-layer-id').textContent = data.id;
      detailBox.querySelector('.detail-title').textContent = data.title;
      detailBox.querySelector('.detail-invariant-quote').textContent = `"${data.invariant}"`;
      detailBox.querySelector('#detail-responsibility').textContent = data.responsibility;
      detailBox.querySelector('#detail-primitives').textContent = data.primitives;
      detailBox.querySelector('.detail-code-block').textContent = data.code;
      
      const specLink = detailBox.querySelector('.detail-spec-link');
      if (specLink) specLink.setAttribute('href', data.specHref);
    });
  });
}

// 5. Interactive Conformance Tier Calculator
function initConformanceCalculator() {
  const checkboxes = document.querySelectorAll('.conformance-check');
  const tierBadge = document.getElementById('calc-tier-badge');
  const tierName = document.getElementById('calc-tier-name');
  const tierDesc = document.getElementById('calc-tier-desc');
  if (!checkboxes.length || !tierBadge) return;

  function evaluateTier() {
    let checkedCount = 0;
    checkboxes.forEach(cb => { if (cb.checked) checkedCount++; });

    if (checkedCount >= 5) {
      tierBadge.textContent = 'Class E';
      tierBadge.style.color = 'var(--emerald-resilience)';
      tierName.textContent = 'Enterprise / Mission-Critical Conformance';
      tierDesc.textContent = 'Satisfies full 4-layer standard with CRDT convergence, Merkle DAG provenance, multi-transport failover, and zero intent loss.';
    } else if (checkedCount >= 3) {
      tierBadge.textContent = 'Class S';
      tierBadge.style.color = 'var(--cyan-primary)';
      tierName.textContent = 'Standard Conformance';
      tierDesc.textContent = 'Satisfies core durability, basic delta synchronization, and environmental network detection. Recommended for production apps.';
    } else {
      tierBadge.textContent = 'Class C';
      tierBadge.style.color = 'var(--amber-advisory)';
      tierName.textContent = 'Core Conformance';
      tierDesc.textContent = 'Satisfies foundational Layer 1 local persistence and Layer 4 optimistic user feedback. Suitable for basic offline form tools.';
    }
  }

  checkboxes.forEach(cb => cb.addEventListener('change', evaluateTier));
  evaluateTier();
}

// 6. Mobile Menu Navigation
function initMobileMenu() {
  const menuBtn = document.getElementById('mobile-menu-toggle');
  const navLinks = document.getElementById('site-nav-links');
  if (!menuBtn || !navLinks) return;

  menuBtn.addEventListener('click', () => navLinks.classList.toggle('mobile-open'));
  navLinks.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => navLinks.classList.remove('mobile-open'));
  });
}

// 7. BibTeX Citation Copy Helper
function initCitationCopy() {
  const copyBtn = document.getElementById('btn-copy-bibtex');
  const codeEl = document.getElementById('bibtex-code');
  if (!copyBtn || !codeEl) return;

  copyBtn.addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(codeEl.textContent);
      const originalText = copyBtn.textContent;
      copyBtn.textContent = '✓ Copied to Clipboard!';
      copyBtn.style.borderColor = 'var(--emerald-resilience)';
      copyBtn.style.color = 'var(--emerald-resilience)';
      setTimeout(() => {
        copyBtn.textContent = originalText;
        copyBtn.style.borderColor = '';
        copyBtn.style.color = '';
      }, 2500);
    } catch {
      alert('Citation copied!');
    }
  });
}

// 8. Card Mouse-Tracking Spotlight Glow
function initCardMouseGlow() {
  const cards = document.querySelectorAll(
    '.spec-card, .usecase-card, .pillar-item, .fullform-card, .layer-card-tab, ' +
    '.layer-detail-box, .sim-panel, .globe-showcase-card, .hero-stat-item, .conformance-box'
  );
  cards.forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      card.style.setProperty('--mouse-x', `${x}px`);
      card.style.setProperty('--mouse-y', `${y}px`);
    });
  });
}

// 9. Master Offline Simulation Mode Switch
function initMasterOfflineSwitch() {
  const switchBox = document.getElementById('master-offline-switch');
  const banner = document.getElementById('autonomous-offline-banner');
  const navPill = document.getElementById('navbar-continuity-pill');
  const navLabel = document.getElementById('navbar-pill-label');
  const popoverProfile = document.getElementById('popover-net-profile');
  const popoverBtn = document.getElementById('popover-toggle-offline-btn');
  if (!switchBox || !banner) return;

  let isOfflineMode = false;

  switchBox.addEventListener('click', () => {
    isOfflineMode = !isOfflineMode;

    if (isOfflineMode) {
      switchBox.classList.add('active-offline');
      banner.classList.add('active');
      if (navPill) {
        navPill.className = 'continuity-pill offline';
        if (navLabel) navLabel.textContent = '(OFFLINE)';
      }
      if (popoverProfile) {
        popoverProfile.textContent = 'Partitioned (Autonomous)';
        popoverProfile.className = 'popover-stat-val state-offline';
      }
      if (popoverBtn) popoverBtn.textContent = '⚡ Reconnect Online Mesh';

      // Also notify live simulator if active on page
      const offlineBtn = document.getElementById('sim-net-offline');
      if (offlineBtn) offlineBtn.click();
    } else {
      switchBox.classList.remove('active-offline');
      banner.classList.remove('active');
      if (navPill) {
        navPill.className = 'continuity-pill synced';
        if (navLabel) navLabel.textContent = '(ONLINE)';
      }
      if (popoverProfile) {
        popoverProfile.textContent = 'Optimal (Fiber 42ms)';
        popoverProfile.className = 'popover-stat-val state-optimal';
      }
      if (popoverBtn) popoverBtn.textContent = '⚡ Test Offline Mode';

      const onlineBtn = document.getElementById('sim-net-online');
      if (onlineBtn) onlineBtn.click();
    }
  });
}

// 10. Dynamic Kinetic Typewriter & Mantra Cycler
function initTypewriterMantra() {
  const textEl = document.getElementById('hero-cycler-text');
  if (!textEl) return;

  const mantras = [
    'Digital experiences that endure without the network.',
    'Offline-First architecture by sovereign default.',
    'Local Write-Ahead Durability with zero intent loss.',
    'Multi-master distributed convergence via verified CRDTs.',
    'Autonomous resilience across partitions, outages & airgaps.'
  ];

  let currentIdx = 0;
  let charIdx = 0;
  let isDeleting = false;
  let typingSpeed = 55;

  function type() {
    const fullText = mantras[currentIdx];

    if (isDeleting) {
      textEl.textContent = fullText.substring(0, charIdx - 1);
      charIdx--;
      typingSpeed = 25;
    } else {
      textEl.textContent = fullText.substring(0, charIdx + 1);
      charIdx++;
      typingSpeed = 55;
    }

    if (!isDeleting && charIdx === fullText.length) {
      // Pause at end
      typingSpeed = 2600;
      isDeleting = true;
    } else if (isDeleting && charIdx === 0) {
      isDeleting = false;
      currentIdx = (currentIdx + 1) % mantras.length;
      typingSpeed = 400;
    }

    setTimeout(type, typingSpeed);
  }

  type();
}

