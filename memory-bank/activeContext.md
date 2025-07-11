# Active Context: Accelerator & Incubator Management Platform

## Current Work Focus

### RBAC Implementation Completion
The current development focus is on completing the Role-Based Access Control (RBAC) system implementation across the platform. This includes:

1. **API Route Protection**: Adding permission checks to all API endpoints
2. **Page-Level Guards**: Implementing RouteGuard on all dashboard pages
3. **Sidebar Navigation Filtering**: Ensuring navigation items are filtered based on permissions
4. **Permission Management UI**: Developing the admin interface for managing role permissions
5. **Testing**: Comprehensive testing of the RBAC system across all user roles

### Dashboard Refinement
Alongside the RBAC implementation, work is being done to refine the role-specific dashboards:

1. **Admin Dashboard**: User management, role management, and system settings
2. **Program Manager Dashboard**: Program and cohort management
3. **Startup Dashboard**: Profile, team, and milestone management
4. **Mentor Dashboard**: Availability, sessions, and feedback management
5. **Investor Dashboard**: Startup discovery and portfolio management
6. **Accelerator Dashboard**: Program and startup management

## Recent Changes

### RBAC System Implementation
1. ✅ **Database Schema**: Added Role, Permission, and RolePermission models
2. ✅ **Permission Seeding**: Created seed script for roles and permissions
3. ✅ **Permission Library**: Implemented core permission checking functions
4. ✅ **Frontend Hooks**: Created usePermissions hook for UI components
5. ✅ **Route Guards**: Implemented RouteGuard component for page protection
6. ✅ **Admin Sidebar**: Updated to filter navigation based on permissions
7. ✅ **Role Management**: Added role management page for admins

### Dashboard Development
1. ✅ **Admin User Management**: Implemented user listing, creation, editing, and deletion
2. ✅ **User Detail Page**: Created detailed user profile view
3. ✅ **Role Assignment**: Added ability to change user roles
4. ✅ **Arabic Localization**: Added Arabic translations for UI elements
5. ✅ **RTL Layout**: Implemented right-to-left layout for Arabic

### Infrastructure Improvements
1. ✅ **Script Automation**: Added scripts for route guard addition
2. ✅ **Documentation**: Created comprehensive RBAC documentation
3. ✅ **Database Fixes**: SQL script for fixing admin role assignments

## Next Steps

### Immediate Tasks (Next 1-2 Weeks)
1. **API Route Protection**: Add permission checks to remaining API endpoints
   - Priority: `/api/programs/*`, `/api/startups/*`, `/api/funding/*`
   - Implement consistent error handling across all endpoints
   - Add logging for permission denied events

2. **Dashboard Page Guards**: Add RouteGuard to all dashboard pages
   - Use the add-route-guards.cjs script to automate the process
   - Ensure proper permission categories for each page
   - Test access with different user roles

3. **Sidebar Navigation**: Update all role-specific sidebars
   - Apply permission filtering to all sidebar components
   - Ensure consistent navigation structure across dashboards
   - Test visibility with different permission sets

4. **Permission Management UI**: Complete the admin interface
   - Add ability to edit role permissions
   - Implement real-time permission updates
   - Add user-specific permission overrides

### Medium-Term Tasks (Next 2-4 Weeks)
1. **Startup Dashboard Features**:
   - Complete milestone tracking functionality
   - Implement funding request workflow
   - Add mentor session scheduling

2. **Mentor Dashboard Features**:
   - Finish availability management
   - Implement feedback submission system
   - Add resource sharing capabilities

3. **Program Manager Features**:
   - Complete application review system
   - Implement cohort management
   - Add startup progress tracking

4. **Investor Dashboard Features**:
   - Implement startup discovery and filtering
   - Add due diligence workflow
   - Create investment tracking system

### Long-Term Tasks (Next 1-3 Months)
1. **Analytics & Reporting**:
   - Implement dashboard analytics
   - Create exportable reports
   - Add visualization components

2. **Notification System**:
   - Implement in-app notifications
   - Add email notification integration
   - Create notification preferences

3. **Event Management**:
   - Build event creation and management
   - Implement RSVP functionality
   - Add calendar integration

4. **Mobile Responsiveness**:
   - Optimize all dashboards for mobile
   - Test on various devices
   - Implement responsive design patterns

## Active Decisions and Considerations

### Technical Decisions
1. **Permission Granularity**: 
   - **Decision**: Use category/action pairs for permissions (e.g., `users/view`)
   - **Consideration**: Balance between flexibility and complexity
   - **Status**: Implemented and working well

2. **Frontend Permission Checking**:
   - **Decision**: Use custom hook for permission checks
   - **Consideration**: Performance vs. security (backend is source of truth)
   - **Status**: Implemented with caching for performance

3. **Route Guard Implementation**:
   - **Decision**: Use component-based approach with HOC option
   - **Consideration**: Consistency vs. flexibility
   - **Status**: Working well but needs to be applied to all pages

4. **API Error Handling**:
   - **Decision**: Standardize error responses across all endpoints
   - **Consideration**: Developer experience and frontend integration
   - **Status**: Partially implemented, needs consistency

### UX Decisions
1. **Permission Denied Experience**:
   - **Decision**: Redirect to dashboard with toast notification
   - **Consideration**: User frustration vs. security clarity
   - **Status**: Implemented but may need refinement

2. **Navigation Visibility**:
   - **Decision**: Hide navigation items user doesn't have permission for
   - **Consideration**: Discoverability vs. clean interface
   - **Status**: Implemented in admin sidebar, needs to be applied to all

