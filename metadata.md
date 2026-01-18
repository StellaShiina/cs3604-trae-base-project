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

### `users`
| Column | Type | Constraints | Description |
|---|---|---|---|
| id | INTEGER | PK, AutoInc | User ID |
| username | TEXT | UNIQUE, NOT NULL | Login Username |
| password | TEXT | NOT NULL | Login Password |
| name | TEXT | NOT NULL | Real Name |
| id_type | TEXT | NOT NULL | ID Type (e.g. "1" for ID Card) |
| id_number | TEXT | UNIQUE, NOT NULL | ID Number |
| phone | TEXT | UNIQUE, NOT NULL | Mobile Phone |
| created_at | DATETIME | DEFAULT CURRENT_TIMESTAMP | |

### `passengers`
| Column | Type | Constraints | Description |
|---|---|---|---|
| id | INTEGER | PK, AutoInc | Passenger ID |
| user_id | INTEGER | FK(users.id), NOT NULL | Owner User ID |
| name | TEXT | NOT NULL | Passenger Name |
| id_type | TEXT | NOT NULL | ID Type |
| id_number | TEXT | NOT NULL | ID Number |
| type | TEXT | DEFAULT '成人' | Passenger Type |
| created_at | DATETIME | DEFAULT CURRENT_TIMESTAMP | |

### `stations`
| Column | Type | Constraints | Description |
|---|---|---|---|
| id | INTEGER | PK, AutoInc | Station ID |
| name | TEXT | UNIQUE, NOT NULL | Station Name |
| pinyin | TEXT | | Pinyin |

### `trains`
| Column | Type | Constraints | Description |
|---|---|---|---|
| id | INTEGER | PK, AutoInc | Train ID |
| code | TEXT | UNIQUE, NOT NULL | Train Code (G27) |
| type | TEXT | NOT NULL | Type (G, D, Z...) |

### `routes`
| Column | Type | Constraints | Description |
|---|---|---|---|
| id | INTEGER | PK, AutoInc | Route ID |
| train_id | INTEGER | FK(trains.id) | Train ID |
| station_id | INTEGER | FK(stations.id) | Station ID |
| station_name | TEXT | | Redundant but fast |
| arrival_time | TEXT | | HH:MM |
| departure_time | TEXT | | HH:MM |
| stop_order | INTEGER | | Sequence |

## 6. API Registry [DYNAMIC]

> **Instruction for Agent**: During RED Phase, when you design a new Route, verify it follows the Wrapper and list it here.

*Current Endpoints:*

### Auth
- `POST /api/v1/auth/register` - Register new user
- `GET /api/v1/auth/check-username` - Check username availability
- `POST /api/v1/auth/send-sms-code` - Send verification code
- `POST /api/v1/auth/login` - Final login with 2FA
- `POST /api/v1/auth/send-login-sms` - Send SMS for login (validates ID last 4)
- `POST /api/v1/auth/verify-user` - Verify user info for password reset
- `POST /api/v1/auth/send-forgot-sms` - Send SMS for password reset
- `POST /api/v1/auth/reset-password` - Reset password

### Tickets
- `GET /api/v1/tickets` - Search tickets (params: from, to, date)