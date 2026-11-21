import { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { MealRow } from '../components/FoodCards';
import { Body, Chip, EmptyState, Field, Muted, Screen, Title } from '../components/ui';
import { FOODS } from '../data/foods';
import { FILTERS, type FilterId } from '../data/options';
import { go } from '../navigation/go';
import { filterFoods, searchFoods } from '../services/catalogue';
import { formatKcal } from '../utils/format';

export default function ExploreScreen() {
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<FilterId>('all');
  const results = useMemo(() => searchFoods(filterFoods(FOODS, filter), query), [filter, query]);

  return (
    <Screen tab>
      <Title>Explore</Title>
      <Body>Ethiopian dishes from the demo catalogue. Photos and nutrition figures are illustrative.</Body>
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
        <EmptyState title="No dishes match" body="Try another name, or clear the filter. The demo catalogue is a short set of Ethiopian foods." />
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
