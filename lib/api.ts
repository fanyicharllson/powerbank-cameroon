import { CartItem, OrderData } from './store'

export interface OrderResponse {
  success: boolean
  orderId: string
  message?: string
  error?: string
}

// Generate unique order ID
export function generateOrderId(): string {
  const prefix = 'PB'
  const timestamp = Date.now().toString().slice(-6)
  const random = Math.floor(Math.random() * 10000).toString().padStart(5, '0')
  return `${prefix}-${timestamp}${random}`.slice(0, 10)
}

// Format WhatsApp message
export function formatWhatsAppMessage(
  orderId: string,
  orderData: OrderData,
  cartItems: CartItem[],
  total: number
): string {
  let message = `*🛒 NEW ORDER - STAEL SHOP*\n\n`
  message += `*Order ID:* ${orderId}\n`
  message += `*Date:* ${new Date().toLocaleDateString('en-GB')}\n\n`

  message += `*📦 PRODUCTS:*\n`
  cartItems.forEach((item) => {
    message += `• ${item.product.name} x${item.quantity} = ${(item.product.price * item.quantity).toLocaleString()} FCFA\n`
  })

  message += `\n*💰 ORDER SUMMARY:*\n`
  message += `Subtotal: ${cartItems.reduce((sum, item) => sum + (item.product.price * item.quantity), 0).toLocaleString()} FCFA\n`
  message += `Delivery: 2,000 FCFA\n`
  message += `*Total: ${total.toLocaleString()} FCFA*\n\n`

  message += `*👤 CUSTOMER INFO:*\n`
  message += `Name: ${orderData.fullName}\n`
  message += `Phone: ${orderData.phone}\n\n`

  message += `*📍 DELIVERY INFO:*\n`
  message += `Region: ${orderData.region}\n`
  message += `City: ${orderData.city}\n`
  message += `Quarter: ${orderData.quarter}\n`
  message += `Address: ${orderData.address}\n`
  if (orderData.landmark) {
    message += `Landmark: ${orderData.landmark}\n`
  }

  message += `\n*💳 PAYMENT METHOD:*\n`
  const paymentMethods: Record<string, string> = {
    'mtn': 'MTN Mobile Money',
    'orange': 'Orange Money',
    'cod': 'Cash on Delivery',
  }
  message += `${paymentMethods[orderData.paymentMethod]}\n\n`

  message += `*STATUS:* Order Received\n`
  message += `We will contact the customer shortly to confirm delivery details.`

  return message
}

// Send WhatsApp notification
export async function sendWhatsAppNotification(
  message: string,
  phoneNumber: string
): Promise<OrderResponse> {
  // For demo purposes, we're using a WhatsApp URL that opens the chat
  // In production, you would use WhatsApp Business API or a service like Twilio
  
  // Format: https://wa.me/{phoneNumber}?text={message}
  const encodedMessage = encodeURIComponent(message)
  const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodedMessage}`
  
  // Store order in localStorage for demo
  const order = {
    timestamp: new Date().toISOString(),
    message,
    phoneNumber,
    url: whatsappUrl,
  }
  
  const orders = JSON.parse(localStorage.getItem('stael_orders') || '[]')
  orders.push(order)
  localStorage.setItem('stael_orders', JSON.stringify(orders))

  return {
    success: true,
    orderId: generateOrderId(),
    message: 'Order received! Redirecting to WhatsApp...',
  }
}

// Get recent orders (for demo)
export function getRecentOrders() {
  if (typeof window === 'undefined') return []
  return JSON.parse(localStorage.getItem('stael_orders') || '[]')
}
