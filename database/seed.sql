-- database/seed.sql
-- Run AFTER creating the three auth users in Supabase Auth dashboard
-- (or via Admin API) with password: demo1234
-- Then replace the three UUIDs below with the real auth.users ids.

-- Example (replace these):
-- owner   →  a1b2c3d4-...
-- cashier →  e5f6g7h8-...
-- customer→  i9j0k1l2-...

do $$
declare
  owner_id    uuid := '00000000-0000-0000-0000-000000000001'; -- ← REPLACE
  cashier_id  uuid := '00000000-0000-0000-0000-000000000002'; -- ← REPLACE
  customer_id uuid := '00000000-0000-0000-0000-000000000003'; -- ← REPLACE
begin
  -- Profiles are created by the trigger, but we force the correct roles
  update public.profiles set role = 'owner',   full_name = 'Thabo Owner'    where id = owner_id;
  update public.profiles set role = 'cashier', full_name = 'Lerato Cashier' where id = cashier_id;
  update public.profiles set role = 'customer',full_name = 'Sipho Customer' where id = customer_id;

  -- Demo customers
  insert into public.customers (id, name, phone, balance, auth_user_id) values
    ('11111111-1111-1111-1111-111111111111', 'Nomsa Mokoena',  '0820000001', 0, null),
    ('22222222-2222-2222-2222-222222222222', 'Bongani Dlamini','0820000002', 0, null),
    ('33333333-3333-3333-3333-333333333333', 'Sipho Customer', '0820000003', 0, customer_id);

  -- Sample ledger (trigger will update balances)
  insert into public.ledger_entries (customer_id, amount, type, note, created_by) values
    ('11111111-1111-1111-1111-111111111111', 120.00, 'sale',     'Bread + milk + airtime', cashier_id),
    ('11111111-1111-1111-1111-111111111111',  25.50, 'sale',     'Cold drink',             cashier_id),
    ('11111111-1111-1111-1111-111111111111', -50.00, 'payment',  'Partial cash',           owner_id),
    ('33333333-3333-3333-3333-333333333333',  89.00, 'sale',     'Groceries',              cashier_id),
    ('22222222-2222-2222-2222-222222222222',  45.00, 'sale',     'Paraffin',               cashier_id),
    ('22222222-2222-2222-2222-222222222222', -45.00, 'payment',  'Full settlement',        cashier_id);
end $$;