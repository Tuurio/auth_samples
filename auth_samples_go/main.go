package main

import (
	"bufio"
	"context"
	"crypto/rand"
	"crypto/sha256"
	"encoding/base64"
	"encoding/json"
	"fmt"
	"html"
	"io"
	"net/http"
	"net/url"
	"os"
	"path/filepath"
	"strings"
	"sync"
	"time"

	"golang.org/x/oauth2"
)

type Config struct {
	Authority             string
	AuthorizeEndpoint     string
	TokenEndpoint         string
	DiscoveryEndpoint     string
	ClientID              string
	ClientSecret          string
	RedirectURI           string
	PostLogoutRedirectURI string
	Scope                 []string
	WebhookID             string
	WebhookURL            string
	WebhookEditURL        string
	WebhookSigningSecret  string
	WebhookListenPath     string
	WebhookAPIKeyHeader   string
	WebhookAPIKey         string
}

var config = loadConfig()

var oauthConfig = &oauth2.Config{
	ClientID:     config.ClientID,
	ClientSecret: config.ClientSecret,
	RedirectURL:  config.RedirectURI,
	Scopes:       config.Scope,
	Endpoint: oauth2.Endpoint{
		AuthURL:  config.AuthorizeEndpoint,
		TokenURL: config.TokenEndpoint,
	},
}

type Session struct {
	State         string
	Verifier      string
	Token         *oauth2.Token
	IDToken       string
	ScopeLabel    string
	ExpiresLabel  string
	AccessDecoded string
	IDDecoded     string
	ProfileJSON   string
	Error         string
}

type sessionStore struct {
	mu       sync.Mutex
	sessions map[string]*Session
}

var store = sessionStore{sessions: make(map[string]*Session)}

var discoveryCache struct {
	mu   sync.Mutex
	data map[string]string
}

func main() {
	mux := http.NewServeMux()
	mux.Handle("/assets/", http.StripPrefix("/assets/", http.FileServer(http.Dir(filepath.Join("public", "assets")))))
	mux.HandleFunc("/login", withSession(handleLogin))
	mux.HandleFunc("/auth/callback", withSession(handleCallback))
	mux.HandleFunc("/logout", withSession(handleLogout))
	mux.HandleFunc(config.WebhookListenPath, handleWebhook)
	mux.HandleFunc("/", withSession(handleHome))

	fmt.Println("Tuurio Auth Go demo running on http://localhost:8084")
	fmt.Printf("[tuurio-webhook] listening on http://localhost:8084%s\n", config.WebhookListenPath)
	if config.WebhookEditURL != "" {
		fmt.Printf("[tuurio-webhook] update endpoint URL after deployment at %s\n", config.WebhookEditURL)
	}
	if err := http.ListenAndServe(":8084", mux); err != nil {
		panic(err)
	}
}

