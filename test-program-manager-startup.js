const { sign } = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// JWT Secret (same as in auth.ts)
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

// UserRole enum 
const UserRole = {
  ADMIN: 'ADMIN',
  PROGRAM_MANAGER: 'PROGRAM_MANAGER',
  MENTOR: 'MENTOR',
  INVESTOR: 'INVESTOR',
  PARTICIPANT: 'PARTICIPANT',
  ENTREPRENEUR: 'ENTREPRENEUR',
  STARTUP: 'STARTUP',
  JUDGE: 'JUDGE',
  ACCELERATOR: 'ACCELERATOR'
};

function generateToken(payload) {
  return sign(payload, JWT_SECRET, { expiresIn: '7d' });
}

async function testProgramManagerStartupCreation() {
  try {
    // Find a program manager user
    const programManager = await prisma.user.findFirst({
      where: { role: 'PROGRAM_MANAGER' }
    });
    
    if (!programManager) {
      console.log('No program manager found in database');
      return;
    }
    
    console.log('Found program manager:', programManager.email);
    
    // Generate a valid JWT token for the program manager
    const token = generateToken({
      userId: programManager.id,
      email: programManager.email,
      role: UserRole.PROGRAM_MANAGER
    });
    
    console.log('Generated token for program manager');
    
    // Find a user to be the startup creator
    const creator = await prisma.user.findFirst({
      where: { role: 'ENTREPRENEUR' }
    });
    
    let creatorId;
    if (!creator) {
      console.log('No entrepreneur found to be creator, using program manager as creator');
      creatorId = programManager.id;
    } else {
      console.log('Found creator:', creator.email);
      creatorId = creator.id;
    }
    
    // Test data for startup creation
    const startupData = {
      name: 'Test Startup via API',
      industry: 'Technology',
      stage: 'Seed',
      description: 'A test startup created via the API',
      problem: 'Test problem description',
      solution: 'Test solution description',
      targetMarket: 'Test target market',
      businessModel: 'Test business model',
      competitiveAdvantage: 'Test competitive advantage',
      teamSize: 3,
      fundingNeeds: '500,000 ريال',
      pitchDeckUrl: 'https://example.com/pitch.pdf',
      status: 'PENDING',
      creatorId: creatorId
    };
    
    // Test the POST API endpoint
    const fetch = (await import('node-fetch')).default;
    
    const response = await fetch('http://localhost:3001/api/program-manager/startups', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(startupData)
    });
    
    const result = await response.json();
    
    if (response.ok) {
      console.log('✅ Startup creation successful!');
      console.log('Created startup:', result);
    } else {
      console.log('❌ Startup creation failed:');
      console.log('Status:', response.status);
      console.log('Error:', result);
    }
    
  } catch (error) {
    console.error('Error during test:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testProgramManagerStartupCreation();
