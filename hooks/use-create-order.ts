'use client'

import axios from 'axios'
import { useMutation } from '@tanstack/react-query'
import { api } from '@/lib/axios'
import type { CreateOrderRequest, CreateOrderResponse, OrderApiError } from '@/lib/orders'

export function useCreateOrder() {
  return useMutation({
    mutationKey: ['create-installment-order'],
    mutationFn: async (order: CreateOrderRequest) => {
      const response = await api.post<CreateOrderResponse>('/orders', order)
      return response.data
    },
  })
}

export function getOrderError(error: unknown) {
  if (axios.isAxiosError<OrderApiError>(error)) {
    return {
      message: error.response?.data?.error.message || 'We could not reach the server. Check your connection and try again.',
      fieldErrors: error.response?.data?.error.fieldErrors,
      requestId: error.response?.data?.error.requestId,
    }
  }

  return {
    message: 'Something unexpected happened. Please try again.',
    fieldErrors: undefined,
    requestId: undefined,
  }
}
