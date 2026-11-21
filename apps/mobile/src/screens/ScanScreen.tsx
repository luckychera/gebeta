import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useEffect, useRef, useState } from 'react';
import { Animated, Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Badge, Body, Muted, PrimaryButton, Screen, SecondaryButton, Title } from '../components/ui';
import { FOODS } from '../data/foods';
import { imageFor } from '../data/images';
import { go } from '../navigation/go';
import { recognizeDemo } from '../services/recognition';
import { useAppState } from '../state/AppState';
import { useFontsReady } from '../theme/fonts';
import { colors, fonts, radius } from '../theme/tokens';
import type { ScanOrigin } from '../types';

export default function ScanScreen() {
  const ready = useFontsReady();
  const { setScan } = useAppState();
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [origin, setOrigin] = useState<ScanOrigin | null>(null);
  const [sampleId, setSampleId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const pulse = useRef(new Animated.Value(0.45)).current;

  useEffect(() => {
    if (!loading) return undefined;
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1, duration: 550, useNativeDriver: false }),
        Animated.timing(pulse, { toValue: 0.45, duration: 550, useNativeDriver: false }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [loading, pulse]);

  const clearImage = () => {
    setImageUri(null);
    setOrigin(null);
    setError(null);
  };

  const pick = async (source: 'camera' | 'library') => {
    setError(null);
    setSampleId(null);
    try {
      const permission =
        source === 'camera'
          ? await ImagePicker.requestCameraPermissionsAsync()
          : await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) {
        setError(
          source === 'camera'
            ? 'Camera access is off. You can choose a photo from your library or try a sample dish.'
            : 'Photo library access is off. You can use the camera or try a sample dish.',
        );
        return;
      }
      const result =
        source === 'camera'
          ? await ImagePicker.launchCameraAsync({ mediaTypes: ['images'], quality: 0.7 })
          : await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], quality: 0.7 });
      if (!result.canceled && result.assets[0]) {
        setImageUri(result.assets[0].uri);
        setOrigin(source);
      }
    } catch {
      setError('That picker could not be opened on this device. Try the other option, or use a sample dish.');
    }
  };

  const analyze = () => {
    if (!imageUri && !sampleId) return;
    setLoading(true);
    const result = recognizeDemo({ sampleFoodId: sampleId ?? undefined, imageUri });
    setTimeout(() => {
      setScan({
        ...result,
        imageUri: sampleId ? null : imageUri,
        origin: sampleId ? 'sample' : origin ?? 'library',
      });
      setLoading(false);
      go('/result');
    }, 700);
  };

  const preview = sampleId ? imageFor(FOODS.find((food) => food.id === sampleId)?.imageKey ?? 'hero') : imageUri ? { uri: imageUri } : null;

  return (
    <Screen tab>
      <Title>Scan</Title>
      <Body>Match a meal photo to the Gebeta demo catalogue. No recognition model is connected.</Body>
      <View style={styles.frame}>
        {preview ? (
          <Image source={preview} style={styles.preview} resizeMode="cover" accessibilityLabel="Selected meal" />
        ) : (
          <View style={styles.placeholder}>
            <Ionicons name="scan-outline" size={42} color={colors.primary} />
            <Muted style={styles.center}>Your meal photo will appear here.</Muted>
          </View>
        )}
        {loading ? (
          <Animated.View style={[styles.loading, { opacity: pulse }]}>
            <Text style={[styles.loadingText, ready ? { fontFamily: fonts.semibold } : null]}>Matching the demo catalogue…</Text>
          </Animated.View>
        ) : null}
      </View>
      {error ? <Text style={styles.error}>{error}</Text> : null}
      <View style={styles.row}>
        <Pressable accessibilityRole="button" onPress={() => pick('camera')} style={styles.tool}>
          <Ionicons name="camera-outline" size={20} color={colors.primary} />
          <Text style={styles.toolText}>Camera</Text>
        </Pressable>
        <Pressable accessibilityRole="button" onPress={() => pick('library')} style={styles.tool}>
          <Ionicons name="images-outline" size={20} color={colors.primary} />
          <Text style={styles.toolText}>Library</Text>
        </Pressable>
      </View>
      {preview ? <SecondaryButton label="Remove photo" onPress={clearImage} /> : null}
      <View>
        <Muted style={styles.sampleLabel}>Or try a sample dish</Muted>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.samples}>
          {FOODS.map((food) => (
            <Pressable
              key={food.id}
              accessibilityRole="button"
              onPress={() => {
                setSampleId(food.id);
                setImageUri(null);
                setOrigin('sample');
                setError(null);
              }}
              style={[styles.sample, sampleId === food.id && styles.sampleOn]}
            >
              <Image source={imageFor(food.imageKey)} style={styles.sampleImage} />
              <Text style={styles.sampleName}>{food.name}</Text>
            </Pressable>
          ))}
        </ScrollView>
      </View>
      {sampleId ? <Badge label="Sample dish selected" tone="clay" /> : null}
      <PrimaryButton label="Analyze Food" tone="terracotta" disabled={!preview || loading} onPress={analyze} />
      <Muted>Analysis uses the local catalogue. It will not claim a model looked at the photo.</Muted>
    </Screen>
  );
}

const styles = StyleSheet.create({
  frame: {
    height: 280,
    borderRadius: radius.xl,
    overflow: 'hidden',
    backgroundColor: colors.primarySoft,
    borderWidth: 1,
    borderColor: colors.border,
  },
  preview: { width: '100%', height: '100%' },
  placeholder: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 8, padding: 24 },
  center: { textAlign: 'center' },
  loading: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(32,43,37,0.55)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: { color: colors.white, fontSize: 16 },
  error: { color: colors.danger, fontSize: 14, lineHeight: 20 },
  row: { flexDirection: 'row', gap: 10 },
  tool: {
    flex: 1,
    minHeight: 52,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  toolText: { color: colors.text, fontSize: 15, fontWeight: '600' },
  sampleLabel: { marginBottom: 8 },
  samples: { gap: 8 },
  sample: { width: 92, borderRadius: 14, overflow: 'hidden', borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface },
  sampleOn: { borderColor: colors.accent, borderWidth: 2 },
  sampleImage: { width: '100%', height: 64 },
  sampleName: { fontSize: 11, color: colors.text, padding: 6 },
});
