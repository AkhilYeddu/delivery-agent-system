# Delivery Agent Management System (SwiftDispatch)

An enterprise-grade full-stack web application for dispatchers and fleet managers to manage delivery agent records, powered by a **Node.js** backend, **PostgreSQL** persistent storage, **Redis** intelligent cache-aside caching, and a **smooth and creamy** interactive frontend.

---

## 🌟 Highlights & Architecture

- **Backend**: Node.js & Express in modern JavaScript, structured into clean Service-Controller-Model functional modules with strict request validation using `validator`.
- **Database**: PostgreSQL with transactional DDL schema (`schema.sql`), foreign key constraints, check constraints, and performance indexes.
- **Caching Layer**: Redis Cache-Aside pattern with deterministic key namespacing, explicit invalidation on mutations (create/update/delete), TTL management, and `X-Cache: HIT / MISS` response headers. Supports live Redis servers (Docker, Upstash, Render) with a built-in resilient standby cache.
- **Frontend**: Smooth and creamy UI built with React 18, Vite, and custom warm cream/caramel Tailwind styling, featuring live Redis telemetry, fleet statistics cards, table/grid views, debounced search, status filters, and instant action modals.
- **Automated Tests**: Comprehensive Jest & Supertest integration suite verifying all CRUD operations, input validations, conflict handling, and Redis cache invalidation behaviors directly against PostgreSQL.

---

## 🛠️ Technology Stack

| Component | Technology | Rationale |
| :--- | :--- | :--- |
| **Backend Runtime** | Node.js (v20+) | High-throughput asynchronous I/O and fast execution. |
| **HTTP Framework** | Express 4.x with Morgan & CORS | Lightweight, unopinionated, enterprise REST API standard. |
| **Database** | PostgreSQL 16 | ACID-compliant relational storage, strict constraints, robust indexing, and schema migrations. |
| **Database Client** | `pg` (`pg.Pool`) | Native connection pooling with SSL support for cloud databases. |
| **Cache Client** | Redis 7 (`ioredis`) | Microsecond-latency key-value storage for read-heavy fleet queries, reduces DB load by >90%. |
| **Validation** | `validator` | String sanitization and schema validation for query parameters and JSON payloads. |
| **Frontend** | React 18, Vite, Tailwind CSS | Instant HMR, buttery smooth velvety transitions, and creamy palette typography. |
| **Testing** | Jest & Supertest | Automated integration testing for HTTP APIs, error edge cases, and cache consistency. |

---

## 📁 Project Structure

```text
delivery-agent-system/
├── docker-compose.yml              # Local PostgreSQL 16 & Redis 7 containers
├── package.json                    # Root script orchestrator (concurrent dev, test, build)
├── .env.example                    # Documented environment configuration template
├── README.md                       # Comprehensive documentation & evaluation guide
├── DEPLOYMENT.md                   # Production deployment guide (Vercel + Render)
├── render.yaml                     # Render infrastructure blueprint specification
├── vercel.json                     # Vercel deployment configuration
│
├── backend/                        # Node.js REST API
│   ├── src/
│   │   ├── config/
│   │   │   ├── env.js              # Centralized environment configuration
│   │   │   ├── db.js               # PostgreSQL connection pool (pg.Pool)
│   │   │   └── redis.js            # Redis client & telemetry (ioredis)
│   │   ├── controllers/
│   │   │   └── agent.controller.js # Request handlers & header setting
│   │   ├── services/
│   │   │   └── agent.service.js    # Core CRUD logic & Cache Invalidation algorithms
│   │   ├── models/
│   │   │   └── agent.model.js      # Request validation schemas (validator)
│   │   ├── routes/
│   │   │   ├── agent.routes.js     # CRUD endpoints
│   │   │   └── telemetry.routes.js # Health & cache telemetry endpoints
│   │   ├── db/
│   │   │   ├── schema.sql          # PostgreSQL DDL schema & indexes
│   │   │   └── seed.js             # 10 realistic delivery agents seed data
│   │   ├── middlewares/
│   │   │   ├── error.middleware.js  # Standardized error formatting
│   │   │   └── validate.middleware.js # Request validation middleware
│   │   └── tests/
│   │       ├── agent.test.js       # 8 CRUD integration tests
│   │       └── cache.test.js       # 4 Redis Cache-Aside & Invalidation tests
│   └── package.json
│
└── frontend/                       # Smooth & Creamy React UI
    ├── src/
    │   ├── components/
    │   │   ├── Navbar.jsx          # Creamy header with actions
    │   │   ├── CacheTelemetryBadge.jsx # Real-time Redis cache hit/miss monitor & flush tool
    │   │   ├── StatsOverview.jsx   # Fleet KPI cards (total, active, on delivery, rating)
    │   │   ├── FilterBar.jsx       # Search, status pills, area filter, sort & view toggle
    │   │   ├── AgentTable.jsx      # Smooth data table with pagination & quick actions
    │   │   ├── AgentCard.jsx       # Grid view card presentation
    │   │   ├── AgentFormModal.jsx  # Create & Edit agent modal with client validation
    │   │   ├── AgentDetailModal.jsx# Comprehensive agent profile drawer with cache status
    │   │   ├── DeleteConfirmModal.jsx # Safe deletion prompt
    │   │   └── Toast.jsx           # Velvety feedback toasts
    │   ├── services/api.js         # Axios client with cache header interception
    │   └── index.css               # Creamy custom colors & styling
    ├── tailwind.config.js
    ├── vite.config.js
    └── package.json
```

