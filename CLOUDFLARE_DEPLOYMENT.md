# Open Digital Continuity Standard (ODCS) • Cloudflare Edge Worker
## Production Deployment Guide & Architecture Reference
**Standard:** ODCS-1.0.0 | **Author:** Anirudha Puthraya | **Domain:** `https://odcs.in`

---

## 1. Overview

The ODCS Cloudflare Worker (`_worker.js` / `worker.js`) establishes a globally distributed, high-performance edge compute gateway for the **Open Digital Continuity Standard (ODCS)** and the **Haven Programming Language** portal across Cloudflare's 330+ edge data centers worldwide.

Unlike traditional web workers that simply proxy requests to a centralized origin, the ODCS Edge Worker implements the core 4-Layer ODCS architecture directly at the edge:

```
┌────────────────────────────────────────────────────────────────────────┐
│  LAYER 4: Application & Continuity UX                                  │
│  - Instant Zero-Intent-Loss Receipt Minting (/api/intent/preserve)     │
│  - Guaranteed Non-Blocking UI under 16ms                               │
├────────────────────────────────────────────────────────────────────────┤
│  LAYER 3: Runtime & Environmental Adaptation                           │
│  - Sub-millisecond RTT Telemetry Heartbeats (/api/telemetry/probe)     │
│  - Automatic Degraded Mode Fallback on Upstream Failure                │
├────────────────────────────────────────────────────────────────────────┤
│  LAYER 2: Transport, Synchronization & Consensus                      │
│  - Multi-Master CRDT State Merging at Edge (/api/sync)                 │
│  - Vector Clock Causality Frontier Merging & Outbox ACKs               │
├────────────────────────────────────────────────────────────────────────┤
│  LAYER 1: Local Durability & Cryptographic Storage                     │
│  - RFC 8785 Canonical JSON & SHA-256 Merkle Proof Audit (/api/verify)  │
│  - Immutable Genesis Lineage Anchor (/api/ledger/genesis)              │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Quickstart Deployment

### Option A: Deploy with Cloudflare Pages (Recommended)

Cloudflare Pages automatically discovers `_worker.js` in your project root and deploys both static HTML/CSS/JS and the Edge Worker simultaneously with zero build configuration:

#### Method 1: Using the Wrangler CLI
```bash
# In the repository root (e.g., E:\ODCS models)
npx wrangler pages deploy . --project-name=odcs
```

#### Method 2: Git-Connected Cloudflare Pages Dashboard
1. Go to the [Cloudflare Dashboard](https://dash.cloudflare.com/) > **Workers & Pages** > **Create application** > **Pages**.
2. Connect your Git repository.
3. Configure build settings:
   - **Framework preset:** `None`
   - **Build command:** *(leave empty)*
   - **Build output directory:** `.` (root directory)
4. Click **Save and Deploy**. Cloudflare automatically activates `_worker.js` as the serverless edge router.

---

### Option B: Deploy with Cloudflare Workers (Standalone)

Deploy directly using `wrangler.toml`:

```bash
# 1. Login to Cloudflare
npx wrangler login

