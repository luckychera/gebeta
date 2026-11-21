-- Gebeta — row level security
--
-- Every table created by 20261121090000_init_schema.sql has RLS enabled here
-- and is then opened only where a concrete rule allows it. There is no
-- USING (true) policy on private data anywhere in this file.
--
-- Reading the rules quickly:
--   * Private user data  -> owner only, matched on auth.uid().
--   * Public discovery   -> published catalogue and published menus only.
--   * Provider authority -> membership in provider_members, never a claim
--                           sent by the client.
--   * Institution access -> per-submission assignment, never global.
--   * Administration     -> the 'admin' row in user_roles, which users
--                           cannot grant to themselves.

alter table public.profiles                 enable row level security;
alter table public.user_roles               enable row level security;
alter table public.user_preferences         enable row level security;
alter table public.food_items               enable row level security;
alter table public.food_nutrition           enable row level security;
alter table public.diary_entries            enable row level security;
alter table public.providers                enable row level security;
alter table public.provider_members         enable row level security;
alter table public.provider_menu_items      enable row level security;
alter table public.food_submissions         enable row level security;
alter table public.review_assignments       enable row level security;
alter table public.food_reviews             enable row level security;
alter table public.audit_events             enable row level security;
alter table public.ai_recognition_requests  enable row level security;

-- Supabase grants table privileges to anon and authenticated by default, but
-- a policy is only reachable once the role also holds the SQL privilege. The
-- grants are therefore stated explicitly rather than assumed, and kept as
-- narrow as the policies below.
grant select on
  public.food_items,
  public.food_nutrition,
  public.providers,
  public.provider_menu_items
  to anon, authenticated;

grant select, insert, update, delete on
  public.profiles,
  public.user_roles,
  public.user_preferences,
  public.food_items,
  public.food_nutrition,
  public.diary_entries,
  public.providers,
  public.provider_members,
  public.provider_menu_items,
  public.food_submissions,
  public.review_assignments,
  public.food_reviews
  to authenticated;

grant select on public.audit_events, public.ai_recognition_requests to authenticated;

-- Defense in depth: the anonymous key has no business touching these tables
-- even before a policy is evaluated.
revoke all on public.user_preferences        from anon;
revoke all on public.diary_entries           from anon;
revoke all on public.audit_events            from anon;
revoke all on public.ai_recognition_requests from anon;
revoke all on public.user_roles              from anon;
revoke all on public.review_assignments      from anon;
revoke all on public.food_reviews            from anon;
revoke all on public.food_submissions        from anon;

-- ---------------------------------------------------------------------------
-- profiles
-- ---------------------------------------------------------------------------

drop policy if exists profiles_select_own on public.profiles;
create policy profiles_select_own on public.profiles
  for select to authenticated
  using (id = auth.uid() or public.has_role('admin'));

drop policy if exists profiles_insert_own on public.profiles;
create policy profiles_insert_own on public.profiles
  for insert to authenticated
  with check (id = auth.uid());

drop policy if exists profiles_update_own on public.profiles;
create policy profiles_update_own on public.profiles
  for update to authenticated
  using (id = auth.uid())
  with check (id = auth.uid());

-- ---------------------------------------------------------------------------
-- user_roles: readable by the holder, writable only by an administrator
-- ---------------------------------------------------------------------------

drop policy if exists user_roles_select_own on public.user_roles;
create policy user_roles_select_own on public.user_roles
  for select to authenticated
  using (user_id = auth.uid() or public.has_role('admin'));

drop policy if exists user_roles_admin_write on public.user_roles;
create policy user_roles_admin_write on public.user_roles
  for all to authenticated
  using (public.has_role('admin'))
  with check (public.has_role('admin'));

-- ---------------------------------------------------------------------------
-- user_preferences: health context, owner only
--
-- There is deliberately no administrator, provider, or reviewer policy here.
-- ---------------------------------------------------------------------------

drop policy if exists user_preferences_owner_all on public.user_preferences;
create policy user_preferences_owner_all on public.user_preferences
  for all to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

-- ---------------------------------------------------------------------------
-- food_items and food_nutrition: published rows are public discovery data
-- ---------------------------------------------------------------------------

drop policy if exists food_items_select_published on public.food_items;
create policy food_items_select_published on public.food_items
  for select to anon, authenticated
  using (is_published);

drop policy if exists food_items_select_staff on public.food_items;
create policy food_items_select_staff on public.food_items
  for select to authenticated
  using (public.has_role('institution') or public.has_role('admin'));

drop policy if exists food_items_admin_write on public.food_items;
create policy food_items_admin_write on public.food_items
  for all to authenticated
  using (public.has_role('admin'))
  with check (public.has_role('admin'));

drop policy if exists food_nutrition_select_published on public.food_nutrition;
create policy food_nutrition_select_published on public.food_nutrition
  for select to anon, authenticated
  using (
    exists (
      select 1 from public.food_items f
      where f.id = food_nutrition.food_id and f.is_published
    )
  );

drop policy if exists food_nutrition_select_staff on public.food_nutrition;
create policy food_nutrition_select_staff on public.food_nutrition
  for select to authenticated
  using (public.has_role('institution') or public.has_role('admin'));

drop policy if exists food_nutrition_admin_write on public.food_nutrition;
create policy food_nutrition_admin_write on public.food_nutrition
  for all to authenticated
  using (public.has_role('admin'))
  with check (public.has_role('admin'));

-- ---------------------------------------------------------------------------
-- diary_entries: strictly private
-- ---------------------------------------------------------------------------

drop policy if exists diary_entries_owner_all on public.diary_entries;
create policy diary_entries_owner_all on public.diary_entries
  for all to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

