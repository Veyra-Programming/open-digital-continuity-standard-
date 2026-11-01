/**
 * ============================================================================
 * Verification Test Suite for api.odcs.in Cloudflare API Gateway
 * Standard: Open Digital Continuity Standard (ODCS-1.0.0)
 * Author: Anirudha Puthraya
 * ============================================================================
 */
import apiWorker from "./api-worker.js";
import pagesWorker from "./_worker.js";

async function runApiTests() {
  console.log("===============================================================");
  console.log("  api.odcs.in Cloudflare API Gateway - Verification Suite     ");
  console.log("  Standard: Open Digital Continuity Standard (ODCS-1.0.0)      ");
  console.log("  Author: Anirudha Puthraya                                   ");
  console.log("===============================================================\n");

  let passed = 0;
  let failed = 0;

  async function test(name, fn) {
    try {
      await fn();
      console.log(`[PASS] ${name}`);
      passed++;
    } catch (e) {
      console.error(`[FAIL] ${name}:`, e.message);
      failed++;
    }
  }

  function makeReq(url, method = "GET", body = null, headers = {}) {
    const init = {
      method,
      headers: new Headers({ "User-Agent": "ODCS-Api-Tester/1.0", ...headers }),
    };
    if (body) {
      init.body = typeof body === "string" ? body : JSON.stringify(body);
      init.headers.set("Content-Type", "application/json");
    }
    const req = new Request(url, init);
    req.cf = {
      colo: "BOM",
      country: "IN",
      city: "Mumbai",
      asn: 13335,
      httpProtocol: "HTTP/3"
    };
    return req;
  }

  // 1. Root RFC 6570 Discovery Index
  await test("Root: RFC 6570 Discovery Manifest (GET https://api.odcs.in/)", async () => {
    const req = makeReq("https://api.odcs.in/");
    const res = await apiWorker.fetch(req, {}, {});
    if (res.status !== 200) throw new Error(`Expected 200, got ${res.status}`);
    const json = await res.json();
    if (json.gateway !== "api.odcs.in") throw new Error("Incorrect gateway field");
    if (!json.endpoints || !json.endpoints.telemetry_probe) throw new Error("Missing endpoints map");
  });

  // 2. Interactive Docs Explorer
  await test("Docs: Interactive API Explorer (GET https://api.odcs.in/docs)", async () => {
    const req = makeReq("https://api.odcs.in/docs");
    const res = await apiWorker.fetch(req, {}, {});
    if (res.status !== 200) throw new Error(`Expected 200, got ${res.status}`);
    const text = await res.text();
    if (!text.includes("ODCS API GATEWAY")) throw new Error("Missing title in Docs HTML");
  });

  // 3. OpenAPI 3.1.0 Spec
  await test("OpenAPI: Valid 3.1.0 JSON Spec (GET https://api.odcs.in/openapi.json)", async () => {
    const req = makeReq("https://api.odcs.in/openapi.json");
    const res = await apiWorker.fetch(req, {}, {});
    if (res.status !== 200) throw new Error(`Expected 200, got ${res.status}`);
    const spec = await res.json();
    if (spec.openapi !== "3.1.0") throw new Error("Expected OpenAPI 3.1.0");
    if (!spec.paths["/v1/telemetry/probe"]) throw new Error("Missing probe path in OpenAPI spec");
  });

  // 4. Health Check
  await test("Healthz: RFC 5785 Health check (GET https://api.odcs.in/healthz)", async () => {
    const req = makeReq("https://api.odcs.in/healthz");
    const res = await apiWorker.fetch(req, {}, {});
    if (res.status !== 200) throw new Error(`Expected 200, got ${res.status}`);
    const json = await res.json();
    if (json.status !== "healthy") throw new Error("Expected healthy status");
  });

  // 5. Layer 3 Telemetry Probe
  await test("Layer 3: Telemetry Probe (GET https://api.odcs.in/v1/telemetry/probe)", async () => {
    const req = makeReq("https://api.odcs.in/v1/telemetry/probe");
    const res = await apiWorker.fetch(req, {}, {});
    if (res.status !== 200) throw new Error(`Expected 200, got ${res.status}`);
    const json = await res.json();
    if (json.status !== "ONLINE") throw new Error("Expected status ONLINE");
  });

  // 6. Layer 2 CRDT Sync Delta
  await test("Layer 2: CRDT Delta Sync (POST https://api.odcs.in/v1/sync)", async () => {
    const payload = {
      clock: { "field-agent-01": 5 },
      counters: { "network_transactions": { p: { "field-agent-01": 20 }, n: {} } },
      mutations: [{ mutation_id: "tx-field-01" }]
    };
    const req = makeReq("https://api.odcs.in/v1/sync", "POST", payload);
    const res = await apiWorker.fetch(req, {}, {});
    if (res.status !== 200) throw new Error(`Expected 200, got ${res.status}`);
    const json = await res.json();
    if (!json.receipt_hash) throw new Error("Missing receipt hash");
    if (json.converged_counters.network_transactions < 120) throw new Error("Counter did not converge");
  });

  // 7. Layer 4 Zero Intent Loss Minting
  await test("Layer 4: Zero Intent Loss Staging (POST https://api.odcs.in/v1/intent/preserve)", async () => {
    const payload = {
      user: "Lead Architect",
      action: "AnchorContinuityStandard",
      payload: { version: "1.0.0" }
    };
    const req = makeReq("https://api.odcs.in/v1/intent/preserve", "POST", payload);
    const res = await apiWorker.fetch(req, {}, {});
    if (res.status !== 201) throw new Error(`Expected 201, got ${res.status}`);
    const json = await res.json();
    if (!json.receipt_id || !json.staged_proof) throw new Error("Missing receipt fields");
  });

  // 8. Haven 20-OS Downloads Manifest
  await test("Haven: Downloads Catalog (GET https://api.odcs.in/v1/downloads)", async () => {
    const req = makeReq("https://api.odcs.in/v1/downloads");
    const res = await apiWorker.fetch(req, {}, {});
    if (res.status !== 200) throw new Error(`Expected 200, got ${res.status}`);
    const json = await res.json();
    if (json.total_platforms < 10) throw new Error("Expected >= 10 platforms");
  });

  // 9. Host-based Detection in _worker.js
  await test("Unified Host Routing: _worker.js routes api.odcs.in requests seamlessly", async () => {
    const req = makeReq("https://api.odcs.in/openapi.json");
    const res = await pagesWorker.fetch(req, {}, {});
    if (res.status !== 200) throw new Error(`Expected 200, got ${res.status}`);
    const spec = await res.json();
    if (spec.openapi !== "3.1.0") throw new Error("Failed to delegate to api-worker.js");
  });

  // 10. RFC 7807 404 Error handling
  await test("RFC 7807: Problem Details 404 on unknown endpoint", async () => {
    const req = makeReq("https://api.odcs.in/v1/non-existent-endpoint");
    const res = await apiWorker.fetch(req, {}, {});
    if (res.status !== 404) throw new Error(`Expected 404, got ${res.status}`);
    const json = await res.json();
    if (json.type !== "https://api.odcs.in/errors/not-found") throw new Error("Incorrect RFC 7807 type");
  });

  console.log(`\nResults: ${passed} passed, ${failed} failed.`);
  if (failed > 0) process.exit(1);
}

runApiTests();

