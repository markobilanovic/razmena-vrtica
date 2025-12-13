# Data Backup Strategy

## Overview

This document outlines the backup and restore strategy for the Razmena Vrtica (Kindergarten Exchange) platform. The system uses PostgreSQL 16 running in Docker, and all critical data must be protected against loss.

## Critical Data Assets

### Database Tables

1. **user** - Parent accounts with authentication credentials
   - Email addresses, password hashes, email confirmation tokens
   - Critical: Contains authentication data

2. **child** - Children registered in the system
   - Personal information (name, birth date, gender, age group)
   - Links to parents and current kindergartens
   - Critical: Core business data

3. **kindergarten** - Kindergarten database
   - Facility information and locations
   - Moderate: Can be re-seeded but updates should be preserved

4. **wishlist** - Parent preferences for kindergarten exchanges
   - Desired kindergartens for each child
   - Critical: User-generated preferences

5. **match_group** - Exchange match cycles
   - Status tracking for multi-way swaps
   - Critical: Active exchange state

6. **match_participant** - Individual participants in matches
   - Acceptance status and exchange relationships
   - Critical: Active exchange state

7. **hidden_match** - User-hidden matches
   - User preferences for match visibility
   - Moderate: User experience data

### Additional Assets

- **Database migrations** - Schema version history (in git)
- **Environment configuration** - Secrets and connection strings (NOT in git)
- **Uploaded files** - Currently none, but plan for future attachments

## Backup Strategy

### 1. Automated Daily Backups

**Schedule**: Daily at 2:00 AM local time

**Method**: PostgreSQL `pg_dump` with custom format

**Retention Policy**:
- Daily backups: Keep last 7 days
- Weekly backups: Keep last 4 weeks (Sunday backups)
- Monthly backups: Keep last 12 months (1st of month)

**Script Location**: `backend/scripts/backup-database.sh`

```bash
#!/bin/bash
# Daily backup script

BACKUP_DIR="/backups/razmena-vrtica"
DATE=$(date +%Y%m%d_%H%M%S)
CONTAINER_NAME="razmena-vrtica-db-1"

# Create backup directory
mkdir -p "$BACKUP_DIR/daily"

# Perform backup
docker exec $CONTAINER_NAME pg_dump \
  -U admin \
  -d razmena_vrtica \
  -F c \
  -f /tmp/backup_$DATE.dump

# Copy from container to host
docker cp $CONTAINER_NAME:/tmp/backup_$DATE.dump "$BACKUP_DIR/daily/"

# Compress backup
gzip "$BACKUP_DIR/daily/backup_$DATE.dump"

# Clean up old daily backups (keep 7 days)
find "$BACKUP_DIR/daily" -name "backup_*.dump.gz" -mtime +7 -delete

# Weekly backup (Sunday)
if [ $(date +%u) -eq 7 ]; then
  mkdir -p "$BACKUP_DIR/weekly"
  cp "$BACKUP_DIR/daily/backup_$DATE.dump.gz" "$BACKUP_DIR/weekly/"
  find "$BACKUP_DIR/weekly" -name "backup_*.dump.gz" -mtime +28 -delete
fi

# Monthly backup (1st of month)
if [ $(date +%d) -eq 01 ]; then
  mkdir -p "$BACKUP_DIR/monthly"
  cp "$BACKUP_DIR/daily/backup_$DATE.dump.gz" "$BACKUP_DIR/monthly/"
  find "$BACKUP_DIR/monthly" -name "backup_*.dump.gz" -mtime +365 -delete
fi

echo "Backup completed: backup_$DATE.dump.gz"
```

### 2. Pre-Migration Backups

**Trigger**: Before running any database migration

**Method**: Manual `pg_dump` with timestamp

**Script Location**: `backend/scripts/backup-before-migration.sh`

```bash
#!/bin/bash
# Pre-migration backup script

BACKUP_DIR="/backups/razmena-vrtica/migrations"
DATE=$(date +%Y%m%d_%H%M%S)
CONTAINER_NAME="razmena-vrtica-db-1"

mkdir -p "$BACKUP_DIR"

echo "Creating pre-migration backup..."
docker exec $CONTAINER_NAME pg_dump \
  -U admin \
  -d razmena_vrtica \
  -F c \
  -f /tmp/pre_migration_$DATE.dump

docker cp $CONTAINER_NAME:/tmp/pre_migration_$DATE.dump "$BACKUP_DIR/"
gzip "$BACKUP_DIR/pre_migration_$DATE.dump"

echo "Pre-migration backup completed: pre_migration_$DATE.dump.gz"
echo "Safe to proceed with migration."
```

