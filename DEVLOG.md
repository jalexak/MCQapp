# FRCR 2A Exam Platform - Development Log

> **Purpose**: Comprehensive record of all work accomplished for team onboarding and collaboration.
> This log captures both macro-level (architectural decisions, phase completions) and micro-level (specific files, code changes) progress.

---

## Project Overview

**Goal**: Build a subscription-based MCQ exam simulation platform for FRCR 2A radiology exam preparation.

**Key Metrics**:
- 2,499 questions across 175 subtopics
- Difficulty distribution: medium (1509), hard (849), very_hard (141)
- Target: 500+ concurrent users

**Tech Stack**:
- Frontend: React + TypeScript + Vite + Tailwind CSS
- Backend: Node.js + Express + TypeScript
- Database: PostgreSQL + Prisma ORM
- Auth: JWT + bcrypt (Phase 6)
- Payments: Stripe (Phase 7)

---

## Session: 2026-01-19

### Phase 0: Housekeeping & Project Setup ✅

**Objective**: Create foundational project files for autonomous development workflow and team collaboration.

#### Accomplishments

| File | Purpose | Status |
|------|---------|--------|
| `CLAUDE.md` | Autonomous operation instructions for Claude Code sessions | ✅ Created |
| `PROGRESS.md` | Phase-by-phase task tracker with current status | ✅ Created |
| `DECISIONS.md` | Architecture Decision Records (ADRs) | ✅ Created |
| `DEVLOG.md` | This file - comprehensive accomplishment log | ✅ Created |
| `.claude/settings.local.json` | Claude Code permissions for npm/node commands | ✅ Created |
| `.env.example` | Environment variable template | ✅ Created |
| `.gitignore` | Git ignore patterns | ✅ Created |

#### Architecture Decisions Recorded (ADR)

1. **ADR-001**: Monorepo with npm workspaces (vs separate repos)
2. **ADR-002**: React + Vite over Next.js (SPA, no SSR needed)
3. **ADR-003**: PostgreSQL + Prisma (ACID compliance for payments)
4. **ADR-004**: MVP without auth (validate UX first)
5. **ADR-005**: Import all questions into PostgreSQL
6. **ADR-006**: Client-side timer with server validation
7. **ADR-007**: UK English spelling throughout

#### File Details

**CLAUDE.md** - Contains:
- Autonomous operation instructions (read PROGRESS.md → execute → update)
- Tech stack reference
- Directory structure
- Key constraints (UK spelling, 90s/question timer)
- Development commands

**PROGRESS.md** - Contains:
- Current phase indicator
- Next task pointer
- Phase progress table with status icons
- Task checklists per phase
- Session log

**DECISIONS.md** - Contains:
- 7 Architecture Decision Records
- Each with: Date, Decision, Rationale, Alternatives Considered

**.claude/settings.local.json** - Permissions for:
- npm, npx, node, pnpm commands
- prisma, tsx, tsc commands
- ls, mkdir, cat, git commands

**.env.example** - Templates for:
- Database URL (PostgreSQL)
- Backend port and environment
- Frontend API URL
- JWT configuration (Phase 6)
- Stripe keys (Phase 7)

**.gitignore** - Excludes:
- node_modules, dist, build
- .env files
- OS files (.DS_Store)
- IDE files
- Prisma generated files
- Test coverage

---

### Phase 1: Project Structure & Tooling ✅

**Objective**: Initialize monorepo, set up frontend/backend, configure database ORM.

#### Accomplishments

| File/Directory | Purpose | Status |
|----------------|---------|--------|
| `package.json` | Root workspace config with npm workspaces | ✅ Created |
| `tsconfig.json` | Shared TypeScript configuration | ✅ Created |
| `frontend/` | React + Vite + Tailwind CSS application | ✅ Created |
| `backend/` | Express + TypeScript API server | ✅ Created |
| `prisma/schema.prisma` | Database schema with all models | ✅ Created |
| `scripts/importQuestions.ts` | Question import script | ✅ Created |

#### Frontend Structure (`frontend/`)

| File | Purpose |
|------|---------|
| `package.json` | Dependencies: React 18, React Router, Tailwind |
| `vite.config.ts` | Vite config with API proxy to backend |
| `tsconfig.json` | TypeScript config for React |
| `tailwind.config.js` | Custom FRCR teal colour scheme |
| `postcss.config.js` | PostCSS with Tailwind |
| `index.html` | Entry HTML file |
| `src/main.tsx` | React app entry point |
| `src/App.tsx` | Main app with routing (placeholder pages) |
| `src/index.css` | Tailwind imports + custom exam styles |

