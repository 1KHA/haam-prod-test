# System Patterns: Accelerator & Incubator Management Platform

## System Architecture

### Overall Architecture
The platform follows a modern web application architecture with the following key components:

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│                 │     │                 │     │                 │
│  Client Layer   │────▶│   Server Layer  │────▶│  Database Layer │
│  (Next.js/React)│     │  (Next.js API)  │     │  (Prisma/SQLite)│
│                 │◀────│                 │◀────│                 │
└─────────────────┘     └─────────────────┘     └─────────────────┘
```

1. **Client Layer**: Next.js with React components, Tailwind CSS, and shadcn/ui
2. **Server Layer**: Next.js API routes handling business logic and data operations
3. **Database Layer**: Prisma ORM interfacing with SQLite (dev) / PostgreSQL (prod)

### Authentication & Authorization Flow

```
┌──────────┐     ┌───────────┐     ┌───────────┐     ┌───────────┐
│          │     │           │     │           │     │           │
│  Login   │────▶│  Validate │────▶│ Generate  │────▶│  Store    │
│  Request │     │  Creds    │     │   JWT     │     │  Token    │
│          │     │           │     │           │     │           │
└──────────┘     └───────────┘     └───────────┘     └───────────┘
                                                            │
┌───────────┐     ┌───────────┐     ┌───────────┐          │
│           │     │           │     │           │          │
│  Check    │◀────│  Extract  │◀────│  Request  │◀─────────┘
│ Permission│     │  User/Role│     │ Protected │
│           │     │           │     │ Resource  │
└───────────┘     └───────────┘     └───────────┘
```

### Data Flow Architecture

```
┌───────────┐     ┌───────────┐     ┌───────────┐     ┌───────────┐
│           │     │           │     │           │     │           │
│  UI       │────▶│  API      │────▶│  Service  │────▶│  Database │
│ Component │     │ Endpoint  │     │  Layer    │     │  (Prisma) │
│           │◀────│           │◀────│           │◀────│           │
└───────────┘     └───────────┘     └───────────┘     └───────────┘
```

## Key Technical Decisions

### 1. Next.js Framework
- **Decision**: Use Next.js for both frontend and backend
- **Rationale**: 
  - Unified development experience
  - Built-in API routes
  - Server-side rendering for improved performance
  - Simplified deployment model
  - Strong TypeScript support

### 2. Role-Based Access Control (RBAC)
- **Decision**: Implement custom RBAC system with granular permissions
- **Rationale**:
  - Need for fine-grained control over feature access
  - Support for multiple user roles with different permission sets
  - Ability to modify permissions without code changes
  - Separation of authentication and authorization concerns

### 3. Prisma ORM
- **Decision**: Use Prisma as the database ORM
- **Rationale**:
  - Type-safe database queries
  - Automatic migrations
  - Schema-driven development
  - Support for multiple database backends
  - Simplified relationship management

### 4. JWT Authentication
- **Decision**: Use JWT for authentication
- **Rationale**:
  - Stateless authentication
  - Reduced database queries
  - Support for role and permission claims
  - Compatibility with Next.js API routes

### 5. Tailwind CSS with shadcn/ui
- **Decision**: Use Tailwind CSS with shadcn/ui component library
- **Rationale**:
  - Utility-first approach for rapid development
  - Consistent design system
  - Highly customizable components
  - Reduced CSS bundle size
  - Support for RTL layouts

## Design Patterns in Use

### 1. Repository Pattern
- **Implementation**: Prisma client acts as the repository layer
- **Purpose**: Abstract database operations and provide a clean API for data access
- **Example**: User repository for CRUD operations on users

### 2. Service Layer Pattern
- **Implementation**: Business logic encapsulated in service modules
- **Purpose**: Separate business logic from API routes and controllers
- **Example**: Permission service for checking user permissions

### 3. Middleware Pattern
- **Implementation**: Authentication and permission checking middleware
- **Purpose**: Intercept requests to perform cross-cutting concerns
- **Example**: `checkPermission` middleware for API routes

### 4. Provider Pattern (React Context)
- **Implementation**: Auth context provider for user state
- **Purpose**: Share authentication state across components
- **Example**: `AuthProvider` component in contexts/auth-context.tsx

### 5. Custom Hook Pattern
- **Implementation**: React hooks for common functionality
- **Purpose**: Reuse logic across components
- **Example**: `usePermissions` hook for permission checking

### 6. Higher-Order Component (HOC) Pattern
- **Implementation**: Route guard HOC for page protection
- **Purpose**: Add authorization logic to page components
- **Example**: `withAuth` HOC in components/auth/RouteGuard.tsx

### 7. Component Composition Pattern
- **Implementation**: Composable UI components
- **Purpose**: Build complex UIs from simple, reusable components
- **Example**: Card, Dialog, and Button components from shadcn/ui

## Component Relationships

### Authentication & Authorization Components

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│                 │     │                 │     │                 │
│  AuthProvider   │────▶│  useAuth Hook   │────▶│  RouteGuard     │
│  (Context)      │     │  (Consumer)     │     │  (Protection)   │
│                 │     │                 │     │                 │
└─────────────────┘     └─────────────────┘     └─────────────────┘
                                                        │
                                                        ▼
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│                 │     │                 │     │                 │
│  Permission     │◀────│  usePermissions │◀────│  PermissionGate │
│  API            │     │  Hook           │     │  Component      │
│                 │     │                 │     │                 │
└─────────────────┘     └─────────────────┘     └─────────────────┘
```

