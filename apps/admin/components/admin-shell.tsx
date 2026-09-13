'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import {
  BarChart3,
  LayoutDashboard,
  LogOut,
  Menu,
  PackageSearch,
  Search,
  Settings,
  Users,
  X,
  Zap,
} from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { toast } from 'sonner'
import { api } from '@/lib/utils'

const nav = [
  { href: '/', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/orders', label: 'Orders & Invoices', icon: PackageSearch, badgeKey: 'awaitingPayment' as const },
  { href: '/customers', label: 'Customer Insights', icon: Users },
  { href: '/reports', label: 'Reports', icon: BarChart3 },
]

export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [collapsed, setCollapsed] = useState(false)

  const meQuery = useQuery({
    queryKey: ['admin-me'],
    queryFn: async () => (await api.get('/auth/me')).data.admin as { name: string; email: string },
  })

  const summaryQuery = useQuery({
    queryKey: ['dashboard-summary-badge'],
    queryFn: async () => (await api.get('/dashboard/summary?days=7')).data.summary as { awaitingPayment: number },
  })

  useEffect(() => {
    setOpen(false)
  }, [pathname])

  async function logout() {
    await api.post('/auth/logout')
    toast.success('Signed out')
    router.replace('/login')
    router.refresh()
  }

  const sidebar = (
    <aside
      className={`flex h-full flex-col border-r border-slate-200 bg-white ${collapsed ? 'w-[84px]' : 'w-[280px]'} transition-all`}
    >
      <div className="flex items-center gap-3 border-b border-slate-100 px-5 py-5">
        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-700 text-white">
          <Zap className="h-5 w-5 fill-current" />
        </div>
        {!collapsed && (
          <div className="min-w-0">
            <p className="truncate text-sm font-black text-slate-900">Powerbank Cameroon</p>
            <div className="mt-1 flex items-center gap-2">
              <span className="rounded-full bg-slate-900 px-2 py-0.5 text-[10px] font-bold text-white">Admin</span>
              <span className="text-[10px] font-semibold text-slate-400">Private</span>
            </div>
          </div>
        )}
      </div>

      {!collapsed && (
        <div className="px-5 py-4">
          <p className="text-sm font-black text-slate-900">
            Welcome Back, {meQuery.data?.name?.split(' ')[0] || 'Admin'}
          </p>
          <p className="mt-1 text-xs text-slate-500">Monitor orders and installments</p>
        </div>
      )}

      <div className="flex-1 overflow-y-auto px-3 pb-4">
        <p className={`mb-2 px-2 text-[10px] font-black uppercase tracking-wider text-slate-400 ${collapsed ? 'text-center' : ''}`}>
          Menu
        </p>
        <nav className="space-y-1">
          {nav.map((item) => {
            const Icon = item.icon
            const active = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href))
            const badge = item.badgeKey ? summaryQuery.data?.[item.badgeKey] : 0
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 rounded-2xl px-3 py-3 text-sm font-bold transition ${
                  active ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100'
                } ${collapsed ? 'justify-center' : ''}`}
              >
                <Icon className="h-4 w-4 shrink-0" />
                {!collapsed && <span className="flex-1">{item.label}</span>}
                {!collapsed && !!badge && (
                  <span className={`rounded-full px-2 py-0.5 text-[10px] ${active ? 'bg-orange-400 text-slate-950' : 'bg-orange-100 text-orange-700'}`}>
                    {badge}
                  </span>
                )}
              </Link>
            )
          })}
        </nav>

        <p className={`mb-2 mt-6 px-2 text-[10px] font-black uppercase tracking-wider text-slate-400 ${collapsed ? 'text-center' : ''}`}>
          Others
        </p>
        <button
          type="button"
          onClick={() => toast.message('Settings coming soon')}
          className={`flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-sm font-bold text-slate-600 hover:bg-slate-100 ${collapsed ? 'justify-center' : ''}`}
        >
          <Settings className="h-4 w-4" />
          {!collapsed && 'Settings'}
        </button>
        <button
          type="button"
          onClick={logout}
          className={`flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-sm font-bold text-red-600 hover:bg-red-50 ${collapsed ? 'justify-center' : ''}`}
        >
          <LogOut className="h-4 w-4" />
          {!collapsed && 'Logout'}
        </button>
      </div>

      {!collapsed && (
        <div className="m-3 rounded-2xl border border-slate-200 bg-slate-50 p-3">
          <p className="text-sm font-black text-slate-900">{meQuery.data?.name || 'Admin'}</p>
          <p className="truncate text-xs text-slate-500">{meQuery.data?.email || '...'}</p>
        </div>
      )}
    </aside>
  )

  return (
    <div className="min-h-screen bg-[#f4f6f8]">
      <div className="flex min-h-screen">
        <div className="hidden lg:block">{sidebar}</div>

        {open && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <button type="button" className="absolute inset-0 bg-slate-950/40" onClick={() => setOpen(false)} aria-label="Close menu" />
            <div className="absolute inset-y-0 left-0 shadow-2xl">{sidebar}</div>
          </div>
        )}

        <div className="flex min-w-0 flex-1 flex-col">
          <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/80 px-4 py-4 backdrop-blur sm:px-6">
            <div className="flex items-center gap-3">
              <button type="button" className="rounded-xl border border-slate-200 p-2 lg:hidden" onClick={() => setOpen(true)}>
                {open ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
              </button>
              <button type="button" className="hidden rounded-xl border border-slate-200 p-2 lg:inline-flex" onClick={() => setCollapsed((v) => !v)}>
                <Menu className="h-4 w-4" />
              </button>
              <div className="flex flex-1 items-center rounded-full border border-slate-200 bg-slate-50 px-4 py-2.5">
                <Search className="h-4 w-4 text-slate-400" />
                <input
                  className="ml-2 w-full bg-transparent text-sm outline-none placeholder:text-slate-400"
                  placeholder="Search orders, customers..."
                  onKeyDown={(event) => {
                    if (event.key === 'Enter') {
                      const value = (event.target as HTMLInputElement).value.trim()
                      router.push(value ? `/orders?q=${encodeURIComponent(value)}` : '/orders')
                    }
                  }}
                />
                <span className="hidden rounded-lg bg-white px-2 py-1 text-[10px] font-bold text-slate-400 sm:inline">⌘ S</span>
              </div>
            </div>
          </header>
          <main className="flex-1 p-4 sm:p-6 lg:p-8">{children}</main>
        </div>
      </div>
    </div>
  )
}
