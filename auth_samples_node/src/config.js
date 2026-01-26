module.exports = {
  authority: 'https://test.id.tuurio.com',
  authorizeEndpoint: 'https://test.id.tuurio.com/oauth2/authorize',
  tokenEndpoint: 'https://test.id.tuurio.com/oauth2/token',
  discoveryEndpoint: 'https://test.id.tuurio.com/.well-known/openid-configuration',
  clientId: 'spa-K53I',
  redirectUri: 'http://localhost:8082/auth/callback',
  postLogoutRedirectUri: 'http://localhost:8082/',
  scope: 'openid profile email',
};
