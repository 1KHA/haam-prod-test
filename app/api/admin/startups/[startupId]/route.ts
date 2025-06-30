import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { isAuthenticated, UserRole } from '@/lib/auth';

// GET /api/admin/startups/[startupId] - Get a specific startup by ID
export async function GET(
  request: NextRequest,
  { params }: { params: { startupId: string } }
) {
  try {
    // Get authorization header
    const authHeader = request.headers.get('authorization');
    
    // Check if user is authenticated and is an admin
    const user = await isAuthenticated(authHeader || undefined);
    if (!user || user.role !== UserRole.ADMIN) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { startupId } = params;
    
    // Get the startup
    const startup = await prisma.startup.findUnique({
      where: { id: startupId },
      include: {
        creator: {
          select: {
            id: true,
            name: true,
            email: true,
            entrepreneurProfile: {
              select: {
                organizationName: true,
                industry: true,
                focusAreas: true,
                programLength: true,
                website: true,
                description: true
              }
            }
          }
        }
      }
    });
    
    if (!startup) {
      return NextResponse.json(
        { error: 'Startup not found' },
        { status: 404 }
      );
    }
    
    // Transform the startup to include additional information
    const transformedStartup = {
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
      updatedAt: startup.updatedAt,
      creator: {
        id: startup.creator.id,
        name: startup.creator.name,
        email: startup.creator.email,
        entrepreneur: startup.creator.entrepreneurProfile ? {
          name: startup.creator.entrepreneurProfile.organizationName,
          industry: startup.creator.entrepreneurProfile.industry,
          focusAreas: startup.creator.entrepreneurProfile.focusAreas,
          programLength: startup.creator.entrepreneurProfile.programLength,
          website: startup.creator.entrepreneurProfile.website,
          description: startup.creator.entrepreneurProfile.description
        } : null
      }
    };
    
    return NextResponse.json(transformedStartup);
  } catch (error) {
    console.error('Error fetching startup:', error);
    return NextResponse.json(
      { error: 'Failed to fetch startup' },
      { status: 500 }
    );
  }
}

// PUT /api/admin/startups/[startupId] - Update a specific startup
export async function PUT(
  request: NextRequest,
  { params }: { params: { startupId: string } }
) {
  try {
    // Get authorization header
    const authHeader = request.headers.get('authorization');
    
    // Check if user is authenticated and is an admin
    const user = await isAuthenticated(authHeader || undefined);
    if (!user || user.role !== UserRole.ADMIN) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { startupId } = params;
    
    // Check if startup exists
    const existingStartup = await prisma.startup.findUnique({
      where: { id: startupId },
      select: { id: true }
    });
    
    if (!existingStartup) {
      return NextResponse.json(
        { error: 'Startup not found' },
        { status: 404 }
      );
    }
    
    // Get request body
    const body = await request.json();
    const { 
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
      pitchDeckUrl, 
      status,
      creatorId 
    } = body;
    
    // Prepare update data
    const updateData: any = {};
    
    if (name !== undefined) updateData.name = name;
    if (industry !== undefined) updateData.industry = industry;
    if (stage !== undefined) updateData.stage = stage;
    if (description !== undefined) updateData.description = description;
    if (problem !== undefined) updateData.problem = problem;
    if (solution !== undefined) updateData.solution = solution;
    if (targetMarket !== undefined) updateData.targetMarket = targetMarket;
    if (businessModel !== undefined) updateData.businessModel = businessModel;
    if (competitiveAdvantage !== undefined) updateData.competitiveAdvantage = competitiveAdvantage;
    if (teamSize !== undefined) updateData.teamSize = teamSize;
    if (fundingNeeds !== undefined) updateData.fundingNeeds = fundingNeeds;
    if (pitchDeckUrl !== undefined) updateData.pitchDeckUrl = pitchDeckUrl;
    if (status !== undefined) updateData.status = status;
    
    // If changing creator, check if new creator exists and is an entrepreneur
    if (creatorId !== undefined) {
      const creator = await prisma.user.findUnique({
        where: { id: creatorId },
        select: { id: true, role: true }
      });
      
      if (!creator) {
        return NextResponse.json(
          { error: 'Creator not found' },
          { status: 404 }
        );
      }
      
      if (creator.role !== UserRole.ENTREPRENEUR) {
        return NextResponse.json(
          { error: 'Creator must be an entrepreneur' },
          { status: 400 }
        );
      }
      
      updateData.creatorId = creatorId;
    }
    
    // Update the startup
    const updatedStartup = await prisma.startup.update({
      where: { id: startupId },
      data: updateData,
      include: {
        creator: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });
    
    return NextResponse.json(updatedStartup);
  } catch (error) {
    console.error('Error updating startup:', error);
    return NextResponse.json(
      { error: 'Failed to update startup' },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/startups/[startupId] - Delete a specific startup
export async function DELETE(
  request: NextRequest,
  { params }: { params: { startupId: string } }
) {
  try {
    // Get authorization header
    const authHeader = request.headers.get('authorization');
    
    // Check if user is authenticated and is an admin
    const user = await isAuthenticated(authHeader || undefined);
    if (!user || user.role !== UserRole.ADMIN) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { startupId } = params;
    
    // Check if startup exists
    const existingStartup = await prisma.startup.findUnique({
      where: { id: startupId },
      select: { id: true }
    });
    
    if (!existingStartup) {
      return NextResponse.json(
        { error: 'Startup not found' },
        { status: 404 }
      );
    }
    
    // Delete the startup
    await prisma.startup.delete({
      where: { id: startupId }
    });
    
    return NextResponse.json({
      success: true,
      message: 'Startup deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting startup:', error);
    return NextResponse.json(
      { error: 'Failed to delete startup' },
      { status: 500 }
    );
  }
}
