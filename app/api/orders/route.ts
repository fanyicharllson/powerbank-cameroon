import { randomUUID } from 'node:crypto'
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import {
  createOrderAccessToken,
  getOrderAccessToken,
  hashOrderAccessToken,
  setOrderAccessCookie,
} from '@/lib/order-access'
import {
  INSTALLMENT_MARKUP_BPS,
  type CheckoutPaymentMethod,
  type CreateOrderResponse,
  type InstallmentMonths,
  type OrderApiError,
  type OrderListResponse,
  type TrackedOrderStatus,
  validateCreateOrderRequest,
} from '@/lib/orders'
import { getOrderOwner } from '@/lib/order-access'

const MAX_BODY_BYTES = 32_000

const paymentMethodMap = {
  mtn: 'MTN_MOMO',
  orange: 'ORANGE_MONEY',
  cod: 'CASH',
} as const

const reversePaymentMethodMap: Record<string, CheckoutPaymentMethod> = {
  MTN_MOMO: 'mtn',
  ORANGE_MONEY: 'orange',
  CASH: 'cod',
}

const orderInclude = {
  items: { orderBy: { id: 'asc' as const } },
  installments: { orderBy: { installmentNumber: 'asc' as const } },
}

async function getOrderByIdempotencyKey(idempotencyKey: string) {
  return prisma.order.findUnique({ where: { idempotencyKey }, include: orderInclude })
}

type PersistedOrder = NonNullable<Awaited<ReturnType<typeof getOrderByIdempotencyKey>>>

function createOrderNumber() {
  const date = new Date().toISOString().slice(0, 10).replaceAll('-', '')
  return `PBC-${date}-${randomUUID().slice(0, 8).toUpperCase()}`
}

function addMonths(date: Date, months: number) {
  const next = new Date(date)
  next.setUTCMonth(next.getUTCMonth() + months)
  return next
}

function serializeOrder(order: PersistedOrder, idempotent: boolean): CreateOrderResponse {
  return {
    idempotent,
    order: {
      orderNumber: order.orderNumber,
      status: order.status as TrackedOrderStatus,
      createdAt: order.createdAt.toISOString(),
      customer: { fullName: order.fullName, phone: order.phone },
      delivery: {
        region: order.region,
        city: order.city,
        quarter: order.quarter,
        address: order.address,
        landmark: order.landmark,
      },
      paymentMethod: reversePaymentMethodMap[order.paymentMethod],
      installmentMonths: order.installmentMonths,
      subtotal: order.subtotal,
      markupAmount: order.installmentTotal - order.subtotal,
      installmentTotal: order.installmentTotal,
      monthlyPayment: order.monthlyPayment,
      firstPayment: order.firstPayment,
      amountPaid: order.amountPaid,
      items: order.items.map((item) => ({
        productId: item.productId,
        name: item.productName,
        capacity: item.productCapacity,
        image: item.productImage,
        unitPrice: item.unitPrice,
        quantity: item.quantity,
        lineTotal: item.lineTotal,
      })),
      installments: order.installments.map((installment) => ({
        number: installment.installmentNumber,
        amount: installment.amount,
        dueDate: installment.dueDate.toISOString(),
        status: 'PENDING',
      })),
    },
  }
}

function errorResponse(status: number, code: string, message: string, requestId: string, fieldErrors?: Record<string, string>) {
  return NextResponse.json<OrderApiError>(
    { error: { code, message, requestId, ...(fieldErrors ? { fieldErrors } : {}) } },
    { status, headers: { 'X-Request-Id': requestId } },
  )
}

