import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';
import { AuthService } from './services/auth.service';
import { inject } from '@angular/core';

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: () => {
      const auth = inject(AuthService);
      return auth.isAuthenticated() ? '/dashboard' : '/login';
    },
  },
  {
    path: 'login',
    loadComponent: () => import('./pages/login.component').then(m => m.LoginPageComponent),
  },
  {
    path: 'register',
    loadComponent: () => import('./pages/register.component').then(m => m.RegisterPageComponent),
  },
  {
    path: 'dashboard',
    canActivate: [authGuard],
    loadComponent: () => import('./pages/dashboard.component').then(m => m.DashboardPageComponent),
  },
  {
    path: 'explore',
    canActivate: [authGuard],
    loadComponent: () => import('./pages/explore.component').then(m => m.ExplorePageComponent),
  },
  {
    path: 'palette/new',
    canActivate: [authGuard],
    loadComponent: () => import('./pages/palette-editor.component').then(m => m.PaletteEditorPageComponent),
  },
  {
    path: 'palette/:id',
    canActivate: [authGuard],
    loadComponent: () => import('./pages/palette-detail.component').then(m => m.PaletteDetailPageComponent),
  },
  {
    path: 'palette/:id/edit',
    canActivate: [authGuard],
    loadComponent: () => import('./pages/palette-editor.component').then(m => m.PaletteEditorPageComponent),
  },
  {
    path: 'tags',
    canActivate: [authGuard],
    loadComponent: () => import('./pages/tag-management.component').then(m => m.TagManagementPageComponent),
  },
  {
    path: 'settings',
    canActivate: [authGuard],
    loadComponent: () => import('./pages/settings.component').then(m => m.SettingsPageComponent),
  },
  {
    path: '**',
    loadComponent: () => import('./pages/not-found.component').then(m => m.NotFoundPageComponent),
  },
];
