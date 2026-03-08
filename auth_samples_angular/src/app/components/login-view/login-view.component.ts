import { Component, EventEmitter, input, Output } from "@angular/core";
import { CardComponent } from "../card/card.component";

@Component({
  selector: "app-login-view",
  standalone: true,
  imports: [CardComponent],
  template: `
    <div class="stack">
      <app-card tone="hero">
        <div class="card-header">
          <span class="eyebrow">OAuth 2.0 + OpenID Connect</span>
          <h2 class="card-title">Sign in to continue</h2>
          <p class="muted">
            Authenticate with the authorization code flow and PKCE. Tokens are exchanged in the
            browser and stored in session storage for this demo.
          </p>
        </div>
        <div class="button-row">
          <button class="button primary" type="button" (click)="login.emit()">
            Continue with Tuurio ID
            <span class="btn-arrow">&rarr;</span>
          </button>
          <span class="helper">Redirects to {{ authorityHost() }}</span>
        </div>
        @if (error()) {
          <div class="alert alert-error">{{ error() }}</div>
        }
      </app-card>
      <div class="feature-grid">
        <div class="feature-card">
          <h3>PKCE by default</h3>
          <p class="muted">Proof Key for Code Exchange prevents authorization code interception attacks.</p>
        </div>
        <div class="feature-card">
          <h3>Short-lived tokens</h3>
          <p class="muted">Access tokens expire quickly, scoped to openid profile email.</p>
        </div>
        <div class="feature-card">
          <h3>Session aware</h3>
          <p class="muted">Token state stays in session storage and can be cleared with logout.</p>
        </div>
      </div>
    </div>
  `,
})
export class LoginViewComponent {
  @Output() login = new EventEmitter<void>();
  error = input<string | null>(null);
  authorityHost = input.required<string>();
}
