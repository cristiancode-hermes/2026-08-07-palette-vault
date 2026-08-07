import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-not-found-page',
  standalone: true,
  imports: [RouterLink],
  template: `
    <div class="auth-page">
      <div style="text-align: center;">
        <div style="font-size: 6rem; font-weight: var(--font-weight-bold); color: var(--color-primary); line-height: 1;">404</div>
        <h1 style="margin-bottom: var(--sp-sm);">Page Not Found</h1>
        <p class="text-muted" style="margin-bottom: var(--sp-xl);">The page you're looking for doesn't exist.</p>
        <a class="btn btn-primary" routerLink="/">Go Home</a>
      </div>
    </div>
  `,
})
export class NotFoundPageComponent {}
