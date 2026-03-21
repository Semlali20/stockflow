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

// ====== AUTH ======
async function login() {
  console.log('Logging in...');
  const res = await apiCall('POST', '/api/auth/login', { usernameOrEmail: 'admin@stock.com', password: 'Admin@123' });
  TOKEN = res.accessToken || res.data?.accessToken;
  console.log('Logged in successfully!');
}

// ====== PRODUCTS ======
async function createCategory(name, description) {
  console.log(`  Creating category: ${name}`);
  const res = await apiCall('POST', '/api/categories', { name, description, displayOrder: 1 });
  return res.data || res;
}

async function createItem(name, sku, categoryId, description, isSerialized, isLotManaged) {
  console.log(`  Creating item: ${name} (${sku})`);
  const res = await apiCall('POST', '/api/items', {
    name, sku, categoryId, description,
    isSerialized, isLotManaged,
    shelfLifeDays: 365,
    hazardousMaterial: false
  });
  return res.data || res;
}

// ====== LOCATIONS ======
async function createSite(name, type) {
  console.log(`  Creating site: ${name}`);
  const res = await apiCall('POST', '/api/sites', { name, type, timezone: 'UTC', address: '123 Main St' });
  return res.data || res;
}

async function createWarehouse(name, code, siteId) {
  console.log(`  Creating warehouse: ${name}`);
  const res = await apiCall('POST', '/api/warehouses', { name, code, siteId });
  return res.data || res;
}

async function createLocation(code, warehouseId, type, zone, aisle, rack) {
  console.log(`  Creating location: ${code}`);
  const res = await apiCall('POST', '/api/locations', {
    code, warehouseId, type, zone, aisle, rack, capacity: '1000'
  });
  return res.data || res;
}

// ====== INVENTORY ======
async function createInventory(itemId, warehouseId, locationId, quantity, uom) {
  console.log(`  Creating inventory for item ${itemId} | qty: ${quantity}`);
  const res = await apiCall('POST', '/api/inventory', {
    itemId, warehouseId, locationId, quantityOnHand: quantity, uom, status: 'AVAILABLE'
  });
  return res.data || res;
}

// ====== LOTS ======
async function createLot(itemId, code, lotNumber, expiryDate, manufactureDate) {
  console.log(`  Creating lot: ${code}`);
  const res = await apiCall('POST', '/api/lots', {
    itemId, code, lotNumber, expiryDate, manufactureDate, status: 'ACTIVE'
  });
  return res.data || res;
}

// ====== SERIALS ======
async function createSerial(itemId, code, serialNumber, locationId) {
  console.log(`  Creating serial: ${code}`);
  const res = await apiCall('POST', '/api/serials', {
    itemId, code, serialNumber, locationId, status: 'IN_STOCK'
  });
  return res.data || res;
}

// ====== MOVEMENTS ======
async function createMovement(warehouseId, type, status, sourceLocationId, destinationLocationId, lines, referenceNumber, notes) {
  console.log(`  Creating movement: ${type} (${referenceNumber})`);
  const res = await apiCall('POST', '/api/movements', {
    warehouseId, type, status,
    sourceLocationId, destinationLocationId,
    referenceNumber, notes,
    priority: 'NORMAL',
    lines
  });
  return res.data || res;
}

