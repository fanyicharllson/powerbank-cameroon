import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@stael/db'
import { getAdminSessionFromRequest, unauthorized } from '@/lib/auth'

function startOfDaysAgo(days: number) {
  const date = new Date()
  date.setHours(0, 0, 0, 0)
  date.setDate(date.getDate() - (days - 1))
  return date
}

export async function GET(request: NextRequest) {
  if (!(await getAdminSessionFromRequest(request))) return unauthorized()

  try {
    const days = Math.min(90, Math.max(7, Number(request.nextUrl.searchParams.get('days') || 7)))
    const from = startOfDaysAgo(days)

    const [
      totalOrders,
      awaitingPayment,
      inProgress,
      completed,
      cancelled,
      revenueAgg,
      amountPaidAgg,
      pendingInstallments,
      paidInstallments,
      customerGroups,
      recentOrders,
      trendOrders,
    ] = await Promise.all([
      prisma.order.count(),
      prisma.order.count({ where: { status: 'PENDING_PAYMENT' } }),
      prisma.order.count({ where: { status: 'PAYMENT_IN_PROGRESS' } }),
      prisma.order.count({ where: { status: { in: ['PAID', 'FULFILLED'] } } }),
      prisma.order.count({ where: { status: 'CANCELLED' } }),
      prisma.order.aggregate({ _sum: { installmentTotal: true } }),
      prisma.order.aggregate({ _sum: { amountPaid: true } }),
      prisma.installmentPayment.count({ where: { status: 'PENDING' } }),
      prisma.installmentPayment.count({ where: { status: 'PAID' } }),
      prisma.order.groupBy({ by: ['phone'], _count: { phone: true }, orderBy: { phone: 'asc' } }),
      prisma.order.findMany({
        orderBy: { createdAt: 'desc' },
        take: 8,
        include: { items: { take: 1, orderBy: { id: 'asc' } } },
      }),
      prisma.order.findMany({
        where: { createdAt: { gte: from } },
        select: { createdAt: true, installmentTotal: true, amountPaid: true },
        orderBy: { createdAt: 'asc' },
      }),
    ])

    const trendMap = new Map<string, { date: string; orders: number; revenue: number; collected: number }>()
    for (let i = 0; i < days; i += 1) {
      const d = new Date(from)
      d.setDate(from.getDate() + i)
      const key = d.toISOString().slice(0, 10)
      trendMap.set(key, { date: key, orders: 0, revenue: 0, collected: 0 })
    }
    for (const order of trendOrders) {
      const key = order.createdAt.toISOString().slice(0, 10)
      const row = trendMap.get(key)
      if (!row) continue
      row.orders += 1
      row.revenue += order.installmentTotal
      row.collected += order.amountPaid
    }

    const totalInstallments = pendingInstallments + paidInstallments
    const collectionRate = totalInstallments === 0 ? 0 : Math.round((paidInstallments / totalInstallments) * 100)

    return NextResponse.json({
      summary: {
        totalOrders,
        awaitingPayment,
        inProgress,
        completed,
        cancelled,
        totalRevenue: revenueAgg._sum.installmentTotal || 0,
        amountCollected: amountPaidAgg._sum.amountPaid || 0,
        avgOrderValue: totalOrders ? Math.round((revenueAgg._sum.installmentTotal || 0) / totalOrders) : 0,
        customers: customerGroups.length,
        pendingInstallments,
        paidInstallments,
        collectionRate,
      },
      trend: Array.from(trendMap.values()),
      recentOrders: recentOrders.map((order) => ({
        orderNumber: order.orderNumber,
        fullName: order.fullName,
        phone: order.phone,
        status: order.status,
        installmentTotal: order.installmentTotal,
        amountPaid: order.amountPaid,
        createdAt: order.createdAt.toISOString(),
        productName: order.items[0]?.productName || 'Powerbank',
      })),
    })
  } catch (error) {
    console.error('Dashboard summary failed', error)
    return NextResponse.json({ error: { code: 'DASHBOARD_FAILED', message: 'Could not load dashboard metrics.' } }, { status: 500 })
  }
}