-- ---------------------------------------------------------------------------
-- providers and menus
-- ---------------------------------------------------------------------------

drop policy if exists providers_select_published on public.providers;
create policy providers_select_published on public.providers
  for select to anon, authenticated
  using (is_published);

drop policy if exists providers_select_member on public.providers;
create policy providers_select_member on public.providers
  for select to authenticated
  using (public.is_provider_member(id) or public.has_role('admin'));

drop policy if exists providers_insert_own on public.providers;
create policy providers_insert_own on public.providers
  for insert to authenticated
  with check (owner_id = auth.uid());

-- moderation_status is additionally protected by the guard_provider_moderation
-- trigger, so a member can edit its listing without approving itself.
drop policy if exists providers_update_member on public.providers;
create policy providers_update_member on public.providers
  for update to authenticated
  using (public.is_provider_member(id) or public.has_role('admin'))
  with check (public.is_provider_member(id) or public.has_role('admin'));

drop policy if exists providers_delete_owner on public.providers;
create policy providers_delete_owner on public.providers
  for delete to authenticated
  using (public.is_provider_owner(id) or public.has_role('admin'));

drop policy if exists provider_members_select on public.provider_members;
create policy provider_members_select on public.provider_members
  for select to authenticated
  using (user_id = auth.uid() or public.is_provider_owner(provider_id) or public.has_role('admin'));

drop policy if exists provider_members_owner_write on public.provider_members;
create policy provider_members_owner_write on public.provider_members
  for all to authenticated
  using (public.is_provider_owner(provider_id) or public.has_role('admin'))
  with check (public.is_provider_owner(provider_id) or public.has_role('admin'));

drop policy if exists provider_menu_items_select_published on public.provider_menu_items;
create policy provider_menu_items_select_published on public.provider_menu_items
  for select to anon, authenticated
  using (
    is_published
    and exists (
      select 1 from public.providers p
      where p.id = provider_menu_items.provider_id and p.is_published
    )
  );

drop policy if exists provider_menu_items_select_member on public.provider_menu_items;
create policy provider_menu_items_select_member on public.provider_menu_items
  for select to authenticated
  using (public.is_provider_member(provider_id) or public.has_role('admin'));

drop policy if exists provider_menu_items_member_write on public.provider_menu_items;
create policy provider_menu_items_member_write on public.provider_menu_items
  for all to authenticated
  using (public.is_provider_member(provider_id) or public.has_role('admin'))
  with check (public.is_provider_member(provider_id) or public.has_role('admin'));

-- ---------------------------------------------------------------------------
-- Submissions and institution review
-- ---------------------------------------------------------------------------

drop policy if exists food_submissions_select on public.food_submissions;
create policy food_submissions_select on public.food_submissions
  for select to authenticated
  using (
    submitted_by = auth.uid()
    or public.is_assigned_reviewer(id)
    or public.has_role('admin')
  );

drop policy if exists food_submissions_insert_own on public.food_submissions;
create policy food_submissions_insert_own on public.food_submissions
  for insert to authenticated
  with check (submitted_by = auth.uid() and status = 'pending');

drop policy if exists food_submissions_update_own on public.food_submissions;
create policy food_submissions_update_own on public.food_submissions
  for update to authenticated
  using ((submitted_by = auth.uid() and status = 'pending') or public.has_role('admin'))
  with check (submitted_by = auth.uid() or public.has_role('admin'));

drop policy if exists food_submissions_delete_own on public.food_submissions;
create policy food_submissions_delete_own on public.food_submissions
  for delete to authenticated
  using ((submitted_by = auth.uid() and status = 'pending') or public.has_role('admin'));

drop policy if exists review_assignments_select on public.review_assignments;
create policy review_assignments_select on public.review_assignments
  for select to authenticated
  using (
    reviewer_id = auth.uid()
    or public.owns_submission(submission_id)
    or public.has_role('admin')
  );

drop policy if exists review_assignments_admin_write on public.review_assignments;
create policy review_assignments_admin_write on public.review_assignments
  for all to authenticated
  using (public.has_role('admin'))
  with check (public.has_role('admin'));

drop policy if exists food_reviews_select on public.food_reviews;
create policy food_reviews_select on public.food_reviews
  for select to authenticated
  using (
    reviewer_id = auth.uid()
    or public.owns_submission(submission_id)
    or public.has_role('admin')
  );

drop policy if exists food_reviews_insert_assigned on public.food_reviews;
create policy food_reviews_insert_assigned on public.food_reviews
  for insert to authenticated
  with check (reviewer_id = auth.uid() and public.is_assigned_reviewer(submission_id));

drop policy if exists food_reviews_update_own on public.food_reviews;
create policy food_reviews_update_own on public.food_reviews
  for update to authenticated
  using (reviewer_id = auth.uid())
  with check (reviewer_id = auth.uid() and public.is_assigned_reviewer(submission_id));

drop policy if exists food_reviews_delete_admin on public.food_reviews;
create policy food_reviews_delete_admin on public.food_reviews
  for delete to authenticated
  using (public.has_role('admin'));

-- ---------------------------------------------------------------------------
-- audit_events and AI accounting
--
-- Rows are written by SECURITY DEFINER triggers and by the edge function's
-- service role, both of which bypass RLS. No client write policy exists.
-- ---------------------------------------------------------------------------

drop policy if exists audit_events_select_admin on public.audit_events;
create policy audit_events_select_admin on public.audit_events
  for select to authenticated
  using (public.has_role('admin'));

drop policy if exists ai_requests_select_own on public.ai_recognition_requests;
create policy ai_requests_select_own on public.ai_recognition_requests
  for select to authenticated
  using (user_id = auth.uid() or public.has_role('admin'));
