# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Workspace Overview

This workspace contains two independent project areas:

### 粒子日记 (Particle Diary)
A Vite + React + Three.js interactive particle visualization app that converts uploaded photos into particle clouds with real-time audio reactivity via microphone.

- **Stack**: Vite 5, React 18, @react-three/fiber 8, Three.js 0.159, no TypeScript (plain JSX)
- **Entry**: `粒子日记/src/main.jsx` → `App.jsx` (exported as `ParticleDiaryApp`)
- **Key deps**: `react-three/fiber` (React renderer for Three.js), `three` (WebGL)
- **Standalone extras**: `粒子日记/mouse-trail.html` (vanilla JS canvas particle trail), `粒子日记v1.jsx` (earlier iteration)

### e-car oversea/ — New Energy Vehicle Overseas Projects

Three related projects for Chinese EV brands expanding to international markets:

1. **OKComputer_新能源车海外可行性** — Feasibility analysis site with public + admin portal
2. **新能源汽车出海网站** — Public EV overseas website (mirror of OKComputer architecture)
3. **car newest 331** — Two-part project:
   - `app/` — shadcn/ui scaffolding (boilerplate, not customized)
   - `car_platform/` — Full-stack car info platform: FastAPI backend, Scrapy crawlers, React frontend, PostgreSQL, Redis, Docker

All e-car frontends share the same tech stack: **Vite 7, React 19, TypeScript 5.9, Tailwind CSS 3.4, shadcn/ui (Radix UI), ESLint 9**.

## Common Commands

### 粒子日记
```bash
cd "粒子日记"
npm run dev      # Start dev server
npm run build    # Production build
npm run lint     # ESLint check
npm run preview  # Preview production build
```

### e-car frontend projects (OKComputer, 新能源汽车出海网站, car newest 331/app)
From the respective `app/` directory:
```bash
npm run dev      # Start Vite dev server
npm run build    # TypeScript check + Vite build
npm run lint     # ESLint
npm run preview  # Preview build
```

### car newest 331/car_platform (full-stack)
```bash
cd "e-car oversea/car newest 331/car_platform"
docker-compose up -d          # Start all services (PostgreSQL, Redis, backend, frontend, crawler, nginx)

cd backend && uvicorn main:app --reload   # Backend dev
cd crawler && python run.py runall        # Run all crawlers
cd crawler && python scheduler.py         # Start crawl scheduler
```

## Architecture Notes

### e-car frontend conventions (OKComputer & 新能源汽车出海网站)
Both apps have identical architecture generated from the same template:
- `src/components/layout/` — MainLayout, Navbar, Footer
- `src/pages/` — Public pages (home, brands, models, news, contact) and admin pages (Dashboard, Leads, Brands, Models, Assets, News, Settings)
- `src/stores/index.ts` — Zustand stores for brands, models, leads, user auth, dashboard stats, UI state
- `src/types/index.ts` — TypeScript interfaces: Brand, Model, Lead, Asset, News, User, DashboardStats
- `src/services/api.ts` — Axios-based API client
- `src/constants/index.ts` — App constants
- Route structure: Public routes under `<MainLayout>`, admin routes under `<AdminLayout>` at `/admin/*`
- `@/` path alias maps to `src/`

### car newest 331/car_platform (full-stack)
- **Frontend** (`frontend/`): React SPA with react-router-dom, pages: Home, Vehicles, VehicleDetail, News, NewsDetail, Brands, SalesRank, PriceMonitor
- **Backend**: FastAPI at port 8000, API docs at `/docs`
- **Crawlers** (`crawler/car_crawler/`): Scrapy spiders for autohome.com.cn, dongchedi.com, yiche.com with middleware for proxy rotation, user-agent rotation, retry logic
- **Data**: PostgreSQL 15 (main store), Redis 7 (cache)
- **Infra**: Docker Compose with services for db, redis, backend, frontend, crawler, nginx

### 粒子日记 architecture
- All logic in a single `App.jsx` component: audio analyzer hook (`useAudioAnalyzer`), Three.js particle system (`ParticleCloud` with custom GLSL shaders), and main UI (`ParticleDiaryApp`)
- `ParticleCloud` samples uploaded images at 200×200 resolution, creates particle positions/colors from pixel data, renders with `ShaderMaterial` using audio-reactive vertex/fragment shaders
- Tab-based UI: THE GARDEN (main particle view), MEMORY, MUSIC, INFO

## Key Patterns

### shadcn/ui component usage
```tsx
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle } from '@/components/ui/card'
```
All UI primitives in e-car projects live in `src/components/ui/` with 40+ components.

### State management
e-car projects use **Zustand** for client state. Each domain (brands, models, leads, etc.) has its own store slice in `src/stores/index.ts`.
