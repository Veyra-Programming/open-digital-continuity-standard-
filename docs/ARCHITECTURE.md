# ODCS System Architecture & Technical Topology
## Architecture Reference Model | Version 1.0.0-DRAFT

---

## 1. Architectural Philosophy

The Open Digital Continuity Standard (ODCS) inverts the classical client-server paradigm. In orthodox web and mobile applications:
- The remote cloud server is the single synchronous authority.
- The client is a thin ephemeral renderer that cannot function when disconnected.
- Networks are assumed to be reliably transparent.

In an **ODCS-Compliant Architecture**:
1. **Edge-First Durability:** Every node (client, mobile device, edge server, vehicle computer, IoT gateway) is an autonomous, self-sufficient computing node.
2. **Asynchronous by Default:** Mutations are committed locally to durable non-volatile storage first, decoupled from the network transport lifecycle.
3. **Multi-Topology Federation:** Synchronization operates symmetrically between client-to-cloud, client-to-edge, or peer-to-peer (P2P mesh).

---

## 2. End-to-End System Topology

```
┌────────────────────────────────────────────────────────────────────────┐
│                        ODCS EDGE CLIENT NODE                           │
│                                                                        │
│  [ Layer 4: UX & View Layer ] ◄── Direct Reactive Bindings             │
│        │                               ▲                               │
│        ▼ Optimistic Mutation           │ Merged View State             │
│  [ Layer 3: Runtime Adapter ] ─── Policy Guard                         │
│        │                               │                               │
│        ▼ Commit Transaction            │ Materialized Snapshot         │
│  [ Layer 1: Local Durability (WAL + Store) ]                           │
│        │                                                               │
│        ▼ Monotonic Outbox Stream                                       │
│  [ Layer 2: Sync Engine (TAL / CRDTs) ]                                │
└────────┬───────────────────────────────────────────────────────────────┘
         │
         │ Multi-Transport Channel (HTTPS / WebSocket / WebRTC / BLE Mesh)
         │
┌────────▼───────────────────────────────────────────────────────────────┐
│                    ODCS COORDINATION / UPSTREAM RELAY                  │
│                                                                        │
│  - Merkle DAG Ingestion Pipeline                                       │
│  - Distributed Vector Clock Arbiter                                    │
│  - Multi-Tenant Conflict-Free State Convergence (CRDT Server)          │
│  - Delta Broadcast Bus (Kafka / Redis Streams / NATS)                  │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 3. Data Flow Lifecycle: A Walkthrough

Let us trace what occurs when a user initiates a mutation (e.g. updating a patient chart or editing a document) during a total network blackout:

```
[User Action]
     │
     ▼
1. Layer 4 applies optimistic state transformation to DOM (<16ms).
     │
     ▼
2. Layer 3 evaluates current environment:
   Detects: Network Offline (RTT: ∞, Mode: TRANSIENT_OFFLINE).
   Policy: Prohibits immediate socket dispatch, commands L1 durable spooling.
     │
     ▼
3. Layer 1 executes atomic transaction:
   - Appends operation record to local Write-Ahead Log (WAL) with monotonic UUIDv7.
   - Computes previousHash Merkle link.
   - Updates local state snapshot store.
   - Returns confirmation to L4.
     │
     ▼
4. Layer 4 updates ambient continuity indicator:
   - Displays: `Saved Locally (1 queued)`.
     │
     ▼
... 45 minutes of complete physical disconnection elapse ...
     │
     ▼
5. Device regains network connectivity.
   - Layer 3 probe detects `OPTIMAL_ONLINE` (RTT: 42ms).
   - Layer 3 dispatches transition event to Layer 2.
     │
     ▼
6. Layer 2 Sync Engine awakens:
   - Queries Layer 1 for pending outbox batch.
   - Transmits batched delta payload with local Vector Clock.
   - Upstream server verifies Merkle hashes, performs CRDT merge.
   - Server returns ACK + inbound remote deltas made by other peers.
     │
     ▼
7. Layer 1 marks local outbox records as SYNCED.
8. Layer 2 merges remote deltas into local snapshot store.
9. Layer 4 ambient indicator pulses: `Synced`.
```

---

## 4. Multi-Node Conflict Resolution & CRDT Merging

When multiple disconnected nodes modify the same entity, ODCS employs deterministic convergence structures:

### 4.1 Field-Level Register Conflict Resolution
For atomic scalar values (numbers, strings, timestamps), ODCS mandates **Last-Write-Wins Registers (LWW-Register)** augmented with **Hybrid Logical Clocks (HLC)**:
$$HLC = (l, c) \quad \text{where } l = \text{physical time}, c = \text{logical counter}$$
Ties in physical time are broken deterministically by the lexical order of node identifiers, guaranteeing identical outcomes across all nodes without a central lock manager.

### 4.2 Collection-Level Conflict Resolution
For list and collection mutations, ODCS implements **Add-Wins Observed-Removed Sets (AW-ORSet)**:
- Adding element $e$ assigns a globally unique tag $(e, \text{uuid})$.
- Deleting element $e$ removes all instances of $e$ observed in the local replica at that instant.
- If peer A adds $e$ concurrently while peer B deletes $e$, the addition tag created by A has not been observed by B's delete, hence the item safely endures—preventing catastrophic data loss.

---

## 5. Security Architecture & Threat Model

1. **At-Rest Protection:** Local databases (IndexedDB / SQLite) in multi-user devices must leverage envelope encryption with keys derived from user authentication.
2. **Replay Immunity:** Because each mutation record contains a cryptographic parent hash and a monotonic sequence ID, replaying captured packets against an ODCS sync coordinator fails signature and vector clock verification.
3. **Partition Tolerance:** In accordance with the CAP theorem, ODCS explicitly prioritizes **Availability** and **Partition Tolerance (AP)** over synchronous linearizability, ensuring systems never stop working for humans on the ground.
