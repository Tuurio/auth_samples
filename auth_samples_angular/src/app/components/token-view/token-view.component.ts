import { Component, EventEmitter, Output, computed, input } from "@angular/core";
import { JsonPipe } from "@angular/common";
import type { User } from "oidc-client-ts";
import { CardComponent } from "../card/card.component";
import { TokenPanelComponent } from "../token-panel/token-panel.component";
import { decodeJwt, formatUnixTime } from "../../utils/jwt";

@Component({
  selector: "app-token-view",
  standalone: true,
  imports: [CardComponent, TokenPanelComponent, JsonPipe],
  template: `
    <div class="stack">
      <app-card>
        <div class="card-header">
          <span class="eyebrow">Session ready</span>
          <h2 class="card-title">You're signed in</h2>
          <p class="muted">
            Tokens expire at {{ expiresLabel() }} and are scoped for {{ scopeLabel() }}.
          </p>
        </div>
        <div class="button-row">
          <button class="button ghost" type="button" (click)="logout.emit()">Logout</button>
          <span class="helper">Tokens expire automatically; logout revokes session.</span>
        </div>
      </app-card>

      <div class="token-grid">
        <app-token-panel
          title="Access Token"
          [token]="user().access_token"
          [decoded]="accessTokenInfo()"
          description="Used to call protected APIs."
        ></app-token-panel>
        <app-token-panel
          title="ID Token"
          [token]="idToken()"
          [decoded]="idTokenInfo()"
          description="Proves the authenticated user."
        ></app-token-panel>
      </div>

      <app-card tone="soft">
        <h3 class="section-title">User profile (UserInfo)</h3>
        <pre class="code-block">{{ profile() ? (profile() | json) : "No profile data." }}</pre>
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
  expiresLabel = computed(() => formatUnixTime(this.user().expires_at));
}
