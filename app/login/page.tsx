'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const { error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }

    router.refresh()
    router.push('/dashboard')
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <form onSubmit={handleLogin} className="w-full max-w-sm space-y-4 bg-white p-8 rounded-xl shadow">
        <h1 className="text-2xl font-bold text-center">Spaza Credit Ledger</h1>
        <p className="text-sm text-center text-slate-500">Demo accounts only</p>

        <input
          type="email"
          placeholder="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          className="w-full border rounded-lg px-3 py-2"
          required
        />
        <input
          type="password"
          placeholder="password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          className="w-full border rounded-lg px-3 py-2"
          required
        />

        {error && <p className="text-red-600 text-sm">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-emerald-600 text-white py-2 rounded-lg font-medium disabled:opacity-50"
        >
          {loading ? 'Signing in…' : 'Sign in'}
        </button>

        <div className="text-xs text-slate-500 space-y-1 pt-4 border-t">
          <p>owner@spaza-ledger.demo / demo1234</p>
          <p>staff@spaza-ledger.demo / demo1234</p>
          <p>customer@spaza-ledger.demo / demo1234</p>
        </div>
      </form>
    </main>
  )
}
