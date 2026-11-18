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
    path: 'virgen',
    loadComponent: () => import('./pages/virgin/virgin').then(m => m.Virgin)
  },
  {
    path: 'hermandad',
    loadComponent: () => import('./pages/dashboard/dashboard').then(m => m.Dashboard)
  },
  {
    path: 'velario',
    loadComponent: () => import('./pages/candles/candles').then(m => m.Candles)
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
  {
    path: 'romeria',
    loadComponent: () => import('./pages/pilgrimage/pilgrimage').then(m => m.Pilgrimage)
  },
  { path: '**', redirectTo: '' },
];