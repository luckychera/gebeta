import { useCallback, useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Badge, Body, Card, Chip, Field, Muted, PrimaryButton, Screen, SecondaryButton, Title } from '../components/ui';
import { go } from '../navigation/go';
import { getSupabase } from '../services/supabase/client';
import {
  createSubmission,
  fetchVisibleSubmissions,
  submitReview,
  type SubmissionSummary,
} from '../services/supabase/repositories/submissions';
import { useAppState } from '../state/AppState';
import { useAuth } from '../state/AuthState';
import { colors } from '../theme/tokens';
import type { ReviewStatus } from '../types';
import { timeLabel } from '../utils/dates';

const SECTIONS = [
  { id: 'model', label: 'Model' },
  { id: 'kitchens', label: 'Kitchens' },
  { id: 'review', label: 'Review' },
  { id: 'admin', label: 'Admin' },
] as const;

type SectionId = (typeof SECTIONS)[number]['id'];

export default function BusinessScreen() {
  const { review, setReview, moderation, setProviderVerification, flash, clearFlash } = useAppState();
  const [section, setSection] = useState<SectionId>('model');
  const [note, setNote] = useState(review.note);

  return (
    <Screen>
      <Title>Gebeta ecosystem</Title>
      <Body>Gebeta is a food intelligence network for people, kitchens, institutions, and the platform team. This screen uses sample records only.</Body>
      {flash ? <Muted>{flash}</Muted> : null}
      <View style={styles.chips}>
        {SECTIONS.map((item) => (
          <Chip key={item.id} label={item.label} selected={section === item.id} onPress={() => { setSection(item.id); clearFlash(); }} />
        ))}
      </View>

      {section === 'model' ? <Model /> : null}
      {section === 'kitchens' ? (
        <View style={styles.stack}>
          <Card>
            <Body>Hotels, restaurants, and cafés</Body>
            <Muted>Open a fictional provider to see a guest menu, sample prices, and a QR referral. One hotel can publish items on this device.</Muted>
          </Card>
          <PrimaryButton label="Open provider menus" onPress={() => go('/providers')} />
        </View>
      ) : null}
      {section === 'review' ? <SubmissionReview /> : null}
      {section === 'review' ? (
        <Card>
          <Badge label="Fictional submission" tone="neutral" />
          <Body>Kocho serving description</Body>
          <Muted>Submitted by the fictional Southwestern Food Archive. Source: demo note, not a field study.</Muted>
          <Muted>Claim: one piece, about 120 g, served as bread.</Muted>
          <Badge label={reviewLabel(review.status)} tone={review.status === 'approved' ? 'green' : 'clay'} />
          <Field label="Reviewer note" value={note} onChangeText={setNote} placeholder="Optional note for the demo" multiline />
          <View style={styles.actions}>
            <PrimaryButton label="Approve" onPress={() => setReview('approved', note)} />
            <SecondaryButton label="Request changes" onPress={() => setReview('changes', note)} />
            <SecondaryButton label="Reject" onPress={() => setReview('rejected', note)} />
          </View>
          <Muted>A status set here stays on this device. It does not publish an institutional decision.</Muted>
        </Card>
      ) : null}
      {section === 'admin' ? (
        <View style={styles.stack}>
          <Card>
            <Body>Kafa Terrace Hotel</Body>
            <Muted>Fictional provider. Current demo status: {moderation.providerStatus.replace('-', ' ')}.</Muted>
            <View style={styles.actions}>
              <PrimaryButton label="Mark demo verified" onPress={() => setProviderVerification('verified-demo')} />
              <SecondaryButton label="Needs changes" onPress={() => setProviderVerification('needs-changes')} />
            </View>
          </Card>
          <Card>
            <Body>Sample activity</Body>
            {moderation.events.map((event) => (
              <View key={event.id} style={styles.event}>
                <Muted>{timeLabel(event.at)}</Muted>
                <Body>{event.text}</Body>
              </View>
            ))}
          </Card>
          <Muted>Demo profiles in this story: a guest, a provider, and a reviewer. No real personal data is shown.</Muted>
        </View>
      ) : null}
    </Screen>
  );
}

/**
 * The review workflow backed by Supabase.
 *
 * Deciding a submission is intentionally allowed to fail here. A reviewer can
 * only write food_reviews for a submission an administrator assigned to them,
 * and when the database refuses, its reason is shown rather than hidden.
 */
