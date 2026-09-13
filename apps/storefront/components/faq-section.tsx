'use client'

import { useState } from 'react'
import { ChevronDown } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

const FAQs = [
  {
    question: 'Are your powerbanks genuine?',
    answer: 'Yes! All our powerbanks are 100% genuine and come with official warranty from manufacturers. We only source from authorized distributors.',
  },
  {
    question: 'How long is the delivery?',
    answer: 'We offer nationwide delivery across Cameroon. Delivery typically takes 1-3 business days depending on your location. Urban areas get faster delivery.',
  },
  {
    question: 'Do you offer warranty?',
    answer: 'Absolutely! All products come with manufacturer warranty. We also provide excellent after-sales support and handle warranty claims.',
  },
  {
    question: 'Can I pay on delivery?',
    answer: 'Yes! We offer multiple payment options: MTN Mobile Money, Orange Money, and Cash on Delivery. Choose what works best for you.',
  },
  {
    question: 'How can I track my order?',
    answer: 'After placing your order, we&apos;ll send you WhatsApp updates with tracking information and delivery details. You can reach us 24/7 for updates.',
  },
  {
    question: 'What if I want to return a product?',
    answer: 'We have a 7-day return policy for defective products. If you receive a faulty item, contact us immediately and we&apos;ll arrange replacement or refund.',
  },
]

export default function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  return (
    <section id="faq" className="py-20 bg-card">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl font-bold mb-4">
            <span className="text-foreground">Frequently Asked</span>
            <span className="text-accent"> Questions</span>
          </h2>
          <p className="text-muted-foreground">
            Have questions? We&apos;ve got answers. Can&apos;t find what you&apos;re looking for? Contact us on WhatsApp.
          </p>
        </motion.div>

        {/* FAQ Items */}
        <div className="space-y-3">
          {FAQs.map((faq, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.05 }}
            >
              <button
                onClick={() => setOpenIndex(openIndex === idx ? null : idx)}
                className="w-full text-left p-6 bg-background border border-border rounded-lg hover:border-accent/50 transition-all"
              >
                <div className="flex items-start justify-between gap-4">
                  <h3 className="font-semibold text-foreground text-lg">{faq.question}</h3>
                  <motion.div
                    animate={{ rotate: openIndex === idx ? 180 : 0 }}
                    transition={{ duration: 0.3 }}
                    className="flex-shrink-0 mt-1"
                  >
                    <ChevronDown className="w-5 h-5 text-accent" />
                  </motion.div>
                </div>

                <AnimatePresence>
                  {openIndex === idx && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.3 }}
                      className="mt-4 pt-4 border-t border-border/50"
                    >
                      <p className="text-muted-foreground leading-relaxed">{faq.answer}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </button>
            </motion.div>
          ))}
        </div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-12 p-8 bg-background border border-border rounded-2xl text-center"
        >
          <h3 className="text-xl font-bold text-foreground mb-3">Still have questions?</h3>
          <p className="text-muted-foreground mb-6">
            Our customer support team is ready to help you 24/7 via WhatsApp.
          </p>
          <a
            href="https://wa.me/237123456789"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-6 py-3 bg-accent text-accent-foreground rounded-lg font-semibold hover:bg-accent/90 transition-colors"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.67-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.076 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421-7.403h-.004a9.87 9.87 0 00-4.255.949c-1.238.503-2.39 1.214-3.422 2.048-1.031.834-1.97 1.857-2.782 3.05C1.704 10.97 1.035 12.1.702 13.313c-.333 1.213-.326 2.38.006 3.529.332 1.15.926 2.291 1.775 3.286a9.723 9.723 0 001.602 1.378c.484.299.992.574 1.502.805.51.232 1.02 1.075 1.513 1.645.494.57.96 1.179 1.387 1.822.427.643.806 1.318 1.122 2.007.316.69.558 1.405.722 2.127.164.722.145 1.455-.061 2.179-.206.724-.593 1.426-1.155 2.087-.561.66-1.302 1.264-2.21 1.797-.908.533-1.983.996-3.21 1.377" />
            </svg>
            Chat with Us on WhatsApp
          </a>
        </motion.div>
      </div>
    </section>
  )
}
