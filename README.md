# PaletteVault 🎨

A color palette manager — create, organize, explore, and share color combinations.

## Stack

| Layer     | Technology          |
|-----------|---------------------|
| Frontend  | Angular 22          |
| Backend   | NestJS 11           |
| Database  | SQLite (better-sqlite3) |
| Auth      | JWT (bcryptjs)      |

## Features

- **Create and edit** color palettes with a visual editor
- **Explore** public palettes with tag-based search
- **Tag system** for organizing palettes by categories
- **Export** palettes in CSS, SCSS, and JSON formats
- **Dark/light theme** with persistent preference
- **User dashboard** with favorites and recent palettes
- **JWT authentication** with registration and login

## Run Locally

```bash
# API
cd apps/api
npm install
PORT=3042 node dist/main.js

# Web
cd apps/web
npm install
npx ng serve
```

## Tests

```bash
cd apps/api && npm test
```

## QA

- Build: ✅ API (`npx tsc`), Web (`ng build`)
- Auth: ✅ Register, Login (username/email), JWT, guard
- API: ✅ Palettes CRUD, Tags, Export, Seed data
