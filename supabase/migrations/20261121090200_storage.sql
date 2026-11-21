-- Gebeta — storage buckets and access rules
--
-- Two buckets with deliberately different exposure:
--
--   catalogue-images : curated illustrative photos for the public catalogue.
--                      Publicly readable, administrator writable.
--   food-uploads     : photos a user captures or submits. Private. Each user
--                      owns the folder named after their user id, and nothing
--                      is served through a public URL. Reading happens through
--                      a short-lived signed URL created for the owner, or for
--                      a reviewer who has been assigned that submission.
--
-- The policies below are created on storage.objects. If your role is not
-- permitted to do that, create the two buckets and the same rules from
-- Storage -> Policies in the dashboard instead; the conditions are unchanged.

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'catalogue-images',
  'catalogue-images',
  true,
  5242880,
  array['image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do nothing;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'food-uploads',
  'food-uploads',
  false,
  5242880,
  array['image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do nothing;

-- ---------------------------------------------------------------------------
-- catalogue-images
-- ---------------------------------------------------------------------------

drop policy if exists "catalogue images are public" on storage.objects;
create policy "catalogue images are public" on storage.objects
  for select to anon, authenticated
  using (bucket_id = 'catalogue-images');

drop policy if exists "catalogue images are admin writable" on storage.objects;
create policy "catalogue images are admin writable" on storage.objects
  for all to authenticated
  using (bucket_id = 'catalogue-images' and public.has_role('admin'))
  with check (bucket_id = 'catalogue-images' and public.has_role('admin'));

-- ---------------------------------------------------------------------------
-- food-uploads: path convention is {auth.uid()}/{uuid}.{ext}
-- ---------------------------------------------------------------------------

drop policy if exists "users read their own food uploads" on storage.objects;
create policy "users read their own food uploads" on storage.objects
  for select to authenticated
  using (
    bucket_id = 'food-uploads'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "users write their own food uploads" on storage.objects;
create policy "users write their own food uploads" on storage.objects
  for insert to authenticated
  with check (
    bucket_id = 'food-uploads'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "users update their own food uploads" on storage.objects;
create policy "users update their own food uploads" on storage.objects
  for update to authenticated
  using (
    bucket_id = 'food-uploads'
    and (storage.foldername(name))[1] = auth.uid()::text
  )
  with check (
    bucket_id = 'food-uploads'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "users delete their own food uploads" on storage.objects;
create policy "users delete their own food uploads" on storage.objects
  for delete to authenticated
  using (
    bucket_id = 'food-uploads'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- An institution reviewer can read an uploaded image only while it is
-- attached to a submission that was explicitly assigned to them.
drop policy if exists "assigned reviewers read submission images" on storage.objects;
create policy "assigned reviewers read submission images" on storage.objects
  for select to authenticated
  using (
    bucket_id = 'food-uploads'
    and exists (
      select 1
      from public.food_submissions s
      where s.image_path = storage.objects.name
        and public.is_assigned_reviewer(s.id)
    )
  );
