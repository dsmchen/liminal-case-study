create table entries (
  id uuid primary key default gen_random_uuid(),
  student_id uuid references students(id) on delete cascade not null,
  staff_id uuid references staff(id) on delete cascade not null,
  antecedent text[] not null,
  behavior text[] not null,
  consequence text[] not null,
  location text not null,
  comments text,
  timestamp timestamptz default now(),
  created_at timestamptz default now()
);

GRANT SELECT, INSERT, UPDATE ON public.entries TO authenticated;

alter table entries enable row level security;

create policy "Staff can view all entries"
  on entries for select
  to authenticated
  using (true);

create policy "Staff can insert entries"
  on entries for insert
  to authenticated
  with check (true);
