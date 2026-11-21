import type { MenuItem, ProviderRecord } from '../../../types';
import type { GebetaClient } from '../client';
import type { ProviderMenuItemRow, ProviderRow } from '../database.types';
import { menuItemFromRow, providerFromRow } from '../mappers';
import { fail, ok, type RepoResult } from '../result';
import { resolveFoodUuid } from './catalogue';

const MENU_COLUMNS =
  'id, provider_id, food_id, name, description, price_etb, currency, ingredients, is_published, sort_order, food_items (slug)';

type MenuRow = ProviderMenuItemRow & { food_items?: { slug: string } | { slug: string }[] | null };

export type ProviderBundle = {
  providers: ProviderRecord[];
  menus: Record<string, MenuItem[]>;
};

function slugOf(row: MenuRow): string | null {
  const joined = Array.isArray(row.food_items) ? row.food_items[0] : row.food_items;
  return joined?.slug ?? null;
}

/**
 * Providers the caller is allowed to see, with their menus.
 *
 * A guest gets published providers and published items. A provider member
 * additionally gets their own unpublished rows, because the select policies
 * add that access on the server. The `manageable` flag is derived from
 * provider_members, never from anything the client asserts.
 */
export async function fetchProviders(client: GebetaClient, userId: string | null): Promise<RepoResult<ProviderBundle>> {
  const { data: providerData, error: providerError } = await client
    .from('providers')
    .select('id, slug, name, kind, city, summary, is_demo, is_published, moderation_status, owner_id')
    .order('name', { ascending: true });

  if (providerError) return fail(providerError, 'Provider listings could not be loaded.');

  const providerRows = (providerData ?? []) as unknown as ProviderRow[];
  if (providerRows.length === 0) return ok({ providers: [], menus: {} });

  let manageableIds = new Set<string>();
  if (userId) {
    const { data: memberData } = await client.from('provider_members').select('provider_id').eq('user_id', userId);
    manageableIds = new Set(((memberData ?? []) as unknown as { provider_id: string }[]).map((row) => row.provider_id));
  }

  const { data: menuData, error: menuError } = await client
    .from('provider_menu_items')
    .select(MENU_COLUMNS)
    .order('sort_order', { ascending: true });

  if (menuError) return fail(menuError, 'Provider menus could not be loaded.');

  const menus: Record<string, MenuItem[]> = {};
  const slugById = new Map(providerRows.map((row) => [row.id, row.slug]));
  for (const row of (menuData ?? []) as unknown as MenuRow[]) {
    const providerSlug = slugById.get(row.provider_id);
    if (!providerSlug) continue;
    menus[providerSlug] = [...(menus[providerSlug] ?? []), menuItemFromRow(row, slugOf(row))];
  }

  return ok({
    providers: providerRows.map((row) => providerFromRow(row, manageableIds.has(row.id))),
    menus,
  });
}

export async function setMenuItemPublished(
  client: GebetaClient,
  itemId: string,
  published: boolean,
): Promise<RepoResult<true>> {
  const { error } = await client
    .from('provider_menu_items')
    .update({ is_published: published } as never)
    .eq('id', itemId);

  if (error) return fail(error, 'That menu item could not be updated.');
  return ok(true);
}

export async function updateMenuItemRow(
  client: GebetaClient,
  itemId: string,
  patch: { name: string; description: string; priceEtb: number },
): Promise<RepoResult<true>> {
  const { error } = await client
    .from('provider_menu_items')
    .update({ name: patch.name, description: patch.description, price_etb: patch.priceEtb } as never)
    .eq('id', itemId);

  if (error) return fail(error, 'That menu item could not be updated.');
  return ok(true);
}

export async function insertMenuItem(
  client: GebetaClient,
  providerUuid: string,
  item: MenuItem,
): Promise<RepoResult<MenuItem>> {
  const foodUuid = item.foodId ? await resolveFoodUuid(client, item.foodId) : null;

  const { data, error } = await client
    .from('provider_menu_items')
    .insert({
      provider_id: providerUuid,
      food_id: foodUuid,
      name: item.name,
      description: item.description,
      price_etb: item.priceEtb,
      ingredients: item.ingredients,
      is_published: item.published,
    } as never)
    .select(MENU_COLUMNS)
    .single();

  if (error) return fail(error, 'That menu item could not be added.');
  const row = data as unknown as MenuRow;
  return ok(menuItemFromRow(row, slugOf(row)));
}
