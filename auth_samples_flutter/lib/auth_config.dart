class AuthConfig {
  static const authorizationEndpoint =
      'https://your-tenant.id.tuurio.com/oauth2/authorize';
  static const tokenEndpoint = 'https://your-tenant.id.tuurio.com/oauth2/token';
  static const issuer = 'https://your-tenant.id.tuurio.com';
  static const clientId = 'replace-after-browser-handoff';
  static const redirectUri = 'com.example.app://oauth2redirect';
  static const postLogoutRedirectUri = 'http://localhost:5173/';
  static const scopes = ['openid', 'profile', 'email'];
}
