# Technical Context: Accelerator & Incubator Management Platform

## Technologies Used

### Frontend Technologies
- **Next.js**: React framework for server-rendered applications
- **React**: JavaScript library for building user interfaces
- **TypeScript**: Typed superset of JavaScript for improved developer experience
- **Tailwind CSS**: Utility-first CSS framework
- **shadcn/ui**: Component library built on Radix UI and Tailwind
- **React Context API**: State management for authentication and permissions
- **React Hooks**: Custom hooks for reusable logic
- **Lucide Icons**: Icon library for UI elements
- **React Hook Form**: Form validation and handling
- **Zod**: Schema validation library

### Backend Technologies
- **Next.js API Routes**: Server-side API endpoints
- **Prisma ORM**: Database toolkit for TypeScript
- **SQLite**: Development database
- **PostgreSQL**: Production database (planned)
- **JWT**: JSON Web Tokens for authentication
- **bcrypt**: Password hashing library
- **NextAuth.js**: Authentication library (partial implementation)

### Development Tools
- **ESLint**: JavaScript linting
- **Prettier**: Code formatting
- **npm**: Package management
- **Git**: Version control
- **VS Code**: Primary development environment
- **Prisma Studio**: Database management UI

## Development Setup

### Local Development Environment
1. **Node.js**: v18.x or higher
2. **npm**: v9.x or higher
3. **VS Code**: With recommended extensions
   - ESLint
   - Prettier
   - Tailwind CSS IntelliSense
   - Prisma
   - GitLens

### Project Structure
```
/
├── app/                    # Next.js app directory
│   ├── api/                # API routes
│   ├── [dashboard-type]/   # Dashboard routes by user role
│   ├── auth/               # Authentication pages
│   ├── components/         # Shared components
│   ├── globals.css         # Global styles
│   ├── layout.tsx          # Root layout
│   └── page.tsx            # Home page
├── components/             # Reusable components
│   ├── ui/                 # UI components (shadcn)
│   ├── [role]/             # Role-specific components
│   └── auth/               # Authentication components
├── contexts/               # React contexts
├── docs/                   # Documentation
├── hooks/                  # Custom React hooks
├── lib/                    # Utility functions and libraries
├── memory-bank/            # Project documentation
├── prisma/                 # Prisma schema and migrations
│   ├── schema.prisma       # Database schema
│   └── seed-roles.ts       # Role and permission seeding
├── public/                 # Static assets
├── scripts/                # Utility scripts
└── package.json            # Dependencies and scripts
```

### Development Workflow
1. **Setup**: Clone repository and install dependencies
   ```bash
   git clone [repository-url]
   cd [project-directory]
   npm install
   ```

2. **Database Setup**: Initialize database and run migrations
   ```bash
   npx prisma migrate dev
   npm run seed:roles
   ```

3. **Development Server**: Start the development server
   ```bash
   npm run dev
   ```

4. **Code Style**: Ensure code follows project standards
   ```bash
   npm run lint
   npm run format
   ```

5. **Database Management**: Use Prisma Studio for database operations
   ```bash
   npx prisma studio
   ```

## Technical Constraints

### Performance Constraints
- **Page Load Time**: Target < 2 seconds for initial load
- **API Response Time**: Target < 500ms for API responses
- **Bundle Size**: Keep client-side JavaScript bundle < 500KB
- **Database Queries**: Optimize for minimal database round trips

### Security Constraints
- **Authentication**: JWT-based with proper expiration and refresh
- **Authorization**: Role-based access control for all resources
- **Data Protection**: Proper input validation and sanitization
- **API Security**: Rate limiting and CSRF protection
- **Password Storage**: Secure hashing with bcrypt

### Scalability Constraints
- **User Load**: Support up to 10,000 concurrent users
- **Data Volume**: Handle up to 1,000 accelerator programs
- **API Throughput**: Support 100 requests per second
- **Database Growth**: Efficient schema design for growing data

### Browser Compatibility
- **Modern Browsers**: Chrome, Firefox, Safari, Edge (latest 2 versions)
- **Mobile Browsers**: iOS Safari, Android Chrome
- **No IE Support**: Internet Explorer is not supported

### Accessibility Requirements
- **WCAG 2.1 AA**: Compliance with accessibility guidelines
- **Keyboard Navigation**: Full keyboard accessibility
- **Screen Reader Support**: Proper ARIA attributes
- **Color Contrast**: Meet minimum contrast ratios
- **RTL Support**: Right-to-left language support for Arabic

## Dependencies

### Core Dependencies
```json
{
  "dependencies": {
    "@prisma/client": "^5.0.0",
    "bcrypt": "^5.1.0",
    "jsonwebtoken": "^9.0.0",
    "next": "^13.4.0",
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-hook-form": "^7.45.0",
    "zod": "^3.21.0"
  }
}
```

### UI Dependencies
```json
{
  "dependencies": {
    "@radix-ui/react-dialog": "^1.0.4",
    "@radix-ui/react-dropdown-menu": "^2.0.5",
    "@radix-ui/react-slot": "^1.0.2",
    "@radix-ui/react-toast": "^1.1.4",
    "class-variance-authority": "^0.6.0",
    "clsx": "^1.2.1",
    "lucide-react": "^0.244.0",
    "tailwind-merge": "^1.13.2",
    "tailwindcss-animate": "^1.0.6"
  }
}
```