// ====== MAIN SEEDER ======
async function runSeeder() {
  try {
    await login();
    const ts = Math.floor(Date.now() / 1000).toString().slice(-4);

    // ────────────── 1. CATALOG ──────────────
    console.log('\n--- 1. CREATING CATALOG ---');
    const electronics = await createCategory(`Electronics ${ts}`, 'Electronic devices and accessories');
    const biotech = await createCategory(`Biotech ${ts}`, 'Medical and pharmaceutical supplies');
    const rawMaterials = await createCategory(`Raw Materials ${ts}`, 'Industrial raw materials');

    // Lot-managed item (vaccine)
    const vaccine = await createItem(`Vaccine V-${ts}`, `MED-VAC-${ts}`, biotech.id, 'Temperature-controlled vaccine', false, true);
    // Serialized item (server)
    const server = await createItem(`Server Rack X-${ts}`, `ELEC-SRV-${ts}`, electronics.id, 'Enterprise rack server', true, false);
    // Standard item (laptop)
    const laptop = await createItem(`Office Laptop ${ts}`, `ELEC-LAP-${ts}`, electronics.id, 'Standard office laptop', false, false);
    // Standard item (steel)
    const steel = await createItem(`Steel Coil ${ts}`, `RAW-STL-${ts}`, rawMaterials.id, 'Hot-rolled steel coil 2mm', false, false);

    // ────────────── 2. SITES & LOCATIONS ──────────────
    console.log('\n--- 2. CREATING SITES & LOCATIONS ---');
    // Site 1: Distribution Center
    const dcSite = await createSite(`Distribution Center ${ts}`, 'DISTRIBUTION_CENTER');
    const dcWh = await createWarehouse(`DC Warehouse ${ts}`, `WH-DC-${ts}`, dcSite.id);
    const dcReceiving = await createLocation(`DC-REC-${ts}`, dcWh.id, 'RECEIVING', 'Receiving', 'A', '1');
    const dcStorage = await createLocation(`DC-STG-${ts}`, dcWh.id, 'STORAGE', 'Storage', 'B', '1');
    const dcShipping = await createLocation(`DC-SHP-${ts}`, dcWh.id, 'SHIPPING', 'Shipping', 'C', '1');
    const dcQuarantine = await createLocation(`DC-QRN-${ts}`, dcWh.id, 'QUARANTINE', 'Quarantine', 'D', '1');

    // Site 2: Manufacturing
    const mfgSite = await createSite(`Manufacturing Plant ${ts}`, 'MANUFACTURING');
    const mfgWh = await createWarehouse(`MFG Warehouse ${ts}`, `WH-MFG-${ts}`, mfgSite.id);
    const mfgStaging = await createLocation(`MFG-STG-${ts}`, mfgWh.id, 'STAGING', 'Staging', 'A', '1');
    const mfgStorage = await createLocation(`MFG-STO-${ts}`, mfgWh.id, 'STORAGE', 'Storage', 'B', '1');

    // ────────────── 3. INVENTORY ──────────────
    console.log('\n--- 3. CREATING INVENTORY ---');
    await createInventory(vaccine.id, dcWh.id, dcStorage.id, 500, 'vials');
    await createInventory(server.id, dcWh.id, dcStorage.id, 15, 'pcs');
    await createInventory(laptop.id, dcWh.id, dcStorage.id, 120, 'pcs');
    await createInventory(steel.id, mfgWh.id, mfgStorage.id, 50, 'tons');
    await createInventory(laptop.id, mfgWh.id, mfgStorage.id, 30, 'pcs');

    // ────────────── 4. LOTS ──────────────
    console.log('\n--- 4. CREATING LOTS ---');
    const futureDate = new Date(); futureDate.setFullYear(futureDate.getFullYear() + 1);
    const pastDate  = new Date(); pastDate.setMonth(pastDate.getMonth() - 1);
    const expDate = futureDate.toISOString().split('T')[0];
    const mfgDate = pastDate.toISOString().split('T')[0];

    const lot1 = await createLot(vaccine.id, `LOT-${ts}-A`, `LN-${ts}-A`, expDate, mfgDate);
    const lot2 = await createLot(vaccine.id, `LOT-${ts}-B`, `LN-${ts}-B`, expDate, mfgDate);

    // ────────────── 5. SERIALS ──────────────
    console.log('\n--- 5. CREATING SERIALS ---');
    const serial1 = await createSerial(server.id, `SER-${ts}-001`, `SN-${ts}-001`, dcStorage.id);
    const serial2 = await createSerial(server.id, `SER-${ts}-002`, `SN-${ts}-002`, dcStorage.id);
    const serial3 = await createSerial(server.id, `SER-${ts}-003`, `SN-${ts}-003`, dcReceiving.id);

    // ────────────── 6. MOVEMENTS ──────────────
    console.log('\n--- 6. CREATING MOVEMENTS ---');

    // Movement 1: RECEIPT of laptops into receiving
    await createMovement(dcWh.id, 'RECEIPT', 'COMPLETED', null, dcReceiving.id, [
      { itemId: laptop.id, requestedQuantity: 50, actualQuantity: 50, toLocationId: dcReceiving.id, lineNumber: 1, uom: 'pcs', status: 'COMPLETED' }
    ], `REC-${ts}-001`, 'Laptop shipment received from supplier');

    // Movement 2: PUTAWAY from receiving to storage
    await createMovement(dcWh.id, 'PUTAWAY', 'COMPLETED', dcReceiving.id, dcStorage.id, [
      { itemId: laptop.id, requestedQuantity: 50, actualQuantity: 50, fromLocationId: dcReceiving.id, toLocationId: dcStorage.id, lineNumber: 1, uom: 'pcs', status: 'COMPLETED' }
    ], `PUT-${ts}-001`, 'Laptops moved to storage zone');

    // Movement 3: TRANSFER between warehouses (in progress)
    await createMovement(dcWh.id, 'TRANSFER', 'IN_PROGRESS', dcStorage.id, null, [
      { itemId: laptop.id, requestedQuantity: 10, actualQuantity: 0, fromLocationId: dcStorage.id, lineNumber: 1, uom: 'pcs', status: 'PENDING' }
    ], `TRF-${ts}-001`, 'Transfer laptops to manufacturing plant');

    // Movement 4: PICKING for an order
    await createMovement(dcWh.id, 'PICKING', 'COMPLETED', dcStorage.id, dcShipping.id, [
      { itemId: laptop.id, requestedQuantity: 5, actualQuantity: 5, fromLocationId: dcStorage.id, toLocationId: dcShipping.id, lineNumber: 1, uom: 'pcs', status: 'COMPLETED' },
      { itemId: server.id, requestedQuantity: 2, actualQuantity: 2, fromLocationId: dcStorage.id, toLocationId: dcShipping.id, lineNumber: 2, uom: 'pcs', status: 'COMPLETED' }
    ], `PCK-${ts}-001`, 'Order #1234 picked and staged for shipping');

    // Movement 5: QUARANTINE defective items
    await createMovement(dcWh.id, 'QUARANTINE', 'COMPLETED', dcStorage.id, dcQuarantine.id, [
      { itemId: vaccine.id, requestedQuantity: 20, actualQuantity: 20, fromLocationId: dcStorage.id, toLocationId: dcQuarantine.id, lineNumber: 1, uom: 'vials', status: 'COMPLETED' }
    ], `QRN-${ts}-001`, 'Vaccine batch moved to quarantine for quality inspection');

    console.log('\n=== EXTENDED DATA SEEDING COMPLETE! ===');
  } catch (err) {
    console.error('Seeding failed:', err);
  }
}

runSeeder();
