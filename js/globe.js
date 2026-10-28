/**
 * ODCS (Open Digital Continuity Standard) — 3D Rotating Earth Disruption Mesh Engine
 * Realistic 3D Rotating Planet Earth featuring real vector coastlines, 20 real country map boundaries,
 * lat/lon graticules, interactive country telemetry sidebar with search & filters,
 * smooth spherical navigation to countries, LEO satellite constellation with laser tracking,
 * and inertial 3D mouse/touch controls.
 * Pure Vanilla HTML5 Canvas • Zero External Dependencies • 60 FPS
 */

// Accurate Continental Coastlines (Lat, Lon closed polygons)
const ODCS_EARTH_COASTLINES = [
  // North America
  [
    [71, -156], [70, -140], [69, -135], [65, -120], [58, -94], [62, -80], [58, -65],
    [47, -53], [44, -64], [41, -70], [35, -75], [25, -80], [29, -89], [26, -97],
    [21, -97], [16, -93], [14, -88], [9, -78], [8, -82], [14, -92], [19, -104],
    [24, -110], [30, -114], [34, -119], [38, -123], [48, -124], [54, -130],
    [59, -140], [60, -150], [58, -160], [65, -168], [71, -156]
  ],
  // Greenland
  [
    [83, -30], [76, -18], [70, -22], [60, -43], [65, -52], [76, -68], [82, -60], [83, -30]
  ],
  // South America
  [
    [12, -72], [10, -62], [6, -53], [-3, -38], [-8, -35], [-13, -38], [-23, -42],
    [-30, -50], [-35, -57], [-42, -64], [-53, -68], [-55, -66], [-50, -74],
    [-42, -74], [-30, -71], [-18, -70], [-14, -76], [-5, -81], [2, -77], [9, -76], [12, -72]
  ],
  // Europe & Scandinavia
  [
    [36, -6], [43, -9], [44, -2], [48, -4], [50, 2], [54, 8], [58, 6], [62, 5],
    [68, 14], [71, 26], [69, 33], [60, 30], [54, 20], [54, 14], [52, 5], [47, 3],
    [43, 3], [43, 10], [38, 15], [40, 18], [38, 24], [36, 28], [41, 29], [46, 31],
    [46, 38], [42, 42], [36, 36], [37, 22], [36, -6]
  ],
  // British Isles
  [
    [50, -5], [52, 1], [58, -3], [58, -6], [55, -6], [51, -4], [50, -5]
  ],
  // Africa
  [
    [35, -6], [37, 10], [33, 12], [32, 24], [31, 32], [28, 34], [22, 37], [12, 44],
    [12, 51], [2, 45], [-5, 39], [-11, 40], [-17, 38], [-26, 33], [-34, 26],
    [-34, 18], [-28, 15], [-16, 12], [-6, 12], [4, 9], [5, 2], [5, -3], [9, -13],
    [15, -17], [21, -17], [32, -10], [35, -6]
  ],
  // Madagascar
  [
    [-12, 49], [-16, 50], [-25, 47], [-25, 44], [-16, 44], [-12, 49]
  ],
  // Asia & Russia
  [
    [42, 42], [47, 52], [55, 60], [65, 60], [73, 70], [77, 105], [72, 130],
    [70, 160], [66, 170], [60, 165], [58, 160], [52, 143], [43, 132], [38, 128],
    [38, 118], [30, 122], [22, 114], [21, 108], [10, 104], [1, 104], [8, 98],
    [16, 96], [22, 89], [16, 82], [8, 77], [20, 73], [25, 67], [25, 57],
    [15, 53], [13, 44], [28, 34], [35, 36], [42, 42]
  ],
  // India Subcontinent
  [
    [26, 68], [23, 70], [19, 73], [15, 74], [10, 76], [8, 77], [10, 80],
    [16, 82], [21, 87], [22, 89], [25, 87], [26, 80], [26, 68]
  ],
  // Japan
  [
    [45, 142], [43, 145], [35, 140], [33, 130], [35, 134], [40, 140], [45, 142]
  ],
  // Australia
  [
    [-11, 142], [-15, 145], [-24, 153], [-32, 153], [-38, 147], [-38, 140],
    [-35, 136], [-32, 132], [-35, 117], [-34, 115], [-22, 114], [-18, 121],
    [-14, 127], [-14, 136], [-11, 142]
  ],
  // New Zealand
  [
    [-35, 174], [-38, 178], [-42, 174], [-46, 168], [-44, 168], [-38, 175], [-35, 174]
  ],
  // Antarctica
  [
    [-64, -60], [-65, -64], [-70, -70], [-72, -100], [-74, -140], [-78, -170],
    [-84, 170], [-75, 140], [-66, 110], [-66, 90], [-69, 70], [-69, 40],
    [-70, 10], [-70, -20], [-74, -40], [-64, -60]
  ]
];

