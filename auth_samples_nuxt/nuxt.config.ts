export default defineNuxtConfig({
  compatibilityDate: '2026-08-01',
  devtools: { enabled: false },
  runtimeConfig: {
    tuurioIssuer: '',
    tuurioClientId: '',
    tuurioClientSecret: '',
    tuurioRedirectUri: 'http://localhost:3000/auth/callback',
    tuurioPostLogoutRedirectUri: 'http://localhost:3000/logout/callback',
    tuurioScope: 'openid profile email'
  },
  typescript: { strict: true }
});