function SubmissionReview() {
  const { status, userId, roles } = useAuth();
  const client = getSupabase();
  const [items, setItems] = useState<SubmissionSummary[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [note, setNote] = useState('');

  const load = useCallback(async () => {
    if (!client || !userId) return;
    setLoading(true);
    const result = await fetchVisibleSubmissions(client, userId);
    setLoading(false);
    if (result.ok) setItems(result.data);
    else setMessage(result.message);
  }, [client, userId]);

  useEffect(() => {
    void load();
  }, [load]);

  if (!client) {
    return (
      <Card>
        <Body>Submission review</Body>
        <Muted>Supabase is not configured in this build, so only the sample card below is available.</Muted>
      </Card>
    );
  }
  if (status !== 'signed-in' || !userId) {
    return (
      <Card>
        <Body>Submission review</Body>
        <Muted>Sign in to send a food record for review or to act on one assigned to you.</Muted>
        <PrimaryButton label="Sign in" onPress={() => go('/signin')} />
      </Card>
    );
  }

  return (
    <Card>
      <Body>Submission review</Body>
      <Muted>
        Live records from Supabase. You see your own submissions, plus any an administrator assigned to you.
        {roles.includes('institution') ? ' This account holds the institution role.' : ' This account does not hold the institution role.'}
      </Muted>
      {loading ? <Muted>Loading submissions…</Muted> : null}
      {message ? <Muted style={styles.error}>{message}</Muted> : null}
      {!loading && items.length === 0 ? <Muted>No submissions are visible to this account yet.</Muted> : null}
      {items.map((item) => (
        <View key={item.id} style={styles.event}>
          <Body>{item.name}</Body>
          <Muted>
            {item.status} · {item.mine ? 'submitted by you' : 'assigned to you for review'}
          </Muted>
          {!item.mine ? (
            <View style={styles.actions}>
              <PrimaryButton
                label="Approve"
                onPress={() => {
                  void submitReview(client, { submissionId: item.id, reviewerId: userId, status: 'approved', note }).then(
                    (result) => {
                      setMessage(result.ok ? 'Review recorded.' : result.message);
                      void load();
                    },
                  );
                }}
              />
              <SecondaryButton
                label="Request changes"
                onPress={() => {
                  void submitReview(client, { submissionId: item.id, reviewerId: userId, status: 'changes', note }).then(
                    (result) => {
                      setMessage(result.ok ? 'Review recorded.' : result.message);
                      void load();
                    },
                  );
                }}
              />
            </View>
          ) : null}
        </View>
      ))}
      <Field label="Reviewer note" value={note} onChangeText={setNote} placeholder="Optional note stored with the decision" multiline />
      <SecondaryButton
        label="Send a sample submission"
        onPress={() => {
          void createSubmission(client, {
            userId,
            name: 'Kocho serving description',
            description: 'One piece, about 120 g, served as bread.',
            note: 'Sample submission created from the Gebeta demo.',
            imagePath: null,
          }).then((result) => {
            setMessage(result.ok ? 'Submission created and waiting for assignment.' : result.message);
            void load();
          });
        }}
      />
    </Card>
  );
}

function reviewLabel(status: ReviewStatus): string {
  if (status === 'approved') return 'Approved in the demo';
  if (status === 'changes') return 'Changes requested';
  if (status === 'rejected') return 'Rejected in the demo';
  return 'Pending review';
}

function Model() {
  return (
    <View style={styles.stack}>
      <View style={styles.grid}>
        {[
          ['People', 'Discover foods, confirm a scan, and keep a private diary.'],
          ['Kitchens', 'Publish a digital menu and share it with a QR referral.'],
          ['Institutions', 'Review food records and the sources behind them.'],
          ['Platform', 'Moderate provider and catalogue status.'],
        ].map(([title, copy]) => (
          <Card key={title} style={styles.actor}>
            <Body>{title}</Body>
            <Muted>{copy}</Muted>
          </Card>
        ))}
      </View>
      <Card>
        <Body>For individuals</Body>
        <Muted>Essential discovery and basic identification are free in the product model. Optional premium can cover deeper tracking and insights. This demo does not show prices or take payment.</Muted>
      </Card>
      <Card>
        <Body>For kitchens</Body>
        <Muted>A business subscription can cover menu management, QR referrals, featured placement, campaigns, and analytics. None of those are billed here.</Muted>
      </Card>
      <Card>
        <Body>For institutions</Body>
        <Muted>Partnerships can cover food-data review, research collaboration, teaching, and approved aggregate reports. No report on this screen is a real study.</Muted>
      </Card>
    </View>
  );
}

const styles = StyleSheet.create({
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  stack: { gap: 12 },
  grid: { gap: 10 },
  actor: { gap: 4 },
  actions: { gap: 8, marginTop: 8 },
  event: { marginTop: 10, gap: 2 },
  error: { color: colors.danger },
});
