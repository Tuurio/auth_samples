class AuthConfig {
  static const authorizationEndpoint = 'https://test.id.tuurio.com/oauth2/authorize';
  static const tokenEndpoint = 'https://test.id.tuurio.com/oauth2/token';
  static const issuer = 'https://test.id.tuurio.com';
  static const clientId = 'spa-K53I';
  static const redirectUri = 'com.example.app://oauth2redirect';
  static const postLogoutRedirectUri = 'http://localhost:5173/';
  static const scopes = ['openid', 'profile', 'email'];
}