---

## ⚡ Quick Start Guide

### Prerequisites
- **Node.js**: v18.0.0 or higher
- **npm**: v9.0.0 or higher
- **PostgreSQL**: Local installation, Docker container, or managed cloud instance (e.g. Render, Supabase).
- *(Optional)* **Redis**: Local installation, Docker container, or cloud instance (Upstash).

---

### Step 1: Install Dependencies

From the project root:
```bash
npm run install:all
```
*(Or navigate into `backend` and `frontend` folders and run `npm install` in each).*

---

### Step 2: Configure Environment Variables

Create a `.env` file in the project root (or inside `backend/.env`):

```bash
PORT=5000
NODE_ENV=development
CORS_ORIGIN=http://localhost:3000

# PostgreSQL Connection String
DATABASE_URL=postgresql://postgres:password@localhost:5432/delivery_db

# Redis Connection String
REDIS_URL=redis://localhost:6379
```

> **Tip for Passwords with Special Characters**:  
> If your database password contains characters like `@`, `#`, or `/`, URL-encode them (e.g. `@` becomes `%40`). Example:
> `postgresql://postgres:MyPass%4005@localhost:5432/delivery_db`

---

### Step 3: Create Database Tables

Ensure your database (e.g. `delivery_db`) exists, then execute the schema script:

```bash
psql <YOUR_DATABASE_URL> -f backend/src/db/schema.sql
```

*(Alternatively, open [`backend/src/db/schema.sql`](backend/src/db/schema.sql) in pgAdmin, DBeaver, or psql and run the SQL statements directly).*

---

### Step 4: (Optional) Seed Demo Data

Load 10 realistic delivery agents with diverse statuses, ratings, and vehicle types:

```bash
npm run db:seed
```

---

### Step 5: Start the Application

Launch both the backend API and frontend concurrently:
```bash
npm run dev
```

