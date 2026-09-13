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

function toBase64Url(bytes: ArrayBuffer | Uint8Array) {
  const view = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes)
  let binary = ''
  for (let i = 0; i < view.length; i += 1) binary += String.fromCharCode(view[i]!)
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '')
}

function fromBase64Url(value: string) {
  const padded = value.replace(/-/g, '+').replace(/_/g, '/')
  const pad = padded.length % 4 === 0 ? '' : '='.repeat(4 - (padded.length % 4))
  const binary = atob(padded + pad)
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i += 1) bytes[i] = binary.charCodeAt(i)
  return bytes
}

async function getKey() {
  return crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(getSecret()),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign', 'verify'],
  )
}

async function sign(payload: string) {
  const signature = await crypto.subtle.sign('HMAC', await getKey(), new TextEncoder().encode(payload))
  return toBase64Url(signature)
}

function timingSafeEqual(a: string, b: string) {
  if (a.length !== b.length) return false
  let mismatch = 0
  for (let i = 0; i < a.length; i += 1) mismatch |= a.charCodeAt(i) ^ b.charCodeAt(i)
  return mismatch === 0
}

export async function createSessionToken(session: Omit<AdminSession, 'exp'>, maxAge = MAX_AGE_SECONDS) {
  const full: AdminSession = { ...session, exp: Math.floor(Date.now() / 1000) + maxAge }
  const payload = toBase64Url(new TextEncoder().encode(JSON.stringify(full)))
  return `${payload}.${await sign(payload)}`
}

export async function verifySessionToken(token: string | undefined | null): Promise<AdminSession | null> {
  if (!token) return null
  const [payload, signature] = token.split('.')
  if (!payload || !signature) return null

  const expected = await sign(payload)
  if (!timingSafeEqual(signature, expected)) return null

  try {
    const session = JSON.parse(new TextDecoder().decode(fromBase64Url(payload))) as AdminSession
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
