import { cookies } from 'next/headers'
import { NextRequest } from 'next/server'
import { COOKIE_NAME, verifySessionToken, type AdminSession } from '@/lib/session'

export async function getAdminSessionFromCookies(): Promise<AdminSession | null> {
  const jar = await cookies()
  return verifySessionToken(jar.get(COOKIE_NAME)?.value)
}

export function getAdminSessionFromRequest(request: NextRequest): AdminSession | null {
  return verifySessionToken(request.cookies.get(COOKIE_NAME)?.value)
}

export function unauthorized() {
  return Response.json({ error: { code: 'UNAUTHORIZED', message: 'Admin authentication required.' } }, { status: 401 })
}
