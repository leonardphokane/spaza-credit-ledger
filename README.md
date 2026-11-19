# Spaza Credit Ledger

Digital “boek” tracker for informal spaza-shop credit.

Built for the **Samsung Innovation Internship 2027 – Route A**.

## Problem
Township spaza shops still track customer credit in paper notebooks.  
The notebook gets lost, is hard to audit, and the customer has no visibility of their balance.

## Solution
A simple web app with three roles:

| Role     | Can do                                      |
|----------|---------------------------------------------|
| Owner    | Full access, view all balances & history    |
| Cashier  | Record credit sales and payments            |
| Customer | View own balance and transaction history    |

## Tech Stack
- Next.js 15 (App Router)
- Tailwind CSS
- Supabase (Auth + PostgreSQL + Row Level Security)

## Demo Accounts (synthetic data only)
| Email                        | Password  | Role     |
|------------------------------|-----------|----------|
| owner@spaza-ledger.demo      | demo1234  | owner    |
| staff@spaza-ledger.demo      | demo1234  | cashier  |
| customer@spaza-ledger.demo   | demo1234  | customer  |

## Key Design Decisions (whiteboard talking points)

1. **Immutable ledger**  
   We never edit past entries. Every sale or payment is a new row.  
   This mirrors real bookkeeping and makes audits trivial.

2. **Denormalised balance + trigger**  
   `customers.balance` is kept in sync by a database trigger.  
   Fast UI reads, single source of truth remains the ledger.

3. **Defence in depth**  
   - Middleware protects routes by role  
   - Row Level Security protects data even if the UI is bypassed

4. **Zero real personal data**  
   All seed data is synthetic.

## Local Setup
```bash
npm install
cp .env.example .env.local   # fill in your Supabase keys
# Run the SQL in database/schema.sql in the Supabase SQL editor
# Create the three demo users in Supabase Auth, then run database/seed.sql
npm run dev