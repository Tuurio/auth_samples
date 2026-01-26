# Tuurio Auth Android Demo

An Android (Jetpack Compose) demo that signs in with OAuth 2.1 / OpenID Connect, then displays token contents and a logout button.

## What you need

- A client registered in your Tuurio account (from the id.tuurio.com dashboard).
- The Android redirect URI configured in that client.

Make sure the client has these URLs configured:

```
Redirect URI: com.example.app://oauth2redirect
Post-logout Redirect URI: http://localhost:5173/
```

## Setup

Open the project in Android Studio:

```
auth_samples_android
```

Then run the `app` configuration on an emulator or device.

## What you will see

- A login screen with a “Continue with Tuurio ID” button.
- After you authenticate, you are redirected back to the app.
- The app shows:
  - Access token and ID token (raw + decoded claims).
  - Token expiry time and scope.
  - User profile JSON (decoded from the ID token).
  - Logout button that ends the session and returns to the app.

## Configuration

Edit `app/src/main/java/com/tuurio/authsample/auth/AuthConfig.kt` with the values from your **Connect** page:

```
https://<tenantId>.id.tuurio.com/admin/clients
```

The current sample values are:

```
authorizeEndpoint: https://test.id.tuurio.com/oauth2/authorize
tokenEndpoint: https://test.id.tuurio.com/oauth2/token
clientId: spa-K53I
redirectUri: com.example.app://oauth2redirect
scope: openid profile email
postLogoutRedirectUri: http://localhost:5173/
```

## Implemented snippet

The app mirrors your provided AppAuth snippet in `AuthRepository` and `AuthViewModel`, including:

- Building `AuthorizationServiceConfiguration` with authorize/token endpoints.
- Creating the `AuthorizationRequest` with PKCE and scope.
- Launching the authorization intent and exchanging the code for tokens.
- Fetching OIDC discovery for `end_session_endpoint` and starting RP-initiated logout.

## Notes

- Session state is stored in `SharedPreferences` to mimic the web demo’s session behavior.
- The redirect activity is wired in `AndroidManifest.xml` for `com.example.app://oauth2redirect`.

## URL scheme setup (required)

Ensure the redirect URI scheme in your app matches the client configuration.

Add the AppAuth redirect receiver to `app/src/main/AndroidManifest.xml`:

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

## Troubleshooting

**Login hangs after returning from the browser**
- Verify the redirect URI matches exactly.
- Ensure the redirect URI intent filter uses the correct scheme + host.

**No matching state found**
- Confirm that the same app instance handles both the request and redirect.
- Avoid launching multiple auth flows in parallel.
