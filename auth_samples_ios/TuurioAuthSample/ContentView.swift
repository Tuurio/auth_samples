import SwiftUI

struct ContentView: View {
  @StateObject private var auth = AuthService.shared

  var body: some View {
    AppShell(status: status) {
      if auth.loading {
        CardView {
          LoadingState(title: "Loading session", subtitle: "Verifying tokens and session state.")
        }
      } else if let session = auth.session {
        TokenView(session: session) {
          guard let presenter = UIViewController.topMost else {
            auth.errorMessage = "Unable to start logout."
            return
          }
          auth.startLogout(presenting: presenter)
        }
      } else {
        LoginView(error: auth.errorMessage) {
          guard let presenter = UIViewController.topMost else {
            auth.errorMessage = "Unable to start login."
            return
          }
          auth.startLogin(presenting: presenter)
        }
      }
    }
  }

  private var status: ShellStatus {
    if auth.loading {
      return ShellStatus(label: "Checking session", tone: .neutral)
    }
    if auth.session != nil {
      return ShellStatus(label: "Authenticated", tone: .good)
    }
    return ShellStatus(label: "Signed out", tone: .neutral)
  }
}

struct AppShell<Content: View>: View {
  let status: ShellStatus
  let content: Content

  init(status: ShellStatus, @ViewBuilder content: () -> Content) {
    self.status = status
    self.content = content()
  }

  var body: some View {
    GeometryReader { proxy in
      ZStack {
        AppTheme.background
          .ignoresSafeArea()
        if proxy.size.width >= 900 {
          HStack(alignment: .top, spacing: 32) {
            SidePanel(status: status)
              .frame(maxWidth: .infinity)
            MainPanel(content: content)
              .frame(maxWidth: .infinity)
          }
          .padding(.horizontal, 32)
          .padding(.vertical, 32)
        } else {
          VStack(alignment: .leading, spacing: 24) {
            MainPanel(content: content)
            SidePanel(status: status)
          }
          .padding(.horizontal, 24)
          .padding(.vertical, 24)
        }
      }
    }
  }
}

struct SidePanel: View {
  let status: ShellStatus

  var body: some View {
    VStack(alignment: .leading, spacing: 28) {
      HStack(spacing: 14) {
        ZStack {
          RoundedRectangle(cornerRadius: 14)
            .fill(LinearGradient(colors: [AppTheme.accent, AppTheme.sun], startPoint: .topLeading, endPoint: .bottomTrailing))
            .frame(width: 44, height: 44)
          Text("tu")
            .font(.system(size: 16, weight: .bold))
            .foregroundColor(.white)
        }
        VStack(alignment: .leading, spacing: 2) {
          Text("Tuurio Auth Studio")
            .font(.system(size: 16, weight: .semibold))
          Text("OIDC playground for OAuth 2.1")
            .font(.system(size: 13))
            .foregroundColor(AppTheme.muted)
        }
      }

      CardView {
        VStack(alignment: .leading, spacing: 12) {
          Text("Design for secure sign-in.")
            .font(.system(size: 28, weight: .bold, design: .serif))
          Text("A minimal iOS client that signs in with OpenID Connect, displays decoded tokens, and supports secure logout redirects.")
            .foregroundColor(AppTheme.muted)
          HStack(spacing: 12) {
            StatusPill(status: status)
            Text("Authority: test.id.tuurio.com")
              .font(.system(size: 13))
              .foregroundColor(AppTheme.muted)
          }
        }
      }

      VStack(alignment: .leading, spacing: 16) {
        InfoItem(title: "Architecture", body: "Authorization code flow + PKCE")
        InfoItem(title: "Storage", body: "Session storage for tokens")
        InfoItem(title: "Scope", body: "openid profile email")
      }
    }
  }
}

struct MainPanel<Content: View>: View {
  let content: Content

  var body: some View {
    ScrollView {
      VStack(alignment: .leading, spacing: 20) {
        content
      }
    }
  }
}

struct CardView<Content: View>: View {
  var tone: CardTone = .solid
  let content: Content

  init(tone: CardTone = .solid, @ViewBuilder content: () -> Content) {
    self.tone = tone
    self.content = content()
  }

