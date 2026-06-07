import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GameListDto } from '../../models/game-list.model';

@Component({
  selector: 'app-category-sidebar',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="sidebar glass-panel">
      <h3 class="sidebar-title">Coleções</h3>
      <ul class="list-group">
        <li 
          class="list-item" 
          [class.active]="selectedListId === null" 
          (click)="selectList(null)"
        >
          <span class="bullet-dot"></span>
          Todos os Jogos
        </li>
        <li 
          *ngFor="let list of lists" 
          class="list-item" 
          [class.active]="selectedListId === list.id" 
          (click)="selectList(list.id)"
        >
          <span class="bullet-dot"></span>
          {{ list.name }}
        </li>
      </ul>
    </div>
  `,
  styles: [`
    .sidebar {
      padding: 1.5rem;
      position: sticky;
      top: 6rem;
    }
    .sidebar-title {
      font-family: var(--font-display);
      font-size: 1.25rem;
      font-weight: 700;
      color: var(--text-primary);
      margin-bottom: 1.25rem;
      padding-bottom: 0.75rem;
      border-bottom: 1px solid var(--border-color);
    }
    .list-group {
      list-style: none;
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }
    .list-item {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 0.75rem 1rem;
      border-radius: 8px;
      font-size: 0.95rem;
      color: var(--text-secondary);
      cursor: pointer;
      transition: var(--transition-fast);
      border: 1px solid transparent;
    }
    .list-item:hover {
      color: var(--text-primary);
      background: rgba(255, 255, 255, 0.03);
    }
    .list-item.active {
      color: var(--text-primary);
      background: rgba(139, 92, 246, 0.1);
      border-color: rgba(139, 92, 246, 0.2);
    }
    .bullet-dot {
      width: 6px;
      height: 6px;
      background: var(--text-muted);
      border-radius: 50%;
      transition: var(--transition-fast);
    }
    .list-item.active .bullet-dot {
      background: var(--accent-secondary);
      box-shadow: 0 0 8px var(--accent-secondary);
      transform: scale(1.2);
    }
    .list-item:hover:not(.active) .bullet-dot {
      background: var(--text-secondary);
    }
  `]
})
export class CategorySidebarComponent {
  @Input() lists: GameListDto[] = [];
  @Input() selectedListId: number | null = null;
  @Output() listSelected = new EventEmitter<number | null>();

  selectList(id: number | null): void {
    this.listSelected.emit(id);
  }
}
