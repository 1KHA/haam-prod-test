import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { checkPermission } from '@/lib/permissions';

// GET /api/admin/cohorts - Get all cohorts with pagination and filtering
export async function GET(request: NextRequest) {
  try {
    const permissionCheck = await checkPermission(request, { category: 'programs', action: 'view' });
    if (!permissionCheck.authorized) {
      return NextResponse.json({ error: permissionCheck.error }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';
    const status = searchParams.get('status') || undefined;
    const programId = searchParams.get('programId') || undefined;
    
    const skip = (page - 1) * limit;
    const where: any = {};
    
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } }
      ];
    }
    
    if (status) where.status = status;
    if (programId) where.programId = programId;

    const cohorts = await prisma.cohort.findMany({
      where,
      include: {
        program: { select: { id: true, name: true, type: true } },
        manager: { select: { id: true, name: true, email: true } },
        _count: { select: { members: true, mentors: true } }
      },
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' }
    });
    
    const total = await prisma.cohort.count({ where });
    
    const transformedCohorts = cohorts.map(cohort => ({
      id: cohort.id,
      name: cohort.name,
      description: cohort.description,
      startDate: cohort.startDate,
      endDate: cohort.endDate,
      status: cohort.status,
      capacity: cohort.capacity,
      program: cohort.program,
      manager: cohort.manager,
      stats: { membersCount: cohort._count.members, mentorsCount: cohort._count.mentors },
      createdAt: cohort.createdAt,
      updatedAt: cohort.updatedAt
    }));
    
    const statistics = await getCohortStatistics(programId);
    
    return NextResponse.json({
      cohorts: transformedCohorts,
      statistics,
      pagination: { total, page, limit, totalPages: Math.ceil(total / limit) }
    });
  } catch (error) {
    console.error('Error fetching cohorts:', error);
    return NextResponse.json({ error: 'Failed to fetch cohorts' }, { status: 500 });
  }
}

// POST /api/admin/cohorts - Create a new cohort
export async function POST(request: NextRequest) {
  try {
    const permissionCheck = await checkPermission(request, { category: 'programs', action: 'add' });
    if (!permissionCheck.authorized) {
      return NextResponse.json({ error: permissionCheck.error }, { status: 403 });
    }

    const body = await request.json();
    const { name, description, startDate, endDate, status, capacity, programId, managerId } = body;
    
    if (!name || !startDate || !endDate || !programId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }
    
    const program = await prisma.program.findUnique({ where: { id: programId } });
    if (!program) {
      return NextResponse.json({ error: 'Program not found' }, { status: 404 });
    }

    const cohort = await prisma.cohort.create({
      data: {
        name,
        description,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        status: status || 'UPCOMING',
        capacity,
        programId,
        managerId: managerId || permissionCheck.userId!
      },
      include: {
        program: { select: { id: true, name: true, type: true } },
        manager: { select: { id: true, name: true, email: true } },
        _count: { select: { members: true, mentors: true } }
      }
    });
    
    return NextResponse.json(cohort, { status: 201 });
  } catch (error) {
    console.error('Error creating cohort:', error);
    return NextResponse.json({ error: 'Failed to create cohort' }, { status: 500 });
  }
}

// PUT /api/admin/cohorts - Bulk update cohorts
export async function PUT(request: NextRequest) {
  try {
    const permissionCheck = await checkPermission(request, { category: 'programs', action: 'edit' });
    if (!permissionCheck.authorized) {
      return NextResponse.json({ error: permissionCheck.error }, { status: 403 });
    }

    const body = await request.json();
    const { cohortIds, action, data } = body;
    
    if (!cohortIds || !Array.isArray(cohortIds) || cohortIds.length === 0) {
      return NextResponse.json({ error: 'No cohorts specified' }, { status: 400 });
    }
    
    if (!action) {
      return NextResponse.json({ error: 'No action specified' }, { status: 400 });
    }

    let result;
    switch (action) {
      case 'updateStatus':
        if (!data.status) return NextResponse.json({ error: 'No status specified' }, { status: 400 });
        result = await prisma.$transaction(cohortIds.map(id => 
          prisma.cohort.update({ where: { id }, data: { status: data.status }, select: { id: true } })
        ));
        break;
      case 'delete':
        result = await prisma.$transaction(cohortIds.map(id => 
          prisma.cohort.delete({ where: { id }, select: { id: true } })
        ));
        break;
      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
    
    return NextResponse.json({ success: true, count: result.length, action });
  } catch (error) {
    console.error('Error updating cohorts:', error);
    return NextResponse.json({ error: 'Failed to update cohorts' }, { status: 500 });
  }
}

async function getCohortStatistics(programIdFilter?: string) {
  const whereClause = programIdFilter ? { programId: programIdFilter } : {};
  const totalCohorts = await prisma.cohort.count({ where: whereClause });
  const upcomingCohorts = await prisma.cohort.count({ where: { ...whereClause, status: 'UPCOMING' } });
  const activeCohorts = await prisma.cohort.count({ where: { ...whereClause, status: 'ACTIVE' } });
  const completedCohorts = await prisma.cohort.count({ where: { ...whereClause, status: 'COMPLETED' } });
  
  const cohortIds = await prisma.cohort.findMany({ where: whereClause, select: { id: true } });
  const totalStartups = await prisma.cohortMember.count({ where: { cohortId: { in: cohortIds.map(c => c.id) } } });
  
  const programs = await prisma.program.findMany({
    where: programIdFilter ? { id: programIdFilter } : {},
    select: { id: true, name: true, type: true, _count: { select: { cohorts: true } } }
  });
  
  return {
    total: totalCohorts,
    upcoming: upcomingCohorts,
    active: activeCohorts,
    completed: completedCohorts,
    startups: totalStartups,
    programs: programs.map(p => ({ id: p.id, name: p.name, type: p.type, cohortsCount: p._count.cohorts }))
  };
}
