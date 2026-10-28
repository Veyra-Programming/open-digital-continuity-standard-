/**
 * ODCS Interactive Continuity Simulator Lab
 * Embedded sandbox on odcs.in featuring a real-time Signal Waveform Oscilloscope,
 * Outbox WAL Queue, and Automated Tunnel/Satellite Scenario Replays.
 */

class OdcsHomepageSimulator {
  constructor() {
    this.networkMode = 'ONLINE'; // 'ONLINE' | 'CONSTRAINED' | 'OFFLINE'
    this.outboxQueue = [];
    this.persistedRecords = [];
    this.isSyncing = false;
    this.eventLog = [];
    this.wavePhase = 0;

    this.initDOMElements();
    this.initOscilloscope();
    this.bindEvents();
    this.logEvent('SYS', 'ODCS Engine Active. Storage Anchor: IndexedDB WAL (UUIDv7)', 'commit');
  }

  initDOMElements() {
    this.btnOnline = document.getElementById('sim-net-online');
    this.btnThrottled = document.getElementById('sim-net-throttled');
    this.btnOffline = document.getElementById('sim-net-offline');
    this.outboxBadge = document.getElementById('sim-outbox-count');
    this.statusPill = document.getElementById('sim-status-pill');
    this.statusLabel = document.getElementById('sim-status-label');
    this.eventStream = document.getElementById('sim-event-stream');
    this.form = document.getElementById('sim-mutation-form');
    this.input = document.getElementById('sim-mutation-input');
    this.rttDisplay = document.getElementById('sim-rtt-display');
    this.throughputDisplay = document.getElementById('sim-throughput-display');
    this.packetLossDisplay = document.getElementById('sim-loss-display');

    // Scenario buttons
    this.btnScenarioTunnel = document.getElementById('btn-scenario-tunnel');
    this.btnScenarioSatellite = document.getElementById('btn-scenario-satellite');
  }

