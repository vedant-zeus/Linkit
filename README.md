# Linkit

Inventra is a full-stack inventory and pricing dashboard built for retail-style product operations. It combines a React frontend with an Express + MySQL backend to manage products, monitor analytics, track transactions, and generate dynamic pricing recommendations.

## What It Does

- Browse and search products across categories
- Authenticate users with role-based access
- Track product views and transactions
- Visualize sales and revenue analytics
- Run a pricing engine to generate product-level recommendations
- Apply recommended prices and store pricing history

## Project Structure

```text
Inventra/
|- inventory-dashboard/   # React + Vite frontend
|- server/                # Express API + pricing engine + MySQL scripts
|- package.json           # root dependency placeholder
```

## Tech Stack

- Frontend: React 19, Vite, React Router, Axios, Recharts, Framer Motion
- Backend: Node.js, Express, MySQL, JWT, bcrypt
- Database: MySQL with seed data for users, products, transactions, and market data

## App Areas

### Frontend

The frontend lives in `inventory-dashboard/` and includes:

- `Dashboard` for KPI and overview views
- `Products` for catalog browsing and filtering
- `PricingEngine` for admin-only recommendation workflows
- `Analytics` for charts and revenue insights
- `Transactions` for order history views
- `Login` for authentication

### Backend

The backend lives in `server/` and exposes routes under `/api`:

- `/api/auth`
- `/api/products`
- `/api/analytics`
- `/api/transactions`
- `/api/pricing`

It also includes:

- `server/engine/pricingEngine.js` for pricing logic
- `server/db/schema.sql` for schema creation
- `server/db/seed.sql` for demo data
- `server/db/setup.js` for database setup support

## Prerequisites

Make sure you have these installed:

- Node.js 18+
- npm
- MySQL 8+ or a compatible MySQL server

## Getting Started

### 1. Install dependencies

Install the frontend dependencies:

```bash
cd inventory-dashboard
npm install
```

Install the backend dependencies:

```bash
cd server
npm install
```

### 2. Configure environment variables

Create or update `server/.env` with values like these:

```env
PORT=3001
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=root
DB_NAME=linkit_db
JWT_SECRET=linkit_secret
```

Create `inventory-dashboard/.env` for local frontend development:

```env
VITE_API_BASE_URL=http://localhost:3001/api
```

For production frontend deployments such as Vercel, set:

```env
VITE_API_BASE_URL=https://linkit-backend-tw3l.onrender.com/api
```

### 3. Create and seed the database

From your MySQL shell or command line, run:

```bash
mysql -u root -p < server/db/schema.sql
mysql -u root -p < server/db/seed.sql
```

This creates:

- users
- products
- transactions
- product views
- price history
- market data
- pricing recommendations

### 4. Start the backend

```bash
cd server
npm run dev
```

The API will start on `http://localhost:3001`.

Useful check:

```text
GET http://localhost:3001/api/health
```

### 5. Start the frontend

In a second terminal:

```bash
cd inventory-dashboard
npm run dev
```

Then open the Vite app in your browser, typically at `http://localhost:5173`.

## Demo Credentials

The seed data includes demo users:

- Admin: `admin` / `admin123`
- User: `user` / `user123`
- User: `priya` / `user123`
- User: `amit` / `user123`

Admin users can access pricing and analytics pages that are protected in the frontend.

## API Highlights

### Auth

- `POST /api/auth/login`
- `GET /api/auth/me`

### Products

- `GET /api/products`
- `GET /api/products/categories`
- `GET /api/products/:id`
- `GET /api/products/:id/price-history`
- `POST /api/products/:id/view`

### Analytics

- `GET /api/analytics/overview`
- `GET /api/analytics/sales?days=30`
- `GET /api/analytics/top-products`
- `GET /api/analytics/elasticity/:id`
- `GET /api/analytics/category-revenue`

### Pricing

- `GET /api/pricing/recommendation/:id`
- `GET /api/pricing/all-recommendations`
- `GET /api/pricing/history`
- `POST /api/pricing/apply/:id`

## Notes

- The frontend reads its API URL from `VITE_API_BASE_URL`.
- For local development, set `VITE_API_BASE_URL=http://localhost:3001/api`.
- For Vercel, set `VITE_API_BASE_URL=https://linkit-backend-tw3l.onrender.com/api`.
- JWT tokens are stored in `localStorage`.
- Seed data is designed for local demo and development use.
- The root `package.json` is not the main app entrypoint; most work happens inside `inventory-dashboard/` and `server/`.

## Development Workflow

Use two terminals during development:

```bash
# terminal 1
cd server
npm run dev
```

```bash
# terminal 2
cd inventory-dashboard
npm run dev
```

## Future Improvements

- Add a single root workspace script for starting both apps together
- Move frontend API base URL into environment configuration
- Add automated tests for pricing logic and API routes
- Add deployment instructions for production environments
