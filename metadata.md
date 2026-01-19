# Project Metadata & Specifications

> **System Note**: This document serves as the "Single Source of Truth".
> - Sections marked with `[STATIC]` must be strictly followed.
> - Sections marked with `[DYNAMIC]` must be updated by the Agent during the **RED Phase**.

## 1. Tech Stack & Standards [STATIC]

### Frontend
* **Framework**: React 18+ (Vite)
* **Language**: JavaScript (ES6+)
* **Styling**: Standard CSS. **NO Tailwind.**
* **HTTP**: Axios (Must use Interceptors for global error handling)
* **Testing**: None in frontend directory. (Verified via E2E in backend).

### Backend
* **Runtime**: Node.js (LTS)
* **Framework**: Express.js
* **Database**: SQLite3 (`sqlite3` driver, file-based)
* **Testing**: 
    * **Vitest**: Used for Unit and Integration testing.
    * **Supertest**: Used with Vitest for API route testing.
    * **Playwright**: Used for End-to-End (E2E) testing, located in `backend/test-e2e`.

## 2. Directory Structure [STATIC]

*Agent must maintain this structure. Do not invent new root folders.*


```text
/workspace
├── /backend
│   ├── /src
│   │   ├── /database
│   │   │   ├── init_db.js      # DDL Scripts (Source of Truth for Schema)
│   │   │   └── seed_db.js      # Scripts to generate seed data
│   │   ├── /services           # CRUD Helpers
│   │   ├── /routes             # Express Routers
│   │   ├── /utils              # Shared utilities
│   │   └── index.js            # App Entry
│   ├── /test                   # Vitest Unit & Integration (Mirroring structure of /src with .test suffix)
│   │   ├── /...
│   ├── /test-e2e               # Playwright E2E tests
│   │   ├── REQ-1-xx.spec.js    # REQ-ID-Desc.spce.js
│   │   ├── ...
│   │ 
│   └── database.db
│
├── /frontend                   # No /test folder needed here
│   ├── /src
│   │   ├── /api                # Axios endpoints
│   │   ├── /components         # Reusable UI
│   │   ├── /pages              # Route Views
│   │   └── App.jsx
```

## 3. Development Protocols [STATIC]

### 3.1 Naming Conventions (For `register_interface`)

* **Frontend UI**: `UI-[PAGE/COMP]-[NAME]` (e.g., `UI-PAGE-LOGIN`)
* **Backend API**: `API-[MODULE]-[ACTION]` (e.g., `API-AUTH-LOGIN`)
* **Backend Func**: `FUNC-[SERVICE]-[ACTION]` (e.g., `FUNC-USER-CREATE`)
* **Database**: `snake_case` for tables and columns.

### 3.2 Triple-Verification (E2E Level)

Every Playwright test MUST verify three things:

1. **Frontend**: The DOM elements exist and the URL changes correctly.
2. **API Interaction**: Intercept and assert the outgoing API call (URL, method, and payload).
3. **Database State**: Directly query the SQLite database within the test to verify the record was inserted/updated correctly.


### 3.3 Global Response Wrapper

*All Backend APIs MUST return this JSON format:*

```json
{
  "success": true,       // boolean
  "data": { ... },       // payload or null
  "error": {             // null if success
    "code": "ERROR_CODE",
    "message": "Human readable error"
  }
}

```

## 4. Environment Config [STATIC]

* **Backend URL**: `http://localhost:3000`
* **Frontend URL**: `http://localhost:5173`
* **API Prefix**: `/api`
* **DB File**: `./backend/database.db`


## 5. Data Models (Schemas) [DYNAMIC]

> **Instruction for Agent**: During RED Phase, when you design a new table, you MUST append its definition here.

*Current Models:*

### Users & Auth
- `users`: id, username, password, real_name, id_type, id_number, phone, email, user_type, created_at
- `passengers`: id, user_id, real_name, id_type, id_number, phone, passenger_type, is_self, created_at
- `verification_codes`: phone, code, expires_at

### Train System
- `trains`: train_no (PK), train_type
- `train_stations`: id, train_no, station_name, arrival_time, departure_time, sequence_no
- `daily_train_tickets`: id, train_no, date, business_seat, first_class, second_class, hard_sleeper, hard_seat, no_seat

## 6. API Registry [DYNAMIC]

> **Instruction for Agent**: During RED Phase, when you design a new Route, verify it follows the Wrapper and list it here.

*Current Endpoints:*