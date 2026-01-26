import { Component, input, signal } from "@angular/core";
import { JsonPipe } from "@angular/common";
import { CardComponent } from "../card/card.component";

@Component({
  selector: "app-token-panel",
  standalone: true,
  imports: [CardComponent, JsonPipe],
  template: `
    <app-card tone="panel">
      <div class="panel-header">
        <div>
          <h3 class="panel-title">{{ title() }}</h3>
          <p class="muted">{{ description() }}</p>
        </div>
        <button class="button small ghost" type="button" (click)="copy()" [disabled]="!token()">
          {{ copied() ? "Copied" : "Copy" }}
        </button>
      </div>
      <pre class="token-block">{{ token() || "Not provided" }}</pre>
      <div class="token-claims">
        <span class="eyebrow">Decoded claims</span>
        <pre class="code-block">{{ decoded() ? (decoded() | json) : "Not a JWT or unable to decode." }}</pre>
      </div>
    </app-card>
  `,
})
export class TokenPanelComponent {
  title = input.required<string>();
  token = input.required<string>();
  decoded = input<Record<string, unknown> | null>(null);
  description = input.required<string>();

  copied = signal(false);

  async copy() {
    if (!navigator.clipboard || !this.token()) return;
    await navigator.clipboard.writeText(this.token());
    this.copied.set(true);
    window.setTimeout(() => this.copied.set(false), 1800);
  }
}
