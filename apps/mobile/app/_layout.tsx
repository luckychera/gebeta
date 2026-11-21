import { Fraunces_600SemiBold, Fraunces_700Bold } from '@expo-google-fonts/fraunces';
import { Manrope_400Regular, Manrope_500Medium, Manrope_600SemiBold, Manrope_700Bold } from '@expo-google-fonts/manrope';
import { Stack } from 'expo-router';
import { useFonts } from 'expo-font';
import { StatusBar } from 'expo-status-bar';
import { Platform, StyleSheet, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AppStateProvider } from '../src/state/AppState';
import { FontsProvider } from '../src/theme/fonts';
import { colors } from '../src/theme/tokens';

export default function RootLayout() {
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
          <View style={styles.shell}>
            <View style={styles.device}>
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
  device: {
    flex: 1,
    width: '100%',
    maxWidth: Platform.OS === 'web' ? 480 : undefined,
    backgroundColor: colors.background,
  },
});
