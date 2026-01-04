const fetch = require('node-fetch');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Helper function to log with timestamp
function logWithTime(message, data = null) {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${message}`);
  if (data) {
    console.log(JSON.stringify(data, null, 2));
  }
}

// Test the Users API
async function testUsersAPI() {
  let serverRunning = false;
  
  try {
    logWithTime('Starting Users API test...');
    
    // Check if server is running
    try {
      await fetch('http://localhost:3000/api/health');
      serverRunning = true;
      logWithTime('✅ Server is running at http://localhost:3000');
    } catch (error) {
      logWithTime('⚠️ Server is not running. API endpoint tests will be skipped, but database tests will still run.');
      serverRunning = false;
    }

    // Get the admin user from the database for authentication
    const adminUser = await prisma.user.findFirst({
      where: {
        role: 'ADMIN'
      }
    });

    if (!adminUser) {
      logWithTime('ERROR: No admin user found in the database. Please run the seed script first.');
      return;
    }

    logWithTime(`Found admin user: ${adminUser.email}`);

    // Generate a JWT token (we'll simulate this since we don't have access to the JWT secret)
    // In a real test, you might use an actual login endpoint
    const token = 'simulated_jwt_token_for_testing';

    // Only run API tests if server is running
    if (serverRunning) {
      // Test 1: Get all users (should succeed with proper auth)
      logWithTime('TEST 1: Fetching all users with auth token');
      try {
        const usersResponse = await fetch('http://localhost:3000/api/admin/users?page=1&limit=10', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (usersResponse.ok) {
          const usersData = await usersResponse.json();
          logWithTime('✅ Successfully fetched users with auth token', {
            status: usersResponse.status,
            userCount: usersData.users.length,
            totalUsers: usersData.pagination.total
          });
        } else {
          const errorData = await usersResponse.json();
          logWithTime(`❌ Failed to fetch users: ${usersResponse.status}`, errorData);
        }
      } catch (error) {
        logWithTime(`❌ Error during user fetch: ${error.message}`);
      }
  
      // Test 2: Get all users with no auth token (should fail)
      logWithTime('TEST 2: Fetching users without auth token (should fail)');
      try {
        const noAuthResponse = await fetch('http://localhost:3000/api/admin/users?page=1&limit=10');
        const noAuthData = await noAuthResponse.json();
        
        if (noAuthResponse.status === 401) {
          logWithTime('✅ Correctly received 401 Unauthorized when no token provided', {
            status: noAuthResponse.status,
            error: noAuthData.error
          });
        } else {
          logWithTime(`❌ Expected 401 status but got ${noAuthResponse.status}`, noAuthData);
        }
      } catch (error) {
        logWithTime(`❌ Error during no-auth test: ${error.message}`);
      }
  
      // Test 3: Test SSE connection
      logWithTime('TEST 3: Testing SSE connection (cannot fully test in Node.js, checking endpoint availability)');
      try {
        const sseResponse = await fetch(`http://localhost:3000/api/admin/users/sse?token=${encodeURIComponent(token)}`);
        
        // We can't fully test SSE in Node.js without EventSource, but we can check if the endpoint is available
        if (sseResponse.status === 200) {
          logWithTime('✅ SSE endpoint is available', {
            status: sseResponse.status,
            headers: Object.fromEntries([...sseResponse.headers])
          });
        } else {
          const errorData = await sseResponse.text();
          logWithTime(`❌ SSE endpoint error: ${sseResponse.status}`, { error: errorData });
        }
      } catch (error) {
        logWithTime(`❌ Error accessing SSE endpoint: ${error.message}`);
      }
    } else {
      logWithTime('SKIPPED: API endpoint tests (Tests 1-3) due to server not running');
    }

    // Test 4: Test direct database connection through Prisma
    logWithTime('TEST 4: Testing direct Prisma database connection');
    try {
      // Query the database directly to verify Prisma connection is working
      const userCount = await prisma.user.count();
      const roles = await prisma.role.findMany({
        select: {
          id: true,
          name: true
        }
      });
      
      logWithTime('✅ Successfully connected to database via Prisma', {
        userCount,
        availableRoles: roles
      });
    } catch (error) {
      logWithTime(`❌ Prisma database connection error: ${error.message}`);
    }

    // Test 5: Test the User Role endpoint (only if server is running)
    if (serverRunning) {
      logWithTime('TEST 5: Testing user role update endpoint (simulation only)');
      // In a real test, you would actually update a user's role, but we'll just verify endpoint existence
      try {
        const roleUpdateResponse = await fetch(`http://localhost:3000/api/admin/users/some-user-id/role`, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            role: 'MENTOR' // Simulate changing a role
          })
        });
        
        // We expect a 404 since "some-user-id" doesn't exist, but the endpoint should be available
        if (roleUpdateResponse.status === 404) {
          logWithTime('✅ Role update endpoint available (expected 404 for non-existent user)', {
            status: roleUpdateResponse.status
          });
        } else if (roleUpdateResponse.status === 401) {
          logWithTime('❌ Authentication failed for role update endpoint', {
            status: roleUpdateResponse.status
          });
        } else {
          const data = await roleUpdateResponse.json();
          logWithTime(`⚠️ Unexpected response from role endpoint: ${roleUpdateResponse.status}`, data);
        }
      } catch (error) {
        logWithTime(`❌ Error accessing role update endpoint: ${error.message}`);
      }
    } else {
      logWithTime('SKIPPED: Role update endpoint test (Test 5) due to server not running');
    }

    logWithTime('Users API tests completed.');
  } catch (error) {
    logWithTime(`Test failed with error: ${error.message}`);
    console.error(error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the tests
testUsersAPI();