### 3. On-Demand Manual Backups

**Use Cases**:
- Before major feature deployments
- Before bulk data operations
- Before production hotfixes

**Script Location**: `backend/scripts/backup-manual.sh`

```bash
#!/bin/bash
# Manual backup with custom label

if [ -z "$1" ]; then
  echo "Usage: ./backup-manual.sh <label>"
  echo "Example: ./backup-manual.sh before-hotfix-123"
  exit 1
fi

BACKUP_DIR="/backups/razmena-vrtica/manual"
DATE=$(date +%Y%m%d_%H%M%S)
LABEL=$1
CONTAINER_NAME="razmena-vrtica-db-1"

mkdir -p "$BACKUP_DIR"

echo "Creating manual backup: $LABEL"
docker exec $CONTAINER_NAME pg_dump \
  -U admin \
  -d razmena_vrtica \
  -F c \
  -f /tmp/manual_${LABEL}_$DATE.dump

docker cp $CONTAINER_NAME:/tmp/manual_${LABEL}_$DATE.dump "$BACKUP_DIR/"
gzip "$BACKUP_DIR/manual_${LABEL}_$DATE.dump"

echo "Manual backup completed: manual_${LABEL}_$DATE.dump.gz"
```

### 4. Continuous Replication (Production)

**Method**: PostgreSQL streaming replication or managed service backups

**For Production Deployment**:
- Use managed PostgreSQL service (AWS RDS, Google Cloud SQL, Azure Database)
- Enable automated backups with point-in-time recovery (PITR)
- Configure read replicas for high availability
- Set backup retention to 30 days minimum

## Restore Procedures

### Full Database Restore

```bash
#!/bin/bash
# Restore from backup file

if [ -z "$1" ]; then
  echo "Usage: ./restore-database.sh <backup-file>"
  echo "Example: ./restore-database.sh /backups/razmena-vrtica/daily/backup_20241209_020000.dump.gz"
  exit 1
fi

BACKUP_FILE=$1
CONTAINER_NAME="razmena-vrtica-db-1"

# Decompress if needed
if [[ $BACKUP_FILE == *.gz ]]; then
  echo "Decompressing backup..."
  gunzip -k "$BACKUP_FILE"
  BACKUP_FILE="${BACKUP_FILE%.gz}"
fi

# Copy to container
echo "Copying backup to container..."
docker cp "$BACKUP_FILE" $CONTAINER_NAME:/tmp/restore.dump

# Drop existing database (WARNING: destructive)
echo "WARNING: This will drop the existing database!"
read -p "Continue? (yes/no): " confirm
if [ "$confirm" != "yes" ]; then
  echo "Restore cancelled."
  exit 0
fi

# Restore database
echo "Restoring database..."
docker exec $CONTAINER_NAME dropdb -U admin razmena_vrtica
docker exec $CONTAINER_NAME createdb -U admin razmena_vrtica
docker exec $CONTAINER_NAME pg_restore \
  -U admin \
  -d razmena_vrtica \
  -F c \
  /tmp/restore.dump

echo "Database restored successfully!"
echo "Remember to restart the backend application."
```

### Selective Table Restore

```bash
#!/bin/bash
# Restore specific tables only

if [ -z "$1" ] || [ -z "$2" ]; then
  echo "Usage: ./restore-table.sh <backup-file> <table-name>"
  echo "Example: ./restore-table.sh backup.dump.gz user"
  exit 1
fi

BACKUP_FILE=$1
TABLE_NAME=$2
CONTAINER_NAME="razmena-vrtica-db-1"

# Decompress if needed
if [[ $BACKUP_FILE == *.gz ]]; then
  gunzip -k "$BACKUP_FILE"
  BACKUP_FILE="${BACKUP_FILE%.gz}"
fi

docker cp "$BACKUP_FILE" $CONTAINER_NAME:/tmp/restore.dump

echo "Restoring table: $TABLE_NAME"
docker exec $CONTAINER_NAME pg_restore \
  -U admin \
  -d razmena_vrtica \
  -F c \
  -t "$TABLE_NAME" \
  --data-only \
  /tmp/restore.dump

echo "Table $TABLE_NAME restored successfully!"
```

