# Frontend — PaletteVault

## Overview

Angular 22 standalone application with signals, zoneless change detection, and OnPush change detection strategy. Pure CSS with custom properties for theming (no Tailwind build step needed).

## Routes

| Route             | Component                | Auth | Description                     |
|-------------------|--------------------------|------|---------------------------------|
| `/login`          | LoginPageComponent       | No   | Login with username or email    |
| `/register`       | RegisterPageComponent    | No   | Registration form               |
| `/dashboard`      | DashboardPageComponent   | Yes  | User's palette grid + search    |
| `/explore`        | ExplorePageComponent     | Yes  | Public palettes gallery         |
| `/palette/new`    | PaletteEditorPageComponent | Yes | Create new palette              |
| `/palette/:id`    | PaletteDetailPageComponent | Yes | View palette + contrast + export |
| `/palette/:id/edit` | PaletteEditorPageComponent | Yes | Edit existing palette           |
| `/tags`           | TagManagementPageComponent | Yes | CRUD tags                       |
| `/settings`       | SettingsPageComponent    | Yes  | User settings                   |
| `/404`            | NotFoundPageComponent    | No   | 404 page                        |
| `` (root)         | —                        | —    | Redirects to /dashboard or /login |

## Services

| Service          | Responsibility                                               |
|------------------|--------------------------------------------------------------|
| AuthService      | Login, register, JWT management, currentUser signal           |
| PaletteService   | CRUD palettes, search, list, toggle visibility, clone         |
| TagService       | CRUD tags                                                    |
| ExportService    | Calls export API to format CSS variables and Tailwind blocks  |
| ContrastService  | Client-side WCAG contrast math (relativeLuminance, ratio, grade) |
| ColorService     | Hex↔RGB conversion, color validation                         |
| ThemeService     | Dark/light mode toggle, localStorage persistence, prefers-color-scheme |
| ToastService     | Global toast message queue with signal                       |

## ContrastService API

```typescript
hexToRgb(hex: string): [number, number, number]
relativeLuminance(r: number, g: number, b: number): number
contrastRatio(hex1: string, hex2: string): number
getWcagGrade(ratio: number): { aaNormal: boolean; aaLarge: boolean; aaa: boolean }
```

## Design System

### Color Palette — "Amethyst Studio"

Full design tokens in `styles.css` covering light and dark mode.

### Typography
- **Inter** (Google Fonts): body, headings, UI text
- **JetBrains Mono** (Google Fonts): code blocks, hex values
- Scale: h1 (2rem), h2 (1.5rem), h3 (1.25rem), body (1rem), body-sm (0.875rem), caption (0.75rem)

### Component Patterns

All patterns defined in `styles.css`:
- **Buttons**: primary (bg-primary/white), secondary (border only), ghost (transparent), danger
- **Inputs**: border with focus ring in primary-light
- **Cards**: white bg, subtle border, shadow-sm
- **Tags/Badges**: inline colored badges with optional removal

## Dark Mode

Toggle via navbar button. `.dark` class on `<html>` alternates all token values. Persisted in localStorage under key `palette-vault-theme`. Respects `prefers-color-scheme` on first visit.

## Key Implementation Details

1. All HTTP calls go through `auth.interceptor.ts` which adds the Bearer token
2. Routes protected with `authGuard` — redirects to `/login` if not authenticated
3. Toast notifications via `ToastService` — signal-driven, rendered in `app.ts`
4. Lazy-loaded routes for all page components
5. Palette colors stored as JSON object with exactly 5 keys
6. Color selector dropdown in contrast checker shows all 5 palette colors with role labels and hex values
