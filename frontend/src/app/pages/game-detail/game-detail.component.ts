import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { GameApiService } from '../../services/game-api.service';
import { GameDto } from '../../models/game.model';
import { ScoreBadgeComponent } from '../../components/score-badge/score-badge.component';
import { LoadingSpinnerComponent } from '../../components/loading-spinner/loading-spinner.component';

@Component({
  selector: 'app-game-detail',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    ScoreBadgeComponent,
    LoadingSpinnerComponent
  ],
  template: `
    <div class="detail-container">
      <div class="navigation-header">
        <a routerLink="/" class="back-link">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="arrow-icon"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
          Voltar para o catálogo
        </a>
      </div>

      <app-loading-spinner *ngIf="loading"></app-loading-spinner>

      <div class="error-banner glass-panel" *ngIf="error">
        <p>{{ error }}</p>
        <a routerLink="/" class="glow-btn">Voltar para Home</a>
      </div>

      <article class="game-details glass-panel" *ngIf="!loading && game">
        <div class="banner-section" [style.background-image]="'linear-gradient(to bottom, rgba(10, 11, 16, 0.4), var(--bg-card)), url(' + game.imgUrl + ')'">
          <div class="banner-content">
            <h1 class="game-title">{{ game.title }}</h1>
            <div class="meta-row">
              <span class="meta-item">{{ game.genre }}</span>
              <span class="meta-divider">•</span>
              <span class="meta-item">{{ game.year }}</span>
            </div>
          </div>
        </div>

        <div class="grid-content">
          <div class="sidebar-info">
            <div class="info-card">
              <span class="info-label">Avaliação</span>
              <div class="score-container">
                <app-score-badge [score]="game.score"></app-score-badge>
                <span class="score-text">Metacritic Score</span>
              </div>
            </div>

            <div class="info-card">
              <span class="info-label">Plataformas</span>
              <div class="platforms-list">
                <span *ngFor="let platform of getPlatformsList()" class="platform-tag">
                  {{ platform }}
                </span>
              </div>
            </div>
          </div>

          <div class="description-section">
            <h2 class="section-title">Sobre o Jogo</h2>
            <p class="long-desc">{{ game.longDescription }}</p>
          </div>
        </div>
      </article>
    </div>
  `,
  styles: [`
    .detail-container {
      max-width: 1000px;
      margin: 0 auto;
      padding-bottom: 4rem;
    }
    .navigation-header {
      margin-bottom: 1.5rem;
    }
    .back-link {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      color: var(--text-secondary);
      font-size: 0.95rem;
      font-weight: 500;
      transition: var(--transition-fast);
    }
    .back-link:hover {
      color: var(--text-primary);
    }
    .back-link:hover .arrow-icon {
      transform: translateX(-3px);
    }
    .arrow-icon {
      transition: transform var(--transition-fast);
    }
    
    .error-banner {
      padding: 3rem;
      text-align: center;
      border-color: rgba(239, 68, 68, 0.2);
    }
    .error-banner p {
      color: #f87171;
      margin-bottom: 1.5rem;
      font-size: 1.1rem;
    }

    .game-details {
      overflow: hidden;
    }
    .banner-section {
      height: 380px;
      background-size: cover;
      background-position: center;
      display: flex;
      align-items: flex-end;
      padding: 3rem;
      position: relative;
    }
    .banner-content {
      position: relative;
      z-index: 1;
    }
    .game-title {
      font-family: var(--font-display);
      font-size: 3rem;
      font-weight: 800;
      letter-spacing: -0.025em;
      line-height: 1.1;
      margin-bottom: 0.75rem;
      text-shadow: 0 4px 12px rgba(0,0,0,0.6);
    }
    .meta-row {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      font-family: var(--font-display);
      font-weight: 500;
      color: var(--accent-secondary);
      font-size: 1.1rem;
      text-shadow: 0 2px 4px rgba(0,0,0,0.6);
    }
    .meta-divider {
      opacity: 0.5;
    }

    .grid-content {
      display: grid;
      grid-template-columns: 300px 1fr;
      gap: 3rem;
      padding: 3rem;
    }

    .sidebar-info {
      display: flex;
      flex-direction: column;
      gap: 1.75rem;
    }
    .info-card {
      background: rgba(255, 255, 255, 0.02);
      border: 1px solid var(--border-color);
      border-radius: 12px;
      padding: 1.25rem;
    }
    .info-label {
      display: block;
      font-size: 0.8rem;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: var(--text-muted);
      margin-bottom: 0.75rem;
    }
    .score-container {
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }
    .score-text {
      font-size: 0.9rem;
      color: var(--text-secondary);
      font-weight: 500;
    }
    .platforms-list {
      display: flex;
      flex-wrap: wrap;
      gap: 0.5rem;
    }
    .platform-tag {
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid var(--border-color-hover);
      color: var(--text-primary);
      padding: 0.35rem 0.75rem;
      border-radius: 6px;
      font-size: 0.85rem;
      font-weight: 500;
    }

    .description-section {
      display: flex;
      flex-direction: column;
      gap: 1.25rem;
    }
    .section-title {
      font-family: var(--font-display);
      font-size: 1.5rem;
      font-weight: 700;
      color: var(--text-primary);
    }
    .long-desc {
      font-size: 1.05rem;
      line-height: 1.7;
      color: var(--text-secondary);
      white-space: pre-line;
    }

    @media (max-width: 768px) {
      .grid-content {
        grid-template-columns: 1fr;
        gap: 2rem;
        padding: 2rem;
      }
      .banner-section {
        height: 280px;
        padding: 2rem;
      }
      .game-title {
        font-size: 2.25rem;
      }
    }
  `]
})
export class GameDetailComponent implements OnInit {
  game: GameDto | null = null;
  loading = true;
  error: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private apiService: GameApiService
  ) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.loadGame(Number(id));
      } else {
        this.error = 'ID de jogo inválido.';
        this.loading = false;
      }
    });
  }

  loadGame(id: number): void {
    this.loading = true;
    this.error = null;
    this.apiService.getGameById(id).subscribe({
      next: (data) => {
        this.game = data;
        this.loading = false;
      },
      error: (err) => {
        console.error(err);
        this.error = 'Não foi possível carregar os detalhes do jogo.';
        this.loading = false;
      }
    });
  }

  getPlatformsList(): string[] {
    if (!this.game?.platforms) return [];
    return this.game.platforms.split(',').map(p => p.trim());
  }
}
