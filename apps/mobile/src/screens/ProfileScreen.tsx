import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Switch, Text, View } from 'react-native';
import { Body, Card, Chip, Field, Muted, PrimaryButton, Screen, SecondaryButton, TextButton, Title } from '../components/ui';
import { ACTIVITIES, GENDERS, GOALS, PREFERENCE_OPTIONS } from '../data/options';
import { go, replace } from '../navigation/go';
import { useAppState } from '../state/AppState';
import { colors } from '../theme/tokens';
import type { Profile, ProfileGoal } from '../types';
import { emptyProfile, validateProfile } from '../utils/profile';

export default function ProfileScreen() {
  const { profile, saveProfile, storageError, resetWelcome, clearDemo } = useAppState();
  const [draft, setDraft] = useState<Profile>(profile);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saved, setSaved] = useState(false);
  const [confirmClear, setConfirmClear] = useState(false);

  useEffect(() => {
    setDraft(profile);
  }, [profile]);

  const patch = (partial: Partial<Profile>) => {
    setSaved(false);
    setDraft((current) => ({ ...current, ...partial }));
  };

  const togglePreference = (value: string) => {
    patch({
      preferences: draft.preferences.includes(value)
        ? draft.preferences.filter((item) => item !== value)
        : [...draft.preferences, value],
    });
  };

  return (
    <Screen tab>
      <Title>Profile</Title>
      <Body>Health details are optional. Nothing here is a diagnosis or a prescribed diet.</Body>
      {storageError ? <Muted>{storageError}</Muted> : null}
      <Card>
        <Field label="Display name" value={draft.displayName} onChangeText={(displayName) => patch({ displayName })} placeholder="Your name" />
      </Card>
      <Card>
        <View style={styles.consentRow}>
          <View style={styles.consentCopy}>
            <Body>Save optional details on this device</Body>
            <Muted>Age, preferences, allergies, and goals stay off until you agree. You can turn this off later.</Muted>
          </View>
          <Switch
            accessibilityLabel="Consent to save optional profile details"
            value={draft.consent}
            onValueChange={(consent) => {
              setSaved(false);
              setDraft((current) => (consent ? { ...current, consent } : { ...current, ...emptyProfile, displayName: current.displayName, consent: false }));
              setErrors({});
            }}
            trackColor={{ true: colors.secondary, false: colors.border }}
            thumbColor={colors.white}
          />
        </View>
      </Card>
      <Card style={!draft.consent ? styles.dimmed : undefined}>
        <Field
          label="Age"
          value={draft.age}
          onChangeText={(age) => patch({ age })}
          placeholder="Optional"
          keyboardType="number-pad"
          error={errors.age}
        />
        <Muted style={styles.label}>Gender</Muted>
        <View style={styles.chips}>
          {GENDERS.map((item) => (
            <Chip key={item} label={item} selected={draft.gender === item} onPress={() => draft.consent && patch({ gender: item })} />
          ))}
        </View>
        <Muted style={styles.label}>Activity</Muted>
        <View style={styles.chips}>
          {ACTIVITIES.map((item) => (
            <Chip key={item} label={item} selected={draft.activity === item} onPress={() => draft.consent && patch({ activity: item })} />
          ))}
        </View>
        <Muted style={styles.label}>Dietary preferences</Muted>
        <View style={styles.chips}>
          {PREFERENCE_OPTIONS.map((item) => (
            <Chip key={item} label={item} selected={draft.preferences.includes(item)} onPress={() => draft.consent && togglePreference(item)} />
          ))}
        </View>
        <Field
          label="Food allergies"
          value={draft.allergies}
          onChangeText={(allergies) => patch({ allergies })}
          placeholder="Optional, for a caution on matching dishes"
          multiline
        />
        <Muted style={styles.label}>Goal</Muted>
        <View style={styles.chips}>
          {GOALS.map((item) => (
            <Chip
              key={item.id}
              label={item.label}
              selected={draft.goal === item.id}
              onPress={() => draft.consent && patch({ goal: item.id as ProfileGoal })}
            />
          ))}
        </View>
        <Field
          label="Optional daily energy reference (kcal)"
          value={draft.energyReference}
          onChangeText={(energyReference) => patch({ energyReference })}
          placeholder="Leave empty if you do not want one"
          keyboardType="number-pad"
          error={errors.energyReference}
        />
        <Muted>This number is only a reference you type. Gebeta does not calculate a target for you.</Muted>
      </Card>
      {!draft.consent ? <Muted>Turn on consent to edit the optional fields.</Muted> : null}
      <PrimaryButton
        label={saved ? 'Saved on this device' : 'Save profile'}
        onPress={() => {
          const result = validateProfile(draft);
          setErrors(result.errors);
          if (Object.keys(result.errors).length > 0) return;
          saveProfile(result.profile);
          setDraft(result.profile);
          setSaved(true);
        }}
      />
      <SecondaryButton label="For food businesses" onPress={() => go('/business')} />
      <TextButton
        label="View introduction again"
        onPress={() => {
          resetWelcome();
          replace('/');
        }}
      />
      {confirmClear ? (
        <Pressable accessibilityRole="button" onPress={clearDemo}>
          <Text style={styles.danger}>Confirm clear demo data</Text>
        </Pressable>
      ) : (
        <TextButton label="Clear saved demo data" onPress={() => setConfirmClear(true)} />
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  consentRow: { flexDirection: 'row', gap: 12, alignItems: 'center' },
  consentCopy: { flex: 1, gap: 4 },
  label: { marginTop: 12, marginBottom: 8 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  dimmed: { opacity: 0.55 },
  danger: { color: colors.danger, textAlign: 'center', fontSize: 15, paddingVertical: 8 },
});
