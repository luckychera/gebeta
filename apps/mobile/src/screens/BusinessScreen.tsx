import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Badge, Body, Card, Chip, Field, Muted, PrimaryButton, Screen, SecondaryButton, Title } from '../components/ui';
import { go } from '../navigation/go';
import { useAppState } from '../state/AppState';
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
          </View>
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

function reviewLabel(status: ReviewStatus): string {
  if (status === 'approved') return 'Approved in the demo';
  if (status === 'changes') return 'Changes requested';
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
});
