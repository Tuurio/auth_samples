const path = require('path');
const express = require('express');
const session = require('express-session');
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
const { renderPage, renderLoginView, renderTokenView, renderNotFound } = require('./src/view');

const app = express();
const publicDir = path.join(__dirname, 'public');

app.use(
  session({
    secret: 'tuurio-auth-sample',
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      sameSite: 'lax',
    },
  }),
);

app.use('/assets', express.static(path.join(publicDir, 'assets')));

app.get('/', (req, res) => {
  const auth = req.session.auth || null;
  const error = req.session.error || null;
  req.session.error = null;

  const status = auth
    ? { label: 'Authenticated', tone: 'good' }
    : { label: 'Signed out', tone: 'neutral' };

  const content = auth
    ? renderTokenView(auth, auth.accessDecoded, auth.idDecoded, auth.profileJson)
    : renderLoginView(error);

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
      scopeLabel: tokens.scope || config.scope,
      expiresLabel: formatTime(expiresAt),
      profileJson: userInfo ? JSON.stringify(userInfo, null, 2) : 'No profile data.',
      accessDecoded: accessDecoded ? JSON.stringify(accessDecoded, null, 2) : 'Not a JWT or unable to decode.',
      idDecoded: idDecoded ? JSON.stringify(idDecoded, null, 2) : 'Not a JWT or unable to decode.',
    };

    req.session.oauth = null;
    res.redirect('/');
  } catch (err) {
    req.session.error = err instanceof Error ? err.message : 'Login failed.';
    res.redirect('/');
  }
});

app.get('/logout', async (req, res) => {
  try {
    const discovery = await fetchDiscovery(config);
    const endSession = discovery.end_session_endpoint;
    if (!endSession) throw new Error('End session endpoint not found.');

    const idToken = req.session.auth?.id_token;
    req.session.auth = null;

    const params = new URLSearchParams({
      post_logout_redirect_uri: config.postLogoutRedirectUri,
    });
    if (idToken) {
      params.set('id_token_hint', idToken);
    }

    res.redirect(`${endSession}?${params.toString()}`);
  } catch (err) {
    req.session.error = err instanceof Error ? err.message : 'Logout failed.';
    res.redirect('/');
  }
});

app.use((req, res) => {
  res.status(404).send(renderPage({ label: 'Route not found', tone: 'neutral' }, renderNotFound()));
});

app.listen(8082, () => {
  console.log('Tuurio Auth Node demo running on http://localhost:8082');
});
