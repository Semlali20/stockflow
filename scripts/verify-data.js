const API_BASE_URL = 'http://localhost:8080';
let TOKEN = '';

async function apiCall(method, endpoint, body = null) {
  const headers = { 'Content-Type': 'application/json' };
  if (TOKEN) headers['Authorization'] = `Bearer ${TOKEN}`;
  const options = { method, headers };
  if (body) options.body = JSON.stringify(body);
  const response = await fetch(`${API_BASE_URL}${endpoint}`, options);
  const text = await response.text();
  try { return JSON.parse(text); } catch (e) { return text; }
}

async function run() {
  const loginRes = await apiCall('POST', '/api/auth/login', { usernameOrEmail: 'admin@stock.com', password: 'Admin@123' });
  TOKEN = loginRes.accessToken || loginRes.data?.accessToken;
  
  console.log('--- REFINING DATA VERIFICATION ---');
  const sites = await apiCall('GET', '/api/sites');
  console.log('Sites Raw Response:', JSON.stringify(sites, null, 2).slice(0, 1000));
  
  const warehouses = await apiCall('GET', '/api/warehouses');
  console.log('Warehouses Raw Response:', JSON.stringify(warehouses, null, 2).slice(0, 1000));
  
  const locations = await apiCall('GET', '/api/locations');
  console.log('Locations Raw Response:', JSON.stringify(locations, null, 2).slice(0, 1000));
}

run();
