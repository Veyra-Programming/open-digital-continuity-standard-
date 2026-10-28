# ODCS Layer 3 Specification: Runtime & Environmental Adaptation
## Specification Document: ODCS-SPEC-004 | Version: 1.0.0-DRAFT
**Layer:** Layer 3 (Runtime & Context Adaptation)  
**Parent Document:** [ODC-MODEL.md](./ODC-MODEL.md)  
**Status:** Working Draft

---

## 1. Overview and Purpose

Layer 3 (L3) serves as the autonomic nervous system of an ODCS implementation. Its fundamental invariant is:

> **The Adaptive Execution Invariant:** *The system shall continuously observe its physical runtime environment and dynamically scale its execution policies, preventing hard failure states, battery exhaustion, network congestion, and unthrottled retry storms.*

Traditional software treats connectivity as a binary flag (`navigator.onLine === true | false`). In reality, network connectivity exists along a continuous spectrum of latency, packet loss, bandwidth throttling, captive portals, and transient dropouts. Layer 3 replaces simplistic boolean flags with **Multi-Tiered Environmental Probing** and **Deterministic Operational Policies**.

---

## 2. Operational Modes Hierarchy

Layer 3 continuously classifies the operational context into one of five standardized execution profiles:

```
┌─────────────────────────────────────────────────────────────┐
│                   ODCS OPERATIONAL PROFILES                 │
├─────────────────────────────────────────────────────────────┤
│  MODE 1: OPTIMAL_ONLINE                                     │
│  - RTT < 150ms, Packet Loss < 1%, Unmetered Bandwidth       │
│  - Real-time WebSockets / bidirectional streaming active    │
├─────────────────────────────────────────────────────────────┤
│  MODE 2: CONSTRAINED_BANDWIDTH (2G / Edge / Congested Cell) │
│  - RTT 150-1000ms, Limited Throughput                       │
│  - Compression enabled, large media sync suspended          │
├─────────────────────────────────────────────────────────────┤
│  MODE 3: HIGH_LATENCY (Satellite / LEO Starlink / Remote)   │
│  - RTT > 1000ms, bursty availability                        │
│  - Coarse batching, delta-only compression, long timeouts   │
├─────────────────────────────────────────────────────────────┤
│  MODE 4: TRANSIENT_OFFLINE (Intermittent drops / Tunnels)   │
│  - Zero packet transit, but network interface active        │
│  - Layer 1 WAL outbox buffering; exponential retry paused   │
├─────────────────────────────────────────────────────────────┤
│  MODE 5: AIRGAPPED_ISOLATED (Flight Mode / Disaster Zone)   │
│  - Explicitly offline; radio interfaces disabled            │
│  - All background polling terminated; pure local execution  │
└─────────────────────────────────────────────────────────────┘
```

---

## 3. Normative Requirements

### 3.1 Multi-Tiered Telemetry Probing
1. Implementations **MUST NOT** rely exclusively on OS-level events (such as `window.addEventListener('online')`), as these frequently return false positives behind captive portals, dead Wi-Fi routers, or firewalled gateways.
2. Layer 3 **MUST** perform active, non-blocking telemetry heartbeats (e.g. lightweight HTTP `HEAD` / `204 No Content` pings to an ODCS health probe) combined with passive telemetry (monitoring real application request success/latency).

### 3.2 Adaptive Exponential Backoff with Decorrelated Jitter
When synchronization attempts fail, Layer 3 **SHALL** compute retry delays according to the Full Jitter algorithm:
$$\text{Sleep} = \min(\text{MaxSleep}, \text{UniformRandom}(0, \text{BaseDelay} \times 2^{\text{Attempt}}))$$
This prevents retry thundering herds against reconnecting servers.

### 3.3 Hardware Awareness (Power & Memory Governance)
1. **Battery Level:** If the device battery level falls below 15% without charging, Layer 3 **MUST** suspend background prefetching and restrict Layer 2 sync to critical user mutations.
2. **Storage Quota:** When local disk consumption exceeds 80% of allowed quota, Layer 3 triggers Layer 1 cache trimming.

---

## 4. Standard Interface Definitions (TypeScript/ES6)

```typescript
export type OdcsOperationalMode = 
  | 'OPTIMAL_ONLINE'
  | 'CONSTRAINED_BANDWIDTH'
  | 'HIGH_LATENCY'
  | 'TRANSIENT_OFFLINE'
  | 'AIRGAPPED_ISOLATED';

export interface IEnvironmentalMetrics {
  mode: OdcsOperationalMode;
  rttMs: number;                   // Round trip time in milliseconds
  downlinkMbps: number;            // Estimated throughput
  effectiveType: 'slow-2g' | '2g' | '3g' | '4g' | '5g' | 'offline';
  isMetered: boolean;              // User on cellular data plan
  batteryLevel?: number;           // 0.0 to 1.0
  isCharging?: boolean;
}

export interface IOdcsPolicyEngine {
  // Current real-time telemetry
  getMetrics(): IEnvironmentalMetrics;
  
  // Query if an operation category is permitted under current conditions
  canExecute(actionType: 'SYNC_CRITICAL' | 'PREFETCH_ASSETS' | 'STREAM_MEDIA'): boolean;
  
  // Register listeners for mode transitions (e.g., Online -> Transient Offline)
  onModeChange(callback: (newMode: OdcsOperationalMode, oldMode: OdcsOperationalMode) => void): void;
  
  // Request an immediate probe verification
  probeReachability(): Promise<boolean>;
}
```

---

## 5. Failure Scenarios and Mitigations

| Failure Mode | Root Cause | Mandatory L3 Mitigation |
| :--- | :--- | :--- |
| **Captive Portal Trap** | Public Wi-Fi requires splash login; socket connected but traffic intercepted | Probe signature validation: verification payload must match expected cryptographic response hash. |
| **Flapping Connection** | Train moving through intermittent cellular dead zones | Debounce mode transitions (hysteresis threshold of 3000ms) to avoid continuous reconnect churn. |
| **Battery Drain from Endless Sync** | L2 sync retrying over high-packet-loss connection | L3 enforces max retry ceilings and transitions node to `TRANSIENT_OFFLINE` sleep state. |
