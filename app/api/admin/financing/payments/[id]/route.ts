import { NextRequest, NextResponse } from 'next/server'
import { isAuthenticated } from '@/lib/auth'
import { hasPermission } from '@/lib/permissions'

// Importing from the main payments API to reuse the data
import { paymentsData, PaymentItem } from '../route'

export const dynamic = 'force-dynamic';
// GET /api/admin/financing/payments/[id] - Get a single payment entry
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

    // Get the payment item with the specified ID
    const paymentItem = paymentsData.find((item: PaymentItem) => item.id === params.id)

    if (!paymentItem) {
      return NextResponse.json({ error: 'Payment not found' }, { status: 404 })
    }

    return NextResponse.json(paymentItem)
  } catch (error) {
    console.error('Error fetching payment item:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// PUT /api/admin/financing/payments/[id] - Update a payment entry
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

    // Find the index of the payment item to update
    const paymentIndex = paymentsData.findIndex((item: PaymentItem) => item.id === params.id)

    if (paymentIndex === -1) {
      return NextResponse.json({ error: 'Payment not found' }, { status: 404 })
    }

    // Parse the request body
    const updatedData = await request.json()

    // Validate required fields
    const requiredFields = [
      'invoiceNumber', 
      'amount', 
      'startupId', 
      'startupName', 
      'category', 
      'status', 
      'date', 
      'dueDate', 
      'description', 
      'createdBy'
    ]
    for (const field of requiredFields) {
      if (!updatedData[field]) {
        return NextResponse.json(
          { error: `Missing required field: ${field}` },
          { status: 400 }
        )
      }
    }

    // Update the payment item
    const updatedItem = {
      ...paymentsData[paymentIndex],
      ...updatedData,
      // Update paidDate and paymentMethod based on status
      paidDate: updatedData.status === 'مدفوع' ? (updatedData.paidDate || new Date().toISOString()) : null,
      paymentMethod: updatedData.status === 'مدفوع' ? (updatedData.paymentMethod || paymentsData[paymentIndex].paymentMethod) : null,
      updatedAt: new Date().toISOString()
    }

    // Replace the item in the array
    paymentsData[paymentIndex] = updatedItem

    return NextResponse.json({ 
      message: 'تم تحديث الدفعة بنجاح',
      data: updatedItem 
    })
  } catch (error) {
    console.error('Error updating payment item:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// DELETE /api/admin/financing/payments/[id] - Delete a payment entry
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

    // Find the index of the payment item to delete
    const paymentIndex = paymentsData.findIndex((item: PaymentItem) => item.id === params.id)

    if (paymentIndex === -1) {
      return NextResponse.json({ error: 'Payment not found' }, { status: 404 })
    }

    // Remove the item from the array
    paymentsData.splice(paymentIndex, 1)

    return NextResponse.json({ 
      message: 'تم حذف الدفعة بنجاح' 
    })
  } catch (error) {
    console.error('Error deleting payment item:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
