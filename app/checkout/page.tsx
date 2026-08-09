'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  BadgeCheck,
  Banknote,
  CalendarDays,
  Check,
  CheckCircle2,
  ChevronDown,
  ClipboardCheck,
  CircleHelp,
  CreditCard,
  Headphones,
  LockKeyhole,
  Minus,
  Plus,
  ShieldCheck,
  ShoppingBag,
  Trash2,
  Truck,
  UserRound,
  WalletCards,
  Zap,
} from 'lucide-react'
import { AnimatePresence, motion } from 'framer-motion'
import Header from '@/components/header'
import Footer from '@/components/footer'
import { useCartStore, type CartItem, type OrderData } from '@/lib/store'
import { CITIES, QUARTERS, REGIONS } from '@/lib/products'
import { formatWhatsAppMessage, generateOrderId, sendWhatsAppNotification } from '@/lib/api'

const PHONE_COUNTRY_CODE = '+237'
const steps = [
  { number: 1, label: 'Cart', icon: ShoppingBag },
  { number: 2, label: 'Installment plan', icon: CalendarDays },
  { number: 3, label: 'Details', icon: UserRound },
  { number: 4, label: 'Payment', icon: CreditCard },
  { number: 5, label: 'Confirmation', icon: CheckCircle2 },
]

const installmentPlans = [
  { months: 2, markup: 0.02, badge: 'Best choice', badgeClass: 'bg-emerald-100 text-emerald-700' },
  { months: 3, markup: 0.04, badge: 'Popular', badgeClass: 'bg-amber-100 text-amber-700' },
  { months: 4, markup: 0.06 },
  { months: 6, markup: 0.09 },
]

const inputClass =
  'w-full rounded-xl border border-slate-200 bg-white px-4 py-3.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-emerald-600 focus:ring-4 focus:ring-emerald-600/10'

function formatMoney(value: number) {
  return `FCFA ${value.toLocaleString('en-US')}`
}

