'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import {
  AlertCircle,
  ArrowLeft,
  CalendarDays,
  Check,
  CircleDashed,
  Clock3,
  CreditCard,
  MapPin,
  RefreshCw,
  ShieldCheck,
  UserRound,
} from 'lucide-react'
import { toast } from 'sonner'
import Header from '@/components/header'
import Footer from '@/components/footer'
import { getOrderError } from '@/hooks/use-create-order'
import { useOrderDetail } from '@/hooks/use-orders'
import type { OrderConfirmation } from '@/lib/orders'

function formatMoney(value: number) {
  return `FCFA ${value.toLocaleString('en-US')}`
}

export default function OrderDetailPage() {
  const params = useParams<{ orderNumber: string }>()
  const orderQuery = useOrderDetail(params.orderNumber)

  useEffect(() => {
    if (orderQuery.isError) toast.error(getOrderError(orderQuery.error).message)
  }, [orderQuery.error, orderQuery.isError])

  return (
    <>
      <Header />
      <main className="min-h-screen bg-[#f6f8f7] pb-20">
        <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
          <Link href="/orders" className="inline-flex items-center gap-2 text-sm font-black text-slate-500 hover:text-emerald-700"><ArrowLeft className="h-4 w-4" />Back to my orders</Link>
          {orderQuery.isPending && <DetailSkeleton />}
          {orderQuery.isError && <DetailError onRetry={() => void orderQuery.refetch()} />}
          {orderQuery.data && <OrderDetail order={orderQuery.data.order} />}
        </div>
      </main>
      <Footer />
    </>
  )
}

function OrderDetail({ order }: { order: OrderConfirmation }) {
  const paidCount = order.installments.filter((item) => item.status === 'PAID').length
  const progress = order.installments.length ? (paidCount / order.installments.length) * 100 : 0

  return (
    <div className="mt-6 space-y-6">
      <section className="overflow-hidden rounded-3xl bg-linear-to-br from-emerald-950 to-emerald-800 text-white shadow-2xl shadow-emerald-950/15">
        <div className="grid gap-8 p-7 sm:p-10 lg:grid-cols-[1fr_300px] lg:items-end">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full bg-amber-300 px-3 py-1.5 text-[10px] font-black uppercase tracking-wide text-amber-950"><Clock3 className="h-3 w-3" />{order.status.replaceAll('_', ' ')}</span>
            <p className="mt-6 text-xs font-bold uppercase tracking-[0.2em] text-emerald-300">Order details</p>
            <h1 className="mt-2 text-3xl font-black tracking-tight sm:text-4xl">{order.orderNumber}</h1>
            <p className="mt-2 text-sm text-emerald-100">Created {new Date(order.createdAt).toLocaleString()}</p>
          </div>
          <div className="rounded-2xl border border-white/15 bg-white/10 p-5 backdrop-blur">
            <div className="flex justify-between text-xs text-emerald-100"><span>Payment progress</span><span>{paidCount}/{order.installments.length}</span></div>
            <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/15"><div className="h-full rounded-full bg-emerald-300" style={{ width: `${progress}%` }} /></div>
            <div className="mt-4 flex items-end justify-between"><div><p className="text-[10px] text-emerald-200">Amount paid</p><p className="font-black">{formatMoney(order.amountPaid)}</p></div><div className="text-right"><p className="text-[10px] text-emerald-200">Plan total</p><p className="font-black">{formatMoney(order.installmentTotal)}</p></div></div>
          </div>
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
        <div className="space-y-6">
          <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-[0_12px_40px_rgba(15,23,42,0.04)] sm:p-8">
            <div className="flex items-center justify-between"><div><p className="text-xs font-black uppercase tracking-wider text-emerald-700">Payment timeline</p><h2 className="mt-1 text-xl font-black text-slate-950">{order.installmentMonths}-month schedule</h2></div><CalendarDays className="h-7 w-7 text-emerald-700" /></div>
            <div className="mt-7 space-y-0">
              {order.installments.map((installment, index) => {
                const paid = installment.status === 'PAID'
                return (
                  <div key={installment.number} className="relative flex gap-4 pb-7 last:pb-0">
                    {index < order.installments.length - 1 && <div className="absolute left-4.25 top-9 h-full w-0.5 bg-slate-100" />}
                    <span className={`relative z-10 flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${paid ? 'bg-emerald-700 text-white' : 'border-2 border-slate-200 bg-white text-slate-400'}`}>{paid ? <Check className="h-4 w-4" /> : <CircleDashed className="h-4 w-4" />}</span>
                    <div className="flex min-w-0 flex-1 items-start justify-between gap-3 pt-1"><div><p className="text-sm font-black text-slate-900">Installment {installment.number}</p><p className="mt-1 text-xs text-slate-500">Due {new Date(installment.dueDate).toLocaleDateString()}</p></div><div className="text-right"><p className="text-sm font-black text-slate-900">{formatMoney(installment.amount)}</p><p className={`mt-1 text-[10px] font-black uppercase ${paid ? 'text-emerald-700' : 'text-amber-600'}`}>{installment.status}</p></div></div>
                  </div>
                )
              })}
            </div>
            <div className="mt-7 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-xs leading-relaxed text-amber-900"><strong>Payment integration coming soon.</strong> Your order and schedule are saved, but no Mobile Money charge has been made yet.</div>
          </section>

          <section className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8">
            <h2 className="text-lg font-black text-slate-950">Products</h2>
            <div className="mt-4 space-y-3">{order.items.map((item) => <div key={item.productId} className="flex items-center justify-between rounded-2xl bg-slate-50 p-4"><div><p className="text-sm font-black text-slate-900">{item.name}</p><p className="text-xs text-slate-500">{item.capacity} · Qty {item.quantity}</p></div><p className="text-sm font-black text-slate-900">{formatMoney(item.lineTotal)}</p></div>)}</div>
          </section>
        </div>

        <aside className="space-y-5">
          <InfoCard icon={UserRound} title="Customer"><p>{order.customer.fullName}</p><p className="text-slate-500">{order.customer.phone}</p></InfoCard>
          <InfoCard icon={MapPin} title="Delivery address"><p>{order.delivery.address}</p><p>{order.delivery.quarter}, {order.delivery.city}</p><p className="text-slate-500">{order.delivery.region}</p></InfoCard>
          <InfoCard icon={CreditCard} title="Payment method"><p className="uppercase">{order.paymentMethod.replace('cod', 'Cash')}</p><p className="text-slate-500">{order.installmentMonths} monthly installments</p></InfoCard>
          <section className="rounded-2xl border border-emerald-100 bg-emerald-50 p-5"><ShieldCheck className="h-6 w-6 text-emerald-700" /><p className="mt-3 text-sm font-black text-emerald-950">Private to this device</p><p className="mt-1 text-xs leading-relaxed text-emerald-800">Your order details are protected by a secure browser-only cookie.</p></section>
        </aside>
      </div>
    </div>
  )
}

