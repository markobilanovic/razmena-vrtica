# Technology Stack

## Architecture

- **Monorepo**: npm workspaces with backend, frontend, and shared packages
- **Backend**: NestJS with TypeScript
- **Frontend**: Next.js 16 with React 19 and TypeScript
- **Database**: PostgreSQL 16 (via Docker)
- **ORM**: TypeORM with decorators and migrations
- **Authentication**: JWT with Passport (Email/Password + planned Google SSO)
- **Styling**: Tailwind CSS 4
- **State Management**: TanStack Query (React Query)
- **Validation**: Zod schemas in shared package
- **UI Components**: Radix UI primitives

## Development Tools

- **Package Manager**: npm
- **Code Formatting**: Prettier (workspace-wide)
- **Linting**: ESLint with TypeScript support
- **Testing**: Jest (backend), Jest E2E (integration)
- **Database**: Docker Compose for PostgreSQL

## Common Commands

### Project Setup

```bash
# Start database
docker-compose up -d

# Install all dependencies
npm install

# Start backend (from root)
npm run dev:backend

# Start frontend (from root)
npm run dev:frontend
```

### Development

```bash
# Format all code
npm run format

# Check formatting
npm run format:check

# Build all packages
npm run build

# Run tests
npm run test
```

### Backend Specific

```bash
cd backend

# Development server with watch
npm run start:dev

# Run database seeds
npm run seed:run

# Run migrations
npm run migrate:age-groups

# Test with coverage
npm run test:cov

# E2E tests
npm run test:e2e
```

### Database

```bash
# Check database tables
docker exec razmena-vrtica-db-1 psql -U admin -d razmena_vrtica -c "\dt"

# Stop database
docker-compose down
```

## Configuration Notes

- Database runs on port **5433** (not default 5432) to avoid conflicts
- Backend runs on port 3000, frontend on 3000/3001
- Shared package provides common Zod schemas and types
- TypeScript strict mode enabled with decorators support
