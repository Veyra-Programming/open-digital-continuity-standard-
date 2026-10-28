# ODCS Layer 2 Specification: Transport, Synchronization & Consensus
## Specification Document: ODCS-SPEC-003 | Version: 1.0.0-DRAFT
**Layer:** Layer 2 (Distributed Synchronization & Consensus)  
**Parent Document:** [ODC-MODEL.md](./ODC-MODEL.md)  
**Status:** Working Draft

---

## 1. Overview and Purpose

Layer 2 (L2) establishes the distributed replication fabric for ODCS. Its core invariant is:

> **The Eventual Convergence Invariant:** *Disconnected nodes that process local mutations independently in any arbitrary temporal order shall automatically reach a mathematically identical distributed state upon reconnection, without data destruction or silent data loss.*

In traditional architectures, concurrent updates during offline periods cause destructive overwrite race conditions (e.g. standard SQL `UPDATE` overwriting concurrent edits). ODCS Layer 2 replaces destructive updates with **Conflict-Free Replicated Data Types (CRDTs)**, **Vector Clocks**, and **Store-and-Forward Outbox Synchronization Pipelines**.

---

## 2. Synchronization Architecture

```
┌────────────────────────────────────────────────────────┐
│               ODCS LAYER 2 SYNC PIPELINE               │
├────────────────────────────────────────────────────────┤
│  1. Transport Abstraction Layer (TAL)                  │
│     - Automatic protocol failover:                     │
│       HTTP/3 REST ↔ WebSockets ↔ WebRTC P2P ↔ BLE Mesh │
├────────────────────────────────────────────────────────┤
│  2. Store-and-Forward Outbox Orchestrator              │
│     - Pulls verified mutations from Layer 1 WAL        │
│     - Batched delta transmission with backoff retry    │
│     - Server / Peer ACK verification                   │
├────────────────────────────────────────────────────────┤
│  3. Convergence & Consensus Engine                     │
│     - Vector Clock causality tracking                  │
│     - CRDT delta merge (State-based & Op-based)        │
│     - Three-way semantic conflict arbiter              │
└────────────────────────────────────────────────────────┘
```

---

## 3. Normative Requirements

### 3.1 Causality Tracking via Vector Clocks
1. Every mutating node **MUST** maintain a Vector Clock representing its logical observation horizon:
   $$V_i = [c_1, c_2, \dots, c_n]$$
2. Nodes **MUST** increment their own counter prior to logging a local mutation.
3. Upon receiving an inbound sync payload from peer or server $j$, the local vector clock **MUST** merge the causal frontier:
   $$V_{local}[k] = \max(V_{local}[k], V_{remote}[k]) \quad \forall k$$

### 3.2 Supported Conflict-Free Replicated Data Types (CRDTs)
Implementations **SHALL** support at least two standard CRDT classes for collaborative data structures:

* **LWW-Register (Last-Write-Wins with Hybrid Logical Clock):**
  Resolves primitive field conflicts using HLC timestamps ($T_{hlc} = (\text{physical\_ms}, \text{logical\_counter})$).
* **AW-ORSet (Add-Wins Observed-Removed Set):**
  Manages collections and array items where concurrent additions take precedence over deletions to prevent lost updates.
* **PN-Counter (Positive-Negative Counter):**
  Maintains monotonic accumulation across distributed ledger or metric counters without cross-node locking.

### 3.3 The Store-and-Forward Outbox Lifecycle

```
[ L1 WAL Outbox ]
        │
        ▼ (L3 permits network execution)
[ L2 Sync Worker ] ──> [ Protocol Transport ] ──> [ Remote Peer / Cloud ]
        │                                                     │
   (Success ACK)                                         (Inbound Deltas)
        │                                                     │
        ▼                                                     ▼
[ L1 Mark Synced ]                                     [ CRDT Merge Engine ]
                                                              │
                                                              ▼
                                                       [ Notify L4 UI ]
```

---

## 4. Standard Interface Definitions (TypeScript/ES6)

```typescript
export interface IVectorClock {
  [nodeId: string]: number;
}

export interface ISyncBatch {
  batchId: string;
  sourceNodeId: string;
  vectorClock: IVectorClock;
  mutations: IOdcsMutation[];
  sentAt: number;
}

export interface ISyncAck {
  batchId: string;
  acceptedIds: string[];
  rejectedIds: { id: string; code: string; reason: string }[];
  serverVectorClock: IVectorClock;
  inboundDeltas: IOdcsMutation[];
}

export interface IOdcsSyncEngine {
  // Triggered when Layer 3 detects reachable connectivity
  synchronize(): Promise<ISyncResult>;
  
  // Register transport adapters (e.g., HTTP, WebSocket, P2P WebRTC)
  registerTransport(transport: IOdcsTransport): void;
  
  // Ingest incoming remote delta mutations
  mergeRemoteDeltas(deltas: IOdcsMutation[]): Promise<IMergeReport>;
  
  // Event listeners for sync lifecycle
  on(event: 'sync:start' | 'sync:progress' | 'sync:complete' | 'sync:conflict', handler: Function): void;
}
```

---

## 5. Failure Scenarios and Mitigations

| Failure Mode | Root Cause | Mandatory L2 Mitigation |
| :--- | :--- | :--- |
| **Network Dropped Mid-Sync** | Sockets disconnect during multi-megabyte batch upload | Idempotent mutation IDs; remote acknowledges individual mutation keys; unsynced records remain in L1 Outbox. |
| **Clock Skew / Replay** | Client clock altered by user or BIOS reset | Use Hybrid Logical Clocks (HLC) binding logical increments to physical time drift limits. |
| **Concurrent Conflicting Edits** | Two offline users modify the same record field | CRDT deterministic convergence computes unified state; semantic conflict notification dispatched to Layer 4 for user inspection if non-mergeable. |