# 2. Deploy to edge
npx wrangler deploy
```

---

## 3. Edge API Endpoints Reference

### 🌐 Layer 3: Network Telemetry & RTT Probing
* **Endpoint:** `GET /api/telemetry/probe` or `GET /odcs/probe`
* **Purpose:** Provides client runtimes (such as Haven's `EnvironmentalTelemetry`) with a sub-millisecond edge heartbeat to measure round-trip time (RTT), latency jitter, and edge colocation.
* **Zero-Bandwidth Mode:** Append `?zero=1` to receive an instantaneous `HTTP 204 No Content` for zero mobile data consumption.
* **Sample Response:**
```json
{
  "status": "ONLINE",
  "standard": "ODCS-1.0.0",
  "edge": {
    "colo": "SIN",
    "country": "IN",
    "asn": 13335,
    "httpProtocol": "HTTP/3",
    "edgeTimestampMs": 1793280000000
  },
  "telemetry": {
    "mode": "OPTIMAL_ONLINE",
    "mode_code": 1,
    "mode_label": "Optimal Online (< 120ms)"
  }
}
```

---

### 🔄 Layer 2: Transport CRDT Consensus & Outbox Sync
* **Endpoint:** `POST /api/sync`
* **Purpose:** Accepts batched mutations from Haven nodes or edge devices, updates the edge `VectorClock`, merges distributed `PNCounter` and `AWORSet` states, and returns cryptographic ACKs.
* **Payload:**
```json
{
  "clock": { "Node-Ambulance": 4 },
  "counters": {
    "plasma_units": { "p": { "Node-Ambulance": 20 }, "n": {} }
  },
  "mutations": [
    { "mutation_id": "mut-tx-8910" }
  ]
}
```
* **Response:**
```json
{
  "status": "converged",
  "consensus_engine": "CRDT-SEC-v1",
  "acknowledged_mutations": ["mut-tx-8910"],
  "edge_receipt_hash": "sha256:7f83b1...",
  "converged_counters": {
    "plasma_units": 120
  }
}
```

---

### ✍ Layer 4: Zero Intent Loss Receipt Staging
* **Endpoint:** `POST /api/intent/preserve`
* **Purpose:** Guarantees zero UI blocking. Mints an edge-signed cryptographic `IntentReceipt` in under 15ms even if origin databases are slow or offline.
* **Response:**
```json
{
  "standard": "ODCS-1.0.0",
  "intent_id": "intent-edge-f82b...",
  "status": "sealed_at_edge",
  "guarantee": "Zero Intent Loss across transport disruptions",
  "payload_digest": "sha256:4a81c..."
}
```

---

### 🛡 Layer 1: Canonical Merkle Proof Verifier
* **Endpoint:** `POST /api/verify`
* **Purpose:** Validates asset payloads against expected SHA-256 canonical digests using RFC 8785 deterministic ordering at the edge.

---

### 🚀 Haven 20-OS Release Binary Smart Routing
* **Direct Download URLs:**
  - `GET /download/windows` ➔ Redirects to `Haven-1.0.0-win64-Setup.exe`
  - `GET /download/portable` ➔ Redirects to `Haven-1.0.0-win64-portable.zip`
  - `GET /download/cli` ➔ Redirects to `haven.exe`
  - `GET /download/linux` ➔ Redirects to `haven_1.0.0_amd64.deb`
  - `GET /download/rpm` ➔ Redirects to `haven-1.0.0-1.x86_64.rpm`
  - `GET /download/appimage` ➔ Redirects to `haven-1.0.0-x86_64.AppImage`
  - `GET /download/macos` ➔ Redirects to `Haven-1.0.0-macOS-Universal.dmg`
  - `GET /download/android` ➔ Redirects to `haven-1.0.0-android-arm64.tar.gz`
  - `GET /download/wasm` ➔ Redirects to `haven-runtime.wasm`
  - `GET /download/latest` ➔ Automatically inspects `User-Agent` and routes to the matching operating system!
* **Headers Injected:**
  - `X-Haven-Package: Haven Windows Setup Installer (x64)`
  - `X-Haven-SHA256: b325da0b205aa833772274b7c6cb8469ad51b54a8616c683b51680d22f2a32e6`
  - `X-Haven-Size: 19.7 MB`

---

### 📰 Admin Essays & Publications API
* **Endpoint:** `GET /api/articles` (supports search filter `?q=invariant`)
* **Endpoint:** `GET /api/articles/:slug` (retrieves essays by Anirudha Puthraya)

---

### ⚖️ Institutional Legal & Governance Pages
The Edge Worker automatically maps clean URLs to their corresponding legal documents:
* `/privacy` ➔ `privacy.html` (Local Data Sovereignty, Zero Tracking, GDPR/CCPA/DPDP)
* `/terms` ➔ `terms.html` (Standards Participation, Specification Grant, Apache 2.0)
* `/security` ➔ `security.html` (Vulnerability Disclosure Program, Safe Harbor SLA)
* `/governance` ➔ `governance.html` (Architecture Committee Charter, Royalty-Free IP Policy)
* `/brand` ➔ `brand.html` (Brand Guidelines, Conformance Marks, Color Tokens)
* `/legal` ➔ `legal.html` (Master Interactive Legal & Governance Portal)

---

## 4. Continuity Headers on Every Edge Response

Every request routed through the ODCS Cloudflare Worker carries institutional audit headers:

```http
X-ODCS-Standard: ODCS-1.0.0
X-ODCS-Author: Anirudha Puthraya
X-ODCS-Edge-Colo: SIN
X-ODCS-Continuity-Mode: OPTIMAL_ONLINE
X-ODCS-Zero-Intent-Loss: true
X-ODCS-Server-Timing: edge;dur=0.42
Strict-Transport-Security: max-age=31536000; includeSubDomains; preload
X-Content-Type-Options: nosniff
X-Frame-Options: SAMEORIGIN
```

---

## 5. Autonomic Degraded Mode Fallback (ODCS Invariant 3)

If the origin web server or upstream network fails, the Cloudflare Worker intercepts the failure and activates **Layer 3 Degraded Execution Mode**:
- Stale cached assets are served with `stale-while-revalidate`.
- If an un-cached page fails, the Worker generates a self-contained, beautifully styled **Degraded Continuity Fallback Screen** confirming that local client state machines remain sovereign.

---

## 6. Official API Gateway Subdomain (`https://api.odcs.in`)

The ODCS ecosystem operates a dedicated edge API gateway at `https://api.odcs.in` powering client runtimes, Haven Language compilers, and partner integrations:

* **Interactive Visual Explorer:** `https://api.odcs.in/docs`
* **OpenAPI 3.1.0 Specification:** `https://api.odcs.in/openapi.json`
* **RFC 6570 Discovery Index:** `https://api.odcs.in/`
* **RFC 5785 Health Check:** `https://api.odcs.in/healthz`
* **Endpoints:** `/v1/telemetry/probe`, `/v1/sync`, `/v1/intent/preserve`, `/v1/verify`, `/v1/downloads`, `/v1/schemas`, `/v1/articles`

### Deploying `api.odcs.in`
- **Unified Cloudflare Pages:** Bind both `odcs.in` and `api.odcs.in` as custom domains on the Pages project. `_worker.js` automatically routes `api.odcs.in` requests to `api-worker.js`.
- **Dedicated Worker:** Run `npm run deploy:api` (uses `wrangler.api.toml`).
- **Comprehensive API Manual:** See [API_ODCS_IN.md](file:///e:/ODCS%20models/API_ODCS_IN.md).


