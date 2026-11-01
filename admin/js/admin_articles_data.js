/**
 * HAVEN LANGUAGE & ODCS: ADMIN ARTICLES & ESSAYS REPOSITORY
 * Standard Specification & Architecture by Anirudha Puthraya
 */

const DEFAULT_ADMIN_ARTICLES = [
  {
    "id": "zero-intent-loss",
    "num": 1,
    "title": "The Zero Intent Loss Invariant: Why Human Expression Must Never Be Discarded",
    "subtitle": "How the Open Digital Continuity Standard replaces 504 timeouts, wiped forms, and spinner screens with deterministic local authority.",
    "author": "Anirudha Puthraya",
    "role": "Lead Architect & Creator of Haven Language",
    "date": "October 2026",
    "category": "Architecture & Philosophy",
    "read_time": "8 min read",
    "tags": [
      "ODCS",
      "ZeroIntentLoss",
      "Resilience",
      "UX Invariants"
    ],
    "summary": "Every day, billions of human inputs are permanently lost to network jitter, server timeouts, and fragile client-server sessions. This essay formalizes the Zero Intent Loss Invariant\u2014mandating that human intent expressed through software must achieve local permanence under 16 milliseconds and never be rejected due to transport disruptions.",
    "content": "# The Zero Intent Loss Invariant\n### By Anirudha Puthraya \u2022 Creator & Lead Architect\n\nEvery day, billions of human thoughts, financial transfers, medical observations, and legal contracts are destroyed by an invisible design flaw in contemporary computing: **the fragile assumption of continuous connectivity**.\n\nA paramedic in an underground parking garage types emergency patient vitals and presses \"Submit.\" A spinner appears. Three seconds later, an HTTP 504 Gateway Timeout wipes the input fields. The paramedic must begin again, but time is running out.\n\nA field researcher in a high-altitude rainforest logs species coordinates into an environmental audit app. A cellular blip drops the TCP handshake; the application resets to its login screen, discarding thirty minutes of field recordings.\n\nThis is not a network failure. **It is an architectural failure.**\n\n---\n\n## 1. The Core Invariant\n\nThe Open Digital Continuity Standard (ODCS) formalizes what we call the **Zero Intent Loss Invariant**:\n\n> *\"The user's expressed intention shall never be rejected, wiped, or blocked by the software interface due to network latency, server downtime, or physical disconnection.\"*\n\nUnder ODCS Layer 4, the moment a user presses a key, checks a box, or seals a record, that action achieves **immediate local cryptographic durability** in under 16 milliseconds. The local node acts as an autonomous sovereign authority. The network is relegated to its proper role: an asynchronous synchronization fabric, not a permission gateway.\n\n---\n\n## 2. The 16ms Rule: Local Authority over Remote Permission\n\nTraditional web and mobile applications treat the local device as a disposable \"dumb terminal.\" Every keystroke asks the cloud: *\"May I persist this?\"* When the cloud is unreachable, the application freezes.\n\nHaven Language reverses this paradigm:\n1. **Immediate Write-Ahead Log (WAL):** Inputs are committed to an append-only monotonic journal on local NVMe or flash storage before any network socket is opened.\n2. **Deterministic State Evolution:** The application state machine advances immediately, rendering optimistic UI without blocking spinners.\n3. **Cryptographic Sealing:** A field-level Merkle root and SHA-256 seal are generated on the client.\n4. **Convergent Background Mesh:** When connectivity returns\u2014whether 2 seconds or 2 weeks later\u2014the ledger synchronizes monotonically without double-spends or data loss.\n\n---\n\n## 3. Human Trust as an Engineering Constraint\n\nSoftware resilience is ultimately an ethical commitment to human trust. When a doctor, engineer, or student uses our tools, they are investing their irreplaceable cognitive focus. Discarding their input because an HTTP socket closed is an engineering offense.\n\nHaven was built from the compiler level to ensure that Zero Intent Loss is not merely an optional library, but a foundational law enforced by language syntax and runtime bytecode.\n"
  },
  {
    "id": "why-we-built-haven",
    "num": 2,
    "title": "Why We Built Haven: Fixing 30 Years of Broken Client-Server Fragility",
    "subtitle": "The journey of engineering a native disruption-tolerant runtime for sovereign local-first systems.",
    "author": "Anirudha Puthraya",
    "role": "Lead Architect & Creator of Haven Language",
    "date": "October 2026",
    "category": "Language Design & Compilers",
    "read_time": "10 min read",
    "tags": [
      "HavenLang",
      "Compilers",
      "HavenVM",
      "LocalFirst"
    ],
    "summary": "Existing programming languages treat networking as an afterthought and immutability as a convention. Haven Language was built from the grammar level to embed cryptographic durable records, natural English syntax, and pipeline transformations directly into bytecode.",
    "content": "# Why We Built Haven (Heaven Language)\n### By Anirudha Puthraya \u2022 Creator & Lead Architect\n\nThirty years ago, the computing world made a collective Faustian bargain: we centralized computation in remote data centers and turned client hardware into fragile viewing portals.\n\nIn doing so, we created an entire industry of duct-tape solutions: retry loops, offline sync libraries, caching layers, and distributed locking mechanisms that crash when a fiber optic cable is cut by an excavator.\n\nWe asked a simple question: **What would a programming language look like if disruption tolerance, cryptographic immutability, and natural human readability were built directly into the grammar?**\n\nThe answer is **Haven Language**.\n\n---\n\n## 1. Native Language Primitives for Digital Continuity\n\nIn typical languages, verifying cryptographic provenance requires dozens of lines of cryptographic boilerplate. In Haven, it is a first-class statement:\n\n```haven\ndurable record MedicalEncounter:\n    patient_id: str\n    heart_rate: int\n    dosage_mg: float\n    sealed_by: str\n\n# Create and seal record\nset encounter to MedicalEncounter(\"PT-991\", 78, 25.0, \"Dr. Sarah\")\n\n# Language-level ledger checkpointing\ncheckpoint encounter as \"icu_vital_check\" into hospital_ledger\n\n# Native verification statement\nverify encounter with encounter.odcs_hash()\n```\n\nBy making `durable record`, `checkpoint`, and `verify` keywords in the grammar, the compiler guarantees:\n- **Zero in-place mutation:** Once constructed, any attempt to tamper with fields throws a `ContinuityImmutabilityError` at runtime.\n- **Deterministic RFC 8785 JSON canonicalization:** State digests are deterministic across CPU architectures and compiler optimizations.\n- **Automatic Merkle proof paths:** Field-level proofs can be generated and verified without revealing confidential adjacent fields.\n\n---\n\n## 2. Natural English Syntax Without Sacrificing Performance\n\nMany languages forced a false dichotomy: either cryptic punctuation (`{}`, `&&`, `||`, `!`) or sluggish interpreted DSLs.\n\nHaven bridges this gap:\n```haven\nset total_transfers to 0\n\nrepeat 5 times:\n    set total_transfers to total_transfers + 1\n\nunless total_transfers == 0:\n    print \"Continuous ledger active across all nodes.\"\n```\n\nBy compiling natural English statements directly into specialized Haven VM bytecode instructions (`HAVEN_PIPE`, `STORE_FAST`, `JUMP_IF_FALSE`), Haven executes with C-speed while reading like clear documentation.\n"
  },
  {
    "id": "odcs-architecture-blueprint",
    "num": 3,
    "title": "ODCS-1.0.0: The 4-Layer Architecture for Disaster-Proof Computing",
    "subtitle": "An architectural walkthrough of L1 Storage Durability, L2 Mesh Consensus, L3 Telemetry, and L4 Zero Intent Loss UX.",
    "author": "Anirudha Puthraya",
    "role": "Lead Architect & Creator of Haven Language",
    "date": "October 2026",
    "category": "ODCS Specification",
    "read_time": "12 min read",
    "tags": [
      "Architecture",
      "ODCS",
      "4Layers",
      "Specs"
    ],
    "summary": "A deep dive into the four foundational layers of the Open Digital Continuity Standard (ODCS), showing how sovereign edge nodes maintain full operational autonomy and mathematically sound state convergence without centralized cloud dependencies.",
    "content": "# ODCS-1.0.0: The 4-Layer Architecture\n### By Anirudha Puthraya \u2022 Creator & Lead Architect\n\nThe Open Digital Continuity Standard (ODCS) provides an open, vendor-neutral specification establishing deterministic software continuity across network disruptions, outages, and catastrophic blackouts.\n\nODCS divides computing systems into four clean, verifiable layers:\n\n```\n\u250c\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2510\n\u2502  LAYER 4: ZERO INTENT LOSS HUMAN INTERFACE (UX)             \u2502\n\u2502  Instant local persistence (<16ms), non-blocking affordances \u2502\n\u251c\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2524\n\u2502  LAYER 3: ENVIRONMENTAL TELEMETRY & CONVERGENCE             \u2502\n\u2502  Carrier waves, latency metrics, automatic mesh discovery   \u2502\n\u251c\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2524\n\u2502  LAYER 2: ASYNCHRONOUS TRANSPORT & MESH CONSENSUS           \u2502\n\u2502  Multi-signer quorums, CRDT state deltas, peer-to-peer sync \u2502\n\u251c\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2524\n\u2502  LAYER 1: CRYPTOGRAPHIC DURABILITY & APPEND-ONLY LEDGER    \u2502\n\u2502  Monotonic WAL, SHA-256 hash chains, field-level Merkle trees\u2502\n\u2514\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2518\n```\n\n---\n\n## Layer 1: Cryptographic Durability & Immutable State\nAt the foundation lies the local append-only ledger. Every state mutation is modeled as an atomic `StateTransitionStep`:\n- Pre-state hash\n- Action name and actor identity\n- Canonical JSON payload digest\n- Post-state hash\n\nBecause blocks are linked via `prev_hash == prev_entry.entry_hash` from Genesis to Head, any tampering of historical logs produces an immediate mathematical discontinuity that is rejected during audit.\n\n---\n\n## Layer 2: Transport Agnostic Mesh Consensus\nODCS nodes do not require persistent WebSocket or HTTP connections. They communicate via:\n- Sneakernet USB drives with sealed journal exports (`app.export_journal()`)\n- Bluetooth Low Energy (BLE) peer meshes\n- Intermittent LoRa radio frequencies\n- Ephemeral satellite uplink passes\n\nWhen two nodes encounter one another, they exchange Merkle roots to find common ancestors and seamlessly merge divergent event histories.\n"
  },
  {
    "id": "deterministic-replay-disaster-recovery",
    "num": 4,
    "title": "Deterministic Replay & Disaster Recovery: Restoring State with Zero Data Loss",
    "subtitle": "How Haven's append-only continuity journals guarantee bit-for-bit state reconstruction after total infrastructure collapse.",
    "author": "Anirudha Puthraya",
    "role": "Lead Architect & Creator of Haven Language",
    "date": "October 2026",
    "category": "Distributed Systems",
    "read_time": "9 min read",
    "tags": [
      "DisasterRecovery",
      "Replay",
      "Ledger",
      "Cryptography"
    ],
    "summary": "In traditional IT, disaster recovery means praying that yesterday's database dump restores without corruption. Under ODCS, disaster recovery is a mathematical proof: every transaction is replayed from Genesis, yielding identical cryptographic head hashes across different machines decades later.",
    "content": "# Deterministic Replay & Disaster Recovery\n### By Anirudha Puthraya \u2022 Creator & Lead Architect\n\nWhen a hospital server room floods or a data center loses power, organizations face their worst nightmare: **state divergence**. Backups don't mount, transactions are half-committed, and database indexes are corrupt.\n\nHaven eliminates state divergence through **Deterministic Journal Replay**:\n\n```bash\n# Disaster recovery command in Haven CLI:\nhaven odcs replay data/ledger_journal.json\n```\n\n---\n\n## 1. The RFC 8785 Guarantee\n\nIn traditional JSON serializers:\n- Key order is nondeterministic (`{\"a\":1,\"b\":2}` vs `{\"b\":2,\"a\":1}`)\n- Floating point representations vary (`1.0` vs `1.00`)\n- Whitespace depends on formatting libraries\n\nHaven implements RFC 8785 Canonical JSON determinism at the C substrate layer. Two systems computing the hash of identical state on different continents\u2014one running Windows ARM64 and the other running Linux x86_64\u2014will compute identical 32-byte hex digests down to the exact bit.\n\n---\n\n## 2. Zero-Loss Disaster Replay Protocol\n\nWhen an application boots from an archived journal:\n1. **Genesis Verification:** Block #0 is validated against the standard genesis root.\n2. **Hash Chaining:** Every block must prove that `entry.prev_hash == entries[i-1].entry_hash`.\n3. **Payload Envelope Verification:** The payload hash and Merkle root must match the envelope signature.\n4. **Deterministic State Accumulation:** The registered continuity algorithm re-executes each state transition step.\n\nIf even a single byte has been altered by bit-rot or malicious tampering, the replay halts with a `ContinuityIntegrityError`, pinpointing the exact corrupted block index.\n"
  },
  {
    "id": "critical-infrastructure-continuity",
    "num": 5,
    "title": "Continuity in Critical Infrastructure: Keeping Hospitals, Trains, and Satellites Running Offline",
    "subtitle": "Real-world operational case studies deploying Haven and ODCS in environments where downtime is fatal.",
    "author": "Anirudha Puthraya",
    "role": "Lead Architect & Creator of Haven Language",
    "date": "October 2026",
    "category": "Mission-Critical Systems",
    "read_time": "11 min read",
    "tags": [
      "Hospitals",
      "Railways",
      "Satellites",
      "EdgeComputing"
    ],
    "summary": "Real-world implementations of ODCS in hospital intensive care units, high-speed rail ticketing, and low-earth orbit satellite constellations where constant internet access is impossible.",
    "content": "# Continuity in Critical Infrastructure\n### By Anirudha Puthraya \u2022 Creator & Lead Architect\n\nSoftware failure is an inconvenience when shopping online. In critical infrastructure, software failure is measured in human lives and millions of dollars in damages.\n\nHere are three real-world deployment topologies powered by Haven Language and ODCS:\n\n---\n\n## Case 1: Hospital Intensive Care Telemetry\nIn emergency rooms and surgical suites, patient vitals must be monitored continuously. When a hospital's central IT backbone undergoes maintenance or a ransomware attack severs WAN connectivity, patient care cannot halt.\n\nWith Haven:\n- Bedside monitors operate as independent ODCS nodes.\n- Patient medication dosages and cardiac telemetry are committed to local durable records.\n- Nurses administer emergency medication with instant verification.\n- When the central hospital server reboots, patient journals merge with 100% mathematical fidelity.\n\n---\n\n## Case 2: High-Speed Rail & Underground Transit\nTransit systems moving through mountain tunnels and subterranean subway corridors spend 40% of their operational lifetime in connectivity dead zones.\n\nTraditional centralized ticketing systems fail when offline: passengers cannot scan QR tickets, turnstiles jam, and conductors cannot validate fares.\n\nUnder ODCS:\n- Train cars maintain local peer continuity ledgers.\n- Passenger ticket validations and seat changes are checked point-to-point.\n- Upon entering station terminals with optical fiber uplinks, ledgers synchronize in milliseconds.\n"
  },
  {
    "id": "natural-syntax-manifesto",
    "num": 6,
    "title": "The Natural Syntax Manifesto: Replacing Cryptic Symbols with Expressive English",
    "subtitle": "Why readability is the ultimate security feature in modern systems programming.",
    "author": "Anirudha Puthraya",
    "role": "Lead Architect & Creator of Haven Language",
    "date": "October 2026",
    "category": "Language Ergonomics",
    "read_time": "7 min read",
    "tags": [
      "Syntax",
      "EnglishLanguage",
      "DeveloperExperience"
    ],
    "summary": "Cryptic syntax in programming languages causes bugs, reduces accessibility, and obscures business logic. Haven demonstrates that expressive English statements like 'set x to 42' and 'repeat 3 times:' can be compiled directly into high-performance native bytecode.",
    "content": "# The Natural Syntax Manifesto\n### By Anirudha Puthraya \u2022 Creator & Lead Architect\n\nCode is read a hundred times more often than it is written. Yet for decades, programming languages have clung to archaic punctuation borrowed from teletype machines and punch cards.\n\nWhen business logic is obscured behind nested parentheses, cryptic ternary operators, and ambiguous sigils, security vulnerabilities multiply.\n\n---\n\n## The Haven Readability Benchmark\n\nCompare the cognitive load of a standard loop with error handling:\n\n### Traditional Cryptic Language:\n```javascript\nfor (let i = 0; i < retries; i++) {\n    if (!conn.isAlive()) {\n        continue;\n    }\n    doSync();\n}\n```\n\n### Haven Natural Syntax:\n```haven\nrepeat retries times:\n    unless connection.is_offline:\n        sync_ledger()\n```\n\n---\n\n## Pipe Transformations with `|>` and `_`\n\nTransforming complex data structures shouldn't require deeply nested function calls:\n\n```haven\n# Pure clarity: left-to-right execution flow\nset processed_data to raw_stream\n    |> clean_whitespace(_)\n    |> validate_schema(_, \"PatientRecord\")\n    |> checkpoint(_) into hospital_ledger\n```\n\nReadability is not aesthetic frivolity. **Readability is correctness. Readability is security. Readability is continuity.**\n"
  }
];

function getAdminArticles() {
  try {
    const custom = localStorage.getItem('odcs_haven_admin_articles');
    if (custom) {
      const parsed = JSON.parse(custom);
      if (Array.isArray(parsed) && parsed.length > 0) {
        // Merge with defaults if needed
        const ids = new Set(parsed.map(a => a.id));
        const merged = [...parsed];
        for (const def of DEFAULT_ADMIN_ARTICLES) {
          if (!ids.has(def.id)) {
            merged.push(def);
          }
        }
        return merged;
      }
    }
  } catch (e) {
    console.warn('Error reading custom articles:', e);
  }
  return DEFAULT_ADMIN_ARTICLES;
}