**Key Features**:
- Custom `frcr-teal` colour palette matching official UI
- API proxy configured for `/api` routes
- React Router set up with exam and results routes
- Tailwind CSS with custom utility classes for exam UI

#### Backend Structure (`backend/`)

| File | Purpose |
|------|---------|
| `package.json` | Dependencies: Express, Prisma, Helmet, CORS, Zod |
| `tsconfig.json` | TypeScript config for Node.js |
| `src/app.ts` | Express app with middleware and routes |
| `src/index.ts` | Server entry point |

**Key Features**:
- Helmet for security headers
- CORS configured for frontend origin
- Health check endpoint at `/api/v1/health`
- Error handling middleware

#### Database Schema (`prisma/schema.prisma`)

**Models created**:

1. **User** (for Phase 6)
   - id, email, passwordHash, name
   - subscriptionStatus, subscriptionEnd
   - Relation to ExamSession

2. **Question**
   - id (from JSON), stem, options A-E
   - correctAnswer, explanation, explanationMatrix
   - subtopic, difficulty, modality, learningPoint
   - Indexes on subtopic, difficulty, modality

3. **ExamSession**
   - id, userId (nullable for MVP)
   - questionIds, totalQuestions
   - timeLimit, timeRemaining, answers (JSON)
   - score, percentage, status
   - Filters for subtopic and difficulty

4. **Subtopic**
   - name, questionCount, category
   - For filtering and analytics

#### Import Script (`scripts/importQuestions.ts`)

- Reads `ALL_QUESTIONS_REMEDIATED.json`
- Imports 2,499 questions in batches of 100
- Maps JSON structure to Prisma schema
- Populates Subtopic table with counts
- Prints summary with difficulty distribution

#### Development Commands

```bash
npm install          # Install all dependencies
npm run dev          # Start frontend + backend concurrently
npm run dev:frontend # Frontend only (port 5173)
npm run dev:backend  # Backend only (port 3001)
npm run db:migrate   # Run Prisma migrations
npm run db:seed      # Import questions
npm run db:studio    # Open Prisma Studio
```

---

## Upcoming: Phase 2 - Database Setup & Import

**Next tasks**:
1. Run `npm install` to install dependencies
2. Create `.env` file from `.env.example`
3. Set up PostgreSQL database
4. Run `npm run db:migrate` to create tables
5. Run `npm run db:seed` to import 2,499 questions

---

### UI Refinements from Testing Feedback ✅

**Objective**: Address issues identified during user testing of the exam interface.

#### Changes Made

| File | Change | Reason |
|------|--------|--------|
| `frontend/src/components/ExamHeader.tsx` | Removed "Exam Demo Video" link | Placeholder link not functional |
| `frontend/src/components/ExamHeader.tsx` | Removed exam ID badge (e.g., "8ad1c129") | Not meaningful to users |
| `frontend/src/components/NavigationBar.tsx` | Added `sticky bottom-0` to footer | Ensures nav buttons always visible |
| `frontend/src/components/QuestionSidebar.tsx` | Removed "Filter" button | Feature not yet implemented |
| `frontend/src/pages/ExamPage.tsx` | Removed `examId` prop from ExamHeader | Prop no longer needed |

#### Technical Details

- Cleaned up unused `examId` prop from ExamHeader interface
- All TypeScript compilation passes without errors
- No functional changes to exam logic, purely UI cleanup

---

## Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Set up environment
cp .env.example .env
# Edit .env with your PostgreSQL database URL

# 3. Set up database
npx prisma migrate dev
npm run db:seed

# 4. Start the platform
npm run dev

