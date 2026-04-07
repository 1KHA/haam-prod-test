# Progress: Accelerator & Incubator Management Platform

*Last Updated: 2026-04-07*

## What Works ✅

### Core Infrastructure
- ✅ **Next.js Application**: App router structure
- ✅ **Database**: Prisma ORM with SQLite database
- ✅ **Authentication**: JWT-based auth (`lib/auth.ts`) — custom, NOT NextAuth
- ✅ **Authorization**: RBAC framework (`lib/permissions.ts`)
- ✅ **UI Framework**: Tailwind CSS with shadcn/ui components
- ✅ **Localization**: Arabic language support with RTL layout
- ✅ **Build**: TypeScript compilation succeeds (ESLint warnings exist but non-blocking)

### RBAC System
- ✅ **Database Models**: Role, Permission, RolePermission in schema
- ✅ **Permission Seeding**: `prisma/seed-roles.ts` seeds 5 valid roles
- ✅ **Permission Library**: `lib/permissions.ts` — `checkPermission()`, `getUserPermissions()`, `getRoleNameInArabic()`
- ✅ **Frontend Hook**: `usePermissions()` hook with caching
- ✅ **RouteGuard**: Component in `components/auth/RouteGuard.tsx`
- ✅ **Entrepreneur Dashboard**: Only dashboard with proper RouteGuard protection
- ❌ **Other Dashboards**: Admin, PM, mentor, investor layouts have NO route guards

### Admin Dashboard
- ✅ **User Management**: List, create, edit, delete users (`/admin-dashboard/users/`)
- ✅ **Role Management**: Change user roles
- ✅ **Programs Management**: Full CRUD, filters, bulk actions, CSV export (`/admin-dashboard/programs/`)
- ✅ **Cohort Management**: Tab fixed, API created, UI pages created (`/admin-dashboard/programs/[id]/cohorts/`)
- ✅ **Events Management**: Full CRUD, registrations (`/admin-dashboard/events/`)
- ✅ **Startups Management**: List, filter, bulk actions (`/admin-dashboard/startups/`)
- ✅ **Payments Management**: Full CRUD with filtering and export
- ✅ **Logout**: signOut handler wired to all dashboard headers
- ❌ **Main Dashboard Stats**: Hardcoded (1,234 users etc.) — no real API
- ❌ **Notifications Page**: Mock data, needs real API
- ❌ **Reports Page**: Mock data, needs real API
- ❌ **Dashboard Route Guard**: Admin layout has no auth check

### Program Manager Dashboard
- ✅ **Events**: All PM event pages functional (page, create, edit, details, registrations)
- ✅ **Cohorts**: Fixed — filter values, missing pages, API validation. Members and mentors pages created.
- ❌ **Applications**: Not implemented
- ❌ **Milestone Tracking**: Not implemented

### Entrepreneur Dashboard
- ✅ **Events Detail Page**: `/entrepreneur-dashboard/events/[id]/` working
- ✅ **RouteGuard**: Properly protected
- ❌ **Events List Page**: Has hardcoded fallback data + eventType filter mismatch (Arabic vs English values)

### Other Dashboards (Mentor, Investor)
- ✅ **Basic Structure**: Layout and navigation
- ❌ **Route Guards**: No auth protection
- ❌ **Features**: Not implemented

## Known Bugs / Issues

### Critical Auth Issues
1. **Mock Auth in auth-context.tsx**: `contexts/auth-context.tsx` still uses hardcoded MOCK_USERS. Real sign-in with DB users may not work properly. Role types are wrong (`"admin" | "provider" | "beneficiary"` instead of Prisma enum values).
2. **Sign-in Routing Broken**: Only ENTREPRENEUR routing works (coincidentally). ADMIN, PROGRAM_MANAGER, MENTOR, INVESTOR don't route correctly after sign-in.
3. **No Dashboard Protection**: Admin, PM, mentor, investor dashboards accessible by any authenticated user via URL.
4. **User Creation Role Bug**: Admin-created users with Arabic role names fall back to PARTICIPANT due to enum mismatch.

### TypeScript Errors (46 total)
| Category | Count | Status |
|----------|-------|--------|
| fetchWithAuth union type (6 event pages) | 29 | Pending |
| EventRegistration schema mismatch | 5 | Pending |
| ReportShare/Notification field mismatch | 3 | Pending |
| Missing SystemBackup model | 1 | Pending |
| next-auth import + fundingType field + implicit any | 6 | Pending |
| DialogClose asChild + securityLogs ids | 2 | Pending |

