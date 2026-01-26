# Tuurio Auth iOS Demo

An iOS (SwiftUI) demo that signs in with OAuth 2.1 / OpenID Connect, then displays token contents and a logout button.

## What you need

- A client registered in your Tuurio account (from the id.tuurio.com dashboard).
- The iOS redirect URI configured in that client.

Make sure the client has these URLs configured:

```
Redirect URI: com.example.app://oauth2redirect
Post-logout Redirect URI: http://localhost:5173/
```

## Setup

1) Create a new iOS App in Xcode (SwiftUI, iOS 15+ recommended).
2) Add AppAuth via Swift Package Manager:
   - https://github.com/openid/AppAuth-iOS
3) Copy the files from `TuurioAuthSample/` into your new Xcode project target.
4) Configure the URL scheme in your target:
   - URL Types → add `com.example.app`
5) Run the app on a simulator or device.

## What you will see

- A login screen with a “Continue with Tuurio ID” button.
- After you authenticate, you are redirected back to the app.
- The app shows:
  - Access token and ID token (raw + decoded claims).
  - Token expiry time and scope.
  - User profile JSON (decoded from the ID token).
  - Logout button that ends the session and returns to the app.

## Configuration

Edit `TuurioAuthSample/AuthConfig.swift` with the values from your **Connect** page:

```
https://<tenantId>.id.tuurio.com/admin/clients
```

The current sample values are:

```
authorizationEndpoint: https://test.id.tuurio.com/oauth2/authorize
tokenEndpoint: https://test.id.tuurio.com/oauth2/token
clientId: spa-K53I
redirectURI: com.example.app://oauth2redirect
scopes: openid profile email
postLogoutRedirectURI: http://localhost:5173/
```

## Implemented snippet

The demo mirrors your provided AppAuth snippet in `AuthService.swift`:

- `OIDServiceConfiguration` + `OIDAuthorizationRequest`.
- `OIDAuthState.authState(byPresenting:)` for the code flow.
- Discovery + `OIDEndSessionRequest` for RP-initiated logout.
- URL handling in `AppDelegate` to resume the auth flow.

## Notes

- Session state is stored in `UserDefaults` to mimic the web demo’s session behavior.
- Make sure the URL scheme matches the redirect URI exactly.

## URL scheme setup (required)

Register the URL scheme `com.example.app` so the browser redirect returns to the app.

Add a URL type to `Info.plist`:

```xml
<key>CFBundleURLTypes</key>
<array>
  <dict>
    <key>CFBundleURLSchemes</key>
    <array>
      <string>com.example.app</string>
    </array>
  </dict>
</array>
```

Or in Xcode: **Runner target → Info → URL Types** → add `com.example.app`.

## Troubleshooting

**Login hangs after returning from the browser**
- Verify the URL scheme is registered and matches `com.example.app://oauth2redirect`.
- Ensure `AppDelegate` handles `openURL` to resume the auth flow.

**No matching state found**
- Avoid starting multiple auth flows in parallel.
- Confirm the redirect URI matches the one configured in your IdP.