## Backup Verification

### Monthly Verification Process

1. **Restore to Test Environment**
   - Spin up separate Docker container
   - Restore latest monthly backup
   - Verify data integrity

2. **Data Validation Checks**
   ```sql
   -- Check record counts
   SELECT 'users' as table_name, COUNT(*) FROM "user"
   UNION ALL
   SELECT 'children', COUNT(*) FROM child
   UNION ALL
   SELECT 'kindergartens', COUNT(*) FROM kindergarten
   UNION ALL
   SELECT 'wishlists', COUNT(*) FROM wishlist
   UNION ALL
   SELECT 'match_groups', COUNT(*) FROM match_group
   UNION ALL
   SELECT 'match_participants', COUNT(*) FROM match_participant;

   -- Check for orphaned records
   SELECT COUNT(*) FROM child WHERE parent_id NOT IN (SELECT id FROM "user");
   SELECT COUNT(*) FROM wishlist WHERE child_id NOT IN (SELECT id FROM child);
   ```

3. **Application Smoke Test**
   - Start backend against restored database
   - Test login functionality
   - Verify dashboard loads
   - Check match retrieval

### Automated Backup Health Check

**Script Location**: `backend/scripts/verify-backup.sh`

```bash
#!/bin/bash
# Verify backup file integrity

if [ -z "$1" ]; then
  echo "Usage: ./verify-backup.sh <backup-file>"
  exit 1
fi

BACKUP_FILE=$1

# Check file exists
if [ ! -f "$BACKUP_FILE" ]; then
  echo "ERROR: Backup file not found: $BACKUP_FILE"
  exit 1
fi

# Check file size (should be > 1KB)
SIZE=$(stat -f%z "$BACKUP_FILE" 2>/dev/null || stat -c%s "$BACKUP_FILE" 2>/dev/null)
if [ "$SIZE" -lt 1024 ]; then
  echo "ERROR: Backup file too small: $SIZE bytes"
  exit 1
fi

# Test decompression if gzipped
if [[ $BACKUP_FILE == *.gz ]]; then
  if ! gunzip -t "$BACKUP_FILE" 2>/dev/null; then
    echo "ERROR: Backup file is corrupted (gzip test failed)"
    exit 1
  fi
fi

echo "✓ Backup file verified: $BACKUP_FILE ($SIZE bytes)"
```

## Disaster Recovery Plan

### Scenario 1: Database Corruption

1. Stop backend application
2. Identify last known good backup
3. Restore from backup using restore script
4. Verify data integrity
5. Restart backend application
6. Monitor error logs

**RTO (Recovery Time Objective)**: 30 minutes  
**RPO (Recovery Point Objective)**: 24 hours (daily backup)

### Scenario 2: Accidental Data Deletion

1. Identify affected tables/records
2. Find backup before deletion occurred
3. Use selective table restore
4. Manually merge data if needed
5. Verify application functionality

**RTO**: 1-2 hours  
**RPO**: 24 hours

### Scenario 3: Complete Server Loss

1. Provision new server/container
2. Install PostgreSQL 16
3. Restore from latest backup
4. Update connection strings in backend
5. Deploy backend application
6. Verify full functionality

**RTO**: 4 hours  
**RPO**: 24 hours

### Scenario 4: Migration Failure

1. Stop backend application
2. Restore pre-migration backup
3. Investigate migration issue
4. Fix migration script
5. Test in development environment
6. Re-run migration

**RTO**: 1 hour  
**RPO**: 0 (pre-migration backup)

## Backup Storage

### Development Environment

- **Location**: `/backups/razmena-vrtica/` on host machine
- **Volume Mount**: Add to `docker-compose.yml`
  ```yaml
  volumes:
    - postgres_data:/var/lib/postgresql/data
    - ./backups:/backups
  ```

### Production Environment

**Primary Storage**: Cloud object storage
- AWS S3 with versioning enabled
- Google Cloud Storage with lifecycle policies
- Azure Blob Storage with immutable storage

**Secondary Storage**: Off-site backup service
- Backblaze B2
- Wasabi
- Dedicated backup service (e.g., Veeam, Acronis)

**Encryption**: All production backups must be encrypted at rest
- Use `pg_dump` with encryption: `gpg --encrypt`
- Or rely on cloud storage encryption (KMS)

## Monitoring and Alerts

### Backup Success Monitoring

