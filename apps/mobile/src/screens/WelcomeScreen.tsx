import { LinearGradient } from 'expo-linear-gradient';
import { Image, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Body, LogoMark, Muted, PrimaryButton, SecondaryButton, TextButton, Wordmark } from '../components/ui';
import { foodImages } from '../data/images';
import { replace } from '../navigation/go';
import { useAppState } from '../state/AppState';
import { colors, radius } from '../theme/tokens';

export default function WelcomeScreen() {
  const insets = useSafeAreaInsets();
  const { completeWelcome } = useAppState();

  const start = (path: string) => {
    completeWelcome();
    replace(path);
  };

  return (
    <View style={[styles.page, { paddingTop: insets.top + 12, paddingBottom: insets.bottom + 16 }]}>
      <View style={styles.brandRow}>
        <LogoMark />
        <Wordmark />
      </View>
      <View style={styles.hero}>
        <Image source={foodImages.hero} style={styles.heroImage} resizeMode="cover" accessibilityLabel="Ethiopian platter" />
        <LinearGradient colors={['rgba(250,249,245,0)', 'rgba(23,107,69,0.18)']} style={StyleSheet.absoluteFill} />
      </View>
      <View style={styles.copy}>
        <Body style={styles.kicker}>ETHIOPIAN FOOD INTELLIGENCE</Body>
        <Body style={styles.headline}>Know Your Food.</Body>
        <Body style={styles.headlineGreen}>Nourish Your Life.</Body>
        <Muted>
          Gebeta helps you explore Ethiopian meals, compare a photo with the demo catalogue, and read nutrition estimates with their limits.
        </Muted>
      </View>
      <View style={styles.actions}>
        <PrimaryButton label="Get Started" withArrow onPress={() => start('/(tabs)')} />
        <SecondaryButton label="Explore Foods" onPress={() => start('/(tabs)/explore')} />
        <TextButton label="Sign In" onPress={() => replace('/signin')} />
        <Muted style={styles.note}>A food guide, not a medical service.</Muted>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: colors.background, paddingHorizontal: 20, gap: 16 },
  brandRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  hero: { flex: 1, minHeight: 220, borderRadius: radius.xl, overflow: 'hidden', backgroundColor: colors.primarySoft },
  heroImage: { width: '100%', height: '100%' },
  copy: { gap: 4 },
  kicker: { color: colors.accent, fontSize: 12, letterSpacing: 1.1, fontWeight: '700' },
  headline: { fontSize: 32, lineHeight: 38, color: colors.text, fontWeight: '700' },
  headlineGreen: { fontSize: 32, lineHeight: 38, color: colors.primary, fontWeight: '700', marginBottom: 6 },
  actions: { gap: 10 },
  note: { textAlign: 'center' },
});
