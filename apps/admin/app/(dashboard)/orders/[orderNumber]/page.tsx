'use client'

import Link from 'next/link'
import { useParams } from 'next/navigation'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { ArrowLeft, Check } from 'lucide-react'
import { toast } from 'sonner'
import { api, formatMoney, statusLabels } from '@/lib/utils'

export default function OrderDetailPage() {
  const params = useParams<{ orderNumber: string }>()
  const queryClient = useQueryClient()
  const query = useQuery({
    queryKey: ['admin-order', params.orderNumber],
    queryFn: async () => (await api.get(`/orders/${params.orderNumber}`)).data.order,
  })

  const mutation = useMutation({
    mutationFn: async (payload: Record<string, unknown>) =>
      (await api.patch(`/orders/${params.orderNumber}`, payload)).data,
    onSuccess: () => {
      toast.success('Order updated')
      void queryClient.invalidateQueries({ queryKey: ['admin-order', params.orderNumber] })
      void queryClient.invalidateQueries({ queryKey: ['admin-orders'] })
      void queryClient.invalidateQueries({ queryKey: ['dashboard-summary'] })
    },
    onError: () => toast.error('Could not update order'),
  })

  if (query.isPending) return <div className="h-96 animate-pulse rounded-[28px] bg-white" />
  if (query.isError || !query.data) {
    return (
      <div className="rounded-[28px] border border-red-100 bg-white p-8 text-center">
        <p className="font-black text-slate-950">Order unavailable</p>
        <Link href="/orders" className="mt-4 inline-block text-sm font-bold text-emerald-700">
          Back to orders
        </Link>
      </div>
    )
  }

  const order = query.data
  const status = statusLabels[order.status] || statusLabels.PENDING_PAYMENT

  return (
    <div className="space-y-6">
      <Link href="/orders" className="inline-flex items-center gap-2 text-sm font-bold text-slate-500">
        <ArrowLeft className="h-4 w-4" /> Back to orders
      </Link>

      <section className="rounded-[28px] bg-slate-950 p-7 text-white">
        <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
          <div>
            <span className={`rounded-full px-3 py-1 text-[10px] font-black uppercase ${status.className}`}>{status.label}</span>
            <h1 className="mt-4 text-3xl font-black">{order.orderNumber}</h1>
            <p className="mt-2 text-sm text-slate-300">Created {new Date(order.createdAt).toLocaleString()}</p>
          </div>
          <div className="rounded-2xl bg-white/10 p-4">
            <p className="text-xs text-slate-300">Collected / Total</p>
            <p className="mt-1 text-xl font-black">
              {formatMoney(order.amountPaid)} / {formatMoney(order.installmentTotal)}
            </p>
          </div>
        </div>
      </section>

      <div className="grid gap-6 xl:grid-cols-[1.4fr_0.8fr]">
        <section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-black text-slate-950">Installment schedule</h2>
          <div className="mt-5 space-y-4">
            {order.installments.map((item: any) => (
              <div key={item.number} className="flex items-center justify-between rounded-2xl border border-slate-100 p-4">
                <div>
                  <p className="font-black text-slate-900">Installment {item.number}</p>
                  <p className="text-xs text-slate-500">Due {new Date(item.dueDate).toLocaleDateString()}</p>
                </div>
                <div className="flex items-center gap-3">
                  <p className="font-black text-slate-900">{formatMoney(item.amount)}</p>
                  {item.status === 'PAID' ? (
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-3 py-1 text-[10px] font-black uppercase text-emerald-700">
                      <Check className="h-3 w-3" /> Paid
                    </span>
                  ) : (
                    <button
                      type="button"
                      disabled={mutation.isPending}
                      onClick={() => mutation.mutate({ markInstallmentPaid: item.number })}
                      className="rounded-xl bg-slate-950 px-3 py-2 text-[10px] font-black uppercase text-white"
                    >
                      Mark paid
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
          <p className="mt-5 rounded-2xl bg-amber-50 p-4 text-xs text-amber-800">
            Payment gateway integration is still TODO. Use “Mark paid” for manual reconciliation.
          </p>
        </section>

        <div className="space-y-5">
          <section className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm">
            <h3 className="text-xs font-black uppercase tracking-wide text-slate-400">Customer</h3>
            <p className="mt-2 font-black text-slate-950">{order.customer.fullName}</p>
            <p className="text-sm text-slate-500">{order.customer.phone}</p>
          </section>
          <section className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm">
            <h3 className="text-xs font-black uppercase tracking-wide text-slate-400">Delivery</h3>
            <p className="mt-2 text-sm font-bold text-slate-900">{order.delivery.address}</p>
            <p className="text-sm text-slate-500">
              {order.delivery.quarter}, {order.delivery.city}
            </p>
            <p className="text-sm text-slate-500">{order.delivery.region}</p>
          </section>
          <section className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm">
            <h3 className="mb-3 text-xs font-black uppercase tracking-wide text-slate-400">Update status</h3>
            <div className="flex flex-wrap gap-2">
              {['PENDING_PAYMENT', 'PAYMENT_IN_PROGRESS', 'PAID', 'FULFILLED', 'CANCELLED'].map((value) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => mutation.mutate({ status: value })}
                  className="rounded-xl border border-slate-200 px-3 py-2 text-[10px] font-black uppercase text-slate-600 hover:bg-slate-50"
                >
                  {statusLabels[value]?.label || value}
                </button>
              ))}
            </div>
          </section>
          <section className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm">
            <h3 className="text-xs font-black uppercase tracking-wide text-slate-400">Products</h3>
            <div className="mt-3 space-y-3">
              {order.items.map((item: any) => (
                <div key={item.productId} className="flex justify-between text-sm">
                  <div>
                    <p className="font-bold text-slate-900">{item.name}</p>
                    <p className="text-xs text-slate-400">Qty {item.quantity}</p>
                  </div>
                  <p className="font-black">{formatMoney(item.lineTotal)}</p>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}
