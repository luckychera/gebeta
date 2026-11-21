-- Gebeta — initial schema
--
-- Creates the tables the Gebeta client reads and writes. Every statement is
-- additive: nothing is dropped and no existing row is modified. Running this
-- file twice is safe.
--
-- Conventions used here:
--   * UUID primary keys for every row the application creates at runtime.
--   * Public catalogue rows keep a human-readable `slug` so existing deep
--     links such as /food/injera and /provider/kafa-terrace keep working.
--   * Unknown nutrition values stay NULL. Zero means "measured as zero".
--   * Health information lives in its own table so it can be granted
--     separately from the display profile.

-- gen_random_uuid() is part of core PostgreSQL from version 13, so no
-- extension is created here. Avoiding `create extension` also keeps this file
-- runnable by a role that cannot install extensions.

-- ---------------------------------------------------------------------------
-- Shared helpers
-- ---------------------------------------------------------------------------

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ---------------------------------------------------------------------------
-- Identity: profile, roles, health preferences
-- ---------------------------------------------------------------------------

create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  display_name text not null default '' check (char_length(display_name) <= 60),
  consent_health boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.profiles is 'One row per authenticated user. Readable only by its owner.';
comment on column public.profiles.consent_health is 'User consent for storing the optional fields in user_preferences.';

-- Roles are assigned, never self-declared. The client may read its own rows
-- so it can show the right screens, but it can never insert or update them.
create table if not exists public.user_roles (
  user_id uuid not null references auth.users (id) on delete cascade,
  role text not null check (role in ('user', 'provider', 'institution', 'admin')),
  granted_by uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now(),
  primary key (user_id, role)
);

comment on table public.user_roles is 'Server-side role assignment. Never trust a role sent by the client.';