func loadConfig() Config {
	loadDotEnvFile(".env")

	authority := normalizeAuthority(os.Getenv("TUURIO_ISSUER"))
	if authority == "" {
		authority = "https://test.id.tuurio.com"
	}

	clientID := sanitizeClientID(os.Getenv("TUURIO_CLIENT_ID"))
	if clientID == "" {
		clientID = "php-KQD8"
	}

	clientSecret := strings.TrimSpace(os.Getenv("TUURIO_CLIENT_SECRET"))
	if clientSecret == "" {
		clientSecret = "YOUR_CLIENT_SECRET"
	}

	redirectURI := normalizeHTTPURL(os.Getenv("TUURIO_REDIRECT_URI"))
	if redirectURI == "" {
		redirectURI = "http://localhost:8084/auth/callback"
	}

	postLogoutRedirectURI := normalizeHTTPURL(os.Getenv("TUURIO_POST_LOGOUT_REDIRECT_URI"))
	if postLogoutRedirectURI == "" {
		postLogoutRedirectURI = "http://localhost:8084/"
	}

	scopeRaw := sanitizeScope(os.Getenv("TUURIO_SCOPE"))
	if scopeRaw == "" {
		scopeRaw = "openid profile email"
	}

	webhookListenPath := normalizeWebhookPath(os.Getenv("TUURIO_WEBHOOK_LISTEN_PATH"))
	if webhookListenPath == "" {
		webhookListenPath = "/webhooks/tuurio"
	}

	webhookAPIKeyHeader := sanitizeHeaderName(os.Getenv("TUURIO_WEBHOOK_API_KEY_HEADER"))
	if webhookAPIKeyHeader == "" {
		webhookAPIKeyHeader = "X-Tuurio-Webhook-Key"
	}

	return Config{
		Authority:             authority,
		AuthorizeEndpoint:     authority + "/oauth2/authorize",
		TokenEndpoint:         authority + "/oauth2/token",
		DiscoveryEndpoint:     authority + "/.well-known/openid-configuration",
		ClientID:              clientID,
		ClientSecret:          clientSecret,
		RedirectURI:           redirectURI,
		PostLogoutRedirectURI: postLogoutRedirectURI,
		Scope:                 strings.Fields(scopeRaw),
		WebhookID:             strings.TrimSpace(os.Getenv("TUURIO_WEBHOOK_ID")),
		WebhookURL:            normalizeHTTPURL(os.Getenv("TUURIO_WEBHOOK_URL")),
		WebhookEditURL:        normalizeHTTPURL(os.Getenv("TUURIO_WEBHOOK_EDIT_URL")),
		WebhookSigningSecret:  strings.TrimSpace(os.Getenv("TUURIO_WEBHOOK_SIGNING_SECRET")),
		WebhookListenPath:     webhookListenPath,
		WebhookAPIKeyHeader:   webhookAPIKeyHeader,
		WebhookAPIKey:         strings.TrimSpace(os.Getenv("TUURIO_WEBHOOK_API_KEY")),
	}
}

func loadDotEnvFile(filePath string) {
	file, err := os.Open(filePath)
	if err != nil {
		return
	}
	defer file.Close()

	scanner := bufio.NewScanner(file)
	for scanner.Scan() {
		line := strings.TrimSpace(scanner.Text())
		if line == "" || strings.HasPrefix(line, "#") {
			continue
		}
		separator := strings.Index(line, "=")
		if separator <= 0 {
			continue
		}
		key := strings.TrimSpace(line[:separator])
		value := strings.TrimSpace(line[separator+1:])
		value = strings.Trim(value, "\"'")
		if key == "" {
			continue
		}
		if _, exists := os.LookupEnv(key); !exists {
			_ = os.Setenv(key, value)
		}
	}
}

func normalizeAuthority(value string) string {
	raw := strings.TrimSpace(value)
	if raw == "" {
		return ""
	}
	parsed, err := url.Parse(raw)
	if err != nil || (parsed.Scheme != "http" && parsed.Scheme != "https") || parsed.Host == "" {
		return ""
	}
	parsed.Path = ""
	parsed.RawPath = ""
	parsed.RawQuery = ""
	parsed.Fragment = ""
	return parsed.Scheme + "://" + parsed.Host
}

func normalizeHTTPURL(value string) string {
	raw := strings.TrimSpace(value)
	if raw == "" {
		return ""
	}
	parsed, err := url.Parse(raw)
	if err != nil || (parsed.Scheme != "http" && parsed.Scheme != "https") || parsed.Host == "" {
		return ""
	}
	return parsed.String()
}

func sanitizeClientID(value string) string {
	raw := strings.TrimSpace(value)
	if raw == "" || len(raw) > 120 {
		return ""
	}
	for _, ch := range raw {
		if (ch >= 'a' && ch <= 'z') || (ch >= 'A' && ch <= 'Z') || (ch >= '0' && ch <= '9') {
			continue
		}
		if ch == '.' || ch == '_' || ch == '-' {
			continue
		}
		return ""
	}
	return raw
}

func sanitizeScope(value string) string {
	raw := strings.TrimSpace(value)
	if raw == "" {
		return ""
	}
	valid := make([]string, 0)
	for _, part := range strings.Fields(raw) {
		ok := true
		for _, ch := range part {
			if (ch >= 'a' && ch <= 'z') || (ch >= 'A' && ch <= 'Z') || (ch >= '0' && ch <= '9') {
				continue
			}
			if ch == '.' || ch == '_' || ch == ':' || ch == '-' {
				continue
			}
			ok = false
			break
		}
		if ok {
			valid = append(valid, part)
		}
	}
	return strings.Join(valid, " ")
}

