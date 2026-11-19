// components/SettlementForm.tsx
'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

type Customer = { id: string; name: string; balance: number }

export function SettlementForm({ customers }: { customers: Customer[] }) {
  const [customerId, setCustomerId] = useState('')
  const [amount, setAmount] = useState('')
  const [note, setNote] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const router = useRouter()
  const supabase = createClient()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!customerId || !amount) return

    setLoading(true)
    setMessage(null)

    const paymentAmount = -Math.abs(Number(amount)) // always negative for payment

    // 1. Insert ledger entry
    const { error: entryError } = await supabase.from('ledger_entries').insert({
      customer_id: customerId,
      amount: paymentAmount,
      type: 'payment',
      note: note || 'Cash settlement',
    })

    if (entryError) {
      setMessage(entryError.message)
      setLoading(false)
      return
    }

    // 2. Update customer balance (or do this with a DB trigger – preferred)
    const customer = customers.find(c => c.id === customerId)
    if (customer) {
      await supabase
        .from('customers')
        .update({ balance: customer.balance + paymentAmount })
        .eq('id', customerId)
    }

    setMessage('Payment recorded')
    setAmount('')
    setNote('')
    setLoading(false)
    router.refresh() // revalidate server components
  }

  return (
    <form onSubmit={handleSubmit} className="border rounded-xl p-5 space-y-3 bg-white shadow-sm">
      <h3 className="font-semibold">Record payment / settlement</h3>

      <select
        value={customerId}
        onChange={e => setCustomerId(e.target.value)}
        className="w-full border rounded-lg px-3 py-2"
        required
      >
        <option value="">Select customer</option>
        {customers.map(c => (
          <option key={c.id} value={c.id}>
            {c.name} (R{Number(c.balance).toFixed(2)})
          </option>
        ))}
      </select>

      <input
        type="number"
        step="0.01"
        min="0.01"
        placeholder="Amount paid (R)"
        value={amount}
        onChange={e => setAmount(e.target.value)}
        className="w-full border rounded-lg px-3 py-2"
        required
      />

      <input
        type="text"
        placeholder="Note (optional)"
        value={note}
        onChange={e => setNote(e.target.value)}
        className="w-full border rounded-lg px-3 py-2"
      />

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-emerald-600 text-white py-2 rounded-lg disabled:opacity-50"
      >
        {loading ? 'Saving…' : 'Record payment'}
      </button>

      {message && <p className="text-sm text-emerald-700">{message}</p>}
    </form>
  )
}