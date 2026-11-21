import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { imageFor } from '../data/images';
import type { FoodRecord } from '../types';
import { formatKcal } from '../utils/format';
import { useFontsReady } from '../theme/fonts';
import { colors, fonts, radius, shadow } from '../theme/tokens';

export function FeatureCard({ food, onPress }: { food: FoodRecord; onPress: () => void }) {
  const ready = useFontsReady();
  const name = ready ? { fontFamily: fonts.bold } : null;
  const meta = ready ? { fontFamily: fonts.medium } : null;
  return (
    <Pressable accessibilityRole="button" accessibilityLabel={food.name} onPress={onPress} style={styles.feature}>
      <Image source={imageFor(food.imageKey)} style={styles.featureImage} resizeMode="cover" />
      <Text style={[styles.featureName, name]} numberOfLines={1}>
        {food.name}
      </Text>
      <Text style={[styles.featureMeta, meta]}>Illustrative · {formatKcal(food.nutrition.energyKcal)}</Text>
    </Pressable>
  );
}

export function MealRow({
  title,
  subtitle,
  meta,
  imageKey,
  onPress,
  trailing,
}: {
  title: string;
  subtitle: string;
  meta: string;
  imageKey: string;
  onPress?: () => void;
  trailing?: React.ReactNode;
}) {
  const ready = useFontsReady();
  const name = ready ? { fontFamily: fonts.bold } : null;
  const body = ready ? { fontFamily: fonts.medium } : null;
  const content = (
    <>
      <Image source={imageFor(imageKey)} style={styles.thumb} resizeMode="cover" accessibilityLabel={title} />
      <View style={styles.copy}>
        <Text style={[styles.rowTitle, name]} numberOfLines={1}>
          {title}
        </Text>
        <Text style={[styles.rowSub, body]} numberOfLines={2}>
          {subtitle}
        </Text>
      </View>
      <View style={styles.end}>
        <Text style={[styles.meta, name]}>{meta}</Text>
        {trailing}
      </View>
    </>
  );
  if (!onPress) return <View style={styles.row}>{content}</View>;
  return (
    <Pressable accessibilityRole="button" onPress={onPress} style={styles.row}>
      {content}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  feature: {
    width: 168,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: 8,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadow,
  },
  featureImage: { width: '100%', height: 112, borderRadius: radius.md, backgroundColor: colors.primarySoft },
  featureName: { color: colors.text, fontSize: 15, marginTop: 8, marginHorizontal: 4 },
  featureMeta: { color: colors.textSecondary, fontSize: 12, marginHorizontal: 4, marginBottom: 6, marginTop: 2 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: 10,
    borderWidth: 1,
    borderColor: colors.border,
  },
  thumb: { width: 64, height: 64, borderRadius: 16, backgroundColor: colors.primarySoft },
  copy: { flex: 1, gap: 3 },
  rowTitle: { color: colors.text, fontSize: 15 },
  rowSub: { color: colors.textSecondary, fontSize: 12, lineHeight: 16 },
  end: { alignItems: 'flex-end', gap: 6, maxWidth: 92 },
  meta: { color: colors.primary, fontSize: 13, textAlign: 'right' },
});