### Development Dependencies
```json
{
  "devDependencies": {
    "@types/bcrypt": "^5.0.0",
    "@types/jsonwebtoken": "^9.0.2",
    "@types/node": "^20.3.1",
    "@types/react": "^18.2.12",
    "@types/react-dom": "^18.2.5",
    "autoprefixer": "^10.4.14",
    "eslint": "^8.42.0",
    "eslint-config-next": "^13.4.5",
    "postcss": "^8.4.24",
    "prisma": "^5.0.0",
    "tailwindcss": "^3.3.2",
    "typescript": "^5.1.3"
  }
}
```

## Tool Usage Patterns

### Prisma ORM Usage
- **Schema Definition**: Define models in `prisma/schema.prisma`
- **Migration Workflow**: Use `prisma migrate dev` for schema changes
- **Query Pattern**: Use Prisma Client in API routes
- **Relation Handling**: Use Prisma's relation queries
- **Seeding**: Use `prisma/seed.ts` for initial data

```typescript
// Example Prisma query pattern
const users = await prisma.user.findMany({
  where: { role: 'STARTUP' },
  include: { startupProfile: true }
});
```

### Authentication Pattern
- **Login Flow**: Email/password authentication via JWT
- **Token Storage**: Client-side storage in localStorage
- **Token Validation**: Server-side validation in API routes
- **User Context**: React context for user state management

```typescript
// Example authentication pattern
const { data } = await fetch('/api/auth/signin', {
  method: 'POST',
  body: JSON.stringify({ email, password })
});

localStorage.setItem('token', data.token);
```

### Permission Checking Pattern
- **Permission Definition**: Category/action pairs (e.g., `users/view`)
- **Role Mapping**: Roles mapped to permissions in database
- **Frontend Checking**: `usePermissions` hook for UI elements
- **Backend Checking**: `checkPermission` middleware for API routes

```typescript
// Frontend permission check
const { hasPermission } = usePermissions();
if (hasPermission({ category: 'users', action: 'edit' })) {
  // Show edit button
}

// Backend permission check
const permissionCheck = await checkPermission(req, { 
  category: 'users', 
  action: 'edit' 
});
if (!permissionCheck.authorized) {
  return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
}
```

### Component Composition Pattern
- **Base Components**: Low-level UI components from shadcn/ui
- **Composite Components**: Domain-specific components built from base components
- **Layout Components**: Page layout structure components
- **Page Components**: Full page implementations

```tsx
// Example component composition
<Card>
  <CardHeader>
    <CardTitle>User Profile</CardTitle>
  </CardHeader>
  <CardContent>
    <UserProfileForm user={user} />
  </CardContent>
  <CardFooter>
    <Button>Save Changes</Button>
  </CardFooter>
</Card>
```

### API Route Pattern
- **Route Structure**: RESTful endpoints in `app/api/` directory
- **HTTP Methods**: Separate functions for GET, POST, PUT, DELETE
- **Error Handling**: Consistent error response format
- **Validation**: Input validation with Zod schemas
- **Authorization**: Permission checking before business logic

```typescript
// Example API route pattern
export async function GET(req: NextRequest) {
  try {
    // Permission check
    const permissionCheck = await checkPermission(req, { 
      category: 'users', 
      action: 'view' 
    });
    if (!permissionCheck.authorized) {
      return NextResponse.json(
        { error: permissionCheck.error },
        { status: 403 }
      );
    }
    
    // Business logic
    const users = await prisma.user.findMany();
    
    // Response
    return NextResponse.json({ users });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
```

### Form Handling Pattern
- **Form Library**: React Hook Form for form state
- **Validation**: Zod schemas for validation rules
- **Error Handling**: Field-level error messages
- **Submission**: Async submission with loading state

```tsx
// Example form handling pattern
const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
  resolver: zodResolver(userSchema)
});

const onSubmit = async (data) => {
  try {
    await fetch('/api/users', {
      method: 'POST',
      body: JSON.stringify(data)
    });
    toast({ title: 'User created successfully' });
  } catch (error) {
    toast({ 
      title: 'Error creating user',
      variant: 'destructive'
    });
  }
};

return (
  <form onSubmit={handleSubmit(onSubmit)}>
    {/* Form fields */}
    <Button disabled={isSubmitting}>
      {isSubmitting ? 'Saving...' : 'Save'}
    </Button>
  </form>
);
```

## Development Practices

### Code Organization
- **Feature-Based Structure**: Group related components and logic
- **Shared Components**: Reusable UI components in `components/ui`
- **Role-Specific Components**: Dashboard components by user role
- **Utility Functions**: Common functions in `lib` directory
- **Custom Hooks**: Reusable logic in `hooks` directory

### Naming Conventions
- **Files**: PascalCase for components, camelCase for utilities
- **Components**: PascalCase (e.g., `UserProfile.tsx`)
- **Hooks**: camelCase with `use` prefix (e.g., `usePermissions.tsx`)
- **API Routes**: Folder structure matching endpoint paths
- **Database Models**: PascalCase singular (e.g., `User`, `StartupProfile`)

### Error Handling
- **Frontend**: Toast notifications for user feedback
- **API Routes**: Consistent error response structure
- **Try/Catch**: Wrap async operations in try/catch blocks
- **Error Logging**: Console errors in development, structured logging in production

### Testing Strategy
- **Unit Testing**: Component and utility function tests
- **Integration Testing**: API route and permission testing
- **E2E Testing**: Critical user flows
- **Manual Testing**: Role-based feature verification
