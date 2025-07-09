# RBAC Permission Mapping Document

## Overview
This document provides a comprehensive mapping of all routes, tabs, and functions to their required permissions and allowed roles in the Accelerator & Incubator Management Platform.

## User Roles
- **ADMIN** - مدير النظام (System Administrator)
- **PROGRAM_MANAGER** - مدير برنامج (Program Manager)
- **MENTOR** - موجه (Mentor)
- **INVESTOR** - مستثمر (Investor)
- **JUDGE** - محكم (Judge)
- **PARTICIPANT** - مشارك (Participant)
- **ENTREPRENEUR** - رائد أعمال (Entrepreneur)

## Permission Categories
- **dashboard** - لوحة التحكم
- **users** - المستخدمين
- **programs** - البرامج
- **startups** - الشركات الناشئة
- **funding** - التمويل
- **payments** - المدفوعات
- **reports** - التقارير
- **settings** - الإعدادات
- **events** - الفعاليات
- **mentorship** - الإرشاد
- **applications** - الطلبات
- **cohorts** - الدفعات
- **resources** - الموارد
- **analytics** - التحليلات
- **hackathons** - الهاكاثونات
- **integrations** - التكاملات
- **notifications** - الإشعارات
- **discussions** - المناقشات
- **portfolio** - المحفظة
- **evaluation** - التقييم

## Permission Actions
- **view** - عرض
- **edit** - تعديل
- **add** - إضافة
- **delete** - حذف

## Route Permission Mapping

### Admin Dashboard Routes

| Route/Tab/Function | Permission (Category/Action) | Roles Allowed |
|-------------------|------------------------------|---------------|
| /admin-dashboard | dashboard/view | ADMIN |
| /admin-dashboard/users | users/view | ADMIN |
| /admin-dashboard/users (Add User) | users/add | ADMIN |
| /admin-dashboard/users (Edit User) | users/edit | ADMIN |
| /admin-dashboard/users (Delete User) | users/delete | ADMIN |
| /admin-dashboard/users (Roles Management) | users/edit | ADMIN |
| /admin-dashboard/analytics | analytics/view | ADMIN |
| /admin-dashboard/events | events/view, events/edit | ADMIN |
| /admin-dashboard/funding | funding/view, funding/edit | ADMIN |
| /admin-dashboard/hackathons | hackathons/view, hackathons/edit | ADMIN |
| /admin-dashboard/integrations | integrations/view, integrations/edit | ADMIN |
| /admin-dashboard/notifications | notifications/view, notifications/edit | ADMIN |
| /admin-dashboard/payments | payments/view, payments/edit | ADMIN |
| /admin-dashboard/programs | programs/view, programs/edit, programs/add, programs/delete | ADMIN |
| /admin-dashboard/reports | reports/view | ADMIN |
| /admin-dashboard/startups | startups/view, startups/edit, startups/add, startups/delete | ADMIN |
| /admin-dashboard/system | settings/view, settings/edit | ADMIN |
| /admin-dashboard/security | settings/view, settings/edit | ADMIN |

### Program Manager Dashboard Routes

| Route/Tab/Function | Permission (Category/Action) | Roles Allowed |
|-------------------|------------------------------|---------------|
| /program-manager-dashboard | dashboard/view | PROGRAM_MANAGER |
| /program-manager-dashboard/applications | applications/view, applications/edit | PROGRAM_MANAGER |
| /program-manager-dashboard/cohorts | cohorts/view, cohorts/edit, cohorts/add | PROGRAM_MANAGER |
| /program-manager-dashboard/selection | applications/view, applications/edit | PROGRAM_MANAGER |
| /program-manager-dashboard/startups | startups/view, startups/edit | PROGRAM_MANAGER |
| /program-manager-dashboard/mentors | mentorship/view, mentorship/edit | PROGRAM_MANAGER |
| /program-manager-dashboard/events | events/view, events/edit, events/add | PROGRAM_MANAGER |
| /program-manager-dashboard/funding | funding/view, funding/edit | PROGRAM_MANAGER |
| /program-manager-dashboard/milestones | startups/view, startups/edit | PROGRAM_MANAGER |
| /program-manager-dashboard/reports | reports/view | PROGRAM_MANAGER |
| /program-manager-dashboard/resources | resources/view, resources/edit, resources/add | PROGRAM_MANAGER |
| /program-manager-dashboard/feedback | startups/view, startups/edit | PROGRAM_MANAGER |
| /program-manager-dashboard/sessions | mentorship/view, mentorship/edit | PROGRAM_MANAGER |
| /program-manager-dashboard/discussions | discussions/view, discussions/edit | PROGRAM_MANAGER |


