import { Component, EventEmitter, input, Output } from "@angular/core";
import { CardComponent } from "../card/card.component";
import { FeatureComponent } from "../feature/feature.component";

@Component({
  selector: "app-login-view",
  standalone: true,
  imports: [CardComponent, FeatureComponent],
  template: `
    <div class="stack">
      <app-card>
        <div class="card-header">
          <span class="eyebrow">OAuth 2.1 + OpenID Connect</span>
          <h2 class="card-title">Sign in to continue</h2>
          <p class="muted">
            This app uses the authorization code flow with PKCE to fetch tokens securely for a
            browser-based client.
          </p>
        </div>
        <div class="button-row">
          <button class="button primary" type="button" (click)="login.emit()">
            Continue with Tuurio ID
          </button>
          <span class="helper">You'll be redirected to test.id.tuurio.com</span>
        </div>
        @if (error()) {
          <div class="status status-bad">{{ error() }}</div>
        }
      </app-card>
      <app-card tone="soft">
        <div class="feature-grid">
          <app-feature title="PKCE by default" body="Proof Key for Code Exchange protects the code flow." />
          <app-feature title="Short-lived tokens" body="Access tokens are scoped to openid profile email." />
          <app-feature title="Session aware" body="Token state is persisted in session storage." />
        </div>
      </app-card>
    </div>
  `,
})
export class LoginViewComponent {
  @Output() login = new EventEmitter<void>();
  error = input<string | null>(null);
}
