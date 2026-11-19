'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

type Customer = { id: string; name: string; balance: number }

export function CreditSaleForm({ customers }: { customers: Customer[] }) {
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

    const saleAmount = Math.abs(Number(amount)) // always positive

    const { error } = await supabase.from('ledger_entries').insert({
      customer_id: customerId,
      amount: saleAmount,
      type: 'sale',
      note: note || 'Credit sale',
    })

    if (error) {
      setMessage(error.message)
      setLoading(false)
      return
    }

    // Balance is updated by the DB trigger
    setMessage('Sale recorded on credit')
    setAmount('')
    setNote('')
    setLoading(false)
    router.refresh()
  }

  return (
    <form onSubmit={handleSubmit} className="border rounded-xl p-5 space-y-3 bg-white shadow-sm">
      <h3 className="font-semibold">Record credit sale</h3>

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
        placeholder="Sale amount (R)"
        value={amount}
        onChange={e => setAmount(e.target.value)}
        className="w-full border rounded-lg px-3 py-2"
        required
      />

      <input
        type="text"
        placeholder="Note (e.g. Bread + milk)"
        value={note}
        onChange={e => setNote(e.target.value)}
        className="w-full border rounded-lg px-3 py-2"
      />

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-amber-600 text-white py-2 rounded-lg disabled:opacity-50"
      >
        {loading ? 'Saving…' : 'Record sale'}
      </button>

      {message && <p className="text-sm text-emerald-700">{message}</p>}
    </form>
  )
}