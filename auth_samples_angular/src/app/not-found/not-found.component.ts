import { Component, inject } from "@angular/core";
import { Router } from "@angular/router";
import { authConfig } from "../auth/auth.config";
import { CardComponent } from "../components/card/card.component";
import { ShellComponent } from "../components/shell/shell.component";

@Component({
  selector: "app-not-found",
  standalone: true,
  imports: [ShellComponent, CardComponent],
  template: `
    <app-shell [status]="{ label: 'Route not found', tone: 'neutral' }" [authorityHost]="authorityHost">
      <app-card tone="hero">
        <div class="card-header">
          <span class="badge badge-error">404</span>
          <h2 class="card-title">Route not found</h2>
          <p class="muted">This path doesn't match any known endpoint.</p>
        </div>
        <div class="button-row">
          <button class="button ghost" type="button" (click)="goHome()">
            Go home
            <span class="btn-arrow">&rarr;</span>
          </button>
        </div>
      </app-card>
    </app-shell>
  `,
})
export class NotFoundComponent {
  private readonly router = inject(Router);
  readonly authorityHost = authConfig.authorityHost;

  goHome() {
    this.router.navigateByUrl("/", { replaceUrl: true });
  }
}
