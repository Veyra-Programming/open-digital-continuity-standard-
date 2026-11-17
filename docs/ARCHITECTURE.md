# ODCS System Architecture & Technical Topology
## Architecture Reference Model | Version 2.0.0 GA (General Availability)
**Standard Authority:** ODCS Standards Foundation  
**Lead Architect:** Anirudha Puthraya  
**Organization:** [Veyra-Programming](https://github.com/Veyra-Programming)  
**Dual-Engine Implementation:** [Veyra-Programming/star-haven](https://github.com/Veyra-Programming/star-haven)  

---

## 1. Architectural Philosophy: The Sovereign Inversion

The **Open Digital Continuity Standard (ODCS-2.0.0)** fundamentally inverts the traditional client-server paradigm. In orthodox web and mobile applications:
- The centralized cloud server is the solitary synchronous authority.
- The client is a fragile ephemeral renderer that crashes or halts when disconnected.
- Networks are naively assumed to be permanently reliable and low-latency.

In an **ODCS-Compliant Sovereign Architecture**:
1. **Edge-First Local Authority:** Every client, mobile node, edge appliance, or embedded device is an autonomous, self-sufficient computing node.
2. **Sub-16ms Single-Frame Execution:** User mutations commit to local durable storage within a single 60Hz frame budget ($\Delta t \le 16.66\text{ms}$) with an instant cryptographic receipt.
3. **Decoupled Asynchronous Transport:** State changes are persisted to append-only Merkle Write-Ahead Logs (WAL) *before* any network dispatch is attempted.
4. **Autonomous CRDT Convergence:** Partitioned nodes synchronize state algebraically using semi-lattice operations without human merge-conflict interventions.

---

## 2. End-to-End System Topology (Dual-Engine Stack)

```
┌────────────────────────────────────────────────────────────────────────┐
│                        ODCS EDGE CLIENT NODE                           │
│                                                                        │
│  [ Layer 4: Star Declarative UI (v1.2.0 GA / app.wasm) ]               │
│        │  - Single-Frame 60 FPS Reactive Loop (< 16.6ms)               │
│        │  - Zero Virtual-DOM / Zero NPM Overhead                       │
│        │  - Minting Sub-16ms Zero Intent Loss (ZIL) Receipts           │
│        ▼                                                               │
│  [ Layer 3: Dynamic Runtime & Telemetry Sensing ]                      │
│        │  - Active/Passive RTT & Jitter Telemetry Probes               │
│        │  - 4 Operational Modes (Optimal, Constrained, Jitter, Severed)│
│        │  - Adaptive Jitter Backoff & Flow Regulation                  │
│        ▼                                                               │
│  [ Layer 1: Haven Continuity Ledger (v2.0 / Merkle WAL) ]              │
│        │  - Durable Immutable Records (durable record)                 │
│        │  - RFC 8785 Canonical JSON Serialization                      │
│        │  - SHA-256 Merkle DAG Chain Linkage                           │
│        ▼                                                               │
│  [ Layer 2: Mesh Consensus & CRDT Transport Engine ]                   │
│        │  - PN-Counter Replicas & Add-Wins OR-Sets                     │
│        │  - Vector Clock Ordering (V_merged = V_local ⊔ V_remote)      │
│        │  - Dual Wire: ODCS-REL (Ordered) + ODCS-DGM (0-RTT Datagram)  │
└────────┬───────────────────────────────────────────────────────────────┘
         │
         │ Multi-Transport Wire (HTTPS / WebSocket / WebRTC P2P / BLE Mesh)
         │
┌────────▼───────────────────────────────────────────────────────────────┐
│                    ODCS SOVEREIGN GATEWAY RELAY                        │
│                     (heaven/odcs_backend.hvn)                          │
│                                                                        │
│  - Merkle DAG Ingestion & Cryptographic Proof Verification             │
│  - Distributed Vector Clock Reconciliation Arbiter                     │
│  - Multi-Tenant Conflict-Free State Convergence (CRDT Mesh Server)     │
│  - Sub-16ms ZIL Receipt Hardware Validation                            │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 3. Data Flow Lifecycle: A Step-by-Step Walkthrough

Trace what occurs when a user triggers an action (e.g. submitting a medical triage assessment or executing a critical ledger transfer) during a total communications blackout:

```
[User Action in Star UI]
     │
     ▼
1. Layer 4 applies optimistic state transformation in Star UI (<16.6ms).
     │
     ▼
2. Layer 4 generates cryptographic Zero Intent Loss (ZIL) receipt:
   - Canonicalizes mutation via RFC 8785.
   - Seals SHA-256 hash with monotonic UUIDv7 timestamp.
   - Emits: zil_receipt_uuid7_verified to local UI buffer.
     │
     ▼
3. Layer 3 evaluates current network telemetry:
   - Sensing: RTT = ∞, Jitter = 0ms (Mode: SEVERED_OFFLINE).
   - Policy: Disables upstream socket dispatches; commands Layer 1 local spooling.
     │
     ▼
4. Layer 1 executes atomic transaction in Haven Continuity Ledger:
   - Constructs immutable `EmergencyEncounter` durable record.
   - Appends operation block to local Merkle Write-Ahead Log (WAL).
   - Links previous block SHA-256 hash: Hash_n = SHA-256(Block_n || Hash_{n-1}).
   - Local state snapshot is 100% durable on NVMe/IndexedDB.
     │
     ▼
5. Layer 4 updates ambient status indicator:
   - Ambient Pill: `Buffered Offline (ZIL Protected)`.
     │
     ▼
... Complete physical network blackout lasts for 2 hours ...
     │
     ▼
6. Network carrier link recovers:
   - Layer 3 probe detects `OPTIMAL_ONLINE` (RTT: 38ms).
   - Layer 3 dispatches transition signal to Layer 2 sync engine.
     │
     ▼
7. Layer 2 Sync Engine awakens:
   - Pulls pending outbox batch from Layer 1 WAL.
   - Emits batch over ODCS-REL with local Vector Clock `V_local`.
   - Upstream Haven gateway validates Merkle root, performs CRDT join.
   - Gateway returns ACK + remote peer mutations with `V_remote`.
     │
     ▼
8. Layer 1 updates local WAL block status to `SYNCHRONIZED`.
9. Layer 2 merges inbound CRDT states algebraically with zero conflicts.
10. Layer 4 ambient indicator pulses: `ONLINE (0.04ms) · 100% Synced`.
```

---

## 4. Dual-Engine Role Matrix

| Component | Responsibility in Topology |
| :--- | :--- |
| **⭐ Star Language (v1.2.0 GA)** | Direct human interface, single-frame 60 FPS rendering, WASM runtime, optimistic state mutation, hardware event handling. |
| **🕊️ Haven Language (v2.0)** | Natural-English backend logic, immutable records, Merkle DAG ledger verification, vector clock arithmetic, CRDT mesh synchronization. |

---

## 5. Creator & Standards Leadership

The **Open Digital Continuity Standard (ODCS)** is architected and maintained by:

**Anirudha Puthraya**  
*Standards Director & Author · ODCS Standards Foundation*  
*Organization:* [Veyra-Programming](https://github.com/Veyra-Programming)  
*Dual-Engine Repository:* [github.com/Veyra-Programming/star-haven](https://github.com/Veyra-Programming/star-haven)  
*Official Portal:* [https://odcs.in/](https://odcs.in/)
