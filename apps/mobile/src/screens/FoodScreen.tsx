import { useLocalSearchParams } from 'expo-router';
import { Image, StyleSheet, View } from 'react-native';
import { BackButton, Badge, Body, Card, Disclaimer, Muted, PrimaryButton, Screen, Title } from '../components/ui';
import { IMAGE_LIMIT, NUTRITION_DISCLAIMER, getFood } from '../data/foods';
import { imageFor } from '../data/images';
import { go } from '../navigation/go';
import { colors, radius } from '../theme/tokens';
import { formatKcal } from '../utils/format';

export default function FoodScreen() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const food = getFood(typeof id === 'string' ? id : '');

  if (!food) {
    return (
      <Screen>
        <Title>Dish not found</Title>
        <Body>That record is not in the demo catalogue.</Body>
      </Screen>
    );
  }

  return (
    <Screen padded={false}>
      <View style={styles.hero}>
        <Image source={imageFor(food.imageKey)} style={styles.image} resizeMode="cover" accessibilityLabel={food.name} />
        <View style={styles.back}>
          <BackButton />
        </View>
      </View>
      <View style={styles.sheet}>
        <Badge label="Demo catalogue" />
        <Title>{food.name}</Title>
        {food.localNames.length > 1 ? <Muted>Also called {food.localNames.filter((name) => name.toLowerCase() !== food.name.toLowerCase()).join(', ')}</Muted> : null}
        <Body>{food.description}</Body>
        <View style={styles.tags}>
          {food.categories.map((category) => (
            <Badge key={category} label={category.replace('-', ' ')} tone="neutral" />
          ))}
        </View>
        <Card>
          <Muted>Illustrative energy for {food.servingBasis}</Muted>
          <Body>{formatKcal(food.nutrition.energyKcal)}</Body>
          <Muted>Protein {label(food.nutrition.proteinGrams)} · Carbs {label(food.nutrition.carbohydrateGrams)} · Fat {label(food.nutrition.fatGrams)}</Muted>
        </Card>
        <Muted>{IMAGE_LIMIT} Photos are illustrative demo art.</Muted>
        <Disclaimer>{NUTRITION_DISCLAIMER}</Disclaimer>
        <PrimaryButton label="See nutrition estimate" onPress={() => go(`/nutrition?foodId=${food.id}`)} />
      </View>
    </Screen>
  );
}

function label(value: number | null): string {
  return value == null ? 'not estimated' : `${value} g`;
}

const styles = StyleSheet.create({
  hero: { height: 280, backgroundColor: colors.primarySoft },
  image: { width: '100%', height: '100%' },
  back: { position: 'absolute', top: 12, left: 16 },
  sheet: {
    marginTop: -28,
    backgroundColor: colors.background,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    padding: 20,
    gap: 12,
  },
  tags: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
});
