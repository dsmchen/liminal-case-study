create type staff_role as enum ('lead_teacher', 'teaching_assistant', 'specialist');

create table staff (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade unique not null,
  name text not null,
  role staff_role not null,
  created_at timestamptz default now()
);

GRANT USAGE ON SCHEMA public TO authenticated;
GRANT SELECT, INSERT, UPDATE ON public.staff TO authenticated;

alter table staff enable row level security;

create policy "Staff can view all staff records"
  on staff for select
  to authenticated
  using (true);

create policy "Staff can update own record"
  on staff for update
  to authenticated
  using (auth.uid() = user_id);
