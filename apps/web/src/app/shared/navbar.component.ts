import { Component, inject, signal } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { ThemeService } from '../services/theme.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  template: `
    <nav class="navbar">
      <a class="navbar-brand" routerLink="/dashboard">
        <span class="navbar-brand-logo">&#9670;</span>
        PaletteVault
      </a>

      <button class="navbar-hamburger" (click)="mobileOpen.set(!mobileOpen())" type="button">
        @if (mobileOpen()) { &#10005; } @else { &#9776; }
      </button>

      <div class="navbar-nav" [class.open]="mobileOpen()">
        <a class="navbar-link" routerLink="/dashboard" routerLinkActive="active" [routerLinkActiveOptions]="{exact: true}">My Palettes</a>
        <a class="navbar-link" routerLink="/explore" routerLinkActive="active">Explore</a>
        <a class="navbar-link" routerLink="/tags" routerLinkActive="active">Tags</a>

        <ng-content></ng-content>

        <button class="btn btn-ghost btn-sm" (click)="theme.toggle()" type="button" style="margin-left: var(--sp-sm);">
          @if (theme.isDark()) { &#9789; } @else { &#9728; }
        </button>

        @if (auth.isAuthenticated()) {
          <div class="navbar-user">
            <span class="navbar-avatar">{{ auth.currentUser()?.username?.charAt(0)?.toUpperCase() || '?' }}</span>
            <span style="font-size: 0.875rem; color: var(--color-ink-secondary);">{{ auth.currentUser()?.username }}</span>
            <button class="btn btn-ghost btn-sm" (click)="logout()" type="button">Logout</button>
          </div>
        }
      </div>
    </nav>
  `,
})
export class NavbarComponent {
  readonly auth = inject(AuthService);
  readonly theme = inject(ThemeService);
  private readonly router = inject(Router);
  readonly mobileOpen = signal(false);

  logout() {
    this.auth.logout();
    this.router.navigate(['/login']);
  }
}