func normalizeWebhookPath(value string) string {
	raw := strings.TrimSpace(value)
	if raw == "" {
		return ""
	}
	if !strings.HasPrefix(raw, "/") || strings.Contains(raw, " ") {
		return ""
	}
	return raw
}

func sanitizeHeaderName(value string) string {
	raw := strings.TrimSpace(value)
	if raw == "" || len(raw) > 120 {
		return ""
	}
	for _, ch := range raw {
		if (ch >= 'a' && ch <= 'z') || (ch >= 'A' && ch <= 'Z') || (ch >= '0' && ch <= '9') || ch == '-' {
			continue
		}
		return ""
	}
	return raw
}

func withSession(handler func(http.ResponseWriter, *http.Request, *Session)) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		session := getSession(w, r)
		handler(w, r, session)
	}
}

func getSession(w http.ResponseWriter, r *http.Request) *Session {
	store.mu.Lock()
	defer store.mu.Unlock()

	cookie, _ := r.Cookie("sid")
	var sid string
	if cookie != nil {
		sid = cookie.Value
	}
	if sid == "" || store.sessions[sid] == nil {
		sid = randomString(16)
		store.sessions[sid] = &Session{}
		http.SetCookie(w, &http.Cookie{
			Name:     "sid",
			Value:    sid,
			Path:     "/",
			HttpOnly: true,
			SameSite: http.SameSiteLaxMode,
		})
	}
	return store.sessions[sid]
}

func handleHome(w http.ResponseWriter, r *http.Request, session *Session) {
	if r.URL.Path != "/" {
		handleNotFound(w, r, session)
		return
	}

	if session.Token != nil && session.Token.Expiry.Before(time.Now()) {
		resetSession(session)
	}

	status := statusForSession(session)
	content := renderLoginView(session.Error)
	if session.Token != nil {
		content = renderTokenView(session)
	}
	session.Error = ""
	renderPage(w, status, content)
}

func handleLogin(w http.ResponseWriter, r *http.Request, session *Session) {
	state := randomString(32)
	verifier := randomString(64)
	session.State = state
	session.Verifier = verifier

	challenge := pkceChallenge(verifier)

	url := oauthConfig.AuthCodeURL(
		state,
		oauth2.SetAuthURLParam("code_challenge", challenge),
		oauth2.SetAuthURLParam("code_challenge_method", "S256"),
	)

	http.Redirect(w, r, url, http.StatusFound)
}

func handleCallback(w http.ResponseWriter, r *http.Request, session *Session) {
	if errParam := r.URL.Query().Get("error"); errParam != "" {
		session.Error = r.URL.Query().Get("error_description")
		if session.Error == "" {
			session.Error = "Login failed."
		}
		http.Redirect(w, r, "/", http.StatusFound)
		return
	}

	code := r.URL.Query().Get("code")
	state := r.URL.Query().Get("state")
	if code == "" {
		session.Error = "Missing authorization code."
		http.Redirect(w, r, "/", http.StatusFound)
		return
	}
	if session.State == "" || session.State != state {
		session.Error = "State mismatch."
		http.Redirect(w, r, "/", http.StatusFound)
		return
	}

	token, err := oauthConfig.Exchange(
		r.Context(),
		code,
		oauth2.SetAuthURLParam("code_verifier", session.Verifier),
	)
	if err != nil {
		session.Error = err.Error()
		http.Redirect(w, r, "/", http.StatusFound)
		return
	}

	idToken, _ := token.Extra("id_token").(string)

	userInfoJSON := fetchUserInfo(r.Context(), token.AccessToken)

	session.Token = token
	session.IDToken = idToken
	session.ScopeLabel = strings.Join(config.Scope, " ")
	if scopeRaw, ok := token.Extra("scope").(string); ok && scopeRaw != "" {
		session.ScopeLabel = scopeRaw
	}
	session.ExpiresLabel = formatTime(token.Expiry)
	session.AccessDecoded = formatDecoded(token.AccessToken)
	session.IDDecoded = formatDecoded(idToken)
	if userInfoJSON == "" {
		session.ProfileJSON = "No profile data."
	} else {
		session.ProfileJSON = userInfoJSON
	}

	clearAuthFlow(session)
	http.Redirect(w, r, "/", http.StatusFound)
}