-- Optional, consent-gated context. Nothing here is a diagnosis.
create table if not exists public.user_preferences (
  user_id uuid primary key references public.profiles (id) on delete cascade,
  age smallint check (age is null or age between 18 and 120),
  gender text check (gender is null or gender in ('Woman', 'Man', 'Another', 'Prefer not to say')),
  activity text check (activity is null or activity in ('Mostly seated', 'On your feet', 'Regular training', 'Prefer not to say')),
  life_stage text check (life_stage is null or life_stage in ('pregnant', 'breastfeeding')),
  preferences text[] not null default '{}'
    check (preferences <@ array['Vegetarian', 'High protein', 'Mild spice', 'No raw meat']::text[]),
  allergies text not null default '' check (char_length(allergies) <= 500),
  health_context text[] not null default '{}'
    check (health_context <@ array['Diabetes', 'Blood pressure']::text[]),
  goal text check (goal is null or goal in ('maintain', 'weight', 'lose', 'gain', 'healthy')),
  energy_reference_kcal integer check (energy_reference_kcal is null or energy_reference_kcal between 500 and 6000),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.user_preferences is
  'Consent-gated personal context. Health notes are stored for the owner only and are never exposed to providers, reviewers, or administrators.';
comment on column public.user_preferences.goal is
  'Saved as context. The application does not rank foods to achieve a goal. "weight" is a legacy value kept so older saved profiles are not lost.';

-- ---------------------------------------------------------------------------
-- Food catalogue
-- ---------------------------------------------------------------------------

create table if not exists public.food_items (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9-]{2,60}$'),
  name text not null check (char_length(name) between 1 and 120),
  local_names text[] not null default '{}',
  description text not null default '',
  categories text[] not null default '{}'
    check (categories <@ array['traditional', 'breakfast', 'lunch', 'dinner', 'vegetarian', 'high-protein']::text[]),
  image_key text not null default 'hero',
  ingredients text[] not null default '{}',
  caution_terms text[] not null default '{}',
  dietary_notes text[] not null default '{}',
  often_uncooked boolean not null default false,
  is_published boolean not null default false,
  is_demo boolean not null default true,
  created_by uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.food_items is 'Curated food catalogue. Only is_published rows are readable by the public.';
comment on column public.food_items.is_demo is 'TRUE means the record is illustrative demonstration content, not an institution-verified entry.';

create index if not exists food_items_published_idx on public.food_items (is_published);
create index if not exists food_items_categories_idx on public.food_items using gin (categories);

create table if not exists public.food_nutrition (
  id uuid primary key default gen_random_uuid(),
  food_id uuid not null references public.food_items (id) on delete cascade,
  serving_basis text not null check (char_length(serving_basis) between 1 and 160),
  serving_grams numeric(7, 2) check (serving_grams is null or serving_grams > 0),
  energy_kcal numeric(7, 2) check (energy_kcal is null or energy_kcal >= 0),
  protein_g numeric(7, 2) check (protein_g is null or protein_g >= 0),
  carbohydrate_g numeric(7, 2) check (carbohydrate_g is null or carbohydrate_g >= 0),
  fat_g numeric(7, 2) check (fat_g is null or fat_g >= 0),
  fibre_g numeric(7, 2) check (fibre_g is null or fibre_g >= 0),
  source_label text not null,
  verification_status text not null default 'illustrative-demo'
    check (verification_status in ('illustrative-demo', 'institution-reviewed')),
  assumptions text not null default '',
  reviewed_by uuid references auth.users (id) on delete set null,
  reviewed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (food_id, serving_basis)
);

comment on table public.food_nutrition is
  'Nutrition estimates with their serving basis and source. A NULL nutrient means unknown and must never be displayed or stored as zero.';
comment on column public.food_nutrition.verification_status is
  'illustrative-demo means the figures are teaching estimates, not laboratory measurements.';

create index if not exists food_nutrition_food_idx on public.food_nutrition (food_id);

-- ---------------------------------------------------------------------------
-- Personal diary
-- ---------------------------------------------------------------------------

-- Diary rows keep a snapshot of the nutrition shown at save time so later
-- catalogue edits do not silently rewrite a user's history.
create table if not exists public.diary_entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  food_id uuid references public.food_items (id) on delete set null,
  food_name text not null check (char_length(food_name) between 1 and 120),
  portion numeric(5, 2) not null default 1 check (portion > 0 and portion <= 20),
  serving_basis text not null default '',
  energy_kcal numeric(8, 2) check (energy_kcal is null or energy_kcal >= 0),
  protein_g numeric(8, 2) check (protein_g is null or protein_g >= 0),
  carbohydrate_g numeric(8, 2) check (carbohydrate_g is null or carbohydrate_g >= 0),
  fat_g numeric(8, 2) check (fat_g is null or fat_g >= 0),
  fibre_g numeric(8, 2) check (fibre_g is null or fibre_g >= 0),
  image_key text not null default 'hero',
  source_label text not null default '',
  eaten_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.diary_entries is 'Private food diary. Readable and writable only by the owning user.';

create index if not exists diary_entries_user_eaten_idx on public.diary_entries (user_id, eaten_at desc);

-- ---------------------------------------------------------------------------
-- Providers and menus
-- ---------------------------------------------------------------------------

create table if not exists public.providers (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9-]{2,60}$'),
  name text not null check (char_length(name) between 1 and 120),
  kind text not null default 'Restaurant' check (kind in ('Hotel', 'Café', 'Restaurant')),
  city text not null default '',
  summary text not null default '',
  is_demo boolean not null default true,
  is_published boolean not null default false,
  moderation_status text not null default 'pending'
    check (moderation_status in ('pending', 'verified-demo', 'needs-changes')),
  owner_id uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.providers is 'Food providers. is_demo marks fictional demonstration records.';
comment on column public.providers.moderation_status is 'Set by administrators only. A provider cannot change its own moderation status.';

create index if not exists providers_published_idx on public.providers (is_published);

create table if not exists public.provider_members (
  provider_id uuid not null references public.providers (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  member_role text not null default 'manager' check (member_role in ('owner', 'manager')),
  created_at timestamptz not null default now(),
  primary key (provider_id, user_id)
);

comment on table public.provider_members is 'Which users may manage which provider. This is the only source of provider authorization.';

create index if not exists provider_members_user_idx on public.provider_members (user_id);

create table if not exists public.provider_menu_items (
  id uuid primary key default gen_random_uuid(),
  provider_id uuid not null references public.providers (id) on delete cascade,
  food_id uuid references public.food_items (id) on delete set null,
  name text not null check (char_length(name) between 1 and 120),
  description text not null default '',
  price_etb numeric(10, 2) check (price_etb is null or (price_etb >= 0 and price_etb <= 100000)),
  currency text not null default 'ETB',
  ingredients text[] not null default '{}',
  is_published boolean not null default false,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint provider_menu_items_unique_name unique (provider_id, name)
);

comment on table public.provider_menu_items is 'Menu items. Only published items of a published provider are publicly readable.';
comment on column public.provider_menu_items.price_etb is 'Sample price for the demonstration. No payment is processed anywhere in this project.';

create index if not exists provider_menu_items_provider_idx on public.provider_menu_items (provider_id, is_published);

-- ---------------------------------------------------------------------------
-- Institution submission and review workflow
-- ---------------------------------------------------------------------------

create table if not exists public.food_submissions (
  id uuid primary key default gen_random_uuid(),
  submitted_by uuid not null default auth.uid() references auth.users (id) on delete cascade,
  food_id uuid references public.food_items (id) on delete set null,
  proposed_name text not null check (char_length(proposed_name) between 1 and 120),
  proposed_local_names text[] not null default '{}',
  proposed_description text not null default '',
  proposed_nutrition jsonb,
  note text not null default '',
  image_path text,
  status text not null default 'pending' check (status in ('pending', 'approved', 'changes', 'rejected')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.food_submissions is 'Food records proposed for institution review.';
comment on column public.food_submissions.proposed_nutrition is 'Free-form proposal. Unknown nutrients must stay absent or null, never zero.';
comment on column public.food_submissions.image_path is 'Object path inside the private food-uploads bucket. Never a public URL.';

create index if not exists food_submissions_status_idx on public.food_submissions (status);
create index if not exists food_submissions_submitter_idx on public.food_submissions (submitted_by);

-- A reviewer sees a submission only when an administrator assigns it.
create table if not exists public.review_assignments (
  submission_id uuid not null references public.food_submissions (id) on delete cascade,
  reviewer_id uuid not null references auth.users (id) on delete cascade,
  assigned_by uuid references auth.users (id) on delete set null,
  assigned_at timestamptz not null default now(),
  primary key (submission_id, reviewer_id)
);

comment on table public.review_assignments is 'Explicit reviewer authorization. Institution access is per submission, never global.';

create index if not exists review_assignments_reviewer_idx on public.review_assignments (reviewer_id);

create table if not exists public.food_reviews (
  id uuid primary key default gen_random_uuid(),
  submission_id uuid not null references public.food_submissions (id) on delete cascade,
  reviewer_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  status text not null check (status in ('approved', 'changes', 'rejected')),
  note text not null default '' check (char_length(note) <= 2000),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.food_reviews is 'Review decisions. Only an assigned reviewer can write one.';

create index if not exists food_reviews_submission_idx on public.food_reviews (submission_id);

-- ---------------------------------------------------------------------------
-- Audit trail and AI request accounting
-- ---------------------------------------------------------------------------

create table if not exists public.audit_events (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid references auth.users (id) on delete set null,
  action text not null,
  entity_type text not null,
  entity_id text,
  detail jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

comment on table public.audit_events is 'Written by database triggers only. Readable by administrators. Never store health details or credentials here.';

create index if not exists audit_events_created_idx on public.audit_events (created_at desc);

-- Used by the recognition edge function to apply a per-user hourly limit.
create table if not exists public.ai_recognition_requests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  model text not null default '',
  outcome text not null default 'unavailable' check (outcome in ('matched', 'no_match', 'unavailable')),
  created_at timestamptz not null default now()
);

comment on table public.ai_recognition_requests is
  'One row per food-recognition call, used for rate limiting. No image, prompt, or health data is stored here.';

create index if not exists ai_recognition_requests_user_idx on public.ai_recognition_requests (user_id, created_at desc);

-- ---------------------------------------------------------------------------
-- Authorization helpers
--
-- These read tables that are themselves protected by RLS, so they run as
-- SECURITY DEFINER with a pinned search_path. That also stops a policy on
-- user_roles from recursing into itself.
-- ---------------------------------------------------------------------------

create or replace function public.has_role(target_role text)
returns boolean
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select exists (
    select 1 from public.user_roles r
    where r.user_id = auth.uid() and r.role = target_role
  );
$$;

create or replace function public.is_provider_member(target_provider uuid)
returns boolean
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select exists (
    select 1 from public.provider_members m
    where m.provider_id = target_provider and m.user_id = auth.uid()
  );
$$;

create or replace function public.is_provider_owner(target_provider uuid)
returns boolean
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select exists (
    select 1 from public.provider_members m
    where m.provider_id = target_provider
      and m.user_id = auth.uid()
      and m.member_role = 'owner'
  );
$$;

create or replace function public.is_assigned_reviewer(target_submission uuid)
returns boolean
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select exists (
    select 1 from public.review_assignments a
    where a.submission_id = target_submission and a.reviewer_id = auth.uid()
  );
$$;

create or replace function public.owns_submission(target_submission uuid)
returns boolean
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select exists (
    select 1 from public.food_submissions s
    where s.id = target_submission and s.submitted_by = auth.uid()
  );
$$;

revoke all on function public.has_role(text) from public;
revoke all on function public.is_provider_member(uuid) from public;
revoke all on function public.is_provider_owner(uuid) from public;
revoke all on function public.is_assigned_reviewer(uuid) from public;
revoke all on function public.owns_submission(uuid) from public;
grant execute on function public.has_role(text) to authenticated;
grant execute on function public.is_provider_member(uuid) to authenticated;
grant execute on function public.is_provider_owner(uuid) to authenticated;
grant execute on function public.is_assigned_reviewer(uuid) to authenticated;
grant execute on function public.owns_submission(uuid) to authenticated;

-- ---------------------------------------------------------------------------
-- Triggers
-- ---------------------------------------------------------------------------

-- Every new account gets a profile row, an empty consent-off preferences row,
-- and the base 'user' role. Elevated roles are granted separately.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, left(coalesce(new.raw_user_meta_data ->> 'display_name', ''), 60))
  on conflict (id) do nothing;

  insert into public.user_preferences (user_id)
  values (new.id)
  on conflict (user_id) do nothing;

  insert into public.user_roles (user_id, role)
  values (new.id, 'user')
  on conflict (user_id, role) do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Clearing consent must also clear the optional fields it covered.
create or replace function public.apply_consent_withdrawal()
returns trigger
language plpgsql
set search_path = public, pg_temp
as $$
begin
  if new.consent_health = false and old.consent_health = true then
    update public.user_preferences
    set age = null,
        gender = null,
        activity = null,
        life_stage = null,
        preferences = '{}',
        allergies = '',
        health_context = '{}',
        goal = null,
        energy_reference_kcal = null
    where user_id = new.id;
  end if;
  return new;
end;
$$;

drop trigger if exists profiles_consent_withdrawn on public.profiles;
create trigger profiles_consent_withdrawn
  after update of consent_health on public.profiles
  for each row execute function public.apply_consent_withdrawal();

-- A provider may edit its own listing but not approve itself.
create or replace function public.guard_provider_moderation()
returns trigger
language plpgsql
set search_path = public, pg_temp
as $$
begin
  if new.moderation_status is distinct from old.moderation_status and not public.has_role('admin') then
    raise exception 'moderation_status can only be changed by an administrator';
  end if;
  return new;
end;
$$;

drop trigger if exists providers_guard_moderation on public.providers;
create trigger providers_guard_moderation
  before update on public.providers
  for each row execute function public.guard_provider_moderation();

-- The creator of a provider becomes its owner, which is what the menu
-- policies check. Without this a new provider would have no manager.
create or replace function public.attach_provider_owner()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  if new.owner_id is not null then
    insert into public.provider_members (provider_id, user_id, member_role)
    values (new.id, new.owner_id, 'owner')
    on conflict (provider_id, user_id) do nothing;
  end if;
  return new;
end;
$$;

drop trigger if exists providers_attach_owner on public.providers;
create trigger providers_attach_owner
  after insert on public.providers
  for each row execute function public.attach_provider_owner();

create or replace function public.log_audit_event()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  if tg_table_name = 'providers' then
    if new.moderation_status is distinct from old.moderation_status then
      insert into public.audit_events (actor_id, action, entity_type, entity_id, detail)
      values (auth.uid(), 'provider.moderation_changed', 'provider', new.id::text,
              jsonb_build_object('from', old.moderation_status, 'to', new.moderation_status));
    end if;
  elsif tg_table_name = 'food_reviews' then
    insert into public.audit_events (actor_id, action, entity_type, entity_id, detail)
    values (auth.uid(), 'submission.reviewed', 'food_submission', new.submission_id::text,
            jsonb_build_object('status', new.status));
  end if;
  return new;
end;
$$;

drop trigger if exists providers_audit on public.providers;
create trigger providers_audit
  after update on public.providers
  for each row execute function public.log_audit_event();

drop trigger if exists food_reviews_audit on public.food_reviews;
create trigger food_reviews_audit
  after insert on public.food_reviews
  for each row execute function public.log_audit_event();

-- A reviewer may not write food_submissions directly, so the decision is
-- applied here instead of trusting the client to keep the two in step.
create or replace function public.apply_review_decision()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  update public.food_submissions
  set status = new.status
  where id = new.submission_id;
  return new;
end;
$$;

drop trigger if exists food_reviews_apply_decision on public.food_reviews;
create trigger food_reviews_apply_decision
  after insert on public.food_reviews
  for each row execute function public.apply_review_decision();

-- updated_at maintenance
drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at before update on public.profiles
  for each row execute function public.set_updated_at();

drop trigger if exists user_preferences_set_updated_at on public.user_preferences;
create trigger user_preferences_set_updated_at before update on public.user_preferences
  for each row execute function public.set_updated_at();

drop trigger if exists food_items_set_updated_at on public.food_items;
create trigger food_items_set_updated_at before update on public.food_items
  for each row execute function public.set_updated_at();

drop trigger if exists food_nutrition_set_updated_at on public.food_nutrition;
create trigger food_nutrition_set_updated_at before update on public.food_nutrition
  for each row execute function public.set_updated_at();

drop trigger if exists diary_entries_set_updated_at on public.diary_entries;
create trigger diary_entries_set_updated_at before update on public.diary_entries
  for each row execute function public.set_updated_at();

drop trigger if exists providers_set_updated_at on public.providers;
create trigger providers_set_updated_at before update on public.providers
  for each row execute function public.set_updated_at();

drop trigger if exists provider_menu_items_set_updated_at on public.provider_menu_items;
create trigger provider_menu_items_set_updated_at before update on public.provider_menu_items
  for each row execute function public.set_updated_at();

drop trigger if exists food_submissions_set_updated_at on public.food_submissions;
create trigger food_submissions_set_updated_at before update on public.food_submissions
  for each row execute function public.set_updated_at();

drop trigger if exists food_reviews_set_updated_at on public.food_reviews;
create trigger food_reviews_set_updated_at before update on public.food_reviews
  for each row execute function public.set_updated_at();
