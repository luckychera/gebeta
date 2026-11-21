import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { FeatureCard, MealRow } from '../components/FoodCards';
import { CalorieRing } from '../components/NutritionVisuals';
import { Badge, Body, Card, Muted, PrimaryButton, Screen, SectionTitle } from '../components/ui';
import { FOODS, getFood } from '../data/foods';
import { foodImages } from '../data/images';
import { go } from '../navigation/go';
import { recommendFoods } from '../services/catalogue';
import { sumDiary } from '../services/nutrition';
import { useAppState } from '../state/AppState';
import { useFontsReady } from '../theme/fonts';
import { colors, fonts, radius, shadow } from '../theme/tokens';
import { diaryDayKey, greeting, localDayKey } from '../utils/dates';
import { formatKcal, initials } from '../utils/format';
import { energyReferenceValue } from '../utils/profile';

const SAMPLE = [
  { foodId: 'genfo', time: 'Morning' },
  { foodId: 'doro-wot', time: 'Midday' },
  { foodId: 'shiro', time: 'Evening' },
];

export default function HomeScreen() {
  const ready = useFontsReady();
  const { profile, diary } = useAppState();
  const nameFont = ready ? { fontFamily: fonts.bold } : null;
  const bodyFont = ready ? { fontFamily: fonts.medium } : null;
  const todayKey = localDayKey(new Date());
  const today = diary.filter((entry) => diaryDayKey(entry.createdAt) === todayKey);
  const recommendations = recommendFoods(profile);
  const reason = recommendations[0]?.reason ?? '';
  const sampleFoods = SAMPLE.map((item) => ({ ...item, food: getFood(item.foodId) })).filter((item) => item.food);
  const sampleKcal = sampleFoods.reduce((sum, item) => sum + (item.food?.nutrition.energyKcal ?? 0), 0);
  const sampleMacro = (key: 'proteinGrams' | 'carbohydrateGrams' | 'fatGrams') => {
    let total = 0;
    for (const item of sampleFoods) {
      const value = item.food?.nutrition[key];
      if (value == null) return '—';
      total += value;
    }
    return `${total} g`;
  };
  const todayKcal = sumDiary(today, 'energyKcal');
  const reference = energyReferenceValue(profile);
  const showSample = diary.length === 0;

  return (
    <Screen tab>
      <View style={styles.header}>
        <View style={styles.identity}>
          <View style={styles.avatar}>
            <Text style={[styles.avatarText, nameFont]}>{initials(profile.displayName)}</Text>
          </View>
          <View>
            <Text style={[styles.greet, nameFont]}>{greeting()}</Text>
            <Muted>{profile.displayName ? profile.displayName : 'Guest on this device'}</Muted>
          </View>
        </View>
        <Pressable accessibilityRole="button" accessibilityLabel="Notices" onPress={() => go('/notices')} style={styles.bell}>
          <Ionicons name="notifications-outline" size={22} color={colors.text} />
          <View style={styles.dot} />
        </Pressable>
      </View>

      <View style={styles.hero}>
        <Image source={foodImages.hero} style={StyleSheet.absoluteFill} resizeMode="cover" />
        <LinearGradient colors={['rgba(32,43,37,0.05)', 'rgba(32,43,37,0.82)']} style={StyleSheet.absoluteFill} />
        <View style={styles.heroCopy}>
          <Text style={[styles.kicker, bodyFont]}>ON YOUR PLATE</Text>
          <Text style={[styles.heroTitle, ready ? { fontFamily: fonts.display } : null]}>Discover what's on your plate.</Text>
          <Text style={[styles.heroBody, bodyFont]}>Explore foods and meals, starting with Ethiopian and other local dishes, and understand their nutrition.</Text>
          <PrimaryButton label="Scan Your Meal" tone="terracotta" onPress={() => go('/(tabs)/scan')} />
        </View>
      </View>

      <View style={styles.actions}>
        {[
          { label: 'Scan Food', icon: 'scan-outline' as const, path: '/(tabs)/scan', tint: colors.accentSoft },
          { label: 'Explore Foods', icon: 'compass-outline' as const, path: '/(tabs)/explore', tint: colors.primarySoft },
          { label: 'My Diary', icon: 'book-outline' as const, path: '/(tabs)/diary', tint: '#F8EFE4' },
        ].map((action) => (
          <Pressable key={action.label} accessibilityRole="button" onPress={() => go(action.path)} style={styles.action}>
            <View style={[styles.actionIcon, { backgroundColor: action.tint }]}>
              <Ionicons name={action.icon} size={20} color={colors.primaryDark} />
            </View>
            <Text style={[styles.actionLabel, nameFont]}>{action.label}</Text>
          </Pressable>
        ))}
      </View>

      <View>
        <SectionTitle action="See all" onAction={() => go('/(tabs)/explore')}>
          Featured Ethiopian foods
        </SectionTitle>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.featureRow}>
          {FOODS.map((food) => (
            <FeatureCard key={food.id} food={food} onPress={() => go(`/food/${food.id}`)} />
          ))}
        </ScrollView>
      </View>

      <View>
        <SectionTitle>Recommended for you</SectionTitle>
        <Muted style={styles.reason}>{reason}</Muted>
        <View style={styles.stack}>
          {recommendations.map((item) => (
            <MealRow
              key={item.food.id}
              title={item.food.name}
              subtitle={item.food.description}
              meta={formatKcal(item.food.nutrition.energyKcal)}
              imageKey={item.food.imageKey}
              onPress={() => go(`/food/${item.food.id}`)}
            />
          ))}
        </View>
      </View>

      <View>
        <SectionTitle>Nutrition overview</SectionTitle>
        {showSample ? (
          <Card style={styles.overview}>
            <Badge label="Sample data" tone="clay" />
            <Body>Sample day, not your records. The figures use the same illustrative estimates as the catalogue.</Body>
            <CalorieRing value={sampleKcal} goal={2000} caption="2,000 kcal is a general reference for this sample view only. Not a personal target." />
            <View style={styles.macros}>
              <MacroPill label="Protein" value={sampleMacro('proteinGrams')} />
              <MacroPill label="Carbs" value={sampleMacro('carbohydrateGrams')} />
              <MacroPill label="Fat" value={sampleMacro('fatGrams')} />
            </View>
            <Muted>Sample meals: genfo, doro wot, and shiro at one illustrative serving each.</Muted>
          </Card>
        ) : today.length === 0 ? (
          <Card style={styles.overview}>
            <Body>Nothing logged today.</Body>
            <Muted>Save a confirmed meal and today's illustrative total will show here. Older meals stay in the diary.</Muted>
            <PrimaryButton label="Scan Your Meal" tone="terracotta" onPress={() => go('/(tabs)/scan')} />
          </Card>
        ) : (
          <Card style={styles.overview}>
            <Badge label="From your diary" />
            <CalorieRing
              value={todayKcal.total}
              goal={reference}
              caption={
                reference
                  ? 'Compared with the energy reference you entered. Not a medical target.'
                  : 'Illustrative total of meals you saved today. No daily target is assumed.'
              }
            />
            <View style={styles.macros}>
              <MacroPill label="Protein" value={grams(sumDiary(today, 'proteinGrams').total)} />
              <MacroPill label="Carbs" value={grams(sumDiary(today, 'carbohydrateGrams').total)} />
              <MacroPill label="Fat" value={grams(sumDiary(today, 'fatGrams').total)} />
            </View>
            {todayKcal.missing > 0 ? <Muted>Some saved meals have no energy estimate, so this total is partial.</Muted> : null}
          </Card>
        )}
      </View>

      <Pressable accessibilityRole="button" onPress={() => go('/business')} style={styles.business}>
        <View>
          <Text style={[styles.businessTitle, nameFont]}>For food businesses</Text>
          <Muted>Menus, QR referrals, and the wider Gebeta model.</Muted>
        </View>
        <Ionicons name="arrow-forward" size={20} color={colors.accent} />
      </Pressable>
    </Screen>
  );
}

