'use client'

import { useState } from 'react'
import { PRODUCTS } from '@/lib/products'
import { useCartStore, Product } from '@/lib/store'
import ProductCard, { ProductCardSkeleton } from './product-card'
import { motion } from 'framer-motion'

export default function ProductsSection() {
  const addToCart = useCartStore((state) => state.addToCart)
  const [isLoading, setIsLoading] = useState(true)

  // Simulate loading state
  if (isLoading) {
    setTimeout(() => setIsLoading(false), 1500)
  }

  const handleAddToCart = (product: Product) => {
    addToCart(product, 1)
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  }

  return (
    <section id="products" className="py-20 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            <span className="text-foreground">OUR POWER</span>
            <span className="text-accent"> BANKS</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Power for every need. Quality you can trust.
          </p>
        </motion.div>

        {/* Products Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          {isLoading ? (
            <>
              {[...Array(4)].map((_, idx) => (
                <ProductCardSkeleton key={idx} />
              ))}
            </>
          ) : (
            PRODUCTS.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onAddToCart={handleAddToCart}
              />
            ))
          )}
        </motion.div>

        {/* Trust Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-20 pt-20 border-t border-border"
        >
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-accent/10 rounded-full mb-4">
                <svg className="w-8 h-8 text-accent" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9 11.674V20h2V11.674h2l-3-4-3 4h2z M10.5 4a1.5 1.5 0 100-3 1.5 1.5 0 000 3z" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-foreground mb-2">Genuine Products</h3>
              <p className="text-muted-foreground text-sm">100% authentic powerbanks with warranty</p>
            </div>

            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-accent/10 rounded-full mb-4">
                <svg className="w-8 h-8 text-accent" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10.5 1.5H3a1.5 1.5 0 00-1.5 1.5v12a1.5 1.5 0 001.5 1.5h13a1.5 1.5 0 001.5-1.5V5a1.5 1.5 0 00-1.5-1.5h-5V1.5z M8 7.5h4v2H8v-2z" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-foreground mb-2">Fast Delivery</h3>
              <p className="text-muted-foreground text-sm">Quick nationwide delivery to your doorstep</p>
            </div>

            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-accent/10 rounded-full mb-4">
                <svg className="w-8 h-8 text-accent" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-foreground mb-2">Secure Payment</h3>
              <p className="text-muted-foreground text-sm">Safe and secure payment options available</p>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
