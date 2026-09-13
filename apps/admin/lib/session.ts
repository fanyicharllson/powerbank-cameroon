import { createHmac, timingSafeEqual } from 'node:crypto'

const COOKIE_NAME = 'admin_session'
const MAX_AGE_SECONDS = 60 * 60 * 12

export type AdminSession = {
  adminId: string
  email: string
  name: string
  exp: number
}

function getSecret() {
  const secret = process.env.ADMIN_SESSION_SECRET
  if (secret && secret.length >= 16) return secret
  if (process.env.NODE_ENV !== 'production') {
    return 'dev-only-admin-session-secret-change-me'
  }
  throw new Error('ADMIN_SESSION_SECRET must be set to a long random string.')
}

function sign(payload: string) {
  return createHmac('sha256', getSecret()).update(payload).digest('base64url')
}

export function createSessionToken(session: Omit<AdminSession, 'exp'>, maxAge = MAX_AGE_SECONDS) {
  const full: AdminSession = { ...session, exp: Math.floor(Date.now() / 1000) + maxAge }
  const payload = Buffer.from(JSON.stringify(full)).toString('base64url')
  return `${payload}.${sign(payload)}`
}

export function verifySessionToken(token: string | undefined | null): AdminSession | null {
  if (!token) return null
  const [payload, signature] = token.split('.')
  if (!payload || !signature) return null
  const expected = sign(payload)
  const left = Buffer.from(signature)
  const right = Buffer.from(expected)
  if (left.length !== right.length || !timingSafeEqual(left, right)) return null
  try {
    const session = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8')) as AdminSession
    if (!session.adminId || !session.email || !session.exp) return null
    if (session.exp < Math.floor(Date.now() / 1000)) return null
    return session
  } catch {
    return null
  }
}

export function sessionCookieOptions(maxAge = MAX_AGE_SECONDS) {
  return {
    name: COOKIE_NAME,
    httpOnly: true,
    sameSite: 'lax' as const,
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge,
  }
}

export { COOKIE_NAME, MAX_AGE_SECONDS }
