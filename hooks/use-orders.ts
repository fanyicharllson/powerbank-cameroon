'use client'

import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/axios'
import type { OrderDetailResponse, OrderListResponse } from '@/lib/orders'

export const orderQueryKeys = {
  all: ['device-orders'] as const,
  detail: (orderNumber: string) => ['device-orders', orderNumber] as const,
}

export function useOrders() {
  return useQuery({
    queryKey: orderQueryKeys.all,
    queryFn: async () => {
      const response = await api.get<OrderListResponse>('/orders')
      return response.data
    },
    staleTime: 30_000,
    retry: 1,
  })
}

export function useOrderDetail(orderNumber: string) {
  return useQuery({
    queryKey: orderQueryKeys.detail(orderNumber),
    queryFn: async () => {
      const response = await api.get<OrderDetailResponse>(`/orders/${encodeURIComponent(orderNumber)}`)
      return response.data
    },
    enabled: Boolean(orderNumber),
    staleTime: 30_000,
    retry: 1,
  })
}
