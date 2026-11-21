import { useEffect, useMemo, useState } from 'react';
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Badge, Body, Card, EmptyState, Field, Muted, PrimaryButton, Screen, SecondaryButton, Title } from '../components/ui';
import { imageFor } from '../data/images';
import { go } from '../navigation/go';
import { searchFoods } from '../services/catalogue';
import { useAppState } from '../state/AppState';
import { useFontsReady } from '../theme/fonts';
import { colors, fonts, radius } from '../theme/tokens';

export default function ResultScreen() {
  const ready = useFontsReady();
  const { scan, foods, getFood } = useAppState();
  const firstMatch = scan?.candidates.find((item) => item.foodId !== null)?.foodId ?? '';
  const [selectedId, setSelectedId] = useState(firstMatch);
  const [correcting, setCorrecting] = useState(false);
  const [query, setQuery] = useState('');
  const food = getFood(selectedId);
  const matches = useMemo(() => searchFoods(foods, query), [foods, query]);

  useEffect(() => {
    setSelectedId(scan?.candidates.find((item) => item.foodId !== null)?.foodId ?? '');
    setCorrecting(scan?.status === 'no_match');
  }, [scan]);

  if (!scan) {
    return (
      <Screen>
        <EmptyState
          title="No scan yet"
          body="Choose a photo or a sample dish, then analyze it."
          action="Go to Scan"
          onAction={() => go('/(tabs)/scan')}
        />
      </Screen>
    );
  }

  const candidate = scan.candidates.find((item) => item.foodId === selectedId);
  const photo = scan.imageUri ? { uri: scan.imageUri } : food ? imageFor(food.imageKey) : imageFor('hero');
  const sourceLabel = scan.isDemo ? 'Demo fallback · no AI' : `Gemini${scan.model ? ` · ${scan.model}` : ''}`;

  return (
    <Screen>
      <View style={styles.hero}>
        <Image source={photo} style={styles.image} resizeMode="cover" accessibilityLabel="Meal being confirmed" />
      </View>

      <Badge label={sourceLabel} tone={scan.isDemo ? 'clay' : 'green'} />
      <Title>{food ? food.name : 'Not identified'}</Title>
      <Body>{scan.notice}</Body>

      {scan.status === 'no_match' ? (
        <Card>
          <Body>No catalogue match</Body>
          <Muted style={styles.note}>
            {scan.candidates.length > 0
              ? `The model suggested ${scan.candidates.map((item) => item.label).join(', ')}. None of those is in the Gebeta catalogue yet, so nothing can be opened or saved from this result.`
              : 'Nothing could be suggested for this photo.'}
          </Muted>
        </Card>
      ) : null}

      {scan.candidates.length > 0 ? (
        <Card>
          <Muted>
            {candidate?.confidence != null
              ? `Model confidence ${candidate.confidence.toFixed(2)}`
              : food
                ? 'No confidence score applies to this choice.'
                : 'Pick a dish below, or search the catalogue.'}
          </Muted>
          {scan.scoreNote ? <Body style={styles.note}>{scan.scoreNote}</Body> : null}
          {candidate?.explanation ? <Muted style={styles.note}>{candidate.explanation}</Muted> : null}
        </Card>
      ) : null}

      {scan.candidates.length > 0 ? (
        <>
          <Muted>Candidates</Muted>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.alts}>
            {scan.candidates.map((item, index) => {
              const alt = item.foodId ? getFood(item.foodId) : undefined;
              const selected = item.foodId !== null && item.foodId === selectedId;
              return (
                <Pressable
                  key={`${item.label}-${index}`}
                  accessibilityRole="button"
                  disabled={!alt}
                  onPress={() => item.foodId && setSelectedId(item.foodId)}
                  style={[styles.alt, selected && styles.altOn, !alt && styles.altOff]}
                >
                  {alt ? <Image source={imageFor(alt.imageKey)} style={styles.altImage} /> : <View style={styles.altBlank} />}
                  <Text style={[styles.altName, ready ? { fontFamily: fonts.semibold } : null]}>{item.label}</Text>
                  <Text style={styles.altScore}>
                    {alt ? (item.confidence != null ? item.confidence.toFixed(2) : 'no score') : 'not in catalogue'}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>
        </>
      ) : null}

      {correcting ? (
        <Card>
          <Field label="Find the right food" value={query} onChangeText={setQuery} placeholder="Search the catalogue" />
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

      <PrimaryButton
        label="Confirm Food"
        disabled={!food}
        onPress={() => food && go(`/nutrition?foodId=${food.id}&photo=${scan.imageUri ? '1' : '0'}`)}
      />
      <SecondaryButton label={correcting ? 'Hide search' : 'Correct Food'} onPress={() => setCorrecting((value) => !value)} />
      <Muted>
        Confirming chooses a catalogue food and its stored estimate. It does not prove what is in the photo, and it is
        not a reading of ingredients, oil, allergens, or portion weight.
      </Muted>
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
  altOff: { opacity: 0.6 },
  altImage: { width: '100%', height: 78 },
  altBlank: { width: '100%', height: 78, backgroundColor: colors.primarySoft },
  altName: { color: colors.text, fontSize: 13, paddingHorizontal: 8, paddingTop: 6 },
  altScore: { color: colors.textSecondary, fontSize: 12, paddingHorizontal: 8, paddingBottom: 8 },
  correctList: { marginTop: 12, gap: 8 },
  correctRow: { minHeight: 44, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
});
