import Foundation

struct AuthSession: Codable {
  let accessToken: String
  let idToken: String?
  let scope: String?
  let expiresAt: Date?
  let profileJson: String?
}
