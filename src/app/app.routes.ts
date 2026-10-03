import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/landing/landing').then(m => m.Landing)
  },
  {
    path: 'museo',
    loadComponent: () => import('./pages/museum/museum').then(m => m.Museum)
  },
  {
    path: 'oraciones',
    children: [
      {
        path: '',
        loadComponent: () => import('./pages/pray/pray').then(m => m.Pray)
      },
      {
        path: 'novena',
        loadComponent: () => import('./pages/pray/novena/novena').then(m => m.Novena)
      }
    ]
  },
  { path: '**', redirectTo: '' },
];