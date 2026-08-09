'use client'

import axios from 'axios'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { api } from '@/lib/axios'
import type { CreateOrderRequest, CreateOrderResponse, OrderApiError } from '@/lib/orders'
import { orderQueryKeys } from '@/hooks/use-orders'

export function useCreateOrder() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationKey: ['create-installment-order'],
    mutationFn: async (order: CreateOrderRequest) => {
      const response = await api.post<CreateOrderResponse>('/orders', order)
      return response.data
    },
    onSuccess: (data) => {
      void queryClient.invalidateQueries({ queryKey: orderQueryKeys.all })
      toast.success(`Order ${data.order.orderNumber} saved successfully.`)
    },
    onError: (error) => {
      toast.error(getOrderError(error).message)
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
