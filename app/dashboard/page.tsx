'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function DashboardPage() {
  const [userEmail, setUserEmail] = useState<string | null>(null)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    async function checkUser() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
      } else {
        setUserEmail(user.email ?? 'User')
      }
    }
    checkUser()
  }, [router, supabase])

  async function handleSignOut() {
    await supabase.auth.signOut()
    router.push('/login')
  }

  return (
    <main className="min-h-screen bg-slate-100 p-8">
      <div className="max-w-4xl mx-auto bg-white rounded-xl shadow p-6 space-y-6">
        <div className="flex justify-between items-center border-b pb-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Spaza Credit Ledger (Matsale Book)</h1>
            <p className="text-sm text-slate-500">Logged in as: <span className="font-semibold text-slate-700">{userEmail}</span></p>
          </div>
          <button
            onClick={handleSignOut}
            className="bg-red-50 text-red-600 hover:bg-red-100 px-4 py-2 rounded-lg text-sm font-medium transition"
          >
            Sign Out
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-lg">
            <h3 className="font-semibold text-emerald-800">Total Credit Issued</h3>
            <p className="text-2xl font-bold text-emerald-900 mt-1">R 0.00</p>
          </div>
          <div className="p-4 bg-blue-50 border border-blue-100 rounded-lg">
            <h3 className="font-semibold text-blue-800">Active Customers</h3>
            <p className="text-2xl font-bold text-blue-900 mt-1">0</p>
          </div>
          <div className="p-4 bg-amber-50 border border-amber-100 rounded-lg">
            <h3 className="font-semibold text-amber-800">Pending Settlements</h3>
            <p className="text-2xl font-bold text-amber-900 mt-1">R 0.00</p>
          </div>
        </div>

        <div className="border-t pt-4">
          <h2 className="text-lg font-semibold text-slate-800 mb-2">Ledger Management</h2>
          <p className="text-sm text-slate-600">Ready to record customer credit entries and track spaza shop transactions.</p>
        </div>
      </div>
    </main>
  )
}
