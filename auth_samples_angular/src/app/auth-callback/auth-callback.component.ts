import { Component, OnInit, inject, signal } from "@angular/core";
import { Router } from "@angular/router";
import { authConfig } from "../auth/auth.config";
import { AuthService } from "../auth/auth.service";
import { CardComponent } from "../components/card/card.component";
import { LoadingStateComponent } from "../components/loading-state/loading-state.component";
import { ShellComponent } from "../components/shell/shell.component";

@Component({
  selector: "app-auth-callback",
  standalone: true,
  imports: [ShellComponent, CardComponent, LoadingStateComponent],
  template: `
    <app-shell [status]="{ label: 'Finalizing login', tone: 'neutral' }" [authorityHost]="authorityHost">
      <app-card>
        @if (error()) {
          <div class="stack">
            <div class="status status-bad">Authentication error</div>
            <h2 class="card-title">We couldn't finish signing you in.</h2>
            <p class="muted">{{ error() }}</p>
            <button class="button ghost" type="button" (click)="goHome()">
              Back to login
            </button>
          </div>
        } @else {
          <app-loading-state
            title="Completing sign-in"
            subtitle="Processing the authorization response."
          ></app-loading-state>
        }
      </app-card>
    </app-shell>
  `,
})
export class AuthCallbackComponent implements OnInit {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private handled = false;

  readonly authorityHost = authConfig.authorityHost;
  error = signal<string | null>(null);

  ngOnInit() {
    if (this.handled) return;
    this.handled = true;
    this.auth
      .handleCallback()
      .then(() => {
        this.router.navigateByUrl("/", { replaceUrl: true });
      })
      .catch((err) => {
        this.error.set(err instanceof Error ? err.message : "Login failed.");
      });
  }

  goHome() {
    this.router.navigateByUrl("/", { replaceUrl: true });
  }
}
