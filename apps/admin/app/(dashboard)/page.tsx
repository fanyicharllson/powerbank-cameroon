'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { ArrowUpRight, RefreshCw } from 'lucide-react'
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { toast } from 'sonner'
import { api, formatMoney, statusLabels } from '@/lib/utils'

export default function DashboardPage() {
  const [days, setDays] = useState(7)
  const query = useQuery({
    queryKey: ['dashboard-summary', days],
    queryFn: async () => (await api.get(`/dashboard/summary?days=${days}`)).data,
  })

  useEffect(() => {
    if (query.isError) toast.error('Failed to load dashboard metrics')
  }, [query.isError])

  const summary = query.data?.summary
  const trend = query.data?.trend || []
  const recent = query.data?.recentOrders || []

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">General metrics</p>
          <h1 className="mt-1 text-3xl font-black text-slate-950">Dashboard</h1>
        </div>
        <div className="flex items-center gap-2">
          <select
            value={days}
            onChange={(event) => setDays(Number(event.target.value))}
            className="rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold"
          >
            <option value={7}>Last 7 days</option>
            <option value={30}>Last 30 days</option>
            <option value={90}>Last 90 days</option>
          </select>
          <button
            type="button"
            onClick={() => void query.refetch()}
            className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold"
          >
            <RefreshCw className={`h-4 w-4 ${query.isFetching ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </div>

      {query.isPending ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
          {Array.from({ length: 5 }).map((_, index) => (
            <div key={index} className="h-28 animate-pulse rounded-[22px] bg-white" />
          ))}
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
          <Kpi title="Total revenue" value={formatMoney(summary.totalRevenue)} tone="up" />
          <Kpi title="Orders" value={String(summary.totalOrders)} tone="up" />
          <Kpi title="Avg. order value" value={formatMoney(summary.avgOrderValue)} tone="neutral" />
          <Kpi title="Awaiting payment" value={String(summary.awaitingPayment)} tone="down" />
          <Kpi title="Customers" value={String(summary.customers)} tone="up" />
        </div>
      )}

      <div className="grid gap-6 xl:grid-cols-[1.6fr_0.9fr]">
        <section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-black text-slate-950">Orders & revenue</h2>
              <p className="text-xs text-slate-500">Trend for the selected period</p>
            </div>
            <p className="text-sm font-black text-emerald-700">{formatMoney(summary?.amountCollected || 0)} collected</p>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={trend}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="date" tickFormatter={(value) => value.slice(5)} tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip formatter={(value: number) => formatMoney(value)} />
                <Bar dataKey="revenue" fill="#047857" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>

        <section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-black text-slate-950">Collection goal</h2>
          <p className="mt-1 text-xs text-slate-500">Paid installments vs pending</p>
          <div className="mt-8 flex flex-col items-center">
            <div
              className="relative flex h-40 w-40 items-end justify-center overflow-hidden rounded-full"
              style={{
                background: `conic-gradient(#047857 ${(summary?.collectionRate || 0) * 3.6}deg, #e2e8f0 0deg)`,
              }}
            >
              <div className="absolute inset-4 flex items-center justify-center rounded-full bg-white">
                <div className="text-center">
                  <p className="text-3xl font-black text-slate-950">{summary?.collectionRate || 0}%</p>
                  <p className="text-[10px] font-bold uppercase text-slate-400">Collected</p>
                </div>
              </div>
            </div>
            <div className="mt-6 grid w-full grid-cols-2 gap-3 text-center">
              <div className="rounded-2xl bg-emerald-50 p-3">
                <p className="text-lg font-black text-emerald-700">{summary?.paidInstallments || 0}</p>
                <p className="text-[10px] font-bold uppercase text-emerald-700/70">Paid</p>
              </div>
              <div className="rounded-2xl bg-amber-50 p-3">
                <p className="text-lg font-black text-amber-700">{summary?.pendingInstallments || 0}</p>
                <p className="text-[10px] font-bold uppercase text-amber-700/70">Pending</p>
              </div>
            </div>
          </div>
        </section>
      </div>

      <section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-lg font-black text-slate-950">Recent transactions</h2>
          <Link href="/orders" className="inline-flex items-center gap-1 text-sm font-bold text-emerald-700">
            View all <ArrowUpRight className="h-4 w-4" />
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="text-xs uppercase tracking-wide text-slate-400">
              <tr>
                <th className="pb-3 font-bold">Order ID</th>
                <th className="pb-3 font-bold">Product</th>
                <th className="pb-3 font-bold">Customer</th>
                <th className="pb-3 font-bold">Amount</th>
                <th className="pb-3 font-bold">Status</th>
              </tr>
            </thead>
            <tbody>
              {recent.map((order: any) => {
                const status = statusLabels[order.status] || statusLabels.PENDING_PAYMENT
                return (
                  <tr key={order.orderNumber} className="border-t border-slate-100">
                    <td className="py-4 font-black text-slate-900">
                      <Link href={`/orders/${order.orderNumber}`}>{order.orderNumber}</Link>
                    </td>
                    <td className="py-4 text-slate-600">{order.productName}</td>
                    <td className="py-4">
                      <p className="font-bold text-slate-900">{order.fullName}</p>
                      <p className="text-xs text-slate-400">{order.phone}</p>
                    </td>
                    <td className="py-4 font-black text-slate-900">{formatMoney(order.installmentTotal)}</td>
                    <td className="py-4">
                      <span className={`rounded-full px-3 py-1 text-[10px] font-black uppercase ${status.className}`}>
                        {status.label}
                      </span>
                    </td>
                  </tr>
                )
              })}
              {!recent.length && !query.isPending && (
                <tr>
                  <td colSpan={5} className="py-10 text-center text-slate-400">
                    No orders yet.
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

function Kpi({ title, value, tone }: { title: string; value: string; tone: 'up' | 'down' | 'neutral' }) {
  return (
    <div className="rounded-[22px] border border-slate-200 bg-white p-5 shadow-sm">
      <p className="text-xs font-bold uppercase tracking-wide text-slate-400">{title}</p>
      <p className="mt-3 text-2xl font-black text-slate-950">{value}</p>
      <p className={`mt-2 text-xs font-bold ${tone === 'down' ? 'text-red-500' : tone === 'up' ? 'text-emerald-600' : 'text-slate-400'}`}>
        {tone === 'down' ? 'Needs attention' : tone === 'up' ? 'Healthy' : 'Stable'}
      </p>
    </div>
  )
}
