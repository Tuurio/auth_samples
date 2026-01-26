import Foundation
import UIKit
import AppAuth

@MainActor
final class AuthService: ObservableObject {
  static let shared = AuthService()

  @Published private(set) var session: AuthSession?
  @Published private(set) var loading = true
  @Published var errorMessage: String?

  private let storage = SessionStorage()
  private var authState: OIDAuthState?
  private var currentFlow: OIDExternalUserAgentSession?

  private init() {
    session = storage.load()
    loading = false
  }

  func startLogin(presenting: UIViewController) {
    errorMessage = nil

    let config = OIDServiceConfiguration(
      authorizationEndpoint: AuthConfig.authorizationEndpoint,
      tokenEndpoint: AuthConfig.tokenEndpoint
    )

    let request = OIDAuthorizationRequest(
      configuration: config,
      clientId: AuthConfig.clientId,
      scopes: AuthConfig.scopes,
      redirectURL: AuthConfig.redirectURI,
      responseType: OIDResponseTypeCode,
      additionalParameters: nil
    )

    currentFlow = OIDAuthState.authState(byPresenting: request, presenting: presenting) { [weak self] state, error in
      guard let self else { return }
      self.currentFlow = nil
      if let error {
        self.errorMessage = error.localizedDescription
        return
      }
      guard let state else {
        self.errorMessage = "Login failed."
        return
      }
      self.authState = state
      self.updateSessionFromState()
      if let accessToken = state.lastTokenResponse?.accessToken {
        Task {
          await self.loadUserInfo(accessToken: accessToken)
        }
      }
    }
  }

  func startLogout(presenting: UIViewController) {
    errorMessage = nil

    OIDAuthorizationService.discoverConfiguration(forIssuer: AuthConfig.issuer) { [weak self] config, error in
      guard let self else { return }
      guard let config else {
        DispatchQueue.main.async {
          self.errorMessage = error?.localizedDescription ?? "Unable to load discovery document."
        }
        return
      }

      let endSession = OIDEndSessionRequest(
        configuration: config,
        idTokenHint: nil,
        postLogoutRedirectURL: AuthConfig.postLogoutRedirectURI,
        additionalParameters: nil
      )

      DispatchQueue.main.async {
        self.currentFlow = OIDAuthorizationService.present(endSession, presenting: presenting) { _, _ in
          self.currentFlow = nil
          self.clearSession()
        }
      }
    }
  }

  func resumeExternalUserAgentFlow(with url: URL) -> Bool {
    if let flow = currentFlow, flow.resumeExternalUserAgentFlow(with: url) {
      currentFlow = nil
      return true
    }
    return false
  }

  func clearSession() {
    authState = nil
    session = nil
    storage.clear()
  }

  private func updateSessionFromState() {
    guard let tokenResponse = authState?.lastTokenResponse else {
      errorMessage = "Missing token response."
      return
    }
    guard let accessToken = tokenResponse.accessToken, !accessToken.isEmpty else {
      errorMessage = "Missing access token."
      return
    }

    let idToken = tokenResponse.idToken
    let session = AuthSession(
      accessToken: accessToken,
      idToken: idToken,
      scope: tokenResponse.scope,
      expiresAt: tokenResponse.accessTokenExpirationDate,
      profileJson: session?.profileJson
    )

    self.session = session
    storage.save(session)
  }

  private func loadUserInfo(accessToken: String) async {
    do {
      let config = try await discoverConfiguration()
      guard let userInfoEndpoint = config.discoveryDocument?.userinfoEndpoint else {
        return
      }

      var request = URLRequest(url: userInfoEndpoint)
      request.setValue("Bearer \(accessToken)", forHTTPHeaderField: "Authorization")

      let (data, response) = try await URLSession.shared.data(for: request)
      guard let http = response as? HTTPURLResponse, http.statusCode < 300 else {
        return
      }

      let json = try JSONSerialization.jsonObject(with: data)
      let pretty = try JSONSerialization.data(withJSONObject: json, options: [.prettyPrinted])
      let profile = String(data: pretty, encoding: .utf8)

      if var current = session {
        current = AuthSession(
          accessToken: current.accessToken,
          idToken: current.idToken,
          scope: current.scope,
          expiresAt: current.expiresAt,
          profileJson: profile
        )
        session = current
        storage.save(current)
      }
    } catch {
      // Ignore userinfo errors for demo
    }
  }

  private func discoverConfiguration() async throws -> OIDServiceConfiguration {
    try await withCheckedThrowingContinuation { continuation in
      OIDAuthorizationService.discoverConfiguration(forIssuer: AuthConfig.issuer) { config, error in
        if let config {
          continuation.resume(returning: config)
        } else {
          continuation.resume(throwing: error ?? NSError(domain: "Auth", code: 1))
        }
      }
    }
  }
}
