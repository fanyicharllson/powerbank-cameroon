'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { Zap, Truck, Shield, Headphones } from 'lucide-react'

export default function Hero() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.3,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.8 } },
  }

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-background via-background to-background/80">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
          className="absolute top-1/4 right-1/4 w-96 h-96 bg-accent/5 rounded-full blur-3xl"
        />
        <motion.div
          animate={{ rotate: -360 }}
          transition={{ duration: 25, repeat: Infinity, ease: 'linear' }}
          className="absolute bottom-1/4 left-1/4 w-96 h-96 bg-accent/5 rounded-full blur-3xl"
        />
      </div>

      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid lg:grid-cols-2 gap-12 items-center"
        >
          {/* Left Content */}
          <div>
            <motion.div variants={itemVariants} className="inline-block mb-6">
              <div className="px-4 py-2 bg-accent/10 border border-accent/30 rounded-full">
                <p className="text-sm font-semibold text-accent">Premium Quality Powerbanks</p>
              </div>
            </motion.div>

            <motion.h1
              variants={itemVariants}
              className="text-5xl md:text-7xl font-bold mb-6 leading-tight"
            >
              <span className="text-foreground">Never Run</span>
              <br />
              <span className="bg-gradient-to-r from-accent to-accent/60 bg-clip-text text-transparent">
                Out Of Power
              </span>
            </motion.h1>

            <motion.p
              variants={itemVariants}
              className="text-xl text-muted-foreground mb-8 max-w-md"
            >
              Reliable powerbanks with fast delivery. Available across Cameroon. Stay connected, stay powered.
            </motion.p>

            <motion.div
              variants={itemVariants}
              className="flex flex-col sm:flex-row gap-4"
            >
              <Link
                href="#products"
                className="px-8 py-4 bg-accent text-accent-foreground rounded-lg font-semibold hover:bg-accent/90 transition-all inline-flex items-center justify-center gap-2 group"
              >
                <Zap className="w-5 h-5 group-hover:rotate-12 transition-transform" />
                SHOP NOW
              </Link>
              <a
                href="https://wa.me/237123456789"
                target="_blank"
                rel="noopener noreferrer"
                className="px-8 py-4 bg-card border border-border rounded-lg font-semibold hover:border-accent transition-all inline-flex items-center justify-center gap-2 hover:text-accent"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.67-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.076 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421-7.403h-.004a9.87 9.87 0 00-4.255.949c-1.238.503-2.39 1.214-3.422 2.048-1.031.834-1.97 1.857-2.782 3.05C1.704 10.97 1.035 12.1.702 13.313c-.333 1.213-.326 2.38.006 3.529.332 1.15.926 2.291 1.775 3.286a9.723 9.723 0 001.602 1.378c.484.299.992.574 1.502.805.51.232 1.02 1.075 1.513 1.645.494.57.96 1.179 1.387 1.822.427.643.806 1.318 1.122 2.007.316.69.558 1.405.722 2.127.164.722.145 1.455-.061 2.179-.206.724-.593 1.426-1.155 2.087-.561.66-1.302 1.264-2.21 1.797-.908.533-1.983.996-3.21 1.377" />
                </svg>
                WHATSAPP US
              </a>
            </motion.div>
          </div>

          {/* Right - Product Showcase */}
          <motion.div
            variants={itemVariants}
            className="relative"
          >
            <div className="relative h-96 md:h-full flex items-center justify-center">
              {/* Placeholder for product image */}
              <motion.div
                animate={{ y: [0, -20, 0] }}
                transition={{ duration: 4, repeat: Infinity }}
                className="w-64 h-64 bg-gradient-to-br from-accent/20 to-background rounded-3xl border-2 border-accent/30 flex items-center justify-center"
              >
                <div className="text-center">
                  <Zap className="w-32 h-32 text-accent/50 mx-auto mb-4" />
                  <p className="text-muted-foreground">Premium Powerbanks</p>
                </div>
              </motion.div>

              {/* Floating Cards */}
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 30, repeat: Infinity, ease: 'linear' }}
                className="absolute w-full h-full"
              >
                {[
                  { label: '10,000mAh', top: '10%', left: '5%' },
                  { label: '20,000mAh', top: '70%', right: '10%' },
                  { label: '30,000mAh', top: '30%', right: '5%' },
                ].map((item, idx) => (
                  <motion.div
                    key={idx}
                    whileHover={{ scale: 1.1 }}
                    className={`absolute px-3 py-2 bg-card border border-border rounded-lg text-sm font-semibold text-foreground`}
                    style={{ top: item.top, left: item.left, right: item.right }}
                  >
                    {item.label}
                  </motion.div>
                ))}
              </motion.div>
            </div>
          </motion.div>
        </motion.div>

        {/* Features Row */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-20 pt-20 border-t border-border"
        >
          {[
            { icon: Shield, label: 'Genuine Products', desc: '100% authentic' },
            { icon: Truck, label: 'Fast Delivery', desc: 'Nationwide coverage' },
            { icon: Zap, label: 'Premium Quality', desc: 'Long lasting' },
            { icon: Headphones, label: 'Customer Support', desc: '24/7 help' },
          ].map((feature, idx) => (
            <motion.div key={idx} variants={itemVariants} className="text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-accent/10 rounded-lg mb-3 mx-auto">
                <feature.icon className="w-6 h-6 text-accent" />
              </div>
              <h3 className="font-semibold text-foreground mb-1">{feature.label}</h3>
              <p className="text-xs text-muted-foreground">{feature.desc}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
