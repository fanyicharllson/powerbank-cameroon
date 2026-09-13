import bcrypt from 'bcryptjs'
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@stael/db'
import { createSessionToken, sessionCookieOptions } from '@/lib/session'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const email = String(body.email || '').trim().toLowerCase()
    const password = String(body.password || '')

    if (!email || !password) {
      return NextResponse.json({ error: { code: 'VALIDATION_ERROR', message: 'Email and password are required.' } }, { status: 422 })
    }

    const admin = await prisma.adminUser.findUnique({ where: { email } })
    if (!admin || !(await bcrypt.compare(password, admin.passwordHash))) {
      return NextResponse.json({ error: { code: 'INVALID_CREDENTIALS', message: 'Invalid email or password.' } }, { status: 401 })
    }

    await prisma.adminUser.update({ where: { id: admin.id }, data: { lastLoginAt: new Date() } })

    const token = createSessionToken({ adminId: admin.id, email: admin.email, name: admin.name })
    const response = NextResponse.json({
      admin: { id: admin.id, email: admin.email, name: admin.name },
    })
    response.cookies.set({ ...sessionCookieOptions(), value: token })
    return response
  } catch (error) {
    console.error('Admin login failed', error)
    return NextResponse.json({ error: { code: 'LOGIN_FAILED', message: 'Unable to sign in right now.' } }, { status: 500 })
  }
}
