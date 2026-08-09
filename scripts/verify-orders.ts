import 'dotenv/config'
import assert from 'node:assert/strict'
import { randomUUID } from 'node:crypto'
import { NextRequest } from 'next/server'
import { GET as LIST_ORDERS, POST } from '../app/api/orders/route'
import { GET as GET_ORDER } from '../app/api/orders/[orderNumber]/route'
import { prisma } from '../lib/prisma'
import { validateCreateOrderRequest } from '../lib/orders'

const testPrefix = `verify-${randomUUID()}`

function orderRequest(body?: string, cookie?: string) {
  return new NextRequest('http://localhost/api/orders', {
    method: body === undefined ? 'GET' : 'POST',
    body,
    headers: {
      ...(body === undefined ? {} : { 'Content-Type': 'application/json' }),
      ...(cookie ? { Cookie: cookie } : {}),
    },
  })
}

async function main() {
  const productIds = ['pb-mini-10k', 'pb-pro-20k', 'pb-ultra-30k', 'pb-laptop-65w']
  const catalogCount = await prisma.product.count({ where: { id: { in: productIds }, isActive: true } })
  assert.equal(catalogCount, productIds.length, 'The authoritative product catalog is incomplete.')

  const invalid = validateCreateOrderRequest({})
  assert.equal(invalid.success, false, 'Invalid requests must fail validation.')

  const malformedResponse = await POST(orderRequest('{'))
  assert.equal(malformedResponse.status, 400, 'Malformed JSON must return 400.')

  const payload = {
    idempotencyKey: testPrefix,
    customer: { fullName: 'API Verification', phone: '+237650000000' },
    delivery: {
      region: 'Centre Region',
      city: 'Yaoundé',
      quarter: 'Bastos',
      address: 'Verification address',
    },
    paymentMethod: 'mtn',
    installmentMonths: 2,
    items: [{ productId: 'pb-pro-20k', quantity: 1 }],
  }

  const createdResponse = await POST(orderRequest(JSON.stringify(payload)))
  assert.equal(createdResponse.status, 201, 'A valid order must return 201.')
  const created = await createdResponse.json()
  assert.equal(created.order.installmentTotal, 25_500, 'The server must calculate authoritative totals.')
  assert.equal(created.order.installments.length, 2, 'The server must create the complete payment schedule.')
  const setCookie = createdResponse.headers.get('set-cookie')
  const accessCookie = setCookie?.match(/order_access=[^;]+/)?.[0]
  assert.ok(accessCookie, 'Order creation must issue a private HttpOnly access cookie.')
  assert.match(setCookie!, /HttpOnly/i)
  assert.match(setCookie!, /SameSite=lax/i)

  const retryResponse = await POST(orderRequest(JSON.stringify(payload), accessCookie))
  assert.equal(retryResponse.status, 200, 'An idempotent retry must return the existing order.')
  const retried = await retryResponse.json()
  assert.equal(retried.order.orderNumber, created.order.orderNumber, 'A retry must not create a duplicate order.')
  assert.equal(retried.idempotent, true)

  const listResponse = await LIST_ORDERS(orderRequest(undefined, accessCookie))
  assert.equal(listResponse.status, 200)
  const list = await listResponse.json()
  assert.equal(list.summary.total, 1, 'The owning device must see its order.')
  assert.equal(list.orders[0].orderNumber, created.order.orderNumber)

  const detailResponse = await GET_ORDER(
    new NextRequest(`http://localhost/api/orders/${created.order.orderNumber}`, { headers: { Cookie: accessCookie! } }),
    { params: Promise.resolve({ orderNumber: created.order.orderNumber }) },
  )
  assert.equal(detailResponse.status, 200, 'The owning device must see order details.')

  const foreignListResponse = await LIST_ORDERS(orderRequest())
  const foreignList = await foreignListResponse.json()
  assert.equal(foreignList.summary.total, 0, 'A different device must not see private orders.')

  const foreignDetailResponse = await GET_ORDER(
    new NextRequest(`http://localhost/api/orders/${created.order.orderNumber}`),
    { params: Promise.resolve({ orderNumber: created.order.orderNumber }) },
  )
  assert.equal(foreignDetailResponse.status, 404, 'A different device must not access order details.')

  const unavailableResponse = await POST(orderRequest(JSON.stringify({
    ...payload,
    idempotencyKey: `${testPrefix}-missing`,
    items: [{ productId: 'missing-product', quantity: 1 }],
  })))
  assert.equal(unavailableResponse.status, 409, 'Unavailable products must return 409.')

  const persistedCount = await prisma.order.count({ where: { idempotencyKey: testPrefix } })
  assert.equal(persistedCount, 1, 'Only one order may exist for an idempotency key.')
  const ownerCount = await prisma.orderOwner.count({
    where: { orders: { some: { idempotencyKey: testPrefix } } },
  })
  assert.equal(ownerCount, 1, 'Idempotent retries must not create duplicate owners.')

  console.log('Order API verification passed.')
}

main()
  .finally(async () => {
    const testOrders = await prisma.order.findMany({
      where: { idempotencyKey: { startsWith: testPrefix } },
      select: { ownerId: true },
    })
    await prisma.order.deleteMany({ where: { idempotencyKey: { startsWith: testPrefix } } })
    await prisma.orderOwner.deleteMany({
      where: { id: { in: testOrders.flatMap((order) => order.ownerId ? [order.ownerId] : []) } },
    })
    await prisma.$disconnect()
  })
  .catch((error) => {
    console.error(error)
    process.exitCode = 1
  })