### Dashboard Component Hierarchy

```
┌─────────────────┐
│                 │
│  Layout         │
│  Component      │
│                 │
└─────────────────┘
        │
        ├─────────────────┬─────────────────┐
        │                 │                 │
┌───────▼───────┐ ┌───────▼───────┐ ┌───────▼───────┐
│               │ │               │ │               │
│  Sidebar      │ │  TopBar       │ │  Main Content │
│  Component    │ │  Component    │ │  Component    │
│               │ │               │ │               │
└───────────────┘ └───────────────┘ └───────────────┘
        │                                   │
        │                                   │
┌───────▼───────┐                   ┌───────▼───────┐
│               │                   │               │
│  Navigation   │                   │  Page         │
│  Items        │                   │  Component    │
│               │                   │               │
└───────────────┘                   └───────────────┘
```

### API Layer Structure

```
┌─────────────────┐
│                 │
│  API Route      │
│  Handler        │
│                 │
└─────────────────┘
        │
        ▼
┌─────────────────┐
│                 │
│  Permission     │
│  Check          │
│                 │
└─────────────────┘
        │
        ▼
┌─────────────────┐
│                 │
│  Business       │
│  Logic          │
│                 │
└─────────────────┘
        │
        ▼
┌─────────────────┐
│                 │
│  Data Access    │
│  (Prisma)       │
│                 │
└─────────────────┘
```

## Critical Implementation Paths

### 1. Authentication Flow
1. User submits credentials to `/api/auth/signin`
2. Server validates credentials against database
3. On success, JWT token is generated with user role and ID
4. Token is returned to client and stored in local storage
5. `AuthProvider` context is updated with user information
6. Protected routes become accessible based on user role

### 2. Permission Checking Flow
1. User attempts to access a protected resource
2. `RouteGuard` component checks user authentication
3. If authenticated, `usePermissions` hook is called
4. Hook fetches user permissions from `/api/auth/permissions`
5. Permissions are checked against required permissions
6. Access is granted or denied based on permission check

### 3. Dashboard Rendering Flow
1. User navigates to a role-specific dashboard
2. Layout component renders with `RouteGuard` protection
3. If authorized, sidebar, topbar, and content components render
4. Sidebar filters navigation items based on user permissions
5. Content component renders page-specific components
6. API calls are made with authentication token for data fetching

### 4. User Management Flow
1. Admin navigates to user management page
2. User list is fetched from `/api/admin/users`
3. Admin can view, create, edit, or delete users
4. Role changes are processed through `/api/admin/users/[id]/role`
5. Permission changes are processed through role management

### 5. Role Permission Management Flow
1. Admin navigates to role management page
2. Roles and permissions are fetched from API
3. Admin can enable/disable permissions for each role
4. Changes are saved to database
5. User permissions are updated in real-time
