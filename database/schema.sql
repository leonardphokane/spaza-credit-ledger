-- database/schema.sql
-- Spaza Credit Ledger – clean schema for Samsung Innovation Internship
-- Roles: owner, cashier, customer

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ============================================================
-- PROFILES (extends auth.users)
-- ============================================================
create table public.profiles (
  id          uuid primary key references auth.users on delete cascade,
  email       text,
  full_name   text not null,
  role        text not null check (role in ('owner', 'cashier', 'customer')),
  created_at  timestamptz not null default now()
);

-- ============================================================
-- CUSTOMERS (people who buy on credit)
-- ============================================================
create table public.customers (
  id            uuid primary key default uuid_generate_v4(),
  name          text not null,
  phone         text,
  balance       numeric(12,2) not null default 0,
  auth_user_id  uuid references auth.users,   -- link for customer login
  created_at    timestamptz not null default now()
);

-- ============================================================
-- LEDGER ENTRIES (the actual "boek")
-- ============================================================
create table public.ledger_entries (
  id           uuid primary key default uuid_generate_v4(),
  customer_id  uuid not null references public.customers on delete restrict,
  amount       numeric(12,2) not null,          -- + = sale (credit), - = payment
  type         text not null check (type in ('sale', 'payment', 'adjustment')),
  note         text,
  created_by   uuid references public.profiles,
  created_at   timestamptz not null default now()
);

-- ============================================================
-- INDEXES
-- ============================================================
create index idx_ledger_customer on public.ledger_entries(customer_id);
create index idx_ledger_created  on public.ledger_entries(created_at desc);
create index idx_customers_auth  on public.customers(auth_user_id);

-- ============================================================
-- AUTO-CREATE PROFILE ON SIGN-UP
-- ============================================================
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name, role)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    coalesce(new.raw_user_meta_data->>'role', 'customer')
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ============================================================
-- OPTIONAL: keep balance in sync with a trigger
-- ============================================================
create or replace function public.update_customer_balance()
returns trigger
language plpgsql
security definer
as $$
begin
  update public.customers
  set balance = balance + new.amount
  where id = new.customer_id;
  return new;
end;
$$;

create trigger trg_update_balance
  after insert on public.ledger_entries
  for each row execute procedure public.update_customer_balance();

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================
alter table public.profiles enable row level security;
alter table public.customers enable row level security;
alter table public.ledger_entries enable row level security;

-- Profiles: users can read their own row; owners can read all
create policy "Users can view own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Owners can view all profiles"
  on public.profiles for select
  using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role = 'owner'
    )
  );

-- Customers: owner + cashier can do everything; customer can only see self
create policy "Staff can manage customers"
  on public.customers for all
  using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role in ('owner', 'cashier')
    )
  );

create policy "Customers can view own record"
  on public.customers for select
  using (auth_user_id = auth.uid());

-- Ledger: staff can insert + read all; customers can only read their own entries
create policy "Staff can manage ledger"
  on public.ledger_entries for all
  using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role in ('owner', 'cashier')
    )
  );

create policy "Customers can view own ledger"
  on public.ledger_entries for select
  using (
    customer_id in (
      select id from public.customers where auth_user_id = auth.uid()
    )
  );