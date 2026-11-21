import { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { MealRow } from '../components/FoodCards';
import { Body, Chip, EmptyState, Field, Muted, Screen, Title } from '../components/ui';
import { useAppState } from '../state/AppState';
import { FILTERS, type FilterId } from '../data/options';
import { go } from '../navigation/go';
import { filterFoods, searchFoods } from '../services/catalogue';
import { formatKcal } from '../utils/format';

export default function ExploreScreen() {
  const { foods, catalogueSource, catalogueLoading, catalogueError } = useAppState();
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<FilterId>('all');
  const results = useMemo(() => searchFoods(filterFoods(foods, filter), query), [foods, filter, query]);

  return (
    <Screen tab>
      <Title>Explore</Title>
      <Body>
        {catalogueSource === 'supabase'
          ? 'Dishes from the Gebeta catalogue in Supabase. Photos and nutrition figures are illustrative estimates.'
          : 'Dishes from the catalogue bundled with this app. Photos and nutrition figures are illustrative estimates.'}
      </Body>
      {catalogueLoading ? <Muted>Loading the catalogue…</Muted> : null}
      {catalogueError ? <Muted>{catalogueError}</Muted> : null}
      <Field label="Search" value={query} onChangeText={setQuery} placeholder="Search injera, shiro, kitfo…" />
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filters}>
        {FILTERS.map((item) => (
          <Chip key={item.id} label={item.label} selected={filter === item.id} onPress={() => setFilter(item.id)} />
        ))}
      </ScrollView>
      <Muted>
        {results.length} {results.length === 1 ? 'dish' : 'dishes'}
      </Muted>
      {results.length === 0 ? (
        <EmptyState title="No dishes match" body="Try another name, or clear the filter. The catalogue is a short set of Ethiopian foods." />
      ) : (
        <View style={styles.list}>
          {results.map((food) => (
            <MealRow
              key={food.id}
              title={food.name}
              subtitle={food.description}
              meta={formatKcal(food.nutrition.energyKcal)}
              imageKey={food.imageKey}
              onPress={() => go(`/food/${food.id}`)}
            />
          ))}
        </View>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  filters: { gap: 8, paddingRight: 8 },
  list: { gap: 10 },
});
