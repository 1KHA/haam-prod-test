# Active Context: Accelerator & Incubator Management Platform

## Current Work Focus (as of 2026-04-07)

### Recent Completions
1. ✅ **Judge Role Removal** — Removed JUDGE from Prisma schema, seed scripts, auth context, and UI. Platform now has exactly 5 roles: ADMIN, PROGRAM_MANAGER, MENTOR, INVESTOR, ENTREPRENEUR.
2. ✅ **Event System End-to-End** — PM and Admin event pages verified working. Fixed PM event pages to use top-level `fetchWithAuth` import. Fixed capacity field to optional in schema. Fixed cancelled status filter bug in PM events API.
3. ✅ **Startups End-to-End** — Admin, PM, and Entrepreneur startup pages verified working.
4. ✅ **Admin Programs API** — 79 tests passing. Fixed critical bug: hardcoded `user.role === ADMIN` checks replaced with proper `checkPermission()` in `app/api/admin/programs/[id]/route.ts`.
5. ✅ **Program Manager Cohorts Fix** — Fixed filter value mismatch ("ALL" sent to backend), added missing pages (edit, members, mentors), enhanced API validation.
6. ✅ **Logout Fix** — Added `signOut` handler to all dashboard Header components (previously only entrepreneur dashboard had it working).
7. ✅ **Admin Cohort Management (Tasks 17-19)** — Tab label fixed ("المدفوعات" → "الدفعات"), cohort tab content replaced, admin cohorts API created, UI pages created.
8. ✅ **Milestone Ownership Model (Tasks 20-22)** — Milestones moved to correct ownership: PM creates/manages, admin monitors, entrepreneur views and responds only.
   - Task 20: Added `MilestoneResponse` Prisma model, `lib/milestones.ts` shared utilities, normalized status from due date + progress, derived startup progress from live milestone data.
   - Task 21: Created `/api/program-manager/milestones` and `/api/admin/milestones`, replaced hardcoded PM milestone dashboard with live data, added admin milestone dashboard + sidebar entry, replaced mock progress in PM startup APIs.
   - Task 22: Removed entrepreneur milestone CRUD, added response submission API (text + optional file), rebuilt entrepreneur milestone detail UI around submissions, replaced mock milestone cards in entrepreneur startup detail page.

### RBAC Issues Identified (Documented in analyze/)

