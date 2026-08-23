create table students (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  active boolean default true,
  created_at timestamptz default now()
);

GRANT USAGE ON SCHEMA public TO anon;
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT SELECT ON public.students TO anon;
GRANT SELECT, INSERT, UPDATE ON public.students TO authenticated;

alter table students enable row level security;

create policy "Staff can view all students"
  on students for select
  to authenticated
  using (true);

create policy "Staff can insert students"
  on students for insert
  to authenticated
  with check (true);

create policy "Staff can update students"
  on students for update
  to authenticated
  using (true);