### Permission System Issues
1. **Dual Role System**: `UserRole` enum and `Role` DB table with no FK — bridged by fragile hardcoded Arabic name map
2. **Silent Permission Failures**: `getUserPermissions()` returns empty array on all failures with no logging
3. **Custom Roles**: STARTUP, JUDGE (removed), ACCELERATOR had no Arabic name mapping

### Data Issues
1. **SQLite Case-Insensitive Search**: `mode: 'insensitive'` in Prisma throws 500 on SQLite (PostgreSQL required)
2. **Profile Cleanup on Role Change**: Editing a user's role creates new profile but doesn't delete old one

## Completed Tasks (Tracked in newtasks/)

| Task | Description | Status |
|------|-------------|--------|
| task-01 (events-page) | Admin events page | ✅ Complete |
| task-07 (admin-events-import) | Fix duplicate import | ⬜ Pending |
| task-08 (startups-end-to-end) | Startups E2E | ✅ Complete |
| task-09 (programs-test-report) | Programs API 79 tests + permission bug fix | ✅ Complete |
| task-10 (judge-removal) | Judge role fully removed | ✅ Complete |
| task-11 (pm-cohorts-end-to-end) | PM cohorts fixed | ✅ Complete |
| task-17 (admin-cohort-tab-fix) | Tab label + content fixed | ✅ Complete |
| task-18 (admin-cohort-api) | Admin cohorts API created | ✅ Complete |
| task-19 (admin-cohort-ui) | Admin cohorts UI pages created | ✅ Complete |
| task-20 (milestones-shared-platform) | `MilestoneResponse` model, `lib/milestones.ts` shared utils, Prisma migration | ✅ Complete |
| task-21 (milestones-manager-admin) | `/api/program-manager/milestones`, `/api/admin/milestones`, live PM milestone dashboard, admin milestone page + sidebar, real progress in PM startup APIs | ✅ Complete |
| task-22 (milestones-entrepreneur-flow) | Entrepreneur can only view + respond (no CRUD), response/file submission APIs, rebuilt milestone detail UI | ✅ Complete |
| task-01 (fix-auth-context-roles) | Fix mock auth | ⬜ Pending |
| task-02 (fix-signin-routing) | Fix dashboard routing | ⬜ Pending |
| task-03 (fix-user-creation) | Fix role assignment on create | ⬜ Pending |
| task-04 (dashboard-route-guards) | Add guards to all dashboards | ⬜ Pending |
| task-05 (unify-role-system) | Add roleEnum FK to Role table | ⬜ Pending |
| task-06 (permission-lookup-logging) | Add debug logging | ⬜ Pending |
| task-07 (fix-edit-user-roles) | Delete old profile on role change | ⬜ Pending |
| task-11 (fetchWithAuth-types) | Fix 29 TS type errors | ⬜ Pending |
| task-12 (event-registration-schema) | Fix EventRegistration schema | ⬜ Pending |
| task-13 (report-share-schema) | Fix ReportShare/Notification fields | ⬜ Pending |
| task-14 (system-backup-stub) | Stub restore endpoint | ⬜ Pending |
| task-15 (funding-api-issues) | Fix next-auth import + fundingType | ⬜ Pending |
| task-16 (ui-component-props) | Fix DialogClose + securityLogs | ⬜ Pending |

## Architecture Overview

### Tech Stack
- **Framework**: Next.js (App Router)
- **Database**: Prisma ORM + SQLite (dev) → PostgreSQL (prod)
- **Auth**: Custom JWT (`lib/auth.ts`) — NOT NextAuth
- **UI**: shadcn/ui + Tailwind CSS
- **Language**: TypeScript + Arabic RTL

### Valid User Roles (5 total)
1. ADMIN → `/admin-dashboard`
2. PROGRAM_MANAGER → `/program-manager-dashboard`
3. MENTOR → `/mentor-dashboard`
4. INVESTOR → `/investor-dashboard`
5. ENTREPRENEUR → `/entrepreneur-dashboard`

### Key Files
- Auth: `lib/auth.ts`, `contexts/auth-context.tsx`
- Permissions: `lib/permissions.ts`, `components/auth/RouteGuard.tsx`
- API Client: `lib/api-client.ts` (`fetchWithAuth`)
- DB Schema: `prisma/schema.prisma`
- Role Seeds: `prisma/seed-roles.ts`

### API Pattern
All admin API routes should use `checkPermission()` from `lib/permissions.ts`:
```typescript
const permissionCheck = await checkPermission(req, { category: 'resource', action: 'view' });
if (!permissionCheck.authorized) return NextResponse.json({ error: '...' }, { status: 403 });
```

### Test Infrastructure
Test files in `newtests/` — run with `node newtests/test-*.js`. No Jest/Vitest setup, custom HTTP test scripts against running dev server.
