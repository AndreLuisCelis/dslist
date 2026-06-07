import { Component, Input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { GameMinDto } from '../../models/game.model';

@Component({
  selector: 'app-game-card',
  standalone: true,
  imports: [RouterLink],
  template: `
    <div class="game-card glass-panel" [routerLink]="['/game', game.id]">
      <div class="card-image-wrapper">
        <img [src]="game.imgUrl" [alt]="game.title" class="card-image" loading="lazy" />
        <div class="card-badge">{{ game.year }}</div>
      </div>
      <div class="card-content">
        <h3 class="card-title">{{ game.title }}</h3>
        <p class="card-description">{{ game.shortDescription }}</p>
        <div class="card-footer">
          <span class="learn-more">
            Ver detalhes 
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="arrow-icon"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
          </span>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .game-card {
      display: flex;
      flex-direction: column;
      height: 100%;
      overflow: hidden;
      cursor: pointer;
      transition: transform var(--transition-normal), box-shadow var(--transition-normal), border-color var(--transition-normal);
    }
    .game-card:hover {
      transform: translateY(-6px);
      border-color: rgba(139, 92, 246, 0.4);
      box-shadow: 0 12px 30px rgba(139, 92, 246, 0.15);
      background: var(--bg-card-hover);
    }
    .card-image-wrapper {
      position: relative;
      width: 100%;
      padding-top: 56.25%; /* 16:9 Aspect Ratio */
      overflow: hidden;
      background: rgba(0, 0, 0, 0.2);
    }
    .card-image {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      object-fit: cover;
      transition: transform var(--transition-normal);
    }
    .game-card:hover .card-image {
      transform: scale(1.05);
    }
    .card-badge {
      position: absolute;
      top: 0.75rem;
      right: 0.75rem;
      background: rgba(10, 11, 16, 0.85);
      backdrop-filter: blur(4px);
      padding: 0.25rem 0.5rem;
      border-radius: 6px;
      font-size: 0.8rem;
      font-weight: 700;
      color: var(--accent-secondary);
      border: 1px solid rgba(6, 182, 212, 0.3);
    }
    .card-content {
      display: flex;
      flex-direction: column;
      flex-grow: 1;
      padding: 1.25rem;
    }
    .card-title {
      font-family: var(--font-display);
      font-size: 1.2rem;
      font-weight: 700;
      color: var(--text-primary);
      margin-bottom: 0.5rem;
      line-height: 1.3;
    }
    .card-description {
      font-size: 0.875rem;
      color: var(--text-secondary);
      line-height: 1.5;
      margin-bottom: 1.25rem;
      display: -webkit-box;
      -webkit-line-clamp: 3;
      -webkit-box-orient: vertical;
      overflow: hidden;
      flex-grow: 1;
    }
    .card-footer {
      display: flex;
      align-items: center;
      margin-top: auto;
    }
    .learn-more {
      font-family: var(--font-display);
      font-size: 0.85rem;
      font-weight: 600;
      color: var(--accent-primary);
      display: flex;
      align-items: center;
      gap: 0.35rem;
      transition: gap var(--transition-fast);
    }
    .game-card:hover .learn-more {
      color: var(--accent-secondary);
      gap: 0.6rem;
    }
    .arrow-icon {
      transition: transform var(--transition-fast);
    }
  `]
})
export class GameCardComponent {
  @Input() game!: GameMinDto;
}
