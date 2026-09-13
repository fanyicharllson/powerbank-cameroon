import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@stael/db'
import { getAdminSessionFromRequest, unauthorized } from '@/lib/auth'

export async function GET(request: NextRequest) {
  if (!getAdminSessionFromRequest(request)) return unauthorized()

  try {
    const q = (request.nextUrl.searchParams.get('q') || '').trim().toLowerCase()
    const orders = await prisma.order.findMany({
      orderBy: { createdAt: 'desc' },
      select: {
        orderNumber: true,
        fullName: true,
        phone: true,
        city: true,
        region: true,
        status: true,
        installmentTotal: true,
        amountPaid: true,
        createdAt: true,
      },
    })

    const map = new Map<
      string,
      {
        phone: string
        fullName: string
        city: string
        region: string
        orderCount: number
        totalSpent: number
        amountPaid: number
        lastOrderAt: string
        orders: Array<{ orderNumber: string; status: string; installmentTotal: number; createdAt: string }>
      }
    >()

    for (const order of orders) {
      const current = map.get(order.phone)
      const entry = current || {
        phone: order.phone,
        fullName: order.fullName,
        city: order.city,
        region: order.region,
        orderCount: 0,
        totalSpent: 0,
        amountPaid: 0,
        lastOrderAt: order.createdAt.toISOString(),
        orders: [],
      }
      entry.orderCount += 1
      entry.totalSpent += order.installmentTotal
      entry.amountPaid += order.amountPaid
      if (new Date(order.createdAt) > new Date(entry.lastOrderAt)) {
        entry.lastOrderAt = order.createdAt.toISOString()
        entry.fullName = order.fullName
        entry.city = order.city
        entry.region = order.region
      }
      entry.orders.push({
        orderNumber: order.orderNumber,
        status: order.status,
        installmentTotal: order.installmentTotal,
        createdAt: order.createdAt.toISOString(),
      })
      map.set(order.phone, entry)
    }

    let customers = Array.from(map.values()).sort((a, b) => +new Date(b.lastOrderAt) - +new Date(a.lastOrderAt))
    if (q) {
      customers = customers.filter(
        (customer) =>
          customer.phone.includes(q) ||
          customer.fullName.toLowerCase().includes(q) ||
          customer.city.toLowerCase().includes(q),
      )
    }

    return NextResponse.json({ customers, total: customers.length })
  } catch (error) {
    console.error('Admin customers list failed', error)
    return NextResponse.json({ error: { code: 'CUSTOMERS_FAILED', message: 'Could not load customers.' } }, { status: 500 })
  }
}