export default function CheckoutPage() {
  const cart = useCartStore((state) => state.cart)
  const cartTotal = useCartStore((state) => state.getCartTotal())
  const updateCartQuantity = useCartStore((state) => state.updateCartQuantity)
  const removeFromCart = useCartStore((state) => state.removeFromCart)
  const setOrderData = useCartStore((state) => state.setOrderData)
  const clearCart = useCartStore((state) => state.clearCart)
  const [step, setStep] = useState(2)
  const [selectedPlan, setSelectedPlan] = useState(2)
  const [isProcessing, setIsProcessing] = useState(false)
  const [orderId, setOrderId] = useState('')
  const [confirmedTotal, setConfirmedTotal] = useState(0)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [selectedCities, setSelectedCities] = useState<string[]>([])
  const [selectedQuarters, setSelectedQuarters] = useState<string[]>([])
  const [formData, setFormData] = useState<OrderData>({
    fullName: '',
    phone: '',
    region: '',
    city: '',
    quarter: '',
    address: '',
    landmark: '',
    paymentMethod: 'mtn',
  })

  const plan = installmentPlans.find((item) => item.months === selectedPlan) ?? installmentPlans[0]
  const installmentTotal = Math.round(cartTotal * (1 + plan.markup))
  const monthlyPayment = Math.ceil(installmentTotal / plan.months)
  const dueToday = monthlyPayment

  const updateField = (field: keyof OrderData, value: string) => {
    setFormData((current) => ({ ...current, [field]: value }))
    setErrors((current) => {
      if (!current[field]) return current
      const next = { ...current }
      delete next[field]
      return next
    })
  }

  const handleRegionChange = (region: string) => {
    setFormData((current) => ({ ...current, region, city: '', quarter: '' }))
    setSelectedCities(CITIES[region] || [])
    setSelectedQuarters([])
    setErrors((current) => {
      const next = { ...current }
      delete next.region
      return next
    })
  }

  const handleCityChange = (city: string) => {
    setFormData((current) => ({ ...current, city, quarter: '' }))
    setSelectedQuarters(QUARTERS[city] || [])
    setErrors((current) => {
      const next = { ...current }
      delete next.city
      return next
    })
  }

  const validateStep = (currentStep: number) => {
    const nextErrors: Record<string, string> = {}
    if (currentStep === 1 && cart.length === 0) nextErrors.cart = 'Your cart is empty.'
    if (currentStep === 3) {
      if (!formData.fullName.trim()) nextErrors.fullName = 'Enter your full name.'
      if (!formData.phone.trim()) nextErrors.phone = 'Enter your phone number.'
      else if (!/^\+237\d{9}$/.test(formData.phone.replace(/[\s-]/g, ''))) {
        nextErrors.phone = 'Enter a valid 9-digit Cameroon number.'
      }
      if (!formData.region) nextErrors.region = 'Select your region.'
      if (!formData.city) nextErrors.city = 'Select your city.'
      if (!formData.quarter) nextErrors.quarter = 'Select your quarter.'
      if (!formData.address.trim()) nextErrors.address = 'Enter your delivery address.'
    }
    setErrors(nextErrors)
    return Object.keys(nextErrors).length === 0
  }

  const handleNext = () => {
    if (!validateStep(step)) return
    setStep((current) => Math.min(4, current + 1))
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handlePlaceOrder = async () => {
    setIsProcessing(true)
    setErrors({})
    try {
      const installmentOrder: OrderData = {
        ...formData,
        installmentMonths: selectedPlan,
        monthlyPayment,
        installmentTotal,
        firstPayment: dueToday,
      }
      setOrderData(installmentOrder)
      const newOrderId = generateOrderId()
      setOrderId(newOrderId)
      setConfirmedTotal(installmentTotal)
      const message = formatWhatsAppMessage(newOrderId, installmentOrder, cart, installmentTotal)
      localStorage.setItem(
        'lastOrder',
        JSON.stringify({
          orderId: newOrderId,
          orderData: installmentOrder,
          items: cart,
          total: installmentTotal,
          timestamp: new Date().toISOString(),
        }),
      )
      await sendWhatsAppNotification(message, formData.phone)
      setStep(5)
      clearCart()
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } catch (error) {
      console.error('Error placing order:', error)
      setErrors({ submit: 'We could not place your order. Please try again.' })
    } finally {
      setIsProcessing(false)
    }
  }

  if (step === 5) {
    return (
      <>
        <Header />
        <main className="min-h-[75vh] bg-[#f7f9f8] px-4 py-16">
          <motion.section
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="mx-auto max-w-xl overflow-hidden rounded-3xl border border-emerald-100 bg-white shadow-[0_24px_70px_rgba(15,23,42,0.08)]"
          >
            <div className="bg-linear-to-br from-emerald-700 to-green-900 px-8 py-10 text-center text-white">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', delay: 0.15 }}
                className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-white/15 ring-8 ring-white/5"
              >
                <Check className="h-10 w-10" strokeWidth={3} />
              </motion.div>
              <p className="mb-2 text-sm font-bold uppercase tracking-[0.22em] text-emerald-100">Order confirmed</p>
              <h1 className="text-3xl font-black">Thank you for your order</h1>
              <p className="mt-3 text-sm text-emerald-100">We’ll contact you on WhatsApp to confirm delivery.</p>
            </div>
            <div className="p-7 sm:p-9">
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                <div className="flex items-center justify-between border-b border-slate-200 pb-4">
                  <span className="text-sm text-slate-500">Order number</span>
                  <span className="font-black text-slate-900">{orderId}</span>
                </div>
                <div className="flex items-center justify-between pt-4">
                  <span className="text-sm text-slate-500">Order total</span>
                  <span className="text-lg font-black text-emerald-700">{formatMoney(confirmedTotal)}</span>
                </div>
              </div>
              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                <Link href="/" className="rounded-xl bg-emerald-700 px-5 py-3.5 text-center text-sm font-bold text-white transition hover:bg-emerald-800">
                  Back to home
                </Link>
                <a href="https://wa.me/237678123456" target="_blank" rel="noreferrer" className="rounded-xl border border-slate-200 px-5 py-3.5 text-center text-sm font-bold text-slate-700 transition hover:border-emerald-600 hover:text-emerald-700">
                  Get help
                </a>
              </div>
            </div>
          </motion.section>
        </main>
        <Footer />
      </>
    )
  }

  if (cart.length === 0) {
    return (
      <>
        <Header />
        <main className="flex min-h-[70vh] items-center justify-center bg-[#f7f9f8] px-4 py-16">
          <div className="max-w-md text-center">
            <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-emerald-50">
              <ShoppingBag className="h-11 w-11 text-emerald-700" />
            </div>
            <h1 className="text-3xl font-black text-slate-950">Your cart is empty</h1>
            <p className="mt-3 text-slate-500">Choose a powerbank and come back when you’re ready to check out.</p>
            <Link href="/products" className="mt-8 inline-flex items-center gap-2 rounded-xl bg-emerald-700 px-7 py-3.5 font-bold text-white hover:bg-emerald-800">
              Explore powerbanks <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </main>
        <Footer />
      </>
    )
  }

  return (
    <>
      <Header />
      <main className="min-h-screen bg-[#f7f9f8] pb-16">
        <div className="border-b border-slate-200 bg-white">
          <div className="mx-auto max-w-7xl px-4 py-9 sm:px-6 lg:px-8">
            <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
              <div>
                <p className="mb-2 text-xs font-black uppercase tracking-[0.22em] text-emerald-700">Flexible payment</p>
                <h1 className="text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">Payment on Installment</h1>
                <p className="mt-2 text-sm text-slate-500">Get your powerbank today. Pay in easy installments and we deliver when payment is completed.</p>
              </div>
              <div className="inline-flex w-fit items-center gap-3 rounded-2xl border border-emerald-100 bg-emerald-50 px-4 py-3">
                <ShieldCheck className="h-7 w-7 text-emerald-700" />
                <div>
                  <p className="text-xs font-black text-emerald-900">100% secure checkout</p>
                  <p className="text-[11px] text-emerald-700">Your details are protected</p>
                </div>
              </div>
            </div>

            <div className="mt-9 grid grid-cols-5">
              {steps.map((item, index) => {
                const Icon = item.icon
                const complete = step > item.number
                const active = step === item.number
                return (
                  <div key={item.number} className="relative flex flex-col items-center">
                    {index > 0 && <div className={`absolute right-1/2 top-5 h-0.5 w-full ${step > index ? 'bg-emerald-600' : 'bg-slate-200'}`} />}
                    <button
                      type="button"
                      disabled={!complete}
                      onClick={() => complete && setStep(item.number)}
                      className={`relative z-10 flex h-10 w-10 items-center justify-center rounded-full border-2 transition ${
                        complete || active
                          ? 'border-emerald-700 bg-emerald-700 text-white shadow-[0_0_0_5px_rgba(4,120,87,0.08)]'
                          : 'border-slate-200 bg-white text-slate-400'
                      }`}
                    >
                      {complete ? <Check className="h-4 w-4" strokeWidth={3} /> : <Icon className="h-4 w-4" />}
                    </button>
                    <span className={`mt-2 hidden text-xs font-bold sm:block ${active ? 'text-emerald-800' : 'text-slate-500'}`}>
                      {item.label}
                    </span>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        <div className="mx-auto mt-8 grid max-w-7xl gap-7 px-4 sm:px-6 lg:grid-cols-[minmax(0,1fr)_370px] lg:px-8">
          <div className="space-y-6">
            <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_10px_40px_rgba(15,23,42,0.04)]">
              <div className="border-b border-slate-100 px-5 py-5 sm:px-7">
                <div className="flex items-center gap-3">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-700 text-sm font-black text-white">{step}</span>
                  <div>
                    <h2 className="text-lg font-black text-slate-950">
                      {step === 1 && 'Review your cart'}
                      {step === 2 && 'Choose Your Installment Plan'}
                      {step === 3 && 'Your Details & Delivery'}
                      {step === 4 && 'Choose a payment method'}
                    </h2>
                    <p className="text-xs text-slate-500">
                      {step === 1 && 'Confirm your products and quantities'}
                      {step === 2 && 'Select the monthly plan that works for you'}
                      {step === 3 && 'Tell us who you are and where to deliver'}
                      {step === 4 && 'All payments are handled securely'}
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-5 sm:p-7">
                <AnimatePresence mode="wait">
                  {step === 1 && (
                    <motion.div key="cart" initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -12 }} className="space-y-4">
                      {cart.map((item) => (
                        <div key={item.product.id} className="flex flex-col gap-4 rounded-2xl border border-slate-200 p-4 sm:flex-row sm:items-center">
                          <ProductArtwork item={item} />
                          <div className="min-w-0 flex-1">
                            <p className="truncate font-black text-slate-900">{item.product.name}</p>
                            <p className="mt-1 text-xs text-slate-500">{item.product.capacity} · {item.product.charging_speed}</p>
                            <p className="mt-2 text-sm font-black text-emerald-700">{formatMoney(item.product.price)}</p>
                          </div>
                          <div className="flex items-center justify-between gap-4 sm:justify-end">
                            <div className="flex items-center rounded-xl border border-slate-200 bg-slate-50 p-1">
                              <button type="button" aria-label="Decrease quantity" onClick={() => updateCartQuantity(item.product.id, item.quantity - 1)} className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-600 hover:bg-white"><Minus className="h-3.5 w-3.5" /></button>
                              <span className="w-8 text-center text-sm font-black">{item.quantity}</span>
                              <button type="button" aria-label="Increase quantity" onClick={() => updateCartQuantity(item.product.id, item.quantity + 1)} className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-600 hover:bg-white"><Plus className="h-3.5 w-3.5" /></button>
                            </div>
                            <button type="button" aria-label={`Remove ${item.product.name}`} onClick={() => removeFromCart(item.product.id)} className="rounded-lg p-2 text-slate-400 hover:bg-red-50 hover:text-red-600"><Trash2 className="h-4 w-4" /></button>
                          </div>
                        </div>
                      ))}
                    </motion.div>
                  )}

                  {step === 2 && (
                    <motion.div key="plan" initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -12 }} className="space-y-5">
                      <SelectedProducts cart={cart} />
                      <div>
                        <p className="mb-3 text-sm font-black text-slate-900">Select a Plan</p>
                        <div className="space-y-3">
                          {installmentPlans.map((option) => {
                            const optionTotal = Math.round(cartTotal * (1 + option.markup))
                            const optionMonthly = Math.ceil(optionTotal / option.months)
                            const selected = selectedPlan === option.months
                            return (
                              <button
                                type="button"
                                key={option.months}
                                onClick={() => setSelectedPlan(option.months)}
                                className={`grid w-full grid-cols-[28px_55px_1fr_1fr] items-center gap-2 rounded-xl border-2 p-4 text-left transition sm:grid-cols-[28px_70px_1fr_1fr_auto] ${
                                  selected ? 'border-emerald-700 bg-emerald-50/40 shadow-sm' : 'border-slate-200 hover:border-emerald-300'
                                }`}
                              >
                                <span className={`flex h-5 w-5 items-center justify-center rounded-full border-2 ${selected ? 'border-emerald-700 bg-emerald-700 text-white' : 'border-slate-300'}`}>
                                  {selected && <Check className="h-3 w-3" strokeWidth={4} />}
                                </span>
                                <span className="text-center"><strong className="block text-xl text-slate-950">{option.months}</strong><small className="text-[10px] text-slate-500">Months</small></span>
                                <span><small className="block text-[10px] text-slate-500">Monthly Payment</small><strong className="text-xs text-slate-900 sm:text-sm">{formatMoney(optionMonthly)}</strong></span>
                                <span><small className="block text-[10px] text-slate-500">Total to Pay</small><strong className="text-xs text-slate-900 sm:text-sm">{formatMoney(optionTotal)}</strong></span>
                                {option.badge && <span className={`col-start-3 w-fit rounded-md px-2 py-1 text-[10px] font-black sm:col-start-auto ${option.badgeClass}`}>{option.badge}</span>}
                              </button>
                            )
                          })}
                        </div>
                      </div>
                      <div className="flex gap-3 rounded-xl border border-emerald-100 bg-emerald-50 p-4 text-xs text-emerald-800">
                        <CircleHelp className="h-5 w-5 shrink-0" />
                        <p><strong className="block">You will receive your powerbank after your last payment is completed.</strong>No hidden fees. Clear and transparent.</p>
                      </div>
                    </motion.div>
                  )}

                  {step === 3 && (
                    <motion.div key="details" initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -12 }} className="grid gap-5 sm:grid-cols-2">
                      <Field label="Full name" error={errors.fullName}>
                        <input value={formData.fullName} onChange={(event) => updateField('fullName', event.target.value)} placeholder="e.g. Samuel Nkom" className={`${inputClass} ${errors.fullName ? 'border-red-400' : ''}`} />
                      </Field>
                      <Field label="Phone number" error={errors.phone}>
                        <div className="flex">
                          <span className="flex items-center rounded-l-xl border border-r-0 border-slate-200 bg-slate-50 px-3 text-sm font-bold text-slate-600">+237</span>
                          <input type="tel" inputMode="numeric" maxLength={9} value={formData.phone.replace(PHONE_COUNTRY_CODE, '')} onChange={(event) => updateField('phone', `${PHONE_COUNTRY_CODE}${event.target.value.replace(/\D/g, '').slice(0, 9)}`)} placeholder="6 52 57 29 92" className={`${inputClass} rounded-l-none ${errors.phone ? 'border-red-400' : ''}`} />
                        </div>
                      </Field>
                      <Field label="Region" error={errors.region}>
                        <Select value={formData.region} onChange={handleRegionChange} placeholder="Select region" options={REGIONS} />
                      </Field>
                      <Field label="City" error={errors.city}>
                        <Select value={formData.city} onChange={handleCityChange} placeholder="Select city" options={selectedCities} disabled={!formData.region} />
                      </Field>
                      <Field label="Quarter" error={errors.quarter}>
                        <Select value={formData.quarter} onChange={(value) => updateField('quarter', value)} placeholder="Select quarter" options={selectedQuarters} disabled={!formData.city} />
                      </Field>
                      <Field label="Landmark (optional)">
                        <input value={formData.landmark} onChange={(event) => updateField('landmark', event.target.value)} placeholder="Near a known place" className={inputClass} />
                      </Field>
                      <div className="sm:col-span-2">
                        <Field label="Full delivery address" error={errors.address}>
                          <input value={formData.address} onChange={(event) => updateField('address', event.target.value)} placeholder="Street, building or detailed directions" className={`${inputClass} ${errors.address ? 'border-red-400' : ''}`} />
                        </Field>
                      </div>
                      <div className="sm:col-span-2 flex gap-3 rounded-xl border border-emerald-100 bg-emerald-50 p-4 text-sm text-emerald-800">
                        <BadgeCheck className="h-5 w-5 shrink-0" /><p>Your details are only used for payment and delivery updates.</p>
                      </div>
                    </motion.div>
                  )}

                  {step === 4 && (
                    <motion.div key="payment" initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -12 }} className="space-y-3">
                      {[
                        { id: 'mtn', label: 'MTN Mobile Money', detail: 'Pay instantly with your MTN MoMo account', icon: WalletCards, color: 'bg-yellow-400 text-slate-950' },
                        { id: 'orange', label: 'Orange Money', detail: 'Fast payment from your Orange Money wallet', icon: WalletCards, color: 'bg-orange-500 text-white' },
                        { id: 'cod', label: 'Cash on delivery', detail: 'Pay when your order arrives', icon: Banknote, color: 'bg-emerald-700 text-white' },
                      ].map((method) => {
                        const Icon = method.icon
                        const selected = formData.paymentMethod === method.id
                        return (
                          <label key={method.id} className={`flex cursor-pointer items-center gap-4 rounded-2xl border-2 p-4 transition ${selected ? 'border-emerald-700 bg-emerald-50/60' : 'border-slate-200 hover:border-slate-300'}`}>
                            <input type="radio" name="payment" className="sr-only" checked={selected} onChange={() => updateField('paymentMethod', method.id)} />
                            <span className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${method.color}`}><Icon className="h-5 w-5" /></span>
                            <span className="min-w-0 flex-1">
                              <span className="block font-black text-slate-900">{method.label}</span>
                              <span className="block text-xs text-slate-500">{method.detail}</span>
                            </span>
                            <span className={`flex h-5 w-5 items-center justify-center rounded-full border-2 ${selected ? 'border-emerald-700 bg-emerald-700 text-white' : 'border-slate-300'}`}>{selected && <Check className="h-3 w-3" strokeWidth={4} />}</span>
                          </label>
                        )
                      })}
                      <div className="mt-5 flex gap-3 rounded-xl border border-emerald-100 bg-emerald-50 p-4 text-sm text-emerald-800">
                        <LockKeyhole className="h-5 w-5 shrink-0" />
                        <p>Your payment details are encrypted and never stored on this device.</p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {errors.cart && <ErrorMessage message={errors.cart} />}
                {errors.submit && <ErrorMessage message={errors.submit} />}

                {step >= 2 && (
                  <div className="mt-7 flex items-center justify-between rounded-xl bg-slate-50 px-4 py-3">
                    <span className="text-xs text-slate-500">Due Today (First Payment)</span>
                    <span className="text-lg font-black text-emerald-700">{formatMoney(dueToday)}</span>
                  </div>
                )}

                <div className="mt-7 flex flex-col-reverse gap-3 border-t border-slate-100 pt-6 sm:flex-row sm:justify-between">
                  {step > 1 ? (
                    <button type="button" onClick={() => setStep((current) => current - 1)} className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 px-5 py-3.5 text-sm font-bold text-slate-700 transition hover:bg-slate-50">
                      <ArrowLeft className="h-4 w-4" /> Back
                    </button>
                  ) : <Link href="/products" className="inline-flex items-center justify-center gap-2 px-3 py-3.5 text-sm font-bold text-slate-500 hover:text-emerald-700"><ArrowLeft className="h-4 w-4" /> Continue shopping</Link>}
                  {step < 4 ? (
                    <button type="button" onClick={handleNext} className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-700 px-7 py-3.5 text-sm font-black text-white shadow-lg shadow-emerald-900/10 transition hover:bg-emerald-800">
                      Continue <ArrowRight className="h-4 w-4" />
                    </button>
                  ) : (
                    <button type="button" disabled={isProcessing} onClick={handlePlaceOrder} className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-700 px-7 py-3.5 text-sm font-black text-white shadow-lg shadow-emerald-900/10 transition hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-60">
                      <LockKeyhole className="h-4 w-4" /> {isProcessing ? 'Placing order...' : 'Place secure order'}
                    </button>
                  )}
                </div>
              </div>
            </section>

            <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-[0_10px_40px_rgba(15,23,42,0.04)]">
              <h2 className="text-sm font-black text-slate-950">How Installment Works</h2>
              <div className="relative mt-6 grid gap-6 sm:grid-cols-4">
                <div className="absolute left-[12%] right-[12%] top-6 hidden border-t-2 border-dashed border-slate-200 sm:block" />
                {[
                  { icon: ClipboardCheck, title: '1. Choose Plan', text: 'Select the plan that suits you', color: 'bg-emerald-700' },
                  { icon: CreditCard, title: '2. Make Payments', text: 'Pay your first installment', color: 'bg-amber-500' },
                  { icon: CalendarDays, title: '3. Stay On Track', text: 'Pay on time each month', color: 'bg-red-600' },
                  { icon: Truck, title: '4. We Deliver', text: 'We deliver after final payment', color: 'bg-green-800' },
                ].map((item) => {
                  const Icon = item.icon
                  return (
                    <div key={item.title} className="relative text-center">
                      <span className={`mx-auto flex h-12 w-12 items-center justify-center rounded-full text-white ring-4 ring-white ${item.color}`}><Icon className="h-5 w-5" /></span>
                      <p className="mt-3 text-xs font-black text-slate-900">{item.title}</p>
                      <p className="mt-1 text-[10px] leading-relaxed text-slate-500">{item.text}</p>
                    </div>
                  )
                })}
              </div>
            </section>
          </div>

          <aside className="space-y-5">
            <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-[0_10px_40px_rgba(15,23,42,0.04)] lg:sticky lg:top-28">
              <h2 className="text-lg font-black text-slate-950">Order summary</h2>
              <div className="mt-5 space-y-4">
                {cart.map((item) => (
                  <div key={item.product.id} className="flex items-center gap-3">
                    <ProductArtwork item={item} compact />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-black text-slate-900">{item.product.name}</p>
                      <p className="text-xs text-slate-500">Qty {item.quantity}</p>
                    </div>
                    <p className="text-xs font-black text-slate-900">{formatMoney(item.product.price * item.quantity)}</p>
                  </div>
                ))}
              </div>
              <div className="mt-5 space-y-3 border-t border-slate-100 pt-5 text-sm">
                <div className="flex justify-between text-slate-500"><span>Plan</span><span className="font-bold text-slate-800">{selectedPlan} months</span></div>
                <div className="flex justify-between text-slate-500"><span>Monthly payment</span><span className="font-bold text-slate-800">{formatMoney(monthlyPayment)}</span></div>
                <div className="flex justify-between border-t border-slate-100 pt-4"><span className="font-black text-slate-950">Total to pay</span><span className="text-lg font-black text-red-600">{formatMoney(installmentTotal)}</span></div>
                <div className="flex justify-between"><span className="font-black text-slate-950">Due today</span><span className="text-lg font-black text-emerald-700">{formatMoney(dueToday)}</span></div>
              </div>
              <div className="mt-5 flex items-center justify-center gap-2 rounded-xl bg-slate-50 py-3 text-[11px] font-bold text-slate-500">
                <LockKeyhole className="h-3.5 w-3.5 text-emerald-700" /> Secure checkout
              </div>
            </section>

            <section className="rounded-2xl border border-amber-100 bg-amber-50 p-5">
              <h3 className="flex items-center gap-2 text-sm font-black text-slate-900"><CircleHelp className="h-4 w-4 text-amber-600" /> Why Pay on Installment?</h3>
              <ul className="mt-3 space-y-2">
                {['Get your powerbank today', 'Flexible payment plans', 'No hidden charges', 'Secure and trusted', 'Delivery when fully paid'].map((item) => <li key={item} className="flex items-center gap-2 text-xs text-slate-600"><CheckCircle2 className="h-4 w-4 text-emerald-600" />{item}</li>)}
              </ul>
            </section>

            <section className="rounded-2xl border border-slate-200 bg-white p-5">
              <p className="text-sm font-black text-slate-900">We Accept</p>
              <div className="mt-3 flex flex-wrap gap-2">
                <span className="rounded-md bg-yellow-400 px-3 py-2 text-[10px] font-black text-slate-950">MTN MoMo</span>
                <span className="rounded-md bg-orange-500 px-3 py-2 text-[10px] font-black text-white">Orange Money</span>
                <span className="rounded-md bg-blue-700 px-3 py-2 text-[10px] font-black italic text-white">VISA</span>
                <span className="rounded-md bg-slate-900 px-3 py-2 text-[10px] font-black text-white">Mastercard</span>
              </div>
            </section>

            <section className="flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-5">
              <span className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-50 text-emerald-700"><Headphones className="h-6 w-6" /></span>
              <div><p className="text-sm font-black text-slate-900">Need help?</p><p className="text-xs text-slate-500">Call us on <a href="tel:+237678123456" className="font-black text-emerald-700">+237 678 123 456</a></p></div>
            </section>
          </aside>
        </div>
      </main>
      <Footer />
    </>
  )
}

function ProductArtwork({ item, compact = false }: { item: CartItem; compact?: boolean }) {
  return (
    <div className={`relative flex shrink-0 items-center justify-center overflow-hidden rounded-xl bg-linear-to-br from-slate-100 to-slate-200 ${compact ? 'h-14 w-14' : 'h-24 w-24'}`}>
      <div className={`relative flex items-center justify-center rounded-lg bg-slate-900 shadow-xl ${compact ? 'h-10 w-7' : 'h-16 w-10'}`}>
        <Zap className={`${compact ? 'h-3.5 w-3.5' : 'h-5 w-5'} fill-emerald-400 text-emerald-400`} />
      </div>
      {/* Product files can be added under public/products; the branded fallback remains visible if an image is unavailable. */}
      <Image
        src={item.product.image}
        alt={item.product.name}
        fill
        sizes={compact ? '56px' : '96px'}
        unoptimized
        onError={(event) => { event.currentTarget.style.display = 'none' }}
        className="absolute inset-0 h-full w-full object-contain p-2"
      />
    </div>
  )
}

function SelectedProducts({ cart }: { cart: CartItem[] }) {
  return (
    <div className="space-y-3">
      {cart.map((item) => (
        <div key={item.product.id} className="flex items-center gap-4 rounded-xl border border-slate-200 bg-slate-50/60 p-4">
          <ProductArtwork item={item} />
          <div className="min-w-0 flex-1">
            <p className="font-black text-slate-950">{item.product.name}</p>
            <p className="mt-1 text-xs text-slate-500">{item.product.capacity} · {item.product.charging_speed} · Qty {item.quantity}</p>
            <p className="mt-2 text-sm font-black text-red-600">Price: {formatMoney(item.product.price * item.quantity)}</p>
          </div>
        </div>
      ))}
    </div>
  )
}

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-2 block text-xs font-black uppercase tracking-wide text-slate-700">{label}</span>
      {children}
      {error && <span className="mt-1.5 block text-xs font-semibold text-red-600">{error}</span>}
    </label>
  )
}

function Select({ value, onChange, placeholder, options, disabled }: { value: string; onChange: (value: string) => void; placeholder: string; options: string[]; disabled?: boolean }) {
  return (
    <div className="relative">
      <select value={value} disabled={disabled} onChange={(event) => onChange(event.target.value)} className={`${inputClass} appearance-none pr-10 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-400`}>
        <option value="">{placeholder}</option>
        {options.map((option) => <option key={option} value={option}>{option}</option>)}
      </select>
      <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
    </div>
  )
}

function ErrorMessage({ message }: { message: string }) {
  return <div className="mt-5 flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-sm font-semibold text-red-700"><AlertCircle className="h-4 w-4 shrink-0" />{message}</div>
}