func handleLogout(w http.ResponseWriter, r *http.Request, session *Session) {
	endSession := discoveryValue(r.Context(), "end_session_endpoint")
	if endSession == "" {
		session.Error = "End session endpoint not found."
		http.Redirect(w, r, "/", http.StatusFound)
		return
	}

	idToken := session.IDToken
	resetSession(session)

	params := url.Values{}
	params.Set("client_id", config.ClientID)
	params.Set("post_logout_redirect_uri", config.PostLogoutRedirectURI)
	if idToken != "" {
		params.Set("id_token_hint", idToken)
	}

	logoutURL := endSession + "?" + params.Encode()
	http.Redirect(w, r, logoutURL, http.StatusFound)
}

func handleWebhook(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		w.Header().Set("Allow", http.MethodPost)
		http.Error(w, "Method Not Allowed", http.StatusMethodNotAllowed)
		return
	}

	if config.WebhookAPIKey != "" {
		providedAPIKey := r.Header.Get(config.WebhookAPIKeyHeader)
		if providedAPIKey != config.WebhookAPIKey {
			fmt.Println("[tuurio-webhook] rejected request with invalid API key header")
			w.Header().Set("Content-Type", "application/json")
			w.WriteHeader(http.StatusUnauthorized)
			_, _ = w.Write([]byte(`{"accepted":false,"error":"invalid_api_key"}`))
			return
		}
	}

	bodyBytes, err := io.ReadAll(io.LimitReader(r.Body, 1<<20))
	if err != nil {
		http.Error(w, "Failed to read request body", http.StatusBadRequest)
		return
	}

	eventType := r.Header.Get("X-Tuurio-Event")
	if eventType == "" {
		eventType = "unknown"
	}
	eventID := r.Header.Get("X-Tuurio-Event-Id")
	signature := r.Header.Get("X-Tuurio-Signature")

	var payload any
	if len(bodyBytes) > 0 {
		if err := json.Unmarshal(bodyBytes, &payload); err != nil {
			payload = string(bodyBytes)
		}
	}

	logRecord := map[string]any{
		"webhookId": config.WebhookID,
		"eventType": eventType,
		"eventId":   eventID,
		"signature": signature,
		"payload":   payload,
	}
	encoded, _ := json.MarshalIndent(logRecord, "", "  ")
	fmt.Printf("[tuurio-webhook] event received %s\n", string(encoded))

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusAccepted)
	_, _ = w.Write([]byte(`{"accepted":true}`))
}

func handleNotFound(w http.ResponseWriter, _ *http.Request, session *Session) {
	status := map[string]string{"label": "Route not found", "tone": "neutral"}
	content := renderNotFoundView()
	renderPage(w, status, content)
	session.Error = ""
}

func renderPage(w http.ResponseWriter, status map[string]string, content string) {
	page := fmt.Sprintf(`<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Tuurio Auth Go Demo</title>
    <link rel="stylesheet" href="/assets/app.css" />
  </head>
  <body>
    <div id="app">%s</div>
  </body>
</html>`, renderShell(status, content))

	w.Header().Set("Content-Type", "text/html; charset=utf-8")
	w.WriteHeader(http.StatusOK)
	_, _ = w.Write([]byte(page))
}

