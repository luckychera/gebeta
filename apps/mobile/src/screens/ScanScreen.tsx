import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useEffect, useRef, useState } from 'react';
import { Animated, Image, Pressable, ScrollView, StyleSheet, Switch, Text, View } from 'react-native';
import { Badge, Body, Card, Muted, PrimaryButton, Screen, SecondaryButton, Title } from '../components/ui';
import { imageFor } from '../data/images';
import { go } from '../navigation/go';
import { base64ByteLength, checkImage } from '../services/imageInput';
import { recognizeDemo } from '../services/recognition';
import { recognizeWithGemini } from '../services/recognitionRemote';
import { getSupabase } from '../services/supabase/client';
import { uploadFoodImage } from '../services/supabase/repositories/images';
import { useAppState } from '../state/AppState';
import { useAuth } from '../state/AuthState';
import { useFontsReady } from '../theme/fonts';
import { colors, fonts, radius } from '../theme/tokens';
import type { ScanOrigin } from '../types';

type Picked = { uri: string; base64: string | null; mimeType: string };

export default function ScanScreen() {
  const ready = useFontsReady();
  const { setScan, foods } = useAppState();
  const { status: authStatus, userId } = useAuth();
  const client = getSupabase();

  const [picked, setPicked] = useState<Picked | null>(null);
  const [origin, setOrigin] = useState<ScanOrigin | null>(null);
  const [sampleId, setSampleId] = useState<string | null>(null);
  const [keepPhoto, setKeepPhoto] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const pulse = useRef(new Animated.Value(0.45)).current;

  const aiReady = client !== null && authStatus === 'signed-in' && userId !== null;

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
    setPicked(null);
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

      const options: ImagePicker.ImagePickerOptions = { mediaTypes: ['images'], quality: 0.6, base64: true };
      const result =
        source === 'camera'
          ? await ImagePicker.launchCameraAsync(options)
          : await ImagePicker.launchImageLibraryAsync(options);

      const asset = !result.canceled ? result.assets[0] : undefined;
      if (!asset) return;

      const check = checkImage({
        mimeType: asset.mimeType ?? null,
        byteSize: asset.fileSize ?? null,
        reference: asset.uri,
      });
      if (!check.ok) {
        setError(check.reason);
        return;
      }

      // On the web the picker hands back a data URI rather than a separate
      // base64 field, so the bytes are taken from the URI instead.
      const base64 = asset.base64 ?? (asset.uri.startsWith('data:') ? (asset.uri.split(',')[1] ?? null) : null);

      if (base64) {
        const sizeCheck = checkImage({ mimeType: check.mimeType, byteSize: base64ByteLength(base64) });
        if (!sizeCheck.ok) {
          setError(sizeCheck.reason);
          return;
        }
      }

      setPicked({ uri: asset.uri, base64, mimeType: check.mimeType });
      setOrigin(source);
    } catch {
      setError('That picker could not be opened on this device. Try the other option, or use a sample dish.');
    }
  };

  const analyze = async () => {
    if (!picked && !sampleId) return;
    setLoading(true);
    setError(null);

    // A sample dish is a catalogue entry the user chose, so there is nothing
    // for a model to look at. It always takes the labelled demo path.
    if (sampleId || !picked?.base64 || !aiReady || !client) {
      const reason = sampleId
        ? undefined
        : !client
          ? 'Supabase is not configured in this build.'
          : authStatus !== 'signed-in'
            ? 'Sign in to use Gemini recognition.'
            : !picked?.base64
              ? 'This photo could not be read as image data on this platform.'
              : undefined;
      const result = recognizeDemo({ foods, sampleFoodId: sampleId ?? undefined, imageUri: picked?.uri, reason });
      setScan({ ...result, imageUri: sampleId ? null : (picked?.uri ?? null), origin: sampleId ? 'sample' : (origin ?? 'library') });
      setLoading(false);
      go('/result');
      return;
    }

    const knownSlugs = new Set(foods.map((food) => food.id));
    const outcome = await recognizeWithGemini({
      client,
      imageBase64: picked.base64,
      mimeType: picked.mimeType,
      knownSlugs,
    });

    if (keepPhoto && userId) {
      const uploaded = await uploadFoodImage(client, { userId, base64: picked.base64, mimeType: picked.mimeType });
      if (!uploaded.ok) setError(uploaded.message);
    }

    if (!outcome.ok || outcome.result.status === 'unavailable') {
      const reason = outcome.ok ? outcome.result.notice : outcome.reason;
      const fallback = recognizeDemo({ foods, imageUri: picked.uri, reason });
      setScan({ ...fallback, imageUri: picked.uri, origin: origin ?? 'library' });
      setLoading(false);
      go('/result');
      return;
    }

    setScan({ ...outcome.result, imageUri: picked.uri, origin: origin ?? 'library' });
    setLoading(false);
    go('/result');
  };

  const sampleFood = sampleId ? foods.find((food) => food.id === sampleId) : undefined;
  const preview = sampleFood ? imageFor(sampleFood.imageKey) : picked ? { uri: picked.uri } : null;

  return (
    <Screen tab>
      <Title>Scan</Title>
      <Body>
        {aiReady
          ? 'Send a meal photo to Gemini through Gebeta’s server, then confirm the dish yourself.'
          : 'Match a meal photo to the Gebeta catalogue. AI recognition needs Supabase and a signed-in account.'}
      </Body>

      <Card>
        <Badge label={aiReady ? 'Gemini recognition available' : 'Demo fallback only'} tone={aiReady ? 'green' : 'clay'} />
        <Muted style={styles.cardNote}>
          {aiReady
            ? 'The photo goes to a Supabase edge function, which calls Gemini. The key stays on the server. If Gemini is unavailable or over quota, Gebeta says so and falls back to the labelled demo path.'
            : client === null
              ? 'Supabase is not configured in this build, so no model can be called. Results come from the local catalogue and are labelled as a demo.'
              : 'Sign in to use Gemini recognition. Until then results come from the local catalogue and are labelled as a demo.'}
        </Muted>
        {aiReady ? (
          <View style={styles.keepRow}>
            <View style={styles.keepCopy}>
              <Body>Keep this photo in my account</Body>
              <Muted>Off by default. The photo is sent for recognition either way, but it is only stored if you turn this on.</Muted>
            </View>
            <Switch
              accessibilityLabel="Keep this photo in my account"
              value={keepPhoto}
              onValueChange={setKeepPhoto}
              trackColor={{ true: colors.secondary, false: colors.border }}
              thumbColor={colors.white}
            />
          </View>
        ) : null}
      </Card>

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
            <Text style={[styles.loadingText, ready ? { fontFamily: fonts.semibold } : null]}>
              {aiReady && picked ? 'Asking Gemini…' : 'Matching the catalogue…'}
            </Text>
          </Animated.View>
        ) : null}
      </View>

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <View style={styles.row}>
        <Pressable accessibilityRole="button" onPress={() => void pick('camera')} style={styles.tool}>
          <Ionicons name="camera-outline" size={20} color={colors.primary} />
          <Text style={styles.toolText}>Camera</Text>
        </Pressable>
        <Pressable accessibilityRole="button" onPress={() => void pick('library')} style={styles.tool}>
          <Ionicons name="images-outline" size={20} color={colors.primary} />
          <Text style={styles.toolText}>Library</Text>
        </Pressable>
      </View>
      {preview ? <SecondaryButton label="Remove photo" onPress={clearImage} /> : null}

      <View>
        <Muted style={styles.sampleLabel}>Or try a sample dish</Muted>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.samples}>
          {foods.map((food) => (
            <Pressable
              key={food.id}
              accessibilityRole="button"
              onPress={() => {
                setSampleId(food.id);
                setPicked(null);
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
      {sampleId ? <Badge label="Sample dish selected. This always uses the demo path." tone="clay" /> : null}

      <PrimaryButton
        label={loading ? 'Working…' : 'Analyze Food'}
        tone="terracotta"
        disabled={!preview || loading}
        onPress={() => {
          void analyze();
        }}
      />
      <SecondaryButton label="Search the catalogue instead" onPress={() => go('/(tabs)/explore')} />
      <Muted>
        A photo cannot establish ingredients, cooking oil, allergens, or portion weight. Whatever comes back is a
        suggestion you confirm or correct.
      </Muted>
    </Screen>
  );
}

const styles = StyleSheet.create({
  cardNote: { marginTop: 8 },
  keepRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: 12 },
  keepCopy: { flex: 1, gap: 4 },
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