// Real Countries Geopolitical Boundaries & Telemetry Metadata
const ODCS_COUNTRIES_DATA = [
  {
    id: 'IND',
    name: 'India',
    flag: '🇮🇳',
    region: 'South Asia',
    tier: 'Class E',
    hubCity: 'Mumbai & Bangalore',
    center: [21.5, 78.9],
    ping: '0ms Local WAL • 14ms Consensus',
    walStatus: 'Active (Sovereign IndexedDB / SQLite)',
    crdtState: 'Zero Intent Loss CRDT Mesh',
    nodesCount: 420,
    subseaCables: 20,
    summary: 'Central hub for South Asian disruption-tolerant medical and municipal continuity records.',
    poly: [
      [35, 74], [34, 78], [30, 81], [28, 88], [27, 95], [24, 93], [22, 89],
      [16, 82], [10, 80], [8, 77], [10, 76], [15, 74], [19, 73], [23, 70],
      [26, 68], [30, 70], [33, 74], [35, 74]
    ]
  },
  {
    id: 'USA',
    name: 'United States',
    flag: '🇺🇸',
    region: 'North America',
    tier: 'Class E',
    hubCity: 'San Francisco & New York',
    center: [38.5, -98.0],
    ping: '12ms (Consensus)',
    walStatus: 'Active (UUIDv7 Monotonic Journal)',
    crdtState: 'State-based & Op-based Delta Sync',
    nodesCount: 342,
    subseaCables: 18,
    summary: 'Pioneering cross-cloud edge nodes with multi-master consensus across major metropolitan clusters.',
    poly: [
      [49, -124], [49, -95], [49, -89], [46, -84], [45, -74], [45, -71], [44, -67],
      [41, -70], [35, -75], [25, -80], [29, -89], [26, -97], [29, -103], [31, -111],
      [32, -117], [34, -119], [38, -123], [48, -124], [49, -124]
    ]
  },
  {
    id: 'GBR',
    name: 'United Kingdom',
    flag: '🇬🇧',
    region: 'Europe',
    tier: 'Class E',
    hubCity: 'London',
    center: [55.3, -3.4],
    ping: '8ms (Ultra Low Latency)',
    walStatus: 'Active (Tamper-Evident Merkle Hash)',
    crdtState: 'Multi-Master CRDT Convergence',
    nodesCount: 260,
    subseaCables: 24,
    summary: 'High-density European financial gateway maintaining transactional consistency across fiber cuts.',
    poly: [
      [50, -5], [51, 1], [53, 0], [55, -1], [58, -3], [58, -5], [55, -6],
      [52, -5], [50, -5]
    ]
  },
  {
    id: 'DEU',
    name: 'Germany',
    flag: '🇩🇪',
    region: 'Europe',
    tier: 'Class E',
    hubCity: 'Frankfurt',
    center: [51.1, 10.4],
    ping: '9ms (Core Relay)',
    walStatus: 'Active (ACID Snapshot WAL)',
    crdtState: 'Vector Clock Causality Mesh',
    nodesCount: 290,
    subseaCables: 14,
    summary: 'Industrial Internet & telemetry nodes with rigorous conformance invariants.',
    poly: [
      [47, 8], [48, 7], [49, 6], [51, 6], [53, 7], [55, 9], [54, 14],
      [51, 14], [50, 12], [47, 13], [47, 8]
    ]
  },
  {
    id: 'JPN',
    name: 'Japan',
    flag: '🇯🇵',
    region: 'Asia',
    tier: 'Class E',
    hubCity: 'Tokyo',
    center: [36.2, 138.2],
    ping: '11ms (Disruption Proof)',
    walStatus: 'Active (Earthquake Resilient WAL)',
    crdtState: 'LEO Satellite Store-and-Forward',
    nodesCount: 310,
    subseaCables: 26,
    summary: 'Disaster-hardened municipal infrastructure operating seamlessly through severe terrestrial blackouts.',
    poly: [
      [45, 142], [43, 145], [38, 141], [35, 140], [33, 131], [31, 130],
      [34, 132], [37, 137], [40, 140], [45, 142]
    ]
  },
  {
    id: 'SGP',
    name: 'Singapore',
    flag: '🇸🇬',
    region: 'Southeast Asia',
    tier: 'Class E',
    hubCity: 'Singapore Hub',
    center: [1.35, 103.8],
    ping: '5ms (Subsea Core)',
    walStatus: 'Active (High-Throughput WAL)',
    crdtState: 'Real-Time Vector Sync',
    nodesCount: 195,
    subseaCables: 32,
    summary: 'Ultra-low latency subsea routing node interconnecting Pacific and Indian Ocean digital backbones.',
    poly: [
      [2.5, 101], [1.2, 103], [1.1, 104.5], [2.2, 104], [3.5, 103], [2.5, 101]
    ]
  },
  {
    id: 'AUS',
    name: 'Australia',
    flag: '🇦🇺',
    region: 'Oceania',
    tier: 'Class E',
    hubCity: 'Sydney & Melbourne',
    center: [-25.2, 133.7],
    ping: '18ms (Sovereign)',
    walStatus: 'Active (Airgap Durable WAL)',
    crdtState: 'Transpacific CRDT Delta Replicator',
    nodesCount: 220,
    subseaCables: 15,
    summary: 'Vast rural territory digital continuity with store-and-forward satellite uplink nodes.',
    poly: [
      [-11, 142], [-15, 145], [-24, 153], [-32, 153], [-38, 147], [-38, 140],
      [-35, 136], [-32, 132], [-35, 117], [-34, 115], [-22, 114], [-18, 121],
      [-14, 127], [-14, 136], [-11, 142]
    ]
  },
  {
    id: 'BRA',
    name: 'Brazil',
    flag: '🇧🇷',
    region: 'South America',
    tier: 'Class E',
    hubCity: 'São Paulo',
    center: [-14.2, -51.9],
    ping: '28ms (Consensus)',
    walStatus: 'Active (Encrypted Local WAL)',
    crdtState: 'LWW-Register Vector Clock',
    nodesCount: 146,
    subseaCables: 12,
    summary: 'South American sovereign data anchor providing resilient banking and healthcare outbox queuing.',
    poly: [
      [4, -51], [-3, -38], [-8, -35], [-13, -38], [-23, -42], [-30, -50],
      [-33, -53], [-28, -54], [-22, -58], [-19, -57], [-10, -68], [-4, -70],
      [2, -67], [4, -60], [4, -51]
    ]
  },
  {
    id: 'FRA',
    name: 'France',
    flag: '🇫🇷',
    region: 'Europe',
    tier: 'Class E',
    hubCity: 'Paris',
    center: [46.2, 2.2],
    ping: '10ms (Fiber)',
    walStatus: 'Active (ACID Snapshot WAL)',
    crdtState: 'Deterministic State Replication',
    nodesCount: 215,
    subseaCables: 16,
    summary: 'Western European transportation & logistics node with zero data-loss guarantees.',
    poly: [
      [43, -1], [46, -1], [49, -1], [51, 2], [49, 6], [48, 7], [46, 6],
      [43, 7], [43, 3], [42, 3], [43, -1]
    ]
  },
  {
    id: 'CAN',
    name: 'Canada',
    flag: '🇨🇦',
    region: 'North America',
    tier: 'Class E',
    hubCity: 'Toronto & Vancouver',
    center: [56.1, -106.3],
    ping: '15ms (Optimal)',
    walStatus: 'Active (Local WAL IndexedDB)',
    crdtState: 'Synchronized Merkle DAG',
    nodesCount: 185,
    subseaCables: 8,
    summary: 'Sub-arctic remote community healthcare continuity with automatic opportunistic sync.',
    poly: [
      [49, -124], [54, -130], [59, -140], [69, -140], [70, -130], [68, -115],
      [60, -94], [62, -80], [58, -65], [47, -53], [45, -67], [45, -74],
      [49, -89], [49, -124]
    ]
  },
  {
    id: 'ARE',
    name: 'United Arab Emirates',
    flag: '🇦🇪',
    region: 'Middle East',
    tier: 'Class E',
    hubCity: 'Dubai',
    center: [23.4, 53.8],
    ping: '16ms (Crossroads)',
    walStatus: 'Active (Immutable Journal)',
    crdtState: 'High-Density Consensus Node',
    nodesCount: 160,
    subseaCables: 14,
    summary: 'Strategic digital bridge linking Asia, Europe, and Africa with resilient consensus rings.',
    poly: [
      [24, 52], [26, 56], [24, 56], [23, 55], [22, 53], [24, 52]
    ]
  },
  {
    id: 'ISL',
    name: 'Iceland',
    flag: '🇮🇸',
    region: 'Europe',
    tier: 'Class E',
    hubCity: 'Reykjavik',
    center: [64.9, -19.0],
    ping: '20ms (North Atlantic)',
    walStatus: 'Active (Geothermal DC WAL)',
    crdtState: 'Subsea Arctic Merkle Sync',
    nodesCount: 65,
    subseaCables: 5,
    summary: 'Zero-carbon green energy data shelter serving transatlantic fallback consensus.',
    poly: [
      [66, -24], [66, -14], [64, -13], [63, -18], [64, -23], [66, -24]
    ]
  },
  {
    id: 'NZL',
    name: 'New Zealand',
    flag: '🇳🇿',
    region: 'Oceania',
    tier: 'Class E',
    hubCity: 'Auckland & Wellington',
    center: [-40.9, 174.8],
    ping: '29ms (Southern Pacific)',
    walStatus: 'Active (Island Resilient WAL)',
    crdtState: 'Autonomous Convergence',
    nodesCount: 75,
    subseaCables: 6,
    summary: 'Island continuity model with deep local durability and resilient disaster recovery.',
    poly: [
      [-35, 174], [-38, 178], [-42, 174], [-46, 168], [-44, 168], [-38, 175], [-35, 174]
    ]
  },
  {
    id: 'MEX',
    name: 'Mexico',
    flag: '🇲🇽',
    region: 'North America',
    tier: 'Class S',
    hubCity: 'Mexico City',
    center: [23.6, -102.5],
    ping: '22ms (Normal)',
    walStatus: 'Active (Offline Sovereign)',
    crdtState: 'Store-and-Forward Outbox',
    nodesCount: 94,
    subseaCables: 6,
    summary: 'Central American trade corridor continuity with adaptive low-bandwidth profiles.',
    poly: [
      [32, -117], [31, -111], [29, -103], [26, -97], [21, -97], [18, -91],
      [16, -93], [14, -92], [16, -97], [20, -105], [24, -110], [30, -114], [32, -117]
    ]
  },
  {
    id: 'ARG',
    name: 'Argentina',
    flag: '🇦🇷',
    region: 'South America',
    tier: 'Class S',
    hubCity: 'Buenos Aires',
    center: [-38.4, -63.6],
    ping: '34ms (Adaptive)',
    walStatus: 'Active (Crash Durable)',
    crdtState: 'CRDT Add-Wins ORSet',
    nodesCount: 88,
    subseaCables: 5,
    summary: 'Southern cone digital agriculture & supply chain persistence layer.',
    poly: [
      [-22, -66], [-22, -58], [-28, -54], [-33, -53], [-38, -57], [-45, -65],
      [-54, -68], [-52, -72], [-42, -72], [-31, -70], [-22, -66]
    ]
  },
  {
    id: 'ZAF',
    name: 'South Africa',
    flag: '🇿🇦',
    region: 'Africa',
    tier: 'Class S',
    hubCity: 'Johannesburg & Cape Town',
    center: [-30.5, 25.0],
    ping: '32ms (Relay)',
    walStatus: 'Active (Power-Loss Resilient)',
    crdtState: 'Adaptive Throttled Delta Sync',
    nodesCount: 110,
    subseaCables: 9,
    summary: 'African financial center resilience handling power-loss and brownout events with atomic local journals.',
    poly: [
      [-22, 30], [-27, 32], [-32, 28], [-34, 26], [-34, 18], [-28, 16],
      [-22, 16], [-22, 28], [-22, 30]
    ]
  },
  {
    id: 'CHN',
    name: 'China',
    flag: '🇨🇳',
    region: 'Asia',
    tier: 'Class S',
    hubCity: 'Shanghai & Beijing',
    center: [35.8, 104.1],
    ping: '25ms (Mesh)',
    walStatus: 'Active (Sovereign Outbox)',
    crdtState: 'Multi-Region Sharded CRDT',
    nodesCount: 380,
    subseaCables: 19,
    summary: 'High-volume logistics and railway operational continuity over vast distances.',
    poly: [
      [48, 120], [42, 131], [38, 128], [32, 122], [22, 114], [21, 108],
      [22, 100], [28, 98], [35, 78], [45, 80], [48, 90], [50, 120], [48, 120]
    ]
  },
  {
    id: 'RUS',
    name: 'Russia',
    flag: '🇷🇺',
    region: 'Eurasia',
    tier: 'Class S',
    hubCity: 'Moscow & Vladivostok',
    center: [61.5, 105.3],
    ping: '38ms (Trans-Continental)',
    walStatus: 'Active (Distributed WAL)',
    crdtState: 'Store-and-Forward Vector Clocks',
    nodesCount: 190,
    subseaCables: 7,
    summary: 'Trans-Siberian cold-climate infrastructure with store-and-forward resilience.',
    poly: [
      [68, 30], [72, 70], [74, 110], [70, 160], [66, 170], [60, 165],
      [52, 143], [43, 132], [50, 120], [55, 60], [60, 30], [68, 30]
    ]
  },
  {
    id: 'EGY',
    name: 'Egypt',
    flag: '🇪🇬',
    region: 'North Africa',
    tier: 'Class S',
    hubCity: 'Cairo & Alexandria',
    center: [26.8, 30.8],
    ping: '26ms (Suez Chokepoint)',
    walStatus: 'Active (Offline Resilient)',
    crdtState: 'Red Sea Gateway Sync',
    nodesCount: 82,
    subseaCables: 17,
    summary: 'Maritime and Suez trade chokepoint telemetry resilience.',
    poly: [
      [31, 25], [31, 32], [28, 34], [22, 37], [22, 25], [31, 25]
    ]
  },
  {
    id: 'NGA',
    name: 'Nigeria',
    flag: '🇳🇬',
    region: 'West Africa',
    tier: 'Class S',
    hubCity: 'Lagos',
    center: [9.0, 8.6],
    ping: '36ms (Gulf of Guinea)',
    walStatus: 'Active (Intermittent Network WAL)',
    crdtState: 'Offline-First Queue Replicator',
    nodesCount: 95,
    subseaCables: 8,
    summary: 'Mobile-first fintech operations ensuring zero transaction loss during mobile cellular outages.',
    poly: [
      [14, 3], [14, 14], [5, 9], [4, 6], [6, 3], [14, 3]
    ]
  }
];

