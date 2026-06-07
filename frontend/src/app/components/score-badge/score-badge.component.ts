import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-score-badge',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="score-badge" [ngClass]="getScoreClass()">
      <span class="score-value">{{ score }}</span>
    </div>
  `,
  styles: [`
    .score-badge {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      padding: 0.25rem 0.6rem;
      border-radius: 6px;
      font-family: var(--font-display);
      font-weight: 700;
      font-size: 0.9rem;
      min-width: 38px;
      text-align: center;
    }
    .score-high {
      background: rgba(34, 197, 94, 0.15);
      color: #4ade80;
      border: 1px solid rgba(34, 197, 94, 0.3);
    }
    .score-medium {
      background: rgba(234, 179, 8, 0.15);
      color: #facc15;
      border: 1px solid rgba(234, 179, 8, 0.3);
    }
    .score-low {
      background: rgba(239, 68, 68, 0.15);
      color: #f87171;
      border: 1px solid rgba(239, 68, 68, 0.3);
    }
  `]
})
export class ScoreBadgeComponent {
  @Input() score: number = 0;

  getScoreClass(): string {
    if (this.score >= 80) return 'score-high';
    if (this.score >= 60) return 'score-medium';
    return 'score-low';
  }
}
