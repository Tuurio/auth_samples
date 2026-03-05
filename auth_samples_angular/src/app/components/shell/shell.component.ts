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
            <p class="brand-subtitle">OIDC playground for OAuth 2.1</p>
          </div>
        </div>
        <div class="side-card">
          <h1>Design for secure sign-in.</h1>
          <p class="muted">
            A minimal Angular client that signs in with OpenID Connect, displays decoded tokens,
            and supports secure logout redirects.
          </p>
          <div class="status-row">
            <span
              class="status"
              [class.status-good]="status().tone === 'good'"
              [class.status-neutral]="status().tone === 'neutral'"
            >
              {{ status().label }}
            </span>
            <span class="muted">Authority: {{ authorityHost() }}</span>
          </div>
        </div>
        <div class="side-list">
          <div>
            <span class="eyebrow">Architecture</span>
            <p>Authorization code flow + PKCE</p>
          </div>
          <div>
            <span class="eyebrow">Storage</span>
            <p>Session storage for tokens</p>
          </div>
          <div>
            <span class="eyebrow">Scope</span>
            <p>openid profile email</p>
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