function InfoCard({ icon: Icon, title, children }: { icon: typeof UserRound; title: string; children: React.ReactNode }) {
  return <section className="rounded-2xl border border-slate-200 bg-white p-5"><div className="flex items-center gap-2 text-emerald-700"><Icon className="h-4 w-4" /><h3 className="text-xs font-black uppercase tracking-wider">{title}</h3></div><div className="mt-3 space-y-1 text-sm font-bold text-slate-900">{children}</div></section>
}

function DetailSkeleton() {
  return <div className="mt-6 animate-pulse space-y-6"><div className="h-64 rounded-3xl bg-emerald-900/20" /><div className="grid gap-6 lg:grid-cols-[1fr_340px]"><div className="h-120 rounded-3xl bg-white" /><div className="space-y-5">{Array.from({ length: 3 }).map((_, index) => <div key={index} className="h-32 rounded-2xl bg-white" />)}</div></div></div>
}

function DetailError({ onRetry }: { onRetry: () => void }) {
  return <div className="mx-auto mt-16 max-w-lg rounded-3xl border border-red-100 bg-white p-9 text-center shadow-xl shadow-slate-900/5"><AlertCircle className="mx-auto h-12 w-12 text-red-500" /><h1 className="mt-5 text-2xl font-black text-slate-950">Order unavailable</h1><p className="mt-2 text-sm text-slate-500">This order may not belong to this device, or the connection failed.</p><div className="mt-6 flex justify-center gap-3"><Link href="/orders" className="rounded-xl border border-slate-200 px-5 py-3 text-sm font-black text-slate-700">My orders</Link><button type="button" onClick={onRetry} className="inline-flex items-center gap-2 rounded-xl bg-emerald-700 px-5 py-3 text-sm font-black text-white"><RefreshCw className="h-4 w-4" />Retry</button></div></div>
}
