'use client'

import Link from 'next/link'
import { Zap, Phone, MessageCircle, Mail } from 'lucide-react'
import { motion } from 'framer-motion'

export default function Footer() {
  return (
    <footer className="bg-green-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 py-12">
          {/* Brand Column */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <div className="flex items-center gap-2 mb-4">
              <Zap className="w-6 h-6 text-yellow-400 fill-yellow-400" />
              <div>
                <p className="font-bold text-white">POWERBANK</p>
                <p className="text-xs text-yellow-400">CAMEROON</p>
              </div>
            </div>
            <p className="text-sm text-gray-300">Never Run Out Of Power.</p>
          </motion.div>

          {/* Quick Links */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
          >
            <h4 className="font-semibold text-white mb-4">QUICK LINKS</h4>
            <ul className="space-y-2">
              <li><Link href="/" className="text-sm text-gray-300 hover:text-yellow-400 transition-colors">Home</Link></li>
              <li><Link href="/products" className="text-sm text-gray-300 hover:text-yellow-400 transition-colors">Products</Link></li>
              <li><Link href="/contact" className="text-sm text-gray-300 hover:text-yellow-400 transition-colors">Contact</Link></li>
            </ul>
          </motion.div>

          {/* Contact */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
          >
            <h4 className="font-semibold text-white mb-4">CONTACT US</h4>
            <ul className="space-y-3">
              <li className="flex items-center gap-2 text-sm text-gray-300">
                <Phone className="w-4 h-4" />
                <a href="tel:+237678123456" className="hover:text-yellow-400 transition-colors">+237 6 78 123 456</a>
              </li>
              <li className="flex items-center gap-2 text-sm text-gray-300">
                <MessageCircle className="w-4 h-4" />
                <a href="https://wa.me/237678123456" target="_blank" rel="noopener noreferrer" className="hover:text-yellow-400 transition-colors">+237 6 78 123 456</a>
              </li>
              <li className="flex items-center gap-2 text-sm text-gray-300">
                <Mail className="w-4 h-4" />
                <a href="mailto:support@powerbankcarameroon.com" className="hover:text-yellow-400 transition-colors">support@powerbankcameroon.com</a>
              </li>
            </ul>
          </motion.div>

          {/* Follow Us & Delivery */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
          >
            <h4 className="font-semibold text-white mb-4">FOLLOW US</h4>
            <div className="flex gap-4 mb-6">
              <a href="#" className="text-gray-300 hover:text-yellow-400 transition-colors text-sm">Facebook</a>
              <a href="#" className="text-gray-300 hover:text-yellow-400 transition-colors text-sm">TikTok</a>
              <a href="#" className="text-gray-300 hover:text-yellow-400 transition-colors text-sm">Instagram</a>
            </div>
            <h4 className="font-semibold text-white mb-2">DELIVERY AREAS</h4>
            <p className="text-sm text-gray-300">
              Yaoundé • Douala • Bafoussam<br />
              Garoua • Buea • Limbe<br />
              And all across Cameroon
            </p>
          </motion.div>
        </div>

        {/* Divider */}
        <div className="border-t border-green-800 py-6 text-center text-sm text-gray-400">
          <p>&copy; 2026 Powerbank Cameroon. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}
