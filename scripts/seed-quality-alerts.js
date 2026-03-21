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

async function createQualityControl(itemId, inspectorId, type) {
  console.log(`  [QC] Inspection for ${itemId} (${type})`);
  const r = await apiCall('POST', '/api/quality/controls', {
    itemId,
    inspectorId,
    inspectionType: type,
    quantityInspected: 10,
    scheduledDate: new Date().toISOString()
  });
  return r.data || r;
}

async function createAlertRule(name, type, severity, freq) {
  console.log(`  [RULE] Alert Rule: ${name} (${severity})`);
  const r = await apiCall('POST', '/api/rules', {
    name,
    description: `Monitoring ${name}`,
    event: 'STOCK_LEVEL_CHANGED',
    ruleType: type,
    severity: severity,
    frequency: freq,
    configuration: { threshold: 10 },
    isActive: true
  });
  return r.data || r;
}

async function run() {
  try {
    await login();

    // 1. Fetch some items to link QC to
    console.log('--- 1. FETCHING ITEMS ---');
    const itemsRes = await apiCall('GET', '/api/items');
    const items = itemsRes.data || itemsRes;
    const vaccine = items.find(i => i.name.includes('Vaccine'));
    const server = items.find(i => i.name.includes('Server'));

    // 2. Create Quality Controls
    console.log('\n--- 2. CREATING QUALITY CONTROLS ---');
    if (vaccine) {
      await createQualityControl(vaccine.id, 'ADMIN_ID', 'INCOMING');
    }
    if (server) {
      await createQualityControl(server.id, 'ADMIN_ID', 'RANDOM_AUDIT');
    }

    // 3. Create Alert Rules
    console.log('\n--- 3. CREATING ALERT RULES ---');
    await createAlertRule('Low Stock Alert', 'ALERT_SYSTEM', 'LOW_STOCK', 'REALTIME');
    await createAlertRule('Critical Expiry Monitor', 'MISFIT_RULE', 'NEAR_EXPIRY', 'DAILY');
    await createAlertRule('Quality Violation Guard', 'ALERT_SYSTEM', 'QUALITY_ISSUE', 'HOURLY');

    console.log('\n=== QUALITY & ALERTS SEEDING COMPLETE! ===');
  } catch (err) {
    console.error('Seeding failed:', err);
  }
}

run();
