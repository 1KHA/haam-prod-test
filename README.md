# Accelerator Platform Admin Dashboard

The admin dashboard provides a comprehensive interface for managing the accelerator platform. It includes user management, startup tracking, program administration, and various other features.

Seeded database with initial data:
Admin user (admin@example.com / admin123)
Sample startup (startup@example.com / startup123)
Sample mentor (mentor@example.com / mentor123)
Sample investor (investor@example.com / investor123)
Default system settings

## Features

### User Management
- View all users with filtering and pagination
- Create new users with different roles
- Edit user details and roles
- Delete users with safeguards

### Dashboard Overview
- Total users statistics
- Active startups count
- Upcoming events
- Funding opportunities

### Navigation
- Responsive sidebar with icon navigation
- User profile and settings in the top bar
- Quick access to notifications

## Project Structure

```
haam/
├── app/
│   ├── admin-dashboard/
│   │   ├── layout.tsx           # Admin dashboard layout
│   │   ├── page.tsx            # Main dashboard page
│   │   └── users/              # User management pages
│   │       ├── page.tsx        # Users list
│   │       ├── new/            # Create user
│   │       └── [id]/           # Edit user
│   └── api/
│       └── admin/
│           └── users/          # User management API routes
├── components/
│   ├── admin/                  # Admin-specific components
│   │   ├── Sidebar.tsx
│   │   └── TopBar.tsx
│   └── ui/                     # Reusable UI components
│       ├── button.tsx
│       ├── card.tsx
│       ├── data-table.tsx
│       ├── dropdown-menu.tsx
│       ├── input.tsx
│       ├── select.tsx
│       ├── table.tsx
│       ├── toast.tsx
│       └── use-toast.ts
└── lib/
    └── utils.ts               # Utility functions
```

## Setup

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables:
```env
DATABASE_URL="your-database-url"
NEXTAUTH_SECRET="your-auth-secret"
```

3. Run database migrations:
```bash
npx prisma migrate dev
```

4. Start the development server:
```bash
npm run dev
```

## Development

### Adding New Features
1. Create new components in the appropriate directory
2. Add API routes under `/app/api`
3. Update the sidebar navigation if needed
4. Add new pages under `/app/admin-dashboard`

### Component Guidelines
- Use the provided UI components from `/components/ui`
- Follow the established patterns for forms and data tables
- Implement proper error handling and loading states
- Use toast notifications for user feedback

### API Guidelines
- Implement proper authentication checks
- Follow RESTful conventions
- Include appropriate error handling
- Add TypeScript types for request/response data

## Security

- All admin routes are protected with authentication
- Role-based access control is implemented
- API routes validate user permissions
- Sensitive operations require confirmation

## Contributing

1. Create a new branch for your feature
2. Follow the established code style
3. Add appropriate tests
4. Submit a pull request

## License

This project is proprietary and confidential.
