'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { Product } from '@/lib/store'
import { ShoppingCart } from 'lucide-react'
import { motion } from 'framer-motion'
import { toast } from 'sonner'

interface ProductCardProps {
  product: Product
  onAddToCart: (product: Product) => void
}

export default function ProductCard({ product, onAddToCart }: ProductCardProps) {
  const router = useRouter()
  const [isAdding, setIsAdding] = useState(false)

  const handleBuyNow = () => {
    setIsAdding(true)
    onAddToCart(product)
    toast.success(`${product.name} added — heading to checkout`)
    router.push('/checkout')
  }

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{ y: -8 }}
        className="group h-full"
      >
        <div className="h-full flex flex-col bg-card rounded-2xl overflow-hidden border border-border hover:border-accent transition-all duration-300">
          {/* Image Container */}
          <div className="relative h-64 bg-gradient-to-br from-muted to-background overflow-hidden">
            {/* Placeholder with animation */}
            <div className="w-full h-full bg-gradient-to-br from-muted via-background to-muted animate-pulse flex items-center justify-center">
              <div className="text-center">
                <div className="w-32 h-32 bg-muted rounded-lg mx-auto mb-4" />
              </div>
            </div>

            {/* Badge */}
            {product.badge && (
              <div className="absolute top-4 right-4 bg-accent text-accent-foreground px-3 py-1 rounded-full text-sm font-bold">
                {product.badge}
              </div>
            )}
          </div>

          {/* Content */}
          <div className="p-4 flex flex-col flex-grow">
            {/* Title */}
            <h3 className="text-lg font-bold text-foreground mb-1 group-hover:text-accent transition-colors">
              {product.name}
            </h3>

            {/* Capacity */}
            <p className="text-sm text-muted-foreground mb-3">
              {product.capacity}
            </p>

            {/* Features */}
            <ul className="text-xs text-muted-foreground space-y-1 mb-4 flex-grow">
              {product.features.slice(0, 2).map((feature, idx) => (
                <li key={idx} className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-accent rounded-full" />
                  {feature}
                </li>
              ))}
            </ul>

            {/* Price */}
            <div className="flex items-baseline justify-between mb-4">
              <span className="text-2xl font-bold text-accent">
                {product.price.toLocaleString()}
              </span>
              <span className="text-xs text-muted-foreground">FCFA</span>
            </div>

            {/* Buy Now Button */}
            <motion.button
              onClick={handleBuyNow}
              disabled={isAdding}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full bg-accent text-accent-foreground py-2.5 rounded-lg font-semibold flex items-center justify-center gap-2 hover:bg-accent/90 disabled:opacity-50 transition-all"
            >
              <ShoppingCart className="w-4 h-4" />
              {isAdding ? 'Redirecting...' : 'BUY NOW'}
            </motion.button>
          </div>
        </div>
      </motion.div>
    </>
  )
}

// Skeleton Loader
export function ProductCardSkeleton() {
  return (
    <div className="h-full flex flex-col bg-card rounded-2xl overflow-hidden border border-border animate-pulse">
      <div className="h-64 bg-muted" />
      <div className="p-4 space-y-3">
        <div className="h-5 bg-muted rounded w-3/4" />
        <div className="h-4 bg-muted rounded w-1/2" />
        <div className="space-y-2 py-2">
          <div className="h-3 bg-muted rounded w-full" />
          <div className="h-3 bg-muted rounded w-5/6" />
        </div>
        <div className="h-8 bg-muted rounded w-1/2 mb-3" />
        <div className="h-10 bg-muted rounded" />
      </div>
    </div>
  )
}
