import axios from 'axios'

export const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
})

export function formatMoney(value: number) {
  return `FCFA ${value.toLocaleString('en-US')}`
}

export const statusLabels: Record<string, { label: string; className: string }> = {
  PENDING_PAYMENT: { label: 'Pending', className: 'bg-sky-100 text-sky-700' },
  PAYMENT_IN_PROGRESS: { label: 'In progress', className: 'bg-amber-100 text-amber-700' },
  PAID: { label: 'Completed', className: 'bg-emerald-100 text-emerald-700' },
  FULFILLED: { label: 'Delivered', className: 'bg-green-100 text-green-700' },
  CANCELLED: { label: 'Cancelled', className: 'bg-orange-100 text-orange-700' },
}
