'use client'

import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { Suspense, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { api, formatMoney, statusLabels } from '@/lib/utils'

function OrdersContent() {
  const searchParams = useSearchParams()
  const [q, setQ] = useState(searchParams.get('q') || '')
  const [status, setStatus] = useState('')
  const query = useQuery({
    queryKey: ['admin-orders', q, status],
    queryFn: async () => {
      const params = new URLSearchParams()
      if (q) params.set('q', q)
      if (status) params.set('status', status)
      return (await api.get(`/orders?${params.toString()}`)).data
    },
  })

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">Commerce</p>
        <h1 className="mt-1 text-3xl font-black text-slate-950">Orders & Invoices</h1>
      </div>

      <div className="flex flex-col gap-3 rounded-[24px] border border-slate-200 bg-white p-4 shadow-sm sm:flex-row">
        <input
          value={q}
          onChange={(event) => setQ(event.target.value)}
          placeholder="Search order, name, or phone"
          className="flex-1 rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-emerald-600"
        />
        <select
          value={status}
          onChange={(event) => setStatus(event.target.value)}
          className="rounded-2xl border border-slate-200 px-4 py-3 text-sm font-bold"
        >
          <option value="">All statuses</option>
          <option value="PENDING_PAYMENT">Pending</option>
          <option value="PAYMENT_IN_PROGRESS">In progress</option>
          <option value="PAID">Completed</option>
          <option value="FULFILLED">Delivered</option>
          <option value="CANCELLED">Cancelled</option>
        </select>
      </div>

      <section className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-400">
              <tr>
                <th className="px-5 py-4 font-bold">Order</th>
                <th className="px-5 py-4 font-bold">Customer</th>
                <th className="px-5 py-4 font-bold">Plan</th>
                <th className="px-5 py-4 font-bold">Total</th>
                <th className="px-5 py-4 font-bold">Next payment</th>
                <th className="px-5 py-4 font-bold">Status</th>
              </tr>
            </thead>
            <tbody>
              {query.isPending &&
                Array.from({ length: 6 }).map((_, index) => (
                  <tr key={index} className="border-t border-slate-100">
                    <td colSpan={6} className="px-5 py-5">
                      <div className="h-8 animate-pulse rounded-xl bg-slate-100" />
                    </td>
                  </tr>
                ))}
              {query.data?.orders?.map((order: any) => {
                const statusMeta = statusLabels[order.status] || statusLabels.PENDING_PAYMENT
                return (
                  <tr key={order.orderNumber} className="border-t border-slate-100 hover:bg-slate-50/70">
                    <td className="px-5 py-4">
                      <Link href={`/orders/${order.orderNumber}`} className="font-black text-slate-900">
                        {order.orderNumber}
                      </Link>
                      <p className="text-xs text-slate-400">{new Date(order.createdAt).toLocaleString()}</p>
                    </td>
                    <td className="px-5 py-4">
                      <p className="font-bold text-slate-900">{order.fullName}</p>
                      <p className="text-xs text-slate-400">{order.phone}</p>
                    </td>
                    <td className="px-5 py-4 font-bold text-slate-700">{order.installmentMonths} months</td>
                    <td className="px-5 py-4 font-black text-slate-900">{formatMoney(order.installmentTotal)}</td>
                    <td className="px-5 py-4 text-slate-600">
                      {order.nextPayment ? formatMoney(order.nextPayment.amount) : '—'}
                    </td>
                    <td className="px-5 py-4">
                      <span className={`rounded-full px-3 py-1 text-[10px] font-black uppercase ${statusMeta.className}`}>
                        {statusMeta.label}
                      </span>
                    </td>
                  </tr>
                )
              })}
              {!query.isPending && !query.data?.orders?.length && (
                <tr>
                  <td colSpan={6} className="px-5 py-12 text-center text-slate-400">
                    No orders match your filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  )
}

export default function OrdersPage() {
  return (
    <Suspense fallback={<div className="h-40 animate-pulse rounded-[28px] bg-white" />}>
      <OrdersContent />
    </Suspense>
  )
}
