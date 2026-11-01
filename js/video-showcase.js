/**
 * ODCS & HEAVEN LANGUAGE - INTERACTIVE VIDEO SIMULATION & AUDIO ENGINE
 * "The Pain of Computing Without ODCS vs Deterministic Continuity"
 * Built with HTML5 Canvas, Web Audio API, and DOM Event Orchestration.
 */

document.addEventListener('DOMContentLoaded', () => {
  initVideoSimulation();
  initMediaGalleryLightbox();
});

/* ==========================================================================
   1. WEB AUDIO API SYNTHESIZER (NO EXTERNAL AUDIO FILES REQUIRED)
   ========================================================================== */

let audioCtx = null;
let soundEnabled = true;

function getAudioContext() {
  if (!audioCtx) {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (AudioContext) {
      audioCtx = new AudioContext();
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

function playGlitchAlarm() {
  if (!soundEnabled) return;
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(160, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(70, ctx.currentTime + 0.25);

    gain.gain.setValueAtTime(0.08, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.25);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.25);
  } catch (e) {}
}

function playTranquilChime() {
  if (!soundEnabled) return;
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    [523.25, 659.25, 783.99, 1046.50].forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + i * 0.08);

      gain.gain.setValueAtTime(0.05, now + i * 0.08);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + i * 0.08 + 0.5);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now + i * 0.08);
      osc.stop(now + i * 0.08 + 0.5);
    });
  } catch (e) {}
}

/* ==========================================================================
   2. VIDEO SIMULATION SCENARIO DATA
   ========================================================================== */

const VIDEO_SCENARIOS = [
  {
    id: 'subway',
    title: 'Scene 01: Subway Tunnel Blackout',
    context: 'Commuter filling out an urgent 24-field banking transaction as the high-speed train enters an underground tunnel.',
    durationSec: 10,
    badTitle: 'Traditional Web / Cloud: TOTAL DATA WIPED',
    badStatus: 'HTTP 504 Gateway Timeout',
    badLog: '[00:03] Train enters signal dead zone (0 bars)\n[00:04] Submitting POST /api/v1/transfer...\n[00:06] Network TCP connection reset by peer (ECONNRESET)\n[00:07] Browser triggers hard reload...\n[00:09] Form cleared. All 24 fields lost. User screams in frustration.',
    badLossMetric: '100% Intent Lost',
    goodTitle: 'ODCS Sovereign Continuity: ZERO INTENT LOST',
    goodStatus: 'Layer 1 Local WAL Committed (0.8ms)',
    goodLog: '[00:03] Physical network drops to 0 bars\n[00:04] User clicks "Transfer": L1 commits to IndexedDB WAL\n[00:05] Ambient pill morphs to (AUTONOMOUS). UI non-blocking\n[00:08] Train emerges from tunnel. RTT ping detected (42ms)\n[00:09] L2 CRDT delta outbox flushed. Transaction synchronized!',
    goodLossMetric: '0% Intent Lost (100% Preserved)'
  },
  {
    id: 'hospital',
    title: 'Scene 02: Emergency Room Ward Wi-Fi Reboot',
    context: 'ICU nurse recording critical telemetry vitals as hospital IT restarts the ward access point.',
    durationSec: 10,
    badTitle: 'Traditional Cloud EHR: BLOCKING MODAL ERROR',
    badStatus: 'WebSocket Severed • Session Terminated',
    badLog: '[00:02] Wi-Fi beacon lost during router firmware patch\n[00:04] Nurse enters heart rate: 72 bpm, O2: 98.5%\n[00:06] Blocking modal appears: "Fatal Error: Reconnecting..."\n[00:08] Inputs disabled. Nurse cannot document vitals.\n[00:09] Session expires. Doctor loses critical emergency window.',
    badLossMetric: 'Dangerous Clinical Interruption',
    goodTitle: 'ODCS Medical Mesh: 100% RELIABLE PATIENT CARE',
    goodStatus: 'Peer-to-Peer Bluetooth/Wi-Fi Direct Active',
    goodLog: '[00:02] Wi-Fi access point restarts\n[00:04] Vitals entered: instantly sealed in Durable Record\n[00:05] L3 adapts: discovers local bedside monitor via BLE\n[00:07] Vital telemetry propagates peer-to-peer to doctor tablet\n[00:09] Merkle hash verified. Zero clinical downtime.',
    goodLossMetric: '0ms Interruption • 100% Uptime'
  },
  {
    id: 'inflight',
    title: 'Scene 03: Transcontinental Flight Airgap',
    context: 'Executive collaborating on a critical legal agreement at 38,000 feet with intermittent satellite Wi-Fi.',
    durationSec: 10,
    badTitle: 'Traditional SaaS Editor: DISCONNECTED & LOCKED',
    badStatus: 'Read-Only Mode • Sync Conflict Loop',
    badLog: '[00:02] Satellite link loses tracking over oceanic dead zone\n[00:04] User makes redline changes to paragraph 14\n[00:06] Cloud editor locks viewport: "Working offline not supported"\n[00:08] Reconnect attempt causes split-brain overwrite\n[00:09] 3 hours of edits wiped by remote timestamp collision.',
    badLossMetric: 'Severe Version Collision & Loss',
    goodTitle: 'ODCS Multi-Master CRDT: FLAWLESS MERGING',
    goodStatus: 'Causal Vector Clocks Converged',
    goodLog: '[00:02] Aircraft enters satellite dead zone\n[00:04] Full typing, formatting, and redlining remain fluid\n[00:06] Vector Clock records causal DAG order locally\n[00:08] Satellite signal re-acquired over landmass\n[00:09] CRDT auto-merges coworker edits. Zero conflicts.',
    goodLossMetric: 'Zero Conflicts • 100% Harmonious'
  },
  {
    id: 'outage',
    title: 'Scene 04: Centralized Cloud Data Center Failure',
    context: 'Global AWS us-east-1 outage bringing down consumer apps, payment processors, and auth servers.',
    durationSec: 10,
    badTitle: 'Centralized Architecture: GLOBAL EXTINCTION',
    badStatus: 'DNS Fail • 503 Service Unavailable',
    badLog: '[00:02] Centralized auth API cluster suffers power loss\n[00:04] 200,000 global client apps crash simultaneously\n[00:06] Login forms frozen behind spinning wheels\n[00:08] In-flight payments dropped; customer funds stranded\n[00:09] Business operations completely halted for 6 hours.',
    badLossMetric: '$420,000 Loss per Hour of Outage',
    goodTitle: 'ODCS Sovereign Architecture: UNBROKEN SURVIVAL',
    goodStatus: 'Local Authority Intact • Decentralized Fallback',
    goodLog: '[00:02] Centralized cloud region drops offline\n[00:04] Client applications remain fully operable locally\n[00:06] Authentication validated via local cryptographic keys\n[00:08] Transactions queued in durable local outbox\n[00:09] Sovereign operations proceed at 100% capacity.',
    goodLossMetric: '$0 Lost • Autonomous Continuity'
  }
];

