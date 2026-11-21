import { Fraunces_600SemiBold, Fraunces_700Bold } from '@expo-google-fonts/fraunces';
import { Manrope_400Regular, Manrope_500Medium, Manrope_600SemiBold, Manrope_700Bold } from '@expo-google-fonts/manrope';
import { Stack } from 'expo-router';
import { useFonts } from 'expo-font';
import { StatusBar } from 'expo-status-bar';
import { Platform, StyleSheet, View, useWindowDimensions } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AppStateProvider } from '../src/state/AppState';
import { FontsProvider } from '../src/theme/fonts';
import { colors } from '../src/theme/tokens';

export default function RootLayout() {
  const { width } = useWindowDimensions();
  const framed = Platform.OS === 'web' && width >= 900;
  const [loaded, error] = useFonts({
    Fraunces_600SemiBold,
    Fraunces_700Bold,
    Manrope_400Regular,
    Manrope_500Medium,
    Manrope_600SemiBold,
    Manrope_700Bold,
  });

  return (
    <SafeAreaProvider>
      <FontsProvider ready={loaded && !error}>
        <AppStateProvider>
          <StatusBar style="dark" />
          <View style={[styles.shell, framed && styles.shellFramed]}>
            <View style={[styles.device, framed && styles.deviceFramed]}>
              <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.background } }} />
            </View>
          </View>
        </AppStateProvider>
      </FontsProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  shell: {
    flex: 1,
    backgroundColor: Platform.OS === 'web' ? colors.shell : colors.background,
    alignItems: 'center',
  },
  shellFramed: {
    justifyContent: 'center',
    paddingVertical: 24,
  },
  device: {
    flex: 1,
    width: '100%',
    maxWidth: Platform.OS === 'web' ? 480 : undefined,
    backgroundColor: colors.background,
  },
  deviceFramed: {
    maxHeight: 900,
    borderRadius: 28,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: '#202B25',
    shadowOpacity: 0.12,
    shadowRadius: 28,
    shadowOffset: { width: 0, height: 12 },
  },
});
