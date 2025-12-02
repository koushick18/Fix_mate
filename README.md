# FixMate - Property Maintenance System

FixMate is a comprehensive React-based web application designed to streamline property maintenance requests. It facilitates communication between Residents, Technicians, and Administrators.

## 🚀 Features

- **Role-Based Access Control**: Resident, Technician, Admin.
- **Hybrid Database**: Automatically switches between Real Cloud DB (Supabase) and Local Demo DB.
- **Messaging System**: Built-in chat functionality.
- **Gemini AI Integration**: Generates executive summaries of maintenance workloads.

## 🗄️ Database Setup (Supabase)

If you want to use the Live Database features, run this script in your Supabase SQL Editor.

```sql
-- RESET (Be careful, deletes existing data)
drop table if exists public.messages;
drop table if exists public.issues;
drop table if exists public.profiles;

-- 1. Create Profiles Table (Removed strict FK to allow Ghost Users for Demo)
create table public.profiles (
  id uuid not null primary key, -- No longer references auth.users strictly
  email text,
  name text,
  role text,
  avatar text
);

-- 2. Create Issues Table
create table public.issues (
  id uuid default gen_random_uuid() primary key,
  resident_id uuid references public.profiles(id),
  resident_name text, category text, description text, photo_url text,
  status text, priority text, assigned_to uuid references public.profiles(id),
  assigned_to_name text, resolution_notes text,
  created_at timestamptz default now(), updated_at timestamptz default now()
);

-- 3. Create Messages Table
create table public.messages (
  id uuid default gen_random_uuid() primary key,
  sender_id uuid references public.profiles(id),
  sender_name text, sender_role text, receiver_id text, 
  text text, timestamp bigint, created_at timestamptz default now()
);

-- 4. Enable Public Access
alter table public.profiles enable row level security;
alter table public.issues enable row level security;
alter table public.messages enable row level security;

create policy "Public Access Profiles" on public.profiles for all using (true) with check (true);
create policy "Public Access Issues" on public.issues for all using (true) with check (true);
create policy "Public Access Messages" on public.messages for all using (true) with check (true);
```

## 🔑 Environment Variables

Configure these in Vercel:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_API_KEY=your_google_gemini_api_key
```