export async function POST(request: NextRequest) {
  const requestId = randomUUID()
  const contentLength = Number(request.headers.get('content-length') || 0)
  if (contentLength > MAX_BODY_BYTES) {
    return errorResponse(413, 'PAYLOAD_TOO_LARGE', 'Order request is too large.', requestId)
  }

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return errorResponse(400, 'INVALID_JSON', 'Request body must contain valid JSON.', requestId)
  }

  const validation = validateCreateOrderRequest(body)
  if (!validation.success) {
    return errorResponse(422, 'VALIDATION_ERROR', 'Please correct the highlighted order details.', requestId, validation.fieldErrors)
  }

  const input = validation.data

  try {
    const existingOrder = await getOrderByIdempotencyKey(input.idempotencyKey)
    if (existingOrder) {
      const response = NextResponse.json(serializeOrder(existingOrder, true), {
        status: 200,
        headers: { 'X-Request-Id': requestId },
      })
      const existingToken = getOrderAccessToken(request)
      if (existingToken && existingOrder.ownerId) {
        const owner = await prisma.orderOwner.findUnique({ where: { tokenHash: hashOrderAccessToken(existingToken) } })
        if (owner?.id === existingOrder.ownerId) setOrderAccessCookie(response, existingToken)
      }
      return response
    }

    const requestedIds = input.items.map((item) => item.productId)
    const products = await prisma.product.findMany({
      where: { id: { in: requestedIds }, isActive: true },
    })
    const productMap = new Map(products.map((product) => [product.id, product]))
    const unavailableIds = requestedIds.filter((id) => !productMap.has(id))
    if (unavailableIds.length > 0) {
      return errorResponse(
        409,
        'PRODUCT_UNAVAILABLE',
        'One or more selected products are no longer available.',
        requestId,
        { items: `Unavailable products: ${unavailableIds.join(', ')}` },
      )
    }

    const subtotal = input.items.reduce((sum, item) => sum + productMap.get(item.productId)!.price * item.quantity, 0)
    const markupBps = INSTALLMENT_MARKUP_BPS[input.installmentMonths as InstallmentMonths]
    const installmentTotal = Math.round(subtotal * (1 + markupBps / 10_000))
    const monthlyPayment = Math.ceil(installmentTotal / input.installmentMonths)
    const now = new Date()
    const schedule = Array.from({ length: input.installmentMonths }, (_, index) => ({
      installmentNumber: index + 1,
      amount: index === input.installmentMonths - 1
        ? installmentTotal - monthlyPayment * (input.installmentMonths - 1)
        : monthlyPayment,
      dueDate: addMonths(now, index),
    }))
    const accessToken = getOrderAccessToken(request) || createOrderAccessToken()
    const accessTokenHash = hashOrderAccessToken(accessToken)

    const order = await prisma.$transaction(async (transaction) => {
      const owner = await transaction.orderOwner.upsert({
        where: { tokenHash: accessTokenHash },
        update: { lastSeenAt: now },
        create: { tokenHash: accessTokenHash, lastSeenAt: now },
      })
      return transaction.order.create({
        data: {
          orderNumber: createOrderNumber(),
          idempotencyKey: input.idempotencyKey,
          fullName: input.customer.fullName,
          phone: input.customer.phone,
          region: input.delivery.region,
          city: input.delivery.city,
          quarter: input.delivery.quarter,
          address: input.delivery.address,
          landmark: input.delivery.landmark || null,
          paymentMethod: paymentMethodMap[input.paymentMethod],
          subtotal,
          markupBps,
          installmentMonths: input.installmentMonths,
          monthlyPayment,
          installmentTotal,
          firstPayment: schedule[0].amount,
          ownerId: owner.id,
          items: {
            create: input.items.map((item) => {
              const product = productMap.get(item.productId)!
              return {
                productId: product.id,
                productName: product.name,
                productCapacity: product.capacity,
                productImage: product.image,
                unitPrice: product.price,
                quantity: item.quantity,
                lineTotal: product.price * item.quantity,
              }
            }),
          },
          installments: { create: schedule },
        },
        include: orderInclude,
      })
    })

    // TODO(payment): initiate the selected Mobile Money charge after the order is safely persisted.
    const response = NextResponse.json(serializeOrder(order, false), {
      status: 201,
      headers: { 'X-Request-Id': requestId },
    })
    setOrderAccessCookie(response, accessToken)
    return response
  } catch (error) {
    const isUniqueConflict = typeof error === 'object' && error !== null && 'code' in error && error.code === 'P2002'
    if (isUniqueConflict) {
      const existingOrder = await getOrderByIdempotencyKey(input.idempotencyKey)
      if (existingOrder) {
        const response = NextResponse.json(serializeOrder(existingOrder, true), {
          status: 200,
          headers: { 'X-Request-Id': requestId },
        })
        const existingToken = getOrderAccessToken(request)
        if (existingToken && existingOrder.ownerId) {
          const owner = await prisma.orderOwner.findUnique({ where: { tokenHash: hashOrderAccessToken(existingToken) } })
          if (owner?.id === existingOrder.ownerId) setOrderAccessCookie(response, existingToken)
        }
        return response
      }
    }

    console.error('Failed to create installment order', { requestId, error })
    return errorResponse(500, 'ORDER_CREATION_FAILED', 'We could not save your order. Please try again.', requestId)
  }
}

export async function GET(request: NextRequest) {
  const requestId = randomUUID()

  try {
    const owner = await getOrderOwner(request)
    if (!owner) {
      return NextResponse.json<OrderListResponse>({
        summary: { total: 0, awaitingPayment: 0, inProgress: 0, completed: 0 },
        orders: [],
      })
    }

    const [orders, total, awaitingPayment, inProgress, completed] = await prisma.$transaction([
      prisma.order.findMany({
        where: { ownerId: owner.id },
        orderBy: { createdAt: 'desc' },
        take: 50,
        include: {
          items: { orderBy: { id: 'asc' } },
          installments: { orderBy: { installmentNumber: 'asc' } },
        },
      }),
      prisma.order.count({ where: { ownerId: owner.id } }),
      prisma.order.count({ where: { ownerId: owner.id, status: 'PENDING_PAYMENT' } }),
      prisma.order.count({ where: { ownerId: owner.id, status: 'PAYMENT_IN_PROGRESS' } }),
      prisma.order.count({ where: { ownerId: owner.id, status: { in: ['PAID', 'FULFILLED'] } } }),
      prisma.orderOwner.update({ where: { id: owner.id }, data: { lastSeenAt: new Date() } }),
    ])

    const response: OrderListResponse = {
      summary: {
        total,
        awaitingPayment,
        inProgress,
        completed,
      },
      orders: orders.map((order) => {
        const paidInstallments = order.installments.filter((item) => item.status === 'PAID').length
        const nextPayment = order.installments.find((item) => item.status === 'PENDING')
        return {
          orderNumber: order.orderNumber,
          status: order.status as TrackedOrderStatus,
          createdAt: order.createdAt.toISOString(),
          paymentMethod: reversePaymentMethodMap[order.paymentMethod],
          installmentMonths: order.installmentMonths,
          installmentTotal: order.installmentTotal,
          amountPaid: order.amountPaid,
          paidInstallments,
          totalInstallments: order.installments.length,
          nextPayment: nextPayment ? {
            number: nextPayment.installmentNumber,
            amount: nextPayment.amount,
            dueDate: nextPayment.dueDate.toISOString(),
          } : null,
          items: order.items.map((item) => ({
            productId: item.productId,
            name: item.productName,
            capacity: item.productCapacity,
            image: item.productImage,
            quantity: item.quantity,
          })),
        }
      }),
    }

    return NextResponse.json(response, { headers: { 'X-Request-Id': requestId } })
  } catch (error) {
    console.error('Failed to list device orders', { requestId, error })
    return errorResponse(500, 'ORDER_LIST_FAILED', 'We could not load your orders. Please try again.', requestId)
  }
}
