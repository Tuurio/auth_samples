import { Component, input, signal } from "@angular/core";
import { JsonPipe } from "@angular/common";
import { CardComponent } from "../card/card.component";

@Component({
  selector: "app-token-panel",
  standalone: true,
  imports: [CardComponent, JsonPipe],
  template: `
    <app-card>
      <div class="section-header">
        <div class="section-icon">{{ title() === 'Access Token' ? 'AT' : 'ID' }}</div>
        <div>
          <h3 class="section-title">{{ title() }}</h3>
          <p class="muted">{{ description() }}</p>
        </div>
      </div>
      <details class="token-details">
        <summary class="token-summary">
          <span class="eyebrow">Raw JWT</span>
          <code class="token-preview">{{ token() ? `${token().slice(0, 48)}...` : "Not provided" }}</code>
        </summary>
        <pre class="token-block">{{ token() || "Not provided" }}</pre>
      </details>
      <div class="panel-header">
        <span class="eyebrow">Decoded payload</span>
        <button class="button small ghost" type="button" (click)="copy()" [disabled]="!token()">
          {{ copied() ? "Copied" : "Copy" }}
        </button>
      </div>
      <div class="token-claims">
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
