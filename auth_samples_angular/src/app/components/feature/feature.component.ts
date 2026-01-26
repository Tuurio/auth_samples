import { Component, input } from "@angular/core";

@Component({
  selector: "app-feature",
  standalone: true,
  template: `
    <div class="feature">
      <h3>{{ title() }}</h3>
      <p class="muted">{{ body() }}</p>
    </div>
  `,
})
export class FeatureComponent {
  title = input.required<string>();
  body = input.required<string>();
}
