import * as oidc from 'openid-client';

type Transaction = { verifier: string; state: string; expiresAt: number };
type StoredSession = { user: AuthenticatedUser; idToken?: string; expiresAt: number };
export type AuthenticatedUser = { sub: string; name?: string; email?: string };

const transactions = new Map<string, Transaction>();
const sessions = new Map<string, StoredSession>();
const MAX_EPHEMERAL_ENTRIES = 10_000;
let configuration: Promise<oidc.Configuration> | undefined;

function pruneExpired() {
  const now = Date.now();
  for (const [id, transaction] of transactions) if (transaction.expiresAt <= now) transactions.delete(id);
  for (const [id, session] of sessions) if (session.expiresAt <= now) sessions.delete(id);
}

function requireCapacity(store: Map<string, unknown>, kind: string) {
  pruneExpired();
  if (store.size >= MAX_EPHEMERAL_ENTRIES) throw new Error(`Too many active ${kind}; try again later.`);
}

function required(name: string): string {
  const value = process.env[name]?.trim();
  if (!value || value.startsWith('YOUR_')) throw new Error(`${name} is not configured.`);
  return value;
}

function redirectUri(name: string): string {
  const value = new URL(required(name));
  const loopback = ['localhost', '127.0.0.1', '[::1]'].includes(value.hostname);
  if (value.protocol !== 'https:' && !(value.protocol === 'http:' && loopback)) throw new Error(`${name} must use HTTPS outside an explicit loopback host.`);
  return value.href;
}

function settings() {
  const issuer = new URL(required('TUURIO_ISSUER'));
  const loopback = ['localhost', '127.0.0.1', '[::1]'].includes(issuer.hostname);
  if (issuer.protocol !== 'https:' && !(issuer.protocol === 'http:' && loopback)) throw new Error('TUURIO_ISSUER must use HTTPS outside an explicit loopback host.');
  return {
    issuer,
    clientId: required('TUURIO_CLIENT_ID'),
    clientSecret: process.env.TUURIO_CLIENT_SECRET?.trim() || undefined,
    redirectUri: redirectUri('TUURIO_REDIRECT_URI'),
    postLogoutRedirectUri: redirectUri('TUURIO_POST_LOGOUT_REDIRECT_URI'),
    scope: process.env.TUURIO_SCOPE?.trim() || 'openid profile email'
  };
}

async function config() {
  const value = settings();
  configuration ??= oidc.discovery(value.issuer, value.clientId, value.clientSecret);
  return configuration;
}

export async function beginLogin() {
  requireCapacity(transactions, 'login transactions');
  const value = settings();
  const verifier = oidc.randomPKCECodeVerifier();
  const state = oidc.randomState();
  const transactionId = oidc.randomState();
  transactions.set(transactionId, { verifier, state, expiresAt: Date.now() + 600_000 });
  const url = oidc.buildAuthorizationUrl(await config(), {
    redirect_uri: value.redirectUri,
    scope: value.scope,
    code_challenge: await oidc.calculatePKCECodeChallenge(verifier),
    code_challenge_method: 'S256',
    state
  });
  return { transactionId, url };
}

export async function completeLogin(currentUrl: URL, transactionId: string | undefined) {
  pruneExpired();
  const transaction = transactionId ? transactions.get(transactionId) : undefined;
  if (!transaction || transaction.expiresAt < Date.now()) throw new Error('Login transaction expired.');
  transactions.delete(transactionId!);
  if (currentUrl.searchParams.get('state') !== transaction.state) throw new Error('Invalid login state.');
  const client = await config();
  const tokens = await oidc.authorizationCodeGrant(client, currentUrl, {
    pkceCodeVerifier: transaction.verifier,
    expectedState: transaction.state
  });
  const claims = tokens.claims();
  if (!tokens.access_token || !claims?.sub) throw new Error('Validated identity is missing.');
  const profile = await oidc.fetchUserInfo(client, tokens.access_token, claims.sub);
  const sessionId = oidc.randomState();
  requireCapacity(sessions, 'sessions');
  const user = { sub: profile.sub, name: profile.name as string | undefined, email: profile.email as string | undefined };
  sessions.set(sessionId, { user, idToken: tokens.id_token, expiresAt: Date.now() + Math.min(tokens.expiresIn() ?? 3600, 3600) * 1000 });
  return sessionId;
}

export function getSession(sessionId: string | undefined) {
  pruneExpired();
  const session = sessionId ? sessions.get(sessionId) : undefined;
  if (session && session.expiresAt > Date.now()) return session;
  if (sessionId) sessions.delete(sessionId);
  return null;
}

export async function endSession(sessionId: string | undefined) {
  const session = getSession(sessionId);
  if (sessionId) sessions.delete(sessionId);
  const value = settings();
  return oidc.buildEndSessionUrl(await config(), {
    post_logout_redirect_uri: value.postLogoutRedirectUri,
    ...(session?.idToken ? { id_token_hint: session.idToken } : {})
  });
}
