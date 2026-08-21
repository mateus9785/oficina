# Oficina

![CI](https://github.com/mateus9785/oficina/actions/workflows/ci.yml/badge.svg)

A repair-shop (oficina mecânica) management system: clientes, veículos,
ordens de serviço on a kanban board (aguardando aprovação → aguardando peça →
em execução → pronto pra retirada → finalizado), part/stock inventory, and a
financeiro module that turns a finalized order into a receivable
automatically.

The biggest showcase repo of this portfolio pass -- the most modern stack
(React 19 / Vite 7 / TypeScript strict on the frontend, Express / TypeScript
strict / mysql2 on the backend) and the deepest backend refactor (real
multi-table transactions around stock and financials).

## Stack

**Backend** (`backend/`)
- Node.js + **Express 4** + **TypeScript** (`strict: true`)
- **MySQL** via the raw **mysql2** driver, no ORM
- **JWT** auth (access + refresh tokens), `bcryptjs`, `express-validator`,
  `helmet`, `express-rate-limit`
- **Vitest** + **Supertest** -- tests
- **ESLint** (`typescript-eslint` recommended) + **Prettier** +
  **Husky**/**lint-staged**/**commitlint**

**Frontend** (`frontend/`)
- **React 19** + **Vite 7** + **TypeScript** (`strict: true`, plus
  `noUnusedLocals`/`noUnusedParameters`/`noFallthroughCasesInSwitch`)
- **Zustand** -- state management (no data-fetching library; a small `fetch`
  wrapper in `src/lib/api.ts`)
- **Tailwind CSS v4**, hand-rolled UI primitives (no component library),
  `@dnd-kit` (kanban drag-and-drop), `recharts` (financeiro/relatórios charts)
- **Vitest** + **React Testing Library** -- tests
- **ESLint** (flat config, `typescript-eslint` + `eslint-plugin-react-hooks`)
  + **Prettier**

## Architecture

```
repo root/
  package.json         <- tooling only (husky/lint-staged/commitlint), not a workspace
  backend/              own package.json + package-lock.json
    src/
      routes/     ->  controllers/  ->  services/  ->  repositories/  ->  mysql2 pool
                                              |
                                        middleware/ (auth, error handling, validation)
  frontend/             own package.json + package-lock.json
    src/
      pages/  ->  components/  ->  stores/ (Zustand)  ->  lib/api.ts  ->  backend
```

`backend/` and `frontend/` are two fully independent npm projects (their own
`package.json` and lockfile each) inside one repo, not an npm/pnpm workspace
-- they share no code, dependencies, or build step, so a workspace would add
indirection without benefit. The root `package.json` exists purely to host
Husky/lint-staged/commitlint, so a single git hook can cover commits to
either side; that's also why there's a third `package-lock.json` at the
repo root, not a mistake.

Only `clientes` and `ordens` (the entities with the most business-rule
complexity -- stock deduction, receivable generation, multi-table
transactions) go through a `repositories/` + `services/` split on the
backend; the other 10 controllers still query the database directly. This
was a deliberate scope decision, not an oversight -- see
[Known limitations](#known-limitations--roadmap).

## Technical Decisions

- **mysql2 raw driver, no ORM.** A deliberate pre-existing choice, kept as
  is -- not revisited in this pass.
- **`services/`+`repositories/` for clientes/ordens only.** These two
  controllers had ~32 raw SQL queries and 4 hand-written multi-table
  transactions between them (finalize an order → create a receivable;
  add/edit/remove an item → adjust part stock). The other 10 controllers are
  simpler CRUD with no comparable transaction risk -- extracting layers
  there wouldn't demonstrate anything the first two don't already show, so
  it's explicitly out of scope rather than half-done everywhere.
- **Transactions always open in the service, never the repository.** A
  repository represents one table; deciding that finalizing an order and
  creating a receivable must be atomic is a business-rule decision, not a
  storage detail. Repository methods that only make sense inside a
  transaction take `conn: PoolConnection` without a `?`, so the compiler
  refuses a call outside one.
- **Row types generated against `schema.sql`, not guessed.** `DECIMAL`
  columns are typed `string` and `TINYINT(1)` columns `number`, matching
  what mysql2 actually returns (no `decimalNumbers: true` on the pool) --
  typed as what the driver hands back, not what the column conceptually is.
- **Vitest over Jest on the backend**, despite it being `"type": "commonjs"`.
  Vitest needs zero transform configuration for TypeScript, and it's the
  same runner the frontend uses -- one less tool to know to evaluate the
  whole repo.
- **`tsconfig.build.json`, separate from `tsconfig.json`, on the backend.**
  `tsc`'s default `include` picks up `*.test.ts` files; without a
  build-specific config excluding them, `npm run build` would emit test code
  into `dist/`. The base config still includes them for IDE/type-checking.
- **`react-scripts`-era CRA patterns avoided on purpose**: this frontend
  wasn't migrated from anything, it started on Vite -- no legacy tooling
  decisions to document here, unlike the other frontend repos in this
  portfolio.

## Setup

Requires Node 20+ and a MySQL 8 instance.

```bash
# MySQL (one-liner, no compose file in this repo)
docker run -d --name oficina-mysql -e MYSQL_ROOT_PASSWORD=root \
  -e MYSQL_DATABASE=oficina -p 3306:3306 mysql:8

# Backend
cd backend
npm ci
cp .env.example .env   # fill in DB_*/JWT_* at minimum
npm run db:migrate
npm run db:seed        # admin@oficina.com / admin123
npm run dev             # http://localhost:3001

# Frontend (separate terminal)
cd frontend
npm ci
cp .env.example .env   # VITE_API_URL, only needed if the backend isn't on :3001
npm run dev             # http://localhost:5173
```

## Testing

```bash
cd backend && npm test    # Vitest: unit (mocked pool) + integration (real MySQL)
cd frontend && npm test   # Vitest + React Testing Library
```

Backend integration tests run against a real MySQL database (the same one
from Setup works, or a disposable one) -- they `TRUNCATE` the tables they
touch before each test, so don't point `DB_NAME` at a database with data you
care about. CI spins up its own MySQL service container.

## Known limitations / Roadmap

- The `services`/`repositories` layer covers only `clientes` and `ordens`;
  the other 10 backend controllers (`anexos`, `auth`, `configuracoes`,
  `estoque`, `financeiro`, `notificacoes`, `recorrentes`, `relatorios`,
  `usuarios`, `veiculos`) still query the database directly. Deliberate
  scope decision (see [Architecture](#architecture)), candidates for the
  same treatment if extended later.
- `listar` on `ordens` does one query for the page of orders, then one
  additional round-trip per order to fetch its items/checklist (N+1) --
  inherited from the original implementation, not introduced or fixed in
  this pass.
- Test coverage is representative, not exhaustive: backend covers the two
  refactored entities' repositories and routes; frontend covers the highest
  real-bug-risk pure functions (`calculators.ts`) plus one store and one
  component as a reference pattern, not all 8 stores or 32 components.
- `editarItem`'s stock read happens before its transaction opens (a small,
  pre-existing, unguarded race window) -- preserved as-is rather than
  silently changed during the refactor; documented in the
  `refactor/backend-services-repositories` PR.

## License

[MIT](./LICENSE)
