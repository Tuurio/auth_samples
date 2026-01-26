import UIKit

final class AppDelegate: NSObject, UIApplicationDelegate {
  func application(
    _ app: UIApplication,
    open url: URL,
    options: [UIApplication.OpenURLOptionsKey : Any] = [:]
  ) -> Bool {
    return AuthService.shared.resumeExternalUserAgentFlow(with: url)
  }
}
