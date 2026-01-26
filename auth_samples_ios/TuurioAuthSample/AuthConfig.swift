import Foundation

enum AuthConfig {
  static let authorizationEndpoint = URL(string: "https://test.id.tuurio.com/oauth2/authorize")!
  static let tokenEndpoint = URL(string: "https://test.id.tuurio.com/oauth2/token")!
  static let issuer = URL(string: "https://test.id.tuurio.com")!
  static let clientId = "spa-K53I"
  static let redirectURI = URL(string: "com.example.app://oauth2redirect")!
  static let postLogoutRedirectURI = URL(string: "http://localhost:5173/")!
  static let scopes = ["openid", "profile", "email"]
}
