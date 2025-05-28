import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { isAuthenticated, UserRole } from '@/lib/auth';
import { writeFile } from 'fs/promises';
import { join } from 'path';
import { mkdir } from 'fs/promises';

// Define the allowed file types
const ALLOWED_FILE_TYPES = [
  'application/pdf',
  'application/vnd.ms-powerpoint',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation'
];

// Maximum file size (10MB)
const MAX_FILE_SIZE = 10 * 1024 * 1024;

export async function GET(
  request: NextRequest,
  { params }: { params: { startupId: string } }
) {
  try {
    // Get authorization header
    const authHeader = request.headers.get('authorization');
    
    // Check if user is authenticated
    const user = await isAuthenticated(authHeader || undefined);
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Only accelerators can view their startups
    if (user.role !== UserRole.ACCELERATOR) {
      return NextResponse.json(
        { error: 'Only accelerators can view startups' },
        { status: 403 }
      );
    }

    // Get startup by ID
    const startup = await prisma.startup.findUnique({
      where: {
        id: params.startupId,
        creatorId: user.userId, // Ensure the startup belongs to the user
      },
    });
    
    // Check if startup exists
    if (!startup) {
      return NextResponse.json(
        { error: 'Startup not found' },
        { status: 404 }
      );
    }
    
    // Return startup details
    return NextResponse.json({
      startup: {
        id: startup.id,
        name: startup.name,
        industry: startup.industry,
        stage: startup.stage,
        description: startup.description,
        problem: startup.problem,
        solution: startup.solution,
        targetMarket: startup.targetMarket,
        businessModel: startup.businessModel,
        competitiveAdvantage: startup.competitiveAdvantage,
        teamSize: startup.teamSize,
        fundingNeeds: startup.fundingNeeds,
        pitchDeckUrl: startup.pitchDeckUrl,
        status: startup.status,
        createdAt: startup.createdAt,
      },
    });
    
  } catch (error) {
    console.error('Get startup details error:', error);
    return NextResponse.json(
      { error: 'An error occurred while fetching startup details' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { startupId: string } }
) {
  try {
    // Get authorization header
    const authHeader = request.headers.get('authorization');
    
    // Check if user is authenticated
    const user = await isAuthenticated(authHeader || undefined);
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Only accelerators can update their startups
    if (user.role !== UserRole.ACCELERATOR) {
      return NextResponse.json(
        { error: 'Only accelerators can update startups' },
        { status: 403 }
      );
    }

    // Check if startup exists and belongs to the user
    const existingStartup = await prisma.startup.findUnique({
      where: {
        id: params.startupId,
        creatorId: user.userId,
      },
    });

    if (!existingStartup) {
      return NextResponse.json(
        { error: 'Startup not found' },
        { status: 404 }
      );
    }

    // Parse form data
    const formData = await request.formData();
    
    // Extract text fields
    const name = formData.get('name') as string;
    const industry = formData.get('industry') as string;
    const stage = formData.get('stage') as string;
    const description = formData.get('description') as string;
    const problem = formData.get('problem') as string;
    const solution = formData.get('solution') as string;
    const targetMarket = formData.get('targetMarket') as string;
    const businessModel = formData.get('businessModel') as string;
    const competitiveAdvantage = formData.get('competitiveAdvantage') as string;
    const teamSize = parseInt(formData.get('teamSize') as string) || 1;
    const fundingNeeds = formData.get('fundingNeeds') as string;
    
    // Extract file
    const pitchDeck = formData.get('pitchDeck') as File | null;
    
    // Validate required fields
    if (!name || !industry || !stage || !description || !problem || !solution) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }
    
    // Validate and save file if provided
    let pitchDeckPath: string | null = existingStartup.pitchDeckUrl;
    
    if (pitchDeck) {
      // Check file type
      if (!ALLOWED_FILE_TYPES.includes(pitchDeck.type)) {
        return NextResponse.json(
          { error: 'Invalid file type. Only PDF and PowerPoint files are allowed.' },
          { status: 400 }
        );
      }
      
      // Check file size
      if (pitchDeck.size > MAX_FILE_SIZE) {
        return NextResponse.json(
          { error: 'File size exceeds the maximum limit of 10MB.' },
          { status: 400 }
        );
      }
      
      // Create directory for uploads if it doesn't exist
      const uploadsDir = join(process.cwd(), 'public', 'uploads', 'pitchdecks');
      await mkdir(uploadsDir, { recursive: true });
      
      // Generate unique filename
      const fileExtension = pitchDeck.name.split('.').pop();
      const fileName = `${Date.now()}-${user.userId}.${fileExtension}`;
      const filePath = join(uploadsDir, fileName);
      
      // Save file
      const fileBuffer = await pitchDeck.arrayBuffer();
      await writeFile(filePath, Buffer.from(fileBuffer));
      
      // Set path for database
      pitchDeckPath = `/uploads/pitchdecks/${fileName}`;
    }
    
    // Update startup in database
    const updatedStartup = await prisma.startup.update({
      where: {
        id: params.startupId,
      },
      data: {
        name,
        industry,
        stage,
        description,
        problem,
        solution,
        targetMarket,
        businessModel,
        competitiveAdvantage,
        teamSize,
        fundingNeeds,
        pitchDeckUrl: pitchDeckPath,
      },
    });
    
    // Return success response
    return NextResponse.json({
      message: 'Startup updated successfully',
      startup: {
        id: updatedStartup.id,
        name: updatedStartup.name,
        industry: updatedStartup.industry,
        stage: updatedStartup.stage,
        status: updatedStartup.status,
      },
    });
    
  } catch (error) {
    console.error('Update startup error:', error);
    return NextResponse.json(
      { error: 'An error occurred while updating the startup' },
      { status: 500 }
    );
  }
}
