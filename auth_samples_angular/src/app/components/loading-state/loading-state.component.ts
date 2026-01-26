import { Component, input } from "@angular/core";

@Component({
  selector: "app-loading-state",
  standalone: true,
  template: `
    <div class="loading">
      <div class="spinner"></div>
      <div>
        <h2 class="card-title">{{ title() }}</h2>
        <p class="muted">{{ subtitle() }}</p>
      </div>
    </div>
  `,
})
export class LoadingStateComponent {
  title = input.required<string>();
  subtitle = input.required<string>();
}
