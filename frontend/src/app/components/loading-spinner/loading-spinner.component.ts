import { Component } from '@angular/core';

@Component({
  selector: 'app-loading-spinner',
  standalone: true,
  template: `
    <div class="spinner-container">
      <div class="spinner"></div>
    </div>
  `,
  styles: [`
    .spinner-container {
      display: flex;
      justify-content: center;
      align-items: center;
      padding: 3rem;
      width: 100%;
    }
    .spinner {
      width: 48px;
      height: 48px;
      border: 4px solid var(--border-color-hover);
      border-top-color: var(--accent-primary);
      border-radius: 50%;
      animation: spin 1s infinite linear;
    }
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
  `]
})
export class LoadingSpinnerComponent {}