func renderShell(status map[string]string, content string) string {
	label := html.EscapeString(status["label"])
	tone := html.EscapeString(status["tone"])

	return fmt.Sprintf(`
    <div class="app">
      <aside class="side-panel">
        <div class="brand">
          <div class="logo-mark">tu</div>
          <div>
            <p class="brand-name">Tuurio Auth Studio</p>
            <p class="brand-subtitle">OIDC playground for OAuth 2.1</p>
          </div>
        </div>
        <div class="side-card">
          <h1>Design for secure sign-in.</h1>
          <p class="muted">
            A minimal Go server that signs in with OpenID Connect, displays decoded tokens,
            and supports secure logout redirects.
          </p>
          <div class="status-row">
            <span class="status status-%s">%s</span>
            <span class="muted">Authority: test.id.tuurio.com</span>
          </div>
        </div>
        <div class="side-list">
          <div>
            <span class="eyebrow">Architecture</span>
            <p>Authorization code flow + PKCE</p>
          </div>
          <div>
            <span class="eyebrow">Storage</span>
            <p>In-memory session</p>
          </div>
          <div>
            <span class="eyebrow">Scope</span>
            <p>openid profile email</p>
          </div>
        </div>
      </aside>
      <main class="main-panel">%s</main>
    </div>
`, tone, label, content)
}

func renderLoginView(errorMessage string) string {
	errorHTML := ""
	if errorMessage != "" {
		errorHTML = fmt.Sprintf(`<div class="status status-bad">%s</div>`, html.EscapeString(errorMessage))
	}

	return fmt.Sprintf(`
    <div class="stack">
      <section class="card">
        <div class="card-header">
          <span class="eyebrow">OAuth 2.1 + OpenID Connect</span>
          <h2 class="card-title">Sign in to continue</h2>
          <p class="muted">
            This app uses the authorization code flow with PKCE to fetch tokens securely for a
            browser-based client.
          </p>
        </div>
        <div class="button-row">
          <a class="button primary" href="/login">Continue with Tuurio ID</a>
          <span class="helper">You'll be redirected to test.id.tuurio.com</span>
        </div>
        %s
      </section>
      <section class="card card-soft">
        <div class="feature-grid">
          <div class="feature">
            <h3>PKCE by default</h3>
            <p class="muted">Proof Key for Code Exchange protects the code flow.</p>
          </div>
          <div class="feature">
            <h3>Short-lived tokens</h3>
            <p class="muted">Access tokens are scoped to openid profile email.</p>
          </div>
          <div class="feature">
            <h3>Session aware</h3>
            <p class="muted">Token state is persisted in memory.</p>
          </div>
        </div>
      </section>
    </div>
`, errorHTML)
}

func renderTokenView(session *Session) string {
	return fmt.Sprintf(`
    <div class="stack">
      <section class="card">
        <div class="card-header">
          <span class="eyebrow">Session ready</span>
          <h2 class="card-title">You're signed in</h2>
          <p class="muted">Tokens expire at %s and are scoped for %s.</p>
        </div>
        <div class="button-row">
          <a class="button ghost" href="/logout">Logout</a>
          <span class="helper">Tokens expire automatically; logout revokes session.</span>
        </div>
      </section>

      <div class="token-grid">
        %s
        %s
      </div>

      <section class="card card-soft">
        <h3 class="section-title">User profile (UserInfo)</h3>
        <pre class="code-block">%s</pre>
      </section>
    </div>
`,
		html.EscapeString(session.ExpiresLabel),
		html.EscapeString(session.ScopeLabel),
		renderTokenPanel("Access Token", session.Token.AccessToken, session.AccessDecoded, "Used to call protected APIs."),
		renderTokenPanel("ID Token", session.IDToken, session.IDDecoded, "Proves the authenticated user."),
		html.EscapeString(session.ProfileJSON),
	)
}

func renderTokenPanel(title, token, decoded, description string) string {
	tokenLabel := "Not provided"
	if token != "" {
		tokenLabel = html.EscapeString(token)
	}

	return fmt.Sprintf(`
    <section class="card card-panel">
      <div class="panel-header">
        <div>
          <h3 class="panel-title">%s</h3>
          <p class="muted">%s</p>
        </div>
      </div>
      <pre class="token-block">%s</pre>
      <div class="token-claims">
        <span class="eyebrow">Decoded claims</span>
        <pre class="code-block">%s</pre>
      </div>
    </section>
`,
		html.EscapeString(title),
		html.EscapeString(description),
		tokenLabel,
		html.EscapeString(decoded),
	)
}

