import { create } from 'zustand'

export interface Product {
  id: string
  name: string
  capacity: string
  capacity_mah: number
  charging_speed: string
  features: string[]
  price: number
  image: string
  badge?: string
}

export interface CartItem {
  product: Product
  quantity: number
}

export interface OrderData {
  fullName: string
  phone: string
  region: string
  city: string
  quarter: string
  address: string
  landmark?: string
  paymentMethod: 'mtn' | 'orange' | 'cod'
}

interface CartStore {
  cart: CartItem[]
  orderData: OrderData | null
  addToCart: (product: Product, quantity: number) => void
  updateCartQuantity: (productId: string, quantity: number) => void
  removeFromCart: (productId: string) => void
  clearCart: () => void
  setOrderData: (data: OrderData) => void
  getCartTotal: () => number
  getCartCount: () => number
}

export const useCartStore = create<CartStore>((set, get) => ({
  cart: [],
  orderData: null,
  
  addToCart: (product, quantity) => set((state) => {
    const existingItem = state.cart.find(item => item.product.id === product.id)
    if (existingItem) {
      return {
        cart: state.cart.map(item =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        ),
      }
    }
    return { cart: [...state.cart, { product, quantity }] }
  }),

  updateCartQuantity: (productId, quantity) => set((state) => ({
    cart: state.cart.map(item =>
      item.product.id === productId
        ? { ...item, quantity: Math.max(1, quantity) }
        : item
    ),
  })),

  removeFromCart: (productId) => set((state) => ({
    cart: state.cart.filter(item => item.product.id !== productId),
  })),

  clearCart: () => set({ cart: [], orderData: null }),

  setOrderData: (data) => set({ orderData: data }),

  getCartTotal: () => {
    const state = get()
    return state.cart.reduce((total, item) => total + (item.product.price * item.quantity), 0)
  },

  getCartCount: () => {
    const state = get()
    return state.cart.reduce((count, item) => count + item.quantity, 0)
  },
}))
