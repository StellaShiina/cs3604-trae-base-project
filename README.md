# 12306 Frontend Implementation

This project is a frontend implementation of the 12306 Login and Registration pages, built with Vue 3, TypeScript, and Tailwind CSS.

## Features

### Registration
- **Form Validation**: Real-time validation for username, password (strength indicator), ID card, phone, etc.
- **Mobile Length Limit**: Strictly limits mobile number input to 11 digits.
- **SMS Verification**:
  - "Get Code" button with countdown.
  - Backend integration for sending/verifying SMS.
- **Success Flow**:
  - Shows success overlay upon completion.
  - Automatically redirects to Login page after 2 seconds.
- **Error Handling**: Displays descriptive errors for duplicate users or system failures.

### Login
- **Form Validation**: Checks for empty fields and format compliance.
- **SMS Verification Modal**:
  - Specific implementation for Login flow.
  - Requires entering the last 4 digits of the ID card.
  - Validates ID against user data before sending SMS.
  - "Get Code" button with 3 states (Disabled, Active, Countdown).
- **Navigation**: Links to Registration and Forgot Password pages.

## Tech Stack
- Vue 3 (Composition API, Script Setup)
- TypeScript
- Tailwind CSS
- Vitest (Unit & Component Testing)
- Pinia (State Management)
- Vue Router

## Usage

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Run Development Server**
   ```bash
   npm run dev
   ```

3. **Run Tests**
   ```bash
   npm test
   ```

## Project Structure
- `src/views/`: Page components (LoginView, RegisterView)
- `src/components/`: Reusable components (LoginVerificationModal, SMSVerificationModal)
- `src/services/`: API services (authService)
- `src/stores/`: Pinia stores (user)
