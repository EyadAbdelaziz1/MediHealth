# MediHealth AI

AI-powered medication safety assistant — production-ready MVP with React Native (Expo), Express, Appwrite, and NVIDIA NIM (StepFun 3.7 Flash).

## Stack

| Layer | Technology |
|-------|------------|
| Mobile | React Native, Expo 53, Expo Router, NativeWind, React Query |
| Backend | Node.js, Express, TypeScript |
| Database & Auth | Appwrite |
| AI | NVIDIA NIM — `stepfun-ai/step3.7-flash` |
| Verification | Miyami web search API |

## Quick Start

### 1. Backend

```bash
cd server
cp .env.example .env
npm install
npm run setup:appwrite
npm run seed:demo
npm run dev
```

Server runs at `http://localhost:3000`

### 2. Mobile App

```bash
cd client
npm install
npx expo start
```

- **Android emulator**: API uses `10.0.2.2:3000`
- **Physical device**: set production API URL in `app.json` `extra.apiBaseUrl`

### 3. Demo Account 

| Field | Value |
|-------|-------|
| Email | `demo@medihealth.app` |
| Password | `Demo123!` |

Tap **Enter Demo** on the login screen or use credentials above.

## Features

- AI medication analysis (interactions, side effects, food interactions, safety score)
- AI Vision medication scanner
- Medication library & history
- Smart reminders with dose tracking
- Analysis & scan history
- Arabic (default) + English with full RTL
- Dark mode
- Medical verification via trusted sources (OpenFDA, MedlinePlus, Drugs.com, etc.)

## Project Structure

```
MediHealth/
├── client/           # Expo React Native app
│   ├── app/          # Expo Router screens
│   └── src/          # Components, contexts, services
├── server/           # Express API
│   ├── src/
│   │   ├── ai/       # System prompts
│   │   ├── routes/   # API routes
│   │   ├── services/ # AI, web research, Appwrite DB
│   │   └── types/    # Medical types
│   └── scripts/      # Appwrite setup & demo seed
└── README.md
```

## API Endpoints

| Method | Route | Description |
|--------|-------|-------------|
| POST | `/api/auth/register` | Register user |
| POST | `/api/auth/login` | Login |
| POST | `/api/auth/forgot-password` | Request reset code |
| POST | `/api/auth/reset-password` | Reset password |
| POST | `/api/auth/change-password` | Change password |
| GET | `/api/profile/dashboard` | Dashboard data |
| GET/POST | `/api/medications` | Medication CRUD |
| POST | `/api/analysis/analyze` | AI analysis |
| POST | `/api/scan/analyze` | Vision scan + analysis |
| GET/POST | `/api/reminders` | Reminder management |

## Environment Variables

See `server/.env.example`. Never commit `.env` or expose API keys in the client.

## Database (Appwrite Collections)

- `user_profiles` — fullName, email, preferredLanguage
- `user_medications` — user medications
- `reminders` / `reminder_completions`
- `analysis_reports` — AI analysis history
- `scan_histories` — vision scan history
- `password_resets`

## Security

- JWT authentication for API
- Appwrite for user management & password hashing
- Rate limiting on auth & API routes
- Helmet, CORS, input validation
- AI keys server-side only

## License

Proprietary — MediHealth AI MVP
