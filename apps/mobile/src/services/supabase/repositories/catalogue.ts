import type { FoodRecord } from '../../../types';
import type { GebetaClient } from '../client';
import type { FoodItemWithNutrition } from '../mappers';
import { foodFromRow } from '../mappers';
import { fail, ok, type RepoResult } from '../result';

const FOOD_COLUMNS =
  'id, slug, name, local_names, description, categories, image_key, ingredients, caution_terms, dietary_notes, often_uncooked, is_published, is_demo, created_at, updated_at, food_nutrition (id, food_id, serving_basis, serving_grams, energy_kcal, protein_g, carbohydrate_g, fat_g, fibre_g, source_label, verification_status, assumptions)';

/**
 * Published catalogue foods with their nutrition estimate.
 *
 * Row level security already limits this to published rows, so an anonymous
 * visitor and a signed-in user run the same query.
 */
export async function fetchCatalogue(client: GebetaClient): Promise<RepoResult<FoodRecord[]>> {
  const { data, error } = await client
    .from('food_items')
    .select(FOOD_COLUMNS)
    .eq('is_published', true)
    .order('name', { ascending: true });

  if (error) return fail(error, 'The food catalogue could not be loaded.');

  const rows = (data ?? []) as unknown as FoodItemWithNutrition[];
  return ok(rows.map(foodFromRow));
}

/** UUID for a catalogue slug, used when writing a row that references a food. */
export async function resolveFoodUuid(client: GebetaClient, slug: string): Promise<string | null> {
  if (!slug) return null;
  const { data, error } = await client.from('food_items').select('id').eq('slug', slug).maybeSingle();
  if (error || !data) return null;
  return (data as { id: string }).id;
}
