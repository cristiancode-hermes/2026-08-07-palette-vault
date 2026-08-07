import { Component, inject } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { ThemeService } from '../services/theme.service';
import { NavbarComponent } from '../shared/navbar.component';

@Component({
  selector: 'app-settings-page',
  standalone: true,
  imports: [NavbarComponent],
  template: `
    <app-navbar></app-navbar>
    <div class="page-container">
      <div class="page-header">
        <h1 class="page-title">Settings</h1>
      </div>

      <div style="display: flex; flex-direction: column; gap: var(--sp-lg); max-width: 600px;">
        <!-- Profile -->
        <div class="card">
          <div class="card-header">
            <span class="card-title">Profile</span>
          </div>
          <div style="display: flex; flex-direction: column; gap: var(--sp-md);">
            <div>
              <span class="form-label">Username</span>
              <p style="font-weight: var(--font-weight-medium);">{{ auth.currentUser()?.username || '—' }}</p>
            </div>
            <div>
              <span class="form-label">Email</span>
              <p style="font-weight: var(--font-weight-medium);">{{ auth.currentUser()?.email || '—' }}</p>
            </div>
          </div>
        </div>

        <!-- Appearance -->
        <div class="card">
          <div class="card-header">
            <span class="card-title">Appearance</span>
          </div>
          <div class="flex-row items-center justify-between">
            <span>Dark Mode</span>
            <button
              class="btn"
              [class.btn-primary]="theme.isDark()"
              [class.btn-secondary]="!theme.isDark()"
              (click)="theme.toggle()"
              type="button"
            >
              @if (theme.isDark()) { &#9789; Dark } @else { &#9728; Light }
            </button>
          </div>
        </div>

        <!-- About -->
        <div class="card">
          <div class="card-header">
            <span class="card-title">About</span>
          </div>
          <p class="text-muted" style="font-size: var(--font-size-body-sm);">
            PaletteVault — A color palette manager. Version 1.0.0
          </p>
        </div>
      </div>
    </div>
  `,
})
export class SettingsPageComponent {
  readonly auth = inject(AuthService);
  readonly theme = inject(ThemeService);
}
