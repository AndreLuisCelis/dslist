import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { GameDetailComponent } from './pages/game-detail/game-detail.component';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'game/:id', component: GameDetailComponent },
  { path: '**', redirectTo: '' }
];