  var body: some View {
    VStack(alignment: .leading, spacing: 12) {
      content
    }
    .padding(24)
    .background(tone.background)
    .cornerRadius(18)
    .shadow(color: Color.black.opacity(0.08), radius: 16, x: 0, y: 8)
  }
}

enum CardTone {
  case solid
  case soft
  case panel

  var background: Color {
    switch self {
    case .solid: return AppTheme.surface
    case .soft: return AppTheme.surfaceSoft
    case .panel: return AppTheme.surfacePanel
    }
  }
}

struct LoadingState: View {
  let title: String
  let subtitle: String

  var body: some View {
    HStack(spacing: 16) {
      Circle()
        .stroke(AppTheme.accent.opacity(0.2), lineWidth: 3)
        .frame(width: 32, height: 32)
      VStack(alignment: .leading, spacing: 6) {
        Text(title)
          .font(.system(size: 20, weight: .semibold))
        Text(subtitle)
          .foregroundColor(AppTheme.muted)
      }
    }
  }
}

struct LoginView: View {
  let error: String?
  let onLogin: () -> Void

  var body: some View {
    VStack(alignment: .leading, spacing: 20) {
      CardView {
        VStack(alignment: .leading, spacing: 8) {
          Text("OAuth 2.1 + OpenID Connect")
            .font(.system(size: 12, weight: .semibold))
            .foregroundColor(AppTheme.accentStrong)
            .tracking(1.2)
          Text("Sign in to continue")
            .font(.system(size: 22, weight: .semibold))
          Text("This app uses the authorization code flow with PKCE to fetch tokens securely for a browser-based client.")
            .foregroundColor(AppTheme.muted)
        }
        VStack(alignment: .leading, spacing: 8) {
          Button(action: onLogin) {
            Text("Continue with Tuurio ID")
              .font(.system(size: 16, weight: .semibold))
              .frame(maxWidth: .infinity)
              .padding(.vertical, 12)
              .background(LinearGradient(colors: [AppTheme.accent, AppTheme.sun], startPoint: .topLeading, endPoint: .bottomTrailing))
              .foregroundColor(.white)
              .cornerRadius(999)
          }
          Text("You'll be redirected to test.id.tuurio.com")
            .font(.system(size: 13))
            .foregroundColor(AppTheme.muted)
        }
        if let error, !error.isEmpty {
          StatusMessage(text: error)
        }
      }
      CardView(tone: .soft) {
        FeatureItem(title: "PKCE by default", body: "Proof Key for Code Exchange protects the code flow.")
        FeatureItem(title: "Short-lived tokens", body: "Access tokens are scoped to openid profile email.")
        FeatureItem(title: "Session aware", body: "Token state is persisted in session storage.")
      }
    }
  }
}

struct TokenView: View {
  let session: AuthSession
  let onLogout: () -> Void

  var body: some View {
    let scopeLabel = session.scope ?? "openid profile email"
    let expiresLabel = formatDate(session.expiresAt)

    VStack(alignment: .leading, spacing: 20) {
      CardView {
        VStack(alignment: .leading, spacing: 8) {
          Text("Session ready")
            .font(.system(size: 12, weight: .semibold))
            .foregroundColor(AppTheme.accentStrong)
            .tracking(1.2)
          Text("You're signed in")
            .font(.system(size: 22, weight: .semibold))
          Text("Tokens expire at \(expiresLabel) and are scoped for \(scopeLabel).")
            .foregroundColor(AppTheme.muted)
        }
        VStack(alignment: .leading, spacing: 8) {
          Button(action: onLogout) {
            Text("Logout")
              .font(.system(size: 16, weight: .semibold))
              .frame(maxWidth: .infinity)
              .padding(.vertical, 12)
              .background(Color.clear)
              .overlay(
                RoundedRectangle(cornerRadius: 999)
                  .stroke(AppTheme.line, lineWidth: 1)
              )
          }
          Text("Tokens expire automatically; logout revokes session.")
            .font(.system(size: 13))
            .foregroundColor(AppTheme.muted)
        }
      }

      VStack(spacing: 16) {
        TokenPanel(title: "Access Token", token: session.accessToken, description: "Used to call protected APIs.")
        TokenPanel(title: "ID Token", token: session.idToken ?? "", description: "Proves the authenticated user.")
      }

      CardView(tone: .soft) {
        Text("User profile")
          .font(.system(size: 16, weight: .semibold))
        CodeBlock(text: session.profileJson ?? "No profile claims.")
      }
    }
  }
}

