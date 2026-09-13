import { createHash, randomBytes } from 'node:crypto'
import type { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const ORDER_ACCESS_COOKIE = 'order_access'
const TOKEN_PATTERN = /^[A-Za-z0-9_-]{43}$/
const COOKIE_MAX_AGE = 60 * 60 * 24 * 365

export function createOrderAccessToken() {
  return randomBytes(32).toString('base64url')
}

export function hashOrderAccessToken(token: string) {
  return createHash('sha256').update(token).digest('hex')
}

export function getOrderAccessToken(request: NextRequest) {
  const token = request.cookies.get(ORDER_ACCESS_COOKIE)?.value
  return token && TOKEN_PATTERN.test(token) ? token : null
}

export async function getOrderOwner(request: NextRequest) {
  const token = getOrderAccessToken(request)
  if (!token) return null
  return prisma.orderOwner.findUnique({ where: { tokenHash: hashOrderAccessToken(token) } })
}

export function setOrderAccessCookie(response: NextResponse, token: string) {
  response.cookies.set({
    name: ORDER_ACCESS_COOKIE,
    value: token,
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: COOKIE_MAX_AGE,
  })
}