/* ==========================================================================
   3. VIDEO SIMULATION CONTROLLER
   ========================================================================== */

function initVideoSimulation() {
  const container = document.getElementById('pain-video-container');
  if (!container) return;

  const playBtn = document.getElementById('btn-video-play');
  const prevBtn = document.getElementById('btn-video-prev');
  const nextBtn = document.getElementById('btn-video-next');
  const speedBtn = document.getElementById('btn-video-speed');
  const soundBtn = document.getElementById('btn-video-sound');
  const restartBtn = document.getElementById('btn-video-restart');
  const progressFill = document.getElementById('video-progress-fill');
  const timeCurrent = document.getElementById('video-time-current');
  const timeTotal = document.getElementById('video-time-total');
  const scenarioPills = document.querySelectorAll('.scenario-select-pill');

  let currentScenarioIdx = 0;
  let isPlaying = true;
  let playbackRate = 1.0;
  let elapsedSeconds = 0;
  let timerInterval = null;

  function loadScenario(idx) {
    currentScenarioIdx = idx;
    elapsedSeconds = 0;
    const scen = VIDEO_SCENARIOS[currentScenarioIdx];

    // Update scenario header info
    const titleEl = document.getElementById('video-scenario-title');
    const descEl = document.getElementById('video-scenario-desc');
    if (titleEl) titleEl.textContent = scen.title;
    if (descEl) descEl.textContent = scen.context;

    // Update Left Bad Pane
    const badStatusEl = document.getElementById('video-bad-status');
    const badLogEl = document.getElementById('video-bad-log');
    const badLossEl = document.getElementById('video-bad-loss');
    if (badStatusEl) badStatusEl.textContent = scen.badStatus;
    if (badLogEl) badLogEl.textContent = scen.badLog;
    if (badLossEl) badLossEl.textContent = scen.badLossMetric;

    // Update Right Good Pane
    const goodStatusEl = document.getElementById('video-good-status');
    const goodLogEl = document.getElementById('video-good-log');
    const goodLossEl = document.getElementById('video-good-loss');
    if (goodStatusEl) goodStatusEl.textContent = scen.goodStatus;
    if (goodLogEl) goodLogEl.textContent = scen.goodLog;
    if (goodLossEl) goodLossEl.textContent = scen.goodLossMetric;

    // Update pills active class
    scenarioPills.forEach((p, i) => {
      if (i === currentScenarioIdx) {
        p.classList.add('active');
      } else {
        p.classList.remove('active');
      }
    });

    if (timeTotal) timeTotal.textContent = `00:${String(scen.durationSec).padStart(2, '0')}`;
    updateProgressBar();
    triggerScenarioSounds();
  }

  function triggerScenarioSounds() {
    playGlitchAlarm();
    setTimeout(() => {
      playTranquilChime();
    }, 1800);
  }

  function updateProgressBar() {
    const scen = VIDEO_SCENARIOS[currentScenarioIdx];
    const pct = Math.min(100, (elapsedSeconds / scen.durationSec) * 100);
    if (progressFill) progressFill.style.width = `${pct}%`;
    if (timeCurrent) timeCurrent.textContent = `00:${String(Math.floor(elapsedSeconds)).padStart(2, '0')}`;
  }

  function tick() {
    if (!isPlaying) return;
    const scen = VIDEO_SCENARIOS[currentScenarioIdx];
    elapsedSeconds += 0.25 * playbackRate;

    if (elapsedSeconds >= scen.durationSec) {
      // Advance to next scenario
      currentScenarioIdx = (currentScenarioIdx + 1) % VIDEO_SCENARIOS.length;
      loadScenario(currentScenarioIdx);
    } else {
      updateProgressBar();
    }
  }

  // Start ticker
  timerInterval = setInterval(tick, 250);

  // Play/Pause button
  if (playBtn) {
    playBtn.addEventListener('click', () => {
      isPlaying = !isPlaying;
      playBtn.innerHTML = isPlaying ? '<span>⏸️</span>' : '<span>▶️</span>';
      playBtn.title = isPlaying ? 'Pause Video' : 'Play Video';
    });
  }

  // Restart button
  if (restartBtn) {
    restartBtn.addEventListener('click', () => {
      elapsedSeconds = 0;
      updateProgressBar();
      triggerScenarioSounds();
    });
  }

  // Prev/Next buttons
  if (prevBtn) {
    prevBtn.addEventListener('click', () => {
      const nextIdx = (currentScenarioIdx - 1 + VIDEO_SCENARIOS.length) % VIDEO_SCENARIOS.length;
      loadScenario(nextIdx);
    });
  }

  if (nextBtn) {
    nextBtn.addEventListener('click', () => {
      const nextIdx = (currentScenarioIdx + 1) % VIDEO_SCENARIOS.length;
      loadScenario(nextIdx);
    });
  }

  // Speed button (1x -> 1.5x -> 2x)
  if (speedBtn) {
    speedBtn.addEventListener('click', () => {
      if (playbackRate === 1.0) playbackRate = 1.5;
      else if (playbackRate === 1.5) playbackRate = 2.0;
      else playbackRate = 1.0;
      speedBtn.textContent = `${playbackRate}x`;
    });
  }

  // Sound toggle button
  if (soundBtn) {
    soundBtn.addEventListener('click', () => {
      soundEnabled = !soundEnabled;
      soundBtn.textContent = soundEnabled ? '🔊' : '🔇';
      soundBtn.title = soundEnabled ? 'Mute Audio' : 'Enable Audio';
      if (soundEnabled) playTranquilChime();
    });
  }

  // Scenario pill click
  scenarioPills.forEach((pill, i) => {
    pill.addEventListener('click', () => {
      loadScenario(i);
    });
  });

  // Initial load
  loadScenario(0);
}

/* ==========================================================================
   4. MEDIA GALLERY & LIGHTBOX MODAL
   ========================================================================== */

function initMediaGalleryLightbox() {
  const modal = document.getElementById('media-lightbox-modal');
  const modalImg = document.getElementById('lightbox-modal-img');
  const modalCaption = document.getElementById('lightbox-modal-caption');
  const closeBtn = document.getElementById('btn-close-lightbox');

  if (!modal || !modalImg) return;

  document.querySelectorAll('.gallery-thumb-card').forEach(card => {
    card.addEventListener('click', () => {
      const imgSrc = card.getAttribute('data-full-img');
      const caption = card.getAttribute('data-caption') || '';
      if (imgSrc) {
        modalImg.src = imgSrc;
        if (modalCaption) modalCaption.textContent = caption;
        modal.classList.add('open');
      }
    });
  });

  function closeModal() {
    modal.classList.remove('open');
  }

  if (closeBtn) closeBtn.addEventListener('click', closeModal);
  modal.addEventListener('click', (e) => {
    if (e.target === modal) closeModal();
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal.classList.contains('open')) {
      closeModal();
    }
  });
}