Create monitoring script: `backend/scripts/monitor-backups.sh`

```bash
#!/bin/bash
# Check if daily backup completed successfully

BACKUP_DIR="/backups/razmena-vrtica/daily"
TODAY=$(date +%Y%m%d)

# Find today's backup
BACKUP_FILE=$(find "$BACKUP_DIR" -name "backup_${TODAY}_*.dump.gz" | head -n 1)

if [ -z "$BACKUP_FILE" ]; then
  echo "ALERT: No backup found for today ($TODAY)"
  # Send alert (email, Slack, PagerDuty, etc.)
  exit 1
fi

# Verify backup
./verify-backup.sh "$BACKUP_FILE"
if [ $? -ne 0 ]; then
  echo "ALERT: Today's backup failed verification"
  exit 1
fi

echo "✓ Backup monitoring: OK"
```

### Alert Channels

- Email notifications for backup failures
- Slack/Discord webhook for daily backup status
- PagerDuty for critical failures in production

## Security Considerations

### Backup Access Control

- Restrict backup directory permissions: `chmod 700 /backups`
- Limit database user permissions for backup operations
- Use separate credentials for backup/restore operations

### Data Privacy

- Backups contain PII (emails, names, birth dates)
- Encrypt backups in production environments
- Secure backup storage with access logging
- Comply with GDPR/data protection regulations
- Document data retention policies

### Backup Rotation

- Automatically delete old backups per retention policy
- Maintain audit log of backup operations
- Track who accessed/restored backups

## Implementation Checklist

### Immediate Actions (Development)

- [ ] Create backup scripts directory: `backend/scripts/`
- [ ] Implement `backup-database.sh` script
- [ ] Implement `restore-database.sh` script
- [ ] Implement `backup-before-migration.sh` script
- [ ] Test backup and restore procedures
- [ ] Document backup location in README
- [ ] Add backup volume to `docker-compose.yml`

### Short-term (Pre-Production)

- [ ] Set up automated daily backups (cron job)
- [ ] Implement backup verification script
- [ ] Create monitoring and alerting
- [ ] Test disaster recovery procedures
- [ ] Document recovery time objectives
- [ ] Train team on restore procedures

### Long-term (Production)

- [ ] Migrate to managed PostgreSQL service
- [ ] Enable point-in-time recovery
- [ ] Set up off-site backup storage
- [ ] Implement backup encryption
- [ ] Configure automated backup testing
- [ ] Establish backup compliance policies
- [ ] Create runbook for disaster scenarios

## Maintenance

### Weekly Tasks

- Verify latest backup exists and is valid
- Check backup storage capacity
- Review backup logs for errors

### Monthly Tasks

- Perform full restore test in staging environment
- Verify backup retention policies are working
- Review and update disaster recovery procedures
- Check backup storage costs and optimize

### Quarterly Tasks

- Conduct disaster recovery drill
- Review and update RTO/RPO objectives
- Audit backup access logs
- Update backup documentation

## Additional Resources

### Useful Commands

```bash
# List all databases
docker exec razmena-vrtica-db-1 psql -U admin -l

# Check database size
docker exec razmena-vrtica-db-1 psql -U admin -d razmena_vrtica -c "SELECT pg_size_pretty(pg_database_size('razmena_vrtica'));"

# List all tables with row counts
docker exec razmena-vrtica-db-1 psql -U admin -d razmena_vrtica -c "
  SELECT schemaname, tablename, n_live_tup 
  FROM pg_stat_user_tables 
  ORDER BY n_live_tup DESC;"

# Export specific table to CSV
docker exec razmena-vrtica-db-1 psql -U admin -d razmena_vrtica -c "COPY (SELECT * FROM kindergarten) TO STDOUT WITH CSV HEADER" > kindergarten_export.csv
```

### PostgreSQL Documentation

- [pg_dump documentation](https://www.postgresql.org/docs/16/app-pgdump.html)
- [pg_restore documentation](https://www.postgresql.org/docs/16/app-pgrestore.html)
- [Backup and Restore](https://www.postgresql.org/docs/16/backup.html)

## Contact and Escalation

- **Backup Issues**: Check logs in `/backups/razmena-vrtica/logs/`
- **Restore Assistance**: Refer to this document and test in development first
- **Production Incidents**: Follow disaster recovery plan above

---

**Document Version**: 1.0  
**Last Updated**: December 9, 2024  
**Next Review**: March 9, 2025
