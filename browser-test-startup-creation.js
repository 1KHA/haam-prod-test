// This script can be run in the browser console to test the startup creation functionality
// with a non-entrepreneur user

async function browserTestStartupCreation() {
  try {
    console.log('=== Testing startup creation with non-entrepreneur user ===');
    
    // First, check if we're logged in
    console.log('1. Checking authentication...');
    const authToken = localStorage.getItem('token');
    
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
    console.log('Available users:', usersData.users.map(u => `${u.name} (${u.email}) - Role: ${u.role}`));
    
    // Find a user who is not an entrepreneur
    const nonEntrepreneurUser = usersData.users.find(user => user.role !== 'ENTREPRENEUR');
    
    if (!nonEntrepreneurUser) {
      console.log('No non-entrepreneur users found. Please create one first.');
      return;
    }
    
    console.log(`Found non-entrepreneur user: ${nonEntrepreneurUser.name} (${nonEntrepreneurUser.email}) - Role: ${nonEntrepreneurUser.role}`);
    
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
      status: 'ACTIVE',
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
    
    const responseText = await startupResponse.text();
    console.log('Raw response:', responseText);
    
    let startupData;
    try {
      startupData = JSON.parse(responseText);
    } catch (e) {
      console.error('Failed to parse response as JSON');
      throw new Error('Invalid response format');
    }
    
    if (!startupResponse.ok) {
      throw new Error(`Failed to create startup: ${startupData.error || 'Unknown error'}`);
    }
    
    console.log('Success! Created startup:', startupData.id);
    console.log('Startup details:', startupData);
    
    console.log('=== Test completed successfully ===');
    console.log('Non-entrepreneur users can now create startups!');
    
  } catch (error) {
    console.error('Test failed:', error);
  }
}

// Instruction: Copy this script and run it in the browser console 
// while logged in as an admin on the startup creation page
console.log('Run browserTestStartupCreation() to test creating a startup with a non-entrepreneur user');
