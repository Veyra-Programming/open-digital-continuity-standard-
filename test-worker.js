/**
 * Verification Test Suite for ODCS Cloudflare Worker
 * Tests all 4 Layers & Binary Routing in standard Node.js / V8 environment
 */
import worker from "./_worker.js";

async function runTests() {
  console.log("===============================================================");
  console.log("  ODCS Cloudflare Edge Worker - Verification Suite            ");
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

  // Helper to make fake requests
  function makeReq(url, method = "GET", body = null, headers = {}) {
    const init = {
      method,
      headers: new Headers({ "User-Agent": "ODCS-Node-Tester/1.0", ...headers }),
    };
    if (body) {
      init.body = typeof body === "string" ? body : JSON.stringify(body);
      init.headers.set("Content-Type", "application/json");
    }
    const req = new Request(url, init);
    // Mock Cloudflare request.cf properties
    req.cf = {
      colo: "DFW",
      country: "US",
      city: "Dallas",
      asn: 13335,
      httpProtocol: "HTTP/3"
    };
    return req;
  }

  // 1. Layer 3 Telemetry Probe
  await test("Layer 3: Network Telemetry & RTT Probing (/api/telemetry/probe)", async () => {
    const req = makeReq("https://odcs.in/api/telemetry/probe");
    const res = await worker.fetch(req, {}, {});
    if (res.status !== 200) throw new Error(`Expected 200, got ${res.status}`);
    if (res.headers.get("X-ODCS-Standard") !== "ODCS-1.0.0") throw new Error("Missing X-ODCS-Standard header");
    if (res.headers.get("X-ODCS-Edge-Colo") !== "DFW") throw new Error("Missing X-ODCS-Edge-Colo header");
    const json = await res.json();
    if (json.status !== "ONLINE") throw new Error("Expected status ONLINE");
    if (!json.edge || json.edge.colo !== "DFW") throw new Error("Missing edge colo");
  });

  // 2. Layer 3 Zero-Bandwidth Probe
  await test("Layer 3: Zero-Bandwidth RTT Probe 204 No Content (/odcs/probe?zero=1)", async () => {
    const req = makeReq("https://odcs.in/odcs/probe?zero=1");
    const res = await worker.fetch(req, {}, {});
    if (res.status !== 204) throw new Error(`Expected 204, got ${res.status}`);
    if (res.headers.get("X-ODCS-Continuity-Mode") !== "OPTIMAL_ONLINE") throw new Error("Missing continuity header");
  });

  // 3. Layer 2 CRDT Sync & Vector Clock Merge
  await test("Layer 2: Transport CRDT Consensus & Outbox Sync (/api/sync)", async () => {
    const deltaPayload = {
      clock: { "Node-Ambulance": 3 },
      counters: {
        "emergency_plasma": { p: { "Node-Ambulance": 40 }, n: { "Node-Ambulance": 10 } }
      },
      sets: {
        "active_supplies": { add_set: { "TraumaKit-A": ["tag-101"] }, remove_set: [] }
      },
      mutations: [{ mutation_id: "mut-tx-9901" }]
    };
    const req = makeReq("https://odcs.in/api/sync", "POST", deltaPayload);
    const res = await worker.fetch(req, {}, {});
    if (res.status !== 200) throw new Error(`Expected 200, got ${res.status}`);
    const json = await res.json();
    if (!json.acknowledged_mutations.includes("mut-tx-9901")) throw new Error("Mutation not acknowledged");
    if (json.converged_counters.emergency_plasma !== 30) throw new Error(`Expected counter 30, got ${json.converged_counters.emergency_plasma}`);
    if (!json.edge_vector_clock["Node-Ambulance"]) throw new Error("Vector clock not merged");
  });

  // 4. Layer 4 Zero Intent Loss Receipt Staging
  await test("Layer 4: Zero Intent Loss Edge Staging (/api/intent/preserve)", async () => {
    const intentPayload = {
      user: "Dr. Sarah",
      action: "TriagePrescription",
      payload: { patient: "P-882", med: "Atropine", dose: "0.5mg" }
    };
    const req = makeReq("https://odcs.in/api/intent/preserve", "POST", intentPayload);
    const res = await worker.fetch(req, {}, {});
    if (res.status !== 201) throw new Error(`Expected 201, got ${res.status}`);
    const json = await res.json();
    if (json.status !== "sealed_at_edge") throw new Error(`Expected sealed_at_edge, got ${json.status}`);
    if (!json.intent_id.startsWith("intent-edge-")) throw new Error("Invalid intent ID");
    if (!json.payload_digest.startsWith("sha256:")) throw new Error("Missing payload digest");
  });

  // 5. Layer 1 Cryptographic Proof Verification
  await test("Layer 1: Canonical Merkle Proof Verifier (/api/verify)", async () => {
    const testAsset = { id: "TX-1", amount: 500, currency: "USD" };
    // Let's test negative mismatch first
    const reqBad = makeReq("https://odcs.in/api/verify", "POST", { asset: testAsset, expected_digest: "sha256:0000" });
    const resBad = await worker.fetch(reqBad, {}, {});
    if (resBad.status !== 422) throw new Error("Expected 422 on mismatch");

    // Get the computed digest and verify it passes
    const badJson = await resBad.json();
    const goodDigest = badJson.computed_digest;

    const reqGood = makeReq("https://odcs.in/api/verify", "POST", { asset: testAsset, expected_digest: goodDigest });
    const resGood = await worker.fetch(reqGood, {}, {});
    if (resGood.status !== 200) throw new Error("Expected 200 on valid proof");
    const goodJson = await resGood.json();
    if (!goodJson.valid) throw new Error("Expected valid: true");
  });

  // 6. Haven 20-OS Downloads Routing
  await test("Haven Language Binary Router (/download/windows)", async () => {
    const req = makeReq("https://odcs.in/download/windows");
    const res = await worker.fetch(req, {}, {});
    if (res.status !== 302) throw new Error(`Expected 302, got ${res.status}`);
    const loc = res.headers.get("Location");
    if (!loc.includes("Haven-1.0.0-win64-Setup.exe")) throw new Error(`Invalid redirect: ${loc}`);
    if (!res.headers.get("X-Haven-SHA256")) throw new Error("Missing X-Haven-SHA256 checksum header");
  });

  await test("Haven Language Binary Router (/download/linux)", async () => {
    const req = makeReq("https://odcs.in/download/linux");
    const res = await worker.fetch(req, {}, {});
    if (res.status !== 302) throw new Error(`Expected 302, got ${res.status}`);
    const loc = res.headers.get("Location");
    if (!loc.includes(".deb")) throw new Error(`Invalid redirect: ${loc}`);
  });

  // 7. Admin Essays Edge API
  await test("Admin Essays & Publications API (/api/articles)", async () => {
    const req = makeReq("https://odcs.in/api/articles");
    const res = await worker.fetch(req, {}, {});
    if (res.status !== 200) throw new Error(`Expected 200, got ${res.status}`);
    const json = await res.json();
    if (json.author !== "Anirudha Puthraya") throw new Error("Author mismatch");
    if (json.articles.length < 3) throw new Error("Expected at least 3 articles");
  });

  console.log("\n===============================================================");
  console.log(`  Tests Finished: ${passed} passed, ${failed} failed`);
  console.log("===============================================================\n");

  if (failed > 0) process.exit(1);
}

runTests();

