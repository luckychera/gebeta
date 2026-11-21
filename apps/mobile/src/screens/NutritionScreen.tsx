import { useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { MealRow } from '../components/FoodCards';
import { MacroBar } from '../components/NutritionVisuals';
import { Badge, Body, Card, Disclaimer, EmptyState, Muted, PrimaryButton, Screen, SecondaryButton, Title } from '../components/ui';
import { IMAGE_LIMIT, INGREDIENT_NOTE, NUTRITION_DISCLAIMER } from '../data/foods';
import { imageFor } from '../data/images';
import { go } from '../navigation/go';
import { allergyCaution, similarFoods } from '../services/catalogue';
import { scaleNutrition } from '../services/nutrition';
import { useAppState } from '../state/AppState';
import { colors, radius } from '../theme/tokens';
import type { DiaryEntry } from '../types';
import { clampPortion, createId, formatKcal, formatPortion } from '../utils/format';

export default function NutritionScreen() {
  const params = useLocalSearchParams<{ foodId?: string; photo?: string }>();
  const foodId = typeof params.foodId === 'string' ? params.foodId : '';
  const { scan, profile, addDiary, foods, getFood, accountSource, syncError } = useAppState();
  const food = getFood(foodId);
  const [portion, setPortion] = useState(1);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setSaved(false);
  }, [portion, foodId]);

  if (!food) {
    return (
      <Screen>
        <EmptyState title="Food not found" body="That dish is not in the catalogue." action="Explore foods" onAction={() => go('/(tabs)/explore')} />
      </Screen>
    );
  }

  const scaled = scaleNutrition(food, portion);
  const showPhoto = params.photo === '1' && scan?.imageUri;
  const caution = allergyCaution(food, profile.allergies, profile.consent);
  const similar = similarFoods(foods, food.id);

  const save = async () => {
    const entry: DiaryEntry = {
      id: createId('meal'),
      foodId: food.id,
      name: food.name,
      portion,
      servingBasis: food.servingBasis,
      ...scaled,
      imageKey: food.imageKey,
      createdAt: new Date().toISOString(),
      sourceLabel: food.nutritionSource,
    };
    setSaved(true);
    await addDiary(entry);
    go('/(tabs)/diary');
  };

  return (
    <Screen>
      <View style={styles.hero}>
        <Image
          source={showPhoto ? { uri: scan?.imageUri ?? '' } : imageFor(food.imageKey)}
          style={styles.image}
          resizeMode="cover"
          accessibilityLabel={food.name}
        />
      </View>
      <Badge label="Illustrative estimate" tone="clay" />
      <Title>{food.name}</Title>
      <Body>{food.description}</Body>
      <Card>
        <Muted>Estimated energy</Muted>
        <Text style={styles.kcal}>{formatKcal(scaled.energyKcal)}</Text>
        <Muted>{formatPortion(portion)} · basis: {food.servingBasis}</Muted>
        <View style={styles.stepper}>
          <Pressable accessibilityRole="button" accessibilityLabel="Decrease portion" onPress={() => setPortion((value) => clampPortion(value - 0.5))} style={styles.step}>
            <Text style={styles.stepText}>−</Text>
          </Pressable>
          <Text style={styles.portion}>{formatPortion(portion)}</Text>
          <Pressable accessibilityRole="button" accessibilityLabel="Increase portion" onPress={() => setPortion((value) => clampPortion(value + 0.5))} style={styles.step}>
            <Text style={styles.stepText}>+</Text>
          </Pressable>
        </View>
        <Muted>Change portion. Numbers scale linearly from the illustrative per-serving estimate. This is not a weighed portion.</Muted>
      </Card>
      <Card>
        <Body>Nutritional breakdown</Body>
        <View style={styles.gap} />
        <MacroBar label="Protein" grams={scaled.proteinGrams} max={40} color={colors.primary} />
        <MacroBar label="Carbohydrates" grams={scaled.carbohydrateGrams} max={70} color={colors.accent} />
        <MacroBar label="Fat" grams={scaled.fatGrams} max={40} color="#C9853A" />
        <MacroBar label="Fibre" grams={scaled.fibreGrams} max={15} color={colors.secondary} />
        <Muted>Bar length is a visual scale for one meal on this screen, not a daily target.</Muted>
      </Card>
      <Card>
        <Body>Often includes</Body>
        <Muted style={styles.gapTop}>{INGREDIENT_NOTE}</Muted>
        {food.ingredients.map((item) => (
          <Text key={item} style={styles.ingredient}>
            · {item}
          </Text>
        ))}
        {food.dietaryNotes.map((note) => (
          <Muted key={note} style={styles.gapTop}>
            {note}
          </Muted>
        ))}
      </Card>
      {caution ? (
        <Card>
          <Body>Check this ingredient note</Body>
          <Muted style={styles.gapTop}>{caution}</Muted>
        </Card>
      ) : null}
      <Card>
        <Muted>Source</Muted>
        <Body>{food.nutritionSource}</Body>
        <Muted style={styles.gapTop}>
          Status: {food.verificationStatus === 'institution-reviewed' ? 'institution reviewed' : 'illustrative estimate'}
        </Muted>
        <Muted style={styles.gapTop}>{food.assumptions}</Muted>
        <Muted style={styles.gapTop}>{IMAGE_LIMIT}</Muted>
      </Card>
      <Disclaimer>{NUTRITION_DISCLAIMER}</Disclaimer>
      {syncError ? <Muted>{syncError}</Muted> : null}
      <PrimaryButton
        label={saved ? 'Saved' : accountSource === 'supabase' ? 'Save to my account' : 'Save to Diary'}
        onPress={() => {
          void save();
        }}
        disabled={saved}
      />
      <SecondaryButton label="Explore Similar Foods" onPress={() => go('/(tabs)/explore')} />
      <View style={styles.list}>
        {similar.map((item) => (
          <MealRow
            key={item.id}
            title={item.name}
            subtitle={item.description}
            meta={formatKcal(item.nutrition.energyKcal)}
            imageKey={item.imageKey}
            onPress={() => go(`/food/${item.id}`)}
          />
        ))}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  hero: { height: 220, borderRadius: radius.xl, overflow: 'hidden', backgroundColor: colors.primarySoft },
  image: { width: '100%', height: '100%' },
  kcal: { color: colors.text, fontSize: 40, fontWeight: '700', marginVertical: 4 },
  stepper: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginVertical: 12 },
  step: { width: 48, height: 48, borderRadius: 24, backgroundColor: colors.primarySoft, alignItems: 'center', justifyContent: 'center' },
  stepText: { color: colors.primary, fontSize: 26, lineHeight: 28 },
  portion: { color: colors.text, fontSize: 16, fontWeight: '700' },
  gap: { height: 12 },
  gapTop: { marginTop: 6 },
  ingredient: { color: colors.text, fontSize: 15, marginTop: 4 },
  list: { gap: 10 },
});
