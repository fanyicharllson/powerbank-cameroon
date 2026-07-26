'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ShoppingCart, Zap, Menu, X } from 'lucide-react'
import { useCartStore } from '@/lib/store'
import { motion } from 'framer-motion'

export default function Header() {
  const cartCount = useCartStore((state) => state.getCartCount())
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const navItems = [
    { label: 'HOME', href: '/' },
    { label: 'PRODUCTS', href: '/products' },
    { label: 'CONTACT', href: '/contact' },
  ]

  return (
    <header className="sticky top-0 z-50 bg-green-900 shadow-lg">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-3 flex-shrink-0">
          <motion.div
            whileHover={{ rotate: 10 }}
            className="flex items-center gap-2"
          >
            <Zap className="w-8 h-8 text-yellow-400 fill-yellow-400" />
            <div className="flex flex-col leading-tight">
              <span className="text-base font-bold text-white">POWERBANK</span>
              <span className="text-xs font-semibold text-yellow-400">CAMEROON</span>
            </div>
          </motion.div>
          <div className="hidden sm:flex flex-col leading-tight ml-2 border-l border-green-700 pl-2">
            <span className="text-xs text-green-100">Never Run Out Of Power.</span>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-12">
          {navItems.map((item) => (
            <a
              key={item.label}
              href={item.href}
              className="text-sm font-semibold text-white hover:text-yellow-300 transition-colors"
            >
              {item.label}
            </a>
          ))}
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-4">
          {/* WhatsApp Button */}
          <a
            href="https://wa.me/237678123456"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden sm:flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-semibold"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.67-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.076 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421-7.403h-.004a9.87 9.87 0 00-4.255.949c-1.238.503-2.39 1.214-3.422 2.048-1.031.834-1.97 1.857-2.782 3.05C1.704 10.97 1.035 12.1.702 13.313c-.333 1.213-.326 2.38.006 3.529.332 1.15.926 2.291 1.775 3.286a9.723 9.723 0 001.602 1.378c.484.299.992.523 1.502.805.51.521 1.02 1.075 1.513 1.645.494.57.96 1.179 1.387 1.822.427.643.806 1.318 1.122 2.007.316.69.558 1.405.722 2.127.164.722.145 1.455-.061 2.179-.206.724-.593 1.426-1.155 2.087-.561.66-1.302 1.264-2.21 1.797-.908.533-1.983.996-3.21 1.377-1.226.381-2.604.68-4.116.885-1.512.206-3.174.23-4.972.073-1.798-.157-3.738-.571-5.8-1.241-.412-.139-.816-.285-1.211-.436-2.347-.925-4.597-2.214-6.652-3.85C-.577 28.5-1.648 26.576-2.448 24.41c-.8-2.167-1.328-4.581-1.583-7.23-.256-2.648-.237-5.532.054-8.625.291-3.094.915-6.383 1.87-9.777.954-3.395 2.239-6.893 3.854-10.466 1.616-3.572 3.562-7.108 5.84-10.57C5.009-3.788 7.235-7.136 9.71-10.26c2.476-3.122 5.2-5.998 8.15-8.603 2.95-2.606 6.127-4.931 9.498-6.95 3.37-2.02 6.933-3.73 10.656-5.101"  />
            </svg>
            WHATSAPP US
          </a>

          {/* Cart Button */}
          <Link
            href="/checkout"
            className="relative p-2 text-white hover:text-yellow-300 transition-colors"
          >
            <ShoppingCart className="w-6 h-6" />
            {cartCount > 0 && (
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute top-0 right-0 w-5 h-5 bg-yellow-400 text-green-900 text-xs font-bold rounded-full flex items-center justify-center"
              >
                {cartCount}
              </motion.span>
            )}
          </Link>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 text-white"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>
        </div>
      </nav>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="md:hidden border-t border-green-700 bg-green-800"
        >
          <div className="px-4 py-4 space-y-2">
            {navItems.map((item) => (
              <a
                key={item.label}
                href={item.href}
                className="block px-3 py-2 text-sm font-semibold text-white hover:text-yellow-300 hover:bg-green-700 rounded-lg transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                {item.label}
              </a>
            ))}
          </div>
        </motion.div>
      )}
    </header>
  )
}
