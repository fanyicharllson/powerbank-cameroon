import { NextResponse } from 'next/server'
import { getAdminSessionFromCookies, unauthorized } from '@/lib/auth'

export async function GET() {
  const session = await getAdminSessionFromCookies()
  if (!session) return unauthorized()
  return NextResponse.json({
    admin: { id: session.adminId, email: session.email, name: session.name },
  })
}
