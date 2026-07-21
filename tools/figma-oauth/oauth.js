// One-shot OAuth flow for Figma remote MCP (mcp.figma.com).
// Registers a client (DCR), starts a loopback listener, prints the authorize URL,
// exchanges the code for tokens and saves everything next to this script.
const http = require('http');
const https = require('https');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

const PORT = 8917;
const REDIRECT_URI = `http://127.0.0.1:${PORT}/callback`;
const OUT = path.join(__dirname, 'tokens.json');
const AUTH_EP = 'https://www.figma.com/oauth/mcp';
const TOKEN_EP = 'https://api.figma.com/v1/oauth/token';
const REG_EP = 'https://api.figma.com/v1/oauth/mcp/register';
const RESOURCE = 'https://mcp.figma.com/mcp';
const SCOPE = 'mcp:connect';

function post(url, body, headers) {
  return new Promise((resolve, reject) => {
    const u = new URL(url);
    const data = typeof body === 'string' ? body : JSON.stringify(body);
    const req = https.request(
      { hostname: u.hostname, path: u.pathname + u.search, method: 'POST',
        headers: { 'Content-Length': Buffer.byteLength(data), ...headers } },
      (res) => {
        let buf = '';
        res.on('data', (c) => (buf += c));
        res.on('end', () => resolve({ status: res.statusCode, body: buf }));
      }
    );
    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

function b64url(buf) {
  return buf.toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

(async () => {
  const reg = await post(REG_EP, {
    client_name: 'Claude Code (local analysis)',
    client_uri: 'https://claude.com/claude-code',
    redirect_uris: [REDIRECT_URI],
    grant_types: ['authorization_code', 'refresh_token'],
    response_types: ['code'],
    token_endpoint_auth_method: 'client_secret_post',
    scope: SCOPE,
  }, { 'Content-Type': 'application/json' });
  if (reg.status !== 200 && reg.status !== 201) {
    console.error('DCR_FAILED', reg.status, reg.body.slice(0, 500));
    process.exit(1);
  }
  const client = JSON.parse(reg.body);

  const verifier = b64url(crypto.randomBytes(48));
  const challenge = b64url(crypto.createHash('sha256').update(verifier).digest());
  const state = b64url(crypto.randomBytes(24));

  const authUrl = AUTH_EP + '?' + new URLSearchParams({
    client_id: client.client_id,
    redirect_uri: REDIRECT_URI,
    response_type: 'code',
    scope: SCOPE,
    state,
    code_challenge: challenge,
    code_challenge_method: 'S256',
    resource: RESOURCE,
  }).toString();

  const server = http.createServer(async (req, res) => {
    const u = new URL(req.url, `http://127.0.0.1:${PORT}`);
    if (u.pathname !== '/callback') { res.writeHead(404).end(); return; }
    const err = u.searchParams.get('error');
    if (err) {
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      res.end('<h2>Авторизация отклонена: ' + err + '</h2>');
      console.error('AUTH_DENIED', err);
      server.close(); process.exit(1);
    }
    if (u.searchParams.get('state') !== state) {
      res.writeHead(400).end('state mismatch');
      console.error('STATE_MISMATCH');
      server.close(); process.exit(1);
    }
    const code = u.searchParams.get('code');
    const tok = await post(TOKEN_EP, new URLSearchParams({
      grant_type: 'authorization_code',
      code,
      redirect_uri: REDIRECT_URI,
      client_id: client.client_id,
      client_secret: client.client_secret || '',
      code_verifier: verifier,
      resource: RESOURCE,
    }).toString(), { 'Content-Type': 'application/x-www-form-urlencoded' });
    if (tok.status !== 200) {
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      res.end('<h2>Ошибка обмена кода: ' + tok.status + '</h2><pre>' + tok.body.slice(0, 300) + '</pre>');
      console.error('TOKEN_FAILED', tok.status, tok.body.slice(0, 500));
      server.close(); process.exit(1);
    }
    const tokens = JSON.parse(tok.body);
    fs.writeFileSync(OUT, JSON.stringify({
      obtained_at: new Date().toISOString(),
      client_id: client.client_id,
      client_secret: client.client_secret,
      ...tokens,
    }, null, 2));
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end('<h2 style="font-family:sans-serif">Готово! Figma подключена. Эту вкладку можно закрыть.</h2>');
    console.log('TOKENS_SAVED');
    server.close(); process.exit(0);
  });

  server.listen(PORT, '127.0.0.1', () => {
    console.log('AUTH_URL: ' + authUrl);
  });

  setTimeout(() => { console.error('TIMEOUT'); process.exit(1); }, 10 * 60 * 1000);
})().catch((e) => { console.error('FATAL', e.message); process.exit(1); });