### Mentor Dashboard Routes

| Route/Tab/Function | Permission (Category/Action) | Roles Allowed |
|-------------------|------------------------------|---------------|
| /mentor-dashboard | dashboard/view | MENTOR |
| /mentor-dashboard/profile | users/view, users/edit | MENTOR |
| /mentor-dashboard/availability | mentorship/view, mentorship/edit | MENTOR |
| /mentor-dashboard/startups | startups/view | MENTOR |
| /mentor-dashboard/sessions | mentorship/view, mentorship/edit | MENTOR |
| /mentor-dashboard/feedback | mentorship/view, mentorship/edit | MENTOR |
| /mentor-dashboard/resources | resources/view, resources/add | MENTOR |
| /mentor-dashboard/reports | reports/view | MENTOR |
| /mentor-dashboard/community | discussions/view, discussions/edit | MENTOR |
| /mentor-dashboard/discussions | discussions/view, discussions/edit | MENTOR |

### Investor Dashboard Routes

| Route/Tab/Function | Permission (Category/Action) | Roles Allowed |
|-------------------|------------------------------|---------------|
| /investor-dashboard | dashboard/view | INVESTOR |
| /investor-dashboard/discover | startups/view | INVESTOR |
| /investor-dashboard/portfolio | portfolio/view | INVESTOR |
| /investor-dashboard/deals | funding/view, funding/edit, funding/add | INVESTOR |
| /investor-dashboard/due-diligence | startups/view | INVESTOR |
| /investor-dashboard/pitches | startups/view | INVESTOR |
| /investor-dashboard/events | events/view | INVESTOR |
| /investor-dashboard/analytics | analytics/view | INVESTOR |
| /investor-dashboard/reports | reports/view | INVESTOR |
| /investor-dashboard/network | discussions/view | INVESTOR |
| /investor-dashboard/discussions | discussions/view, discussions/edit | INVESTOR |
| /investor-dashboard/opportunities | startups/view | INVESTOR |
| /investor-dashboard/performance | portfolio/view | INVESTOR |
| /investor-dashboard/profile | users/view, users/edit | INVESTOR |

### Judge Dashboard Routes

| Route/Tab/Function | Permission (Category/Action) | Roles Allowed |
|-------------------|------------------------------|---------------|
| /judge-dashboard | dashboard/view | JUDGE |
| /judge-dashboard/evaluate | evaluation/view, evaluation/edit | JUDGE |
| /judge-dashboard/evaluate (Score Submission) | evaluation/add | JUDGE |

### Participant Dashboard Routes

| Route/Tab/Function | Permission (Category/Action) | Roles Allowed |
|-------------------|------------------------------|---------------|
| /participant-dashboard | dashboard/view | PARTICIPANT |

### Entrepreneur Dashboard Routes

| Route/Tab/Function | Permission (Category/Action) | Roles Allowed |
|-------------------|------------------------------|---------------|
| /entrepreneur-dashboard | dashboard/view | ENTREPRENEUR |
| /entrepreneur-dashboard/team | users/view, users/add, users/edit | ENTREPRENEUR |
| /entrepreneur-dashboard/milestones | startups/view, startups/edit | ENTREPRENEUR |
| /entrepreneur-dashboard/funding | funding/view, funding/add | ENTREPRENEUR |
| /entrepreneur-dashboard/mentors | mentorship/view | ENTREPRENEUR |
| /entrepreneur-dashboard/events | events/view | ENTREPRENEUR |
| /entrepreneur-dashboard/resources | resources/view | ENTREPRENEUR |
| /entrepreneur-dashboard/programs | programs/view, applications/add | ENTREPRENEUR |
| /entrepreneur-dashboard/profile | profile/view, profile/edit | ENTREPRENEUR |
| /entrepreneur-dashboard/support | support/view | ENTREPRENEUR |