function grams(value: number | null): string {
  return value == null ? '—' : `${value} g`;
}

function MacroPill({ label, value }: { label: string; value: string }) {
  const ready = useFontsReady();
  return (
    <View style={styles.pill}>
      <Text style={[styles.pillLabel, ready ? { fontFamily: fonts.medium } : null]}>{label}</Text>
      <Text style={[styles.pillValue, ready ? { fontFamily: fonts.bold } : null]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  identity: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  avatar: { width: 48, height: 48, borderRadius: 24, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' },
  avatarText: { color: colors.white, fontSize: 16 },
  greet: { color: colors.text, fontSize: 20 },
  bell: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  dot: { position: 'absolute', top: 10, right: 12, width: 8, height: 8, borderRadius: 4, backgroundColor: colors.accent },
  hero: { borderRadius: radius.xl, overflow: 'hidden', minHeight: 280, justifyContent: 'flex-end' },
  heroCopy: { padding: 18, gap: 8 },
  kicker: { color: '#F6D7C4', fontSize: 12, letterSpacing: 1 },
  heroTitle: { color: colors.white, fontSize: 30, lineHeight: 36 },
  heroBody: { color: '#F4F7F4', fontSize: 14, lineHeight: 20, marginBottom: 6 },
  actions: { flexDirection: 'row', gap: 10 },
  action: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: 12,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 8,
    ...shadow,
  },
  actionIcon: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  actionLabel: { color: colors.text, fontSize: 13 },
  featureRow: { gap: 12, paddingRight: 8 },
  reason: { marginBottom: 10 },
  stack: { gap: 10 },
  overview: { gap: 12, alignItems: 'stretch' },
  macros: { flexDirection: 'row', gap: 8 },
  pill: { flex: 1, backgroundColor: colors.background, borderRadius: radius.md, padding: 10 },
  pillLabel: { color: colors.textSecondary, fontSize: 12 },
  pillValue: { color: colors.text, fontSize: 16, marginTop: 2 },
  business: {
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: '#F3D2BC',
    backgroundColor: '#FFF8F3',
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  businessTitle: { color: colors.text, fontSize: 16, marginBottom: 2 },
});
