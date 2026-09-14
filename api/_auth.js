// Shared auth helpers. Files in /api starting with "_" are NOT routes.
const crypto = require('crypto');

const COOKIE_NAME = 'ct_session';
const MAX_AGE_SECONDS = 60 * 60 * 8; // 8 hours

function b64url(buf) {
  return Buffer.from(buf).toString('base64')
    .replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function fromB64url(str) {
  return Buffer.from(str.replace(/-/g, '+').replace(/_/g, '/'), 'base64');
}

function secret() {
  const s = process.env.SESSION_SECRET;
  if (!s || s.length < 16) {
    throw new Error('SESSION_SECRET is missing or too short (need 16+ chars).');
  }
  return s;
}

// Compare two strings without leaking length/among-char timing.
function safeEqual(a, b) {
  const ha = crypto.createHash('sha256').update(String(a)).digest();
  const hb = crypto.createHash('sha256').update(String(b)).digest();
  return crypto.timingSafeEqual(ha, hb);
}

function checkCredentials(username, password) {
  const u = process.env.CT_USER;
  const p = process.env.CT_PASS;
  if (!u || !p) throw new Error('CT_USER / CT_PASS env vars are not set.');
  // Always run both comparisons so a wrong username and a wrong password
  // take the same amount of time.
  const okUser = safeEqual(username || '', u);
  const okPass = safeEqual(password || '', p);
  return okUser && okPass;
}

function createToken(username) {
  const payload = b64url(JSON.stringify({
    u: username,
    exp: Math.floor(Date.now() / 1000) + MAX_AGE_SECONDS,
  }));
  const sig = b64url(crypto.createHmac('sha256', secret()).update(payload).digest());
  return `${payload}.${sig}`;
}

function verifyToken(token) {
  if (!token || typeof token !== 'string') return null;
  const parts = token.split('.');
  if (parts.length !== 2) return null;
  const [payload, sig] = parts;

  const expected = crypto.createHmac('sha256', secret()).update(payload).digest();
  const given = fromB64url(sig);
  if (given.length !== expected.length) return null;
  if (!crypto.timingSafeEqual(given, expected)) return null;

  let data;
  try {
    data = JSON.parse(fromB64url(payload).toString('utf8'));
  } catch {
    return null;
  }
  if (!data.exp || data.exp < Math.floor(Date.now() / 1000)) return null;
  return data;
}

function readCookie(req, name) {
  const raw = req.headers.cookie || '';
  for (const part of raw.split(';')) {
    const idx = part.indexOf('=');
    if (idx === -1) continue;
    if (part.slice(0, idx).trim() === name) {
      return decodeURIComponent(part.slice(idx + 1).trim());
    }
  }
  return null;
}

function sessionCookie(token) {
  return `${COOKIE_NAME}=${encodeURIComponent(token)}; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=${MAX_AGE_SECONDS}`;
}

function clearedCookie() {
  return `${COOKIE_NAME}=; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=0`;
}

function isLoggedIn(req) {
  return verifyToken(readCookie(req, COOKIE_NAME)) !== null;
}

module.exports = {
  COOKIE_NAME,
  checkCredentials,
  createToken,
  verifyToken,
  readCookie,
  sessionCookie,
  clearedCookie,
  isLoggedIn,
};
