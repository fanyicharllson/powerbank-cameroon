'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { FormEvent, useState } from 'react'
import { LockKeyhole, Zap } from 'lucide-react'
import { toast } from 'sonner'
import { api } from '@/lib/utils'

export default function LoginPage() {
  const router = useRouter()
  const search = useSearchParams()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  async function onSubmit(event: FormEvent) {
    event.preventDefault()
    setLoading(true)
    try {
      await api.post('/auth/login', { email, password })
      toast.success('Welcome back')
      router.replace(search.get('next') || '/')
      router.refresh()
    } catch {
      toast.error('Invalid email or password')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_top_left,#d1fae5,transparent_40%),radial-gradient(circle_at_bottom_right,#e2e8f0,transparent_35%),#f8fafc] px-4">
      <form onSubmit={onSubmit} className="w-full max-w-md rounded-[28px] border border-slate-200 bg-white p-8 shadow-[0_30px_80px_rgba(15,23,42,0.08)]">
        <div className="mb-8 flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-700 text-white">
            <Zap className="h-6 w-6 fill-current" />
          </div>
          <div>
            <p className="text-lg font-black text-slate-950">Admin Dashboard</p>
            <p className="text-xs text-slate-500">Powerbank Cameroon</p>
          </div>
        </div>

        <label className="mb-4 block">
          <span className="mb-2 block text-xs font-black uppercase tracking-wide text-slate-600">Email</span>
          <input
            type="email"
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className="w-full rounded-2xl border border-slate-200 px-4 py-3.5 text-sm outline-none focus:border-emerald-600 focus:ring-4 focus:ring-emerald-600/10"
            placeholder="admin@powerbankcameroon.com"
          />
        </label>

        <label className="mb-6 block">
          <span className="mb-2 block text-xs font-black uppercase tracking-wide text-slate-600">Password</span>
          <input
            type="password"
            required
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className="w-full rounded-2xl border border-slate-200 px-4 py-3.5 text-sm outline-none focus:border-emerald-600 focus:ring-4 focus:ring-emerald-600/10"
            placeholder="••••••••"
          />
        </label>

        <button
          type="submit"
          disabled={loading}
          className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-slate-950 px-5 py-3.5 text-sm font-black text-white disabled:opacity-60"
        >
          <LockKeyhole className="h-4 w-4" />
          {loading ? 'Signing in...' : 'Sign in securely'}
        </button>
      </form>
    </main>
  )
}