# 5. Open browser
# http://localhost:5173
```

## To Verify UI Fixes (2026-01-19)

After starting an exam, confirm:
- [x] No "Exam Demo Video" link in header
- [x] No cryptic ID badge (e.g., "8ad1c129") in header
- [x] No "Filter" button in the left sidebar
- [x] Navigation buttons stay visible at bottom when scrolling

---

### Additional UI Fixes (2026-01-19) ✅

**Objective**: Fix navigation visibility, remove placeholder elements, add sidebar filtering.

#### Changes Made

| File | Change | Reason |
|------|--------|--------|
| `frontend/src/pages/ExamPage.tsx` | Changed `min-h-screen` to `h-screen` | Lock container to viewport so nav buttons visible without scrolling |
| `frontend/src/components/NavigationBar.tsx` | Removed speech bubble feedback button and empty balancing div | Non-functional placeholder |
| `frontend/src/components/NavigationBar.tsx` | Changed `justify-between` to `justify-center` | Centre navigation buttons |
| `frontend/src/components/QuestionSidebar.tsx` | Widened from `w-16` to `w-24` | Text was cut off |
| `frontend/src/components/QuestionSidebar.tsx` | Added filter state and clickable legend | Legend items now filter question list |

#### Technical Details

- Added `FilterType = 'all' | 'answered' | 'flagged'` type
- Legend items ("All", "Answered", "Flagged") are now buttons that set the active filter
- Active filter highlighted with background colour and bold text
- Questions filtered to show only matching status
- Current question always shows when "Answered" filter active

#### To Verify

After starting an exam:
- [ ] Back/Next buttons visible without scrolling
- [ ] No speech bubble icon in navigation bar
- [ ] Sidebar text fully visible (wider sidebar)
- [ ] Clicking "Answered" shows only answered questions
- [ ] Clicking "Flagged" shows only flagged questions
- [ ] Clicking "All" shows all questions

---

## How to Use This Log

### For New Team Members
1. Read this file top-to-bottom for project context
2. Check `PROGRESS.md` for current status and next task
3. Review `DECISIONS.md` for architectural context
4. See `CLAUDE.md` for development workflow

### For Continuing Work
1. Check the latest session entry for recent changes
2. Note any pending items or blockers
3. Add your own session entry when you make changes

### Entry Format
When adding entries, include:
- **Date and session identifier**
- **Phase and objective**
- **Accomplishments table** (file, purpose, status)
- **Detailed notes** on what was done and why
- **Upcoming tasks** preview

---

### Phase 5: Relative Performance Ranking Feature (2026-01-19) ✅

**Objective**: Implement difficulty-weighted relative ranking system that compares candidates fairly across different random question sets.

#### Algorithm Overview

The ranking system uses real candidate performance data (not predefined difficulty labels):

1. **Question Difficulty**: Calculated from actual success rate across all completed exams
2. **Scoring Formula**:
   - Correct answer: `+(1 - successRate)` — harder questions worth more
   - Wrong answer: `-(successRate)` — easier questions penalise more
3. **Percentile**: Compare relative score against all other candidates

#### Files Created

| File | Purpose | Status |
|------|---------|--------|
| `backend/src/services/statsService.ts` | Ranking calculations, question stats | ✅ Created |
| `backend/src/controllers/statsController.ts` | HTTP handlers for stats endpoints | ✅ Created |
| `backend/src/routes/statsRoutes.ts` | API route definitions | ✅ Created |
| `frontend/src/pages/ResultsPage.tsx` | Full results page with ranking display | ✅ Created |
| `frontend/src/pages/FAQPage.tsx` | FAQ page with ranking explanation | ✅ Created |

#### Files Modified

| File | Change |
|------|--------|
| `backend/src/app.ts` | Added stats routes (`/api/v1/stats`) |
| `backend/src/services/index.ts` | Export statsService |
| `backend/src/controllers/index.ts` | Export statsController |
| `backend/src/routes/index.ts` | Export statsRoutes |
| `frontend/src/api/client.ts` | Added stats API types and functions |
| `frontend/src/pages/index.ts` | Export ResultsPage, FAQPage |
| `frontend/src/App.tsx` | Added `/faq` route, imported new pages |

#### API Endpoints

```
GET /api/v1/stats/question/:questionId
Response: { questionId, totalAttempts, correctCount, difficultyRate }

