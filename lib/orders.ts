export const INSTALLMENT_MARKUP_BPS = {
  2: 200,
  3: 400,
  4: 600,
  6: 900,
} as const

export type InstallmentMonths = keyof typeof INSTALLMENT_MARKUP_BPS
export type CheckoutPaymentMethod = 'mtn' | 'orange' | 'cod'

export interface CreateOrderRequest {
  idempotencyKey: string
  customer: {
    fullName: string
    phone: string
  }
  delivery: {
    region: string
    city: string
    quarter: string
    address: string
    landmark?: string
  }
  paymentMethod: CheckoutPaymentMethod
  installmentMonths: InstallmentMonths
  items: Array<{
    productId: string
    quantity: number
  }>
}

export interface OrderConfirmation {
  orderNumber: string
  status: 'PENDING_PAYMENT'
  createdAt: string
  customer: {
    fullName: string
    phone: string
  }
  delivery: {
    region: string
    city: string
    quarter: string
    address: string
    landmark: string | null
  }
  paymentMethod: CheckoutPaymentMethod
  installmentMonths: number
  subtotal: number
  markupAmount: number
  installmentTotal: number
  monthlyPayment: number
  firstPayment: number
  amountPaid: number
  items: Array<{
    productId: string
    name: string
    capacity: string
    image: string
    unitPrice: number
    quantity: number
    lineTotal: number
  }>
  installments: Array<{
    number: number
    amount: number
    dueDate: string
    status: 'PENDING'
  }>
}

export interface CreateOrderResponse {
  order: OrderConfirmation
  idempotent: boolean
}

export interface OrderApiError {
  error: {
    code: string
    message: string
    requestId?: string
    fieldErrors?: Record<string, string>
  }
}

type ValidationResult =
  | { success: true; data: CreateOrderRequest }
  | { success: false; fieldErrors: Record<string, string> }

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function cleanString(value: unknown, maxLength: number) {
  if (typeof value !== 'string') return null
  const cleaned = value.trim()
  if (!cleaned || cleaned.length > maxLength) return null
  return cleaned
}

export function validateCreateOrderRequest(input: unknown): ValidationResult {
  const errors: Record<string, string> = {}
  if (!isRecord(input)) return { success: false, fieldErrors: { body: 'Request body must be an object.' } }

  const idempotencyKey = cleanString(input.idempotencyKey, 100)
  if (!idempotencyKey || !/^[A-Za-z0-9_-]{16,100}$/.test(idempotencyKey)) {
    errors.idempotencyKey = 'A valid idempotency key is required.'
  }

  const customer = isRecord(input.customer) ? input.customer : {}
  const fullName = cleanString(customer.fullName, 100)
  const phone = cleanString(customer.phone, 20)
  if (!fullName || fullName.length < 2) errors['customer.fullName'] = 'Enter a valid full name.'
  if (!phone || !/^\+237\d{9}$/.test(phone.replace(/[\s-]/g, ''))) {
    errors['customer.phone'] = 'Enter a valid Cameroon phone number.'
  }

  const delivery = isRecord(input.delivery) ? input.delivery : {}
  const region = cleanString(delivery.region, 80)
  const city = cleanString(delivery.city, 80)
  const quarter = cleanString(delivery.quarter, 100)
  const address = cleanString(delivery.address, 250)
  const landmarkValue = delivery.landmark === undefined || delivery.landmark === '' ? undefined : cleanString(delivery.landmark, 150)
  if (!region) errors['delivery.region'] = 'Region is required.'
  if (!city) errors['delivery.city'] = 'City is required.'
  if (!quarter) errors['delivery.quarter'] = 'Quarter is required.'
  if (!address) errors['delivery.address'] = 'Delivery address is required.'
  if (delivery.landmark && !landmarkValue) errors['delivery.landmark'] = 'Landmark is too long.'

  const paymentMethod = input.paymentMethod
  if (!['mtn', 'orange', 'cod'].includes(String(paymentMethod))) {
    errors.paymentMethod = 'Choose a supported payment method.'
  }

  const installmentMonths = Number(input.installmentMonths)
  if (![2, 3, 4, 6].includes(installmentMonths)) {
    errors.installmentMonths = 'Choose a valid installment plan.'
  }

  const rawItems = Array.isArray(input.items) ? input.items : []
  if (rawItems.length < 1 || rawItems.length > 20) errors.items = 'Order must contain between 1 and 20 items.'
  const seenProductIds = new Set<string>()
  const items: CreateOrderRequest['items'] = []
  rawItems.forEach((rawItem, index) => {
    if (!isRecord(rawItem)) {
      errors[`items.${index}`] = 'Invalid order item.'
      return
    }
    const productId = cleanString(rawItem.productId, 100)
    const quantity = Number(rawItem.quantity)
    if (!productId || !/^[A-Za-z0-9_-]+$/.test(productId)) errors[`items.${index}.productId`] = 'Invalid product.'
    if (!Number.isInteger(quantity) || quantity < 1 || quantity > 10) errors[`items.${index}.quantity`] = 'Quantity must be between 1 and 10.'
    if (productId && seenProductIds.has(productId)) errors[`items.${index}.productId`] = 'Duplicate products are not allowed.'
    if (productId) seenProductIds.add(productId)
    if (productId && Number.isInteger(quantity)) items.push({ productId, quantity })
  })

  if (Object.keys(errors).length > 0) return { success: false, fieldErrors: errors }

  return {
    success: true,
    data: {
      idempotencyKey: idempotencyKey!,
      customer: { fullName: fullName!, phone: phone!.replace(/[\s-]/g, '') },
      delivery: { region: region!, city: city!, quarter: quarter!, address: address!, landmark: landmarkValue ?? undefined },
      paymentMethod: paymentMethod as CheckoutPaymentMethod,
      installmentMonths: installmentMonths as InstallmentMonths,
      items,
    },
  }
}
