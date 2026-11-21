import type { DiaryEntry } from '../../../types';
import type { GebetaClient } from '../client';
import type { DiaryEntryWithFood } from '../database.types';
import { diaryEntryFromRow, diaryInsertFromEntry } from '../mappers';
import { fail, ok, type RepoResult } from '../result';
import { resolveFoodUuid } from './catalogue';

const DIARY_COLUMNS =
  'id, user_id, food_id, food_name, portion, serving_basis, energy_kcal, protein_g, carbohydrate_g, fat_g, fibre_g, image_key, source_label, eaten_at, created_at, food_items (slug)';

/**
 * The signed-in user's diary.
 *
 * The user_id filter is a courtesy for the query planner. The real boundary
 * is the diary_entries_owner_all policy, which no client can talk its way
 * around.
 */
export async function fetchDiary(client: GebetaClient, userId: string): Promise<RepoResult<DiaryEntry[]>> {
  const { data, error } = await client
    .from('diary_entries')
    .select(DIARY_COLUMNS)
    .eq('user_id', userId)
    .order('eaten_at', { ascending: false })
    .limit(200);

  if (error) return fail(error, 'Your diary could not be loaded.');

  const rows = (data ?? []) as unknown as DiaryEntryWithFood[];
  return ok(rows.map(diaryEntryFromRow));
}

export async function insertDiaryEntry(
  client: GebetaClient,
  entry: DiaryEntry,
  userId: string,
): Promise<RepoResult<DiaryEntry>> {
  const foodUuid = await resolveFoodUuid(client, entry.foodId);
  const payload = diaryInsertFromEntry(entry, userId, foodUuid);

  const { data, error } = await client
    .from('diary_entries')
    .insert(payload as never)
    .select(DIARY_COLUMNS)
    .single();

  if (error) return fail(error, 'That meal could not be saved to your account.');
  return ok(diaryEntryFromRow(data as unknown as DiaryEntryWithFood));
}

export async function deleteDiaryEntry(client: GebetaClient, id: string): Promise<RepoResult<true>> {
  const { error } = await client.from('diary_entries').delete().eq('id', id);
  if (error) return fail(error, 'That meal could not be removed from your account.');
  return ok(true);
}
