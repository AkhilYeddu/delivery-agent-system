# Deployment Guide: Vercel (Frontend) + Render (Backend & PostgreSQL)

This guide walks you through deploying the **Delivery Agent Management System** in production using **Render** for the backend + database and **Vercel** for the frontend.

---

## 📋 Overview of the Deployed Architecture

```text
┌─────────────────────────────────┐
│     Vercel (Production CDN)     │
│   React / Vite / Tailwind UI    │
│  https://your-app.vercel.app    │
└────────────────┬────────────────┘
                 │
                 │ HTTPS API Calls (VITE_API_URL)
                 ▼
┌─────────────────────────────────┐
│     Render (Node.js Service)    │
│     Express REST API (Port 10k) │
│  https://your-api.onrender.com  │
└───────┬─────────────────┬───────┘
        │                 │
        ▼                 ▼
┌──────────────┐   ┌──────────────┐
│ Render PG DB │   │ Render/Upstash
│ PostgreSQL 16│   │ Redis Cache  │
└──────────────┘   └──────────────┘
```

---

## Step 1: Push Code to GitHub

1. Create a new repository on [GitHub](https://github.com/new) named `delivery-agent-system` (can be public or private).
2. Open your terminal in the project directory:
   ```bash
   cd C:\Users\akhil\Desktop\delivery-agent-system
   ```
3. Link and push your local commits to GitHub:
   ```bash
   git remote add origin https://github.com/<YOUR_GITHUB_USERNAME>/delivery-agent-system.git
   git branch -M main
   git push -u origin main
   ```

---

## Step 2: Deploy Backend & Database on Render

### Option A: Using the Automated Blueprint (`render.yaml`) — *Recommended*

1. Log in to [Render](https://dashboard.render.com/).
2. In the top-right corner, click **New +** and select **Blueprint**.
3. Connect your GitHub repository `delivery-agent-system`.
4. Render will read `render.yaml` and display the blueprint plan:
   - **`swiftdispatch-db`**: Free Managed PostgreSQL Database
   - **`swiftdispatch-api`**: Free Node.js Web Service
5. Click **Apply**.
6. Once the database is created, **run the SQL schema manually** (see [Step 2B below](#step-2b-create-the-database-tables)).
7. Once deployed, copy your API URL:
   `https://swiftdispatch-api-xxxx.onrender.com`

---

### Step 2B: Create the Database Tables

The app does **not** run migrations automatically. You must create the tables once using the provided SQL script.

1. In the Render dashboard, open your **`swiftdispatch-db`** PostgreSQL database.
2. Click the **Connect** button and copy the **PSQL Command** (it looks like `psql postgresql://...`).
3. Open your terminal and run that command to connect to the database.
4. Then paste and execute the following SQL:

```sql
-- Delivery Agent Management System — Database Schema

CREATE TABLE IF NOT EXISTS delivery_agents (
    id VARCHAR(64) PRIMARY KEY,
    full_name VARCHAR(120) NOT NULL,
    phone VARCHAR(30) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    service_area VARCHAR(100) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'on_delivery', 'suspended')),
    vehicle_type VARCHAR(30) NOT NULL DEFAULT 'bike' CHECK (vehicle_type IN ('bike', 'scooter', 'car', 'van', 'electric_bike', 'walker')),
    rating NUMERIC(2, 1) NOT NULL DEFAULT 5.0 CHECK (rating >= 1.0 AND rating <= 5.0),
    completed_deliveries INTEGER NOT NULL DEFAULT 0 CHECK (completed_deliveries >= 0),
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Performance Indexes
CREATE INDEX IF NOT EXISTS idx_delivery_agents_status ON delivery_agents(status);
CREATE INDEX IF NOT EXISTS idx_delivery_agents_service_area ON delivery_agents(service_area);
CREATE INDEX IF NOT EXISTS idx_delivery_agents_email ON delivery_agents(email);
CREATE INDEX IF NOT EXISTS idx_delivery_agents_created_at ON delivery_agents(created_at DESC);
```

> **Alternatively**, you can run the script from the project root:
> ```bash
> psql <YOUR_DATABASE_URL> -f backend/src/db/schema.sql
> ```

Once the tables exist, the API will connect and start immediately. You can optionally seed sample agents by running `npm run db:seed`.

---

### Option B: Manual Setup on Render Dashboard

If you prefer configuring via the Render UI:

#### 1. Create the PostgreSQL Database
1. Click **New +** > **PostgreSQL**.
2. Name: `swiftdispatch-db`.
3. Database: `delivery_db`.
4. User: `deliveryuser`.
5. Plan: **Free**.
6. Click **Create Database**.
7. Copy the **Internal Database URL** (e.g., `postgresql://postgres:password@dpg-...:5432/delivery_db`).
8. Connect to the database and run the SQL from [Step 2B](#step-2b-create-the-database-tables) above.

#### 2. Create the Web Service (Backend)
1. Click **New +** > **Web Service**.
2. Connect your GitHub repository.
3. Configure the service settings:
   - **Name**: `swiftdispatch-api`
   - **Region**: Same region as your database
   - **Branch**: `main`
   - **Root Directory**: `backend`
   - **Runtime**: `Node`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm run start`
   - **Plan**: `Free`
4. Expand **Environment Variables** and add:
   - `NODE_ENV` = `production`
   - `PORT` = `10000`
   - `CORS_ORIGIN` = `*`
   - `DATABASE_URL` = *(Paste your Internal Database URL from Step 1)*
   - `REDIS_URL` = *(Optional: Paste your Redis URL from Upstash or Render Redis)*
5. Click **Create Web Service**.
6. Once deployed, verify by opening: `https://<YOUR-RENDER-API-URL>/api/health`.

---

## Step 3: Deploy Frontend on Vercel

1. Log in to [Vercel](https://vercel.com/).
2. Click **Add New...** > **Project**.
3. Import your GitHub repository `delivery-agent-system`.
4. In the configuration screen:
   - **Framework Preset**: `Vite`
   - **Root Directory**: Click *Edit* and select **`frontend`**
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`
5. Expand the **Environment Variables** section and add:
   - **Key**: `VITE_API_URL`
   - **Value**: `https://<YOUR-RENDER-API-URL>` *(e.g., `https://swiftdispatch-api-xxxx.onrender.com`)*
6. Click **Deploy**.
7. In ~30 seconds, your site will be live at `https://<YOUR-PROJECT>.vercel.app`!

---

## Step 4: Verification & Live Testing

1. Open your live Vercel URL in your browser.
2. Check the **Redis Caching Layer** badge in the header:
   - First request shows: **`PostgreSQL MISS`**
   - Refreshing or filtering immediately shows: **`Redis HIT`**
3. Create a new delivery agent:
   - Confirm the success toast appears.
   - Verify that the new agent is persisted in PostgreSQL.
4. Test cache invalidation:
   - Click **Flush Cache** or update/delete an agent.
   - The cache automatically refreshes to guarantee read consistency!

---

## 🛠️ Summary of Environment Variables

### Render Backend
| Variable | Value / Purpose |
| :--- | :--- |
| `NODE_ENV` | `production` |
| `PORT` | `10000` |
| `CORS_ORIGIN` | `*` (or your Vercel URL e.g. `https://my-app.vercel.app`) |
| `DATABASE_URL` | PostgreSQL connection string from Render DB |
| `REDIS_URL` | *(Optional)* Redis connection string (Upstash or Render Redis) |

### Vercel Frontend
| Variable | Value / Purpose |
| :--- | :--- |
| `VITE_API_URL` | URL of your deployed Render backend (e.g. `https://swiftdispatch-api.onrender.com`) |
