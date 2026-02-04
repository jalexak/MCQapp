# Architecture Decisions

## ADR-001: Monorepo with npm Workspaces
**Date**: 2026-01-19
**Decision**: Use npm workspaces for frontend/backend in single repo
**Rationale**: Simpler deployment, shared types, easier local dev
**Alternatives Considered**: Separate repos, Turborepo, Nx

## ADR-002: React + Vite over Next.js
**Date**: 2026-01-19
**Decision**: Use Vite with React SPA
**Rationale**: Simpler architecture for exam app, no SSR needed, faster dev builds
**Alternatives Considered**: Next.js, Create React App

## ADR-003: PostgreSQL + Prisma
**Date**: 2026-01-19
**Decision**: PostgreSQL with Prisma ORM
**Rationale**: ACID compliance for payments, strong typing, easy migrations
**Alternatives Considered**: MongoDB, SQLite, Drizzle ORM

## ADR-004: MVP Without Auth
**Date**: 2026-01-19
**Decision**: Build exam simulation first, add auth in Phase 6
**Rationale**: Validate core UX before adding complexity

## ADR-005: Question Storage Strategy
**Date**: 2026-01-19
**Decision**: Import all 2,499 questions into PostgreSQL
**Rationale**: Enables efficient querying by subtopic/difficulty, supports future analytics
**Source Data**: ALL_QUESTIONS_REMEDIATED.json

## ADR-006: Exam Timer Implementation
**Date**: 2026-01-19
**Decision**: Client-side timer with server-side validation
**Rationale**: Responsive UX, server validates completion time on submit
**Duration**: 90 seconds per question (configurable)

## ADR-007: UK English Spelling
**Date**: 2026-01-19
**Decision**: Use UK spelling throughout (tumour, colour, haemorrhage)
**Rationale**: FRCR is a UK qualification, consistency with source material

## ADR-008: JWT with Refresh Tokens
**Date**: 2026-01-20
**Decision**: Use short-lived access tokens (15min) with long-lived refresh tokens (7 days)
**Rationale**: Balances security (short access token exposure) with UX (no frequent re-login)
**Alternatives Considered**: Session-based auth, OAuth providers, longer access tokens

## ADR-009: bcrypt for Password Hashing
**Date**: 2026-01-20
**Decision**: Use bcrypt with 12 salt rounds
**Rationale**: Industry standard, adaptive work factor, well-audited library
**Alternatives Considered**: Argon2, scrypt, PBKDF2

## ADR-010: Role-Based Access Control
**Date**: 2026-01-20
**Decision**: Simple enum-based roles (user, admin) stored in User model
**Rationale**: Sufficient for current requirements, easy to extend later
**Alternatives Considered**: Permission-based system, RBAC with separate roles table

## ADR-011: Admin Panel as SPA Routes
**Date**: 2026-01-20
**Decision**: Admin panel as protected routes in same React SPA (not separate app)
**Rationale**: Code reuse, simpler deployment, shared auth context
**Alternatives Considered**: Separate admin app, Next.js dashboard, third-party admin (Retool)
