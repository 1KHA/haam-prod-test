# RBAC Implementation Guide

## Overview

This guide explains how to use the Role-Based Access Control (RBAC) system that has been implemented across the Accelerator & Incubator Management Platform.

## System Components

### 1. Database Models
- **User**: Contains role field (enum)
- **Role**: Stores role names in Arabic
- **Permission**: Defines permissions by category and action
- **RolePermission**: Links roles to permissions

### 2. Backend Components

#### Permission Checking Library (`lib/permissions.ts`)
```typescript
// Check if user has a specific permission
await hasPermission(userId, { category: 'users', action: 'view' });

// Check multiple permissions
await hasAnyPermission(userId, requirements);
await hasAllPermissions(userId, requirements);

// Get all user permissions
const permissions = await getUserPermissions(userId);
```

#### API Route Protection
```typescript
// In your API route
import { checkPermission } from '@/lib/permissions';

export async function GET(req: NextRequest) {
  // Check permission
  const permissionCheck = await checkPermission(req, { 
    category: 'users', 
    action: 'view' 
  });
  
  if (!permissionCheck.authorized) {
    return NextResponse.json(
      { error: permissionCheck.error },
      { status: permissionCheck.error === 'Unauthorized' ? 401 : 403 }
    );
  }
  
  // Your protected logic here
}
```

### 3. Frontend Components

#### Permission Hook (`hooks/usePermissions.tsx`)
```typescript
const { 
  hasPermission, 
  hasRole, 
  permissions, 
  loading 
} = usePermissions();

// Check permission
if (hasPermission({ category: 'users', action: 'edit' })) {
  // Show edit button
}

// Check role
if (hasRole(UserRole.ADMIN)) {
  // Show admin features
}
```

#### Permission Gates
```typescript
// Conditional rendering based on permissions
<PermissionGate requirement={{ category: 'users', action: 'add' }}>
  <Button>Add User</Button>
</PermissionGate>

// Role-based rendering
<RoleGate role={[UserRole.ADMIN, UserRole.PROGRAM_MANAGER]}>
  <AdminPanel />
</RoleGate>
```

#### Route Protection
```typescript
// Protect entire pages
<RouteGuard 
  requiredPermission={{ category: 'dashboard', action: 'view' }}
  requiredRole={UserRole.ADMIN}
>
  <AdminDashboard />
</RouteGuard>

// Or use HOC
export default withAuth(AdminDashboard, {
  requiredPermission: { category: 'dashboard', action: 'view' },
  requiredRole: UserRole.ADMIN
});
```

## Implementation Examples

### 1. Protecting a Dashboard Page

```typescript
// app/admin-dashboard/users/page.tsx
"use client";

import { RouteGuard } from '@/components/auth/RouteGuard';
import { UserRole } from '@prisma/client';

export default function UsersPage() {
  return (
    <RouteGuard 
      requiredPermission={{ category: 'users', action: 'view' }}
      requiredRole={UserRole.ADMIN}
    >
      {/* Your page content */}
    </RouteGuard>
  );
}
```

### 2. Filtering Navigation Items

```typescript
// Already implemented in components/admin/Sidebar.tsx
const filteredNavItems = useMemo(() => {
  if (loading) return [];
  
  return navItems.filter(item => {
    if (!item.permission) return true;
    return hasPermission(item.permission);
  });
}, [hasPermission, loading]);
```

### 3. Conditional UI Elements

```typescript
// In your component
import { PermissionGate } from '@/hooks/usePermissions';

function UserManagement() {
  return (
    <div>
      <h1>User Management</h1>
      
      <PermissionGate requirement={{ category: 'users', action: 'add' }}>
        <Button onClick={handleAddUser}>Add User</Button>
      </PermissionGate>
      
      <PermissionGate 
        requirement={[
          { category: 'users', action: 'edit' },
          { category: 'users', action: 'delete' }
        ]}
        requireAll={false}
      >
        <ActionsMenu />
      </PermissionGate>
    </div>
  );
}
```

### 4. API Endpoint with Conditional Permissions

