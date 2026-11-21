import { Pressable, StyleSheet, View } from 'react-native';
import { Badge, Body, Card, Muted, Screen, Title } from '../components/ui';
import { go } from '../navigation/go';
import { useAppState } from '../state/AppState';
import { colors } from '../theme/tokens';

export default function ProvidersScreen() {
  const { providers, catalogueLoading, catalogueSource } = useAppState();

  return (
    <Screen>
      <Title>Food businesses</Title>
      <Body>Fictional kitchens for the demonstration. They are not partners of Gebeta.</Body>
      <Muted>
        {catalogueSource === 'supabase'
          ? 'Published listings read from Supabase.'
          : 'Listings bundled with this app.'}
      </Muted>
      {catalogueLoading && providers.length === 0 ? <Muted>Loading listings…</Muted> : null}
      {providers.map((provider) => (
        <Pressable key={provider.id} accessibilityRole="button" onPress={() => go(`/provider/${provider.id}`)}>
          <Card style={styles.card}>
            <View style={styles.row}>
              <Badge label={provider.kind} tone="clay" />
              <Badge label="Demo provider" tone="neutral" />
            </View>
            <Body>{provider.name}</Body>
            <Muted>{provider.city}</Muted>
            <Muted>{provider.summary}</Muted>
            <Muted style={styles.link}>Open menu</Muted>
          </Card>
        </Pressable>
      ))}
    </Screen>
  );
}

const styles = StyleSheet.create({
  card: { gap: 6 },
  row: { flexDirection: 'row', gap: 8 },
  link: { color: colors.primary, marginTop: 4 },
});
