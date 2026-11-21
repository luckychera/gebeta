-- Gebeta — illustrative demonstration data
--
-- Everything inserted here is clearly labelled demonstration content:
--
--   * food_items.is_demo = true
--   * food_nutrition.verification_status = 'illustrative-demo'
--   * providers.is_demo = true, and the summaries say the business is fictional
--
-- The nutrition figures are teaching estimates, not laboratory measurements
-- and not institution-verified. Where a value is genuinely unknown it stays
-- NULL. Writing a zero would claim a measurement that was never made.
--
-- Every statement uses ON CONFLICT DO NOTHING, so re-running this file never
-- overwrites an edit made later in the dashboard.

-- ---------------------------------------------------------------------------
-- Catalogue
-- ---------------------------------------------------------------------------

insert into public.food_items
  (slug, name, local_names, description, categories, image_key, ingredients, caution_terms, dietary_notes, often_uncooked, is_published, is_demo)
values
  (
    'injera', 'Injera', array['injera'],
    'A spongy fermented flatbread, often made with teff, that works as both plate and utensil.',
    array['traditional', 'lunch', 'dinner', 'vegetarian'], 'injera',
    array['teff flour', 'water'],
    array['teff', 'wheat', 'gluten'],
    array['Usually plant-based. Confirm the grain mix if gluten matters.'],
    false, true, true
  ),
  (
    'shiro', 'Shiro', array['shiro wot', 'shiro wet'],
    'A thick stew of powdered chickpeas or broad beans, simmered with onion, oil, and spices, and eaten with injera.',
    array['traditional', 'lunch', 'dinner', 'vegetarian'], 'shiro',
    array['chickpea or broad-bean flour', 'onion', 'oil', 'berbere or mitmita'],
    array['chickpea', 'bean', 'legume', 'shiro'],
    array['Usual preparations are vegetarian. Confirm the fat used.'],
    false, true, true
  ),
  (
    'doro-wot', 'Doro Wot', array['doro wat', 'doro wet'],
    'A slow-cooked chicken stew with berbere, often served with a boiled egg. Recipes differ by home and restaurant.',
    array['traditional', 'lunch', 'dinner', 'high-protein'], 'doro',
    array['chicken', 'egg', 'onion', 'berbere', 'niter kibbeh or oil'],
    array['chicken', 'egg', 'berbere'],
    array['Contains poultry and egg in the usual version shown here.'],
    false, true, true
  ),
  (
    'kitfo', 'Kitfo', array['kitfo'],
    'Minced beef seasoned with mitmita and spiced butter. It is often served lightly cooked or uncooked. Doneness cannot be judged from the demo.',
    array['traditional', 'dinner', 'high-protein'], 'kitfo',
    array['minced beef', 'mitmita', 'niter kibbeh'],
    array['beef', 'meat', 'butter', 'dairy'],
    array['Often served uncooked or lightly cooked. Ask how it was prepared.'],
    true, true, true
  ),
  (
    'kocho', 'Kocho', array['qocho', 'kocho'],
    'Fermented enset bread, widely eaten in southwestern Ethiopia. Sides change from place to place.',
    array['traditional', 'lunch', 'dinner'], 'kocho',
    array['fermented enset'],
    array['enset', 'kocho'],
    array['The bread itself is plant-based. Sides may not be.'],
    false, true, true
  ),
  (
    'gomen', 'Gomen', array['ye''abesha gomen', 'gomen'],
    'Collard greens cooked with onion, garlic, and spices. A common vegetable beside injera.',
    array['traditional', 'lunch', 'dinner', 'vegetarian'], 'gomen',
    array['collard greens', 'onion', 'garlic', 'oil'],
    array['collard', 'greens', 'gomen'],
    array['Vegetable version. Confirm that no meat stock was used.'],
    false, true, true
  ),
  (
    'bulla', 'Bulla', array['bulla'],
    'A smooth enset-flour porridge or dough, often finished with butter or spices. Eaten as breakfast or a snack.',
    array['traditional', 'breakfast'], 'bulla',
    array['enset flour', 'water', 'butter'],
    array['enset', 'butter', 'dairy', 'bulla'],
    array['Plant base. The usual butter finish is a dairy ingredient.'],
    false, true, true
  ),
  (
    'genfo', 'Genfo', array['ga''at', 'genfo'],
    'A thick barley or wheat porridge with a well of spiced butter or berbere. A familiar breakfast.',
    array['traditional', 'breakfast'], 'genfo',
    array['barley or wheat flour', 'water', 'spiced butter', 'berbere'],
    array['barley', 'wheat', 'gluten', 'butter', 'dairy'],
    array['Usually contains gluten grains and butter.'],
    false, true, true
  )
on conflict (slug) do nothing;

-- ---------------------------------------------------------------------------
-- Nutrition estimates
--
-- kitfo keeps carbohydrate and fibre NULL, and bulla keeps fibre NULL,
-- because those values were never estimated for the stated serving basis.
-- ---------------------------------------------------------------------------

insert into public.food_nutrition
  (food_id, serving_basis, serving_grams, energy_kcal, protein_g, carbohydrate_g, fat_g, fibre_g, source_label, verification_status, assumptions)
