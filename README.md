# Todo List API

A RESTful To-Do List API built with **Node.js**, **Express**, **Sequelize**, and **MySQL**.

## 🚀 Live Demo

**API Service**: [Deployed on Render](https://dashboard.render.com)  
**Health Check**: `GET /health`  
**Database**: [Aiven MySQL](https://console.aiven.io) (managed cloud database)

## 📋 Features

- ✅ **User Authentication** (JWT-based)
- ✅ **Todo CRUD Operations** 
- ✅ **Automatic Database Migrations** (production)
- ✅ **SSL/TLS Security** (Aiven MySQL)
- ✅ **Rate Limiting** (auth endpoints)
- ✅ **Input Validation** (express-validator)
- ✅ **Comprehensive Testing** (100% coverage)
- ✅ **CI/CD Ready** (GitHub Actions)
- ✅ **Production Deployment** (Render Blueprint)

---

## 📁 Folder Structure

```
todo-api/
├── src/
│   ├── config/
│   │   ├── database.js          # Sequelize instance & connection pool
│   │   ├── migrations.js        # Migration runner for production startup
│   │   └── sequelize-config.js  # Sequelize CLI config (migrations)
│   ├── constants/
│   │   └── messages.js          # HTTP status codes (HTTP) and message strings (MSG)
│   ├── migrations/
│   │   ├── 20260502000001-create-users.js
│   │   └── 20260502000002-create-todos.js
│   ├── seeders/                 # (empty — add seeds here)
│   ├── models/
│   │   ├── index.js             # Model registry & associations
│   │   ├── User.js
│   │   └── Todo.js
│   ├── controllers/
│   │   ├── authController.js    # register / login logic
│   │   ├── setupController.js   # Migration setup endpoint (free tier)
│   │   └── todoController.js    # CRUD for todos
│   ├── middlewares/
│   │   ├── authMiddleware.js    # JWT verification
│   │   └── validationMiddleware.js  # express-validator rule sets
│   └── routes/
│       ├── authRoutes.js
│       ├── setupRoutes.js       # Setup endpoints (migrations)
│       └── todoRoutes.js
├── tests/
│   ├── app.test.js              # Health check, 404, global error handler
│   ├── authController.test.js   # register / login logic
│   ├── authMiddleware.test.js   # JWT verification middleware
│   ├── todoController.test.js   # CRUD controller logic
│   └── validationMiddleware.test.js  # All validation rule sets
├── app.js                       # Express app factory
├── server.js                    # HTTP entry point & graceful shutdown
├── render.yaml                  # Render deployment blueprint
├── .sequelizerc                 # Sequelize CLI path configuration
├── .env.example
├── .gitignore
├── package.json
└── README.md
```

---

## Prerequisites

| Tool | Version |
|------|---------|
| Node.js | ≥ 18 |
| npm | ≥ 9 |
| MySQL | ≥ 8 |

---

## Setup

### 1. Clone & install dependencies

```bash
git clone <repo-url> todo-api
cd todo-api
npm install
```

### 2. Configure environment variables

```bash
cp .env.example .env
```

Open `.env` and fill in your MySQL credentials and a strong `JWT_SECRET`.

Generate a secure `JWT_SECRET` with:

```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

### 3. Create the MySQL database

```sql
CREATE DATABASE todo_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### 4. Database Setup

**Development**: Database schema is synced automatically using Sequelize's `sync()` method.

**Production**: Migrations run **automatically** on server startup using `sequelize-cli`. No manual intervention needed!

```bash
# Development: sync schema (auto-creates tables)
npm run dev

# Production: migrations run automatically on startup
npm start
```

> **Note**: The server checks for pending migrations on startup and applies them safely. Tables are created automatically.

### 5. Start the server

```bash
# Development (auto-restart on file changes)
npm run dev

# Production
npm start
```

### 6. Run tests

```bash
# Run tests
npm test

# Run tests with coverage report
npm test -- --coverage
```

Coverage is enforced at **100%** for statements, branches, functions, and lines across all controllers, middlewares, and `app.js`. The build will fail if coverage drops below this threshold.

---

## Test Suite Overview

| File | What it tests |
|------|---------------|
| `tests/authMiddleware.test.js` | Missing/malformed header, invalid signature, expired token, valid token, claim isolation |
| `tests/authController.test.js` | Register success/duplicate/error, login success/default-expiry/wrong-password/user-not-found/error |
| `tests/todoController.test.js` | `getAll`, `getOne`, `create`, `update`, `remove` — success, not-found, and error paths; all ternary branches in `update` |
| `tests/validationMiddleware.test.js` | All four rule sets (`registerRules`, `loginRules`, `createTodoRules`, `updateTodoRules`) — valid and each individual failure case |
| `tests/app.test.js` | Health check, 404 handler, global error handler |

---

## Database Migration Commands

| Script | Description |
|--------|-------------|
| `npm run db:migrate` | Apply all pending migrations |
| `npm run db:migrate:status` | Show which migrations are up/down |
| `npm run db:migrate:undo` | Roll back the last migration |
| `npm run db:migrate:undo:all` | Roll back all migrations |

To create a new migration:

```bash
npx sequelize-cli migration:generate --name <migration-name>
```

---

## API Endpoints

### Health

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/health` | Returns `{ "status": "ok" }` |

---

### Auth

| Method | Path | Auth required | Description |
|--------|------|:---:|-------------|
| `POST` | `/api/auth/register` | No | Create a new user account |
| `POST` | `/api/auth/login` | No | Authenticate and receive a JWT |

#### POST /api/auth/register — Request body

```json
{
  "email": "alice@example.com",
  "password": "Secret123",
  "displayName": "Alice"
}
```

Password rules: minimum 8 characters, at least one uppercase letter, at least one digit.

#### POST /api/auth/register — Response `201`

```json
{
  "message": "User registered successfully.",
  "user": { "id": 1, "email": "alice@example.com", "displayName": "Alice" }
}
```

> The `password` field is **never** returned in any response.

#### POST /api/auth/login — Request body

```json
{
  "email": "alice@example.com",
  "password": "Secret123"
}
```

#### POST /api/auth/login — Response `200`

```json
{
  "message": "Login successful.",
  "token": "<JWT>",
  "user": { "id": 1, "email": "alice@example.com", "displayName": "Alice" }
}
```

Pass the token in subsequent requests as:

```
Authorization: Bearer <token>
```

---

### Todos (all require `Authorization: Bearer <token>`)

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/api/todos` | List all todos for the authenticated user |
| `GET` | `/api/todos/:id` | Get a single todo |
| `POST` | `/api/todos` | Create a new todo |
| `PUT` | `/api/todos/:id` | Update a todo (all fields optional) |
| `DELETE` | `/api/todos/:id` | Delete a todo — returns `204 No Content` |

#### POST /api/todos — Request body

```json
{
  "title": "Buy groceries",
  "description": "Milk, eggs, bread"
}
```

Validation: `title` is required (max 255 chars); `description` is optional string.

#### PUT /api/todos/:id — Request body

```json
{
  "title": "Buy groceries",
  "description": "Milk, eggs, bread, butter",
  "completed": true
}
```

Validation: `title` optional but must be non-empty if provided; `completed` must be a boolean.

### Setup (Production Only)

| Method | Path | Auth required | Description |
|--------|------|:---:|-------------|
| `POST` | `/api/setup/migrate` | Bearer token | Manually run database migrations |

This endpoint is available for manual migration runs in production (requires `SETUP_TOKEN` header). Normally migrations run automatically on startup.

```bash
curl -X POST https://your-app.onrender.com/api/setup/migrate \
  -H "Authorization: Bearer <SETUP_TOKEN>"
```

---

## Constants Reference

All HTTP status codes and response messages are centralised in `src/constants/messages.js`.

### `HTTP` — status codes

| Key | Value |
|-----|-------|
| `HTTP.OK` | `200` |
| `HTTP.CREATED` | `201` |
| `HTTP.NO_CONTENT` | `204` |
| `HTTP.UNAUTHORIZED` | `401` |
| `HTTP.NOT_FOUND` | `404` |
| `HTTP.CONFLICT` | `409` |
| `HTTP.UNPROCESSABLE` | `422` |
| `HTTP.INTERNAL_ERROR` | `500` |

### `MSG` — message strings

| Key | Message |
|-----|---------|
| `MSG.AUTH_HEADER_MISSING` | `Authorization header missing or malformed.` |
| `MSG.AUTH_TOKEN_EXPIRED` | `Token has expired.` |
| `MSG.AUTH_TOKEN_INVALID` | `Invalid token.` |
| `MSG.AUTH_INVALID_CREDENTIALS` | `Invalid email or password.` |
| `MSG.AUTH_EMAIL_TAKEN` | `Email is already registered.` |
| `MSG.AUTH_REGISTER_SUCCESS` | `User registered successfully.` |
| `MSG.AUTH_LOGIN_SUCCESS` | `Login successful.` |
| `MSG.TODO_NOT_FOUND` | `Todo not found.` |
| `MSG.INTERNAL_ERROR` | `Internal server error.` |
| `MSG.ROUTE_NOT_FOUND` | `Route not found.` |

---

## Error Responses

| Status | Meaning |
|--------|---------|
| `401` | Missing, malformed, expired, or invalid JWT |
| `404` | Resource not found |
| `409` | Conflict (e.g. duplicate email on register) |
| `422` | Validation failed — body includes an `errors` array |
| `500` | Internal server error |

---

## Security Notes

- **Authentication**: JWT-based with bcrypt password hashing (12 rounds)
- **SSL/TLS**: Full certificate validation for production databases (Aiven)
- **Rate Limiting**: 20 requests per 15 minutes on auth endpoints
- **Input Validation**: All inputs validated with express-validator
- **CORS**: Configurable origin restrictions
- **Database**: Migrations run automatically in production (no manual schema changes)
- **Environment**: Secrets never committed, auto-generated tokens where possible

---

## Environment Variables Reference

| Variable | Default | Description |
|----------|---------|-------------|
| `NODE_ENV` | `development` | `development` enables query logging and `alter` sync |
| `PORT` | `3000` | HTTP port (set automatically by Render) |
| `DB_HOST` | `127.0.0.1` | MySQL host |
| `DB_PORT` | `3306` | MySQL port |
| `DB_NAME` | — | **Required.** Database name |
| `DB_USER` | — | **Required.** MySQL user |
| `DB_PASSWORD` | — | **Required.** MySQL password |
| `DB_SSL` | `false` | Set to `true` for managed cloud databases |
| `DB_CA_CERT` | — | CA certificate for SSL connections (Aiven/managed DBs) |
| `DB_CA_CERT` | — | CA certificate for SSL connections (Aiven/managed DBs) |
| `JWT_SECRET` | — | **Required.** Long, random secret for signing JWTs |
| `JWT_EXPIRES_IN` | `1h` | JWT lifetime (e.g. `1h`, `7d`) |
| `CORS_ORIGIN` | `*` | Allowed origin(s) for CORS (e.g. `https://app.example.com`) |
| `RATE_LIMIT_WINDOW_MS` | `900000` | Rate-limit sliding window in ms (default 15 min) |
| `RATE_LIMIT_MAX` | `20` | Max auth requests per window per IP |
| `SETUP_TOKEN` | — | Token for manual migration setup (auto-generated in production) |

---

## Deploy to Render

This app includes a **Render Blueprint** (`render.yaml`) for one-click deployment with Aiven MySQL.

### Quick Deploy

1. **Push to GitHub** with `render.yaml` committed
2. **Create Render Blueprint** → Select your repo → Deploy
3. **Configure environment variables** in Render dashboard
4. **Done!** Migrations run automatically, SSL works out-of-the-box

### Environment Variables Required

| Variable | Description | Source |
|----------|-------------|--------|
| `DB_HOST` | Aiven MySQL host | MySQL.md |
| `DB_PORT` | Aiven MySQL port (15950) | MySQL.md |
| `DB_NAME` | Database name | MySQL.md |
| `DB_USER` | Database user | MySQL.md |
| `DB_PASSWORD` | Database password | MySQL.md |
| `DB_CA_CERT` | Full CA certificate | MySQL.md |
| `CORS_ORIGIN` | Frontend domain | Your app |

### Features

- ✅ **Zero-touch deployment** (migrations auto-run)
- ✅ **SSL certificate validation** (Aiven compatible)
- ✅ **Health checks** configured
- ✅ **Free tier optimized**

See [DEPLOY.md](./DEPLOY.md) for detailed deployment instructions and troubleshooting.

### 1. Set up an external MySQL database

1. Sign up at [Aiven](https://console.aiven.io) (or TiDB Cloud).
2. Create a **MySQL** service (free plan).
3. Copy the connection details: host, port, database name, user, password.
   Aiven also shows a **CA certificate** — download it if you need certificate pinning.

### 2. Connect your repo to Render

1. Push your code to GitHub or GitLab (ensure `.env` is in `.gitignore` — it is).
2. Go to [Render Dashboard](https://dashboard.render.com) → **New → Blueprint**.
3. Connect your repository — Render detects `render.yaml` automatically.
4. Click **Apply**. Render creates the Web Service.

### 3. Set secret environment variables

In the Render dashboard → your service → **Environment**, add the variables marked `sync: false` in `render.yaml`:

| Variable | Value |
|----------|-------|
| `DB_HOST` | Host from your Aiven / TiDB dashboard |
| `DB_NAME` | Database name |
| `DB_USER` | Database user |
| `DB_PASSWORD` | Database password |
| `CORS_ORIGIN` | Your frontend URL (e.g. `https://app.example.com`) |

`JWT_SECRET` is generated automatically by Render (`generateValue: true` in `render.yaml`).

### 4. First deploy

Every deploy runs `npm run db:migrate` (`preDeployCommand` in `render.yaml`) **before** starting the server. On first deploy this creates the `users` and `todos` tables.

### 5. Subsequent deploys

Push to your main branch → Render detects the change → builds, runs migrations, and hot-swaps to the new version with zero downtime.

### Health check

Render pings `GET /health` every 30 seconds. If it returns non-200 the deploy is rolled back.

```
GET https://your-service.onrender.com/health
→ 200 { "status": "ok" }
```

---

## Postman Collection

Import `todo-api.postman_collection.json` into Postman to get a ready-made collection covering all endpoints including validation and error cases.

**Recommended run order:**
1. `Register`
2. `Login` — auto-saves `{{token}}`
3. `Create Todo` — auto-saves `{{todoId}}`
4. Remaining happy-path requests
5. Edge-case requests (validation errors, 401, 404)

