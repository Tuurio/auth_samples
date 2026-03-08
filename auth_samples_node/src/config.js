require('dotenv').config();

const isProduction = process.env.NODE_ENV === 'production';
const authority = normalizeAuthority(process.env.TUURIO_ISSUER) || 'https://test.id.tuurio.com';
const sessionSameSite = sanitizeSameSite(process.env.TUURIO_SESSION_SAME_SITE) || 'lax';
const sessionSecureCookie = toBoolean(
  process.env.TUURIO_SESSION_SECURE_COOKIE,
  isProduction || sessionSameSite === 'none',
);

module.exports = {
  isProduction,
  authority,
  authorizeEndpoint: `${authority}/oauth2/authorize`,
  tokenEndpoint: `${authority}/oauth2/token`,
  discoveryEndpoint: `${authority}/.well-known/openid-configuration`,
  clientId: sanitizeClientId(process.env.TUURIO_CLIENT_ID) || 'spa-K53I',
  clientSecret: process.env.TUURIO_CLIENT_SECRET || '',
  redirectUri: normalizeUrl(process.env.TUURIO_REDIRECT_URI) || 'http://localhost:8082/auth/callback',
  postLogoutRedirectUri:
    normalizeUrl(process.env.TUURIO_POST_LOGOUT_REDIRECT_URI) || 'http://localhost:8082/logout/callback',
  scope: sanitizeScope(process.env.TUURIO_SCOPE) || 'openid profile email',
  sessionSecret: sanitizeSessionSecret(process.env.TUURIO_SESSION_SECRET, isProduction),
  sessionCookieName: sanitizeCookieName(process.env.TUURIO_SESSION_COOKIE_NAME) || 'tuurio.sid',
  sessionTrustProxy: toBoolean(process.env.TUURIO_SESSION_TRUST_PROXY, isProduction),
  sessionSecureCookie,
  sessionSameSite,
  sessionMaxAgeMs: parsePositiveInt(process.env.TUURIO_SESSION_MAX_AGE_MS, 8 * 60 * 60 * 1000),
  webhookId: sanitizePlain(process.env.TUURIO_WEBHOOK_ID),
  webhookUrl: normalizeUrl(process.env.TUURIO_WEBHOOK_URL) || '',
  webhookEditUrl: normalizeUrl(process.env.TUURIO_WEBHOOK_EDIT_URL) || '',
  webhookSigningSecret: sanitizePlain(process.env.TUURIO_WEBHOOK_SIGNING_SECRET),
  webhookListenPath: normalizeWebhookPath(process.env.TUURIO_WEBHOOK_LISTEN_PATH) || '/webhooks/tuurio',
  webhookApiKeyHeader: sanitizeHeaderName(process.env.TUURIO_WEBHOOK_API_KEY_HEADER) || 'X-Tuurio-Webhook-Key',
  webhookApiKey: sanitizePlain(process.env.TUURIO_WEBHOOK_API_KEY),
};

function normalizeAuthority(value) {
  const raw = String(value || '').trim();
  if (!raw) return null;
  try {
    const parsed = new URL(raw);
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') return null;
    parsed.pathname = '/';
    parsed.search = '';
    parsed.hash = '';
    parsed.username = '';
    parsed.password = '';
    return parsed.toString().replace(/\/$/, '');
  } catch {
    return null;
  }
}

function normalizeUrl(value) {
  const raw = String(value || '').trim();
  if (!raw) return null;
  try {
    const parsed = new URL(raw);
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') return null;
    return parsed.toString();
  } catch {
    return null;
  }
}

function sanitizeClientId(value) {
  const raw = String(value || '').trim();
  if (!raw) return null;
  if (raw.length > 120) return null;
  if (!/^[A-Za-z0-9._-]+$/.test(raw)) return null;
  return raw;
}

function sanitizeScope(value) {
  const raw = String(value || '').trim();
  if (!raw) return null;
  const normalized = raw
    .split(/\s+/)
    .map((part) => part.trim())
    .filter((part) => part.length > 0 && /^[A-Za-z0-9._:-]+$/.test(part))
    .join(' ');
  return normalized || null;
}

function sanitizeSessionSecret(value, productionMode) {
  const raw = String(value || '').trim();
  if (!raw) {
    return productionMode ? '' : 'tuurio-auth-sample';
  }
  if (productionMode && raw === 'tuurio-auth-sample') {
    return '';
  }
  if (productionMode && raw.length < 32) {
    return '';
  }
  return raw;
}

function sanitizeCookieName(value) {
  const raw = String(value || '').trim();
  if (!raw) return null;
  if (raw.length > 64) return null;
  if (!/^[A-Za-z0-9._-]+$/.test(raw)) return null;
  return raw;
}

function sanitizeSameSite(value) {
  const raw = String(value || '').trim().toLowerCase();
  if (raw === 'lax' || raw === 'strict' || raw === 'none') {
    return raw;
  }
  return null;
}

function toBoolean(value, fallback) {
  const raw = String(value || '').trim().toLowerCase();
  if (!raw) return fallback;
  if (raw === '1' || raw === 'true' || raw === 'yes' || raw === 'on') return true;
  if (raw === '0' || raw === 'false' || raw === 'no' || raw === 'off') return false;
  return fallback;
}

function parsePositiveInt(value, fallback) {
  const raw = String(value || '').trim();
  if (!raw) return fallback;
  const parsed = Number.parseInt(raw, 10);
  if (!Number.isFinite(parsed) || parsed <= 0) return fallback;
  return parsed;
}

function normalizeWebhookPath(value) {
  const raw = String(value || '').trim();
  if (!raw) return null;
  if (!raw.startsWith('/')) return null;
  if (raw.includes(' ')) return null;
  return raw;
}

function sanitizeHeaderName(value) {
  const raw = String(value || '').trim();
  if (!raw) return null;
  if (raw.length > 120) return null;
  if (!/^[A-Za-z0-9-]+$/.test(raw)) return null;
  return raw;
}

function sanitizePlain(value) {
  const raw = String(value || '').trim();
  return raw;
}
