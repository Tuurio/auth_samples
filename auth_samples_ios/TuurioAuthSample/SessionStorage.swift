import Foundation

final class SessionStorage {
  private let key = "tuurio_auth_session"
  private let defaults = UserDefaults.standard

  func save(_ session: AuthSession) {
    if let data = try? JSONEncoder().encode(session) {
      defaults.set(data, forKey: key)
    }
  }

  func load() -> AuthSession? {
    guard let data = defaults.data(forKey: key) else { return nil }
    guard let session = try? JSONDecoder().decode(AuthSession.self, from: data) else { return nil }
    if let expiresAt = session.expiresAt, expiresAt <= Date() {
      clear()
      return nil
    }
    return session
  }

  func clear() {
    defaults.removeObject(forKey: key)
  }
}
