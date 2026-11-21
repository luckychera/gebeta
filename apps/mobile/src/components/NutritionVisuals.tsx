import { StyleSheet, Text, View } from 'react-native';
import Svg, { Circle, G } from 'react-native-svg';
import { useFontsReady } from '../theme/fonts';
import { colors, fonts } from '../theme/tokens';

export function CalorieRing({
  value,
  goal,
  caption,
}: {
  value: number | null;
  goal: number | null;
  caption: string;
}) {
  const ready = useFontsReady();
  const size = 148;
  const stroke = 12;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = value != null && goal && goal > 0 ? Math.max(0, Math.min(value / goal, 1)) : value != null ? 1 : 0;
  const font = ready ? { fontFamily: fonts.bold } : null;
  const body = ready ? { fontFamily: fonts.medium } : null;

  return (
    <View style={styles.ringWrap}>
      <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
        <Svg width={size} height={size} style={StyleSheet.absoluteFill}>
          <G rotation={-90} origin={`${size / 2}, ${size / 2}`}>
            <Circle cx={size / 2} cy={size / 2} r={radius} stroke={colors.track} strokeWidth={stroke} fill="none" />
            <Circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              stroke={colors.primary}
              strokeWidth={stroke}
              fill="none"
              strokeDasharray={`${circumference} ${circumference}`}
              strokeDashoffset={circumference * (1 - progress)}
              strokeLinecap="round"
            />
          </G>
        </Svg>
        <Text style={[styles.kcal, font]}>{value == null ? '—' : value}</Text>
        <Text style={[styles.kcalLabel, body]}>kcal</Text>
      </View>
      <Text style={[styles.caption, body]}>{caption}</Text>
    </View>
  );
}

export function MacroBar({
  label,
  grams,
  max,
  color,
}: {
  label: string;
  grams: number | null;
  max: number;
  color: string;
}) {
  const ready = useFontsReady();
  const font = ready ? { fontFamily: fonts.semibold } : null;
  const width = grams == null ? 0 : `${Math.min(grams / max, 1) * 100}%`;
  return (
    <View style={styles.macro}>
      <View style={styles.macroTop}>
        <Text style={[styles.macroLabel, font]}>{label}</Text>
        <Text style={[styles.macroValue, font]}>{grams == null ? 'Not estimated' : `${grams} g`}</Text>
      </View>
      <View style={styles.track}>
        <View style={[styles.fill, { width, backgroundColor: color }]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  ringWrap: { alignItems: 'center', gap: 8 },
  kcal: { color: colors.text, fontSize: 32, lineHeight: 36 },
  kcalLabel: { color: colors.textSecondary, fontSize: 13 },
  caption: { color: colors.textSecondary, fontSize: 12, textAlign: 'center' },
  macro: { marginBottom: 12 },
  macroTop: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  macroLabel: { color: colors.text, fontSize: 14 },
  macroValue: { color: colors.textSecondary, fontSize: 14 },
  track: { height: 8, borderRadius: 99, backgroundColor: colors.track, overflow: 'hidden' },
  fill: { height: 8, borderRadius: 99 },
});
