import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { ActivityIndicator, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppState } from '../state/AppState';
import { useFontsReady } from '../theme/fonts';
import { colors, fonts, radius, shadow } from '../theme/tokens';

type StyleProp = object;

function typeface(ready: boolean, family: string): { fontFamily: string } | null {
  return ready ? { fontFamily: family } : null;
}

export function LogoMark({ size = 44 }: { size?: number }) {
  return (
    <View style={[styles.logo, { width: size, height: size, borderRadius: size / 2 }]}>
      <Ionicons name="leaf" color={colors.white} size={size * 0.46} />
    </View>
  );
}

export function Wordmark({ light = false }: { light?: boolean }) {
  const ready = useFontsReady();
  return (
    <View>
      <Text style={[styles.brand, typeface(ready, fonts.display), light && styles.lightText]}>Gebeta</Text>
      <Text style={[styles.product, typeface(ready, fonts.semibold), light && styles.lightMuted]}>NutriGuider</Text>
    </View>
  );
}

export function Display({ children, style }: { children: React.ReactNode; style?: StyleProp }) {
  const ready = useFontsReady();
  return <Text style={[styles.display, typeface(ready, fonts.display), style]}>{children}</Text>;
}

export function Title({ children, style }: { children: React.ReactNode; style?: StyleProp }) {
  const ready = useFontsReady();
  return <Text style={[styles.title, typeface(ready, fonts.displaySemi), style]}>{children}</Text>;
}

export function SectionTitle({ children, action, onAction }: { children: string; action?: string; onAction?: () => void }) {
  const ready = useFontsReady();
  return (
    <View style={styles.sectionRow}>
      <Text style={[styles.section, typeface(ready, fonts.bold)]}>{children}</Text>
      {action && onAction ? (
        <Pressable accessibilityRole="button" onPress={onAction} hitSlop={8}>
          <Text style={[styles.action, typeface(ready, fonts.semibold)]}>{action}</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

export function Body({ children, style }: { children: React.ReactNode; style?: StyleProp }) {
  const ready = useFontsReady();
  return <Text style={[styles.body, typeface(ready, fonts.body), style]}>{children}</Text>;
}

export function Muted({ children, style }: { children: React.ReactNode; style?: StyleProp }) {
  const ready = useFontsReady();
  return <Text style={[styles.muted, typeface(ready, fonts.medium), style]}>{children}</Text>;
}

export function Card({ children, style }: { children: React.ReactNode; style?: StyleProp }) {
  return <View style={[styles.card, style]}>{children}</View>;
}

export function Badge({ label, tone = 'green' }: { label: string; tone?: 'green' | 'clay' | 'neutral' }) {
  const ready = useFontsReady();
  const toneStyle = tone === 'clay' ? styles.badgeClay : tone === 'neutral' ? styles.badgeNeutral : styles.badgeGreen;
  const textStyle = tone === 'clay' ? styles.badgeClayText : tone === 'neutral' ? styles.badgeNeutralText : styles.badgeGreenText;
  return (
    <View style={[styles.badge, toneStyle]}>
      <Text style={[styles.badgeText, typeface(ready, fonts.semibold), textStyle]}>{label}</Text>
    </View>
  );
}

export function PrimaryButton({
  label,
  onPress,
  tone = 'green',
  disabled = false,
  withArrow = false,
}: {
  label: string;
  onPress: () => void;
  tone?: 'green' | 'terracotta';
  disabled?: boolean;
  withArrow?: boolean;
}) {
  const ready = useFontsReady();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.primary,
        tone === 'terracotta' ? styles.primaryClay : styles.primaryGreen,
        pressed && !disabled && styles.pressed,
        disabled && styles.disabled,
        Platform.OS === 'web' ? styles.pointer : null,
      ]}
    >
      <Text style={[styles.primaryText, typeface(ready, fonts.bold)]}>{label}</Text>
      {withArrow ? (
        <View style={styles.arrowCircle}>
          <Ionicons name="arrow-forward" size={18} color={tone === 'terracotta' ? colors.accent : colors.primary} />
        </View>
      ) : null}
    </Pressable>
  );
}

export function SecondaryButton({ label, onPress }: { label: string; onPress: () => void }) {
  const ready = useFontsReady();
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [styles.secondary, pressed && styles.pressed, Platform.OS === 'web' ? styles.pointer : null]}
    >
      <Text style={[styles.secondaryText, typeface(ready, fonts.bold)]}>{label}</Text>
    </Pressable>
  );
}

