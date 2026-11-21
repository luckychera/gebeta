import { Ionicons } from '@expo/vector-icons';
import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { MealRow } from '../components/FoodCards';
import { Body, EmptyState, Flash, Muted, Screen, Title } from '../components/ui';
import { go } from '../navigation/go';
import { useAppState } from '../state/AppState';
import { colors } from '../theme/tokens';
import { diaryDayKey, diaryDayLabel, timeLabel } from '../utils/dates';
import { formatKcal, formatPortion } from '../utils/format';

export default function DiaryScreen() {
  const { diary, removeDiary, flash, clearFlash, storageError, accountSource, accountLoading, syncError } =
    useAppState();
  const [pendingId, setPendingId] = useState<string | null>(null);
  const groups = useMemo(() => {
    const map = new Map<string, typeof diary>();
    [...diary]
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
      .forEach((entry) => {
        const key = diaryDayKey(entry.createdAt);
        map.set(key, [...(map.get(key) ?? []), entry]);
      });
    return [...map.entries()];
  }, [diary]);

  return (
    <Screen tab>
      <Title>Diary</Title>
      <Body>
        {accountSource === 'supabase'
          ? 'Meals you confirm and save are stored in your Gebeta account. Only you can read them.'
          : 'Meals you confirm and save stay on this device. Sign in to keep them in a Gebeta account instead.'}
      </Body>
      {accountLoading ? <Muted>Loading your diary…</Muted> : null}
      {storageError ? <Muted>{storageError}</Muted> : null}
      {syncError ? <Muted>{syncError}</Muted> : null}
      {flash ? <Flash message={flash} onClose={clearFlash} /> : null}
      {diary.length === 0 ? (
        <EmptyState
          title="Your diary is empty"
          body="Confirm a food from a scan or the catalogue, then save the illustrative estimate."
          action="Scan a meal"
          onAction={() => go('/(tabs)/scan')}
        />
      ) : (
        groups.map(([key, entries]) => (
          <View key={key} style={styles.group}>
            <Muted>{diaryDayLabel(key)}</Muted>
            {entries.map((entry) => (
              <View key={entry.id} style={styles.block}>
                <MealRow
                  title={entry.name}
                  subtitle={`${formatPortion(entry.portion)} · ${timeLabel(entry.createdAt)} · illustrative`}
                  meta={formatKcal(entry.energyKcal)}
                  imageKey={entry.imageKey}
                  onPress={() => go(`/meal/${entry.id}`)}
                  trailing={
                    <Pressable accessibilityRole="button" accessibilityLabel={`Delete ${entry.name}`} onPress={() => setPendingId(entry.id)} hitSlop={8}>
                      <Ionicons name="trash-outline" size={18} color={colors.danger} />
                    </Pressable>
                  }
                />
                {pendingId === entry.id ? (
                  <View style={styles.confirm}>
                    <Muted>Remove this meal?</Muted>
                    <Pressable accessibilityRole="button" onPress={() => { void removeDiary(entry.id); setPendingId(null); }}>
                      <Muted style={styles.remove}>Remove</Muted>
                    </Pressable>
                    <Pressable accessibilityRole="button" onPress={() => setPendingId(null)}>
                      <Muted>Cancel</Muted>
                    </Pressable>
                  </View>
                ) : null}
              </View>
            ))}
          </View>
        ))
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  group: { gap: 8 },
  block: { gap: 6 },
  confirm: { flexDirection: 'row', alignItems: 'center', gap: 14, paddingHorizontal: 8 },
  remove: { color: colors.danger },
});
