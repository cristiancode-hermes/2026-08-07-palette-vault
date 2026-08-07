import { Component, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../services/auth.service';
import { ToastService } from '../services/toast.service';
import { finalize } from 'rxjs/operators';

@Component({
  selector: 'app-login-page',
  standalone: true,
  imports: [FormsModule, RouterLink],
  template: `
    <div class="auth-page">
      <div class="auth-card">
        <div class="auth-logo">
          <div class="auth-logo-icon">&#9670;</div>
          <h1 class="auth-title">Welcome Back</h1>
          <p class="auth-subtitle">Sign in to PaletteVault</p>
        </div>

        <form (ngSubmit)="handleLogin()" style="display: flex; flex-direction: column; gap: var(--sp-md);">
          <div class="form-group">
            <label class="form-label" for="login">Username or Email</label>
            <input
              id="login"
              class="form-input"
              [class.error]="error()"
              type="text"
              placeholder="Enter your username or email"
              [(ngModel)]="loginValue"
              name="login"
              required
              autocomplete="username"
            />
          </div>

          <div class="form-group">
            <label class="form-label" for="password">Password</label>
            <input
              id="password"
              class="form-input"
              [class.error]="error()"
              type="password"
              placeholder="Enter your password"
              [(ngModel)]="password"
              name="password"
              required
              autocomplete="current-password"
            />
          </div>

          @if (error()) {
            <span class="form-error text-center">{{ error() }}</span>
          }

          <button class="btn btn-primary btn-lg" type="submit" [disabled]="isLoading()" style="width: 100%;">
            @if (isLoading()) {
              <span class="spinner"></span> Signing in...
            } @else {
              Sign In
            }
          </button>
        </form>

        <div class="auth-footer">
          Don't have an account? <a routerLink="/register">Create one</a>
        </div>
      </div>
    </div>
  `,
})
export class LoginPageComponent {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly toast = inject(ToastService);

  readonly loginValue = signal('');
  readonly password = signal('');
  readonly error = signal('');
  readonly isLoading = signal(false);

  handleLogin() {
    if (!this.loginValue() || !this.password()) {
      this.error.set('Please fill in all fields');
      return;
    }

    this.isLoading.set(true);
    this.error.set('');

    this.auth.login(this.loginValue(), this.password()).pipe(
      finalize(() => this.isLoading.set(false)),
    ).subscribe({
      next: () => {
        this.toast.success('Welcome back!');
        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        this.error.set(err.error?.message || 'Invalid credentials');
      },
    });
  }
}