## API Route Permission Mapping

### Admin API Routes

| API Route | Permission (Category/Action) | Roles Allowed |
|-----------|------------------------------|---------------|
| GET /api/admin | dashboard/view | ADMIN |
| GET /api/admin/users | users/view | ADMIN |
| POST /api/admin/users | users/add | ADMIN |
| PUT /api/admin/users | users/edit | ADMIN |
| DELETE /api/admin/users | users/delete | ADMIN |
| GET /api/admin/roles | users/view | ADMIN |
| PUT /api/admin/roles | users/edit | ADMIN |
| GET /api/admin/programs | programs/view | ADMIN |
| POST /api/admin/programs | programs/add | ADMIN |
| PUT /api/admin/programs | programs/edit | ADMIN |
| DELETE /api/admin/programs | programs/delete | ADMIN |
| GET /api/admin/startups | startups/view | ADMIN |
| POST /api/admin/startups | startups/add | ADMIN |
| PUT /api/admin/startups | startups/edit | ADMIN |
| DELETE /api/admin/startups | startups/delete | ADMIN |

### Program Manager API Routes

| API Route | Permission (Category/Action) | Roles Allowed |
|-----------|------------------------------|---------------|
| GET /api/program-manager | dashboard/view | PROGRAM_MANAGER |
| GET /api/program-manager/applications | applications/view | PROGRAM_MANAGER |
| PUT /api/program-manager/applications | applications/edit | PROGRAM_MANAGER |
| GET /api/program-manager/cohorts | cohorts/view | PROGRAM_MANAGER |
| POST /api/program-manager/cohorts | cohorts/add | PROGRAM_MANAGER |
| PUT /api/program-manager/cohorts | cohorts/edit | PROGRAM_MANAGER |
| GET /api/program-manager/selection | applications/view | PROGRAM_MANAGER |
| PUT /api/program-manager/selection | applications/edit | PROGRAM_MANAGER |
| GET /api/program-manager/startups | startups/view | PROGRAM_MANAGER |
| PUT /api/program-manager/startups | startups/edit | PROGRAM_MANAGER |

### Startup API Routes

| API Route | Permission (Category/Action) | Roles Allowed |
|-----------|------------------------------|---------------|
| GET /api/startups | startups/view | ALL ROLES |
| GET /api/startups/[id] | startups/view | ALL ROLES |
| POST /api/startups/create | startups/add | ENTREPRENEUR, ADMIN |
| PUT /api/startups/[id] | startups/edit | ENTREPRENEUR (own), ADMIN, PROGRAM_MANAGER |
| GET /api/team | users/view | ENTREPRENEUR |
| POST /api/team | users/add | ENTREPRENEUR |
| PUT /api/team/[id] | users/edit | ENTREPRENEUR |
| DELETE /api/team/[id] | users/delete | ENTREPRENEUR |

### Funding API Routes

| API Route | Permission (Category/Action) | Roles Allowed |
|-----------|------------------------------|---------------|
| GET /api/funding | funding/view | ENTREPRENEUR, INVESTOR, ADMIN, PROGRAM_MANAGER |
| POST /api/funding | funding/add | ENTREPRENEUR, INVESTOR |
| PUT /api/funding/[id] | funding/edit | INVESTOR, ADMIN, PROGRAM_MANAGER |
| DELETE /api/funding/[id] | funding/delete | ADMIN |

### Mentor API Routes

