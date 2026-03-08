import { Component, EventEmitter, Output, computed, input } from "@angular/core";
import { JsonPipe } from "@angular/common";
import type { User } from "oidc-client-ts";
import { authConfig } from "../../auth/auth.config";
import { CardComponent } from "../card/card.component";
import { TokenPanelComponent } from "../token-panel/token-panel.component";
import { decodeJwt } from "../../utils/jwt";

@Component({
  selector: "app-token-view",
  standalone: true,
  imports: [CardComponent, TokenPanelComponent, JsonPipe],
  template: `
    <div class="stack">
      <app-card tone="hero">
        <div class="card-header">
          <span class="badge badge-success">Authenticated</span>
          <h2 class="card-title">Session active</h2>
          <p class="muted">
            <code>{{ scopeLabel() }}</code>
            @if (timingLabel()) {
              · {{ timingLabel() }}
            }
          </p>
        </div>
        <div class="button-row">
          <button class="button ghost" type="button" (click)="logout.emit()">Log out and end session</button>
          <span class="helper">Clears local state and redirects through the identity provider.</span>
        </div>
      </app-card>

      <app-card>
        <div class="section-header">
          <div class="section-icon">UI</div>
          <div>
            <h3 class="section-title">User profile</h3>
            <p class="muted">Claims returned by the UserInfo endpoint.</p>
          </div>
        </div>
        <pre class="code-block">{{ profile() ? (profile() | json) : "No profile data." }}</pre>
      </app-card>

      <app-token-panel
        title="Access Token"
        [token]="user().access_token"
        [decoded]="accessTokenInfo()"
        description="Authorizes API requests on behalf of the user."
      ></app-token-panel>
      <app-token-panel
        title="ID Token"
        [token]="idToken()"
        [decoded]="idTokenInfo()"
        description="Cryptographic proof of the authenticated identity."
      ></app-token-panel>

      <app-card>
        <div class="section-header">
          <div class="section-icon">ID</div>
          <div>
            <h3 class="section-title">Provider discovery</h3>
            <p class="muted">OIDC metadata used to resolve endpoints and session management URLs.</p>
          </div>
        </div>
        <div class="stack">
          <div>
            <span class="eyebrow">Authority</span>
            <p><a class="link" [href]="authority" target="_blank" rel="noreferrer">{{ authority }}</a></p>
          </div>
          <div>
            <span class="eyebrow">Discovery document</span>
            <p><a class="link" [href]="discoveryUrl" target="_blank" rel="noreferrer">{{ discoveryUrl }}</a></p>
          </div>
        </div>
      </app-card>
    </div>
  `,
})
export class TokenViewComponent {
  @Output() logout = new EventEmitter<void>();
  user = input.required<User>();
  profile = input<Record<string, unknown> | null>(null);

  accessTokenInfo = computed(() => decodeJwt(this.user().access_token));
  idToken = computed(() => this.user().id_token ?? "");
  idTokenInfo = computed(() => decodeJwt(this.idToken()));
  scopeLabel = computed(() => this.user().scope || "openid profile email");
  authority = authConfig.authority;
  discoveryUrl = `${authConfig.authority}/.well-known/openid-configuration`;
  timingLabel = computed(() => {
    const parts: string[] = [];
    const issuedAt = this.accessTokenInfo()?.iat;
    if (typeof issuedAt === "number") {
      parts.push(`Issued ${formatDuration(Math.floor(Date.now() / 1000) - issuedAt)} ago`);
    }
    if (this.user().expires_at) {
      const remaining = this.user().expires_at - Math.floor(Date.now() / 1000);
      parts.push(
        remaining > 0
          ? `${formatDuration(remaining)} remaining`
          : `expired ${formatDuration(Math.abs(remaining))} ago`
      );
    }
    return parts.join(" · ");
  });
}

function formatDuration(seconds: number) {
  const abs = Math.abs(seconds);
  if (abs < 60) return `${abs}s`;
  if (abs < 3600) {
    const minutes = Math.floor(abs / 60);
    const remainder = abs % 60;
    return remainder > 0 ? `${minutes}m ${remainder}s` : `${minutes}m`;
  }
  const hours = Math.floor(abs / 3600);
  const minutes = Math.floor((abs % 3600) / 60);
  return minutes > 0 ? `${hours}h ${minutes}m` : `${hours}h`;
}
