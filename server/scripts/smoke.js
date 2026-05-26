/**
 * Minimal smoke test: health + register + login + marketplace (auth).
 * Run: node scripts/smoke.js
 * Requires MONGO_URI and JWT_SECRET in .env and server not running on PORT (or set SMOKE_PORT).
 */
require('dotenv').config({ path: require('path').join(__dirname, '../.env') });

const http = require('http');

const PORT = process.env.PORT || 5000;
const BASE = `http://127.0.0.1:${PORT}`;
const email = `smoke_${Date.now()}@example.com`;
const password = 'SmokeTest123!';

function req(method, path, body, headers = {}) {
  return new Promise((resolve, reject) => {
    const u = new URL(path, BASE);
    const opt = {
      method,
      hostname: u.hostname,
      port: u.port,
      path: u.pathname + u.search,
      headers: { 'Content-Type': 'application/json', ...headers }
    };
    const r = http.request(opt, (res) => {
      let data = '';
      res.on('data', (c) => (data += c));
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, json: data ? JSON.parse(data) : null });
        } catch {
          resolve({ status: res.statusCode, raw: data });
        }
      });
    });
    r.on('error', reject);
    if (body) r.write(JSON.stringify(body));
    r.end();
  });
}

async function main() {
  const health = await req('GET', '/api/health');
  if (health.status !== 200 || !health.json?.ok) {
    throw new Error(`Health check failed: ${JSON.stringify(health)}`);
  }

  const reg = await req('POST', '/api/users/register', {
    name: 'Smoke',
    email,
    password
  });
  if (reg.status !== 201 || !reg.json?.token) {
    throw new Error(`Register failed: ${JSON.stringify(reg)}`);
  }
  const token = reg.json.token;

  const login = await req('POST', '/api/users/login', { email, password });
  if (login.status !== 200 || !login.json?.token) {
    throw new Error(`Login failed: ${JSON.stringify(login)}`);
  }

  const mkt = await req('GET', '/api/marketplace', null, {
    Authorization: `Bearer ${token}`
  });
  if (mkt.status !== 200 || !Array.isArray(mkt.json)) {
    throw new Error(`Marketplace failed: ${JSON.stringify(mkt)}`);
  }

  console.log('OK: smoke tests passed');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
