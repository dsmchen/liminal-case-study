-- Add UPDATE policy for entries table (missing from initial migration)
create policy "Staff can update entries"
  on entries for update
  to authenticated
  using (true)
  with check (true);