export function TextButton({ label, onPress }: { label: string; onPress: () => void }) {
  const ready = useFontsReady();
  return (
    <Pressable accessibilityRole="button" onPress={onPress} hitSlop={8} style={styles.textButton}>
      <Text style={[styles.textButtonLabel, typeface(ready, fonts.semibold)]}>{label}</Text>
    </Pressable>
  );
}

export function Chip({
  label,
  selected,
  onPress,
}: {
  label: string;
  selected?: boolean;
  onPress: () => void;
}) {
  const ready = useFontsReady();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected: Boolean(selected) }}
      onPress={onPress}
      style={[styles.chip, selected && styles.chipOn]}
    >
      <Text style={[styles.chipText, typeface(ready, fonts.semibold), selected && styles.chipTextOn]}>{label}</Text>
    </Pressable>
  );
}

export function Field({
  label,
  value,
  onChangeText,
  placeholder,
  error,
  keyboardType = 'default',
  multiline = false,
}: {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  placeholder?: string;
  error?: string;
  keyboardType?: 'default' | 'number-pad';
  multiline?: boolean;
}) {
  const ready = useFontsReady();
  return (
    <View style={styles.field}>
      <Text style={[styles.fieldLabel, typeface(ready, fonts.semibold)]}>{label}</Text>
      <TextInput
        accessibilityLabel={label}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.textSecondary}
        keyboardType={keyboardType}
        multiline={multiline}
        style={[styles.input, multiline && styles.inputMulti, typeface(ready, fonts.medium), error ? styles.inputError : null]}
      />
      {error ? <Text style={[styles.error, typeface(ready, fonts.medium)]}>{error}</Text> : null}
    </View>
  );
}

export function Disclaimer({ children }: { children: string }) {
  return (
    <View style={styles.disclaimer}>
      <Ionicons name="information-circle-outline" size={18} color={colors.primary} />
      <Muted style={styles.disclaimerText}>{children}</Muted>
    </View>
  );
}

export function EmptyState({
  title,
  body,
  action,
  onAction,
}: {
  title: string;
  body: string;
  action?: string;
  onAction?: () => void;
}) {
  return (
    <Card style={styles.empty}>
      <View style={styles.emptyIcon}>
        <Ionicons name="restaurant-outline" size={28} color={colors.primary} />
      </View>
      <Title>{title}</Title>
      <Body style={styles.center}>{body}</Body>
      {action && onAction ? <PrimaryButton label={action} onPress={onAction} tone="terracotta" /> : null}
    </Card>
  );
}

export function BackButton({ fallback = '/(tabs)' }: { fallback?: string }) {
  const router = useRouter();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel="Go back"
      onPress={() => (router.canGoBack() ? router.back() : router.replace(fallback as never))}
      style={styles.back}
    >
      <Ionicons name="chevron-back" size={22} color={colors.text} />
    </Pressable>
  );
}

export function LoadingMark() {
  const ready = useFontsReady();
  return (
    <View style={styles.loading}>
      <LogoMark size={64} />
      <Text style={[styles.loadingText, typeface(ready, fonts.displaySemi)]}>Gebeta NutriGuider</Text>
      <ActivityIndicator color={colors.primary} />
    </View>
  );
}

export function Screen({
  children,
  tab = false,
  padded = true,
}: {
  children: React.ReactNode;
  tab?: boolean;
  padded?: boolean;
}) {
  const insets = useSafeAreaInsets();
  const { hydrated } = useAppState();
  if (!hydrated) return <LoadingMark />;
  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={{
        paddingTop: insets.top + 8,
        paddingBottom: tab ? 124 : insets.bottom + 28,
        paddingHorizontal: padded ? 20 : 0,
        gap: 16,
      }}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
    >
      {children}
    </ScrollView>
  );
}

