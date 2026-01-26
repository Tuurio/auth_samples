# Tuurio Auth Flutter Demo

A Flutter demo that signs in with OAuth 2.1 / OpenID Connect, then displays token contents and a logout button.

## What you need

- A client registered in your Tuurio account (from the id.tuurio.com dashboard).
- The redirect URI configured for your Flutter app.

Make sure the client has these URLs configured:

```
Redirect URI: com.example.app://oauth2redirect
Post-logout Redirect URI: http://localhost:5173/
```

## Setup

1) Create a Flutter project (if you want a full platform scaffold):

```
flutter create auth_samples_flutter
```

2) Replace the generated `lib/` folder and `pubspec.yaml` with the files in this repo’s `auth_samples_flutter`.
3) Run:

```
flutter pub get
flutter run
```

## URL scheme setup (required)

Flutter needs platform-specific URL scheme configuration for the redirect URI `com.example.app://oauth2redirect`.

### Android

Add the AppAuth redirect receiver to `android/app/src/main/AndroidManifest.xml`:

```xml
<activity
    android:name="net.openid.appauth.RedirectUriReceiverActivity"
    android:exported="true">
    <intent-filter>
        <action android:name="android.intent.action.VIEW" />
        <category android:name="android.intent.category.DEFAULT" />
        <category android:name="android.intent.category.BROWSABLE" />
        <data
            android:scheme="com.example.app"
            android:host="oauth2redirect" />
    </intent-filter>
</activity>
```

Also set the manifest placeholder (Android Gradle):

```gradle
defaultConfig {
  manifestPlaceholders = [ appAuthRedirectScheme: "com.example.app" ]
}
```

### iOS

Add a URL type to `ios/Runner/Info.plist`:

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

## What you will see

- A login screen with a “Continue with Tuurio ID” button.
- After you authenticate, you are redirected back to the app.
- The app shows:
  - Access token and ID token (raw + decoded claims).
  - Token expiry time and scope.
  - User profile JSON (decoded from the ID token).
  - Logout button that ends the session and returns to the app.

## Configuration

Edit `lib/auth_config.dart` with the values from your **Connect** page:

```
https://<tenantId>.id.tuurio.com/admin/clients
```

The current sample values are:

```
authorizationEndpoint: https://test.id.tuurio.com/oauth2/authorize
tokenEndpoint: https://test.id.tuurio.com/oauth2/token
clientId: spa-K53I
redirectUri: com.example.app://oauth2redirect
scopes: openid profile email
postLogoutRedirectUri: http://localhost:5173/
```

## Implemented snippet

The demo mirrors your provided `flutter_appauth` snippet in `lib/auth_controller.dart`:

- `authorizeAndExchangeCode` with `AuthorizationTokenRequest`.
- RP-initiated logout with `endSession` + `postLogoutRedirectUrl`.

## Notes

- Session state is stored in `SharedPreferences` to mimic the web demo’s session behavior.
- Make sure your Android/iOS bundle ID matches the URL scheme.

## Troubleshooting

**Login hangs after returning from the browser**
- Verify the redirect URI matches exactly.
- Ensure the URL scheme is configured on both Android and iOS.

**No matching state found**
- Avoid launching multiple auth flows in parallel.
- Confirm the redirect URI matches the one configured in your IdP.
