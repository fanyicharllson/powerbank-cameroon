'use client'

import Link from 'next/link'
import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { api, formatMoney } from '@/lib/utils'

export default function CustomersPage() {
  const [q, setQ] = useState('')
  const query = useQuery({
    queryKey: ['admin-customers', q],
    queryFn: async () => (await api.get(`/customers?q=${encodeURIComponent(q)}`)).data,
  })

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">Audience</p>
        <h1 className="mt-1 text-3xl font-black text-slate-950">Customer Insights</h1>
      </div>

      <input
        value={q}
        onChange={(event) => setQ(event.target.value)}
        placeholder="Search by name, phone, or city"
        className="w-full rounded-[24px] border border-slate-200 bg-white px-5 py-4 text-sm shadow-sm outline-none focus:border-emerald-600"
      />

      <div className="grid gap-4">
        {query.isPending &&
          Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="h-28 animate-pulse rounded-[24px] bg-white" />
          ))}
        {query.data?.customers?.map((customer: any) => (
          <article key={customer.phone} className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
              <div>
                <p className="text-lg font-black text-slate-950">{customer.fullName}</p>
                <p className="text-sm text-slate-500">
                  {customer.phone} · {customer.city}, {customer.region}
                </p>
              </div>
              <div className="flex flex-wrap gap-4 text-sm">
                <Stat label="Orders" value={String(customer.orderCount)} />
                <Stat label="Plan value" value={formatMoney(customer.totalSpent)} />
                <Stat label="Collected" value={formatMoney(customer.amountPaid)} />
              </div>
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              {customer.orders.slice(0, 4).map((order: any) => (
                <Link
                  key={order.orderNumber}
                  href={`/orders/${order.orderNumber}`}
                  className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-700"
                >
                  {order.orderNumber}
                </Link>
              ))}
            </div>
          </article>
        ))}
        {!query.isPending && !query.data?.customers?.length && (
          <div className="rounded-[24px] border border-slate-200 bg-white p-10 text-center text-slate-400">
            No customers found.
          </div>
        )}
      </div>
    </div>
  )
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">{label}</p>
      <p className="font-black text-slate-900">{value}</p>
    </div>
  )
}
