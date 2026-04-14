import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { checkPermission } from '@/lib/permissions';
import { notifyProgramCreated } from '@/lib/services/notification-events';

// GET /api/admin/programs - Get all programs with pagination and filtering
export async function GET(request: NextRequest) {
  try {
    // Check permission
    const permissionCheck = await checkPermission(request, { category: 'programs', action: 'view' });
    if (!permissionCheck.authorized) {
      return NextResponse.json(
        { error: permissionCheck.error },
        { status: 403 }
      );
    }

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';
    const status = searchParams.get('status') || undefined;
    const type = searchParams.get('type') || undefined;
    
    const skip = (page - 1) * limit;
    
    // Build the where clause for filtering
    const where: any = {};
    
    if (search) {
      where.OR = [
        { name: { contains: search } },
        { description: { contains: search } },
        { location: { contains: search } }
      ];
    }
    
    if (status) {
      where.status = status;
    }
    
    if (type) {
      where.type = type;
    }
    
    // Get programs with pagination
    const programs = await prisma.program.findMany({
      where,
      include: {
        creator: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        cohorts: {
          select: {
            id: true,
            name: true,
            status: true,
            _count: {
              select: {
                members: true
              }
            }
          }
        },
        _count: {
          select: {
            cohorts: true
          }
        }
      },
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' }
    });
    
    // Get total count for pagination
    const total = await prisma.program.count({ where });
    
    // Transform the programs to include additional information
    const transformedPrograms = programs.map(program => {
      const activeCohortsCount = program.cohorts.filter(c => c.status === 'ACTIVE').length;
      const totalStartups = program.cohorts.reduce((acc, cohort) => acc + cohort._count.members, 0);
      
      return {
        id: program.id,
        name: program.name,
        description: program.description,
        startDate: program.startDate,
        endDate: program.endDate,
        location: program.location,
        type: program.type,
        status: program.status,
        capacity: program.capacity,
        applicationDeadline: program.applicationDeadline,
        requirements: program.requirements,
        benefits: program.benefits,
        createdAt: program.createdAt,
        updatedAt: program.updatedAt,
        creator: {
          id: program.creator.id,
          name: program.creator.name,
          email: program.creator.email
        },
        stats: {
          cohortsCount: program._count.cohorts,
          activeCohortsCount,
          totalStartups
        }
      };
    });
    
    // Get statistics
    const statistics = await getProgramStatistics();
    
    return NextResponse.json({
      programs: transformedPrograms,
      statistics,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching programs:', error);
    return NextResponse.json(
      { error: 'Failed to fetch programs' },
      { status: 500 }
    );
  }
}

// POST /api/admin/programs - Create a new program
export async function POST(request: NextRequest) {
  try {
    // Check permission
    const permissionCheck = await checkPermission(request, { category: 'programs', action: 'add' });
    if (!permissionCheck.authorized) {
      return NextResponse.json(
        { error: permissionCheck.error },
        { status: 403 }
      );
    }

    // Get request body
    const body = await request.json();
    const { 
      name, 
      description, 
      startDate, 
      endDate, 
      location, 
      type, 
      status, 
      capacity, 
      applicationDeadline, 
      requirements, 
      benefits
    } = body;
    
    // Validate required fields
    if (!name || !type) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }
    
    // Create the program
    const program = await prisma.program.create({
      data: {
        name,
        description,
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null,
        location,
        type,
        status: status || 'DRAFT',
        capacity,
        applicationDeadline: applicationDeadline ? new Date(applicationDeadline) : null,
        requirements,
        benefits,
        creatorId: permissionCheck.userId!
      },
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

    // Notify all Program Managers about the new program
    console.log(`[Programs API] Notifying Program Managers about new program...`);
    try {
      const programManagers = await prisma.user.findMany({
        where: { role: 'PROGRAM_MANAGER' },
        select: { id: true },
      });

      console.log(`[Programs API] Found ${programManagers.length} Program Managers`);

      if (programManagers.length > 0) {
        const recipientIds = programManagers.map(pm => pm.id);
        console.log(`[Programs API] Sending program creation notification to: ${JSON.stringify(recipientIds)}`);
        console.log(`[Programs API] Program details: ${program.name} (${program.type})`);
        console.log(`[Programs API] Created by: ${permissionCheck.userId}`);
        
        await notifyProgramCreated({
          programId: program.id,
          programName: program.name,
          programType: program.type,
          recipientIds,
          createdBy: permissionCheck.userId,
        });
        console.log(`[Programs API] Program creation notification sent successfully`);
      } else {
        console.log(`[Programs API] No Program Managers found, skipping notification`);
      }
    } catch (notifyError: any) {
      console.error('[Programs API] Failed to send program creation notification:', notifyError.message);
      console.error('[Programs API] Stack:', notifyError.stack);
    }
    
    return NextResponse.json(program, { status: 201 });
  } catch (error) {
    console.error('Error creating program:', error);
    return NextResponse.json(
      { error: 'Failed to create program' },
      { status: 500 }
    );
  }
}

// PUT /api/admin/programs - Bulk update programs
export async function PUT(request: NextRequest) {
  try {
    // Check permission
    const permissionCheck = await checkPermission(request, { category: 'programs', action: 'edit' });
    if (!permissionCheck.authorized) {
      return NextResponse.json(
        { error: permissionCheck.error },
        { status: 403 }
      );
    }

    // Get request body
    const body = await request.json();
    const { programIds, action, data } = body;
    
    if (!programIds || !Array.isArray(programIds) || programIds.length === 0) {
      return NextResponse.json(
        { error: 'No programs specified' },
        { status: 400 }
      );
    }
    
    if (!action) {
      return NextResponse.json(
        { error: 'No action specified' },
        { status: 400 }
      );
    }
    
    let result;
    
    switch (action) {
      case 'updateStatus':
        if (!data.status) {
          return NextResponse.json(
            { error: 'No status specified' },
            { status: 400 }
          );
        }
        
        result = await prisma.$transaction(
          programIds.map(id => 
            prisma.program.update({
              where: { id },
              data: { status: data.status },
              select: { id: true }
            })
          )
        );
        break;
        
      case 'delete':
        result = await prisma.$transaction(
          programIds.map(id => 
            prisma.program.delete({
              where: { id },
              select: { id: true }
            })
          )
        );
        break;
        
      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        );
    }
    
    return NextResponse.json({
      success: true,
      count: result.length,
      action
    });
  } catch (error) {
    console.error('Error updating programs:', error);
    return NextResponse.json(
      { error: 'Failed to update programs' },
      { status: 500 }
    );
  }
}

// Helper function to get program statistics
async function getProgramStatistics() {
  // Get total programs
  const totalPrograms = await prisma.program.count();
  
  // Get programs by status
  const draftPrograms = await prisma.program.count({
    where: { status: 'DRAFT' }
  });
  
  const activePrograms = await prisma.program.count({
    where: { status: 'ACTIVE' }
  });
  
  const completedPrograms = await prisma.program.count({
    where: { status: 'COMPLETED' }
  });
  
  const cancelledPrograms = await prisma.program.count({
    where: { status: 'CANCELLED' }
  });
  
  // Get programs by type
  const programTypes = await prisma.program.groupBy({
    by: ['type'],
    _count: {
      type: true
    }
  });
  
  // Get total cohorts
  const totalCohorts = await prisma.cohort.count();
  
  // Get active cohorts
  const activeCohorts = await prisma.cohort.count({
    where: { status: 'ACTIVE' }
  });
  
  // Get total startups in cohorts
  const totalStartups = await prisma.cohortMember.count();
  
  return {
    total: totalPrograms,
    draft: draftPrograms,
    active: activePrograms,
    completed: completedPrograms,
    cancelled: cancelledPrograms,
    types: programTypes.map(t => ({
      name: t.type,
      count: t._count.type
    })),
    cohorts: {
      total: totalCohorts,
      active: activeCohorts
    },
    startups: totalStartups
  };
}
