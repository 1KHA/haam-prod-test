import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { isAuthenticated, UserRole } from '@/lib/auth';

export const dynamic = 'force-dynamic';
// GET /api/funding/[id] - Get a specific funding opportunity
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authHeader = request.headers.get('authorization') ?? undefined;
    const user = await isAuthenticated(authHeader);

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (user.role !== UserRole.ENTREPRENEUR) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const fundingOpportunity = await prisma.fundingOpportunity.findUnique({
      where: { id: params.id },
    });

    if (!fundingOpportunity) {
      return NextResponse.json(
        { error: 'Funding opportunity not found' },
        { status: 404 }
      );
    }

    if (fundingOpportunity.entrepreneurId !== user.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    return NextResponse.json(fundingOpportunity);
  } catch (error) {
    console.error('Error fetching funding opportunity:', error);
    return NextResponse.json(
      { error: 'Failed to fetch funding opportunity' },
      { status: 500 }
    );
  }
}

// PUT /api/funding/[id] - Update a funding opportunity
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authHeader = request.headers.get('authorization') ?? undefined;
    const user = await isAuthenticated(authHeader);

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (user.role !== UserRole.ENTREPRENEUR) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const fundingOpportunity = await prisma.fundingOpportunity.findUnique({
      where: { id: params.id },
    });

    if (!fundingOpportunity) {
      return NextResponse.json(
        { error: 'Funding opportunity not found' },
        { status: 404 }
      );
    }

    if (fundingOpportunity.entrepreneurId !== user.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { title, description, amount, fundingType, requirements, deadline } = body;

    // Validate funding type
    const validTypes = ['GRANT', 'INVESTMENT', 'LOAN'];
    if (fundingType && !validTypes.includes(fundingType)) {
      return NextResponse.json(
        { error: 'Invalid funding type' },
        { status: 400 }
      );
    }

    const updatedFundingOpportunity = await prisma.fundingOpportunity.update({
      where: { id: params.id },
      data: {
        title,
        description,
        amount,
        fundingType,
        requirements,
        deadline: deadline ? new Date(deadline) : undefined,
      },
    });

    return NextResponse.json(updatedFundingOpportunity);
  } catch (error) {
    console.error('Error updating funding opportunity:', error);
    return NextResponse.json(
      { error: 'Failed to update funding opportunity' },
      { status: 500 }
    );
  }
}

// DELETE /api/funding/[id] - Delete a funding opportunity
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authHeader = request.headers.get('authorization') ?? undefined;
    const user = await isAuthenticated(authHeader);

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (user.role !== UserRole.ENTREPRENEUR) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const fundingOpportunity = await prisma.fundingOpportunity.findUnique({
      where: { id: params.id },
    });

    if (!fundingOpportunity) {
      return NextResponse.json(
        { error: 'Funding opportunity not found' },
        { status: 404 }
      );
    }

    if (fundingOpportunity.entrepreneurId !== user.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await prisma.fundingOpportunity.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ message: 'Funding opportunity deleted successfully' });
  } catch (error) {
    console.error('Error deleting funding opportunity:', error);
    return NextResponse.json(
      { error: 'Failed to delete funding opportunity' },
      { status: 500 }
    );
  }
}