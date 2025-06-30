import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';
import { UserRole } from '@/lib/auth';

// GET /api/funding/[id] - Get a specific funding opportunity
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession();
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user || user.role !== UserRole.ENTREPRENEUR) {
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

    if (fundingOpportunity.entrepreneurId !== user.id) {
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
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession();
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user || user.role !== UserRole.ENTREPRENEUR) {
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

    if (fundingOpportunity.entrepreneurId !== user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { title, description, amount, type, requirements, deadline } = body;

    // Validate funding type
    const validTypes = ['GRANT', 'INVESTMENT', 'LOAN'];
    if (type && !validTypes.includes(type)) {
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
        type,
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
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession();
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user || user.role !== UserRole.ENTREPRENEUR) {
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

    if (fundingOpportunity.entrepreneurId !== user.id) {
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
