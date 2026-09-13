import { Suspense } from 'react'
import LoginPage from './login-form'

export default function Page() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center text-sm text-slate-500">Loading...</div>}>
      <LoginPage />
    </Suspense>
  )
}
