import { Component, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../services/auth.service';
import { ToastService } from '../services/toast.service';
import { finalize } from 'rxjs/operators';

@Component({
  selector: 'app-register-page',
  standalone: true,
  imports: [FormsModule, RouterLink],
  template: `
    <div class="auth-page">
      <div class="auth-card">
        <div class="auth-logo">
          <div class="auth-logo-icon">&#9670;</div>
          <h1 class="auth-title">Create Account</h1>
          <p class="auth-subtitle">Join PaletteVault today</p>
        </div>

        <form (ngSubmit)="handleRegister()" style="display: flex; flex-direction: column; gap: var(--sp-md);">
          <div class="form-group">
            <label class="form-label" for="username">Username</label>
            <input
              id="username"
              class="form-input"
              [class.error]="error()"
              type="text"
              placeholder="Choose a username"
              [(ngModel)]="username"
              name="username"
              required
              autocomplete="username"
            />
          </div>

          <div class="form-group">
            <label class="form-label" for="email">Email</label>
            <input
              id="email"
              class="form-input"
              [class.error]="error()"
              type="email"
              placeholder="Enter your email"
              [(ngModel)]="email"
              name="email"
              required
              autocomplete="email"
            />
          </div>

          <div class="form-group">
            <label class="form-label" for="password">Password</label>
            <input
              id="password"
              class="form-input"
              [class.error]="error()"
              type="password"
              placeholder="Create a password"
              [(ngModel)]="password"
              name="password"
              required
              autocomplete="new-password"
            />
          </div>

          @if (error()) {
            <span class="form-error text-center">{{ error() }}</span>
          }

          <button class="btn btn-primary btn-lg" type="submit" [disabled]="isLoading()" style="width: 100%;">
            @if (isLoading()) {
              <span class="spinner"></span> Creating account...
            } @else {
              Create Account
            }
          </button>
        </form>

        <div class="auth-footer">
          Already have an account? <a routerLink="/login">Sign in</a>
        </div>
      </div>
    </div>
  `,
})
export class RegisterPageComponent {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly toast = inject(ToastService);

  readonly username = signal('');
  readonly email = signal('');
  readonly password = signal('');
  readonly error = signal('');
  readonly isLoading = signal(false);

  handleRegister() {
    if (!this.username() || !this.email() || !this.password()) {
      this.error.set('Please fill in all fields');
      return;
    }

    if (this.password().length < 6) {
      this.error.set('Password must be at least 6 characters');
      return;
    }

    this.isLoading.set(true);
    this.error.set('');

    this.auth.register(this.username(), this.email(), this.password()).pipe(
      finalize(() => this.isLoading.set(false)),
    ).subscribe({
      next: () => {
        this.toast.success('Account created! Welcome!');
        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        this.error.set(err.error?.message || 'Registration failed');
      },
    });
  }
}