// Helper: Point in polygon test
function isPointOnEarthLand(lat, lon) {
  for (let c = 0; c < ODCS_EARTH_COASTLINES.length; c++) {
    const poly = ODCS_EARTH_COASTLINES[c];
    let inside = false;
    for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
      const xi = poly[i][1], yi = poly[i][0];
      const xj = poly[j][1], yj = poly[j][0];
      const intersect = ((yi > lat) !== (yj > lat)) && (lon < (xj - xi) * (lat - yi) / (yj - yi) + xi);
      if (intersect) inside = !inside;
    }
    if (inside) return true;
  }
  return false;
}

class OdcsGlobalSignalsGlobe {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    if (!this.canvas) return;
    this.ctx = this.canvas.getContext('2d');

    // 3D Earth Sphere Geometry
    this.radius = 175;
    this.rotationY = 0.85;
    this.rotationX = 0.22;
    this.targetRotationY = this.rotationY;
    this.targetRotationX = this.rotationX;
    this.autoRotateSpeed = 0.0035;
    this.isDragging = false;
    this.dragVelocityX = 0;
    this.dragVelocityY = 0;
    this.lastMouseX = 0;
    this.lastMouseY = 0;
    this.isNavigatingToCountry = false;

    // Feature toggles
    this.showSatellites = true;
    this.showCountryBorders = true;
    this.activeHoverNode = null;
    this.selectedCountry = ODCS_COUNTRIES_DATA[0]; // Default India
    this.syncPulses = [];

    // 13 Interconnected Hub Cities
    this.cities = [
      { name: 'San Francisco', lat: 37.77, lon: -122.41, tier: 'L1-Node', countryId: 'USA' },
      { name: 'New York', lat: 40.71, lon: -74.00, tier: 'L2-Consensus', countryId: 'USA' },
      { name: 'London', lat: 51.50, lon: -0.12, tier: 'L3-Relay', countryId: 'GBR' },
      { name: 'Frankfurt', lat: 50.11, lon: 8.68, tier: 'L2-Consensus', countryId: 'DEU' },
      { name: 'Mumbai', lat: 19.07, lon: 72.87, tier: 'L1-Node', countryId: 'IND' },
      { name: 'Singapore', lat: 1.35, lon: 103.81, tier: 'L2-Consensus', countryId: 'SGP' },
      { name: 'Tokyo', lat: 35.67, lon: 139.65, tier: 'L3-Relay', countryId: 'JPN' },
      { name: 'Sydney', lat: -33.86, lon: 151.20, tier: 'L1-Node', countryId: 'AUS' },
      { name: 'São Paulo', lat: -23.55, lon: -46.63, tier: 'L1-Node', countryId: 'BRA' },
      { name: 'Johannesburg', lat: -26.20, lon: 28.04, tier: 'L1-Node', countryId: 'ZAF' },
      { name: 'Dubai', lat: 25.20, lon: 55.27, tier: 'L2-Consensus', countryId: 'ARE' },
      { name: 'Reykjavik', lat: 64.14, lon: -21.94, tier: 'L3-Relay', countryId: 'ISL' },
      { name: 'Honolulu', lat: 21.30, lon: -157.85, tier: 'L3-Satellite', countryId: 'USA' }
    ];

    // Inter-Continental Geodesic Mesh Links
    this.links = [
      { from: 0, to: 1 },  // SF -> NY
      { from: 1, to: 2 },  // NY -> London
      { from: 2, to: 3 },  // London -> Frankfurt
      { from: 3, to: 10 }, // Frankfurt -> Dubai
      { from: 10, to: 4 }, // Dubai -> Mumbai
      { from: 4, to: 5 },  // Mumbai -> Singapore
      { from: 5, to: 6 },  // Singapore -> Tokyo
      { from: 6, to: 7 },  // Tokyo -> Sydney
      { from: 0, to: 6 },  // SF -> Tokyo (Transpacific)
      { from: 1, to: 8 },  // NY -> São Paulo
      { from: 2, to: 9 },  // London -> Johannesburg
      { from: 0, to: 12 }, // SF -> Honolulu
      { from: 12, to: 6 }, // Honolulu -> Tokyo
      { from: 2, to: 11 }, // London -> Reykjavik
      { from: 4, to: 7 },  // Mumbai -> Sydney
      { from: 8, to: 9 }   // São Paulo -> Johannesburg
    ];

    // High-Speed Animated CRDT Photons
    this.packets = this.links.map((link, idx) => ({
      linkIndex: idx,
      progress: (idx * 0.14) % 1.0,
      speed: 0.0075 + (idx % 4) * 0.0025,
      color: idx % 3 === 0 ? '#00f0ff' : (idx % 3 === 1 ? '#00ffaa' : '#38bdf8'),
      size: 2.8 + (idx % 2) * 0.8
    }));

