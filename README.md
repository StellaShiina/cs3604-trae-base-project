# 12306 Railway Ticketing System Clone

This project is a full-stack imitation of the 12306 railway ticketing system, featuring a React frontend and a Node.js/Express backend with SQLite database.

## 🚀 Tech Stack

### Frontend
- **Framework**: React 18+ (Vite)
- **Language**: JavaScript (ES6+)
- **Styling**: Standard CSS
- **HTTP Client**: Axios
- **State Management**: React Hooks

### Backend
- **Runtime**: Node.js (LTS)
- **Framework**: Express.js
- **Database**: SQLite3 (File-based)
- **Testing**: Vitest (Unit/Integration), Playwright (E2E)

## 📂 Directory Structure

```text
/
├── backend/            # Backend application code
│   ├── src/            # Source code (routes, services, database, etc.)
│   ├── test-e2e/       # Playwright End-to-End tests
│   └── database.db     # SQLite database file (generated after init)
├── frontend/           # Frontend application code
│   ├── src/            # Source code (components, pages, api, etc.)
│   └── public/         # Static assets
└── requirement/        # Project requirements and assets
```

## 🛠️ Getting Started

### Prerequisites
- Node.js (LTS version recommended)
- npm (Node Package Manager)

### 1. Setup Backend

The backend runs on port **3000**.

```bash
cd backend

# Install dependencies
npm install

# Start development server (with hot-reload)
npm run dev
```

### 2. Setup Frontend

The frontend runs on port **5173**.

```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

Once both servers are running, you can access the application at `http://localhost:5173`.

## 🧪 Testing

The project includes both unit/integration tests and end-to-end (E2E) tests.

### Run Unit Tests (Vitest)
```bash
cd backend
npm run test
```

### Run E2E Tests (Playwright)
```bash
cd backend
npm run test:e2e
```

### Run All Tests
```bash
cd backend
npm run test:all
```

## 📝 API Response Standard

All backend APIs return a unified JSON response format:

```json
{
  "success": true,       // boolean indicating operation status
  "data": { ... },       // payload (object or null)
  "error": {             // error details (null if success)
    "code": "ERROR_CODE",
    "message": "Human readable error message"
  }
}
```

## 📄 License

This project is for educational purposes.
