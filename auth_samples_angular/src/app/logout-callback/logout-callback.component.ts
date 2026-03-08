import { Component, inject } from "@angular/core";
import { AuthService } from "../auth/auth.service";
import { authConfig } from "../auth/auth.config";
import { CardComponent } from "../components/card/card.component";
import { ShellComponent } from "../components/shell/shell.component";

@Component({
  selector: "app-logout-callback",
  standalone: true,
  imports: [ShellComponent, CardComponent],
  template: `
    <app-shell [status]="{ label: 'Signed out', tone: 'neutral' }" [authorityHost]="authorityHost">
      <div class="stack">
        <app-card tone="hero">
          <div class="card-header">
            <span class="badge badge-neutral">Session ended</span>
            <h2 class="card-title">Successfully signed out</h2>
            <p class="muted">
              Local browser state cleared. The identity provider has redirected back to the configured
              post-logout route.
            </p>
          </div>
          <div class="button-row">
            <button class="button primary" type="button" (click)="signInAgain()">
              Sign in again
              <span class="btn-arrow">&rarr;</span>
            </button>
            <span class="helper">Redirects to the identity provider.</span>
          </div>
        </app-card>

        <app-card>
          <div class="section-header">
            <div class="section-icon">OK</div>
            <div>
              <h3 class="section-title">Session state</h3>
              <p class="muted">Browser-stored user state has been removed before rendering this page.</p>
            </div>
          </div>
          <div class="stack">
            <div>
              <span class="eyebrow">Post-logout URI</span>
              <p class="muted">{{ postLogoutRedirectUri }}</p>
            </div>
          </div>
        </app-card>
      </div>
    </app-shell>
  `,
})
export class LogoutCallbackComponent {
  private readonly auth = inject(AuthService);

  readonly authorityHost = authConfig.authorityHost;
  readonly postLogoutRedirectUri = authConfig.postLogoutRedirectUri;

  constructor() {
    this.auth.user.set(null);
    this.auth.profile.set(null);
  }

  signInAgain() {
    void this.auth.login();
  }
}
