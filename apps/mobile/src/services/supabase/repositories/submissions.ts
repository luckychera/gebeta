// Food submissions and the institution review workflow.
//
// A reviewer sees a submission only when an administrator has created the
// matching row in review_assignments, and a review insert is accepted only
// for an assigned reviewer. The submission status is then updated by the
// apply_review_decision trigger rather than by the client.

import type { GebetaClient } from '../client';
import type { FoodSubmissionRow } from '../database.types';
import { fail, ok, type RepoResult } from '../result';

export type SubmissionSummary = {
  id: string;
  name: string;
  description: string;
  note: string;
  status: FoodSubmissionRow['status'];
  imagePath: string | null;
  createdAt: string;
  mine: boolean;
};

const SUBMISSION_COLUMNS =
  'id, submitted_by, food_id, proposed_name, proposed_local_names, proposed_description, note, image_path, status, created_at';

function toSummary(row: FoodSubmissionRow, userId: string | null): SubmissionSummary {
  return {
    id: row.id,
    name: row.proposed_name,
    description: row.proposed_description ?? '',
    note: row.note ?? '',
    status: row.status,
    imagePath: row.image_path,
    createdAt: row.created_at,
    mine: userId !== null && row.submitted_by === userId,
  };
}

/**
 * Everything the caller may read: their own submissions, plus any submission
 * assigned to them for review. The filter lives in the database policy, so
 * this is a plain select.
 */
export async function fetchVisibleSubmissions(
  client: GebetaClient,
  userId: string | null,
): Promise<RepoResult<SubmissionSummary[]>> {
  const { data, error } = await client
    .from('food_submissions')
    .select(SUBMISSION_COLUMNS)
    .order('created_at', { ascending: false })
    .limit(50);

  if (error) return fail(error, 'Submissions could not be loaded.');
  return ok(((data ?? []) as unknown as FoodSubmissionRow[]).map((row) => toSummary(row, userId)));
}

export async function createSubmission(
  client: GebetaClient,
  input: { userId: string; name: string; description: string; note: string; imagePath: string | null },
): Promise<RepoResult<SubmissionSummary>> {
  const { data, error } = await client
    .from('food_submissions')
    .insert({
      submitted_by: input.userId,
      proposed_name: input.name.slice(0, 120),
      proposed_description: input.description.slice(0, 2000),
      note: input.note.slice(0, 2000),
      image_path: input.imagePath,
      status: 'pending',
    } as never)
    .select(SUBMISSION_COLUMNS)
    .single();

  if (error) return fail(error, 'That submission could not be sent for review.');
  return ok(toSummary(data as unknown as FoodSubmissionRow, input.userId));
}

export async function submitReview(
  client: GebetaClient,
  input: { submissionId: string; reviewerId: string; status: 'approved' | 'changes' | 'rejected'; note: string },
): Promise<RepoResult<true>> {
  const { error } = await client.from('food_reviews').insert({
    submission_id: input.submissionId,
    reviewer_id: input.reviewerId,
    status: input.status,
    note: input.note.slice(0, 2000),
  } as never);

  if (error) return fail(error, 'That review could not be recorded. Only an assigned reviewer can decide a submission.');
  return ok(true);
}
