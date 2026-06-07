import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GameApiService } from '../../services/game-api.service';
import { GameMinDto } from '../../models/game.model';
import { GameListDto } from '../../models/game-list.model';
import { GameCardComponent } from '../../components/game-card/game-card.component';
import { CategorySidebarComponent } from '../../components/category-sidebar/category-sidebar.component';
import { LoadingSpinnerComponent } from '../../components/loading-spinner/loading-spinner.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule,
    GameCardComponent,
    CategorySidebarComponent,
    LoadingSpinnerComponent
  ],
  template: `
    <div class="home-layout">
      <div class="sidebar-col">
        <app-category-sidebar 
          [lists]="lists" 
          [selectedListId]="selectedListId"
          (listSelected)="onListSelected($event)"
        ></app-category-sidebar>
      </div>
      
      <div class="content-col">
        <div class="header-section">
          <h1 class="page-title">
            {{ getPageTitle() }}
          </h1>
          <p class="page-subtitle" *ngIf="games.length > 0">
            Encontramos {{ games.length }} jogo(s) disponível(is)
          </p>
        </div>

        <app-loading-spinner *ngIf="loading"></app-loading-spinner>

        <div class="error-banner glass-panel" *ngIf="error">
          <p>{{ error }}</p>
          <button class="glow-btn" (click)="loadGames()">Tentar Novamente</button>
        </div>

        <div class="games-grid" *ngIf="!loading && !error">
          <div *ngFor="let game of games" class="grid-item">
            <app-game-card [game]="game"></app-game-card>
          </div>
        </div>

        <div class="empty-state glass-panel" *ngIf="!loading && !error && games.length === 0">
          <p>Nenhum jogo encontrado nesta coleção.</p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .home-layout {
      display: grid;
      grid-template-columns: 280px 1fr;
      gap: 2.5rem;
      align-items: start;
    }
    .header-section {
      margin-bottom: 2rem;
    }
    .page-title {
      font-family: var(--font-display);
      font-size: 2.25rem;
      font-weight: 800;
      letter-spacing: -0.02em;
      margin-bottom: 0.5rem;
      background: linear-gradient(135deg, var(--text-primary) 30%, var(--text-secondary) 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }
    .page-subtitle {
      font-size: 0.95rem;
      color: var(--text-secondary);
    }
    .games-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
      gap: 1.5rem;
    }
    .error-banner {
      padding: 2rem;
      text-align: center;
      border-color: rgba(239, 68, 68, 0.2);
      background: rgba(239, 68, 68, 0.05);
      margin-bottom: 2rem;
    }
    .error-banner p {
      color: #f87171;
      margin-bottom: 1rem;
      font-weight: 500;
    }
    .empty-state {
      padding: 3rem;
      text-align: center;
      color: var(--text-secondary);
    }
    
    @media (max-width: 992px) {
      .home-layout {
        grid-template-columns: 1fr;
      }
      .sidebar-col {
        position: static;
      }
    }
  `]
})
export class HomeComponent implements OnInit {
  games: GameMinDto[] = [];
  lists: GameListDto[] = [];
  selectedListId: number | null = null;
  loading = true;
  error: string | null = null;

  constructor(private apiService: GameApiService) {}

  ngOnInit(): void {
    this.loadLists();
    this.loadGames();
  }

  loadLists(): void {
    this.apiService.getGameLists().subscribe({
      next: (data) => this.lists = data,
      error: () => console.warn('Erro ao carregar coleções de jogos.')
    });
  }

  loadGames(): void {
    this.loading = true;
    this.error = null;
    
    const request = this.selectedListId === null
      ? this.apiService.getAllGames()
      : this.apiService.getGamesByList(this.selectedListId);

    request.subscribe({
      next: (data) => {
        this.games = data;
        this.loading = false;
      },
      error: (err) => {
        console.error(err);
        this.error = 'Não foi possível carregar os jogos. Verifique se o servidor backend está rodando.';
        this.loading = false;
      }
    });
  }

  onListSelected(id: number | null): void {
    this.selectedListId = id;
    this.loadGames();
  }

  getPageTitle(): string {
    if (this.selectedListId === null) {
      return 'Todos os Jogos';
    }
    const currentList = this.lists.find(l => l.id === this.selectedListId);
    return currentList ? currentList.name : 'Coleção';
  }
}