| API Route | Permission (Category/Action) | Roles Allowed |
|-----------|------------------------------|---------------|
| GET /api/mentor | dashboard/view | MENTOR |
| GET /api/mentor/availability | mentorship/view | MENTOR |
| PUT /api/mentor/availability | mentorship/edit | MENTOR |
| GET /api/mentor/sessions | mentorship/view | MENTOR |
| PUT /api/mentor/sessions | mentorship/edit | MENTOR |
| GET /api/mentor/startups | startups/view | MENTOR |
| GET /api/mentor/feedback | mentorship/view | MENTOR |
| POST /api/mentor/feedback | mentorship/add | MENTOR |
| GET /api/mentor/resources | resources/view | MENTOR |
| POST /api/mentor/resources | resources/add | MENTOR |
| GET /api/mentor/reports | reports/view | MENTOR |
| GET /api/mentor/discussions | discussions/view | MENTOR |
| POST /api/mentor/discussions | discussions/add | MENTOR |
| GET /api/mentor/profile | users/view | MENTOR |
| PUT /api/mentor/profile | users/edit | MENTOR |

### Common API Routes

| API Route | Permission (Category/Action) | Roles Allowed |
|-----------|------------------------------|---------------|
| POST /api/auth/signin | - | PUBLIC |
| POST /api/auth/signup | - | PUBLIC |
| GET /api/auth/me | dashboard/view | ALL AUTHENTICATED |
| GET /api/profile | users/view | ALL AUTHENTICATED |
| PUT /api/profile/update | users/edit | ALL AUTHENTICATED |
| GET /api/programs | programs/view | ALL AUTHENTICATED |
| GET /api/cohorts | cohorts/view | ALL AUTHENTICATED |
| GET /api/cohorts/active | cohorts/view | ALL AUTHENTICATED |
| POST /api/cohorts/apply | applications/add | ENTREPRENEUR |

## UI Component Permission Mapping

### Sidebar Navigation Items

Each dashboard's sidebar should filter navigation items based on user permissions:

```typescript
// Example structure for navigation items
interface NavItem {
  name: string;
  href: string;
  icon: string;
  permission: {
    category: string;
    action: string;
  };
}
```

### Action Buttons and Forms

| Component/Action | Permission (Category/Action) | Implementation |
|-----------------|------------------------------|----------------|
| Add User Button | users/add | Hide if no permission |
| Edit User Button | users/edit | Hide if no permission |
| Delete User Button | users/delete | Hide if no permission |
| Create Program Button | programs/add | Hide if no permission |
| Approve Funding Button | funding/edit | Hide if no permission |
| Submit Application Form | applications/add | Hide if no permission |
| Schedule Mentorship Session | mentorship/add | Hide if no permission |

## Permission Inheritance Rules

1. **ADMIN** role has all permissions by default
2. Users can only edit their own profile unless they have specific user management permissions
3. Entrepreneurs can only edit their own data unless they have broader permissions
4. Mentors can only view/edit sessions and feedback for their assigned startups
5. Investors can only manage their own investment deals

## Special Permission Cases

### Cross-Role Access
- Program Managers can view startup data but only edit startups in their assigned programs
- Mentors can view startup data but only for startups they are mentoring
- Investors can view all startups but can only edit funding for their investments

### Conditional Permissions
- Startup team management: Only the startup founder or users with team management permissions
- Funding approval: Requires both funding/edit permission AND appropriate role (ADMIN, PROGRAM_MANAGER, or INVESTOR)
- Application review: Requires applications/edit permission AND assignment to the specific program

## Implementation Notes

1. **Backend Middleware**: Create a permission checking middleware that:
   - Extracts user role and permissions from JWT/session
   - Checks against required permissions for the route
   - Returns 403 if unauthorized

2. **Frontend Guards**: Implement:
   - Route guards to prevent navigation to unauthorized pages
   - Component-level permission checks for conditional rendering
   - Disabled state for unauthorized actions

3. **Database Seeding**: Ensure all permissions listed above are seeded in the database

4. **Testing Strategy**: Test each role against all routes and actions to ensure proper enforcement

## Future Considerations

1. **Dynamic Permissions**: Consider allowing admins to create custom permissions
2. **Permission Groups**: Group related permissions for easier management
3. **Audit Logging**: Log all permission checks and access attempts
4. **Permission Delegation**: Allow users to temporarily delegate permissions
