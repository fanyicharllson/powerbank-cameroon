import { NextResponse } from 'next/server'
import { COOKIE_NAME, sessionCookieOptions } from '@/lib/session'

export async function POST() {
  const response = NextResponse.json({ ok: true })
  response.cookies.set({ ...sessionCookieOptions(0), name: COOKIE_NAME, value: '' })
  return response
}
