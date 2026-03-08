import { Component, input } from "@angular/core";

export type ShellTone = "good" | "neutral";
export type ShellStatus = { label: string; tone: ShellTone };

@Component({
  selector: "app-shell",
  standalone: true,
  template: `
    <div class="app">
      <aside class="side-panel">
        <div class="brand">
          <div class="logo-mark">tu</div>
          <div>
            <p class="brand-name">Tuurio Auth Studio</p>
            <p class="brand-subtitle">OIDC playground for OAuth 2.0</p>
          </div>
        </div>
        <div class="side-card">
          <h1>Design for<br />secure sign in.</h1>
          <p class="muted">
            A minimal Angular client that authenticates with OpenID Connect, inspects decoded
            tokens, and supports logout redirects.
          </p>
          <div class="status-row">
            <span
              class="status"
              [class.status-good]="status().tone === 'good'"
              [class.status-neutral]="status().tone === 'neutral'"
            >
              {{ status().label }}
            </span>
            <span class="muted">{{ authorityHost() }}</span>
          </div>
        </div>
        <div class="side-list">
          <div class="side-list-item">
            <div>
              <span class="side-list-label">Architecture</span>
              <span class="side-list-value">Auth code + PKCE</span>
            </div>
          </div>
          <div class="side-list-item">
            <div>
              <span class="side-list-label">Storage</span>
              <span class="side-list-value">Session storage</span>
            </div>
          </div>
          <div class="side-list-item">
            <div>
              <span class="side-list-label">Scope</span>
              <span class="side-list-value">openid profile email</span>
            </div>
          </div>
        </div>
      </aside>
      <main class="main-panel">
        <ng-content />
      </main>
    </div>
  `,
})
export class ShellComponent {
  status = input.required<ShellStatus>();
  authorityHost = input.required<string>();
}
