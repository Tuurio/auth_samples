import * as oidc from 'openid-client';

type Transaction = { verifier: string; state: string; expiresAt: number };
type User = { sub: string; name?: string; email?: string };
type StoredSession = { user: User; idToken?: string; expiresAt: number };
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

function required(value: unknown, name: string) {
  const normalized = String(value ?? '').trim();
  if (!normalized || normalized.startsWith('YOUR_')) throw new Error(`${name} is not configured.`);
  return normalized;
}

function redirectUri(value: unknown, name: string) {
  const parsed = new URL(required(value, name));
  const loopback = ['localhost', '127.0.0.1', '[::1]'].includes(parsed.hostname);
  if (parsed.protocol !== 'https:' && !(parsed.protocol === 'http:' && loopback)) throw new Error(`${name} must use HTTPS outside an explicit loopback host.`);
  return parsed.href;
}

function settings() {
  const runtime = useRuntimeConfig();
  const issuer = new URL(required(runtime.tuurioIssuer, 'NUXT_TUURIO_ISSUER'));
  const loopback = ['localhost', '127.0.0.1', '[::1]'].includes(issuer.hostname);
  if (issuer.protocol !== 'https:' && !(issuer.protocol === 'http:' && loopback)) throw new Error('Issuer must use HTTPS outside an explicit loopback host.');
  return {
    issuer,
    clientId: required(runtime.tuurioClientId, 'NUXT_TUURIO_CLIENT_ID'),
    clientSecret: String(runtime.tuurioClientSecret || '').trim() || undefined,
    redirectUri: redirectUri(runtime.tuurioRedirectUri, 'NUXT_TUURIO_REDIRECT_URI'),
    postLogoutRedirectUri: redirectUri(runtime.tuurioPostLogoutRedirectUri, 'NUXT_TUURIO_POST_LOGOUT_REDIRECT_URI'),
    scope: String(runtime.tuurioScope || 'openid profile email')
  };
}

async function config() {
  const value = settings();
  configuration ??= oidc.discovery(value.issuer, value.clientId, value.clientSecret).catch((error) => {
    configuration = undefined;
    throw error;
  });
  return configuration;
}

export async function beginLogin() {
  requireCapacity(transactions, 'login transactions');
  const value = settings();
  const verifier = oidc.randomPKCECodeVerifier();
  const state = oidc.randomState();
  const transactionId = oidc.randomState();
  transactions.set(transactionId, { verifier, state, expiresAt: Date.now() + 600_000 });
  return {
    transactionId,
    url: oidc.buildAuthorizationUrl(await config(), {
      redirect_uri: value.redirectUri,
      scope: value.scope,
      code_challenge: await oidc.calculatePKCECodeChallenge(verifier),
      code_challenge_method: 'S256',
      state
    })
  };
}

export async function completeLogin(currentUrl: URL, transactionId?: string) {
  pruneExpired();
  const transaction = transactionId ? transactions.get(transactionId) : undefined;
  if (!transaction || transaction.expiresAt < Date.now()) throw new Error('Login transaction expired.');
  transactions.delete(transactionId!);
  if (currentUrl.searchParams.get('state') !== transaction.state) throw new Error('Invalid login state.');
  const client = await config();
  const tokens = await oidc.authorizationCodeGrant(client, currentUrl, { pkceCodeVerifier: transaction.verifier, expectedState: transaction.state });
  const claims = tokens.claims();
  if (!tokens.access_token || !claims?.sub) throw new Error('Validated identity is missing.');
  const profile = await oidc.fetchUserInfo(client, tokens.access_token, claims.sub);
  const sessionId = oidc.randomState();
  requireCapacity(sessions, 'sessions');
  const user = { sub: profile.sub, name: profile.name as string | undefined, email: profile.email as string | undefined };
  sessions.set(sessionId, { user, idToken: tokens.id_token, expiresAt: Date.now() + Math.min(tokens.expiresIn() ?? 3600, 3600) * 1000 });
  return sessionId;
}

export function getTuurioSession(sessionId?: string) {
  pruneExpired();
  const session = sessionId ? sessions.get(sessionId) : undefined;
  if (session && session.expiresAt > Date.now()) return session;
  if (sessionId) sessions.delete(sessionId);
  return null;
}

export async function endSession(sessionId?: string) {
  const session = getTuurioSession(sessionId);
  if (sessionId) sessions.delete(sessionId);
  const value = settings();
  return oidc.buildEndSessionUrl(await config(), { post_logout_redirect_uri: value.postLogoutRedirectUri, ...(session?.idToken ? { id_token_hint: session.idToken } : {}) });
}
