# Web Editor — Development Guide

## Architecture

This project follows **Domain-Driven Design (DDD)** layered architecture:

```
UI (React components)
  ↓
Application (EditorApplicationService — use case orchestration)
  ↓
Domain (Tab Entity, Workspace VO, EncryptionService, ExportService, etc.)
  ↓
Infrastructure (localStorage, Web Crypto API, data: URI)
```

### Dependency Direction

UI → Application → Domain → Infrastructure

- **Domain** has zero dependencies on other layers. It defines interfaces (`TabRepository`, `EncryptionService`, `ExportService`, `ImportService`).
- **Application** depends only on Domain. Orchestrates use cases.
- **Infrastructure** depends on Domain (implements its interfaces) and Application.
- **UI** depends on Application and Infrastructure (for DI composition).

### Layers

| Layer | Directory | Responsibility |
|-------|-----------|---------------|
| Domain | `src/domain/` | Core business logic, entities, value objects, domain services, repository interfaces, factories |
| Application | `src/application/` | Use case orchestration (`EditorApplicationService`) |
| Infrastructure | `src/infrastructure/` | External concerns: localStorage, Web Crypto API, data: URI export/import |
| UI | `src/ui/` | React components, presentation, user input handling |

## Key Domain Patterns

- **Entity**: `Tab` — identity-based equality, encapsulates lifecycle behavior
- **Value Objects**: `Workspace`, `EncryptedContent`, `ShareLink` — immutable, attribute-based equality
- **Factory**: `TabFactory` — enforces invariants at creation time
- **Repository**: `TabRepository` — collection-like interface, only for Aggregate roots (tabs)
- **Domain Services**: `EncryptionService`, `ExportService`, `ImportService` — stateless operations

## Tech Stack

- React 19 + TypeScript + Vite
- Web Crypto API (AES-GCM + PBKDF2) for encryption
- Browser `localStorage` for persistence
- `data:` URIs for share/import links
- GitHub Pages for deployment

## Development

### Prerequisites

- Node.js 20+
- npm

### Install

```bash
npm install
```

### Run Dev Server

```bash
npm run dev      # http://localhost:5173/web-editor/
```

### Build

```bash
npm run build    # outputs to dist/
```

### Type Check

```bash
npx tsc -p tsconfig.app.json --noEmit
```

## Deployment

GitHub Pages serves from the `main` branch root. Built assets (`index.html`, `assets/`, `.nojekyll`) are committed to the repo so Pages can serve them directly without the Actions build pipeline.

To deploy after changes:

```bash
npm run build
cp dist/index.html dist/assets/ . -r
touch .nojekyll
git add -A
git commit -m "message"
git push origin main
```

Live site: https://hermes98761234.github.io/web-editor/

## Skills

The following Hermes Agent skills are relevant for this project:

- **domain-driven-design** — DDD tactical/strategic patterns, code generation, code review, migration planning. Load with `skill_view(name='domain-driven-design')`.
- **spa-github-pages** — Deploy React + Vite SPA to GitHub Pages via Actions. Load with `skill_view(name='spa-github-pages')`.
- **brainstorming** — Required before creative work / feature design. Load with `skill_view(name='brainstorming')`.
- **hallmark** — Design skill for polished UIs. Load with `skill_view(name='hallmark')`.

## Code Conventions

- All colors and fonts go through CSS tokens declared at `:root` — no literal colors past the token block
- Every interactive element has `:focus-visible`
- No `transition: all`, no emoji as icons, no card-in-card
- Ubiquitous Language: class/method/variable names reflect domain terms. No "Manager", "Helper", "Processor" in the domain layer
- Components are pure presentation — no domain logic in UI layer