3. **Arabic Support**:
   - **Decision**: Full RTL layout with Arabic translations
   - **Consideration**: Maintenance overhead vs. user experience
   - **Status**: Basic implementation complete, needs refinement

4. **Role-Specific Dashboards**:
   - **Decision**: Separate dashboard for each role
   - **Consideration**: Code duplication vs. user experience
   - **Status**: Structure implemented, content needs completion

### Business Decisions
1. **Role Hierarchy**:
   - **Decision**: No strict hierarchy, permission-based access
   - **Consideration**: Simplicity vs. organizational structure
   - **Status**: Working well for current requirements

2. **Permission Management**:
   - **Decision**: Admin can modify role permissions
   - **Consideration**: Flexibility vs. security risks
   - **Status**: UI in progress, backend implemented

3. **Multi-Role Support**:
   - **Decision**: Single role per user (for now)
   - **Consideration**: Simplicity vs. flexibility
   - **Status**: Implemented, may revisit for multi-role support later

## Important Patterns and Preferences

### Code Patterns
1. **API Route Pattern**:
   ```typescript
   export async function GET(req: NextRequest) {
     // 1. Permission check
     const permissionCheck = await checkPermission(req, { 
       category: 'resource', 
       action: 'view' 
     });
     if (!permissionCheck.authorized) {
       return NextResponse.json({ error: permissionCheck.error }, { status: 403 });
     }
     
     // 2. Business logic
     // 3. Response
   }
   ```

2. **Component Permission Pattern**:
   ```tsx
   const { hasPermission } = usePermissions();
   
   return (
     <PermissionGate requirement={{ category: 'resource', action: 'action' }}>
       <Component />
     </PermissionGate>
   );
   ```

3. **Page Guard Pattern**:
   ```tsx
   export default function ResourcePage() {
     return (
       <RouteGuard 
         requiredPermission={{ category: 'resource', action: 'view' }}
         requiredRole={UserRole.ROLE}
       >
         <PageContent />
       </RouteGuard>
     );
   }
   ```

4. **Sidebar Filtering Pattern**:
   ```tsx
   const filteredNavItems = useMemo(() => {
     if (loading) return [];
     
     return navItems.filter(item => {
       if (!item.permission) return true;
       return hasPermission(item.permission);
     });
   }, [hasPermission, loading, navItems]);
   ```

### Naming Conventions
1. **Permission Categories**: Lowercase, plural nouns (e.g., `users`, `programs`)
2. **Permission Actions**: Lowercase verbs (e.g., `view`, `edit`, `add`, `delete`)
3. **Component Files**: PascalCase, descriptive of purpose (e.g., `UserTable.tsx`)
4. **Hook Files**: camelCase with `use` prefix (e.g., `usePermissions.tsx`)
5. **API Routes**: Nested folder structure matching endpoint path

### UI Preferences
1. **Layout Direction**: RTL for Arabic, with proper bidirectional support
2. **Color Scheme**: Based on Tailwind CSS color palette
3. **Component Library**: shadcn/ui components with custom styling
4. **Form Validation**: Client-side validation with server-side confirmation
5. **Loading States**: Skeleton loaders for content, spinners for actions

### Development Workflow
1. **Feature Implementation**: Start with API routes, then UI components
2. **Permission Integration**: Add permission checks early in development
3. **Testing Approach**: Manual testing with different user roles
4. **Documentation**: Update documentation alongside code changes
5. **Code Review**: Focus on security, performance, and user experience

## Learnings and Project Insights

### RBAC Implementation Insights
1. **Permission Granularity**: Finding the right balance between too granular (complex) and too broad (inflexible) permissions is crucial. The category/action approach provides a good middle ground.

2. **Frontend vs. Backend Checks**: While frontend permission checks improve UX, they must always be backed by server-side validation. The current implementation handles this well.

3. **Performance Considerations**: Permission checking can impact performance if not optimized. The current caching approach in the usePermissions hook helps mitigate this.

4. **Developer Experience**: A consistent pattern for permission checks makes development more predictable and reduces errors.

### Technical Challenges
1. **Route Guard Automation**: Automatically adding route guards to all pages proved challenging due to the variety of page structures. The script approach helps but still requires some manual intervention.

2. **Permission Data Structure**: Designing a flexible yet performant permission data structure took several iterations. The current approach with RolePermission junction table works well.

3. **Real-time Permission Updates**: Ensuring permission changes take effect immediately without requiring logout/login is an ongoing challenge.

4. **TypeScript Integration**: Ensuring type safety across the permission system required careful design of interfaces and types.

### UX Learnings
1. **Permission Visibility**: Users need to understand why certain features are unavailable. The current approach of hiding unavailable features works but may need supplemental explanation in some cases.

2. **Role-Specific Experiences**: Each role has unique needs and workflows. The dashboard-per-role approach addresses this but requires significant development effort.

3. **Localization Challenges**: Supporting RTL layouts and Arabic text requires attention to detail in component design and layout structure.

4. **Form Feedback**: Clear validation messages and submission feedback are essential for a good user experience, especially in forms with complex validation rules.

### Project Management Insights
1. **Incremental Implementation**: The phased approach to RBAC implementation has worked well, starting with core infrastructure and gradually extending to all parts of the application.

2. **Documentation Importance**: Comprehensive documentation of the RBAC system has been crucial for maintaining consistency across the implementation.

3. **Testing Strategy**: Testing with different user roles and permission combinations is essential but time-consuming. A more automated approach may be needed as the system grows.

4. **Stakeholder Communication**: Clearly communicating the RBAC model to stakeholders helps set expectations and gather valuable feedback on permission structures.
