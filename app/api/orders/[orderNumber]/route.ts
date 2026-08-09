import { randomUUID } from 'node:crypto'
import { NextRequest, NextResponse } from 'next/server'
import { getOrderOwner } from '@/lib/order-access'
import type {
  CheckoutPaymentMethod,
  OrderApiError,
  OrderDetailResponse,
  TrackedOrderStatus,
} from '@/lib/orders'
import { prisma } from '@/lib/prisma'

const paymentMethods: Record<string, CheckoutPaymentMethod> = {
  MTN_MOMO: 'mtn',
  ORANGE_MONEY: 'orange',
  CASH: 'cod',
}

function errorResponse(status: number, code: string, message: string, requestId: string) {
  return NextResponse.json<OrderApiError>(
    { error: { code, message, requestId } },
    { status, headers: { 'X-Request-Id': requestId } },
  )
}

export async function GET(request: NextRequest, context: { params: Promise<{ orderNumber: string }> }) {
  const requestId = randomUUID()

  try {
    const owner = await getOrderOwner(request)
    if (!owner) return errorResponse(404, 'ORDER_NOT_FOUND', 'Order not found.', requestId)

    const { orderNumber } = await context.params
    if (!/^PBC-[A-Z0-9-]{8,32}$/.test(orderNumber)) {
      return errorResponse(404, 'ORDER_NOT_FOUND', 'Order not found.', requestId)
    }

    const order = await prisma.order.findFirst({
      where: { orderNumber, ownerId: owner.id },
      include: {
        items: { orderBy: { id: 'asc' } },
        installments: { orderBy: { installmentNumber: 'asc' } },
      },
    })
    if (!order) return errorResponse(404, 'ORDER_NOT_FOUND', 'Order not found.', requestId)

    const response: OrderDetailResponse = {
      order: {
        orderNumber: order.orderNumber,
        status: order.status as TrackedOrderStatus,
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
        items: order.items.map((item) => ({
          productId: item.productId,
          name: item.productName,
          capacity: item.productCapacity,
          image: item.productImage,
          unitPrice: item.unitPrice,
          quantity: item.quantity,
          lineTotal: item.lineTotal,
        })),
        installments: order.installments.map((installment) => ({
          number: installment.installmentNumber,
          amount: installment.amount,
          dueDate: installment.dueDate.toISOString(),
          status: installment.status,
        })),
      },
    }

    return NextResponse.json(response, { headers: { 'X-Request-Id': requestId } })
  } catch (error) {
    console.error('Failed to load device order', { requestId, error })
    return errorResponse(500, 'ORDER_DETAIL_FAILED', 'We could not load this order. Please try again.', requestId)
  }
}
