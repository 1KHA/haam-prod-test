# User Page Integration with Prisma

This document describes the implementation details for connecting the user page with Prisma to store real data and resolving issues with live updates.

## Overview of Changes

1. **Prisma Integration for Real Data**
   - Replaced fake/mock data with actual database queries using Prisma
   - Updated API endpoints to retrieve real user data with proper relationships
   - Added proper error handling and logging for database operations

2. **Role-Related Improvements**
   - Fixed role mapping inconsistencies between English and Arabic role names
   - Added support for handling role changes via dedicated API endpoints
   - Enhanced error handling for role assignments

3. **Live Updates Implementation**
   - Fixed Server-Sent Events (SSE) implementation to provide real-time updates
   - Added proper authentication to SSE endpoints
   - Implemented heartbeat mechanisms to keep connections alive

4. **Permission System Updates**
   - Added fallback logic for role-based permission retrieval
   - Fixed TypeScript errors in the permissions system
   - Enhanced logging for permission checks

## API Endpoints

### User Management Endpoints

1. **GET /api/admin/users**
   - Retrieves paginated list of users with proper filtering
   - Supports search, role filtering, and pagination
   - Returns formatted user data with profile information

2. **GET /api/admin/users/sse**
   - Server-Sent Events endpoint for real-time user updates
   - Uses the same data structure as the regular endpoint
   - Includes heartbeat mechanism to maintain connection
   - Supports token authentication via URL parameter

3. **POST /api/admin/users**
   - Creates new users with proper role assignment
   - Validates required fields
   - Handles Arabic role name to enum mapping

4. **PUT /api/admin/users**
   - Updates existing user information
   - Supports role changes

5. **DELETE /api/admin/users**
   - Deletes users with proper cascade handling
   - Requires user ID as query parameter

### User-Specific Endpoints

1. **GET /api/admin/users/[id]**
   - Retrieves detailed information for a specific user
   - Includes all profile relationships

2. **PUT /api/admin/users/[id]/role**
   - Dedicated endpoint for changing a user's role
   - Validates role values

## Permission System

The permission system has been updated to better handle role-based permissions:

1. **Role-Permission Mapping**
   - Arabic role names are properly mapped to English role enums
   - Fallback logic when roles can't be found by name

2. **Permission Retrieval**
   - Admin users automatically receive all permissions
   - Permissions are fetched based on role with fallback mechanisms
   - User-specific permissions are properly combined with role-based ones

3. **Enhanced Logging**
   - Detailed logging for permission checks
   - Debug information for role mapping

## Test Scripts

A test script (`prisma/test-users-api.js`) has been created to verify the functionality of the user API:

1. **API Testing**
   - Tests authentication with the users endpoint
   - Verifies SSE endpoint is properly configured
   - Validates role update functionality

2. **Database Testing**
   - Directly tests Prisma connection
   - Verifies database structure and data integrity

## How to Use

### Regular Data Fetching

```javascript
// Example: Fetching users with pagination and search
const fetchUsers = async (page = 1, limit = 10, search = '', role = '') => {
  const queryParams = new URLSearchParams({
    page: String(page),
    limit: String(limit)
  });
  
  if (search) queryParams.append('search', search);
  if (role) queryParams.append('role', role);
  
  const response = await fetch(`/api/admin/users?${queryParams.toString()}`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  
  if (!response.ok) {
    throw new Error('Failed to fetch users');
  }
  
  return await response.json();
};
```

### Setting Up Live Updates

```javascript
// Example: Setting up SSE for live user updates
const setupUserSSE = (token, onMessage, onError) => {
  // Encode token for URL parameter
  const encodedToken = encodeURIComponent(token);
  
  // Create EventSource with token in URL
  const eventSource = new EventSource(`/api/admin/users/sse?token=${encodedToken}`);
  
  // Handle 'users' events (data updates)
  eventSource.addEventListener('users', (event) => {
    const data = JSON.parse(event.data);
    onMessage(data);
  });
  
  // Handle errors
  eventSource.addEventListener('error', (error) => {
    console.error('SSE Error:', error);
    eventSource.close();
    onError(error);
  });
  
  // Handle heartbeat to keep connection alive
  eventSource.addEventListener('heartbeat', () => {
    console.log('SSE Heartbeat received');
  });
  
  return eventSource; // Return for later cleanup
};

// When component unmounts:
// eventSource.close();
```

### Changing a User's Role

```javascript
// Example: Updating a user's role
const updateUserRole = async (userId, newRole) => {
  const response = await fetch(`/api/admin/users/${userId}/role`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ role: newRole })
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(`Failed to update role: ${error.error}`);
  }
  
  return await response.json();
};
```

## Troubleshooting

### Common Issues

1. **Live Updates Not Working**
   - Verify the server is running and SSE endpoint is accessible
   - Check browser console for SSE connection errors
   - Ensure token is being passed correctly (either in Authorization header or URL)
   - Verify EventSource listeners are properly set up

2. **Role Mapping Issues**
   - Ensure roles are correctly defined in the database
   - Check both Arabic and English role names for consistency
   - Look for any role mapping errors in server logs

3. **Permission Errors**
   - Verify the user has the correct role assigned
   - Check server logs for permission check details
   - Ensure role-permission relationships are properly set up in the database

## Future Improvements

1. **User Interface Enhancements**
   - Improve error messaging in the UI for permission issues
   - Add visual indicators for real-time updates

2. **Performance Optimization**
   - Implement more efficient database queries for large user sets
   - Add caching strategies for frequently accessed data

3. **Extended API Capabilities**
   - Implement batch operations for user management
   - Add more granular permission controls
