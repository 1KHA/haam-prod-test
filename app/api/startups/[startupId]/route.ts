import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { isAuthenticated, UserRole } from '@/lib/auth';
import { writeFile } from 'fs/promises';
import { join } from 'path';
import { mkdir } from 'fs/promises';

export const dynamic = 'force-dynamic';
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

    // Only entrepreneurs can view their own companies
    if (user.role !== UserRole.ENTREPRENEUR) {
      return NextResponse.json(
        { error: 'Only entrepreneurs can view their own companies' },
        { status: 403 }
      );
    }

    // Get company by ID (must belong to the entrepreneur)
    const company = await prisma.startup.findUnique({
      where: {
        id: params.startupId,
        creatorId: user.userId, // Ensure the company belongs to the entrepreneur
      },
    });
    
    // Check if company exists
    if (!company) {
      return NextResponse.json(
        { error: 'Company not found' },
        { status: 404 }
      );
    }
    
    // Return company details
    return NextResponse.json({
      company: {
        id: company.id,
        name: company.name,
        industry: company.industry,
        stage: company.stage,
        description: company.description,
        problem: company.problem,
        solution: company.solution,
        targetMarket: company.targetMarket,
        businessModel: company.businessModel,
        competitiveAdvantage: company.competitiveAdvantage,
        teamSize: company.teamSize,
        fundingNeeds: company.fundingNeeds,
        pitchDeckUrl: company.pitchDeckUrl,
        status: company.status,
        createdAt: company.createdAt,
      },
    });
    
  } catch (error) {
    console.error('Get company details error:', error);
    return NextResponse.json(
      { error: 'An error occurred while fetching company details' },
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

    // Only entrepreneurs can update their own companies
    if (user.role !== UserRole.ENTREPRENEUR) {
      return NextResponse.json(
        { error: 'Only entrepreneurs can update their own companies' },
        { status: 403 }
      );
    }

    // Check if company exists and belongs to the entrepreneur
    const existingCompany = await prisma.startup.findUnique({
      where: {
        id: params.startupId,
        creatorId: user.userId,
      },
    });

    if (!existingCompany) {
      return NextResponse.json(
        { error: 'Company not found' },
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
    let pitchDeckPath: string | null = existingCompany.pitchDeckUrl;
    
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
    
    // Update company in database
    const updatedCompany = await prisma.startup.update({
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
      message: 'Company updated successfully',
      company: {
        id: updatedCompany.id,
        name: updatedCompany.name,
        industry: updatedCompany.industry,
        stage: updatedCompany.stage,
        status: updatedCompany.status,
      },
    });
    
  } catch (error) {
    console.error('Update company error:', error);
    return NextResponse.json(
      { error: 'An error occurred while updating the company' },
      { status: 500 }
    );
  }
}