select f.id, v.serving_basis, v.serving_grams, v.energy_kcal, v.protein_g, v.carbohydrate_g, v.fat_g, v.fibre_g,
       'Illustrative demo estimate for teaching. Not a laboratory measurement and not institution-verified.',
       'illustrative-demo',
       v.assumptions
from (
  values
    ('injera', '1 medium piece, about 150 g', 150, 230, 7, 46, 2, 5,
     'Assumes a teff piece of about 150 g. Some injera includes other grains. The illustrative figures are for the bread alone.'),
    ('shiro', '1 ladle, about 180 g, without injera', 180, 290, 12, 26, 14, 7,
     'Assumes a household-style ladle and a modest amount of oil. Oil quantity changes the fat figure and cannot be seen from a photo.'),
    ('doro-wot', '1 serving with one egg, about 250 g, without injera', 250, 410, 29, 10, 28, 2,
     'Assumes chicken plus one egg and a typical amount of spiced fat. The split between meat, egg, and fat is not visible in a photo.'),
    ('kitfo', '1 serving of minced beef, about 150 g, without injera or ayib', 150, 390, 23, null, 32, null,
     'Assumes seasoned minced beef of about 150 g. Carbohydrate and fibre are not estimated because bread, cheese, and greens are often served beside it and are not part of this basis.'),
    ('kocho', '1 piece, about 120 g', 120, 200, 2, 47, 1, 3,
     'Assumes plain fermented enset bread of about 120 g, without butter or a side stew.'),
    ('gomen', '1 serving of greens, about 150 g', 150, 150, 4, 9, 10, 4,
     'Assumes greens cooked with a modest amount of oil. Some versions include meat; this record is the vegetable dish only. Oil amount is not visible from a photo.'),
    ('bulla', '1 bowl, about 200 g', 200, 250, 2, 46, 7, null,
     'Assumes a bowl with a small amount of butter. Without butter the fat figure would be lower. Fibre is not estimated.'),
    ('genfo', '1 bowl, about 250 g', 250, 360, 8, 54, 12, 4,
     'Assumes a barley-style bowl with a well of spiced butter. The grain and the amount of butter both change the estimate.')
) as v (slug, serving_basis, serving_grams, energy_kcal, protein_g, carbohydrate_g, fat_g, fibre_g, assumptions)
join public.food_items f on f.slug = v.slug
on conflict (food_id, serving_basis) do nothing;

-- ---------------------------------------------------------------------------
-- Fictional providers
-- ---------------------------------------------------------------------------

insert into public.providers (slug, name, kind, city, summary, is_demo, is_published, moderation_status)
values
  (
    'kafa-terrace', 'Kafa Terrace Hotel', 'Hotel', 'Bonga',
    'A fictional hotel kitchen in Kafa, used to show a digital menu, sample prices, and a QR referral. Not a real partnership.',
    true, true, 'pending'
  ),
  (
    'jimma-lakes', 'Jimma Lakes Café', 'Café', 'Jimma',
    'A fictional café menu for the guest view. Guests can read it without an account. It is not a live listing.',
    true, true, 'pending'
  )
on conflict (slug) do nothing;

insert into public.provider_menu_items (provider_id, food_id, name, description, price_etb, ingredients, is_published, sort_order)
select p.id, f.id, v.name, v.description, v.price_etb, v.ingredients, v.is_published, v.sort_order
from (
  values
    ('kafa-terrace', 'shiro', 'Shiro with injera', 'Chickpea stew with a piece of injera.', 280,
     array['chickpea flour', 'onion', 'berbere', 'injera'], true, 1),
    ('kafa-terrace', 'doro-wot', 'Doro Wot', 'Chicken stew with a boiled egg, served with injera.', 540,
     array['chicken', 'egg', 'berbere', 'injera'], true, 2),
    ('kafa-terrace', 'gomen', 'Gomen', 'Cooked collard greens.', 190,
     array['collard greens', 'onion', 'garlic'], true, 3),
    ('kafa-terrace', 'kitfo', 'Kitfo', 'Seasoned minced beef. Ask the kitchen about doneness.', 650,
     array['beef', 'mitmita', 'spiced butter'], true, 4),
    ('kafa-terrace', 'bulla', 'Bulla breakfast', 'Enset porridge with spiced butter. Unpublished until the kitchen turns it on.', 160,
     array['enset flour', 'butter'], false, 5),
    ('jimma-lakes', 'kocho', 'Kocho plate', 'Fermented enset bread with a vegetable side.', 220,
     array['enset', 'greens'], true, 1),
    ('jimma-lakes', 'genfo', 'Morning genfo', 'Barley porridge with spiced butter.', 150,
     array['barley', 'spiced butter'], true, 2),
    ('jimma-lakes', 'shiro', 'Injera and shiro', 'A small fasting-style plate.', 260,
     array['injera', 'chickpea stew'], true, 3)
) as v (provider_slug, food_slug, name, description, price_etb, ingredients, is_published, sort_order)
join public.providers p on p.slug = v.provider_slug
join public.food_items f on f.slug = v.food_slug
on conflict on constraint provider_menu_items_unique_name do nothing;