export function Flash({ message, onClose }: { message: string; onClose: () => void }) {
  const ready = useFontsReady();
  return (
    <View style={styles.flash}>
      <Text style={[styles.flashText, typeface(ready, fonts.semibold)]}>{message}</Text>
      <Pressable accessibilityRole="button" onPress={onClose} hitSlop={8}>
        <Text style={[styles.action, typeface(ready, fonts.bold)]}>OK</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  logo: { backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' },
  brand: { color: colors.text, fontSize: 22, lineHeight: 26 },
  product: { color: colors.primary, fontSize: 13, letterSpacing: 0.4, marginTop: 1 },
  lightText: { color: colors.white },
  lightMuted: { color: '#E7F3EC' },
  display: { color: colors.text, fontSize: 34, lineHeight: 40 },
  title: { color: colors.text, fontSize: 26, lineHeight: 32 },
  sectionRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 },
  section: { color: colors.text, fontSize: 20 },
  action: { color: colors.primary, fontSize: 14 },
  body: { color: colors.text, fontSize: 15, lineHeight: 22 },
  muted: { color: colors.textSecondary, fontSize: 13, lineHeight: 18 },
  card: { backgroundColor: colors.surface, borderRadius: radius.lg, padding: 16, borderWidth: 1, borderColor: colors.border, ...shadow },
  badge: { alignSelf: 'flex-start', borderRadius: radius.pill, paddingHorizontal: 10, paddingVertical: 5 },
  badgeText: { fontSize: 12 },
  badgeGreen: { backgroundColor: colors.primarySoft },
  badgeGreenText: { color: colors.primaryDark },
  badgeClay: { backgroundColor: colors.accentSoft },
  badgeClayText: { color: colors.accentDark },
  badgeNeutral: { backgroundColor: '#F1F3F0' },
  badgeNeutralText: { color: colors.textSecondary },
  primary: {
    minHeight: 56,
    borderRadius: 18,
    paddingHorizontal: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  primaryGreen: { backgroundColor: colors.primary },
  primaryClay: { backgroundColor: colors.accent },
  primaryText: { color: colors.white, fontSize: 16 },
  arrowCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondary: {
    minHeight: 52,
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
  },
  secondaryText: { color: colors.primary, fontSize: 16 },
  textButton: { minHeight: 44, alignItems: 'center', justifyContent: 'center' },
  textButtonLabel: { color: colors.primary, fontSize: 15 },
  pressed: { opacity: 0.9, transform: [{ scale: 0.99 }] },
  disabled: { opacity: 0.45 },
  pointer: { cursor: 'pointer' } as object,
  chip: {
    borderRadius: radius.pill,
    paddingHorizontal: 14,
    minHeight: 40,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  chipOn: { backgroundColor: colors.primary, borderColor: colors.primary },
  chipText: { color: colors.text, fontSize: 13 },
  chipTextOn: { color: colors.white },
  field: { gap: 6 },
  fieldLabel: { color: colors.text, fontSize: 13 },
  input: {
    minHeight: 48,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    paddingHorizontal: 14,
    color: colors.text,
    fontSize: 15,
  },
  inputMulti: { minHeight: 88, paddingTop: 12, textAlignVertical: 'top' },
  inputError: { borderColor: colors.danger },
  error: { color: colors.danger, fontSize: 12 },
  disclaimer: {
    flexDirection: 'row',
    gap: 8,
    backgroundColor: colors.primarySoft,
    borderRadius: radius.md,
    padding: 12,
  },
  disclaimerText: { flex: 1 },
  empty: { alignItems: 'center', gap: 10, paddingVertical: 28 },
  emptyIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  center: { textAlign: 'center' },
  back: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadow,
  },
  loading: { flex: 1, backgroundColor: colors.background, alignItems: 'center', justifyContent: 'center', gap: 12 },
  loadingText: { color: colors.text, fontSize: 22 },
  screen: { flex: 1, backgroundColor: colors.background },
  flash: {
    backgroundColor: colors.primarySoft,
    borderRadius: radius.md,
    paddingHorizontal: 14,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  flashText: { color: colors.primaryDark, flex: 1, fontSize: 14 },
});
