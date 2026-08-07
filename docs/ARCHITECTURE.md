# Architecture — PaletteVault

## Overview

PaletteVault is a full-stack color palette management tool. Users create, manage, and export 5-color palettes, check WCAG contrast ratios in real-time, and export to CSS variables or Tailwind `@theme` blocks.

## Stack

| Layer   | Technology                                                    |
|---------|---------------------------------------------------------------|
| Frontend | Angular 22 (standalone, zoneless, signals, OnPush CD)        |
| Styling  | Pure CSS with custom properties (theme tokens)               |
| Backend  | NestJS 11 (modules: auth, palettes, tags, export, seed)      |
| Database | SQLite (better-sqlite3) via TypeORM 1.1, Neon-ready schema   |
| Auth     | JWT with Passport (username or email login)                  |
| Port     | 3042                                                         |
| Fonts    | Inter (body/headings), JetBrains Mono (code)                 |

## Project Structure

```
palette-vault/
├── apps/
│   ├── api/                          # NestJS backend
│   │   ├── src/
│   │   │   ├── main.ts               # Bootstrap + Swagger + CORS + seed
│   │   │   ├── app.module.ts         # Root module with TypeORM + all feature modules
│   │   │   ├── entities/             # TypeORM entities
│   │   │   │   ├── user.entity.ts
│   │   │   │   ├── palette.entity.ts
│   │   │   │   └── tag.entity.ts
│   │   │   ├── auth/                 # JWT auth module
│   │   │   │   ├── auth.module.ts
│   │   │   │   ├── auth.controller.ts
│   │   │   │   ├── auth.service.ts
│   │   │   │   ├── jwt.strategy.ts
│   │   │   │   ├── jwt-auth.guard.ts
│   │   │   │   └── dto/
│   │   │   │       ├── register.dto.ts
│   │   │   │       └── login.dto.ts
│   │   │   ├── palettes/             # Palette CRUD module
│   │   │   │   ├── palettes.module.ts
│   │   │   │   ├── palettes.controller.ts
│   │   │   │   ├── palettes.service.ts
│   │   │   │   └── dto/
│   │   │   │       ├── create-palette.dto.ts
│   │   │   │       └── update-palette.dto.ts
│   │   │   ├── tags/                 # Tag management module
│   │   │   │   ├── tags.module.ts
│   │   │   │   ├── tags.controller.ts
│   │   │   │   ├── tags.service.ts
│   │   │   │   └── dto/
│   │   │   │       ├── create-tag.dto.ts
│   │   │   │       └── update-tag.dto.ts
│   │   │   ├── export/               # Export module (CSS + Tailwind formatting)
│   │   │   │   ├── export.module.ts
│   │   │   │   ├── export.controller.ts
│   │   │   │   ├── export.service.ts
│   │   │   │   └── dto/
│   │   │   │       └── export-colors.dto.ts
│   │   │   └── seed/                 # Database seeder
│   │   │       ├── seed.module.ts
│   │   │       └── seed.service.ts
│   │   ├── dist/                     # Compiled output
│   │   └── nest-cli.json
│   └── web/                          # Angular 22 frontend
│       ├── src/
│       │   ├── index.html
│       │   ├── main.ts
│       │   ├── styles.css            # Design tokens + component styles
│       │   └── app/
│       │       ├── app.ts            # Root component
│       │       ├── app.config.ts     # Providers (router, interceptors)
│       │       ├── app.routes.ts     # Route definitions + auth guard
│       │       ├── services/
│       │       │   ├── auth.service.ts
│       │       │   ├── palette.service.ts
│       │       │   ├── tag.service.ts
│       │       │   ├── export.service.ts
│       │       │   ├── contrast.service.ts
│       │       │   ├── color.service.ts
│       │       │   ├── theme.service.ts
│       │       │   └── toast.service.ts
│       │       ├── guards/
│       │       │   └── auth.guard.ts
│       │       ├── interceptors/
│       │       │   └── auth.interceptor.ts
│       │       ├── shared/
│       │       │   ├── navbar.component.ts
│       │       │   ├── color-bar.component.ts
│       │       │   ├── color-selector-dropdown.component.ts
│       │       │   ├── tag-badge.component.ts
│       │       │   ├── code-block.component.ts
│       │       │   ├── copy-button.component.ts
│       │       │   ├── toast.component.ts
│       │       │   ├── confirm-dialog.component.ts
│       │       │   └── input-field.component.ts
│       │       └── pages/
│       │           ├── login.component.ts
│       │           ├── register.component.ts
│       │           ├── dashboard.component.ts
│       │           ├── explore.component.ts
│       │           ├── palette-detail.component.ts
│       │           ├── palette-editor.component.ts
│       │           ├── tag-management.component.ts
│       │           ├── settings.component.ts
│       │           └── not-found.component.ts
│       ├── angular.json
│       └── tsconfig.json
├── docs/
│   ├── ARCHITECTURE.md (this file)
│   ├── API.md
│   └── FRONTEND.md
├── package.json (npm workspaces root)
└── .gitignore
```

## Data Flow

```
Browser → Angular App → AuthService/PaletteService/etc. → HTTP Interceptor (JWT) 
  → NestJS API → Controllers → Services → TypeORM → SQLite
  ← JSON responses ← Signal updates in Angular components ←
```

## Key Design Decisions

1. **Contrast calculation is client-side**: WCAG math (relative luminance, contrast ratio) runs in `ContrastService` — no API round-trip for real-time feedback
2. **Export is server-backed**: CSS variable and Tailwind `@theme` formatting runs in `ExportService` on the API side for consistent formatting
3. **Colors stored as JSON string**: The `colors` field in `Palette` entity is a JSON string with exactly 5 keys: primary, secondary, accent, surface, text
4. **Login by username OR email**: Single `login` field accepted and checked against both columns
5. **Dark mode via CSS class**: ThemeService toggles `.dark` class on `<html>`, persisted in localStorage