```typescript
// Check ownership before allowing edit
export async function PUT(req: NextRequest) {
  const permissionCheck = await checkPermission(req, { 
    category: 'startups', 
    action: 'edit' 
  });
  
  if (!permissionCheck.authorized) {
    return NextResponse.json({ error: permissionCheck.error }, { status: 403 });
  }
  
  const { startupId } = await req.json();
  
  // Additional check for ownership
  const isOwner = await isResourceOwner(
    permissionCheck.userId!, 
    'startup', 
    startupId
  );
  
  if (!isOwner && !hasRole(UserRole.ADMIN)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }
  
  // Proceed with update
}
```

## Permission Categories and Actions

### Categories
- `dashboard` - لوحة التحكم
- `users` - المستخدمين
- `programs` - البرامج
- `startups` - الشركات الناشئة
- `funding` - التمويل
- `payments` - المدفوعات
- `reports` - التقارير
- `settings` - الإعدادات
- `events` - الفعاليات
- `mentorship` - الإرشاد
- `applications` - الطلبات
- `cohorts` - الدفعات
- `resources` - الموارد
- `analytics` - التحليلات
- `hackathons` - الهاكاثونات
- `integrations` - التكاملات
- `notifications` - الإشعارات
- `discussions` - المناقشات
- `portfolio` - المحفظة
- `evaluation` - التقييم

### Actions
- `view` - عرض
- `edit` - تعديل
- `add` - إضافة
- `delete` - حذف

## Testing RBAC

### 1. Seed the Database
```bash
npm run seed:roles
```

### 2. Test Different Roles
1. Create users with different roles
2. Sign in as each role
3. Verify that:
   - Navigation shows only permitted items
   - Protected pages redirect unauthorized users
   - API endpoints return 403 for forbidden actions
   - UI elements are hidden/shown correctly

### 3. Test Permission Changes
1. Modify a user's role
2. Add/remove specific permissions
3. Verify changes take effect after re-authentication

## Troubleshooting

### Common Issues

1. **Permissions not loading**
   - Check if `/api/auth/permissions` endpoint is accessible
   - Verify JWT token is being sent in headers
   - Check browser console for errors

2. **Navigation items not filtering**
   - Ensure `usePermissions` hook is imported correctly
   - Check if permissions are defined in seed file
   - Verify permission requirements match seeded data

3. **API returning 403 unexpectedly**
   - Check if user has required permission in database
   - Verify JWT token is valid and not expired
   - Ensure permission check matches route requirements

## Adding New Permissions

1. **Update Permission Mapping** (`docs/rbac-permission-mapping.md`)
   - Add new routes/features to the mapping table
   - Define required permissions

2. **Update Seed File** (`prisma/seed-roles.ts`)
   - Add new permission categories if needed
   - Assign permissions to appropriate roles

3. **Re-seed Database**
   ```bash
   npm run seed:roles
   ```

4. **Implement in Code**
   - Add permission checks to API routes
   - Update navigation items with permissions
   - Add UI gates for conditional rendering

## Best Practices

1. **Principle of Least Privilege**
   - Grant only necessary permissions to each role
   - Use specific permissions rather than broad access

2. **Consistent Permission Naming**
   - Follow the category/action pattern
   - Use descriptive category names
   - Keep actions limited to CRUD operations

3. **Performance Optimization**
   - Cache permissions in frontend
   - Minimize permission checks in loops
   - Use memoization for filtered lists

4. **Security Considerations**
   - Always validate permissions on backend
   - Don't rely solely on frontend checks
   - Log permission violations for auditing

5. **User Experience**
   - Provide clear feedback for unauthorized actions
   - Hide elements users can't access
   - Redirect to appropriate pages

## Future Enhancements

1. **Dynamic Permission Management**
   - Admin UI for managing permissions
   - Real-time permission updates
   - Custom permission creation

2. **Permission Groups**
   - Bundle related permissions
   - Easier role management
   - Template-based assignments

3. **Audit Logging**
   - Track all permission checks
   - Monitor access patterns
   - Generate compliance reports

4. **Temporary Permissions**
   - Time-based access grants
   - Delegation capabilities
   - Emergency access procedures