    // Orbiting Satellite Constellation (LEO Relays)
    this.satellites = [
      { name: 'ODCS-SAT-1', angle: 0.4, speed: 0.006, inclination: 0.72, alt: 36, color: '#00f0ff' },
      { name: 'ODCS-SAT-2', angle: 2.6, speed: 0.0055, inclination: -0.68, alt: 42, color: '#00ffaa' },
      { name: 'ODCS-SAT-3', angle: 4.8, speed: 0.0068, inclination: 0.85, alt: 38, color: '#38bdf8' }
    ];

    // Generate Earth Continental Matrix Points
    this.landDots = this.generateEarthLandDots();

    // DOM Elements
    this.tooltip = document.getElementById('globe-node-tooltip');
    this.beaconHUD = document.getElementById('globe-country-beacon');

    this.initCanvasSize();
    this.bindEvents();
    this.bindControls();
    this.initSidebarUI();
    this.startLoop();

    // Focus on initial country
    setTimeout(() => this.focusOnCountry(this.selectedCountry), 800);
  }

  generateEarthLandDots() {
    const dots = [];
    const stepLat = 4.2;
    const stepLon = 4.8;
    for (let lat = -72; lat <= 76; lat += stepLat) {
      for (let lon = -180; lon <= 180; lon += stepLon) {
        if (isPointOnEarthLand(lat, lon)) {
          dots.push({ lat, lon });
        }
      }
    }
    return dots;
  }

  initCanvasSize() {
    const handleResize = () => {
      const parent = this.canvas.parentElement;
      const dpr = window.devicePixelRatio || 1;
      this.width = parent.offsetWidth;
      this.height = Math.min(parent.offsetWidth, 480);

      this.canvas.width = this.width * dpr;
      this.canvas.height = this.height * dpr;
      this.canvas.style.width = `${this.width}px`;
      this.canvas.style.height = `${this.height}px`;

      this.ctx.setTransform(1, 0, 0, 1, 0, 0);
      this.ctx.scale(dpr, dpr);
      this.centerX = this.width / 2;
      this.centerY = this.height / 2;
      this.radius = Math.min(this.width, this.height) * 0.36;
    };

    handleResize();
    window.addEventListener('resize', handleResize);
  }

  bindEvents() {
    let clickStartX = 0;
    let clickStartY = 0;

    this.canvas.addEventListener('mousedown', (e) => {
      this.isDragging = true;
      this.isNavigatingToCountry = false;
      this.lastMouseX = e.clientX;
      this.lastMouseY = e.clientY;
      clickStartX = e.clientX;
      clickStartY = e.clientY;
      this.dragVelocityX = 0;
      this.dragVelocityY = 0;
    });

    window.addEventListener('mousemove', (e) => {
      const rect = this.canvas.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;

      if (this.isDragging) {
        const dx = e.clientX - this.lastMouseX;
        const dy = e.clientY - this.lastMouseY;
        this.dragVelocityX = dx * 0.005;
        this.dragVelocityY = dy * 0.005;
        this.rotationY += this.dragVelocityX;
        this.rotationX += this.dragVelocityY;
        this.rotationX = Math.max(-1.15, Math.min(1.15, this.rotationX));
        this.lastMouseX = e.clientX;
        this.lastMouseY = e.clientY;
      } else {
        this.checkHover(mouseX, mouseY);
      }
    });

    window.addEventListener('mouseup', (e) => {
      if (this.isDragging) {
        this.isDragging = false;
        // Check if it was a click (not a drag)
        const moveDist = Math.hypot(e.clientX - clickStartX, e.clientY - clickStartY);
        if (moveDist < 6) {
          const rect = this.canvas.getBoundingClientRect();
          const mouseX = e.clientX - rect.left;
          const mouseY = e.clientY - rect.top;
          this.handleClickOnEarth(mouseX, mouseY);
        }
      }
    });

    // Touch support for mobile devices
    this.canvas.addEventListener('touchstart', (e) => {
      if (e.touches.length === 1) {
        this.isDragging = true;
        this.isNavigatingToCountry = false;
        this.lastMouseX = e.touches[0].clientX;
        this.lastMouseY = e.touches[0].clientY;
        clickStartX = e.touches[0].clientX;
        clickStartY = e.touches[0].clientY;
        this.dragVelocityX = 0;
        this.dragVelocityY = 0;
      }
    }, { passive: true });

    window.addEventListener('touchmove', (e) => {
      if (!this.isDragging || e.touches.length !== 1) return;
      const dx = e.touches[0].clientX - this.lastMouseX;
      const dy = e.touches[0].clientY - this.lastMouseY;
      this.dragVelocityX = dx * 0.006;
      this.dragVelocityY = dy * 0.006;
      this.rotationY += this.dragVelocityX;
      this.rotationX += this.dragVelocityY;
      this.rotationX = Math.max(-1.15, Math.min(1.15, this.rotationX));
      this.lastMouseX = e.touches[0].clientX;
      this.lastMouseY = e.touches[0].clientY;
    }, { passive: true });

    window.addEventListener('touchend', (e) => {
      if (this.isDragging) {
        this.isDragging = false;
        if (e.changedTouches && e.changedTouches.length === 1) {
          const moveDist = Math.hypot(e.changedTouches[0].clientX - clickStartX, e.changedTouches[0].clientY - clickStartY);
          if (moveDist < 8) {
            const rect = this.canvas.getBoundingClientRect();
            const mouseX = e.changedTouches[0].clientX - rect.left;
            const mouseY = e.changedTouches[0].clientY - rect.top;
            this.handleClickOnEarth(mouseX, mouseY);
          }
        }
      }
    });

    this.canvas.addEventListener('mouseleave', () => {
      this.isDragging = false;
      this.activeHoverNode = null;
      if (this.tooltip) this.tooltip.classList.remove('visible');
    });
  }

  handleClickOnEarth(mouseX, mouseY) {
    let closestCountry = null;
    let minD = 35;

    for (const c of ODCS_COUNTRIES_DATA) {
      const p = this.project(c.center[0], c.center[1], 2);
      if (p.visible && p.z > 0) {
        const d = Math.hypot(mouseX - p.x, mouseY - p.y);
        if (d < minD) {
          minD = d;
          closestCountry = c;
        }
      }
    }

    if (closestCountry) {
      this.focusOnCountry(closestCountry);
    }
  }

  bindControls() {
    // Action: Sync Pulse
    const btnPulse = document.getElementById('btn-globe-pulse');
    if (btnPulse) {
      btnPulse.addEventListener('click', () => {
        if (this.selectedCountry) {
          this.triggerSyncPulse(this.selectedCountry.center[0], this.selectedCountry.center[1]);
        } else {
          this.triggerSyncPulse(19.07, 72.87);
        }
        btnPulse.classList.add('active');
        setTimeout(() => btnPulse.classList.remove('active'), 1200);
      });
    }

    // Action: Satellites toggle
    const btnSat = document.getElementById('btn-globe-satellites');
    if (btnSat) {
      btnSat.addEventListener('click', () => {
        this.showSatellites = !this.showSatellites;
        btnSat.classList.toggle('active', this.showSatellites);
      });
    }

    // Action: Country borders toggle
    const btnBorders = document.getElementById('btn-globe-borders');
    if (btnBorders) {
      btnBorders.addEventListener('click', () => {
        this.showCountryBorders = !this.showCountryBorders;
        btnBorders.classList.toggle('active', this.showCountryBorders);
      });
    }

    // Action: Reset view
    const btnReset = document.getElementById('btn-globe-reset');
    if (btnReset) {
      btnReset.addEventListener('click', () => {
        this.rotationY = 0.85;
        this.rotationX = 0.22;
        this.dragVelocityX = 0;
        this.dragVelocityY = 0;
        this.isNavigatingToCountry = false;
      });
    }

    // Action: Sidebar Toggle Button (expand / collapse sidebar)
    const btnToggleSidebar = document.getElementById('btn-toggle-sidebar');
    const commandStation = document.getElementById('globe-command-station');
    if (btnToggleSidebar && commandStation) {
      btnToggleSidebar.addEventListener('click', () => {
        const isCollapsed = commandStation.classList.toggle('sidebar-collapsed');
        const textEl = document.getElementById('sidebar-toggle-text');
        if (textEl) {
          textEl.textContent = isCollapsed ? 'Show Sidebar' : 'Sidebar';
        }
        // Force canvas resize to fill new layout width smoothly
        setTimeout(() => window.dispatchEvent(new Event('resize')), 50);
      });
    }
  }

  // Smoothly center and focus Earth on a target country
  focusOnCountry(country) {
    if (!country) return;
    this.selectedCountry = country;

    // Mathematical target rotation to center country in camera view
    let targetY = -(country.center[1] * Math.PI / 180) - Math.PI / 2;
    let targetX = (country.center[0] * Math.PI / 180);

    // Normalize targetY to minimal angle delta
    const diff = (targetY - this.rotationY) % (Math.PI * 2);
    targetY = this.rotationY + (diff > Math.PI ? diff - Math.PI * 2 : (diff < -Math.PI ? diff + Math.PI * 2 : diff));

    this.targetRotationY = targetY;
    this.targetRotationX = Math.max(-1.15, Math.min(1.15, targetX));
    this.isNavigatingToCountry = true;
    this.dragVelocityX = 0;
    this.dragVelocityY = 0;

    // Trigger local sync pulse wave
    this.triggerSyncPulse(country.center[0], country.center[1]);

    // Update UI
    this.renderActiveCountryDossier(country);
    this.highlightDirectoryItem(country.id);
  }

  triggerSyncPulse(lat, lon) {
    this.syncPulses.push({
      lat,
      lon,
      radius: 0,
      maxRadius: 85,
      alpha: 1.0,
      color: '#00ffaa'
    });
  }

  checkHover(mouseX, mouseY) {
    let hovered = null;
    let minDistance = 20;

    // Check hub nodes
    for (const city of this.cities) {
      const p = this.project(city.lat, city.lon, 4);
      if (p.visible && p.z > 0) {
        const dx = mouseX - p.x;
        const dy = mouseY - p.y;
        const dist = Math.hypot(dx, dy);
        if (dist < minDistance) {
          minDistance = dist;
          hovered = { city, p };
        }
      }
    }

    this.activeHoverNode = hovered;

    if (this.tooltip && hovered) {
      this.tooltip.classList.add('visible');
      this.tooltip.style.left = `${hovered.p.x + 14}px`;
      this.tooltip.style.top = `${hovered.p.y - 20}px`;
      const nameEl = document.getElementById('tooltip-node-name');
      const tierEl = document.getElementById('tooltip-node-tier');
      const statEl = document.getElementById('tooltip-node-stat');
      if (nameEl) nameEl.textContent = `${hovered.city.name} (${hovered.city.countryId})`;
      if (tierEl) tierEl.textContent = `${hovered.city.tier} • Disruption Tolerant`;
      if (statEl) statEl.textContent = `Local WAL: 0ms • Intent Preserved`;
    } else if (this.tooltip && !hovered) {
      this.tooltip.classList.remove('visible');
    }
  }

  // 3D Spherical to Cartesian with Rotation & Perspective Projection
  project(lat, lon, altitude = 0) {
    const phi = (90 - lat) * (Math.PI / 180);
    const theta = (lon + 180) * (Math.PI / 180);
    const r = this.radius + altitude;

    const x0 = -(r * Math.sin(phi) * Math.cos(theta));
    const z0 = r * Math.sin(phi) * Math.sin(theta);
    const y0 = r * Math.cos(phi);

    // Rotate around Y-axis (Azimuth)
    const x1 = x0 * Math.cos(this.rotationY) + z0 * Math.sin(this.rotationY);
    const z1 = -x0 * Math.sin(this.rotationY) + z0 * Math.cos(this.rotationY);

    // Rotate around X-axis (Pitch)
    const y2 = y0 * Math.cos(this.rotationX) - z1 * Math.sin(this.rotationX);
    const z2 = y0 * Math.sin(this.rotationX) + z1 * Math.cos(this.rotationX);

    const fov = 520;
    const scale = fov / (fov + z2);
    const px = this.centerX + x1 * scale;
    const py = this.centerY + y2 * scale;

    return {
      x: px,
      y: py,
      z: z2,
      visible: z2 > -this.radius * 0.15,
      scale
    };
  }

  startLoop() {
    const render = () => {
      // Smooth spherical interpolation towards target country
      if (this.isNavigatingToCountry) {
        this.rotationY += (this.targetRotationY - this.rotationY) * 0.08;
        this.rotationX += (this.targetRotationX - this.rotationX) * 0.08;

        if (Math.abs(this.targetRotationY - this.rotationY) < 0.001 &&
            Math.abs(this.targetRotationX - this.rotationX) < 0.001) {
          this.isNavigatingToCountry = false;
        }
      } else if (!this.isDragging) {
        // Inertia or slow auto-rotation
        if (Math.abs(this.dragVelocityX) > 0.0001) {
          this.rotationY += this.dragVelocityX;
          this.dragVelocityX *= 0.94;
        } else {
          this.rotationY += this.autoRotateSpeed;
        }

        if (Math.abs(this.dragVelocityY) > 0.0001) {
          this.rotationX += this.dragVelocityY;
          this.rotationX = Math.max(-1.15, Math.min(1.15, this.rotationX));
          this.dragVelocityY *= 0.94;
        }
      }

      this.ctx.clearRect(0, 0, this.width, this.height);

      // 1. Draw Deep Space Celestial Atmosphere & Fresnel Halo
      this.drawAtmosphere();

      // 2. Draw 3D Earth Oceanic Sphere Backdrop with Specular Highlight
      this.drawEarthOceanBase();

      // 3. Draw Earth Latitude & Longitude Graticules
      this.drawGraticuleMesh();

      // 4. Draw Continental Outlines (True Earth Coastlines)
      this.drawEarthCoastlines();

      // 5. Draw Dotted Land Matrix (Glowing Continents)
      this.drawEarthLandDots();

      // 6. Draw Real Country Boundaries (Geopolitical Vector Maps)
      if (this.showCountryBorders) {
        this.drawCountryBorders();
      }

      // 7. Draw Expanding CRDT Convergence Waves
      this.drawSyncPulses();

      // 8. Draw Geodesic Disruption-Tolerant Communication Arcs
      this.drawSignalArcs();

      // 9. Draw Moving CRDT Data Packet Photons
      this.drawPhotonPackets();

      // 10. Draw Orbiting Satellite Constellation (LEO Relays)
      if (this.showSatellites) {
        this.drawSatellites();
      }

      // 11. Draw Global Hub Nodes & Beacons
      this.drawHubNodes();

      // 12. Update Floating Selected Country Beacon HUD
      this.updateCountryBeaconHUD();

      requestAnimationFrame(render);
    };

    render();
  }

  drawAtmosphere() {
    const outerHalo = this.ctx.createRadialGradient(
      this.centerX, this.centerY, this.radius * 0.75,
      this.centerX, this.centerY, this.radius * 1.32
    );
    outerHalo.addColorStop(0, 'rgba(0, 240, 255, 0.08)');
    outerHalo.addColorStop(0.5, 'rgba(0, 119, 254, 0.04)');
    outerHalo.addColorStop(1, 'transparent');

    this.ctx.fillStyle = outerHalo;
    this.ctx.beginPath();
    this.ctx.arc(this.centerX, this.centerY, this.radius * 1.32, 0, Math.PI * 2);
    this.ctx.fill();

    // Equatorial Planetary Rim Sheen
    const rimGrad = this.ctx.createRadialGradient(
      this.centerX - this.radius * 0.28, this.centerY - this.radius * 0.28, this.radius * 0.4,
      this.centerX, this.centerY, this.radius
    );
    rimGrad.addColorStop(0, 'rgba(0, 240, 255, 0.03)');
    rimGrad.addColorStop(0.85, 'rgba(0, 119, 254, 0.08)');
    rimGrad.addColorStop(1, 'rgba(0, 240, 255, 0.22)');

    this.ctx.fillStyle = rimGrad;
    this.ctx.beginPath();
    this.ctx.arc(this.centerX, this.centerY, this.radius, 0, Math.PI * 2);
    this.ctx.fill();
  }

  drawEarthOceanBase() {
    const oceanGrad = this.ctx.createRadialGradient(
      this.centerX - this.radius * 0.35, this.centerY - this.radius * 0.35, this.radius * 0.1,
      this.centerX, this.centerY, this.radius
    );
    oceanGrad.addColorStop(0, '#0a1628');
    oceanGrad.addColorStop(0.7, '#050c18');
    oceanGrad.addColorStop(1, '#02060e');

    this.ctx.fillStyle = oceanGrad;
    this.ctx.beginPath();
    this.ctx.arc(this.centerX, this.centerY, this.radius, 0, Math.PI * 2);
    this.ctx.fill();

    // Outer horizon border ring
    this.ctx.strokeStyle = 'rgba(0, 240, 255, 0.35)';
    this.ctx.lineWidth = 1.4;
    this.ctx.stroke();
  }

  drawGraticuleMesh() {
    this.ctx.save();
    this.ctx.beginPath();
    this.ctx.arc(this.centerX, this.centerY, this.radius, 0, Math.PI * 2);
    this.ctx.clip();

    const latitudes = [-60, -30, 0, 30, 60];
    for (const lat of latitudes) {
      this.ctx.beginPath();
      let first = true;
      for (let lon = -180; lon <= 180; lon += 6) {
        const p = this.project(lat, lon);
        if (p.z > 0) {
          if (first) { this.ctx.moveTo(p.x, p.y); first = false; }
          else { this.ctx.lineTo(p.x, p.y); }
        } else {
          first = true;
        }
      }
      this.ctx.strokeStyle = lat === 0 ? 'rgba(0, 240, 255, 0.25)' : 'rgba(0, 119, 254, 0.12)';
      this.ctx.lineWidth = lat === 0 ? 1.2 : 0.75;
      this.ctx.stroke();
    }

    for (let lon = -180; lon < 180; lon += 30) {
      this.ctx.beginPath();
      let first = true;
      for (let lat = -80; lat <= 80; lat += 5) {
        const p = this.project(lat, lon);
        if (p.z > 0) {
          if (first) { this.ctx.moveTo(p.x, p.y); first = false; }
          else { this.ctx.lineTo(p.x, p.y); }
        } else {
          first = true;
        }
      }
      this.ctx.strokeStyle = 'rgba(0, 119, 254, 0.1)';
      this.ctx.lineWidth = 0.75;
      this.ctx.stroke();
    }

    this.ctx.restore();
  }

  drawEarthCoastlines() {
    this.ctx.save();
    this.ctx.beginPath();
    this.ctx.arc(this.centerX, this.centerY, this.radius, 0, Math.PI * 2);
    this.ctx.clip();

    for (const poly of ODCS_EARTH_COASTLINES) {
      let isDrawing = false;
      this.ctx.beginPath();

      for (let i = 0; i < poly.length; i++) {
        const p = this.project(poly[i][0], poly[i][1], 1);
        if (p.z > 0) {
          if (!isDrawing) {
            this.ctx.moveTo(p.x, p.y);
            isDrawing = true;
          } else {
            this.ctx.lineTo(p.x, p.y);
          }
        } else {
          isDrawing = false;
        }
      }

      this.ctx.strokeStyle = 'rgba(0, 240, 255, 0.45)';
      this.ctx.lineWidth = 1.3;
      this.ctx.stroke();
    }

    this.ctx.restore();
  }

  drawEarthLandDots() {
    this.ctx.save();
    this.ctx.beginPath();
    this.ctx.arc(this.centerX, this.centerY, this.radius, 0, Math.PI * 2);
    this.ctx.clip();

    for (let i = 0; i < this.landDots.length; i++) {
      const dot = this.landDots[i];
      const p = this.project(dot.lat, dot.lon, 0.8);

      if (p.z > 0) {
        const alpha = (p.z / this.radius) * 0.7;
        this.ctx.fillStyle = `rgba(0, 255, 170, ${Math.max(0.08, alpha)})`;
        this.ctx.beginPath();
        this.ctx.arc(p.x, p.y, 1.25 * p.scale, 0, Math.PI * 2);
        this.ctx.fill();
      }
    }

    this.ctx.restore();
  }

  // Draw Real Country Map Boundaries with Glowing Selected Country Highlight
  drawCountryBorders() {
    this.ctx.save();
    this.ctx.beginPath();
    this.ctx.arc(this.centerX, this.centerY, this.radius, 0, Math.PI * 2);
    this.ctx.clip();

    for (const country of ODCS_COUNTRIES_DATA) {
      const isSelected = this.selectedCountry && this.selectedCountry.id === country.id;
      const poly = country.poly;
      if (!poly || !poly.length) continue;

      let isDrawing = false;
      this.ctx.beginPath();

      for (let i = 0; i < poly.length; i++) {
        const p = this.project(poly[i][0], poly[i][1], 1.2);
        if (p.z > 0) {
          if (!isDrawing) {
            this.ctx.moveTo(p.x, p.y);
            isDrawing = true;
          } else {
            this.ctx.lineTo(p.x, p.y);
          }
        } else {
          isDrawing = false;
        }
      }

      if (isSelected) {
        // High-Intensity Neon Glow Border for Selected Country
        this.ctx.strokeStyle = '#00f0ff';
        this.ctx.lineWidth = 2.4;
        this.ctx.shadowBlur = 14;
        this.ctx.shadowColor = '#00f0ff';
        this.ctx.stroke();
        this.ctx.shadowBlur = 0;

        // Subtle glowing fill
        this.ctx.fillStyle = 'rgba(0, 240, 255, 0.12)';
        this.ctx.fill();
      } else {
        // Standard Geopolitical Country Border
        this.ctx.strokeStyle = country.tier === 'Class E' ? 'rgba(0, 255, 170, 0.35)' : 'rgba(0, 240, 255, 0.25)';
        this.ctx.lineWidth = 1.1;
        this.ctx.stroke();
      }

      // Draw Country Centroid Beacon
      const cp = this.project(country.center[0], country.center[1], 2);
      if (cp.z > this.radius * 0.1) {
        if (isSelected) {
          // Animated Concentric Reticle
          const pulse = 1 + Math.sin(Date.now() * 0.006) * 0.3;
          this.ctx.beginPath();
          this.ctx.arc(cp.x, cp.y, 9 * cp.scale * pulse, 0, Math.PI * 2);
          this.ctx.strokeStyle = '#00f0ff';
          this.ctx.lineWidth = 1.5;
          this.ctx.stroke();

          this.ctx.beginPath();
          this.ctx.arc(cp.x, cp.y, 3.5 * cp.scale, 0, Math.PI * 2);
          this.ctx.fillStyle = '#00ffaa';
          this.ctx.fill();

          // Country Label with Flag
          this.ctx.fillStyle = '#ffffff';
          this.ctx.font = '700 11px Inter, sans-serif';
          this.ctx.fillText(`${country.flag} ${country.name}`, cp.x + 12, cp.y + 4);
        } else if (cp.z > this.radius * 0.45) {
          // Minor dot
          this.ctx.beginPath();
          this.ctx.arc(cp.x, cp.y, 2 * cp.scale, 0, Math.PI * 2);
          this.ctx.fillStyle = 'rgba(0, 240, 255, 0.6)';
          this.ctx.fill();
        }
      }
    }

    this.ctx.restore();
  }

  drawSyncPulses() {
    for (let i = this.syncPulses.length - 1; i >= 0; i--) {
      const pulse = this.syncPulses[i];
      pulse.radius += 1.8;
      pulse.alpha = 1 - (pulse.radius / pulse.maxRadius);

      if (pulse.alpha <= 0) {
        this.syncPulses.splice(i, 1);
        continue;
      }

      const center = this.project(pulse.lat, pulse.lon, 2);
      if (center.z > 0) {
        this.ctx.save();
        this.ctx.beginPath();
        this.ctx.arc(this.centerX, this.centerY, this.radius, 0, Math.PI * 2);
        this.ctx.clip();

        this.ctx.beginPath();
        this.ctx.arc(center.x, center.y, pulse.radius * center.scale, 0, Math.PI * 2);
        this.ctx.strokeStyle = `rgba(0, 255, 170, ${pulse.alpha * 0.8})`;
        this.ctx.lineWidth = 2.4;
        this.ctx.shadowBlur = 14;
        this.ctx.shadowColor = '#00ffaa';
        this.ctx.stroke();
        this.ctx.restore();
      }
    }
  }

  drawSignalArcs() {
    for (const link of this.links) {
      const c1 = this.cities[link.from];
      const c2 = this.cities[link.to];

      const steps = 30;
      let prev = null;

      for (let i = 0; i <= steps; i++) {
        const t = i / steps;
        const lat = c1.lat + (c2.lat - c1.lat) * t;
        const lon = c1.lon + (c2.lon - c1.lon) * t;
        const alt = Math.sin(t * Math.PI) * 40;
        const p = this.project(lat, lon, alt);

        if (prev && (prev.z > 0 || p.z > 0)) {
          const depthAlpha = Math.max(0.12, (p.z + this.radius) / (this.radius * 2));
          this.ctx.beginPath();
          this.ctx.moveTo(prev.x, prev.y);
          this.ctx.lineTo(p.x, p.y);
          this.ctx.strokeStyle = `rgba(0, 150, 255, ${depthAlpha * 0.55})`;
          this.ctx.lineWidth = 1.35;
          this.ctx.stroke();
        }
        prev = p;
      }
    }
  }

  drawPhotonPackets() {
    for (const pkt of this.packets) {
      pkt.progress += pkt.speed;
      if (pkt.progress >= 1.0) pkt.progress = 0;

      const link = this.links[pkt.linkIndex];
      const c1 = this.cities[link.from];
      const c2 = this.cities[link.to];

      const t = pkt.progress;
      const lat = c1.lat + (c2.lat - c1.lat) * t;
      const lon = c1.lon + (c2.lon - c1.lon) * t;
      const alt = Math.sin(t * Math.PI) * 40;

      const p = this.project(lat, lon, alt);

      if (p.z > -this.radius * 0.25) {
        this.ctx.beginPath();
        this.ctx.arc(p.x, p.y, pkt.size * p.scale, 0, Math.PI * 2);
        this.ctx.fillStyle = pkt.color;
        this.ctx.shadowBlur = 14;
        this.ctx.shadowColor = pkt.color;
        this.ctx.fill();
        this.ctx.shadowBlur = 0;

        const tPrev = Math.max(0, t - 0.05);
        const pPrev = this.project(
          c1.lat + (c2.lat - c1.lat) * tPrev,
          c1.lon + (c2.lon - c1.lon) * tPrev,
          Math.sin(tPrev * Math.PI) * 40
        );

        this.ctx.beginPath();
        this.ctx.moveTo(pPrev.x, pPrev.y);
        this.ctx.lineTo(p.x, p.y);
        this.ctx.strokeStyle = pkt.color;
        this.ctx.lineWidth = 2.4 * p.scale;
        this.ctx.stroke();
      }
    }
  }

  drawSatellites() {
    for (const sat of this.satellites) {
      sat.angle += sat.speed;
      if (sat.angle > Math.PI * 2) sat.angle -= Math.PI * 2;

      const orbitalRadius = this.radius + sat.alt;
      const x0 = orbitalRadius * Math.cos(sat.angle);
      const y0 = orbitalRadius * Math.sin(sat.angle) * Math.sin(sat.inclination);
      const z0 = orbitalRadius * Math.sin(sat.angle) * Math.cos(sat.inclination);

      const x1 = x0 * Math.cos(this.rotationY) + z0 * Math.sin(this.rotationY);
      const z1 = -x0 * Math.sin(this.rotationY) + z0 * Math.cos(this.rotationY);

      const y2 = y0 * Math.cos(this.rotationX) - z1 * Math.sin(this.rotationX);
      const z2 = y0 * Math.sin(this.rotationX) + z1 * Math.cos(this.rotationX);

      const scale = 520 / (520 + z2);
      const sx = this.centerX + x1 * scale;
      const sy = this.centerY + y2 * scale;

      if (z2 > -this.radius * 0.3) {
        let nearestCity = null;
        let minD = 99999;
        for (const city of this.cities) {
          const cp = this.project(city.lat, city.lon, 2);
          if (cp.z > 0) {
            const d = Math.hypot(sx - cp.x, sy - cp.y);
            if (d < minD) {
              minD = d;
              nearestCity = cp;
            }
          }
        }

        if (nearestCity && minD < 160) {
          this.ctx.beginPath();
          this.ctx.moveTo(sx, sy);
          this.ctx.lineTo(nearestCity.x, nearestCity.y);
          this.ctx.strokeStyle = `rgba(0, 240, 255, 0.28)`;
          this.ctx.setLineDash([3, 4]);
          this.ctx.lineWidth = 1.1;
          this.ctx.stroke();
          this.ctx.setLineDash([]);
        }

        this.ctx.save();
        this.ctx.translate(sx, sy);
        this.ctx.rotate(sat.angle + 0.5);

        this.ctx.fillStyle = '#0077fe';
        this.ctx.fillRect(-7 * scale, -2 * scale, 14 * scale, 4 * scale);

        this.ctx.beginPath();
        this.ctx.arc(0, 0, 3.5 * scale, 0, Math.PI * 2);
        this.ctx.fillStyle = sat.color;
        this.ctx.shadowBlur = 10;
        this.ctx.shadowColor = sat.color;
        this.ctx.fill();
        this.ctx.restore();
      }
    }
  }

  drawHubNodes() {
    for (const city of this.cities) {
      const p = this.project(city.lat, city.lon, 3);

      if (p.visible && p.z > -this.radius * 0.1) {
        const depthAlpha = Math.max(0.15, (p.z + this.radius) / (this.radius * 2));
        const isHovered = this.activeHoverNode && this.activeHoverNode.city === city;

        const pulse = 1 + Math.sin(Date.now() * 0.005 + city.lat) * 0.25;
        this.ctx.beginPath();
        this.ctx.arc(p.x, p.y, (isHovered ? 8 : 5.5) * p.scale * pulse, 0, Math.PI * 2);
        this.ctx.strokeStyle = isHovered
          ? 'rgba(0, 255, 170, 0.95)'
          : `rgba(0, 240, 255, ${depthAlpha * 0.8})`;
        this.ctx.lineWidth = isHovered ? 2.2 : 1.2;
        this.ctx.stroke();

        this.ctx.beginPath();
        this.ctx.arc(p.x, p.y, (isHovered ? 4.2 : 3.0) * p.scale, 0, Math.PI * 2);
        const nodeColor = isHovered
          ? '#00ffaa'
          : (city.tier === 'L2-Consensus' ? '#00ffaa' : '#00f0ff');
        this.ctx.fillStyle = nodeColor;
        this.ctx.shadowBlur = isHovered ? 18 : 10;
        this.ctx.shadowColor = nodeColor;
        this.ctx.fill();
        this.ctx.shadowBlur = 0;

        if (p.z > this.radius * 0.3 || isHovered) {
          this.ctx.fillStyle = isHovered ? '#00f0ff' : `rgba(255, 255, 255, ${depthAlpha * 0.95})`;
          this.ctx.font = isHovered ? '700 11px Inter, sans-serif' : '500 9.5px Inter, sans-serif';
          this.ctx.fillText(city.name, p.x + 8, p.y + 3);
        }
      }
    }
  }

  updateCountryBeaconHUD() {
    if (!this.beaconHUD || !this.selectedCountry) return;
    const cp = this.project(this.selectedCountry.center[0], this.selectedCountry.center[1], 15);

    if (cp.z > 0) {
      this.beaconHUD.style.display = 'flex';
      this.beaconHUD.style.left = `${cp.x}px`;
      this.beaconHUD.style.top = `${cp.y - 28}px`;
      const flagEl = document.getElementById('beacon-flag');
      const nameEl = document.getElementById('beacon-name');
      if (flagEl) flagEl.textContent = this.selectedCountry.flag;
      if (nameEl) nameEl.textContent = this.selectedCountry.name;
    } else {
      this.beaconHUD.style.display = 'none';
    }
  }

  // =========================================================================
  // Mission-Control Country Telemetry Sidebar Controller
  // =========================================================================
  initSidebarUI() {
    this.renderDirectoryList(ODCS_COUNTRIES_DATA);
    this.renderActiveCountryDossier(this.selectedCountry);

    // Search filter
    const searchInput = document.getElementById('sidebar-country-search');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        const query = e.target.value.toLowerCase().trim();
        const filtered = ODCS_COUNTRIES_DATA.filter(c =>
          c.name.toLowerCase().includes(query) ||
          c.id.toLowerCase().includes(query) ||
          c.region.toLowerCase().includes(query) ||
          c.hubCity.toLowerCase().includes(query)
        );
        this.renderDirectoryList(filtered);
      });
    }

    // Filter pills
    const filterPills = document.querySelectorAll('.sidebar-filter-pills .filter-pill');
    filterPills.forEach(pill => {
      pill.addEventListener('click', () => {
        filterPills.forEach(p => p.classList.remove('active'));
        pill.classList.add('active');

        const filterVal = pill.getAttribute('data-filter');
        let filtered = ODCS_COUNTRIES_DATA;
        if (filterVal !== 'all') {
          filtered = ODCS_COUNTRIES_DATA.filter(c => c.tier === filterVal);
        }
        this.renderDirectoryList(filtered);
      });
    });
  }

  renderDirectoryList(countries) {
    const listContainer = document.getElementById('directory-items-list');
    if (!listContainer) return;

    listContainer.innerHTML = '';

    if (countries.length === 0) {
      listContainer.innerHTML = '<div class="directory-empty-msg">No matching countries mapped in mesh.</div>';
      return;
    }

    countries.forEach(country => {
      const item = document.createElement('div');
      item.className = 'directory-country-item';
      if (this.selectedCountry && this.selectedCountry.id === country.id) {
        item.classList.add('selected');
      }
      item.setAttribute('data-id', country.id);

      item.innerHTML = `
        <div class="dir-item-left">
          <span class="dir-flag">${country.flag}</span>
          <div class="dir-text-group">
            <span class="dir-name">${country.name}</span>
            <span class="dir-region">${country.region} • ${country.hubCity}</span>
          </div>
        </div>
        <div class="dir-item-right">
          <span class="dir-tier-badge ${country.tier === 'Class E' ? 'tier-e' : 'tier-s'}">${country.tier}</span>
        </div>
      `;

      item.addEventListener('click', () => {
        this.focusOnCountry(country);
      });

      listContainer.appendChild(item);
    });
  }

  highlightDirectoryItem(countryId) {
    const items = document.querySelectorAll('.directory-country-item');
    items.forEach(item => {
      if (item.getAttribute('data-id') === countryId) {
        item.classList.add('selected');
        item.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      } else {
        item.classList.remove('selected');
      }
    });
  }

  renderActiveCountryDossier(c) {
    const dossierBox = document.getElementById('active-country-dossier');
    if (!dossierBox || !c) return;

    dossierBox.innerHTML = `
      <div class="dossier-header">
        <div class="dossier-title-row">
          <span class="dossier-flag">${c.flag}</span>
          <div>
            <h4 class="dossier-country-name">${c.name}</h4>
            <span class="dossier-region-tag">${c.region} • NODE-${c.id}</span>
          </div>
        </div>
        <span class="dossier-tier-tag ${c.tier === 'Class E' ? 'tier-e' : 'tier-s'}">${c.tier}</span>
      </div>

      <p class="dossier-summary">${c.summary}</p>

      <div class="dossier-metrics-grid">
        <div class="dossier-metric">
          <span class="metric-lbl">Local Authority</span>
          <span class="metric-val text-emerald">${c.walStatus}</span>
        </div>
        <div class="dossier-metric">
          <span class="metric-lbl">Consensus Mesh</span>
          <span class="metric-val text-cyan">${c.crdtState}</span>
        </div>
        <div class="dossier-metric">
          <span class="metric-lbl">Latency / Ping</span>
          <span class="metric-val">${c.ping}</span>
        </div>
        <div class="dossier-metric">
          <span class="metric-lbl">Sovereign Relays</span>
          <span class="metric-val">${c.nodesCount} Hubs • ${c.subseaCables} Cables</span>
        </div>
      </div>

      <div class="dossier-action-bar">
        <button type="button" class="btn-focus-country" id="btn-focus-active-country">
          <span>🎯 Center 3D Earth on ${c.name}</span>
        </button>
      </div>
    `;

    const focusBtn = document.getElementById('btn-focus-active-country');
    if (focusBtn) {
      focusBtn.addEventListener('click', () => {
        this.focusOnCountry(c);
      });
    }
  }
}

