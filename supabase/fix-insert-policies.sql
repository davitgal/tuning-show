-- FIX: allow form submissions from a logged-in admin session too (role public),
-- not just anonymous. Run this whole block in Supabase → SQL Editor → Run.

do $$
declare t text;
begin
  foreach t in array array['participant_requests','visitor_requests','partner_requests']
  loop
    execute format('drop policy if exists anon_insert on %I;', t);
    execute format('create policy anon_insert on %I for insert to public with check (true);', t);
  end loop;
end $$;

drop policy if exists ts_storage_anon_upload on storage.objects;
create policy ts_storage_anon_upload on storage.objects
  for insert to public
  with check (bucket_id in ('participant-photos', 'partner-decks'));