GET /api/v1/stats/ranking/:sessionId
Response: { relativeScore, percentile, totalCandidates, rank }
```

#### statsService.ts Functions

| Function | Purpose |
|----------|---------|
| `getQuestionStats(questionId)` | Get attempts/success rate for one question |
| `getQuestionStatsMultiple(questionIds)` | Batch operation for efficiency |
| `calculateRelativeScore(sessionId)` | Compute difficulty-weighted score |
| `getRanking(sessionId)` | Get percentile, rank, total candidates |

#### ResultsPage Features

- Score card with pass/fail indicator (70% threshold)
- Relative performance card showing:
  - Percentile (e.g., "80th")
  - Rank (e.g., "#5 of 100")
  - Relative score (positive/negative)
  - Total candidates
- Time analysis (taken vs allowed)
- Performance by difficulty (progress bars)
- Performance by subtopic (sorted by score)
- Link to FAQ for ranking explanation

#### FAQPage Content

- Detailed explanation of ranking algorithm
- Example scoring table with calculations
- Other platform FAQs (pass mark, question count, etc.)

#### To Verify

After completing multiple exams:
- [ ] Ranking data appears on results page
- [ ] Percentile updates as more exams are completed
- [ ] FAQ page accessible and explains algorithm
- [ ] Different users get different rankings based on performance

---

### Phase 5: Explanation Matrix in Question Review (2026-01-19) ✅

**Objective**: Display per-option explanation data from the explanation matrix in the Question Review mode.

#### Background

The question data contains an `explanationMatrix` field with detailed explanations for each answer option:
- `supports`: Reasons why this option is correct/supported
- `excludes`: What this option rules out
- `why_not_best`: Why this option isn't the best answer (for incorrect options)

This data was already returned by the API but not displayed in the UI.

#### Files Modified

| File | Change |
|------|--------|
| `frontend/src/api/client.ts` | Added `OptionExplanation` and `ExplanationMatrix` interfaces; typed `explanationMatrix` properly |
| `frontend/src/components/QuestionReview.tsx` | Added explanation matrix display below each answer option |

#### Implementation Details

**Type Definitions** (`api/client.ts`):
```typescript
export interface OptionExplanation {
  supports: string[]
  excludes: string[]
  why_not_best: string[]
}

export interface ExplanationMatrix {
  A?: OptionExplanation
  B?: OptionExplanation
  C?: OptionExplanation
  D?: OptionExplanation
  E?: OptionExplanation
}
```

**UI Changes** (`QuestionReview.tsx`):
- Extracts `explanationMatrix` from question data
- Passes option-specific explanation to each `ReviewOption` component
- Displays `supports` array items in green text (for correct answers)
- Displays `why_not_best` array items in grey text (for wrong answers)
- Left border creates visual hierarchy (green for correct, grey for others)
- Only shows explanations if arrays have non-empty content

#### To Verify

After completing an exam and entering review mode:
- [ ] Correct answer shows green "supports" text below option
- [ ] Wrong options show grey "why_not_best" text below option
- [ ] Left border visually connects explanation to option
- [ ] Empty explanations don't show (no empty boxes)

---

---

## Session: 2026-01-20

### Phase 6: Authentication & Admin Panel ✅

**Objective**: Implement user authentication with JWT/bcrypt and build comprehensive admin panel for platform management.

#### Database Schema Changes

**Migration**: `add_auth_roles_tokens`

| Model | Purpose |
|-------|---------|
| `UserRole` enum | Role values: `user`, `admin` |
| `User.role` field | Added role field with default `user` |
| `PasswordResetToken` | Token-based password recovery |
| `RefreshToken` | Long-lived tokens for session management |

#### Backend Files Created

| File | Purpose |
|------|---------|
| `backend/src/types/auth.ts` | Zod schemas, JWT payload types, auth interfaces |
| `backend/src/services/authService.ts` | JWT generation, bcrypt hashing, token CRUD |
| `backend/src/controllers/authController.ts` | Register, login, logout, password reset handlers |
| `backend/src/middleware/authMiddleware.ts` | JWT verification, optional auth |
| `backend/src/routes/authRoutes.ts` | Auth API routes |
| `backend/src/services/adminService.ts` | Question/user CRUD, analytics queries |
| `backend/src/controllers/adminController.ts` | Admin endpoint handlers |
| `backend/src/middleware/adminMiddleware.ts` | Admin role verification |
| `backend/src/routes/adminRoutes.ts` | Admin API routes |
| `scripts/makeAdmin.ts` | CLI tool to promote users to admin |

#### Backend Files Modified

| File | Change |
|------|--------|
| `backend/src/app.ts` | Added auth and admin routes |
| `backend/src/types/index.ts` | Export auth types |
| `backend/src/services/index.ts` | Export auth/admin services |
| `backend/src/controllers/index.ts` | Export auth/admin controllers |
| `backend/src/routes/index.ts` | Export auth/admin routes |

#### Frontend Files Created

| File | Purpose |
|------|---------|
| `frontend/src/contexts/AuthContext.tsx` | Auth state, token management, login/logout functions |
| `frontend/src/components/ProtectedRoute.tsx` | Route protection with admin support |
| `frontend/src/pages/LoginPage.tsx` | User login form |
| `frontend/src/pages/RegisterPage.tsx` | User registration form |
| `frontend/src/pages/ForgotPasswordPage.tsx` | Password reset request |
| `frontend/src/components/admin/AdminLayout.tsx` | Admin navigation sidebar and header |
| `frontend/src/components/admin/QuestionEditor.tsx` | Question create/edit modal |
| `frontend/src/pages/admin/AdminDashboard.tsx` | Overview statistics cards |
| `frontend/src/pages/admin/QuestionManagement.tsx` | Question CRUD with search/pagination |
| `frontend/src/pages/admin/UserManagement.tsx` | User list, edit, delete |
| `frontend/src/pages/admin/Analytics.tsx` | Exam and question analytics |

#### Frontend Files Modified

| File | Change |
|------|--------|
| `frontend/src/main.tsx` | Wrapped app with AuthProvider |
| `frontend/src/App.tsx` | Added all routes, header with auth state |
| `frontend/src/pages/index.ts` | Export all new pages |

#### API Endpoints

**Auth Routes** (`/api/v1/auth`):
```
POST /register      - Create new user account
POST /login         - Authenticate and get tokens
POST /refresh       - Refresh access token
POST /logout        - Invalidate refresh token
POST /forgot-password - Request password reset
POST /reset-password  - Reset with token
GET  /me            - Get current user (protected)
```

**Admin Routes** (`/api/v1/admin`):
```
# Questions
GET    /questions          - List with pagination/filters
GET    /questions/:id      - Get single question
POST   /questions          - Create question
PUT    /questions/:id      - Update question
DELETE /questions/:id      - Delete question
POST   /questions/import   - Bulk import

