'use client'

import { useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import {
  AlertCircle,
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  Clock3,
  PackageCheck,
  ReceiptText,
  RefreshCw,
  ShoppingBag,
  WalletCards,
  Zap,
} from 'lucide-react'
import { toast } from 'sonner'
import Header from '@/components/header'
import Footer from '@/components/footer'
import { getOrderError } from '@/hooks/use-create-order'
import { useOrders } from '@/hooks/use-orders'
import type { TrackedOrderStatus } from '@/lib/orders'

const statusStyles: Record<TrackedOrderStatus, { label: string; className: string }> = {
  PENDING_PAYMENT: { label: 'Awaiting payment', className: 'bg-amber-100 text-amber-800' },
  PAYMENT_IN_PROGRESS: { label: 'Payment in progress', className: 'bg-blue-100 text-blue-800' },
  PAID: { label: 'Fully paid', className: 'bg-emerald-100 text-emerald-800' },
  CANCELLED: { label: 'Cancelled', className: 'bg-red-100 text-red-700' },
  FULFILLED: { label: 'Delivered', className: 'bg-green-100 text-green-800' },
}

function formatMoney(value: number) {
  return `FCFA ${value.toLocaleString('en-US')}`
}

export default function OrdersPage() {
  const ordersQuery = useOrders()

  useEffect(() => {
    if (ordersQuery.isError) toast.error(getOrderError(ordersQuery.error).message)
  }, [ordersQuery.error, ordersQuery.isError])

  return (
    <>
      <Header />
      <main className="min-h-screen bg-[#f6f8f7] pb-20">
        <section className="border-b border-emerald-900/10 bg-linear-to-br from-emerald-950 via-emerald-900 to-green-800 text-white">
          <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
            <p className="text-xs font-black uppercase tracking-[0.24em] text-emerald-300">Private order centre</p>
            <div className="mt-3 flex flex-col justify-between gap-5 md:flex-row md:items-end">
              <div>
                <h1 className="text-4xl font-black tracking-tight sm:text-5xl">My Orders</h1>
                <p className="mt-3 max-w-2xl text-sm leading-relaxed text-emerald-100">Track your installment journey, upcoming payments, and delivery status from this device.</p>
              </div>
              <div className="flex w-fit items-center gap-3 rounded-2xl border border-white/15 bg-white/10 px-4 py-3 backdrop-blur">
                <PackageCheck className="h-7 w-7 text-emerald-300" />
                <div><p className="text-xs font-black">Device-protected access</p><p className="text-[10px] text-emerald-200">Only visible in this browser</p></div>
              </div>
            </div>
          </div>
        </section>

        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {ordersQuery.isPending && <OrdersSkeleton />}
          {ordersQuery.isError && <OrdersError onRetry={() => void ordersQuery.refetch()} />}
          {ordersQuery.data && ordersQuery.data.orders.length === 0 && <EmptyOrders />}
          {ordersQuery.data && ordersQuery.data.orders.length > 0 && (
            <>
              <section className="-mt-7 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <SummaryCard icon={ReceiptText} label="All orders" value={ordersQuery.data.summary.total} />
                <SummaryCard icon={Clock3} label="Awaiting payment" value={ordersQuery.data.summary.awaitingPayment} accent="amber" />
                <SummaryCard icon={WalletCards} label="In progress" value={ordersQuery.data.summary.inProgress} accent="blue" />
                <SummaryCard icon={CheckCircle2} label="Completed" value={ordersQuery.data.summary.completed} accent="green" />
              </section>

              <section className="mt-10">
                <div className="flex items-end justify-between">
                  <div><p className="text-xs font-black uppercase tracking-wider text-emerald-700">Order history</p><h2 className="mt-1 text-2xl font-black text-slate-950">Your powerbank orders</h2></div>
                  <button type="button" onClick={() => void ordersQuery.refetch()} className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-black text-slate-600 hover:border-emerald-300 hover:text-emerald-700"><RefreshCw className={`h-3.5 w-3.5 ${ordersQuery.isFetching ? 'animate-spin' : ''}`} />Refresh</button>
                </div>

                <div className="mt-5 space-y-5">
                  {ordersQuery.data.orders.map((order) => {
                    const status = statusStyles[order.status]
                    const progress = order.totalInstallments > 0 ? (order.paidInstallments / order.totalInstallments) * 100 : 0
                    return (
                      <article key={order.orderNumber} className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-[0_14px_50px_rgba(15,23,42,0.05)]">
                        <div className="flex flex-col justify-between gap-3 border-b border-slate-100 px-5 py-4 sm:flex-row sm:items-center sm:px-7">
                          <div><p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Order number</p><p className="font-black text-slate-950">{order.orderNumber}</p></div>
                          <div className="flex items-center gap-3"><span className={`rounded-full px-3 py-1.5 text-[10px] font-black uppercase tracking-wide ${status.className}`}>{status.label}</span><span className="text-xs text-slate-400">{new Date(order.createdAt).toLocaleDateString()}</span></div>
                        </div>

                        <div className="grid gap-7 p-5 sm:p-7 lg:grid-cols-[1fr_280px]">
                          <div>
                            <div className="space-y-3">
                              {order.items.map((item) => (
                                <div key={item.productId} className="flex items-center gap-4">
                                  <ProductThumb image={item.image} name={item.name} />
                                  <div className="min-w-0"><p className="truncate text-sm font-black text-slate-900">{item.name}</p><p className="text-xs text-slate-500">{item.capacity} · Qty {item.quantity}</p></div>
                                </div>
                              ))}
                            </div>

                            <div className="mt-6">
                              <div className="flex justify-between text-xs"><span className="font-bold text-slate-500">Installment progress</span><span className="font-black text-slate-900">{order.paidInstallments} of {order.totalInstallments} paid</span></div>
                              <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-100"><div className="h-full rounded-full bg-linear-to-r from-emerald-600 to-emerald-400 transition-all" style={{ width: `${progress}%` }} /></div>
                            </div>
                          </div>

                          <div className="rounded-2xl bg-slate-50 p-5">
                            <div className="flex justify-between text-xs text-slate-500"><span>Total plan</span><span>{order.installmentMonths} months</span></div>
                            <p className="mt-1 text-xl font-black text-slate-950">{formatMoney(order.installmentTotal)}</p>
                            {order.nextPayment && (
                              <div className="mt-4 border-t border-slate-200 pt-4">
                                <p className="flex items-center gap-2 text-[10px] font-black uppercase tracking-wider text-emerald-700"><CalendarDays className="h-3.5 w-3.5" />Next payment</p>
                                <div className="mt-2 flex items-end justify-between"><p className="font-black text-slate-900">{formatMoney(order.nextPayment.amount)}</p><p className="text-[10px] text-slate-500">{new Date(order.nextPayment.dueDate).toLocaleDateString()}</p></div>
                              </div>
                            )}
                            <Link href={`/orders/${order.orderNumber}`} className="mt-5 flex items-center justify-center gap-2 rounded-xl bg-emerald-700 px-4 py-3 text-xs font-black text-white hover:bg-emerald-800">View order details <ArrowRight className="h-3.5 w-3.5" /></Link>
                          </div>
                        </div>
                      </article>
                    )
                  })}
                </div>
              </section>
            </>
          )}
        </div>
      </main>
      <Footer />
    </>
  )
}

function ProductThumb({ image, name }: { image: string; name: string }) {
  return (
    <div className="relative flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-slate-100">
      <Zap className="h-5 w-5 fill-emerald-600 text-emerald-600" />
      {image && <Image src={image} alt={name} fill sizes="56px" unoptimized onError={(event) => { event.currentTarget.style.display = 'none' }} className="object-contain p-1.5" />}
    </div>
  )
}

function SummaryCard({ icon: Icon, label, value, accent = 'emerald' }: { icon: typeof ReceiptText; label: string; value: number; accent?: 'emerald' | 'amber' | 'blue' | 'green' }) {
  const accents = { emerald: 'bg-emerald-50 text-emerald-700', amber: 'bg-amber-50 text-amber-700', blue: 'bg-blue-50 text-blue-700', green: 'bg-green-50 text-green-700' }
  return <div className="flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-lg shadow-slate-900/5"><span className={`flex h-12 w-12 items-center justify-center rounded-xl ${accents[accent]}`}><Icon className="h-5 w-5" /></span><div><p className="text-2xl font-black text-slate-950">{value}</p><p className="text-xs text-slate-500">{label}</p></div></div>
}

function OrdersSkeleton() {
  return <div className="-mt-7 space-y-8"><div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{Array.from({ length: 4 }).map((_, index) => <div key={index} className="h-24 animate-pulse rounded-2xl border border-slate-200 bg-white"><div className="m-5 h-12 w-2/3 rounded-xl bg-slate-100" /></div>)}</div><div className="space-y-5">{Array.from({ length: 3 }).map((_, index) => <div key={index} className="h-64 animate-pulse rounded-3xl border border-slate-200 bg-white p-7"><div className="h-5 w-40 rounded bg-slate-100" /><div className="mt-8 h-16 rounded-xl bg-slate-100" /><div className="mt-6 h-3 rounded-full bg-slate-100" /></div>)}</div></div>
}

function OrdersError({ onRetry }: { onRetry: () => void }) {
  return <div className="mx-auto mt-12 max-w-lg rounded-3xl border border-red-100 bg-white p-8 text-center shadow-xl shadow-slate-900/5"><span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-50 text-red-600"><AlertCircle className="h-7 w-7" /></span><h2 className="mt-5 text-xl font-black text-slate-950">We couldn’t load your orders</h2><p className="mt-2 text-sm text-slate-500">Check your connection and try again. Your saved orders are safe.</p><button type="button" onClick={onRetry} className="mt-6 inline-flex items-center gap-2 rounded-xl bg-emerald-700 px-5 py-3 text-sm font-black text-white"><RefreshCw className="h-4 w-4" />Try again</button></div>
}

function EmptyOrders() {
  return <div className="mx-auto mt-12 max-w-lg rounded-3xl border border-slate-200 bg-white p-9 text-center shadow-xl shadow-slate-900/5"><span className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-emerald-50 text-emerald-700"><ShoppingBag className="h-9 w-9" /></span><h2 className="mt-6 text-2xl font-black text-slate-950">No orders on this device yet</h2><p className="mt-2 text-sm leading-relaxed text-slate-500">Once you place an installment order, its progress and payment schedule will appear here.</p><Link href="/products" className="mt-7 inline-flex items-center gap-2 rounded-xl bg-emerald-700 px-6 py-3.5 text-sm font-black text-white">Explore powerbanks <ArrowRight className="h-4 w-4" /></Link></div>
}
