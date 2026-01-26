import { Component, computed, inject } from "@angular/core";
import { AuthService } from "../auth/auth.service";
import { CardComponent } from "../components/card/card.component";
import { LoadingStateComponent } from "../components/loading-state/loading-state.component";
import { LoginViewComponent } from "../components/login-view/login-view.component";
import { ShellComponent, ShellStatus } from "../components/shell/shell.component";
import { TokenViewComponent } from "../components/token-view/token-view.component";

@Component({
  selector: "app-home",
  standalone: true,
  imports: [
    ShellComponent,
    CardComponent,
    LoadingStateComponent,
    LoginViewComponent,
    TokenViewComponent,
  ],
  template: `
    <app-shell [status]="status()">
      @if (auth.loading()) {
        <app-card>
          <app-loading-state
            title="Loading session"
            subtitle="Verifying tokens and session state."
          ></app-loading-state>
        </app-card>
      } @else if (auth.user()) {
        <app-token-view [user]="auth.user()!" (logout)="auth.logout()"></app-token-view>
      } @else {
        <app-login-view [error]="auth.error()" (login)="auth.login()"></app-login-view>
      }
    </app-shell>
  `,
})
export class HomeComponent {
  readonly auth = inject(AuthService);

  status = computed<ShellStatus>(() => {
    if (this.auth.loading()) return { label: "Checking session", tone: "neutral" };
    if (this.auth.user()) return { label: "Authenticated", tone: "good" };
    return { label: "Signed out", tone: "neutral" };
  });
}
