// Test script to verify any user can be a startup creator
const fetch = require('node-fetch');

async function testStartupCreation() {
  try {
    console.log('=== Testing startup creation with non-entrepreneur user ===');
    
    // First, get authentication token
    console.log('1. Getting authentication token...');
    const authToken = localStorage.getItem('token') || process.env.AUTH_TOKEN;
    
    if (!authToken) {
      console.error('No authentication token available. Please log in first.');
      return;
    }
    
    // Get users to find a non-entrepreneur user
    console.log('2. Fetching users to find non-entrepreneur user...');
    const usersResponse = await fetch('/api/admin/users', {
      headers: {
        'Authorization': `Bearer ${authToken}`
      }
    });
    
    if (!usersResponse.ok) {
      throw new Error('Failed to fetch users');
    }
    
    const usersData = await usersResponse.json();
    
    // Find a user who is not an entrepreneur
    const nonEntrepreneurUser = usersData.users.find(user => user.role !== 'ENTREPRENEUR');
    
    if (!nonEntrepreneurUser) {
      console.log('No non-entrepreneur users found. Please create one first.');
      return;
    }
    
    console.log(`Found non-entrepreneur user: ${nonEntrepreneurUser.name} (${nonEntrepreneurUser.email})`);
    
    // Create a test startup with the non-entrepreneur user
    console.log('3. Creating test startup with non-entrepreneur user...');
    const testStartup = {
      name: 'Test Startup ' + new Date().toISOString(),
      industry: 'Technology',
      stage: 'Seed',
      description: 'A test startup created by a non-entrepreneur user',
      problem: 'Testing problem statement',
      solution: 'Testing solution description',
      targetMarket: 'Testing market',
      businessModel: 'Testing business model',
      competitiveAdvantage: 'Testing advantage',
      teamSize: 3,
      fundingNeeds: '1,000,000 ريال',
      pitchDeckUrl: 'https://example.com/pitch.pdf',
      status: 'PENDING',
      creatorId: nonEntrepreneurUser.id
    };
    
    const startupResponse = await fetch('/api/admin/startups', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      },
      body: JSON.stringify(testStartup)
    });
    
    if (!startupResponse.ok) {
      const errorData = await startupResponse.json();
      throw new Error(`Failed to create startup: ${errorData.error}`);
    }
    
    const startupData = await startupResponse.json();
    console.log('Success! Created startup:', startupData.id);
    console.log('Startup details:', startupData);
    
    console.log('=== Test completed successfully ===');
    console.log('Non-entrepreneur users can now create startups!');
    
  } catch (error) {
    console.error('Test failed:', error);
  }
}

// Run the test
testStartupCreation();
