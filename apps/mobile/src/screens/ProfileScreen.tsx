import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Switch, Text, View } from 'react-native';
import { Body, Card, Chip, Field, Muted, PrimaryButton, Screen, SecondaryButton, TextButton, Title } from '../components/ui';
import { ACTIVITIES, GENDERS, HEALTH_CONTEXT, LIFE_STAGES, PREFERENCE_OPTIONS, goalOptions } from '../data/options';
import { go, replace } from '../navigation/go';
import { useAppState } from '../state/AppState';
import { colors } from '../theme/tokens';
import type { LifeStage, Profile, ProfileGoal } from '../types';
import { emptyProfile, toggleValue, validateProfile } from '../utils/profile';

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

  const patchConsented = (partial: Partial<Profile>) => {
    setSaved(false);
    setDraft((current) => (current.consent ? { ...current, ...partial } : current));
  };

  const toggleList = (key: 'preferences' | 'healthContext', value: string) => {
    setSaved(false);
    setDraft((current) => (current.consent ? { ...current, [key]: toggleValue(current[key], value) } : current));
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
            <Muted>
              Age, gender, activity, dietary preferences, allergies, a weight or eating goal, a pregnancy or breastfeeding note, and a
              diabetes or blood pressure note stay off until you agree. Nothing leaves this device, and you can turn this off later to
              erase them.
            </Muted>
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
          onChangeText={(age) => patchConsented({ age })}
          placeholder="Optional"
          keyboardType="number-pad"
          error={errors.age}
        />
        <Muted style={styles.label}>Gender</Muted>
        <View style={styles.chips}>
          {GENDERS.map((item) => (
            <Chip key={item} label={item} selected={draft.gender === item} onPress={() => patchConsented({ gender: item })} />
          ))}
        </View>
        <Muted style={styles.label}>Activity</Muted>
        <View style={styles.chips}>
          {ACTIVITIES.map((item) => (
            <Chip key={item} label={item} selected={draft.activity === item} onPress={() => patchConsented({ activity: item })} />
          ))}
        </View>
        <Muted style={styles.label}>Pregnancy or breastfeeding</Muted>
        <View style={styles.chips}>
          {LIFE_STAGES.map((item) => (
            <Chip
              key={item.label}
              label={item.label}
              selected={draft.lifeStage === item.id}
              onPress={() => patchConsented({ lifeStage: item.id as LifeStage })}
            />
          ))}
        </View>
        <Muted style={styles.label}>Health context</Muted>
        <View style={styles.chips}>
          {HEALTH_CONTEXT.map((item) => (
            <Chip
              key={item}
              label={item}
              selected={draft.healthContext.includes(item)}
              onPress={() => toggleList('healthContext', item)}
            />
          ))}
        </View>
        <Muted>These notes are context only. Gebeta does not diagnose or treat diabetes, blood pressure, pregnancy, or any other condition.</Muted>
        <Muted style={styles.label}>Dietary preferences</Muted>
        <View style={styles.chips}>
          {PREFERENCE_OPTIONS.map((item) => (
            <Chip key={item} label={item} selected={draft.preferences.includes(item)} onPress={() => toggleList('preferences', item)} />
          ))}
        </View>
        <Field
          label="Food allergies"
          value={draft.allergies}
          onChangeText={(allergies) => patchConsented({ allergies })}
          placeholder="Optional, for a caution on matching dishes"
          multiline
        />
        <Muted style={styles.label}>Goal</Muted>
        <View style={styles.chips}>
          {goalOptions(draft.goal).map((item) => (
            <Chip
              key={item.id}
              label={item.label}
              selected={draft.goal === item.id}
              onPress={() => patchConsented({ goal: item.id as ProfileGoal })}
            />
          ))}
        </View>
        <Muted>A goal is saved as context. Gebeta does not rank or restrict dishes to change your weight.</Muted>
        <Field
          label="Optional daily energy reference (kcal)"
          value={draft.energyReference}
          onChangeText={(energyReference) => patchConsented({ energyReference })}
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