struct TokenPanel: View {
  let title: String
  let token: String
  let description: String

  @State private var copied = false

  var body: some View {
    let decoded = decodeJwt(token)
    CardView(tone: .panel) {
      HStack(alignment: .top) {
        VStack(alignment: .leading, spacing: 6) {
          Text(title)
            .font(.system(size: 16, weight: .semibold))
          Text(description)
            .font(.system(size: 13))
            .foregroundColor(AppTheme.muted)
        }
        Spacer()
        Button(action: {
          UIPasteboard.general.string = token
          copied = true
        }) {
          Text(copied ? "Copied" : "Copy")
            .font(.system(size: 13, weight: .semibold))
            .padding(.horizontal, 12)
            .padding(.vertical, 6)
            .overlay(
              Capsule().stroke(AppTheme.line, lineWidth: 1)
            )
        }
      }
      CodeBlock(text: token.isEmpty ? "Not provided" : token)
      VStack(alignment: .leading, spacing: 8) {
        Text("Decoded claims")
          .font(.system(size: 12, weight: .semibold))
          .foregroundColor(AppTheme.accentStrong)
          .tracking(1.2)
        CodeBlock(text: decoded ?? "Not a JWT or unable to decode.")
      }
    }
  }
}

struct CodeBlock: View {
  let text: String

  var body: some View {
    ScrollView(.horizontal, showsIndicators: false) {
      Text(text)
        .font(.system(size: 12, design: .monospaced))
        .padding(16)
        .frame(maxWidth: .infinity, alignment: .leading)
        .background(Color(red: 248 / 255, green: 250 / 255, blue: 252 / 255))
        .cornerRadius(12)
    }
  }
}

struct FeatureItem: View {
  let title: String
  let body: String

  var body: some View {
    VStack(alignment: .leading, spacing: 6) {
      Text(title)
        .font(.system(size: 16, weight: .semibold))
      Text(body)
        .foregroundColor(AppTheme.muted)
    }
  }
}

struct StatusMessage: View {
  let text: String

  var body: some View {
    Text(text)
      .font(.system(size: 12, weight: .semibold))
      .foregroundColor(Color(red: 185 / 255, green: 28 / 255, blue: 28 / 255))
      .padding(.horizontal, 12)
      .padding(.vertical, 6)
      .background(Color(red: 248 / 255, green: 113 / 255, blue: 113 / 255).opacity(0.2))
      .cornerRadius(999)
  }
}

struct InfoItem: View {
  let title: String
  let body: String

  var body: some View {
    VStack(alignment: .leading, spacing: 4) {
      Text(title.uppercased())
        .font(.system(size: 12, weight: .semibold))
        .foregroundColor(AppTheme.accentStrong)
        .tracking(1.2)
      Text(body)
        .font(.system(size: 16, weight: .medium))
    }
  }
}

struct ShellStatus {
  let label: String
  let tone: StatusTone
}

enum StatusTone {
  case good
  case neutral
}

struct StatusPill: View {
  let status: ShellStatus

  var body: some View {
    let background: Color = status.tone == .good
      ? Color(red: 14 / 255, green: 165 / 255, blue: 164 / 255).opacity(0.18)
      : Color.black.opacity(0.08)
    let textColor: Color = status.tone == .good ? AppTheme.accentStrong : AppTheme.ink

    Text(status.label)
      .font(.system(size: 12, weight: .semibold))
      .foregroundColor(textColor)
      .padding(.horizontal, 12)
      .padding(.vertical, 6)
      .background(background)
      .cornerRadius(999)
  }
}

extension UIViewController {
  static var topMost: UIViewController? {
    guard
      let scene = UIApplication.shared.connectedScenes
        .compactMap({ $0 as? UIWindowScene })
        .first(where: { $0.activationState == .foregroundActive }),
      let root = scene.windows.first(where: { $0.isKeyWindow })?.rootViewController
    else {
      return nil
    }

    var top = root
    while let presented = top.presentedViewController {
      top = presented
    }
    return top
  }
}
