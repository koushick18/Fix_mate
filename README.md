# FixMate - Property Maintenance System

FixMate is a comprehensive React-based web application designed to streamline property maintenance requests. It facilitates communication between Residents, Technicians, and Administrators.

## 🚀 Features

- **Role-Based Access Control**: Resident, Technician, Admin.
- **Real-Time Database**: Powered by Supabase (PostgreSQL).
- **Messaging System**: Built-in chat functionality.
- **Gemini AI Integration**: Generates executive summaries of maintenance workloads.
- **Responsive Design**: Mobile-friendly UI.

## 🛠 Tech Stack

- **Frontend**: React 18, TypeScript, Tailwind CSS (Vite)
- **Backend**: Supabase (Auth & Database)
- **AI**: Google Gemini API (@google/genai)
- **Visuals**: Lucide React, Recharts

## 🗄️ Database Setup (Supabase)

To run this app, you need a free [Supabase](https://supabase.com) project.

1.  **Create Project**: Create a new project on Supabase.
2.  **SQL Setup**: Go to the SQL Editor and run the following script:

```sql
-- Profiles
create table public.profiles (
  id uuid references auth.users on delete cascade not null primary key,
  email text, name text, role text, avatar text
);

-- Issues
create table public.issues (
  id uuid default gen_random_uuid() primary key,
  resident_id uuid references public.profiles(id),
  resident_name text, category text, description text, photo_url text,
  status text, priority text, assigned_to uuid references public.profiles(id),
  assigned_to_name text, resolution_notes text,
  created_at timestamptz default now(), updated_at timestamptz default now()
);

-- Messages
create table public.messages (
  id uuid default gen_random_uuid() primary key,
  sender_id uuid references public.profiles(id),
  sender_name text, sender_role text, receiver_id text, 
  text text, timestamp bigint, created_at timestamptz default now()
);

-- Public Access Policies (For Demo Purposes)
alter table public.profiles enable row level security;
alter table public.issues enable row level security;
alter table public.messages enable row level security;

create policy "Public Access Profiles" on public.profiles for all using (true) with check (true);
create policy "Public Access Issues" on public.issues for all using (true) with check (true);
create policy "Public Access Messages" on public.messages for all using (true) with check (true);
```

## 🔑 Environment Variables

Create a `.env` file locally or configure these in your hosting provider (Vercel/Netlify):

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_API_KEY=your_google_gemini_api_key
```

## 🏃‍♂️ How to Run Locally

1.  **Install Dependencies**:
    ```bash
    npm install
    ```
2.  **Start Dev Server**:
    ```bash
    npm run dev
    ```
3.  **Open App**: Visit `http://localhost:5173`

## ☁️ Deployment (Vercel)

1.  Push code to **GitHub**.
2.  Import project into **Vercel**.
3.  Add the **Environment Variables** listed above in Vercel Settings.
4.  Deploy!
