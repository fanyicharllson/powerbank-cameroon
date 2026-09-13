import { NextRequest, NextResponse } from 'next/server'
import { prisma, type OrderStatus, type PaymentMethod } from '@stael/db'
import { getAdminSessionFromRequest, unauthorized } from '@/lib/auth'

const paymentMethods: Record<string, string> = {
  MTN_MOMO: 'mtn',
  ORANGE_MONEY: 'orange',
  CASH: 'cod',
}

export async function GET(request: NextRequest) {
  if (!(await getAdminSessionFromRequest(request))) return unauthorized()

  try {
    const params = request.nextUrl.searchParams
    const page = Math.max(1, Number(params.get('page') || 1))
    const pageSize = Math.min(50, Math.max(1, Number(params.get('pageSize') || 20)))
    const status = params.get('status') || undefined
    const paymentMethod = params.get('paymentMethod') || undefined
    const q = (params.get('q') || '').trim()

    const where = {
      ...(status ? { status: status as OrderStatus } : {}),
      ...(paymentMethod
        ? {
            paymentMethod: (
              { mtn: 'MTN_MOMO', orange: 'ORANGE_MONEY', cod: 'CASH' } as Record<string, PaymentMethod>
            )[paymentMethod],
          }
        : {}),
      ...(q
        ? {
            OR: [
              { orderNumber: { contains: q, mode: 'insensitive' as const } },
              { fullName: { contains: q, mode: 'insensitive' as const } },
              { phone: { contains: q } },
            ],
          }
        : {}),
    }

    const [total, orders] = await Promise.all([
      prisma.order.count({ where }),
      prisma.order.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
        include: {
          items: { orderBy: { id: 'asc' } },
          installments: { orderBy: { installmentNumber: 'asc' } },
        },
      }),
    ])

    return NextResponse.json({
      page,
      pageSize,
      total,
      orders: orders.map((order) => {
        const nextPayment = order.installments.find((item) => item.status === 'PENDING')
        return {
          orderNumber: order.orderNumber,
          status: order.status,
          fullName: order.fullName,
          phone: order.phone,
          city: order.city,
          region: order.region,
          paymentMethod: paymentMethods[order.paymentMethod],
          installmentMonths: order.installmentMonths,
          installmentTotal: order.installmentTotal,
          monthlyPayment: order.monthlyPayment,
          amountPaid: order.amountPaid,
          createdAt: order.createdAt.toISOString(),
          items: order.items.map((item) => ({
            productId: item.productId,
            name: item.productName,
            quantity: item.quantity,
            lineTotal: item.lineTotal,
          })),
          nextPayment: nextPayment
            ? {
                number: nextPayment.installmentNumber,
                amount: nextPayment.amount,
                dueDate: nextPayment.dueDate.toISOString(),
              }
            : null,
        }
      }),
    })
  } catch (error) {
    console.error('Admin orders list failed', error)
    return NextResponse.json({ error: { code: 'ORDERS_LIST_FAILED', message: 'Could not load orders.' } }, { status: 500 })
  }
}