# Users
GET    /users              - List with pagination/filters
GET    /users/:id          - Get user details + recent exams
PUT    /users/:id          - Update user (name, role, subscription)
DELETE /users/:id          - Delete user

# Analytics
GET    /analytics/overview  - Dashboard stats
GET    /analytics/exams     - Exam statistics
GET    /analytics/questions - Question performance
```

#### Security Features

- **Password Hashing**: bcrypt with 12 salt rounds
- **Access Tokens**: 15-minute expiry, JWT signed
- **Refresh Tokens**: 7-day expiry, stored in database
- **Password Reset**: 1-hour expiry tokens, one-time use
- **Role Protection**: Admin middleware checks user.role

#### Admin Dashboard Features

1. **Overview Stats**: Total users, questions, exams, average score
2. **Recent Exams**: Table with score, completion time
3. **Question Management**: Search, filter by difficulty/subtopic, CRUD
4. **User Management**: View exam history, change roles, subscriptions
5. **Analytics**: Score distribution, hardest questions, subtopic performance

#### Development Commands

```bash
# Promote user to admin
npm run db:make-admin user@example.com
```

#### To Verify

After implementation:
- [ ] Register new user at `/register`
- [ ] Login at `/login`
- [ ] Homepage shows user email and logout button
- [ ] Promote to admin: `npm run db:make-admin <email>`
- [ ] Admin Panel link appears in header
- [ ] Access `/admin` dashboard
- [ ] CRUD operations on questions
- [ ] View and edit users
- [ ] Analytics display correctly

---

## Upcoming: Phase 7 - Stripe Payments

**Next tasks**:
1. Set up Stripe account and API keys
2. Create subscription products/prices in Stripe
3. Implement checkout session creation
4. Add webhook handler for subscription events
5. Gate exam access based on subscription status

---

## Session: 2026-01-28

### Phase 9: V5 Question Migration 🔄

**Objective**: Update Platform to use V5 questions with new metadata fields, deduplication, and corrected answers.

#### Background

The Platform was using `ALL_QUESTIONS_REMEDIATED.json` from Jan 13 (pre-V5). The V5 version from Jan 24 includes:
- **154 corrected answers** - significant accuracy improvement
- **8 new metadata fields** - for enhanced filtering and analytics
- **Gate 8 curriculum scope compliance** - 23 questions reframed

#### V5 Source File
- Path: `MCQs/Final/ALL_QUESTIONS_V5_20260120.json`
- Questions: 2,499
- Remediated: 2026-01-24T05:37:43
- Note: "Gate 8 curriculum scope compliance - reframed 23 questions from classification assignment to feature recognition"

#### New Database Fields (8 total)

| Field | Type | Purpose | Example Values |
|-------|------|---------|----------------|
| `module` | String? | Medical specialty | CARDIOTHORACIC, MSK, GI, GU, PAEDIATRIC, CNS |
| `system` | String? | Body system | cardiovascular_thoracic, gastrointestinal |
| `ageGroup` | String? | Patient age category | adult, paediatric, neonatal |
| `clinicalContext` | String? | Clinical scenario type | emergency, diagnostic, staging |
| `questionType` | String? | Question classification | anatomy, diagnosis, differential |
| `imagingPhase` | String? | Imaging timing | arterial, portal_venous, delayed |
| `task` | String? | Task type | diagnosis, finding_interpretation |
| `discriminatorUsed` | String? | Key differentiating feature | Free text |

#### Files to Modify

**Database**:
- `prisma/schema.prisma` - Add 8 new fields + indexes

**Import Script**:
- `scripts/importQuestions.ts` - V5 format, dedup, new field mapping

**Backend**:
- `backend/src/types/exam.ts` - QuestionResponse, QuestionResult interfaces
- `backend/src/services/questionService.ts` - Select statements
- `backend/src/services/adminService.ts` - Zod schemas, createQuestion

**Frontend**:
- `frontend/src/types/exam.ts` - Question interface
- `frontend/src/api/client.ts` - Question, QuestionResult interfaces
- `frontend/src/components/admin/QuestionEditor.tsx` - Form fields

#### Rollback Plan

If issues occur:
1. Restore `ALL_QUESTIONS_REMEDIATED_BACKUP_PRE_V5.json`
2. `npx prisma migrate reset` if needed
3. Re-import original questions

#### Success Criteria

- [ ] 2,499 unique questions in database
- [ ] All V5 fields populated
- [ ] No duplicate questions
- [ ] Platform starts without errors
- [ ] Exam flow works end-to-end
- [ ] Admin panel shows V5 fields

#### Implementation Progress (2026-01-28)

| Task | Status | Notes |
|------|--------|-------|
| Create backup script | ✅ Done | `scripts/backupDatabase.ts` |
| Update Prisma schema | ✅ Done | Added 8 new fields + indexes |
| Regenerate Prisma client | ✅ Done | `npx prisma generate` |
| Update import script | ✅ Done | V5 format, deduplication, new fields |
| Update backend types | ✅ Done | exam.ts, questionService.ts, adminService.ts |
| Update frontend types | ✅ Done | exam.ts, client.ts |
| Update QuestionEditor | ✅ Done | Added V5 metadata form fields |
| Create verification script | ✅ Done | `scripts/verifyV5.ts` |
| Run migration | ⏳ Pending | Requires PostgreSQL running |
| Import questions | ⏳ Pending | Run after migration |
| End-to-end test | ⏳ Pending | Run after import |

#### Files Modified

**New Files:**
- `scripts/backupDatabase.ts` - Database state backup
- `scripts/verifyV5.ts` - V5 import verification

**Schema:**
- `prisma/schema.prisma` - Added 8 V5 fields to Question model

**Backend:**
- `backend/src/types/exam.ts` - QuestionResponse, QuestionResult interfaces
- `backend/src/services/questionService.ts` - Select statements
- `backend/src/services/adminService.ts` - Zod schemas, createQuestion

**Frontend:**
- `frontend/src/types/exam.ts` - Question interface
- `frontend/src/api/client.ts` - Question, QuestionResult interfaces
- `frontend/src/components/admin/QuestionEditor.tsx` - V5 metadata form

**Import Script:**
- `scripts/importQuestions.ts` - V5 format, deduplication, field mapping

#### To Complete Migration

When PostgreSQL is available:

```bash
cd "/Volumes/Internal/Dropbox/Claudecode/MCQ website/Platform"

# 1. Run database migration
npx prisma migrate dev --name add_v5_question_fields

# 2. Import V5 questions
npm run db:import

# 3. Verify import
npm run db:verify

# 4. Test platform
npm run dev
```
