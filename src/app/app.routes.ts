import { Routes } from '@angular/router';
import { Landing } from './pages/landing/landing';
import { Museum } from './pages/museum/museum';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/landing/landing').then(m => m.Landing)
  },
  {
    path: 'museo',
    loadComponent: () => import('./pages/museum/museum').then(m => m.Museum)
  },
  { path: '**', redirectTo: '' },
];
