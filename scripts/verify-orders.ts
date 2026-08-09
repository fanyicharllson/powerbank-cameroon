import 'dotenv/config'
import assert from 'node:assert/strict'
import { randomUUID } from 'node:crypto'
import { NextRequest } from 'next/server'
import { POST } from '../app/api/orders/route'
import { prisma } from '../lib/prisma'
import { validateCreateOrderRequest } from '../lib/orders'

const testPrefix = `verify-${randomUUID()}`

function orderRequest(body: string) {
  return new NextRequest('http://localhost/api/orders', {
    method: 'POST',
    body,
    headers: { 'Content-Type': 'application/json' },
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

  const retryResponse = await POST(orderRequest(JSON.stringify(payload)))
  assert.equal(retryResponse.status, 200, 'An idempotent retry must return the existing order.')
  const retried = await retryResponse.json()
  assert.equal(retried.order.orderNumber, created.order.orderNumber, 'A retry must not create a duplicate order.')
  assert.equal(retried.idempotent, true)

  const unavailableResponse = await POST(orderRequest(JSON.stringify({
    ...payload,
    idempotencyKey: `${testPrefix}-missing`,
    items: [{ productId: 'missing-product', quantity: 1 }],
  })))
  assert.equal(unavailableResponse.status, 409, 'Unavailable products must return 409.')

  const persistedCount = await prisma.order.count({ where: { idempotencyKey: testPrefix } })
  assert.equal(persistedCount, 1, 'Only one order may exist for an idempotency key.')

  console.log('Order API verification passed.')
}

main()
  .finally(async () => {
    await prisma.order.deleteMany({ where: { idempotencyKey: { startsWith: testPrefix } } })
    await prisma.$disconnect()
  })
  .catch((error) => {
    console.error(error)
    process.exitCode = 1
  })
