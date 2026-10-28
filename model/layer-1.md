# ODCS Layer 1 Specification: Local Durability & Cryptographic Storage
## Specification Document: ODCS-SPEC-002 | Version: 1.0.0-DRAFT
**Layer:** Layer 1 (Foundational Durability)  
**Parent Document:** [ODC-MODEL.md](./ODC-MODEL.md)  
**Status:** Working Draft

---

## 1. Overview and Purpose

Layer 1 (L1) forms the physical durability anchor of the Open Digital Continuity Standard. Its fundamental invariant is:

> **The Durability Invariant:** *No user action, state transition, or mutation acknowledged to upper layers shall ever be lost due to application crashes, operating system terminations, device battery exhaustion, or power failure.*

Traditional cloud applications write to remote network sockets first, treating local memory as volatile scratchpads. In an ODCS architecture, **local non-volatile storage is the primary authority of record** for client-initiated operations until upstream synchronization succeeds.

---

## 2. Mandatory Structural Components

Every ODCS Layer 1 implementation **MUST** furnish three decoupled subsystems:

```
┌────────────────────────────────────────────────────────┐
│               ODCS LAYER 1 STORAGE STACK               │
├────────────────────────────────────────────────────────┤
│  1. Mutation Journal (Write-Ahead Log / Outbox)        │
│     - Append-only journal of serialized operations     │
│     - Monotonically increasing sequence IDs (UUIDv7)   │
│     - Merkle-hashed provenance chaining                │
├────────────────────────────────────────────────────────┤
│  2. Local State Snapshot Store                         │
│     - Materialized views of application entities       │
│     - Fast secondary indexing (IndexedDB / SQLite)     │
│     - ACID transactional isolation                     │
├────────────────────────────────────────────────────────┤
│  3. Durability & Quota Governor                        │
│     - Storage eviction protection request              │
│     - Tiered cleanup (Cache vs Invariant Data)         │
│     - Storage degradation alerts to Layer 3            │
└────────────────────────────────────────────────────────┘
```

---

## 3. Normative Requirements

### 3.1 Transactional Atomicity (WAL Pattern)
1. Whenever a mutation occurs, the system **MUST** write the operation record to the **Mutation Journal** before or simultaneously within an atomic transaction updating the **Local State Snapshot Store**.
2. If the underlying storage engine does not support cross-table ACID transactions, the system **MUST** commit to the Mutation Journal first, followed by a lazy projection to the snapshot store upon boot verification.

### 3.2 Monotonic Sequence Identification
1. Mutation records **MUST** carry an identifier that is temporally sortable and strictly monotonic on that node. The **RECOMMENDED** format is **UUIDv7** (combining Unix millisecond timestamps with sub-millisecond counter and entropy) or ULID.

### 3.3 Mutation Record Schema
An ODCS Layer 1 Mutation record **SHALL** adhere to the following schema:

```json
{
  "$schema": "https://odcs.in/schemas/v1/mutation.json",
  "id": "018f2d5e-9a1b-7c3d-8f2e-4b6a8e0c1d2e",
  "timestamp": 1793280000000,
  "nodeId": "node-client-7f89b2",
  "entity": "patient_records",
  "action": "UPDATE",
  "payload": {
    "patientId": "P-9841",
    "vitalSigns": { "bp": "120/80", "pulse": 72 }
  },
  "vectorClock": { "node-client-7f89b2": 142 },
  "status": "QUEUED_OUTBOX",
  "retryCount": 0,
  "previousHash": "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
  "hash": "8f434346648f6b96df89dda901c5176b10a6d83961dd3c1ac88b59b2dc327aa4"
}
```

---

## 4. Standard Interface Definitions (TypeScript/ES6)

```typescript
export interface IOdcsMutation<T = unknown> {
  id: string;                      // Monotonic UUIDv7
  timestamp: number;               // Milliseconds since epoch
  nodeId: string;                  // Distinct node/client GUID
  entity: string;                  // Target domain entity
  action: 'CREATE' | 'UPDATE' | 'DELETE' | 'PATCH';
  payload: T;                      // Domain mutation data
  vectorClock: Record<string, number>;
  status: 'PENDING' | 'QUEUED_OUTBOX' | 'SYNCED' | 'CONFLICT';
  previousHash: string;            // SHA-256 link to prior local mutation
  hash: string;                    // SHA-256 of current record
}

export interface IOdcsDurabilityEngine {
  init(options: { dbName: string; version: number }): Promise<void>;
  
  // Atomic append to WAL outbox
  recordMutation<T>(mutation: Omit<IOdcsMutation<T>, 'id' | 'timestamp' | 'hash'>): Promise<IOdcsMutation<T>>;
  
  // Retrieve unprocessed mutations for Layer 2 sync
  getPendingOutbox(limit?: number): Promise<IOdcsMutation[]>;
  
  // Acknowledge remote sync completion
  markMutationsSynced(mutationIds: string[]): Promise<void>;
  
  // Snapshot CRUD
  getEntity<T>(entity: string, id: string): Promise<T | null>;
  queryEntities<T>(entity: string, query: Record<string, unknown>): Promise<T[]>;
  putEntity<T>(entity: string, id: string, data: T): Promise<void>;
  
  // Quota and telemetry
  getStorageMetrics(): Promise<{ usedBytes: number; quotaBytes: number; isPersisted: boolean }>;
}
```

---

## 5. Failure Scenarios and Mitigations

| Failure Mode | Root Cause | Mandatory L1 Mitigation |
| :--- | :--- | :--- |
| **Crash Mid-Write** | Power loss during storage transaction | Rollback uncommitted transactions via WAL journal recovery upon boot. |
| **Browser Storage Eviction** | OS or browser clears IndexedDB under disk pressure | Implement `navigator.storage.persist()`. Segment durable outbox into persistent storage origin. |
| **Storage Quota Exceeded** | Large volume of offline media or records | Evict read-cache snapshots; preserve outbox queue; alert Layer 3 to restrict non-essential mutations. |
| **Local Tampering / Corruption** | File corruption or unauthorized edits | Merkle hash verification failure halts Layer 2 sync and flags alert to Layer 4 UX. |
