const API_BASE_URL = 'http://localhost:8080';
let TOKEN = '';

async function apiCall(method, endpoint, body = null) {
  const headers = { 'Content-Type': 'application/json' };
  if (TOKEN) headers['Authorization'] = `Bearer ${TOKEN}`;
  const options = { method, headers };
  if (body) options.body = JSON.stringify(body);
  const response = await fetch(`${API_BASE_URL}${endpoint}`, options);
  const text = await response.text();
  let data;
  try { data = text ? JSON.parse(text) : {}; } catch (e) { data = text; }
  if (!response.ok) {
    console.error(`Error on ${method} ${endpoint}:`, JSON.stringify(data, null, 2));
    throw new Error(`API call failed: ${response.status}`);
  }
  return data;
}

async function login() {
  console.log('Logging in...');
  const res = await apiCall('POST', '/api/auth/login', { usernameOrEmail: 'admin@stock.com', password: 'Admin@123' });
  TOKEN = res.accessToken || res.data?.accessToken;
  console.log('Logged in!\n');
}

async function site(name, type) {
  console.log(`  [SITE] ${name} (${type})`);
  const r = await apiCall('POST', '/api/sites', { name, type, timezone: 'UTC', address: name + ' Address' });
  return r.data || r;
}

async function warehouse(name, code, siteId) {
  console.log(`    [WH] ${name} (${code})`);
  const r = await apiCall('POST', '/api/warehouses', { name, code, siteId });
  return r.data || r;
}

async function loc(code, warehouseId, type, zone, aisle, rack) {
  console.log(`      [LOC] ${code} — ${type} (zone: ${zone})`);
  const r = await apiCall('POST', '/api/locations', { code, warehouseId, type, zone, aisle, rack, capacity: '500' });
  return r.data || r;
}

