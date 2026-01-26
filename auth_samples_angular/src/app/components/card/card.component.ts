import { Component, input } from "@angular/core";

export type CardTone = "solid" | "soft" | "panel";

@Component({
  selector: "app-card",
  standalone: true,
  template: `
    <section class="card" [class.card-soft]="tone() === 'soft'" [class.card-panel]="tone() === 'panel'">
      <ng-content />
    </section>
  `,
})
export class CardComponent {
  tone = input<CardTone>("solid");
}