#### Critical Issues (Not Yet Fixed)
1. **Auth Context Mock Users** (`contexts/auth-context.tsx`) — Still uses mock users (`admin@haam.com`, `provider@haam.com`, `beneficiary@haam.com`) with wrong role types (`"admin" | "provider" | "beneficiary"` instead of Prisma enum). Sign-in calls no real API. Task: task-01-fix-auth-context-roles.md.
2. **Dashboard Routing Mismatch** — Auth context routes `admin` → not matched (should be `ADMIN`), `provider` → `/dashboard` (doesn't exist). PROGRAM_MANAGER, MENTOR, INVESTOR, PARTICIPANT have no routing. Task: task-02-fix-signin-dashboard-routing.md.
3. **Dashboard Route Guards Missing** — Only `entrepreneur-dashboard` has `RouteGuard`. Admin, investor, PM, mentor, participant dashboards have no auth or role checks. Task: task-04-add-dashboard-route-guards.md.
4. **User Creation Role Assignment Broken** — New user form sends Arabic role names to API, API expects enum values → all custom/Arabic roles fall back to PARTICIPANT. No Role record created on user creation. Task: task-03-fix-user-creation-role-assignment.md.
5. **Dual Role System** — Two parallel role systems (UserRole enum + Role DB table) with no FK link. Bridged only by fragile hardcoded Arabic name mapping in `lib/permissions.ts`. Task: task-05-unify-role-system.md.
6. **Permission Lookup Fragility** — `getUserPermissions()` has 4 fallback strategies but all fail silently, returning empty array with no logging. Task: task-06-fix-permission-lookup-logging.md.
7. **Edit User Role Display** — `[id]/edit/page.tsx` now fetches from `/api/admin/roles`, but role change doesn't delete old role-specific profile. Task: task-07-fix-edit-user-roles.md.

### TypeScript Issues Identified (Documented in analyze/)

| Issue | File(s) | Errors | Status |
|-------|---------|--------|--------|
| `fetchWithAuth` union type | 6 event pages | 29 | Pending (task-11) |
| EventRegistration schema mismatch | 2 API routes | 5 | Pending (task-12) |
| ReportShare/Notification schema | reports/share route | 3 | Pending (task-13) |
| Missing SystemBackup model | system/restore route | 1 | Pending (task-14) |
| `next-auth` + fundingType field | 2 funding routes | 6 | Pending (task-15) |
| DialogClose `asChild` + securityLogs `ids` | 2 pages | 2 | Pending (task-16) |

### Admin Dashboard Pages Status

| Page | Status |
|------|--------|
| `admin-dashboard/events/` | ✅ Working |
| `admin-dashboard/users/` | ✅ Working |
| `admin-dashboard/programs/` | ✅ Working |
| `admin-dashboard/programs/[id]/cohorts/` | ✅ Implemented (Tasks 17-19) |
| `admin-dashboard/startups/` | ✅ Working |
| `admin-dashboard/payments/` | ✅ Working |
| `admin-dashboard/notifications/` | ⬜ Pending mock data fix (task-02) |
| `admin-dashboard/reports/` | ⬜ Pending mock data fix (task-03) |
| `admin-dashboard/page.tsx` (main stats) | ⬜ Hardcoded stats, no real API |
| `entrepreneur-dashboard/events/` | ⬜ Has hardcoded fallback + eventType filter mismatch (task-06) |
| `admin-dashboard/events/page.tsx` | ⬜ Duplicate import pattern (task-07) |

## Next Steps (Priority Order)

### High Priority
1. **Fix auth-context.tsx** (task-01) — Remove mock users, connect to real `/api/auth/signin` API, fix role types
2. **Fix sign-in routing** (task-02) — Map ADMIN/PROGRAM_MANAGER/etc. to correct dashboards
3. **Fix user creation role assignment** (task-03) — Send enum values, create Role record on user creation
4. **Add dashboard route guards** (task-04) — Apply RouteGuard to admin, PM, mentor, investor layouts
5. **Fix TypeScript errors** (tasks 11-16) — 46 total TypeScript errors identified

### Medium Priority
6. **Unify role system** (task-05) — Add `roleEnum` FK to Role table
7. **Add permission lookup logging** (task-06) — Debug silent failures
8. **Fix edit user role** (task-07) — Delete old profile before creating new one
9. **Fix entrepreneur events page** (task-06-events) — Remove hardcoded fallback, fix eventType filter
10. **Fix main dashboard stats** — Replace hardcoded numbers with real API

### Low Priority
11. **Fix notifications page** (task-02-notifications) — Connect to real API
12. **Fix reports page** (task-03-reports) — Connect to real API
13. **Simplify registration flow** (task-10) — Remove hackathon path, ENTREPRENEUR only

### Milestone Follow-ups (from README-milestone-fix.md)
- Add manager review status for milestone responses (PM can approve/reject entrepreneur submissions)
- Add notifications when entrepreneurs submit milestone replies
- Add milestone details into admin startup detail page for inline oversight

## Important Patterns and Preferences

### Code Patterns
1. **API Route Pattern**:
   ```typescript
   export async function GET(req: NextRequest) {
     const permissionCheck = await checkPermission(req, {
       category: 'resource',
       action: 'view'
     });
     if (!permissionCheck.authorized) {
       return NextResponse.json({ error: permissionCheck.error }, { status: 403 });
     }
     // Business logic
   }
   ```

2. **Data Fetching Pattern (Frontend)**:
   ```tsx
   const fetchData = async () => {
     setIsLoading(true);
     try {
       const data = await fetchWithAuth('/api/admin/...');
       setItems(data.items || data || []);
     } catch (error) {
       toast.error('فشل تحميل البيانات');
       setItems([]);
     } finally {
       setIsLoading(false);
     }
   };
   ```

3. **Import Pattern**: Always use top-level `import { fetchWithAuth } from "@/lib/api-client"` — never dynamic imports inside functions.

4. **Reference Implementation**: `app/admin-dashboard/programs/page.tsx` is the gold standard for admin pages.

### Naming Conventions
1. **Permission Categories**: Lowercase, plural nouns (e.g., `users`, `programs`)
2. **Permission Actions**: Lowercase verbs (e.g., `view`, `edit`, `add`, `delete`)
3. **Component Files**: PascalCase (e.g., `UserTable.tsx`)
4. **Hook Files**: camelCase with `use` prefix (e.g., `usePermissions.tsx`)

### UI Preferences
1. **Layout Direction**: RTL for Arabic
2. **Component Library**: shadcn/ui with custom styling
3. **Error Handling**: `toast.error()` for API failures, never silently fall back to hardcoded data
4. **Empty State**: Show message + icon, never hardcoded placeholder data

## Valid Roles (as of 2026-04-07)

| Enum | Arabic | Dashboard |
|------|--------|-----------|
| ADMIN | مدير النظام | /admin-dashboard |
| PROGRAM_MANAGER | مدير برنامج | /program-manager-dashboard |
| MENTOR | موجه | /mentor-dashboard |
| INVESTOR | مستثمر | /investor-dashboard |
| ENTREPRENEUR | رائد أعمال | /entrepreneur-dashboard |

Note: PARTICIPANT enum still exists in schema for legacy data but has no public dashboard (redirects to `/`). JUDGE has been fully removed.

## Key Technical Decisions

1. **Auth**: Custom JWT-based auth in `lib/auth.ts` — NOT NextAuth/next-auth
2. **Database**: Prisma ORM + SQLite (dev) / PostgreSQL (prod). SQLite doesn't support case-insensitive search (mode: 'insensitive' throws 500).
3. **UI**: Next.js App Router + shadcn/ui + Tailwind CSS
4. **Permissions**: category/action pairs (e.g., `programs:view`). Backend is source of truth.
