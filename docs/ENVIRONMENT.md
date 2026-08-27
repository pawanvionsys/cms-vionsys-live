# Vionsys CMS: Environment Variables Configuration

This file outlines the configuration variables needed in a local `.env` file to run the CMS.

Create a `.env` file at the root of the `cms` folder:

```bash
# Database connections URL (MongoDB — must match prisma/schema.prisma)
DATABASE_URL="mongodb://localhost:27017/vionsys_cms"

# Session JWT authentication secret key
JWT_SECRET="vionsys-cms-jwt-super-secret-key-2026"

# Frontend website domains for URL previews & webhooks
VIONSYS_FRONTEND_BASE_URL="https://vionsys.com"
CMS_BASE_URL="https://cms.vionsys.com"

# Revalidation Webhook secrets
FRONTEND_REVALIDATE_URL="https://www.vionsys.com/api/revalidate/cms"
FRONTEND_REVALIDATE_SECRET="vionsys-cms-revalidate-secret-2026"

# AWS S3 (media uploads) — required for /api/cms/upload
REGION="ap-south-1"
BUCKET="vionsys-wms"
ACCESS_KEY_ID=""
SECRET_ACCESS_KEY=""
```

## Running Locally

1. Set up MongoDB and configure `DATABASE_URL`. For Atlas, use a `mongodb+srv://...` connection string.
2. Generate Prisma Client bindings:
   ```bash
   npx prisma generate
   ```
3. Push the database models:
   ```bash
   npx prisma db push
   ```
4. Start Next.js development server:
   ```bash
   npm run dev
   ```
5. Open your browser and navigate to `http://localhost:3000`. You can log in using:
   - Email: `admin@vionsys.com`
   - Password: `admin123`
   (The login route will auto-create this account on first login attempt if it doesn't exist).
