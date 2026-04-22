import { NextRequest, NextResponse } from 'next/server'
import { isAuthenticated } from '@/lib/auth'
import { hasPermission } from '@/lib/permissions'
import { prisma } from '@/lib/prisma'

// GET /api/admin/financing/funding/[id] - Get a single funding entry
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Authentication
    const authHeader = request.headers.get('authorization')
    const user = await isAuthenticated(authHeader || undefined)
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Permission check
    const hasRequiredPermission = await hasPermission(user.userId, {
      category: 'financing',
      action: 'view'
    })

    if (!hasRequiredPermission) {
      return NextResponse.json({ error: 'Forbidden - Insufficient permissions' }, { status: 403 })
    }

    // Get the funding item with the specified ID from the database
    const fundingItem = await prisma.funding.findUnique({
      where: { id: params.id }
    })

    if (!fundingItem) {
      return NextResponse.json({ error: 'Funding not found' }, { status: 404 })
    }

    // Format the response
    const formattedFunding = {
      ...fundingItem,
      date: fundingItem.date.toISOString().split('T')[0],
      createdAt: fundingItem.createdAt.toISOString(),
      updatedAt: fundingItem.updatedAt.toISOString()
    }

    return NextResponse.json(formattedFunding)
  } catch (error) {
    console.error('Error fetching funding item:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// PUT /api/admin/financing/funding/[id] - Update a funding entry
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Authentication
    const authHeader = request.headers.get('authorization')
    const user = await isAuthenticated(authHeader || undefined)
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Permission check
    const hasRequiredPermission = await hasPermission(user.userId, {
      category: 'financing',
      action: 'edit'
    })

    if (!hasRequiredPermission) {
      return NextResponse.json({ error: 'Forbidden - Insufficient permissions' }, { status: 403 })
    }

    // Check if the funding item exists
    const existingFunding = await prisma.funding.findUnique({
      where: { id: params.id }
    })

    if (!existingFunding) {
      return NextResponse.json({ error: 'Funding not found' }, { status: 404 })
    }

    // Parse the request body
    const updatedData = await request.json()

    // Validate required fields
    const requiredFields = ['title', 'amount', 'startupId', 'startupName', 'fundingType', 'investorName', 'date', 'status']
    for (const field of requiredFields) {
      if (!updatedData[field]) {
        return NextResponse.json(
          { error: `Missing required field: ${field}` },
          { status: 400 }
        )
      }
    }

    // Update the funding item in the database
    const updatedItem = await prisma.funding.update({
      where: { id: params.id },
      data: {
        title: updatedData.title,
        amount: updatedData.amount,
        startupId: updatedData.startupId,
        startupName: updatedData.startupName,
        status: updatedData.status,
        date: new Date(updatedData.date),
        fundingType: updatedData.fundingType,
        investorName: updatedData.investorName,
        description: updatedData.description || ''
      }
    })

    // Format the response
    const formattedFunding = {
      ...updatedItem,
      date: updatedItem.date.toISOString().split('T')[0],
      createdAt: updatedItem.createdAt.toISOString(),
      updatedAt: updatedItem.updatedAt.toISOString()
    }

    return NextResponse.json({ 
      message: 'تم تحديث التمويل بنجاح',
      data: formattedFunding 
    })
  } catch (error) {
    console.error('Error updating funding item:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// DELETE /api/admin/financing/funding/[id] - Delete a funding entry
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Authentication
    const authHeader = request.headers.get('authorization')
    const user = await isAuthenticated(authHeader || undefined)
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Permission check
    const hasRequiredPermission = await hasPermission(user.userId, {
      category: 'financing',
      action: 'delete'
    })

    if (!hasRequiredPermission) {
      return NextResponse.json({ error: 'Forbidden - Insufficient permissions' }, { status: 403 })
    }

    // Check if the funding item exists
    const existingFunding = await prisma.funding.findUnique({
      where: { id: params.id }
    })

    if (!existingFunding) {
      return NextResponse.json({ error: 'Funding not found' }, { status: 404 })
    }

    // Delete the funding item from the database
    await prisma.funding.delete({
      where: { id: params.id }
    })

    return NextResponse.json({ 
      message: 'تم حذف التمويل بنجاح' 
    })
  } catch (error) {
    console.error('Error deleting funding item:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
