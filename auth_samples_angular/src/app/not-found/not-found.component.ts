import { Component, inject } from "@angular/core";
import { Router } from "@angular/router";
import { CardComponent } from "../components/card/card.component";
import { ShellComponent } from "../components/shell/shell.component";

@Component({
  selector: "app-not-found",
  standalone: true,
  imports: [ShellComponent, CardComponent],
  template: `
    <app-shell [status]="{ label: 'Route not found', tone: 'neutral' }">
      <app-card>
        <div class="stack">
          <div class="status status-bad">404</div>
          <h2 class="card-title">This route doesn't exist.</h2>
          <p class="muted">Return to the login page to start a new session.</p>
          <button class="button ghost" type="button" (click)="goHome()">
            Go home
          </button>
        </div>
      </app-card>
    </app-shell>
  `,
})
export class NotFoundComponent {
  private readonly router = inject(Router);

  goHome() {
    this.router.navigateByUrl("/", { replaceUrl: true });
  }
}
