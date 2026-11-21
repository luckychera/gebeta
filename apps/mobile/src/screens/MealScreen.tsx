import { useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Image, StyleSheet, View } from 'react-native';
import { BackButton, Body, Card, Disclaimer, EmptyState, Muted, PrimaryButton, Screen, Title } from '../components/ui';
import { NUTRITION_DISCLAIMER } from '../data/foods';
import { imageFor } from '../data/images';
import { go } from '../navigation/go';
import { useAppState } from '../state/AppState';
import { colors, radius } from '../theme/tokens';
import { timeLabel } from '../utils/dates';
import { formatKcal, formatPortion } from '../utils/format';

export default function MealScreen() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const { diary, removeDiary } = useAppState();
  const entry = diary.find((item) => item.id === id);
  const [confirm, setConfirm] = useState(false);

  if (!entry) {
    return (
      <Screen>
        <EmptyState title="Meal not found" body="It may have been removed from this device." action="Back to diary" onAction={() => go('/(tabs)/diary')} />
      </Screen>
    );
  }

  return (
    <Screen>
      <BackButton fallback="/(tabs)/diary" />
      <View style={styles.hero}>
        <Image source={imageFor(entry.imageKey)} style={styles.image} resizeMode="cover" accessibilityLabel={entry.name} />
      </View>
      <Title>{entry.name}</Title>
      <Muted>
        {timeLabel(entry.createdAt)} · {formatPortion(entry.portion)}
      </Muted>
      <Card>
        <Body>{formatKcal(entry.energyKcal)}</Body>
        <Muted>Saved snapshot · {entry.sourceLabel}</Muted>
        <Muted>Basis at the time of saving: {entry.servingBasis}</Muted>
        <Muted>Protein {text(entry.proteinGrams)} · Carbs {text(entry.carbohydrateGrams)} · Fat {text(entry.fatGrams)} · Fibre {text(entry.fibreGrams)}</Muted>
      </Card>
      <Disclaimer>{NUTRITION_DISCLAIMER}</Disclaimer>
      {confirm ? (
        <View style={styles.row}>
          <PrimaryButton
            label="Remove meal"
            tone="terracotta"
            onPress={() => {
              removeDiary(entry.id);
              go('/(tabs)/diary');
            }}
          />
        </View>
      ) : (
        <PrimaryButton label="Delete" tone="terracotta" onPress={() => setConfirm(true)} />
      )}
    </Screen>
  );
}

function text(value: number | null): string {
  return value == null ? 'not estimated' : `${value} g`;
}

const styles = StyleSheet.create({
  hero: { height: 200, borderRadius: radius.xl, overflow: 'hidden', backgroundColor: colors.primarySoft },
  image: { width: '100%', height: '100%' },
  row: { gap: 8 },
});