  // --- Real-Time Signal Waveform Oscilloscope ---
  initOscilloscope() {
    const canvas = document.getElementById('oscilloscope-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    const renderWave = () => {
      const width = canvas.width = canvas.parentElement.offsetWidth;
      const height = canvas.height = canvas.parentElement.offsetHeight;
      const midY = height / 2;

      ctx.clearRect(0, 0, width, height);

      // Grid line center
      ctx.beginPath();
      ctx.moveTo(0, midY);
      ctx.lineTo(width, midY);
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
      ctx.lineWidth = 1;
      ctx.stroke();

      ctx.beginPath();
      ctx.lineWidth = 2.2;

      if (this.networkMode === 'ONLINE') {
        // Smooth, fast, radiant cyan wave
        ctx.strokeStyle = '#00ffaa';
        ctx.shadowColor = '#00ffaa';
        ctx.shadowBlur = 10;
        this.wavePhase += 0.08;

        for (let x = 0; x < width; x++) {
          const y = midY + Math.sin(x * 0.035 + this.wavePhase) * 16 * Math.sin(x * 0.005);
          if (x === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
      } else if (this.networkMode === 'CONSTRAINED') {
        // Bursty, jittery amber wave
        ctx.strokeStyle = '#fbbf24';
        ctx.shadowColor = '#fbbf24';
        ctx.shadowBlur = 8;
        this.wavePhase += 0.04;

        for (let x = 0; x < width; x++) {
          const noise = (Math.random() - 0.5) * 5;
          const y = midY + (Math.sin(x * 0.02 + this.wavePhase) * 12) + noise;
          if (x === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
      } else {
        // Flatline Red Disconnected Line
        ctx.strokeStyle = '#f43f5e';
        ctx.shadowColor = '#f43f5e';
        ctx.shadowBlur = 12;
        this.wavePhase += 0.02;

        for (let x = 0; x < width; x++) {
          // Occasional heartbeat flatline blip
          let y = midY;
          if (Math.sin(this.wavePhase) > 0.95 && x > width * 0.45 && x < width * 0.55) {
            y = midY - Math.sin((x - width * 0.45) * 0.08) * 15;
          }
          if (x === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
      }

      ctx.stroke();
      ctx.shadowBlur = 0;
      requestAnimationFrame(renderWave);
    };

    renderWave();
  }

  bindEvents() {
    if (!this.form) return;

    this.btnOnline.addEventListener('click', () => this.setMode('ONLINE'));
    this.btnThrottled.addEventListener('click', () => this.setMode('CONSTRAINED'));
    this.btnOffline.addEventListener('click', () => this.setMode('OFFLINE'));

    this.form.addEventListener('submit', (e) => {
      e.preventDefault();
      const val = this.input.value.trim();
      if (!val) return;
      this.input.value = '';
      this.commitMutation(val);
    });

    if (this.btnScenarioTunnel) {
      this.btnScenarioTunnel.addEventListener('click', () => this.runTunnelScenario());
    }
    if (this.btnScenarioSatellite) {
      this.btnScenarioSatellite.addEventListener('click', () => this.runSatelliteScenario());
    }
  }

  setMode(mode) {
    this.networkMode = mode;
    this.btnOnline.className = `network-toggle-btn ${mode === 'ONLINE' ? 'active-online' : ''}`;
    this.btnThrottled.className = `network-toggle-btn ${mode === 'CONSTRAINED' ? 'active-throttled' : ''}`;
    this.btnOffline.className = `network-toggle-btn ${mode === 'OFFLINE' ? 'active-offline' : ''}`;

    if (mode === 'ONLINE') {
      if (this.rttDisplay) this.rttDisplay.textContent = '42ms RTT';
      if (this.throughputDisplay) this.throughputDisplay.textContent = '100 Mbps';
      if (this.packetLossDisplay) this.packetLossDisplay.textContent = '0.0%';
      this.logEvent('L3-ADAPT', 'Optimal network verified. Latency: 42ms. Multi-master streaming active.', 'sync');
      this.triggerSync();
    } else if (mode === 'CONSTRAINED') {
      if (this.rttDisplay) this.rttDisplay.textContent = '840ms RTT';
      if (this.throughputDisplay) this.throughputDisplay.textContent = '180 Kbps';
      if (this.packetLossDisplay) this.packetLossDisplay.textContent = '12.4%';
      this.logEvent('L3-ADAPT', 'Constrained bandwidth profile applied. Large payloads throttled.', 'alert');
      this.triggerSync();
    } else {
      if (this.rttDisplay) this.rttDisplay.textContent = '∞ RTT (Offline)';
      if (this.throughputDisplay) this.throughputDisplay.textContent = '0 Kbps';
      if (this.packetLossDisplay) this.packetLossDisplay.textContent = '100%';
      this.logEvent('L3-ADAPT', 'Network interface offline. Invariant holds: local transactions buffered.', 'alert');
    }
    this.updateUI();
  }

  commitMutation(text) {
    const mutationId = '018f2d-' + Math.random().toString(36).substring(2, 7);
    const timestamp = new Date().toLocaleTimeString();

    // Layer 4: Instant Optimistic UX (<16ms)
    this.logEvent('L4-UX', `Optimistic render applied for: "${text}"`, 'commit');

    // Layer 1: Durable Outbox WAL Logging
    const record = { id: mutationId, text, timestamp, status: 'QUEUED_OUTBOX' };
    this.outboxQueue.push(record);
    this.persistedRecords.push(record);
    this.logEvent('L1-DURABILITY', `Atomic WAL commit -> Non-volatile disk [UUIDv7: ${mutationId}]`, 'commit');

    this.updateUI();

    // Trigger Layer 2 sync if network permits
    if (this.networkMode !== 'OFFLINE') {
      this.triggerSync();
    }
  }

  async triggerSync() {
    if (this.isSyncing || this.networkMode === 'OFFLINE' || this.outboxQueue.length === 0) {
      this.updateUI();
      return;
    }

    this.isSyncing = true;
    const batchCount = this.outboxQueue.length;
    this.logEvent('L2-SYNC', `Packaging delta batch (${batchCount} operations with Vector Clock)...`, 'sync');
    this.updateUI();

    const latency = this.networkMode === 'CONSTRAINED' ? 1800 : 650;

    setTimeout(() => {
      if (this.networkMode === 'OFFLINE') {
        this.isSyncing = false;
        this.logEvent('L2-SYNC', 'Transport socket severed mid-batch. Mutations safely retained in L1 WAL outbox.', 'alert');
        this.updateUI();
        return;
      }

      this.logEvent('L2-SYNC', `Server verified CRDT convergence ACK for ${batchCount} records.`, 'sync');
      this.outboxQueue = [];
      this.isSyncing = false;
      this.logEvent('L4-UX', 'All local mutations confirmed synchronized across peers.', 'sync');
      this.updateUI();
    }, latency);
  }

  // --- Automated Subway Tunnel Scenario ---
  runTunnelScenario() {
    this.logEvent('SCENARIO', 'Initiating Subway Tunnel Simulation...', 'alert');
    this.setMode('OFFLINE');

    setTimeout(() => {
      this.commitMutation('Patient Vitals Recorded: BP 120/80');
    }, 600);

    setTimeout(() => {
      this.commitMutation('Emergency Triage Priority set: HIGH');
    }, 1400);

    setTimeout(() => {
      this.commitMutation('Prescription Dispatched: 50mg Cefixime');
    }, 2200);

    setTimeout(() => {
      this.logEvent('SCENARIO', 'Train exited tunnel. Cellular signal recovered!', 'sync');
      this.setMode('ONLINE');
    }, 3800);
  }

  // --- Automated Satellite Burst Scenario ---
  runSatelliteScenario() {
    this.logEvent('SCENARIO', 'Switching to LEO Satellite Profile (High RTT / Bursty)...', 'alert');
    this.setMode('CONSTRAINED');

    setTimeout(() => {
      this.commitMutation('Offshore telemetry: Rotor Temperature 48°C');
    }, 400);

    setTimeout(() => {
      this.commitMutation('Vessel Log #941: Coordinates 14°N 72°E');
    }, 1200);
  }

  updateUI() {
    const count = this.outboxQueue.length;
    if (this.outboxBadge) this.outboxBadge.textContent = count;

    if (this.isSyncing) {
      this.statusPill.className = 'continuity-pill syncing';
      this.statusLabel.textContent = `Syncing ${count} change${count === 1 ? '' : 's'}...`;
    } else if (count > 0) {
      this.statusPill.className = 'continuity-pill offline';
      this.statusLabel.textContent = `Saved Locally (${count} queued)`;
    } else if (this.networkMode === 'OFFLINE') {
      this.statusPill.className = 'continuity-pill offline';
      this.statusLabel.textContent = 'Offline (0 queued)';
    } else {
      this.statusPill.className = 'continuity-pill synced';
      this.statusLabel.textContent = 'All Changes Synced';
    }
  }

  logEvent(tag, message, type = 'commit') {
    const time = new Date().toLocaleTimeString();
    const item = document.createElement('div');
    item.className = `sim-event-item ${type}`;
    item.innerHTML = `
      <span><strong>[${tag}]</strong> ${this.escape(message)}</span>
      <span style="opacity: 0.6; font-size: 0.72rem;">${time}</span>
    `;
    if (this.eventStream) this.eventStream.prepend(item);
  }

  escape(str) {
    return str.replace(/[&<>'"]/g, tag => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      "'": '&#39;',
      '"': '&quot;'
    }[tag] || tag));
  }
}

document.addEventListener('DOMContentLoaded', () => {
  new OdcsHomepageSimulator();
});
