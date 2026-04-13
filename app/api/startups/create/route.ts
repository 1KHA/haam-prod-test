import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { isAuthenticated, UserRole } from '@/lib/auth';
import { writeFile } from 'fs/promises';
import { join } from 'path';
import { mkdir } from 'fs/promises';
import { notifyStartupCreated } from '@/lib/services/notification-events';

// Define the allowed file types
const ALLOWED_FILE_TYPES = [
  'application/pdf',
  'application/vnd.ms-powerpoint',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation'
];

// Maximum file size (10MB)
const MAX_FILE_SIZE = 10 * 1024 * 1024;

export async function POST(request: NextRequest) {
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

    // Only entrepreneurs can create startups
    if (user.role !== UserRole.ENTREPRENEUR) {
      return NextResponse.json(
        { error: 'Only entrepreneurs can create startups' },
        { status: 403 }
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
    let pitchDeckPath: string | null = null;
    
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
    
    // Create startup in database
    const startup = await prisma.startup.create({
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
        creatorId: user.userId,
        status: 'PENDING',
      },
    });

    // Notify Program Managers about new startup
    try {
      const programManagers = await prisma.user.findMany({
        where: { role: 'PROGRAM_MANAGER' },
        select: { id: true },
      });

      if (programManagers.length > 0) {
        await notifyStartupCreated({
          startupId: startup.id,
          startupName: startup.name,
          startupDescription: startup.description,
          founderId: user.userId,
          founderName: user.name || user.email,
          programManagerIds: programManagers.map(pm => pm.id),
        });
      }
    } catch (notifyError) {
      console.error('[Create Startup] Failed to send notifications:', notifyError);
      // Don't fail the request if notification fails
    }
    
    // Return success response
    return NextResponse.json({
      message: 'Startup created successfully',
      startup: {
        id: startup.id,
        name: startup.name,
        industry: startup.industry,
        stage: startup.stage,
        status: startup.status,
      },
    });
    
  } catch (error) {
    console.error('Create startup error:', error);
    return NextResponse.json(
      { error: 'An error occurred while creating the startup' },
      { status: 500 }
    );
  }
}
