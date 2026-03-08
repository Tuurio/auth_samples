const path = require('path');
const express = require('express');
const session = require('express-session');
const MemoryStore = require('memorystore')(session);
const config = require('./src/config');
const {
  generateRandomString,
  buildAuthorizeUrl,
  exchangeCodeForTokens,
  fetchDiscovery,
  fetchUserInfo,
  decodeJwt,
  formatTime,
} = require('./src/oauth');
const {
  renderPage,
  renderLoginView,
  renderTokenView,
  renderLogoutCallback,
  renderNotFound,
} = require('./src/view');

const app = express();
const publicDir = path.join(__dirname, 'public');
const sessionStore = new MemoryStore({
  checkPeriod: 24 * 60 * 60 * 1000,
});

if (config.sessionTrustProxy) {
  app.set('trust proxy', 1);
}

if (!config.sessionSecret) {
  throw new Error(
    'Invalid TUURIO_SESSION_SECRET. Set a non-default secret (>=32 chars) for production usage.',
  );
}

if (config.isProduction) {
  console.warn(
    '[auth_samples_node] In-memory session store is active. Use a persistent session store for production deployments.',
  );
}

app.use(
  session({
    name: config.sessionCookieName,
    secret: config.sessionSecret,
    proxy: config.sessionTrustProxy,
    store: sessionStore,
    resave: false,
    saveUninitialized: false,
    unset: 'destroy',
    cookie: {
      httpOnly: true,
      sameSite: config.sessionSameSite,
      secure: config.sessionSecureCookie,
      maxAge: config.sessionMaxAgeMs,
    },
  }),
);

app.use('/assets', express.static(path.join(publicDir, 'assets')));

app.get('/', (req, res) => {
  const auth = req.session.auth || null;
  const error = req.session.error || null;
  req.session.error = null;

  const status = auth
    ? { label: 'Authenticated', tone: 'good', authority: config.authority }
    : { label: 'Signed out', tone: 'neutral', authority: config.authority };

  const content = auth
    ? renderTokenView(auth, {
        authority: config.authority,
        discoveryEndpoint: config.discoveryEndpoint,
      })
    : renderLoginView({ error, authorityHost: new URL(config.authority).host });

  res.status(200).send(renderPage(status, content));
});

app.get('/login', (req, res) => {
  const state = generateRandomString(32);
  const verifier = generateRandomString(64);
  req.session.oauth = { state, verifier };

  const authorizeUrl = buildAuthorizeUrl(config, state, verifier);
  res.redirect(authorizeUrl);
});

app.get('/auth/callback', async (req, res) => {
  try {
    if (req.query.error) {
      throw new Error(req.query.error_description || 'Login failed.');
    }

    const code = req.query.code;
    const returnedState = req.query.state;
    if (!code) throw new Error('Missing authorization code.');

    const oauth = req.session.oauth;
    if (!oauth || oauth.state !== returnedState) {
      throw new Error('State mismatch.');
    }

    const tokens = await exchangeCodeForTokens(config, code, oauth.verifier);
    if (!tokens.access_token) throw new Error('Missing access token.');

    const expiresAt = tokens.expires_in
      ? Math.floor(Date.now() / 1000) + Number(tokens.expires_in)
      : tokens.expires_at;

    const accessDecoded = decodeJwt(tokens.access_token);
    const idDecoded = decodeJwt(tokens.id_token || '');
    let userInfo = null;
    try {
      userInfo = await fetchUserInfo(config, tokens.access_token);
    } catch {
      userInfo = null;
    }

    req.session.auth = {
      access_token: tokens.access_token,
      id_token: tokens.id_token || '',
      scope: tokens.scope || config.scope,
      expiresAt,
      expiresLabel: formatTime(expiresAt),
      profileJson: userInfo ? JSON.stringify(userInfo, null, 2) : 'No profile data.',
      accessClaims: accessDecoded,
      idClaims: idDecoded,
    };

    req.session.oauth = null;
    res.redirect('/');
  } catch (err) {
    req.session.error = err instanceof Error ? err.message : 'Login failed.';
    res.redirect('/');
  }
});

app.get('/logout/callback', (req, res) => {
  res.status(200).send(
    renderPage(
      { label: 'Signed out', tone: 'neutral', authority: config.authority },
      renderLogoutCallback({ sessionCookieName: config.sessionCookieName }),
    ),
  );
});

app.get('/logout', async (req, res) => {
  try {
    const discovery = await fetchDiscovery(config);
    const endSession = discovery.end_session_endpoint;
    if (!endSession) throw new Error('End session endpoint not found.');
    const idTokenHint = req.session.auth?.id_token || '';

    const params = new URLSearchParams({
      client_id: config.clientId,
      post_logout_redirect_uri: config.postLogoutRedirectUri,
    });
    if (idTokenHint) {
      params.set('id_token_hint', idTokenHint);
    }

    await new Promise((resolve, reject) => {
      req.session.destroy((error) => {
        if (error) {
          reject(error);
          return;
        }
        resolve(undefined);
      });
    });
    res.clearCookie(config.sessionCookieName);
    res.redirect(`${endSession}?${params.toString()}`);
  } catch (err) {
    req.session.error = err instanceof Error ? err.message : 'Logout failed.';
    res.redirect('/');
  }
});

app.post(config.webhookListenPath, express.json({ limit: '1mb' }), (req, res) => {
  const providedApiKey = req.get(config.webhookApiKeyHeader) || '';
  if (config.webhookApiKey && providedApiKey !== config.webhookApiKey) {
    console.warn('[tuurio-webhook] rejected request with invalid API key header');
    res.status(401).json({ accepted: false, error: 'invalid_api_key' });
    return;
  }

  const eventType = req.get('X-Tuurio-Event') || 'unknown';
  const eventId = req.get('X-Tuurio-Event-Id') || '';
  const signature = req.get('X-Tuurio-Signature') || '';
  const payload = req.body ?? {};

  console.log(
    '[tuurio-webhook] event received',
    JSON.stringify(
      {
        webhookId: config.webhookId || null,
        eventType,
        eventId,
        signature,
        payload,
      },
      null,
      2,
    ),
  );

  res.status(202).json({ accepted: true });
});

app.use((req, res) => {
  res
    .status(404)
    .send(
      renderPage(
        { label: 'Route not found', tone: 'neutral', authority: config.authority },
        renderNotFound(),
      ),
    );
});

app.listen(8082, () => {
  console.log('Tuurio Auth Node demo running on http://localhost:8082');
  console.log(`[tuurio-webhook] listening on http://localhost:8082${config.webhookListenPath}`);
  if (config.webhookEditUrl) {
    console.log(`[tuurio-webhook] update endpoint URL after deployment at ${config.webhookEditUrl}`);
  }
});
