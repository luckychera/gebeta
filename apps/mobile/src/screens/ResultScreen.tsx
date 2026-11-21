import { useEffect, useMemo, useState } from 'react';
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Badge, Body, Card, EmptyState, Field, Muted, PrimaryButton, Screen, SecondaryButton, Title } from '../components/ui';
import { FOODS, getFood } from '../data/foods';
import { imageFor } from '../data/images';
import { go } from '../navigation/go';
import { searchFoods } from '../services/catalogue';
import { useAppState } from '../state/AppState';
import { useFontsReady } from '../theme/fonts';
import { colors, fonts, radius } from '../theme/tokens';

export default function ResultScreen() {
  const ready = useFontsReady();
  const { scan } = useAppState();
  const [selectedId, setSelectedId] = useState(scan?.candidates[0]?.foodId ?? '');
  const [correcting, setCorrecting] = useState(false);
  const [query, setQuery] = useState('');
  const food = getFood(selectedId);
  const matches = useMemo(() => searchFoods(FOODS, query), [query]);
  useEffect(() => {
    setSelectedId(scan?.candidates[0]?.foodId ?? '');
    setCorrecting(false);
  }, [scan]);

  const candidate = scan?.candidates.find((item) => item.foodId === selectedId);

  if (!scan || !food) {
    return (
      <Screen>
        <EmptyState
          title="No scan yet"
          body="Choose a photo or a sample dish, then analyze it. The result stays on this device."
          action="Go to Scan"
          onAction={() => go('/(tabs)/scan')}
        />
      </Screen>
    );
  }

  const photo = scan.imageUri ? { uri: scan.imageUri } : imageFor(food.imageKey);

  return (
    <Screen>
      <View style={styles.hero}>
        <Image source={photo} style={styles.image} resizeMode="cover" accessibilityLabel="Meal being confirmed" />
      </View>
      <Badge label="Demo recognition" tone="clay" />
      <Title>{food.name}</Title>
      <Body>{scan.notice}</Body>
      <Card>
        <Muted>{candidate ? `Demo match score ${candidate.demoScore.toFixed(2)}` : 'You selected this food. No model score applies.'}</Muted>
        <Body style={styles.note}>{scan.scoreNote}</Body>
      </Card>
      <Muted>Other possible matches</Muted>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.alts}>
        {scan.candidates.map((item) => {
          const alt = getFood(item.foodId);
          if (!alt) return null;
          const selected = item.foodId === selectedId;
          return (
            <Pressable
              key={item.foodId}
              accessibilityRole="button"
              onPress={() => setSelectedId(item.foodId)}
              style={[styles.alt, selected && styles.altOn]}
            >
              <Image source={imageFor(alt.imageKey)} style={styles.altImage} />
              <Text style={[styles.altName, ready ? { fontFamily: fonts.semibold } : null]}>{alt.name}</Text>
              <Text style={styles.altScore}>{item.demoScore.toFixed(2)}</Text>
            </Pressable>
          );
        })}
      </ScrollView>
      {correcting ? (
        <Card>
          <Field label="Correct food" value={query} onChangeText={setQuery} placeholder="Search the catalogue" />
          <View style={styles.correctList}>
            {matches.map((item) => (
              <Pressable
                key={item.id}
                accessibilityRole="button"
                onPress={() => {
                  setSelectedId(item.id);
                  setCorrecting(false);
                }}
                style={styles.correctRow}
              >
                <Text style={[styles.altName, ready ? { fontFamily: fonts.semibold } : null]}>{item.name}</Text>
                <Muted>Select</Muted>
              </Pressable>
            ))}
            {matches.length === 0 ? <Muted>No catalogue food matches that search.</Muted> : null}
          </View>
        </Card>
      ) : null}
      <PrimaryButton label="Confirm Food" onPress={() => go(`/nutrition?foodId=${food.id}&photo=${scan.imageUri ? '1' : '0'}`)} />
      <SecondaryButton label={correcting ? 'Hide search' : 'Correct Food'} onPress={() => setCorrecting((value) => !value)} />
      <Muted>Confirming chooses a catalogue food. It does not prove what is in the photo.</Muted>
    </Screen>
  );
}

const styles = StyleSheet.create({
  hero: { height: 240, borderRadius: radius.xl, overflow: 'hidden', backgroundColor: colors.primarySoft },
  image: { width: '100%', height: '100%' },
  note: { marginTop: 8 },
  alts: { gap: 10 },
  alt: { width: 120, borderRadius: 16, overflow: 'hidden', borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface },
  altOn: { borderColor: colors.primary, borderWidth: 2 },
  altImage: { width: '100%', height: 78 },
  altName: { color: colors.text, fontSize: 13, paddingHorizontal: 8, paddingTop: 6 },
  altScore: { color: colors.textSecondary, fontSize: 12, paddingHorizontal: 8, paddingBottom: 8 },
  correctList: { marginTop: 12, gap: 8 },
  correctRow: { minHeight: 44, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
});
