'use client'

import Header from '@/components/header'
import Footer from '@/components/footer'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ShoppingCart, ChevronRight, Check, Truck, Headphones } from 'lucide-react'
import { useCartStore } from '@/lib/store'
import { PRODUCTS } from '@/lib/products'
import { toast } from 'sonner'

export default function Home() {
  const router = useRouter()
  const { addToCart } = useCartStore()

  const handleBuyNow = (product: any) => {
    addToCart(product, 1)
    toast.success(`${product.name} added — heading to checkout`)
    router.push('/checkout')
  }

  return (
    <div className="bg-background min-h-screen flex flex-col">
      <Header />

      {/* Hero Section with Products */}
      <section className="relative bg-gradient-to-b from-green-700 via-green-700 to-green-800 text-white overflow-hidden py-16">
        {/* Cameroon Flag Background - Simplified */}
        <div className="absolute top-0 right-0 w-80 h-80 opacity-15">
          <div className="absolute inset-0 grid grid-cols-1 grid-rows-3">
            <div className="bg-red-600"></div>
            <div className="bg-yellow-400"></div>
            <div className="bg-green-600"></div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid lg:grid-cols-2 gap-8 items-center">
            {/* Left Content */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
            >
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-6 leading-tight break-words">
                NEVER RUN
                <br />
                <span className="text-yellow-400">OUT OF POWER</span>
              </h1>

              <p className="text-lg text-gray-100 mb-8">
                Reliable Power. Fast Delivery.
                <br />
                Anywhere in Cameroon.
              </p>

              <Link
                href="#products"
                className="inline-flex items-center gap-2 px-8 py-3 bg-yellow-400 text-black font-bold rounded-lg hover:bg-yellow-300 transition-all"
              >
                SHOP NOW
                <ChevronRight className="w-5 h-5" />
              </Link>

              {/* Trust Badges */}
              <div className="grid grid-cols-3 gap-2 sm:gap-4 mt-12 max-w-sm">
                <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
                  <Check className="w-5 h-5 sm:w-6 sm:h-6 text-yellow-400 flex-shrink-0" />
                  <div className="text-xs sm:text-sm min-w-0">
                    <div className="font-bold">100%</div>
                    <div>Genuine</div>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
                  <Truck className="w-5 h-5 sm:w-6 sm:h-6 text-yellow-400 flex-shrink-0" />
                  <div className="text-xs sm:text-sm min-w-0">
                    <div className="font-bold">Fast</div>
                    <div>Delivery</div>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
                  <Headphones className="w-5 h-5 sm:w-6 sm:h-6 text-yellow-400 flex-shrink-0" />
                  <div className="text-xs sm:text-sm min-w-0">
                    <div className="font-bold">24/7</div>
                    <div>Support</div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Right - Product Cards Display */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="flex items-center justify-center h-96 relative"
            >
              <div className="flex items-end justify-center gap-2 sm:gap-4 h-full relative">
                {/* Left Product */}
                <motion.div
                  animate={{ y: [10, 0, 10] }}
                  transition={{ duration: 3, repeat: Infinity }}
                  className="w-20 sm:w-28 bg-white rounded-lg shadow-lg overflow-hidden"
                >
                  <div className="bg-gradient-to-b from-gray-200 to-gray-300 h-24 sm:h-32 flex items-center justify-center">
                    <div className="w-12 h-16 sm:w-16 sm:h-20 bg-gray-700 rounded-sm"></div>
                  </div>
                  <div className="p-1.5 sm:p-2 text-center text-gray-900">
                    <div className="text-xs font-bold bg-green-600 text-white rounded px-1 mb-1">10K</div>
                    <div className="text-[10px] sm:text-xs">10,000mAh</div>
                  </div>
                </motion.div>

                {/* Center Product - Larger */}
                <motion.div
                  animate={{ y: [-10, 0, -10] }}
                  transition={{ duration: 3, repeat: Infinity }}
                  className="w-24 sm:w-32 bg-white rounded-lg shadow-2xl overflow-hidden transform sm:scale-110"
                >
                  <div className="bg-gradient-to-b from-gray-100 to-gray-200 h-28 sm:h-40 flex items-center justify-center">
                    <div className="w-14 h-18 sm:w-18 sm:h-24 bg-gray-900 rounded-sm"></div>
                  </div>
                  <div className="p-2 sm:p-3 text-center text-gray-900">
                    <div className="text-xs font-bold bg-green-600 text-white rounded px-1 mb-1">20K</div>
                    <div className="text-[10px] sm:text-xs">20,000mAh</div>
                    <div className="font-bold text-xs sm:text-sm mt-1">Popular</div>
                  </div>
                </motion.div>

                {/* Right Product */}
                <motion.div
                  animate={{ y: [8, 0, 8] }}
                  transition={{ duration: 3.5, repeat: Infinity }}
                  className="w-20 sm:w-28 bg-blue-900 rounded-lg shadow-lg overflow-hidden"
                >
                  <div className="bg-gradient-to-b from-blue-800 to-blue-900 h-24 sm:h-32 flex items-center justify-center">
                    <div className="w-12 h-16 sm:w-16 sm:h-20 bg-gray-800 rounded-sm"></div>
                  </div>
                  <div className="p-1.5 sm:p-2 text-center text-white">
                    <div className="text-xs font-bold bg-green-500 rounded px-1 mb-1">30K</div>
                    <div className="text-[10px] sm:text-xs">30,000mAh</div>
                  </div>
                </motion.div>
              </div>

              {/* Golden accent line */}
              <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-48 h-1 bg-gradient-to-r from-transparent via-yellow-400 to-transparent rounded-full blur"></div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Products Section */}
      <section id="products" className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Section Header */}
          <div className="text-center mb-12">
            <div className="flex items-center justify-center gap-4 mb-4">
              <div className="h-1 w-12 bg-yellow-400"></div>
              <h2 className="text-3xl font-bold text-gray-900">OUR POWER BANKS</h2>
              <div className="h-1 w-12 bg-yellow-400"></div>
            </div>
            <p className="text-gray-600">Power for every need. Quality you can trust.</p>
          </div>

          {/* Products Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {PRODUCTS.map((product, idx) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                className="bg-gray-50 rounded-xl p-6 hover:shadow-lg transition-shadow border border-gray-200"
              >
                {/* Badge */}
                <div className="inline-block px-3 py-1 bg-green-600 text-white text-xs font-bold rounded-full mb-4">
                  {product.capacity}
                </div>

                {/* Product Image Placeholder */}
                <div className="h-48 bg-gradient-to-b from-gray-300 to-gray-400 rounded-lg flex items-center justify-center mb-4">
                  <div className="text-center">
                    <div className="text-4xl text-gray-700">■</div>
                    <div className="text-xs text-gray-600 mt-2 font-semibold">{product.name}</div>
                  </div>
                </div>

                {/* Product Details */}
                <h3 className="font-bold text-gray-900 mb-3 text-sm">{product.name}</h3>
                <ul className="text-xs text-gray-600 space-y-2 mb-4">
                  {product.features.slice(0, 3).map((feature, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="text-green-600 mt-0.5">•</span>
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>

                {/* Price */}
                <div className="text-xl font-bold text-green-600 mb-4">
                  {(product.price / 1000).toFixed(0)}K FCFA
                </div>

                {/* Button */}
                <button
                  onClick={() => handleBuyNow(product)}
                  className="w-full py-2 bg-yellow-400 text-black font-bold rounded-lg hover:bg-yellow-300 transition-all text-sm flex items-center justify-center gap-2"
                >
                  <ShoppingCart className="w-4 h-4" />
                  BUY NOW
                </button>
              </motion.div>
            ))}
          </div>

          {/* See More Products Button */}
          <div className="mt-12 text-center">
            <Link
              href="/products"
              className="inline-flex items-center gap-2 px-8 py-3 bg-green-600 text-white font-bold rounded-lg hover:bg-green-700 transition-all"
            >
              <span>SEE ALL PRODUCTS</span>
              <ChevronRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
