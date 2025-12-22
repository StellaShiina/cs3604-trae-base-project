# 12306 Railway Ticketing System (Demo)

This is a modern, full-stack implementation of the 12306 railway ticketing system, featuring a Go backend, Vue.js frontend, and PostgreSQL database.

## Project Structure

```
/opt/12306/
├── backend/            # Go Backend (Gin + GORM)
│   ├── db/             # Database connection & models
│   ├── routes/         # API endpoints
│   ├── services/       # Business logic
│   └── main.go         # Entry point
├── frontend/           # Vue 3 + TypeScript Frontend
│   ├── src/            # Source code
│   └── package.json    # Dependencies
├── db/                 # Database utilities
├── database/           # SQL initialization scripts
├── docker-compose.yml  # Container orchestration
└── deploy.sh           # One-click deployment script
```

## Features

- **User Authentication**: Registration, Login (2FA/SMS simulation), Session management.
- **Train Search**: Real-time train schedule search with city aggregation (e.g., Beijing -> Shanghai).
- **Booking System**: Seat selection, order creation, and mock payment flow.
- **Passenger Management**: Add and manage passengers for bookings.
- **Station Management**: Comprehensive station database with English/Pinyin support.

## Tech Stack

- **Backend**: Go (Golang) 1.25+, Gin Framework, GORM
- **Frontend**: Vue 3, TypeScript, Vite, Pinia
- **Database**: PostgreSQL 16
- **Infrastructure**: Docker, Docker Compose, Systemd

## Deployment Guide

### Prerequisites

- Linux Server (tested on Ubuntu/Debian)
- Docker & Docker Compose
- Go 1.25+
- Node.js 18+ & npm

### One-Click Deployment

We provide a `deploy.sh` script that handles the entire deployment process:

1. Starts the PostgreSQL database container.
2. Builds the Go backend binary.
3. Registers and starts the backend as a Systemd service (`12306-backend`).
4. Builds the Frontend static assets.

```bash
# Run as root
sudo ./deploy.sh
```

### Manual Setup

If you prefer to set up manually:

1. **Database**:
   ```bash
   docker compose up -d
   ```

2. **Backend**:
   ```bash
   cd backend
   go mod tidy
   go build -o 12306-backend main.go
   # Run locally
   export DATABASE_URL="postgres://postgres:postgres@localhost:5432/railway12306?sslmode=disable"
   ./12306-backend
   ```

3. **Frontend**:
   ```bash
   cd frontend
   npm install
   npm run dev  # For development
   # OR
   npm run build # For production
   ```

## Development

- **API Documentation**: See `docs/frontend-api-guide-12306.md` for detailed API specifications.
- **Testing**:
  - Backend tests are located in `backend/routes/*_test.go`.
  - Run tests: `cd backend && go test ./...`

## Notes

- The project uses port **8081** for the backend API by default.
- The database initializes automatically using scripts in `database/db-init` on the first run.
