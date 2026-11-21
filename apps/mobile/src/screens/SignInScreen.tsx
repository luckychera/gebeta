import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import {
  BackButton,
  Badge,
  Body,
  Card,
  Field,
  Muted,
  PrimaryButton,
  Screen,
  SecondaryButton,
  TextButton,
  Title,
} from '../components/ui';
import { replace } from '../navigation/go';
import { MIN_PASSWORD_LENGTH } from '../services/authRules';
import { useAppState } from '../state/AppState';
import { useAuth } from '../state/AuthState';
import { colors } from '../theme/tokens';

type Mode = 'signin' | 'register';

export default function SignInScreen() {
  const { status, user, busy, error, notice, setupError, signUp, signIn, signOut, resendConfirmation, clearMessages } =
    useAuth();
  const { completeWelcome } = useAppState();

  const [mode, setMode] = useState<Mode>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');

  if (setupError) {
    return (
      <Screen>
        <BackButton fallback="/" />
        <Title>Accounts are not configured</Title>
        <Body>{setupError}</Body>
        <Muted>
          Until then Gebeta runs on this device only: the catalogue is the bundled sample set and anything you save stays
          here.
        </Muted>
        <SecondaryButton
          label="Continue without an account"
          onPress={() => {
            completeWelcome();
            replace('/(tabs)');
          }}
        />
      </Screen>
    );
  }

  if (status === 'signed-in' && user) {
    return (
      <Screen>
        <BackButton fallback="/" />
        <Title>Signed in</Title>
        <Badge label="Supabase account" />
        <Body>{user.email}</Body>
        <Muted>
          Your profile and diary are stored in your Gebeta account. Row level security in the database keeps them
          readable by this account only.
        </Muted>
        {notice ? <Muted>{notice}</Muted> : null}
        {error ? <Text style={styles.error}>{error}</Text> : null}
        <PrimaryButton
          label="Continue"
          onPress={() => {
            completeWelcome();
            replace('/(tabs)');
          }}
        />
        <SecondaryButton
          label={busy ? 'Signing out…' : 'Sign out'}
          onPress={() => {
            void signOut();
          }}
        />
      </Screen>
    );
  }

  const submit = async () => {
    const done =
      mode === 'register' ? await signUp({ email, password, displayName }) : await signIn({ email, password });
    if (done && mode === 'signin') {
      completeWelcome();
      replace('/(tabs)');
    }
  };

  return (
    <Screen>
      <BackButton fallback="/" />
      <Title>{mode === 'register' ? 'Create an account' : 'Sign in'}</Title>
      <Body>
        Gebeta uses Supabase Auth. An account keeps your profile and diary with you across devices; without one the app
        still works, but everything stays on this device.
      </Body>

      <Card>
        {mode === 'register' ? (
          <>
            <Field
              label="Display name"
              value={displayName}
              onChangeText={(value) => {
                clearMessages();
                setDisplayName(value);
              }}
              placeholder="What should we call you?"
            />
            <View style={styles.gap} />
          </>
        ) : null}
        <Field
          label="Email"
          value={email}
          onChangeText={(value) => {
            clearMessages();
            setEmail(value);
          }}
          placeholder="name@example.com"
          keyboardType="email-address"
        />
        <View style={styles.gap} />
        <Field
          label="Password"
          value={password}
          onChangeText={(value) => {
            clearMessages();
            setPassword(value);
          }}
          placeholder={`At least ${MIN_PASSWORD_LENGTH} characters`}
          secureTextEntry
        />
        {error ? <Text style={styles.error}>{error}</Text> : null}
        {notice ? <Muted style={styles.notice}>{notice}</Muted> : null}
        <View style={styles.gap} />
        <PrimaryButton
          label={busy ? 'Working…' : mode === 'register' ? 'Create account' : 'Sign in'}
          disabled={busy}
          onPress={() => {
            void submit();
          }}
        />
      </Card>

      <SecondaryButton
        label={mode === 'register' ? 'I already have an account' : 'Create an account'}
        onPress={() => {
          clearMessages();
          setMode(mode === 'register' ? 'signin' : 'register');
        }}
      />

      {mode === 'signin' ? (
        <TextButton
          label="Resend the confirmation email"
          onPress={() => {
            void resendConfirmation(email);
          }}
        />
      ) : null}

      <Muted>
        New accounts need the email confirmation link from Supabase before the first sign in. Gebeta stores your email
        and display name. Health details stay optional and are asked for separately on the Profile screen.
      </Muted>

      <TextButton
        label="Continue without an account"
        onPress={() => {
          completeWelcome();
          replace('/(tabs)');
        }}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  gap: { height: 14 },
  error: { color: colors.danger, fontSize: 14, lineHeight: 20, marginTop: 10 },
  notice: { marginTop: 10 },
});
