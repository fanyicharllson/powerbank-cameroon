import { NextRequest, NextResponse } from 'next/server'
import { prisma, type OrderStatus, type PaymentStatus } from '@stael/db'
import { getAdminSessionFromRequest, unauthorized } from '@/lib/auth'

const paymentMethods: Record<string, string> = {
  MTN_MOMO: 'mtn',
  ORANGE_MONEY: 'orange',
  CASH: 'cod',
}

type Params = { params: Promise<{ orderNumber: string }> }

export async function GET(request: NextRequest, context: Params) {
  if (!getAdminSessionFromRequest(request)) return unauthorized()
  const { orderNumber } = await context.params

  try {
    const order = await prisma.order.findUnique({
      where: { orderNumber },
      include: {
        items: { orderBy: { id: 'asc' } },
        installments: { orderBy: { installmentNumber: 'asc' } },
        owner: { select: { id: true, createdAt: true, lastSeenAt: true } },
      },
    })
    if (!order) {
      return NextResponse.json({ error: { code: 'NOT_FOUND', message: 'Order not found.' } }, { status: 404 })
    }

    return NextResponse.json({
      order: {
        orderNumber: order.orderNumber,
        status: order.status,
        createdAt: order.createdAt.toISOString(),
        customer: { fullName: order.fullName, phone: order.phone },
        delivery: {
          region: order.region,
          city: order.city,
          quarter: order.quarter,
          address: order.address,
          landmark: order.landmark,
        },
        paymentMethod: paymentMethods[order.paymentMethod],
        installmentMonths: order.installmentMonths,
        subtotal: order.subtotal,
        markupAmount: order.installmentTotal - order.subtotal,
        installmentTotal: order.installmentTotal,
        monthlyPayment: order.monthlyPayment,
        firstPayment: order.firstPayment,
        amountPaid: order.amountPaid,
        owner: order.owner,
        items: order.items.map((item) => ({
          productId: item.productId,
          name: item.productName,
          capacity: item.productCapacity,
          image: item.productImage,
          unitPrice: item.unitPrice,
          quantity: item.quantity,
          lineTotal: item.lineTotal,
        })),
        installments: order.installments.map((item) => ({
          id: item.id,
          number: item.installmentNumber,
          amount: item.amount,
          dueDate: item.dueDate.toISOString(),
          status: item.status,
          paidAt: item.paidAt?.toISOString() || null,
          transactionRef: item.transactionRef,
        })),
      },
    })
  } catch (error) {
    console.error('Admin order detail failed', error)
    return NextResponse.json({ error: { code: 'ORDER_DETAIL_FAILED', message: 'Could not load order.' } }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest, context: Params) {
  if (!getAdminSessionFromRequest(request)) return unauthorized()
  const { orderNumber } = await context.params

  try {
    const body = await request.json()
    const status = body.status as OrderStatus | undefined
    const markInstallmentPaid = Number(body.markInstallmentPaid || 0)
    const transactionRef = body.transactionRef ? String(body.transactionRef).slice(0, 120) : null

    const existing = await prisma.order.findUnique({
      where: { orderNumber },
      include: { installments: { orderBy: { installmentNumber: 'asc' } } },
    })
    if (!existing) {
      return NextResponse.json({ error: { code: 'NOT_FOUND', message: 'Order not found.' } }, { status: 404 })
    }

    const updated = await prisma.$transaction(async (tx) => {
      if (markInstallmentPaid > 0) {
        const installment = existing.installments.find((item) => item.installmentNumber === markInstallmentPaid)
        if (!installment) throw new Error('INSTALLMENT_NOT_FOUND')
        if (installment.status !== 'PAID') {
          await tx.installmentPayment.update({
            where: { id: installment.id },
            data: {
              status: 'PAID' as PaymentStatus,
              paidAt: new Date(),
              transactionRef,
            },
          })
        }
      }

      const installments = await tx.installmentPayment.findMany({
        where: { orderId: existing.id },
        orderBy: { installmentNumber: 'asc' },
      })
      const amountPaid = installments.filter((item) => item.status === 'PAID').reduce((sum, item) => sum + item.amount, 0)
      const allPaid = installments.every((item) => item.status === 'PAID')
      const anyPaid = installments.some((item) => item.status === 'PAID')

      let nextStatus: OrderStatus = existing.status
      if (status) nextStatus = status
      else if (allPaid) nextStatus = 'PAID'
      else if (anyPaid) nextStatus = 'PAYMENT_IN_PROGRESS'
      else nextStatus = 'PENDING_PAYMENT'

      return tx.order.update({
        where: { id: existing.id },
        data: { amountPaid, status: nextStatus },
        include: {
          items: { orderBy: { id: 'asc' } },
          installments: { orderBy: { installmentNumber: 'asc' } },
        },
      })
    })

    return NextResponse.json({
      order: {
        orderNumber: updated.orderNumber,
        status: updated.status,
        amountPaid: updated.amountPaid,
        installments: updated.installments.map((item) => ({
          number: item.installmentNumber,
          amount: item.amount,
          dueDate: item.dueDate.toISOString(),
          status: item.status,
          paidAt: item.paidAt?.toISOString() || null,
        })),
      },
    })
  } catch (error) {
    if (error instanceof Error && error.message === 'INSTALLMENT_NOT_FOUND') {
      return NextResponse.json({ error: { code: 'INSTALLMENT_NOT_FOUND', message: 'Installment not found.' } }, { status: 404 })
    }
    console.error('Admin order update failed', error)
    return NextResponse.json({ error: { code: 'ORDER_UPDATE_FAILED', message: 'Could not update order.' } }, { status: 500 })
  }
}
