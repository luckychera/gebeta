import { useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Image, Pressable, StyleSheet, Switch, Text, View } from 'react-native';
import { QrMark } from '../components/QrMark';
import { BackButton, Badge, Body, Card, Disclaimer, EmptyState, Field, Muted, PrimaryButton, Screen, SecondaryButton, Title } from '../components/ui';
import { NUTRITION_DISCLAIMER, getFood } from '../data/foods';
import { foodImages } from '../data/images';
import { getProvider } from '../data/providers';
import { buildProviderLink } from '../services/links';
import { useAppState } from '../state/AppState';
import { colors, radius } from '../theme/tokens';
import { createId, formatEtb, formatKcal } from '../utils/format';
import { currentWebBase } from '../utils/webBase';

export default function ProviderScreen() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const provider = getProvider(typeof id === 'string' ? id : '');
  const { menus, toggleMenuItem, addMenuItem, updateMenuItem, moderation } = useAppState();
  const [manage, setManage] = useState(false);
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [description, setDescription] = useState('');
  const [formError, setFormError] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editPrice, setEditPrice] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editError, setEditError] = useState('');

  if (!provider) {
    return (
      <Screen>
        <EmptyState title="Provider not found" body="That demo kitchen is not in the sample list." />
      </Screen>
    );
  }

  const items = menus[provider.id] ?? [];
  const visible = manage ? items : items.filter((item) => item.published);

  const add = () => {
    const amount = Number(price);
    if (!name.trim()) {
      setFormError('Add a dish name.');
      return;
    }
    if (!Number.isFinite(amount) || amount < 0) {
      setFormError('Enter a sample price in ETB, or 0.');
      return;
    }
    addMenuItem(provider.id, {
      id: createId('menu'),
      foodId: null,
      name: name.trim(),
      description: description.trim() || 'Added in the demo.',
      priceEtb: amount,
      ingredients: [],
      published: false,
    });
    setName('');
    setPrice('');
    setDescription('');
    setFormError('');
  };

  const startEdit = (itemId: string) => {
    const item = items.find((entry) => entry.id === itemId);
    if (!item) return;
    setEditingId(itemId);
    setEditName(item.name);
    setEditPrice(String(item.priceEtb));
    setEditDescription(item.description);
    setEditError('');
  };

  const saveEdit = (itemId: string) => {
    const amount = Number(editPrice);
    if (!editName.trim()) {
      setEditError('Add a dish name.');
      return;
    }
    if (!Number.isFinite(amount) || amount < 0) {
      setEditError('Enter a sample price in ETB, or 0.');
      return;
    }
    updateMenuItem(provider.id, itemId, {
      name: editName.trim(),
      description: editDescription.trim() || 'Updated in the demo.',
      priceEtb: amount,
    });
    setEditingId(null);
    setEditError('');
  };

  const link = buildProviderLink(currentWebBase(), provider.id);

  return (
    <Screen padded={false}>
      <View style={styles.hero}>
        <Image source={foodImages.hero} style={styles.image} resizeMode="cover" />
        <View style={styles.back}>
          <BackButton fallback="/providers" />
        </View>
      </View>
      <View style={styles.sheet}>
        <View style={styles.badges}>
          <Badge label="Demo provider" tone="clay" />
          <Badge label={provider.kind} />
          {provider.id === 'kafa-terrace' ? <Badge label={moderation.providerStatus.replace('-', ' ')} tone="neutral" /> : null}
        </View>
        <Title>{provider.name}</Title>
        <Muted>{provider.city} · fictional</Muted>
        <Body>{provider.summary}</Body>
        {provider.manageable ? (
          <View style={styles.mode}>
            <Pressable accessibilityRole="button" onPress={() => setManage(false)} style={[styles.modeButton, !manage && styles.modeOn]}>
              <Text style={[styles.modeText, !manage && styles.modeTextOn]}>Guest menu</Text>
            </Pressable>
            <Pressable accessibilityRole="button" onPress={() => setManage(true)} style={[styles.modeButton, manage && styles.modeOn]}>
              <Text style={[styles.modeText, manage && styles.modeTextOn]}>Provider tools</Text>
            </Pressable>
          </View>
        ) : null}
        {visible.length === 0 ? <Muted>No published dishes yet.</Muted> : null}
        {visible.map((item) => {
          const food = item.foodId ? getFood(item.foodId) : undefined;
          return (
            <Card key={item.id}>
              <View style={styles.itemTop}>
                <Body>{item.name}</Body>
                <Muted>{formatEtb(item.priceEtb)}</Muted>
              </View>
              <Muted>{item.description}</Muted>
              <Muted>Sample menu price. {item.ingredients.length ? `Typical ingredients: ${item.ingredients.join(', ')}.` : 'Ingredients not listed.'}</Muted>
              {food ? <Muted>Linked catalogue estimate: {formatKcal(food.nutrition.energyKcal)} illustrative, {food.servingBasis}.</Muted> : <Muted>Not linked to a catalogue estimate.</Muted>}
              {!item.published ? <Badge label="Unpublished" tone="neutral" /> : null}
              {manage ? (
                <View style={styles.publish}>
                  <Muted>{item.published ? 'Visible to guests' : 'Hidden from guests'}</Muted>
                  <Switch
                    accessibilityLabel={`Publish ${item.name}`}
                    value={item.published}
                    onValueChange={() => toggleMenuItem(provider.id, item.id)}
                    trackColor={{ true: colors.secondary, false: colors.border }}
                    thumbColor={colors.white}
                  />
                </View>
              ) : null}
              {manage && editingId !== item.id ? <SecondaryButton label="Edit item" onPress={() => startEdit(item.id)} /> : null}
              {manage && editingId === item.id ? (
                <View style={styles.editor}>
                  <Field label="Name" value={editName} onChangeText={setEditName} placeholder="Dish name" />
                  <Field label="Sample price (ETB)" value={editPrice} onChangeText={setEditPrice} keyboardType="number-pad" placeholder="200" />
                  <Field label="Description" value={editDescription} onChangeText={setEditDescription} placeholder="Optional" />
                  {editError ? <Muted style={styles.error}>{editError}</Muted> : null}
                  <PrimaryButton label="Save changes" onPress={() => saveEdit(item.id)} />
                  <SecondaryButton label="Cancel" onPress={() => { setEditingId(null); setEditError(''); }} />
                </View>
              ) : null}
            </Card>
          );
        })}
        {manage ? (
          <Card>
            <Body>Add a menu item</Body>
            <Field label="Name" value={name} onChangeText={setName} placeholder="Dish name" />
            <Field label="Sample price (ETB)" value={price} onChangeText={setPrice} keyboardType="number-pad" placeholder="200" />
            <Field label="Description" value={description} onChangeText={setDescription} placeholder="Optional" />
            {formError ? <Muted style={styles.error}>{formError}</Muted> : null}
            <PrimaryButton label="Add unpublished item" onPress={add} />
          </Card>
        ) : (
          <Card style={styles.qr}>
            <Body>QR referral</Body>
            <Muted>
              {link.kind === 'web'
                ? `Encodes ${link.url}. Opening it in a browser loads this guest menu directly, with no account and no QR app required.`
                : `No public web address is configured for this build, so the code encodes the app link ${link.url}. Running the web export, or setting EXPO_PUBLIC_WEB_BASE_URL, switches it to a browser address.`}
            </Muted>
            <QrMark value={link.url} />
            <Muted>The kitchen, the menu, and the prices in this code are fictional demo data.</Muted>
          </Card>
        )}
        <Disclaimer>{NUTRITION_DISCLAIMER}</Disclaimer>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  hero: { height: 180, backgroundColor: colors.primarySoft },
  image: { width: '100%', height: '100%' },
  back: { position: 'absolute', top: 16, left: 16 },
  sheet: { marginTop: -24, backgroundColor: colors.background, borderTopLeftRadius: radius.xl, borderTopRightRadius: radius.xl, padding: 20, gap: 12 },
  badges: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  mode: { flexDirection: 'row', backgroundColor: colors.surface, borderRadius: 16, padding: 4, borderWidth: 1, borderColor: colors.border },
  modeButton: { flex: 1, minHeight: 40, alignItems: 'center', justifyContent: 'center', borderRadius: 12 },
  modeOn: { backgroundColor: colors.primary },
  modeText: { color: colors.text, fontWeight: '600' },
  modeTextOn: { color: colors.white },
  itemTop: { flexDirection: 'row', justifyContent: 'space-between', gap: 12 },
  publish: { marginTop: 8, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  error: { color: colors.danger },
  editor: { marginTop: 10, gap: 8 },
  qr: { alignItems: 'stretch', gap: 8 },
});
