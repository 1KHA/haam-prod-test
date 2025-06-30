# Entrepreneur Dashboard: Features & Functions

This document lists all features and functions present in the `app/entrepreneur-dashboard/` section of the platform.

---

## 1. Dashboard Home

- Overview of entrepreneur's companies, programs, and key actions
- Quick navigation to main dashboard features

---

## 2. Apply to Programs (`apply/page.tsx`)

- View available programs for application
- Submit applications for programs
- Add team members as part of the application process

---

## 3. Events (`events/page.tsx`)

- View upcoming and past events relevant to the entrepreneur
- Event details and registration (if applicable)

---

## 4. Funding (`funding/page.tsx`)

- View available funding opportunities
- Apply for funding
- Track funding status and history

---

## 5. Mentors (`mentors/page.tsx`)

- Browse and connect with available mentors
- View mentor profiles and expertise
- Request mentorship or schedule sessions

---

## 6. Milestones (`milestones/page.tsx`)

- View company milestones and progress
- (Planned) Submit milestone updates (by team leader)
- Track milestone completion status

---

## 7. Profile (`profile/page.tsx`)

- View and edit entrepreneur's personal profile
- Update contact information, bio, and avatar
- Manage company profile (name, industry, description, etc.)

---

## 8. Programs (`programs/page.tsx`)

- List of programs the entrepreneur is participating in or eligible for
- Program details and status

---

## 9. Resources (`resources/page.tsx`)

- Access to learning materials, guides, and platform resources
- Downloadable documents and links

---

## 10. Startup Creation (`startup/new/page.tsx`)

- Create a new company/startup profile
- Enter company details (name, industry, team size, etc.)

---

## 11. Startups List & Details

- **Startups List (`startups/page.tsx`):**
  - View all companies/startups associated with the entrepreneur
  - Quick access to company details and actions

- **Startup Details (`startups/[id]/page.tsx`):**
  - View detailed company information
  - View team members and milestone progress
  - Access to edit and manage company

- **Startup Edit (`startups/[id]/edit/page.tsx`):**
  - Edit company details (name, industry, team size, funding needs, etc.)

---

## 12. Support (`support/page.tsx`)

- Access to support resources and contact options
- Frequently asked questions and help documentation

---

## 13. Team Management (`team/page.tsx`)

- View all current team members (real user-linked, via CompanyMember model)
- View pending team invitations (via Invitation model)
- Search/filter team members
- Display member profile info (name, email, role, position, phone, department, avatar)
- (Planned) Assign team leader and manage roles
- (Planned) Remove team members

---

## 14. Common Functions & Integrations

- All pages are protected by RBAC (role-based access control) using the `usePermissions` hook and `RouteGuard` component
- All API calls use authentication tokens
- UI supports Arabic/RTL and English/LTR
- Navigation via sidebar, top bar, and quick links

---

## 15. Backend/API Functions (Relevant Endpoints)

- `/api/team` — Team member management (legacy, being replaced by CompanyMember)
- `/api/team/invitations` — Send and manage team invitations
- `/api/team/invitations/[id]` — Accept/reject invitations, join team
- `/api/company/[id]/members` — List company members and pending invitations
- `/api/startups` — List and create companies for the entrepreneur
- `/api/startups/[id]` — Get, update, and manage company details
- `/api/milestones` — (Planned) Milestone management endpoints

---

## 16. Planned/Upcoming Features

- Full milestone management and submission by team leader
- Assigning/removing team leader and managing team roles
- Enhanced notifications for team and milestone events
- Expanded documentation and onboarding flows

---

This list reflects the current state of the entrepreneur-dashboard, including all major features, UI flows, and backend/API integrations.
