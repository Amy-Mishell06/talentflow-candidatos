import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'tabs',
    loadComponent: () => import('./pages/tabs/tabs.page').then((m) => m.TabsPage),
    children: [
      {
        path: 'registro',
        loadComponent: () => import('./pages/registro/registro.page').then((m) => m.RegistroPage),
      },
      {
        path: 'candidatos',
        loadComponent: () => import('./pages/candidatos/candidatos.page').then((m) => m.CandidatosPage),
      },
      { path: '', redirectTo: '/tabs/registro', pathMatch: 'full' },
    ],
  },
  { path: '', redirectTo: '/tabs/registro', pathMatch: 'full' },
  { path: '**', redirectTo: '/tabs/registro' },
];
