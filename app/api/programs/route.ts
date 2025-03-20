import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { isAuthenticated } from '@/lib/auth';

// GET /api/programs - Get all active programs
export async function GET(request: NextRequest) {
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

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';
    const type = searchParams.get('type') || undefined;
    
    // Build the where clause for filtering
    const where: any = {
      status: 'ACTIVE' // Only show active programs
    };
    
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } }
      ];
    }
    
    if (type) {
      where.type = type;
    }
    
    // Get programs
    const programs = await prisma.program.findMany({
      where,
      select: {
        id: true,
        name: true,
        type: true,
        description: true,
        startDate: true,
        endDate: true,
        location: true,
        capacity: true,
        _count: {
          select: {
            cohorts: true
          }
        }
      },
      take: limit,
      orderBy: { name: 'asc' }
    });
    
    // Transform the programs
    const transformedPrograms = programs.map(program => ({
      id: program.id,
      name: program.name,
      type: program.type,
      description: program.description,
      startDate: program.startDate,
      endDate: program.endDate,
      location: program.location,
      capacity: program.capacity,
      cohortsCount: program._count.cohorts
    }));
    
    return NextResponse.json({
      programs: transformedPrograms
    });
  } catch (error) {
    console.error('Error fetching programs:', error);
    return NextResponse.json(
      { error: 'Failed to fetch programs' },
      { status: 500 }
    );
  }
}
