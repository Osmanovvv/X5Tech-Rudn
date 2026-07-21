// Minimal Figma remote MCP client over streamable HTTP.
// Usage:
//   node mcp.js list
//   node mcp.js call <tool> '<json-arguments>' [--save-images <dir>]
const https = require('https');
const fs = require('fs');
const path = require('path');

const BASE = 'https://mcp.figma.com/mcp';
const TOKENS_FILE = path.join(__dirname, 'tokens.json');
let TOK = JSON.parse(fs.readFileSync(TOKENS_FILE, 'utf8'));
const SESSION_FILE = path.join(__dirname, 'session.json');
const TOKEN_EP = 'https://api.figma.com/v1/oauth/token';

function refreshAccessToken() {
  return new Promise((resolve, reject) => {
    const body = new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token: TOK.refresh_token,
      client_id: TOK.client_id,
      client_secret: TOK.client_secret || '',
    }).toString();
    const u = new URL(TOKEN_EP);
    const r = https.request(
      { hostname: u.hostname, path: u.pathname, method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded', 'Content-Length': Buffer.byteLength(body) } },
      (res) => {
        let buf = '';
        res.on('data', (c) => (buf += c));
        res.on('end', () => {
          if (res.statusCode !== 200) return reject(new Error(`refresh failed ${res.statusCode}: ${buf.slice(0, 200)}`));
          const fresh = JSON.parse(buf);
          TOK = { ...TOK, ...fresh, obtained_at: new Date().toISOString() };
          fs.writeFileSync(TOKENS_FILE, JSON.stringify(TOK, null, 2));
          resolve();
        });
      }
    );
    r.on('error', reject);
    r.write(body);
    r.end();
  });
}

function req(body, sessionId) {
  return new Promise((resolve, reject) => {
    const u = new URL(BASE);
    const data = JSON.stringify(body);
    const headers = {
      Authorization: `Bearer ${TOK.access_token}`,
      'Content-Type': 'application/json',
      Accept: 'application/json, text/event-stream',
      'MCP-Protocol-Version': '2025-06-18',
      'Content-Length': Buffer.byteLength(data),
    };
    if (sessionId) headers['Mcp-Session-Id'] = sessionId;
    const r = https.request(
      { hostname: u.hostname, path: u.pathname, method: 'POST', headers },
      (res) => {
        let buf = '';
        res.on('data', (c) => (buf += c));
        res.on('end', () => resolve({ status: res.statusCode, headers: res.headers, body: buf }));
      }
    );
    r.on('error', reject);
    r.write(data);
    r.end();
  });
}

function parseBody(raw, contentType) {
  if ((contentType || '').includes('text/event-stream')) {
    const msgs = [];
    for (const line of raw.split('\n')) {
      if (line.startsWith('data:')) {
        const s = line.slice(5).trim();
        if (s) try { msgs.push(JSON.parse(s)); } catch {}
      }
    }
    return msgs[msgs.length - 1];
  }
  try { return JSON.parse(raw); } catch { return raw; }
}

async function ensureSession(force) {
  if (!force && fs.existsSync(SESSION_FILE)) {
    try { return JSON.parse(fs.readFileSync(SESSION_FILE, 'utf8')).sessionId; } catch {}
  }
  const res = await req({
    jsonrpc: '2.0', id: 0, method: 'initialize',
    params: { protocolVersion: '2025-06-18', capabilities: {}, clientInfo: { name: 'claude-local', version: '1.0' } },
  });
  if (res.status !== 200) throw new Error(`init failed ${res.status}: ${res.body.slice(0, 300)}`);
  const sessionId = res.headers['mcp-session-id'] || null;
  await req({ jsonrpc: '2.0', method: 'notifications/initialized' }, sessionId);
  fs.writeFileSync(SESSION_FILE, JSON.stringify({ sessionId, at: Date.now() }));
  return sessionId;
}

async function rpc(method, params) {
  let sessionId = await ensureSession(false);
  let res = await req({ jsonrpc: '2.0', id: Date.now() % 1e9, method, params }, sessionId);
  if (res.status === 401) {
    await refreshAccessToken();
    sessionId = await ensureSession(true);
    res = await req({ jsonrpc: '2.0', id: Date.now() % 1e9, method, params }, sessionId);
  }
  if (res.status === 404 || res.status === 400) {
    sessionId = await ensureSession(true);
    res = await req({ jsonrpc: '2.0', id: Date.now() % 1e9, method, params }, sessionId);
  }
  if (res.status === 429) throw new Error(`RATE_LIMITED retry-after=${res.headers['retry-after']}`);
  if (res.status !== 200) throw new Error(`rpc ${method} failed ${res.status}: ${String(res.body).slice(0, 400)}`);
  return parseBody(res.body, res.headers['content-type']);
}

(async () => {
  const [cmd, tool, argsJson, ...rest] = process.argv.slice(2);
  if (cmd === 'list') {
    const out = await rpc('tools/list', {});
    for (const t of out.result.tools) {
      console.log(`## ${t.name}`);
      console.log((t.description || '').split('\n')[0].slice(0, 200));
      console.log('input:', JSON.stringify(t.inputSchema && t.inputSchema.properties ? Object.keys(t.inputSchema.properties) : []));
      console.log();
    }
    return;
  }
  if (cmd === 'call') {
    const args = argsJson ? JSON.parse(argsJson) : {};
    const saveIdx = rest.indexOf('--save-images');
    const saveDir = saveIdx >= 0 ? rest[saveIdx + 1] : null;
    const out = await rpc('tools/call', { name: tool, arguments: args });
    if (out.error) { console.error('MCP_ERROR', JSON.stringify(out.error).slice(0, 800)); process.exit(1); }
    const content = (out.result && out.result.content) || [];
    let imgN = 0;
    for (const c of content) {
      if (c.type === 'text') console.log(c.text);
      else if (c.type === 'image' && saveDir) {
        fs.mkdirSync(saveDir, { recursive: true });
        const ext = (c.mimeType || 'image/png').split('/')[1].split('+')[0];
        const f = path.join(saveDir, `img_${imgN++}.${ext}`);
        fs.writeFileSync(f, Buffer.from(c.data, 'base64'));
        console.log(`[image saved: ${f}]`);
      } else console.log(`[${c.type} content, keys: ${Object.keys(c).join(',')}]`);
    }
    if (out.result && out.result.isError) process.exit(1);
    return;
  }
  console.error('usage: node mcp.js list | call <tool> <json> [--save-images dir]');
  process.exit(2);
})().catch((e) => { console.error('FATAL', e.message); process.exit(1); });
