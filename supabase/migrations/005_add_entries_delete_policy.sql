-- Add DELETE permission to entries table
GRANT DELETE ON public.entries TO authenticated;

-- Add DELETE policy for RLS
create policy "Staff can delete entries"
  on entries for delete
  to authenticated
  using (true);
