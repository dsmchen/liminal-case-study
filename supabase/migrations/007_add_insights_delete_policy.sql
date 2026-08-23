-- Add DELETE policy for insights table (needed for regenerate)
GRANT DELETE ON public.insights TO authenticated;

create policy "Staff can delete insights"
  on insights for delete
  to authenticated
  using (true);
