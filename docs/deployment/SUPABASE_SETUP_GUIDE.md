# Supabase Setup Guide for Razmena Vrtica

This guide covers setting up Supabase as the production database for Razmena Vrtica.

## Why Supabase?

- **PostgreSQL-based**: Full PostgreSQL compatibility with your existing schema
- **Built-in features**: Authentication, real-time subscriptions, storage
- **Developer-friendly**: Great dashboard, automatic backups, easy scaling
- **Cost-effective**: Generous free tier, transparent pricing
- **EU hosting**: Available in EU regions for GDPR compliance

## Setup Steps

### 1. Create Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign up/login
2. Click "New Project"
3. Choose your organization
4. Fill in project details:
   - **Name**: `razmena-vrtica-prod`
   - **Database Password**: Generate a strong password (save it!)
   - **Region**: Choose `Europe (Central)` for Serbia
5. Click "Create new project"
6. Wait for project initialization (2-3 minutes)

### 2. Get Connection Details

From your Supabase dashboard:

1. Go to **Settings** > **Database**
2. Scroll down to **Connection string**
3. Copy the **URI** connection string
4. Replace `[YOUR-PASSWORD]` with your database password

Example connection string:
```
postgresql://postgres.abcdefghijklmnop:[YOUR-PASSWORD]@aws-0-eu-central-1.pooler.supabase.com:6543/postgres?sslmode=require
```

### 3. Configure Production Environment

1. Copy the production template:
   ```bash
   cp backend/.env.production.example backend/.env.production
   ```

2. Update `backend/.env.production`:
   ```env
   NODE_ENV=production
   FRONTEND_URL=https://razmena-vrtica.rs
   JWT_SECRET=your-generated-jwt-secret-here
   DATABASE_URL=postgresql://postgres.your-ref:[PASSWORD]@aws-0-eu-central-1.pooler.supabase.com:6543/postgres?sslmode=require
   
   # Supabase Project Details
   SUPABASE_PROJECT_URL=https://your-project-ref.supabase.co
   SUPABASE_ANON_KEY=your-anon-key-here
   
   # Mailgun (production)
   MAILGUN_API_KEY=your-production-mailgun-key
   MAILGUN_DOMAIN=razmena-vrtica.rs
   MAILGUN_FROM=Razmena Vrtica <noreply@razmena-vrtica.rs>
   MAILGUN_EU=true
   ```

### 4. Run Database Migrations

```bash
# Install dependencies
npm install

# Build shared package
npm run build:shared

# Run migrations on Supabase
npm run migrate:prod
```

### 5. Seed Production Data

```bash
# Seed kindergartens data
npm run seed:prod
```

## Supabase Dashboard Features

### Database Management
- **Table Editor**: View and edit data directly
- **SQL Editor**: Run custom queries
- **Database**: Monitor performance, connections

### Useful Queries for Monitoring

```sql
-- Check all tables
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public';

-- Count records in main tables
SELECT 
  (SELECT COUNT(*) FROM users) as users,
  (SELECT COUNT(*) FROM kindergartens) as kindergartens,
  (SELECT COUNT(*) FROM children) as children,
  (SELECT COUNT(*) FROM match_groups) as matches;

-- Recent user registrations
SELECT email, created_at 
FROM users 
ORDER BY created_at DESC 
LIMIT 10;
```

### Backup and Recovery

Supabase automatically:
- **Daily backups** with 7-day retention (free tier)
- **Point-in-time recovery** (paid plans)
- **Database branching** for testing

Manual backup:
```bash
# Export database
pg_dump "postgresql://postgres.your-ref:[PASSWORD]@aws-0-eu-central-1.pooler.supabase.com:6543/postgres?sslmode=require" > backup.sql
```

## Security Configuration

### 1. Row Level Security (RLS)

Supabase supports RLS for additional security. You can enable it later:

```sql
-- Enable RLS on sensitive tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE children ENABLE ROW LEVEL SECURITY;

-- Create policies (example)
CREATE POLICY "Users can view own data" ON users
  FOR SELECT USING (auth.uid() = id);
```

### 2. Database Roles

Supabase provides different connection roles:
- **Connection pooler** (recommended for apps): Port 6543
- **Direct connection**: Port 5432
- **Session mode**: For long-running connections

### 3. Network Security

- All connections use SSL by default
- IP restrictions available in paid plans
- Connection pooling included

## Monitoring and Alerts

### Supabase Dashboard Monitoring
- **Database health**: CPU, memory, connections
- **API usage**: Requests, bandwidth
- **Auth metrics**: User signups, logins

### Set Up Alerts
1. Go to **Settings** > **Integrations**
2. Configure webhooks for:
   - High CPU usage
   - Connection limits
   - Storage usage

## Scaling Considerations

### Free Tier Limits
- **Database size**: 500MB
- **Bandwidth**: 5GB
- **Monthly active users**: 50,000

### Upgrade Path
- **Pro plan**: $25/month per project
- **Team plan**: $599/month per organization
- **Enterprise**: Custom pricing

### Performance Optimization
- Use connection pooling (enabled by default)
- Add database indexes for frequently queried columns
- Monitor slow queries in dashboard

## Troubleshooting

### Common Issues

1. **Connection timeout**
   - Check if using connection pooler (port 6543)
   - Verify SSL mode in connection string

2. **Migration failures**
   - Ensure database is accessible
   - Check for conflicting table names
   - Verify TypeORM configuration

3. **Performance issues**
   - Monitor connection count
   - Check for missing indexes
   - Review query performance in dashboard

### Support Resources
- [Supabase Documentation](https://supabase.com/docs)
- [Community Discord](https://discord.supabase.com)
- [GitHub Issues](https://github.com/supabase/supabase)

## Cost Estimation

For Razmena Vrtica (estimated usage):
- **Free tier**: Good for initial launch (up to 500MB, 50k MAU)
- **Pro tier ($25/month)**: Suitable for growth phase
- **Additional costs**: Bandwidth overages, storage

## Next Steps After Setup

1. **Test the connection** with a simple query
2. **Deploy your application** using the production environment
3. **Set up monitoring** and alerts
4. **Configure backups** (automatic on Supabase)
5. **Plan for scaling** as user base grows

## Integration with Existing Features

### Email Confirmation
Your existing email confirmation system will work seamlessly with Supabase. The database schema remains the same.

### Matching Algorithm
All matching logic continues to work as-is. Supabase provides the same PostgreSQL features you're already using.

### Future Enhancements
Consider using Supabase's additional features:
- **Real-time subscriptions** for live match notifications
- **Storage** for user profile pictures
- **Edge Functions** for serverless logic