async function run() {
  try {
    await login();

    // ═══════════════════════════════════════════
    //  SITE 1: Main Distribution Center (Paris)
    // ═══════════════════════════════════════════
    console.log('--- SITE 1: Main Distribution Center ---');
    const s1 = await site('Paris Distribution Center', 'DISTRIBUTION_CENTER');
    const wh1 = await warehouse('Paris Main Warehouse', 'WH-PAR-01', s1.id);

    await loc('PAR-REC-01', wh1.id, 'RECEIVING', 'Receiving Zone A', 'A', '1');
    await loc('PAR-REC-02', wh1.id, 'RECEIVING', 'Receiving Zone B', 'B', '1');
    await loc('PAR-STG-01', wh1.id, 'STORAGE', 'Storage Zone A', 'A', '1');
    await loc('PAR-STG-02', wh1.id, 'STORAGE', 'Storage Zone A', 'A', '2');
    await loc('PAR-STG-03', wh1.id, 'STORAGE', 'Storage Zone B', 'B', '1');
    await loc('PAR-STG-04', wh1.id, 'STORAGE', 'Storage Zone B', 'B', '2');
    await loc('PAR-PCK-01', wh1.id, 'PICKING', 'Picking Zone', 'A', '1');
    await loc('PAR-PCK-02', wh1.id, 'PICKING', 'Picking Zone', 'A', '2');
    await loc('PAR-STA-01', wh1.id, 'STAGING', 'Staging Area', 'A', '1');
    await loc('PAR-SHP-01', wh1.id, 'SHIPPING', 'Shipping Dock 1', 'A', '1');
    await loc('PAR-SHP-02', wh1.id, 'SHIPPING', 'Shipping Dock 2', 'B', '1');
    await loc('PAR-QRN-01', wh1.id, 'QUARANTINE', 'Quarantine Zone', 'A', '1');
    await loc('PAR-RET-01', wh1.id, 'RETURNS', 'Returns Processing', 'A', '1');

    const wh1b = await warehouse('Paris Cold Storage', 'WH-PAR-02', s1.id);
    await loc('PAR-CS-STG-01', wh1b.id, 'STORAGE', 'Cold Room 1', 'A', '1');
    await loc('PAR-CS-STG-02', wh1b.id, 'STORAGE', 'Cold Room 2', 'A', '2');
    await loc('PAR-CS-QRN-01', wh1b.id, 'QUARANTINE', 'Cold Quarantine', 'A', '1');

    // ═══════════════════════════════════════════
    //  SITE 2: Manufacturing Plant (Lyon)
    // ═══════════════════════════════════════════
    console.log('\n--- SITE 2: Manufacturing Plant ---');
    const s2 = await site('Lyon Manufacturing Plant', 'MANUFACTURING');
    const wh2 = await warehouse('Lyon Production Warehouse', 'WH-LYN-01', s2.id);

    await loc('LYN-REC-01', wh2.id, 'RECEIVING', 'Raw Material Receiving', 'A', '1');
    await loc('LYN-STG-01', wh2.id, 'STORAGE', 'Raw Material Storage', 'A', '1');
    await loc('LYN-STG-02', wh2.id, 'STORAGE', 'Raw Material Storage', 'A', '2');
    await loc('LYN-MFG-01', wh2.id, 'MANUFACTURING', 'Production Line 1', 'A', '1');
    await loc('LYN-MFG-02', wh2.id, 'MANUFACTURING', 'Production Line 2', 'B', '1');
    await loc('LYN-STA-01', wh2.id, 'STAGING', 'Finished Goods Staging', 'A', '1');
    await loc('LYN-STG-03', wh2.id, 'STORAGE', 'Finished Goods Storage', 'C', '1');
    await loc('LYN-SHP-01', wh2.id, 'SHIPPING', 'Outbound Dock', 'A', '1');
    await loc('LYN-QRN-01', wh2.id, 'QUARANTINE', 'Quality Hold Zone', 'A', '1');

    // ═══════════════════════════════════════════
    //  SITE 3: Retail Store (Marseille)
    // ═══════════════════════════════════════════
    console.log('\n--- SITE 3: Retail Store ---');
    const s3 = await site('Marseille Retail Store', 'STORE');
    const wh3 = await warehouse('Marseille Store Backroom', 'WH-MRS-01', s3.id);

    await loc('MRS-REC-01', wh3.id, 'RECEIVING', 'Store Receiving', 'A', '1');
    await loc('MRS-STG-01', wh3.id, 'STORAGE', 'Backroom Storage A', 'A', '1');
    await loc('MRS-STG-02', wh3.id, 'STORAGE', 'Backroom Storage B', 'A', '2');
    await loc('MRS-PCK-01', wh3.id, 'PICKING', 'Floor Shelves', 'A', '1');
    await loc('MRS-RET-01', wh3.id, 'RETURNS', 'Customer Returns Area', 'A', '1');

    // ═══════════════════════════════════════════
    //  SITE 4: Regional Warehouse (Toulouse)
    // ═══════════════════════════════════════════
    console.log('\n--- SITE 4: Regional Warehouse ---');
    const s4 = await site('Toulouse Regional Warehouse', 'WAREHOUSE');
    const wh4 = await warehouse('Toulouse Warehouse A', 'WH-TLS-01', s4.id);

    await loc('TLS-REC-01', wh4.id, 'RECEIVING', 'Inbound Dock', 'A', '1');
    await loc('TLS-STG-01', wh4.id, 'STORAGE', 'Bulk Storage Zone 1', 'A', '1');
    await loc('TLS-STG-02', wh4.id, 'STORAGE', 'Bulk Storage Zone 1', 'A', '2');
    await loc('TLS-STG-03', wh4.id, 'STORAGE', 'Bulk Storage Zone 2', 'B', '1');
    await loc('TLS-STG-04', wh4.id, 'STORAGE', 'Bulk Storage Zone 2', 'B', '2');
    await loc('TLS-PCK-01', wh4.id, 'PICKING', 'Pick Zone', 'A', '1');
    await loc('TLS-STA-01', wh4.id, 'STAGING', 'Outbound Staging', 'A', '1');
    await loc('TLS-SHP-01', wh4.id, 'SHIPPING', 'Loading Bay 1', 'A', '1');
    await loc('TLS-SHP-02', wh4.id, 'SHIPPING', 'Loading Bay 2', 'B', '1');

    const wh4b = await warehouse('Toulouse Warehouse B', 'WH-TLS-02', s4.id);
    await loc('TLS-B-STG-01', wh4b.id, 'STORAGE', 'Overflow Storage', 'A', '1');
    await loc('TLS-B-STG-02', wh4b.id, 'STORAGE', 'Overflow Storage', 'A', '2');
    await loc('TLS-B-QRN-01', wh4b.id, 'QUARANTINE', 'Inspection Bay', 'A', '1');

    // ═══════════════════════════════════════════
    //  SITE 5: E-Commerce Fulfillment (Bordeaux)
    // ═══════════════════════════════════════════
    console.log('\n--- SITE 5: E-Commerce Fulfillment ---');
    const s5 = await site('Bordeaux Fulfillment Center', 'DISTRIBUTION_CENTER');
    const wh5 = await warehouse('Bordeaux FC Warehouse', 'WH-BDX-01', s5.id);

    await loc('BDX-REC-01', wh5.id, 'RECEIVING', 'Inbound Receiving', 'A', '1');
    await loc('BDX-STG-01', wh5.id, 'STORAGE', 'Fast-Moving Items', 'A', '1');
    await loc('BDX-STG-02', wh5.id, 'STORAGE', 'Fast-Moving Items', 'A', '2');
    await loc('BDX-STG-03', wh5.id, 'STORAGE', 'Slow-Moving Items', 'B', '1');
    await loc('BDX-STG-04', wh5.id, 'STORAGE', 'Slow-Moving Items', 'B', '2');
    await loc('BDX-PCK-01', wh5.id, 'PICKING', 'Pick & Pack Station 1', 'A', '1');
    await loc('BDX-PCK-02', wh5.id, 'PICKING', 'Pick & Pack Station 2', 'A', '2');
    await loc('BDX-STA-01', wh5.id, 'STAGING', 'Packing Staging', 'A', '1');
    await loc('BDX-SHP-01', wh5.id, 'SHIPPING', 'Parcel Dispatch 1', 'A', '1');
    await loc('BDX-SHP-02', wh5.id, 'SHIPPING', 'Parcel Dispatch 2', 'B', '1');
    await loc('BDX-RET-01', wh5.id, 'RETURNS', 'E-Commerce Returns', 'A', '1');
    await loc('BDX-QRN-01', wh5.id, 'QUARANTINE', 'Damaged Goods Hold', 'A', '1');

    console.log('\n=== SITES, WAREHOUSES & LOCATIONS SEEDING COMPLETE! ===');
    console.log('  5 Sites | 7 Warehouses | 54 Locations created.');
  } catch (err) {
    console.error('Seeding failed:', err);
  }
}

run();
