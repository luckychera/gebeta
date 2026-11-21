// Matching model output against the Gebeta catalogue.
//
// The model is asked for a dish name. It is never asked for, and never
// trusted with, a catalogue identifier or a nutrition value. Anything that
// does not match a published catalogue row comes back with foodSlug null so
// the application can say plainly that it found no match.

export type CatalogueEntry = {
  slug: string;
  name: string;
  localNames: string[];
};

export function normalize(value: string): string {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/['’`]/g, '')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

export function matchCatalogue(candidateName: string, catalogue: CatalogueEntry[]): string | null {
  const needle = normalize(candidateName);
  if (!needle) return null;

  for (const entry of catalogue) {
    const names = [entry.slug, entry.name, ...entry.localNames].map(normalize);
    if (names.includes(needle)) return entry.slug;
  }

  // "Doro wot with injera" names two foods. Taking the first catalogue row
  // that appears anywhere in the string would answer injera, so the longest
  // matched name wins instead. A short fragment is skipped entirely, since
  // two or three letters would match almost anything.
  if (needle.length < 4) return null;

  let bestSlug: string | null = null;
  let bestLength = 0;

  for (const entry of catalogue) {
    const names = [entry.slug, entry.name, ...entry.localNames].map(normalize).filter((name) => name.length >= 4);
    for (const name of names) {
      if (!needle.includes(name) && !name.includes(needle)) continue;
      if (name.length > bestLength) {
        bestLength = name.length;
        bestSlug = entry.slug;
      }
    }
  }

  return bestSlug;
}
