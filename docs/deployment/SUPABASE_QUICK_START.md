# Supabase Quick Start for Razmena Vrtica

Get your production database up and running in 10 minutes.

## Step 1: Create Supabase Project (3 minutes)

1. Go to [supabase.com](https://supabase.com) and sign up/login
2. Click **"New Project"**
3. Fill in details:
   - **Name**: `razmena-vrtica-prod`
   - **Password**: Generate strong password (save it!)
   - **Region**: `Europe (Central)` 🇪🇺
4. Click **"Create new project"**
5. Wait for initialization (2-3 minutes)

## Step 2: Get Connection String (1 minute)

1. In Supabase dashboard: **Settings** → **Database**
2. Scroll to **Connection string** section
3. Copy the **URI** format
4. Replace `[YOUR-PASSWORD]` with your actual password

Example:
```
postgresql://postgres.abcdefg:[YOUR-PASSWORD]@aws-0-eu-central-1.pooler.supabase.com:6543/postgres?sslmode=require
```

## Step 3: Configure Environment (2 minutes)

1. Copy production template:
   ```bash
   cp backend/.env.production.example backend/.env.production
   ```

2. Edit `backend/.env.production`:
   ```env
   NODE_ENV=production
   FRONTEND_URL=https://your-domain.com
   JWT_SECRET=your-generated-jwt-secret-here
   DATABASE_URL=postgresql://postgres.your-ref:[PASSWORD]@aws-0-eu-central-1.pooler.supabase.com:6543/postgres?sslmode=require
   
   # Mailgun (update with your production values)
   MAILGUN_API_KEY=your-production-key
   MAILGUN_DOMAIN=your-domain.com
   MAILGUN_FROM=Razmena Vrtica <noreply@your-domain.com>
   MAILGUN_EU=true
   ```

3. Generate JWT secret:
   ```bash
   node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
   ```

## Step 4: Test Connection (1 minute)

```bash
# Test Supabase connection
npm run test:supabase
```

Expected output:
```
✅ Successfully connected to Supabase!
✅ PostgreSQL version: PostgreSQL 15.x
⚠️  No application tables found. Run migrations first.
```

## Step 5: Deploy Database Schema (3 minutes)

```bash
# Install dependencies (if not done)
npm install

# Build shared package
npm run build:shared

# Run migrations
npm run migrate:prod

# Seed kindergarten data
npm run seed:prod
```

## Step 6: Verify Setup

Test again to see your tables:
```bash
npm run test:supabase
```

Expected output:
```
✅ Successfully connected to Supabase!
✅ Found application tables:
   - children
   - kindergartens  
   - match_groups
   - users
📊 Record counts:
   - kindergartens: 150+ records
   - users: 0 records
```

## 🎉 You're Ready!

Your Supabase database is now configured and ready for production deployment.

## Next Steps

1. **Deploy your application** using the production environment
2. **Set up domain and SSL** certificates  
3. **Configure monitoring** in Supabase dashboard
4. **Set up alerts** for database usage

## Troubleshooting

### Connection Issues
```bash
# Check your connection string format
npm run test:supabase
```

### Migration Issues
```bash
# Check if tables exist in Supabase dashboard
# Go to: Table Editor in your project
```

### Need Help?
- 📖 Full guide: `SUPABASE_SETUP_GUIDE.md`
- 🚀 Deployment: `PRODUCTION_DEPLOYMENT_GUIDE.md`
- 💬 [Supabase Discord](https://discord.supabase.com)

## Supabase Dashboard Features

Once set up, explore these features:
- **Table Editor**: View/edit data directly
- **SQL Editor**: Run custom queries
- **Database**: Monitor performance
- **Auth**: User management (future feature)
- **Storage**: File uploads (future feature)