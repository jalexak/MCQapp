# FRCR 2A Exam Platform

## AUTONOMOUS OPERATION MODE

When user says "continue" or "Read PROGRESS.md and continue":
1. Read `PROGRESS.md` → Check **CURRENT PHASE** and **NEXT TASK**
2. Execute the next pending task
3. Update PROGRESS.md (mark complete, set next task)
4. Continue to next task automatically
5. Run `/compact` after completing 2-3 major tasks

## Tech Stack
- Frontend: React + TypeScript + Vite + Tailwind CSS
- Backend: Node.js + Express + TypeScript
- Database: PostgreSQL + Prisma ORM
- Auth: JWT + bcrypt (Phase 6)
- Payments: Stripe (Phase 7)

## Directory Structure
```
/Platform/
├── CLAUDE.md              # This file
├── PROGRESS.md            # Progress tracker
├── DECISIONS.md           # Architecture decisions
├── DEVLOG.md              # Accomplishment log for team collaboration
├── .env.example           # Environment template
├── package.json           # Root workspace (npm workspaces)
├── tsconfig.json          # Shared TypeScript config
├── frontend/              # React + Vite + Tailwind
│   ├── src/
│   │   ├── App.tsx
│   │   ├── main.tsx
│   │   └── index.css
│   └── ...
├── backend/               # Express + TypeScript API
│   └── src/
│       ├── app.ts
│       └── index.ts
├── prisma/
│   └── schema.prisma      # Database models
└── scripts/
    └── importQuestions.ts # Question import script
```

## Key Constraints
- UK spelling (tumour, colour, haemorrhage)
- Match official FRCR 2A UI from screenshot
- 90 seconds per question in exam mode
- Questions from ALL_QUESTIONS_REMEDIATED.json

## Question Data Location
- Source: `ALL_QUESTIONS_REMEDIATED.json` (in Platform directory)
- 2,499 questions across 175 subtopics
- Difficulty distribution: medium (1509), hard (849), very_hard (141)
- **V5 Source**: `MCQs/Final/ALL_QUESTIONS_V5_20260120.json`
- **V5 Backup**: `ALL_QUESTIONS_REMEDIATED_BACKUP_PRE_V5.json`

## V5 Migration (Phase 9) - In Progress

### New Database Fields
Add to Question model: `module`, `system`, `ageGroup`, `clinicalContext`, `questionType`, `imagingPhase`, `task`, `discriminatorUsed`

### Key Commands
```bash
# Run migration
npx prisma migrate dev --name add_v5_question_fields

# Import V5 questions
npx tsx scripts/importQuestions.ts

# Verify import
npx tsx scripts/verifyV5.ts
```

### Rollback
1. Restore `ALL_QUESTIONS_REMEDIATED_BACKUP_PRE_V5.json`
2. `npx prisma migrate reset`
3. Re-import original questions

## Development Commands
```bash
# Install dependencies (from root)
npm install

# Start development (both frontend and backend)
npm run dev

# Frontend only
npm run dev:frontend

# Backend only
npm run dev:backend

# Database
npx prisma migrate dev    # Run migrations
npx prisma studio         # Database GUI
npm run db:seed           # Seed questions

# Admin
npm run db:make-admin <email>  # Promote user to admin
```

## API Base URL
- Development: `http://localhost:3001/api/v1`
- Frontend dev server: `http://localhost:5173`

## Phase Overview
| Phase | Description | Status |
|-------|-------------|--------|
| 0 | Housekeeping & Setup Files | Complete |
| 1 | Project Structure & Tooling | Complete |
| 2 | Database Schema & Import | Complete |
| 3 | Exam Interface (Frontend) | Complete |
| 4 | Exam Engine (Backend API) | Complete |
| 5 | Results & Feedback | Complete |
| 6 | Authentication & Admin Panel | Complete |
| 7 | Payments/Stripe | Complete |
| 8 | Testing & Deployment | Complete |

## Deployment
See `DEPLOYMENT.md` for full deployment instructions to Render.com.

### Quick Deploy Commands
```bash
# Build for production
npm run build

# Run production build locally
npm run start

# Run load tests
npm run test:load

# Deploy database migrations (production)
npm run db:migrate:deploy
```