func renderNotFoundView() string {
	return `
    <section class="card">
      <div class="stack">
        <div class="status status-bad">404</div>
        <h2 class="card-title">This route doesn't exist.</h2>
        <p class="muted">Return to the login page to start a new session.</p>
        <a class="button ghost" href="/">Go home</a>
      </div>
    </section>
  `
}

func resetSession(session *Session) {
	*session = Session{}
}

func clearAuthFlow(session *Session) {
	session.State = ""
	session.Verifier = ""
	session.Error = ""
}

func statusForSession(session *Session) map[string]string {
	if session.Token != nil {
		return map[string]string{"label": "Authenticated", "tone": "good"}
	}
	return map[string]string{"label": "Signed out", "tone": "neutral"}
}

func randomString(length int) string {
	buffer := make([]byte, length)
	_, _ = rand.Read(buffer)
	return base64urlEncode(buffer)
}

func pkceChallenge(verifier string) string {
	hash := sha256.Sum256([]byte(verifier))
	return base64urlEncode(hash[:])
}

func base64urlEncode(data []byte) string {
	return strings.TrimRight(base64.URLEncoding.EncodeToString(data), "=")
}

func base64urlDecode(value string) ([]byte, error) {
	padding := len(value) % 4
	if padding != 0 {
		value += strings.Repeat("=", 4-padding)
	}
	return base64.URLEncoding.DecodeString(value)
}

func formatDecoded(token string) string {
	payload, ok := decodeJWT(token)
	if !ok {
		return "Not a JWT or unable to decode."
	}
	encoded, err := json.MarshalIndent(payload, "", "  ")
	if err != nil {
		return "Not a JWT or unable to decode."
	}
	return string(encoded)
}

func decodeJWT(token string) (map[string]any, bool) {
	if token == "" {
		return nil, false
	}
	parts := strings.Split(token, ".")
	if len(parts) < 2 {
		return nil, false
	}
	payloadBytes, err := base64urlDecode(parts[1])
	if err != nil {
		return nil, false
	}
	var payload map[string]any
	if err := json.Unmarshal(payloadBytes, &payload); err != nil {
		return nil, false
	}
	return payload, true
}

func formatTime(t time.Time) string {
	if t.IsZero() {
		return "unknown time"
	}
	return t.Local().Format("2006-01-02 15:04:05")
}

func discoveryValue(ctx context.Context, key string) string {
	discoveryCache.mu.Lock()
	defer discoveryCache.mu.Unlock()

	if discoveryCache.data == nil {
		data, err := fetchDiscovery(ctx)
		if err != nil {
			return ""
		}
		discoveryCache.data = data
	}

	return discoveryCache.data[key]
}

func fetchDiscovery(ctx context.Context) (map[string]string, error) {
	req, err := http.NewRequestWithContext(ctx, http.MethodGet, config.DiscoveryEndpoint, nil)
	if err != nil {
		return nil, err
	}

	resp, err := http.DefaultClient.Do(req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	if resp.StatusCode >= 400 {
		return nil, fmt.Errorf("discovery request failed: %s", resp.Status)
	}

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return nil, err
	}

	var data map[string]any
	if err := json.Unmarshal(body, &data); err != nil {
		return nil, err
	}

	result := make(map[string]string)
	for _, key := range []string{"userinfo_endpoint", "end_session_endpoint"} {
		if val, ok := data[key].(string); ok {
			result[key] = val
		}
	}
	return result, nil
}

func fetchUserInfo(ctx context.Context, accessToken string) string {
	endpoint := discoveryValue(ctx, "userinfo_endpoint")
	if endpoint == "" {
		return ""
	}

	req, err := http.NewRequestWithContext(ctx, http.MethodGet, endpoint, nil)
	if err != nil {
		return ""
	}
	req.Header.Set("Authorization", "Bearer "+accessToken)

	resp, err := http.DefaultClient.Do(req)
	if err != nil {
		return ""
	}
	defer resp.Body.Close()

	if resp.StatusCode >= 400 {
		return ""
	}

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return ""
	}

	var payload map[string]any
	if err := json.Unmarshal(body, &payload); err != nil {
		return ""
	}

	pretty, err := json.MarshalIndent(payload, "", "  ")
	if err != nil {
		return ""
	}

	return string(pretty)
}
