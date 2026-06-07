import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  template: `
    <nav class="navbar glass-panel">
      <div class="navbar-container">
        <a routerLink="/" class="navbar-brand">
          <span class="brand-gradient">DSList</span>
          <span class="brand-sub">Catalog</span>
        </a>
        <div class="navbar-links">
          <a routerLink="/" routerLinkActive="active" [routerLinkActiveOptions]="{exact: true}" class="nav-link">Home</a>
        </div>
      </div>
    </nav>
  `,
  styles: [`
    .navbar {
      margin-top: 1.5rem;
      margin-bottom: 2rem;
      border-radius: 16px;
      padding: 0.75rem 1.5rem;
      position: sticky;
      top: 1rem;
      z-index: 100;
    }
    .navbar-container {
      display: flex;
      justify-content: flex-start;
      align-items: center;
      gap: 2rem;
    }
    .navbar-brand {
      display: flex;
      align-items: baseline;
      gap: 0.35rem;
      font-size: 1.5rem;
      font-weight: 800;
      font-family: var(--font-display);
      letter-spacing: -0.025em;
    }
    .brand-gradient {
      background: linear-gradient(135deg, var(--accent-primary) 0%, var(--accent-secondary) 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }
    .brand-sub {
      font-size: 0.9rem;
      font-weight: 400;
      color: var(--text-secondary);
      text-transform: uppercase;
      letter-spacing: 0.1em;
    }
    .navbar-links {
      display: flex;
      gap: 1.5rem;
    }
    .nav-link {
      color: var(--text-secondary);
      font-size: 0.95rem;
      font-weight: 500;
      padding: 0.5rem 1rem;
      border-radius: 8px;
      transition: var(--transition-fast);
    }
    .nav-link:hover {
      color: var(--text-primary);
      background: rgba(255, 255, 255, 0.05);
    }
    .nav-link.active {
      color: var(--text-primary);
      background: rgba(139, 92, 246, 0.15);
      border: 1px solid rgba(139, 92, 246, 0.25);
    }
  `]
})
export class NavbarComponent {}
