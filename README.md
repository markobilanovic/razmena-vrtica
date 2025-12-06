# Razmena Vrtica (Kindergarten Exchange)

A platform for exchanging kindergarten spots in Serbia. This application helps parents find and swap places in kindergartens to better suit their location or needs.

## 🏗️ Architecture

- **Backend**: NestJS with TypeORM
- **Frontend**: Next.js with TypeScript and Tailwind CSS
- **Database**: PostgreSQL 16
- **Authentication**: Email/Password + Google SSO (planned)

## 📦 Database Schema

The application supports **multi-way circular swaps** (A→B→C→A):

- **User**: Parent accounts with email authentication
- **Kindergarten**: List of kindergartens in Serbia
- **Child**: Children registered to spots at specific kindergartens
- **Wishlist**: Desired kindergartens for each child
- **MatchGroup**: Groups of users in circular swap matches
- **MatchParticipant**: Individual participants in each match

## 🚀 Getting Started

### Prerequisites

- Node.js (v18+)
- Docker Desktop
- npm

### Setup Instructions

1. **Start the Database**
   ```bash
   docker-compose up -d
   ```
   This starts PostgreSQL on port 5433.

2. **Install Backend Dependencies**
   ```bash
   cd backend
   npm install
   ```

3. **Start the Backend**
   ```bash
   npm run start
   ```
   The backend will run on `http://localhost:3000` and automatically create database tables.

4. **Install Frontend Dependencies** (in a new terminal)
   ```bash
   cd frontend
   npm install
   ```

5. **Start the Frontend**
   ```bash
   npm run dev
   ```
   The frontend will run on `http://localhost:3000` (or 3001 if 3000 is taken).

### Verify Database Connection

To check if tables were created successfully:
```bash
docker exec razmena-vrtica-db-1 psql -U admin -d razmena_vrtica -c "\dt"
```

You should see 6 tables: `child`, `kindergarten`, `match_group`, `match_participant`, `user`, `wishlist`.

## 📋 Project Status

- [x] Database schema designed
- [x] Backend project initialized (NestJS)
- [x] Frontend project initialized (Next.js)
- [x] TypeORM entities created
- [x] Database connection verified
- [ ] Authentication (Email + Google SSO)
- [ ] Kindergarten management
- [ ] User profiles and child registration
- [ ] Matching algorithm (cycle detection)
- [ ] Contact/messaging system

## 🛠️ Development

### Database Configuration

The database runs on port **5433** (not the default 5432) to avoid conflicts.

Connection details:
- Host: `localhost`
- Port: `5433`
- Database: `razmena_vrtica`
- Username: `admin`
- Password: `password`

### Stopping Services

```bash
# Stop the backend
# Press Ctrl+C in the terminal running the backend

# Stop the database
docker-compose down
```