/**
 * HeaderMiniEarth
 * Lightweight, 60fps rotating 3D Earth wireframe inside the Header Continuity Status Pill
 */
class HeaderMiniEarth {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    if (!this.canvas) return;
    this.ctx = this.canvas.getContext('2d');

    const dpr = window.devicePixelRatio || 1;
    this.size = 22;
    this.canvas.width = this.size * dpr;
    this.canvas.height = this.size * dpr;
    this.canvas.style.width = `${this.size}px`;
    this.canvas.style.height = `${this.size}px`;

    this.ctx.scale(dpr, dpr);
    this.center = this.size / 2;
    this.radius = 8.5;
    this.rotationY = 0;
    this.speed = 0.022;

    this.sampleDots = [
      [40, -100], [45, -75], [30, -90], [10, -70], [-15, -50], [-25, -45],
      [55, 10], [45, 15], [50, 35], [20, 20], [0, 25], [-25, 25],
      [60, 80], [30, 110], [20, 80], [35, 135], [-25, 135]
    ];

    this.startLoop();
  }

  project(lat, lon) {
    const phi = (90 - lat) * (Math.PI / 180);
    const theta = (lon + 180) * (Math.PI / 180);
    const r = this.radius;

    const x0 = -(r * Math.sin(phi) * Math.cos(theta));
    const z0 = r * Math.sin(phi) * Math.sin(theta);
    const y0 = r * Math.cos(phi);

    const x1 = x0 * Math.cos(this.rotationY) + z0 * Math.sin(this.rotationY);
    const z1 = -x0 * Math.sin(this.rotationY) + z0 * Math.cos(this.rotationY);

    const y2 = y0 * Math.cos(0.28) - z1 * Math.sin(0.28);
    const z2 = y0 * Math.sin(0.28) + z1 * Math.cos(0.28);

    return {
      x: this.center + x1,
      y: this.center + y2,
      z: z2,
      visible: z2 > 0
    };
  }

  startLoop() {
    const render = () => {
      this.rotationY += this.speed;
      this.ctx.clearRect(0, 0, this.size, this.size);

      const grad = this.ctx.createRadialGradient(
        this.center - 2, this.center - 2, 2,
        this.center, this.center, this.radius
      );
      grad.addColorStop(0, '#0a2540');
      grad.addColorStop(0.8, '#030d1a');
      grad.addColorStop(1, '#00f0ff');

      this.ctx.fillStyle = grad;
      this.ctx.beginPath();
      this.ctx.arc(this.center, this.center, this.radius, 0, Math.PI * 2);
      this.ctx.fill();

      this.ctx.strokeStyle = 'rgba(0, 240, 255, 0.7)';
      this.ctx.lineWidth = 0.8;
      this.ctx.stroke();

      this.ctx.beginPath();
      let first = true;
      for (let lon = -180; lon <= 180; lon += 20) {
        const p = this.project(0, lon);
        if (p.visible) {
          if (first) { this.ctx.moveTo(p.x, p.y); first = false; }
          else { this.ctx.lineTo(p.x, p.y); }
        } else {
          first = true;
        }
      }
      this.ctx.strokeStyle = 'rgba(0, 255, 170, 0.45)';
      this.ctx.lineWidth = 0.8;
      this.ctx.stroke();

      for (const dot of this.sampleDots) {
        const p = this.project(dot[0], dot[1]);
        if (p.visible) {
          this.ctx.fillStyle = '#00ffaa';
          this.ctx.beginPath();
          this.ctx.arc(p.x, p.y, 0.9, 0, Math.PI * 2);
          this.ctx.fill();
        }
      }

      requestAnimationFrame(render);
    };

    render();
  }
}

// Instantiate upon DOM ready
document.addEventListener('DOMContentLoaded', () => {
  new OdcsGlobalSignalsGlobe('global-signals-canvas');
  new HeaderMiniEarth('header-earth-canvas');
});
