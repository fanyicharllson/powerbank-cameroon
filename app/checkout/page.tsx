'use client'

import { useState } from 'react'
import Link from 'next/link'
import Header from '@/components/header'
import Footer from '@/components/footer'
import { useCartStore, OrderData } from '@/lib/store'
import { DELIVERY_FEE, REGIONS, CITIES, QUARTERS } from '@/lib/products'
import { sendWhatsAppNotification, formatWhatsAppMessage, generateOrderId } from '@/lib/api'
import { ChevronLeft, ChevronRight, Trash2, AlertCircle, ShoppingCart, User, MapPin, CreditCard, Check } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

export default function CheckoutPage() {
  const cart = useCartStore((state) => state.cart)
  const setOrderData = useCartStore((state) => state.setOrderData)
  const clearCart = useCartStore((state) => state.clearCart)
  const cartTotal = useCartStore((state) => state.getCartTotal())
  
  const [step, setStep] = useState(1) // 1: Cart, 2: Customer Info, 3: Delivery, 4: Payment, 5: Confirmation
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
  const [selectedCities, setSelectedCities] = useState<string[]>([])
  const [selectedQuarters, setSelectedQuarters] = useState<string[]>([])
  const [isProcessing, setIsProcessing] = useState(false)
  const [orderId, setOrderId] = useState<string>('')
  const [errors, setErrors] = useState<Record<string, string>>({})

  const total = cartTotal + DELIVERY_FEE

  const removeFromCart = useCartStore((state) => state.removeFromCart)
  const updateCartQuantity = useCartStore((state) => state.updateCartQuantity)

  // Update cities when region changes
  const handleRegionChange = (region: string) => {
    setFormData({ ...formData, region, city: '', quarter: '' })
    setSelectedCities(CITIES[region] || [])
    setSelectedQuarters([])
  }

  // Update quarters when city changes
  const handleCityChange = (city: string) => {
    setFormData({ ...formData, city, quarter: '' })
    setSelectedQuarters(QUARTERS[city] || [])
  }

  // Validate form step
  const validateStep = (currentStep: number) => {
    const newErrors: Record<string, string> = {}

    if (currentStep === 2) {
      if (!formData.fullName.trim()) newErrors.fullName = 'Full name is required'
      if (!formData.phone.trim()) newErrors.phone = 'Phone number is required'
      else if (!/^\+?237\d{9}/.test(formData.phone.replace(/[\s-]/g, ''))) {
        newErrors.phone = 'Invalid phone number'
      }
    }

    if (currentStep === 3) {
      if (!formData.region) newErrors.region = 'Region is required'
      if (!formData.city) newErrors.city = 'City is required'
      if (!formData.quarter) newErrors.quarter = 'Quarter is required'
      if (!formData.address.trim()) newErrors.address = 'Address is required'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleNext = () => {
    if (step === 1 && cart.length === 0) {
      setErrors({ cart: 'Your cart is empty' })
      return
    }
    
    // Validate current step before moving to next
    if (step > 1) {
      if (!validateStep(step)) {
        return // Stay on current step if validation fails
      }
    }
    
    // Move to next step
    setErrors({})
    setStep(step + 1)
  }

  const handlePlaceOrder = async () => {
    if (!validateStep(4)) return

    setIsProcessing(true)
    try {
      setOrderData(formData)
      const newOrderId = generateOrderId()
      setOrderId(newOrderId)

      // Format message and send
      const message = formatWhatsAppMessage(newOrderId, formData, cart, total)
      
      // Save to localStorage for demo
      localStorage.setItem('lastOrder', JSON.stringify({
        orderId: newOrderId,
        orderData: formData,
        items: cart,
        total,
        timestamp: new Date().toISOString(),
      }))

      // In production, you would send this to WhatsApp API
      // For demo, we just store it
      await sendWhatsAppNotification(message, formData.phone)

      setStep(5)
      clearCart()
    } catch (error) {
      console.error('Error placing order:', error)
      setErrors({ submit: 'Failed to place order. Please try again.' })
    } finally {
      setIsProcessing(false)
    }
  }

  if (cart.length === 0 && step === 1) {
    return (
      <>
        <Header />
        <main className="min-h-screen bg-background py-20">
          <div className="max-w-2xl mx-auto px-4 text-center">
            <div className="mb-8">
              <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                <ShoppingCart className="w-10 h-10 text-muted-foreground" />
              </div>
              <h1 className="text-3xl font-bold text-foreground mb-2">Your Cart is Empty</h1>
              <p className="text-muted-foreground mb-8">
                Start shopping and add your favorite powerbanks to the cart!
              </p>
              <Link href="/#products" className="inline-flex items-center gap-2 px-8 py-3 bg-accent text-accent-foreground rounded-lg font-semibold hover:bg-accent/90 transition-colors">
                Continue Shopping
              </Link>
            </div>
          </div>
        </main>
        <Footer />
      </>
    )
  }

  if (step === 5) {
    return (
      <>
        <Header />
        <main className="min-h-screen bg-background py-20 flex items-center justify-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="max-w-lg w-full px-4"
          >
            <div className="bg-card rounded-2xl border border-border p-8 text-center">
              {/* Success Icon */}
              <motion.div
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 0.6 }}
                className="w-20 h-20 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-6"
              >
                <Check className="w-10 h-10 text-primary" />
              </motion.div>

              <h1 className="text-3xl font-bold text-foreground mb-2">Thank You!</h1>
              <p className="text-muted-foreground mb-6">
                Your order has been received successfully.
              </p>

              {/* Order Details */}
              <div className="bg-background rounded-lg p-6 mb-6 text-left">
                <p className="text-sm text-muted-foreground mb-2">Order Number</p>
                <p className="text-2xl font-bold text-foreground mb-4">{orderId}</p>

                <div className="border-t border-border pt-4 space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span className="text-foreground font-semibold">{cartTotal.toLocaleString()} FCFA</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Delivery Fee</span>
                    <span className="text-foreground font-semibold">{DELIVERY_FEE.toLocaleString()} FCFA</span>
                  </div>
                  <div className="flex justify-between text-lg border-t border-border pt-3">
                    <span className="text-foreground font-bold">Total</span>
                    <span className="text-accent font-bold">{total.toLocaleString()} FCFA</span>
                  </div>
                </div>
              </div>

              {/* Customer Info */}
              <div className="bg-background rounded-lg p-6 mb-6 text-left">
                <h3 className="font-semibold text-foreground mb-3">Delivery To</h3>
                <p className="text-sm text-muted-foreground mb-2">{formData.fullName}</p>
                <p className="text-sm text-muted-foreground mb-2">{formData.phone}</p>
                <p className="text-sm text-muted-foreground">{formData.address}, {formData.quarter}</p>
              </div>

              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="bg-primary/10 border border-primary/30 rounded-lg p-4 mb-6"
              >
                <p className="text-sm text-primary font-semibold">
                  Your order is being processed. We will contact you shortly via WhatsApp to confirm your delivery details.
                </p>
              </motion.div>

              <div className="space-y-3">
                <Link href="/" className="w-full px-6 py-3 bg-accent text-accent-foreground rounded-lg font-semibold hover:bg-accent/90 transition-colors inline-block">
                  Back to Home
                </Link>
                <a
                  href="https://wa.me/237123456789"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full px-6 py-3 bg-card border border-border rounded-lg font-semibold hover:border-accent transition-colors inline-block"
                >
                  Need Help? Chat with Us
                </a>
              </div>
            </div>
          </motion.div>
        </main>
        <Footer />
      </>
    )
  }

  return (
    <>
      <Header />
      <main className="min-h-screen bg-background py-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Progress Steps */}
          <div className="mb-12">
            <div className="flex items-center justify-between max-w-2xl mx-auto">
              {[
                { num: 1, label: 'Cart', icon: ShoppingCart },
                { num: 2, label: 'Customer', icon: User },
                { num: 3, label: 'Delivery', icon: MapPin },
                { num: 4, label: 'Payment', icon: CreditCard },
              ].map((s, idx) => {
                const Icon = s.icon
                return (
                  <div key={s.num}>
                    <motion.button
                      onClick={() => step > s.num && setStep(s.num)}
                      className={`flex flex-col items-center gap-2 cursor-pointer group`}
                      whileHover={{ scale: 1.05 }}
                    >
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all ${
                          step >= s.num
                            ? 'bg-accent text-accent-foreground'
                            : 'bg-muted text-muted-foreground'
                        }`}
                      >
                        <Icon className="w-5 h-5" />
                      </div>
                      <span className="text-xs font-semibold text-muted-foreground group-hover:text-foreground transition-colors">
                        {s.label}
                      </span>
                    </motion.button>
                    {idx < 3 && (
                      <div
                        className={`w-12 h-0.5 mx-2 transition-colors ${
                          step > s.num ? 'bg-accent' : 'bg-border'
                        }`}
                      />
                    )}
                  </div>
                )
              })}
            </div>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2">
              <AnimatePresence mode="wait">
                {/* Step 1: Cart Review */}
                {step === 1 && (
                  <motion.div
                    key="cart"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="space-y-6"
                  >
                    <h2 className="text-3xl font-bold text-foreground">Your Order</h2>

                    <div className="space-y-3">
                      {cart.map((item) => (
                        <motion.div
                          key={item.product.id}
                          layout
                          className="flex gap-4 p-4 bg-card rounded-lg border border-border hover:border-accent/50 transition-all"
                        >
                          <div className="w-20 h-20 bg-muted rounded-lg flex-shrink-0 flex items-center justify-center">
                            <ShoppingCart className="w-8 h-8 text-muted-foreground" />
                          </div>
                          <div className="flex-grow">
                            <h3 className="font-bold text-foreground">{item.product.name}</h3>
                            <p className="text-sm text-muted-foreground">{item.product.capacity}</p>
                            <p className="text-sm font-semibold text-accent mt-1">
                              {(item.product.price * item.quantity).toLocaleString()} FCFA
                            </p>
                          </div>
                          <div className="flex items-center gap-3">
                            <div className="flex items-center gap-2 bg-background rounded-lg p-1">
                              <button
                                onClick={() => updateCartQuantity(item.product.id, item.quantity - 1)}
                                className="w-7 h-7 flex items-center justify-center hover:bg-muted rounded transition-colors"
                              >
                                −
                              </button>
                              <span className="w-7 text-center font-semibold">{item.quantity}</span>
                              <button
                                onClick={() => updateCartQuantity(item.product.id, item.quantity + 1)}
                                className="w-7 h-7 flex items-center justify-center hover:bg-muted rounded transition-colors"
                              >
                                +
                              </button>
                            </div>
                            <button
                              onClick={() => removeFromCart(item.product.id)}
                              className="p-2 text-muted-foreground hover:text-destructive transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </motion.div>
                      ))}
                    </div>

                    {errors.cart && (
                      <div className="flex items-center gap-2 p-3 bg-destructive/10 border border-destructive/30 rounded-lg text-destructive text-sm">
                        <AlertCircle className="w-4 h-4" />
                        {errors.cart}
                      </div>
                    )}
                  </motion.div>
                )}

                {/* Step 2: Customer Information */}
                {step === 2 && (
                  <motion.div
                    key="customer"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="space-y-6"
                  >
                    <h2 className="text-3xl font-bold text-foreground">Customer Information</h2>

                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-semibold text-foreground mb-2">Full Name *</label>
                        <input
                          type="text"
                          placeholder="Enter your full name"
                          value={formData.fullName}
                          onChange={(e) => {
                            setFormData({ ...formData, fullName: e.target.value })
                            if (errors.fullName) delete errors.fullName
                          }}
                          className={`w-full px-4 py-3 bg-background border rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:border-accent transition-colors ${
                            errors.fullName ? 'border-destructive' : 'border-border'
                          }`}
                        />
                        {errors.fullName && <p className="text-sm text-destructive mt-1">{errors.fullName}</p>}
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-foreground mb-2">Phone Number *</label>
                        <div className="flex gap-2">
                          <select className="px-4 py-3 bg-background border border-border rounded-lg text-foreground">
                            <option>+237</option>
                          </select>
                          <input
                            type="tel"
                            placeholder="6 78 123 456"
                            value={formData.phone}
                            onChange={(e) => {
                              setFormData({ ...formData, phone: e.target.value })
                              if (errors.phone) delete errors.phone
                            }}
                            className={`flex-1 px-4 py-3 bg-background border rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:border-accent transition-colors ${
                              errors.phone ? 'border-destructive' : 'border-border'
                            }`}
                          />
                        </div>
                        {errors.phone && <p className="text-sm text-destructive mt-1">{errors.phone}</p>}
                        <p className="text-xs text-muted-foreground mt-1">We use this number as your login</p>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* Step 3: Delivery Information */}
                {step === 3 && (
                  <motion.div
                    key="delivery"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="space-y-6"
                  >
                    <h2 className="text-3xl font-bold text-foreground">Delivery Information</h2>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-semibold text-foreground mb-2">Region *</label>
                        <select
                          value={formData.region}
                          onChange={(e) => handleRegionChange(e.target.value)}
                          className="w-full px-4 py-3 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:border-accent transition-colors"
                        >
                          <option value="">Select Region</option>
                          {REGIONS.map((r) => (
                            <option key={r} value={r}>
                              {r}
                            </option>
                          ))}
                        </select>
                        {errors.region && <p className="text-sm text-destructive mt-1">{errors.region}</p>}
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-foreground mb-2">City *</label>
                        <select
                          value={formData.city}
                          onChange={(e) => handleCityChange(e.target.value)}
                          disabled={!formData.region}
                          className="w-full px-4 py-3 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:border-accent transition-colors disabled:opacity-50"
                        >
                          <option value="">Select City</option>
                          {selectedCities.map((c) => (
                            <option key={c} value={c}>
                              {c}
                            </option>
                          ))}
                        </select>
                        {errors.city && <p className="text-sm text-destructive mt-1">{errors.city}</p>}
                      </div>

                      <div className="col-span-2">
                        <label className="block text-sm font-semibold text-foreground mb-2">Quarter *</label>
                        <select
                          value={formData.quarter}
                          onChange={(e) => setFormData({ ...formData, quarter: e.target.value })}
                          disabled={!formData.city}
                          className="w-full px-4 py-3 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:border-accent transition-colors disabled:opacity-50"
                        >
                          <option value="">Select Quarter</option>
                          {selectedQuarters.map((q) => (
                            <option key={q} value={q}>
                              {q}
                            </option>
                          ))}
                        </select>
                        {errors.quarter && <p className="text-sm text-destructive mt-1">{errors.quarter}</p>}
                      </div>

                      <div className="col-span-2">
                        <label className="block text-sm font-semibold text-foreground mb-2">Delivery Address *</label>
                        <input
                          type="text"
                          placeholder="Enter delivery address"
                          value={formData.address}
                          onChange={(e) => {
                            setFormData({ ...formData, address: e.target.value })
                            if (errors.address) delete errors.address
                          }}
                          className={`w-full px-4 py-3 bg-background border rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:border-accent transition-colors ${
                            errors.address ? 'border-destructive' : 'border-border'
                          }`}
                        />
                        {errors.address && <p className="text-sm text-destructive mt-1">{errors.address}</p>}
                      </div>

                      <div className="col-span-2">
                        <label className="block text-sm font-semibold text-foreground mb-2">Landmark (Optional)</label>
                        <input
                          type="text"
                          placeholder="e.g., Next to the market"
                          value={formData.landmark}
                          onChange={(e) => setFormData({ ...formData, landmark: e.target.value })}
                          className="w-full px-4 py-3 bg-background border border-border rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:border-accent transition-colors"
                        />
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* Step 4: Payment Method */}
                {step === 4 && (
                  <motion.div
                    key="payment"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="space-y-6"
                  >
                    <h2 className="text-3xl font-bold text-foreground">Payment Method</h2>

                    <div className="space-y-3">
                      {[
                        { id: 'mtn', label: 'MTN Mobile Money', icon: 'M' },
                        { id: 'orange', label: 'Orange Money', icon: 'O' },
                        { id: 'cod', label: 'Cash on Delivery', icon: 'C' },
                      ].map((method) => (
                        <label
                          key={method.id}
                          className="flex items-center gap-4 p-4 bg-card border-2 border-border rounded-lg cursor-pointer hover:border-accent transition-all"
                        >
                          <input
                            type="radio"
                            name="payment"
                            value={method.id}
                            checked={formData.paymentMethod === method.id}
                            onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
                            className="w-4 h-4"
                          />
                          <div className="flex-grow">
                            <p className="font-semibold text-foreground">{method.label}</p>
                          </div>
                          <div className="w-10 h-10 bg-accent/20 rounded flex items-center justify-center font-bold text-accent">
                            {method.icon}
                          </div>
                        </label>
                      ))}
                    </div>

                    <div className="p-4 bg-primary/5 border border-primary/30 rounded-lg">
                      <p className="text-sm text-muted-foreground">
                        Your payment information is secure and encrypted. You will receive a confirmation via WhatsApp after placing your order.
                      </p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Order Summary Sidebar */}
            <div>
              <motion.div
                layout
                className="bg-card rounded-2xl border border-border p-6 sticky top-24 space-y-4"
              >
                <h3 className="text-2xl font-bold text-foreground">Order Summary</h3>

                {cart.length > 0 && (
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {cart.map((item) => (
                      <div key={item.product.id} className="flex justify-between text-sm">
                        <span className="text-muted-foreground">
                          {item.product.name} x {item.quantity}
                        </span>
                        <span className="font-semibold text-foreground">
                          {(item.product.price * item.quantity).toLocaleString()} FCFA
                        </span>
                      </div>
                    ))}
                  </div>
                )}

                <div className="border-t border-border pt-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span className="text-foreground font-semibold">{cartTotal.toLocaleString()} FCFA</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Delivery Fee</span>
                    <span className="text-foreground font-semibold">{DELIVERY_FEE.toLocaleString()} FCFA</span>
                  </div>
                  <div className="border-t border-border pt-2 flex justify-between">
                    <span className="font-bold text-foreground">Total</span>
                    <span className="text-accent font-bold text-lg">{total.toLocaleString()} FCFA</span>
                  </div>
                </div>

                <div className="pt-4 space-y-3">
                  {step > 1 && (
                    <button
                      onClick={() => setStep(step - 1)}
                      className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-muted text-foreground rounded-lg font-semibold hover:bg-muted/80 transition-colors"
                    >
                      <ChevronLeft className="w-4 h-4" />
                      Back
                    </button>
                  )}

                  {step < 4 ? (
                    <button
                      onClick={handleNext}
                      className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-accent hover:bg-accent/90 text-accent-foreground rounded-lg font-semibold transition-colors"
                    >
                      Continue
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  ) : (
                    <motion.button
                      onClick={handlePlaceOrder}
                      disabled={isProcessing}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="w-full px-4 py-3 bg-accent hover:bg-accent/90 text-accent-foreground rounded-lg font-semibold transition-colors disabled:opacity-50"
                    >
                      {isProcessing ? 'Processing...' : 'PLACE ORDER'}
                    </motion.button>
                  )}
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
