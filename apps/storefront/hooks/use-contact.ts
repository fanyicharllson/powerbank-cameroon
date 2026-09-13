'use client'

import { useMutation } from '@tanstack/react-query'
import { toast } from 'sonner'
import { api } from '@/lib/axios'

export interface ContactFormData {
  name: string
  email: string
  phone: string
  subject: string
  message: string
}

export function useContact() {
  return useMutation({
    mutationFn: (data: ContactFormData) => api.post('/contact', data),
    onSuccess: () => {
      toast.success("Message sent! We'll get back to you soon.")
    },
    onError: () => {
      toast.error('Something went wrong. Please try again.')
    },
  })
}
