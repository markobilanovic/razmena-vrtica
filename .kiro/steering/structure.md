# Project Structure

## Monorepo Organization

```
├── backend/           # NestJS API server
├── frontend/          # Next.js web application
├── shared/            # Common types and schemas
├── docker-compose.yml # PostgreSQL database
└── package.json       # Workspace root
```

## Backend Structure (`backend/`)

### Core Directories

- `src/entities/` - TypeORM entities (database models)
- `src/controllers/` - REST API endpoints
- `src/services/` - Business logic layer
- `src/modules/` - NestJS modules for dependency injection
- `src/guards/` - Authentication guards (JWT)
- `src/strategies/` - Passport authentication strategies

### Supporting Directories

- `src/migrations/` - Database schema migrations
- `src/seeds/` - Database seed data and scripts
- `src/scripts/` - Utility scripts for data management
- `src/utils/` - Helper functions and utilities
- `test/` - Jest unit and E2E tests
- `docs/` - Backend-specific documentation

### Key Files

- `src/main.ts` - Application entry point
- `src/app.module.ts` - Root NestJS module
- `nest-cli.json` - NestJS CLI configuration
- `jest.config.js` - Test configuration

## Frontend Structure (`frontend/`)

### App Router Structure (`src/app/`)

- `src/app/page.tsx` - Home page
- `src/app/login/` - Authentication pages
- `src/app/dashboard/` - Main application interface
- `src/app/layout.tsx` - Root layout with providers

### Components (`src/components/`)

- `src/components/ui/` - Reusable UI components (Radix-based)
- `src/components/dashboard/` - Dashboard-specific components
- `src/components/dashboard/child-sections/` - Child management sections

### Libraries (`src/lib/`)

- `src/lib/api.ts` - API client functions
- `src/lib/queries.ts` - TanStack Query hooks
- `src/lib/utils.ts` - Utility functions

## Shared Package (`shared/`)

### Structure

- `src/schemas/` - Zod validation schemas
- `src/enums/` - Shared enumerations
- `src/index.ts` - Package exports
- `dist/` - Compiled TypeScript output

### Schema Organization

- `auth.schema.ts` - Authentication-related schemas
- `user.schema.ts` - User data validation
- `child.schema.ts` - Child entity schemas
- `kindergarten.schema.ts` - Kindergarten data schemas
- `matching.schema.ts` - Match algorithm schemas
- `wishlist.schema.ts` - Wishlist validation

## Naming Conventions

### Files

- **Entities**: `*.entity.ts` (e.g., `user.entity.ts`)
- **Controllers**: `*.controller.ts` (e.g., `auth.controller.ts`)
- **Services**: `*.service.ts` (e.g., `matching.service.ts`)
- **Modules**: `*.module.ts` (e.g., `auth.module.ts`)
- **Tests**: `*.spec.ts` for unit, `*.e2e-spec.ts` for E2E
- **Components**: PascalCase (e.g., `DashboardContent.tsx`)
- **Pages**: `page.tsx` in Next.js app router

### Database

- **Tables**: snake_case (e.g., `match_participant`)
- **Columns**: snake_case (e.g., `created_at`, `full_name`)
- **Primary Keys**: `id` (UUID)
- **Foreign Keys**: `{table}_id` (e.g., `user_id`)

### Code Style

- **Variables/Functions**: camelCase
- **Classes/Interfaces**: PascalCase
- **Constants**: UPPER_SNAKE_CASE
- **Enums**: PascalCase with PascalCase values

## Import Patterns

### Backend

```typescript
// External libraries first
import { Injectable } from "@nestjs/common"
import { Repository } from "typeorm"

// Internal imports
import { User } from "../entities/user.entity"
import { CreateUserDto } from "@repo/shared"
```

### Frontend

```typescript
// React/Next.js
import { useState } from "react"
import { useQuery } from "@tanstack/react-query"

// Internal components and utilities
import { Button } from "@/components/ui/button"
import { api } from "@/lib/api"
```

## Configuration Files Location

- Root: `package.json`, `docker-compose.yml`, `.prettierrc`
- Backend: `nest-cli.json`, `jest.config.js`, `tsconfig.json`
- Frontend: `next.config.ts`, `tailwind.config.js`, `tsconfig.json`
