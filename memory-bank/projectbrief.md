# Project Brief: Accelerator & Incubator Management Platform

## Project Overview
The Accelerator & Incubator Management Platform is a comprehensive web application designed to streamline the operations of accelerator and incubator programs. The platform provides dedicated dashboards for administrators, program managers, mentors, startup founders, investors, judges, participants, and accelerators, facilitating application management, mentorship scheduling, progress tracking, funding allocation, and reporting.

## Core Objectives
- Simplify and automate the management of accelerator/incubator programs
- Provide transparency and easy access to key metrics and insights
- Enhance collaboration between startups, mentors, and program managers
- Support decision-making with real-time analytics and reports
- Implement robust role-based access control (RBAC) for secure operations

## Target Users
1. **Administrators** - System administrators who manage the entire platform
2. **Program Managers** - Oversee accelerator programs and cohorts
3. **Startups** - Founders and teams participating in accelerator programs
4. **Mentors** - Industry experts providing guidance to startups
5. **Investors** - Individuals or organizations looking to fund startups
6. **Judges** - Evaluate startup pitches and applications
7. **Participants** - Individual participants in programs
8. **Accelerators** - Organizations running accelerator programs

## Key Features
1. **Role-Based Dashboards** - Customized interfaces for each user role
2. **Application Management** - Submission, review, and selection processes
3. **Mentorship System** - Scheduling, feedback, and progress tracking
4. **Funding Management** - Investment tracking, disbursement, and reporting
5. **Event Coordination** - Workshops, demo days, and networking events
6. **Resource Sharing** - Learning materials, templates, and guides
7. **Performance Analytics** - KPIs, milestone tracking, and reporting
8. **Role-Based Access Control** - Granular permission management

## Technical Requirements
- **Frontend**: Next.js with React
- **Backend**: Node.js with Next.js API routes
- **Database**: Prisma ORM with SQLite (development) / PostgreSQL (production)
- **Authentication**: JWT-based authentication
- **Authorization**: Custom RBAC implementation
- **UI Framework**: Tailwind CSS with shadcn/ui components
- **Localization**: Arabic language support

## Current Development Focus
The current development focus is on implementing and refining the Role-Based Access Control (RBAC) system to ensure secure access to features based on user roles and permissions. This includes:

1. Protecting API routes with permission checks
2. Adding route guards to dashboard pages
3. Filtering sidebar navigation based on permissions
4. Creating a permission management interface for administrators
5. Testing the RBAC implementation across all user roles

## Success Criteria
- All dashboards are fully functional with role-appropriate features
- Users can only access features they have permission for
- Administrators can manage permissions for all roles
- The platform supports the complete lifecycle of accelerator programs
- The system is secure, performant, and user-friendly
