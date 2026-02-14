# CoreTime Project Brief (for Design/PM Agent)

## Product Summary
CoreTime is a center-operations platform. It supports center owners and instructors with scheduling, member management, payroll/salary, finance, and settings. The UI is built with Next.js App Router and Mantine.

## Roles & Access
- OWNER / SYSTEM_ADMIN: full access to center management, payroll/salary, finance, and settings.
- INSTRUCTOR (staff): limited management access; focuses on schedule and members.
- Access is enforced via middleware (NextAuth JWT session). Public paths include `/login` and `/oauth/callback`.

## Information Architecture (from AppShell navigation)
Common:
- Dashboard (`/`)
- Members (`/members`, `/members/tickets`, `/members/consultations`)

Owner/System Admin:
- Schedule (`/schedule`, `/schedule/reservations`, `/schedule/attendance`)
- Instructors (`/center/instructors`, `/center/instructors?tab=management`)
- Salary (`/center/salary/overview`, `/settings`, `/payments`, `/budget`, `/reports`)
- Finance (`/finance/tickets`, `/finance/payments`, `/finance/stats`)
- Settings (`/settings`, `/settings/profile`)

Instructor:
- Schedule (limited)
- Settings

## Auth & Onboarding Flow (Key Screens)
- Login: `/login`
  - OAuth buttons: Kakao / Google.
  - Pending approval state handled via `state=pending` or `state=waiting_for_approval` query params.
  - If pending, show modal listing organizations (or fallback list by ID).
- Identity selection: `/identity`
  - Select role: OWNER or INSTRUCTOR.
  - Handles onboarding tokens (`state=onboarding`), persists `pendingRole` to sessionStorage.
- Registration flow:
  - `/register/profile` -> `/register/owner` or `/register/instructor`
  - Owner path can create/register center (`/register/create-center`).
  - Instructor path can request approval; shows pending modal and returns to `/login`.

## Design System & UI Baseline
- UI library: Mantine
- Theme defaults:
  - Primary color: `indigo`
  - Radius: `md` / `lg`
  - Font: Pretendard (headings + body)
- AppShell handles nav + role-based items.

## Known Pain Points (User Feedback)
- Social login buttons (Google/Kakao) not compliant with official specs.
- Current login feels AI-generated; needs senior human-crafted design quality.

## Design Constraints for Login Screen
- Must respect official Google/Kakao brand button specs (colors, icon sizing, padding, fonts).
- Avoid over-symmetry and generic visual clichés.
- Produce a polished, product-grade layout with strong hierarchy and whitespace.
- Keep mobile responsiveness and accessibility in mind.

## References in Codebase
- Login screen: `src/app/(auth)/login/page.tsx`
- Theme: `src/theme.ts`
- Layout: `src/components/layout/AppShell.tsx`
- Middleware (auth gates): `src/middleware.ts`
