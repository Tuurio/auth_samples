const crypto = require('crypto');

function base64urlEncode(buffer) {
  return buffer.toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function base64urlDecode(value) {
  const padded = value.replace(/-/g, '+').replace(/_/g, '/');
  const padLength = padded.length % 4;
  const base64 = padLength ? padded.padEnd(padded.length + (4 - padLength), '=') : padded;
  return Buffer.from(base64, 'base64');
}

function generateRandomString(length = 32) {
  return base64urlEncode(crypto.randomBytes(length));
}

function pkceChallenge(verifier) {
  const hash = crypto.createHash('sha256').update(verifier).digest();
  return base64urlEncode(hash);
}

function buildAuthorizeUrl(config, state, verifier) {
  const params = new URLSearchParams({
    client_id: config.clientId,
    redirect_uri: config.redirectUri,
    response_type: 'code',
    scope: config.scope,
    state,
    code_challenge: pkceChallenge(verifier),
    code_challenge_method: 'S256',
  });

  return `${config.authorizeEndpoint}?${params.toString()}`;
}

async function exchangeCodeForTokens(config, code, verifier) {
  const body = new URLSearchParams({
    grant_type: 'authorization_code',
    code,
    redirect_uri: config.redirectUri,
    client_id: config.clientId,
    code_verifier: verifier,
  });

  const response = await fetch(config.tokenEndpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body,
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(text || 'Token exchange failed.');
  }

  return await response.json();
}

async function fetchDiscovery(config) {
  const response = await fetch(config.discoveryEndpoint);
  if (!response.ok) {
    throw new Error('Unable to load discovery document.');
  }
  return await response.json();
}

async function fetchUserInfo(config, accessToken) {
  const discovery = await fetchDiscovery(config);
  const endpoint = discovery.userinfo_endpoint;
  if (!endpoint) {
    throw new Error('UserInfo endpoint not found.');
  }
  const response = await fetch(endpoint, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
  if (!response.ok) {
    const text = await response.text();
    throw new Error(text || 'Failed to load user profile.');
  }
  return await response.json();
}

function decodeJwt(token) {
  if (!token) return null;
  const parts = token.split('.');
  if (parts.length < 2) return null;
  try {
    const payload = JSON.parse(base64urlDecode(parts[1]).toString('utf8'));
    return payload;
  } catch {
    return null;
  }
}

function formatTime(unixSeconds) {
  if (!unixSeconds) return 'unknown time';
  const date = new Date(unixSeconds * 1000);
  return date.toLocaleString();
}

module.exports = {
  generateRandomString,
  buildAuthorizeUrl,
  exchangeCodeForTokens,
  fetchDiscovery,
  fetchUserInfo,
  decodeJwt,
  formatTime,
};
