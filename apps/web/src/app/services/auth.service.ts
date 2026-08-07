import { Injectable, signal, computed, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { toSignal } from '@angular/core/rxjs-interop';
import { map, tap } from 'rxjs/operators';

export interface User {
  id: number;
  username: string;
  email: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly tokenKey = 'pv_jwt';

  private readonly tokenSignal = signal<string | null>(localStorage.getItem(this.tokenKey));

  readonly currentUser = signal<User | null>(null);
  readonly isLoading = signal(false);

  readonly isAuthenticated = computed(() => this.tokenSignal() !== null);

  constructor() {
    if (this.isAuthenticated()) {
      this.loadUser();
    }
  }

  getToken(): string | null {
    return this.tokenSignal();
  }

  login(login: string, password: string) {
    this.isLoading.set(true);
    return this.http.post<AuthResponse>('/api/auth/login', { login, password }).pipe(
      tap(res => this.handleAuth(res)),
    );
  }

  register(username: string, email: string, password: string) {
    this.isLoading.set(true);
    return this.http.post<AuthResponse>('/api/auth/register', { username, email, password }).pipe(
      tap(res => this.handleAuth(res)),
    );
  }

  logout() {
    localStorage.removeItem(this.tokenKey);
    this.tokenSignal.set(null);
    this.currentUser.set(null);
  }

  loadUser() {
    if (!this.isAuthenticated()) return;
    this.http.get<User>('/api/auth/me').subscribe({
      next: user => this.currentUser.set(user),
      error: () => this.logout(),
    });
  }

  private handleAuth(res: AuthResponse) {
    localStorage.setItem(this.tokenKey, res.token);
    this.tokenSignal.set(res.token);
    this.currentUser.set(res.user);
    this.isLoading.set(false);
  }
}
