import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { BackButton, Body, Card, Field, Muted, PrimaryButton, Screen, Title } from '../components/ui';
import { replace } from '../navigation/go';
import { useAppState } from '../state/AppState';

export default function SignInScreen() {
  const { profile, saveProfile, completeWelcome } = useAppState();
  const [name, setName] = useState(profile.displayName);

  return (
    <Screen>
      <BackButton fallback="/" />
      <Title>Sign in</Title>
      <Body>This demo does not connect to Supabase Auth. Your display name stays on this device only.</Body>
      <Card>
        <Field label="Display name" value={name} onChangeText={setName} placeholder="What should we call you?" />
        <View style={styles.gap} />
        <PrimaryButton
          label="Continue"
          onPress={() => {
            saveProfile({ ...profile, displayName: name.trim().slice(0, 40) });
            completeWelcome();
            replace('/(tabs)');
          }}
        />
      </Card>
      <Muted>No password is collected. This is not an account.</Muted>
    </Screen>
  );
}

const styles = StyleSheet.create({
  gap: { height: 14 },
});
