# Deployment Guide

## Render + Aiven MySQL

This app uses a Render Blueprint (`render.yaml`) that automatically deploys to Render. Follow these steps:

### 1. Deploy via Render Blueprint

1. Push your code to GitHub (ensure `render.yaml` is committed)
2. Go to https://dashboard.render.com → **New** → **Blueprint**
3. Select your GitHub repository
4. Render will automatically detect and import `render.yaml`
5. Name your service (e.g., `todo-api`) and click **Create Blueprint**

### 2. Configure Environment Variables in Render Dashboard

After the blueprint is created, go to your service's **Environment** tab and set these variables with values from [MySQL.md](./MySQL.md):

| Variable | Value from MySQL.md | Example |
|----------|---------------------|---------|
| `DB_HOST` | Host | `mysql-todo-list-db-phamthao080890-todo-database.l.aivencloud.com` |
| `DB_PORT` | Port | `15950` |
| `DB_NAME` | Database name | `defaultdb` |
| `DB_USER` | User | `avnadmin` |
| `DB_PASSWORD` | Password | `AVNS_7JaUHSDPoVxdzDm4elh` |
| `DB_CA_CERT` | CA Certificate (entire block) | `-----BEGIN CERTIFICATE-----...-----END CERTIFICATE-----` |
| `CORS_ORIGIN` | Your frontend domain | `https://app.example.com` or `*` for dev |

⚠️ **Important**: The `DB_CA_CERT` must include the full certificate including the `-----BEGIN CERTIFICATE-----` and `-----END CERTIFICATE-----` lines. Copy the entire block from MySQL.md.

### 3. Migrations Run Automatically ✓

Migrations run automatically when the server starts in production. No manual setup needed!

- Server connects to Aiven database ✓
- **Migrations run automatically** using `sequelize-cli` ✓
- Creates `users` and `todos` tables ✓
- Starts listening for requests ✓

### 4. Verify Deployment

- Check the **Logs** tab for deployment status
- You should see:
  ```
  Database connection established.
  [migrations] Running pending migrations...
  [migrations] Migrations completed successfully
  Server running on http://localhost:3000 [production]
  ```
- Visit `https://your-service-name.onrender.com/health`
- Should return `{ "status": "ok" }`

## How It Works

**Development** (`NODE_ENV=development`):
- Database schema is synced automatically using Sequelize's `sync()` method
- Good for rapid iteration and testing

**Production** (`NODE_ENV=production`):
- Migrations run automatically on server startup
- Each deployment checks for pending migrations and runs them
- Safe for production — migrations only run once (tracked in `sequelize_migrations` table)
- No manual intervention needed ✓

## Troubleshooting

**Connection timeout error (`ETIMEDOUT`)**:
- ✓ Check that all `DB_*` variables are set correctly in Render
- ✓ Ensure `DB_CA_CERT` includes the full certificate (BEGIN/END lines)
- ✓ Verify port is `15950` (not 3306) for Aiven
- ✓ Wait 1-2 minutes after updating env vars for changes to take effect
- ✓ Check Render **Logs** tab for detailed error messages

**SSL certificate error (`self-signed certificate in certificate chain`)**:
- ✓ Ensure `DB_CA_CERT` is set with the full Aiven CA certificate
- ✓ Verify `DB_SSL=true` is set
- ✓ Check that the certificate includes `-----BEGIN CERTIFICATE-----` and `-----END CERTIFICATE-----`

**Migrations didn't run automatically**:
- ✓ Check that `NODE_ENV=production` is set in Render
- ✓ Look for `[migrations]` in the logs to see migration output
- ✓ If migrations failed, check database logs in Aiven console
- ✓ **Backup option**: Use `/api/setup/migrate` endpoint (requires `SETUP_TOKEN` header)

**Column/table doesn't exist error**:
- ✓ Verify migrations ran — check logs for `[migrations] Executed N migration(s).`
- ✓ If not, trigger `/api/setup/migrate` manually with your `SETUP_TOKEN`

**CORS errors**:
- ✓ Set `CORS_ORIGIN` to your frontend domain (don't use `*` in production)
