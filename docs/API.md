# API — PaletteVault

Base URL: `http://localhost:3042/api`
Swagger UI: `http://localhost:3042/api/docs`

## Auth

### POST /api/auth/register

Register a new user.

**Body:**
```json
{
  "username": "alice",
  "email": "alice@example.com",
  "password": "secret123"
}
```

**Response (201):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": { "id": 1, "username": "alice", "email": "alice@example.com" }
}
```

### POST /api/auth/login

Login with username or email.

**Body:**
```json
{
  "login": "alice",
  "password": "secret123"
}
```

**Response (200):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": { "id": 1, "username": "alice", "email": "alice@example.com" }
}
```

### GET /api/auth/me

Get current authenticated user.

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
{ "id": 1, "username": "alice", "email": "alice@example.com" }
```

## Palettes

All palette endpoints require `Authorization: Bearer <token>`.

### GET /api/palettes

List the authenticated user's palettes.

**Query params:** `?search=&tag=&sort=newest`

**Response (200):**
```json
[
  {
    "id": 1,
    "name": "Ocean Breeze",
    "description": "Cool blues and teals",
    "colors": {
      "primary": "#0C7C9A",
      "secondary": "#52B2CF",
      "accent": "#F9A826",
      "surface": "#E8F4F8",
      "text": "#1A2B3C"
    },
    "isPublic": true,
    "userId": 1,
    "tags": [{ "id": 1, "name": "ocean", "color": "#3498DB" }],
    "createdAt": "2026-08-07T00:00:00.000Z",
    "updatedAt": "2026-08-07T00:00:00.000Z"
  }
]
```

### GET /api/palettes/public

List all public palettes.

**Query params:** `?search=&tag=`

### GET /api/palettes/:id

Get a single palette (own or public).

### POST /api/palettes

Create a new palette.

**Body:**
```json
{
  "name": "My Palette",
  "description": "Description",
  "colors": {
    "primary": "#6C5CE7",
    "secondary": "#A29BFE",
    "accent": "#FDCB6E",
    "surface": "#F8F7FF",
    "text": "#1A1A2E"
  },
  "tagIds": [1, 2],
  "isPublic": true
}
```

### PUT /api/palettes/:id

Update a palette. Accepts partial updates.

### DELETE /api/palettes/:id

Delete a palette. Returns 204.

### POST /api/palettes/:id/clone

Clone a public palette to the current user. The cloned palette is private by default.

## Tags

All tag endpoints require `Authorization: Bearer <token>`.

### GET /api/tags

List the user's tags.

### POST /api/tags

Create a tag.

**Body:**
```json
{ "name": "ocean", "color": "#3498DB" }
```

### PUT /api/tags/:id

Update a tag.

### DELETE /api/tags/:id

Delete a tag. Returns 204.

## Export

All export endpoints require `Authorization: Bearer <token>`.

### POST /api/export/css

Format colors as CSS custom properties.

**Body:**
```json
{
  "colors": {
    "primary": "#6C5CE7",
    "secondary": "#A29BFE",
    "accent": "#FDCB6E",
    "surface": "#F8F7FF",
    "text": "#1A1A2E"
  }
}
```

**Response:**
```json
{
  "css": ":root {\n  --color-primary: #6C5CE7;\n  --color-secondary: #A29BFE;\n  --color-accent: #FDCB6E;\n  --color-surface: #F8F7FF;\n  --color-text: #1A1A2E;\n}"
}
```

### POST /api/export/tailwind

Format colors as Tailwind v4 `@theme` block.

**Body:** Same as export/css.

**Response:**
```json
{
  "tailwind": "@theme {\n  --color-primary: #6C5CE7;\n  --color-secondary: #A29BFE;\n  --color-accent: #FDCB6E;\n  --color-surface: #F8F7FF;\n  --color-text: #1A1A2E;\n}"
}
```

## Health

### GET /api/health

**Response:**
```json
{ "status": "ok", "timestamp": "2026-08-07T00:00:00.000Z" }
```
