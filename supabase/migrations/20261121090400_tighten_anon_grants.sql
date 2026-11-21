-- Gebeta — narrow the anonymous role's table privileges
--
-- Supabase grants all table privileges to `anon` and `authenticated` by
-- default when a table is created. Row level security already stops an
-- anonymous write: a probe against the live project confirmed that updating,
-- deleting, or renaming catalogue and provider rows as `anon` affects zero
-- rows. PostgREST reports that as a success with an empty result rather than
-- an error, though, which reads as if the write went through.
--
-- Removing the underlying privilege turns a silent no-op into an explicit
-- "permission denied", and means these tables are protected by a privilege
-- check as well as a policy. This file is additive and safe to re-run.

-- Public discovery tables: read only for anonymous visitors.
revoke insert, update, delete, truncate, references, trigger
  on public.food_items          from anon;
revoke insert, update, delete, truncate, references, trigger
  on public.food_nutrition      from anon;
revoke insert, update, delete, truncate, references, trigger
  on public.providers           from anon;
revoke insert, update, delete, truncate, references, trigger
  on public.provider_menu_items from anon;

-- Not public at all. Their policies only address `authenticated`, so the
-- anonymous role has no reason to hold a privilege on them.
revoke all on public.profiles         from anon;
revoke all on public.provider_members from anon;

-- Stated again so a reader can see the full anonymous surface in one place:
-- four tables, select only, and only the rows the policies publish.
grant select on
  public.food_items,
  public.food_nutrition,
  public.providers,
  public.provider_menu_items
  to anon;
