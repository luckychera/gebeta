import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors } from '../../src/theme/tokens';

function iconColor(color: unknown): string {
  return typeof color === 'string' ? color : colors.textSecondary;
}

function ScanButton({ onPress }: { onPress?: () => void }) {
  return (
    <Pressable accessibilityRole="button" accessibilityLabel="Scan" onPress={onPress} style={styles.scanPress}>
      <View style={styles.scan}>
        <Ionicons name="scan" size={26} color={colors.white} />
      </View>
    </Pressable>
  );
}

export default function TabsLayout() {
  const insets = useSafeAreaInsets();
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textSecondary,
        tabBarLabelStyle: { fontSize: 11, marginTop: 2 },
        tabBarStyle: {
          position: 'absolute',
          height: 64 + insets.bottom,
          paddingTop: 8,
          paddingBottom: insets.bottom + 6,
          backgroundColor: colors.white,
          borderTopColor: colors.border,
          borderTopWidth: 1,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{ title: 'Home', tabBarIcon: ({ color, size }) => <Ionicons name="home" color={iconColor(color)} size={size} /> }}
      />
      <Tabs.Screen
        name="explore"
        options={{ title: 'Explore', tabBarIcon: ({ color, size }) => <Ionicons name="compass-outline" color={iconColor(color)} size={size} /> }}
      />
      <Tabs.Screen
        name="scan"
        options={{
          title: 'Scan',
          tabBarLabel: () => null,
          tabBarIcon: () => null,
          tabBarButton: (props) => <ScanButton onPress={props.onPress as (() => void) | undefined} />,
        }}
      />
      <Tabs.Screen
        name="diary"
        options={{ title: 'Diary', tabBarIcon: ({ color, size }) => <Ionicons name="book-outline" color={iconColor(color)} size={size} /> }}
      />
      <Tabs.Screen
        name="profile"
        options={{ title: 'Profile', tabBarIcon: ({ color, size }) => <Ionicons name="person-outline" color={iconColor(color)} size={size} /> }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  scanPress: { top: -18, alignItems: 'center', justifyContent: 'center' },
  scan: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 4,
    borderColor: colors.white,
    shadowColor: colors.accent,
    shadowOpacity: 0.35,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 6,
  },
});
