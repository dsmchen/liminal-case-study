create table insights (
  id uuid primary key default gen_random_uuid(),
  student_id uuid references students(id) on delete cascade not null,
  pattern_description text not null,
  recommendations text[] not null,
  supporting_entry_ids uuid[] not null,
  generated_at timestamptz default now()
);

GRANT SELECT, INSERT ON public.insights TO authenticated;

alter table insights enable row level security;

create policy "Staff can view all insights"
  on insights for select
  to authenticated
  using (true);

create policy "Staff can insert insights"
  on insights for insert
  to authenticated
  with check (true);