- **Frontend Application**: [http://localhost:3000](http://localhost:3000)
- **Backend API Server**: [http://localhost:5000](http://localhost:5000)
- **API Health Check**: [http://localhost:5000/api/health](http://localhost:5000/api/health)
- **Cache Telemetry**: [http://localhost:5000/api/cache/stats](http://localhost:5000/api/cache/stats)

---

## 🧪 Running Automated Tests

Run the complete integration test suite verifying CRUD operations, status code handling, validation rules, and Redis cache invalidation against your PostgreSQL database:

```bash
npm test
```

To run with coverage metrics:
```bash
npm run test:coverage
```

### Verified Test Cases:
1. `POST /api/agents` - Creates delivery agent with formatted ID and timestamps (201).
2. `POST /api/agents` - Rejects duplicate email address with 409 Conflict.
3. `POST /api/agents` - Rejects invalid or missing fields with 400 Bad Request.
4. `GET /api/agents` - Retrieves paginated agent records (200).
5. `GET /api/agents/:id` - Retrieves individual agent details (200).
6. `GET /api/agents/:id` - Returns 404 for nonexistent agent ID.
7. `PUT /api/agents/:id` - Updates agent information and refreshes updated_at timestamp (200).
8. `DELETE /api/agents/:id` - Removes agent and validates subsequent queries return 404.
9. **Cache-Aside Read**: Initial request returns `X-Cache: MISS`; immediate second request returns `X-Cache: HIT`.
10. **Cache Invalidation (Create)**: Creating an agent automatically purges list cache keys.
11. **Cache Invalidation (Update)**: Updating an agent purges both list caches and single-agent detail cache.
12. **Cache Invalidation (Delete)**: Deleting an agent evicts the item from Redis and purges list caches.

---

## ⚡ Redis Caching Strategy & Consistency

### 1. What is Cached?
- **Paginated Agent Lists**: Deterministic keys containing all filter, search, and pagination parameters:
  ```text
  agents:list:p={page}:l={limit}:st={status}:area={service_area}:q={search}:sb={sortBy}:so={sortOrder}
  TTL: 300 seconds (5 minutes)
  ```
- **Individual Agent Details**:
  ```text
  agents:detail:{agent_id}
  TTL: 600 seconds (10 minutes)
  ```
- **Fleet Dashboard Statistics**:
  ```text
  agents:stats
  TTL: 180 seconds (3 minutes)
  ```

### 2. Cache-Aside (Lazy Loading) Read Flow
```text
Client GET Request
       │
       ▼
Check Redis Cache
       ├─ HIT ──> Return cached JSON immediately (Header: X-Cache: HIT)
       └─ MISS ─> Query PostgreSQL 
                    │
                    ├─ Store in Redis with TTL
                    └─ Return data to Client (Header: X-Cache: MISS)
```

### 3. Cache Invalidation & Consistency on Mutations
To prevent stale reads, any write mutation executes atomic cache eviction:
- **`POST /api/agents` (Create)**:
  1. Inserts record into PostgreSQL.
  2. Evicts all list queries matching `agents:list:*`.
  3. Evicts aggregated stats cache `agents:stats`.
  4. Pre-warms the newly created agent detail cache `agents:detail:{id}`.
- **`PUT/PATCH /api/agents/:id` (Update)**:
  1. Updates record in PostgreSQL.
  2. Updates/evicts `agents:detail:{id}`.
  3. Evicts all list queries matching `agents:list:*`.
  4. Evicts `agents:stats`.
- **`DELETE /api/agents/:id` (Delete)**:
  1. Deletes record from PostgreSQL.
  2. Evicts `agents:detail:{id}`.
  3. Evicts all list queries matching `agents:list:*`.
  4. Evicts `agents:stats`.

### 4. Live Telemetry & Testing in the UI
The frontend includes a **Redis Caching Layer Monitor** that displays:
- Real-time Redis connection state.
- Cumulative Hit Rate %, Hits count, and Misses count.
- The cache result of the most recent query (`Redis HIT` vs `PostgreSQL MISS`) and latency in milliseconds.
- A **"Flush Cache"** button allowing evaluators to manually invalidate the cache and observe instant cold-cache vs warm-cache response times!

---

## 📡 REST API Reference

### Base URL: `http://localhost:5000/api`

| Method | Endpoint | Description | Response Codes |
| :--- | :--- | :--- | :--- |
| `GET` | `/agents` | List agents (supports `page`, `limit`, `status`, `service_area`, `search`, `sortBy`, `sortOrder`) | `200` |
| `GET` | `/agents/:id` | Get individual agent details | `200`, `404` |
| `POST` | `/agents` | Create a new delivery agent | `201`, `400`, `409` |
| `PUT` | `/agents/:id` | Update delivery agent information | `200`, `400`, `404`, `409` |
| `PATCH`| `/agents/:id` | Partially update delivery agent | `200`, `400`, `404`, `409` |
| `DELETE`| `/agents/:id`| Remove delivery agent | `200`, `404` |
| `GET` | `/agents/stats`| Fleet metrics (counts by status, vehicle, area, rating) | `200` |
| `GET` | `/health` | Server, PostgreSQL, and Redis health status | `200` |
| `GET` | `/cache/stats` | Redis hit/miss counters and latency metrics | `200` |
| `POST`| `/cache/flush` | Evict all cached keys | `200` |

### Sample Agent Payload
```json
{
  "full_name": "Elena Rostova",
  "phone": "+1-555-0143",
  "email": "elena.rostova@swiftcargo.io",
  "service_area": "Downtown Core",
  "status": "active",
  "vehicle_type": "electric_bike",
  "rating": 4.9,
  "completed_deliveries": 342
}
```

---

## 🎨 UI & Aesthetic Design ("Smooth and Creamy")

The application features a **smooth and creamy** design language:
- **Color Palette**:
  - Background: Luxe warm milk cream (`#FAF8F5`)
  - Surfaces & Cards: Soft ivory with velvety borders (`#EDE4D8` / `#E1D3C1`)
  - Accent Tones: Warm caramel (`#C7621B` / `#E07A2B`), rich espresso text (`#261B12`), soft matcha for active status (`#4E7D58`), and honey amber for en-route deliveries (`#D97706`).
- **Typography**: Clean hierarchy with `Plus Jakarta Sans` for clarity and `Outfit` for display headings.
- **Interactions**:
  - Silky pill buttons with subtle elevation and micro-transitions.
  - Switchable **Table View** and **Grid View**.
  - Interactive profile drawer showing agent metrics and whether the record was served from Redis cache.
  - Creamy toast notifications confirming every mutation and cache eviction.

---

## 🔐 Environment Variables

Reference template available in `.env.example`:

```bash
PORT=5000
NODE_ENV=development
CORS_ORIGIN=http://localhost:3000

# PostgreSQL Configuration
DATABASE_URL=postgresql://postgres:password@localhost:5432/delivery_db

# Redis Configuration
REDIS_URL=redis://localhost:6379

# Redis Cache TTL (in seconds)
REDIS_CACHE_TTL_LIST=300
REDIS_CACHE_TTL_DETAIL=600
REDIS_CACHE_TTL_STATS=180
```

---

## 📝 Submission Checklist

- [x] Initialized Git repository on Desktop at `delivery-agent-system`.
- [x] Pure JavaScript codebase (Node.js Express + React 18 Vite).
- [x] PostgreSQL database schema (`backend/src/db/schema.sql`) with performance indexes.
- [x] Redis caching with Cache-Aside strategy and explicit cache invalidation.
- [x] Smooth and creamy frontend UI with React, Vite, and Tailwind CSS.
- [x] Automated test suite passing 100% of tests against PostgreSQL.
- [x] Complete deployment guide for Vercel + Render in `DEPLOYMENT.md`.
- [x] Comprehensive README with setup, run, and evaluation instructions.
