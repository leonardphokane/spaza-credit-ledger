// app/customer/page.tsx
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { SignOutButton } from '@/components/SignOutButton'

export default async function CustomerPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: customer } = await supabase
    .from('customers')
    .select('id, name, balance')
    .eq('auth_user_id', user.id)
    .single()

  if (!customer) {
    return (
      <main className="max-w-lg mx-auto p-6">
        <p>No customer record linked to this account.</p>
        <SignOutButton />
      </main>
    )
  }

  const { data: entries } = await supabase
    .from('ledger_entries')
    .select('amount, type, note, created_at')
    .eq('customer_id', customer.id)
    .order('created_at', { ascending: false })
    .limit(30)

  return (
    <main className="max-w-lg mx-auto p-6 space-y-6">
      <header className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">My boek</h1>
          <p className="text-slate-500">{customer.name}</p>
        </div>
        <SignOutButton />
      </header>

      <div className="bg-white border rounded-xl p-6 text-center shadow-sm">
        <p className="text-sm text-slate-500 mb-1">Current balance</p>
        <p
          className={`text-4xl font-bold font-mono ${
            Number(customer.balance) > 0 ? 'text-red-600' : 'text-emerald-600'
          }`}
        >
          R {Number(customer.balance).toFixed(2)}
        </p>
        <p className="text-xs text-slate-400 mt-2">
          {Number(customer.balance) > 0 ? 'You still owe the shop' : 'All settled'}
        </p>
      </div>

      <section>
        <h2 className="font-semibold mb-3">Recent activity</h2>
        <ul className="space-y-3 text-sm">
          {(entries ?? []).map((e, i) => (
            <li key={i} className="flex justify-between border-b pb-2">
              <div>
                <span className="capitalize font-medium">{e.type}</span>
                {e.note && <span className="text-slate-500"> – {e.note}</span>}
                <div className="text-xs text-slate-400">
                  {new Date(e.created_at).toLocaleDateString('en-ZA', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                  })}
                </div>
              </div>
              <span
                className={`font-mono ${
                  e.amount > 0 ? 'text-red-600' : 'text-emerald-600'
                }`}
              >
                {e.amount > 0 ? '+' : ''}
                {Number(e.amount).toFixed(2)}
              </span>
            </li>
          ))}
        </ul>
      </section>
    </main>
  )
}