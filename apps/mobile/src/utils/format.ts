export function formatPortion(portion: number): string {
  const rounded = Math.round(portion * 10) / 10;
  const text = Number.isInteger(rounded) ? String(rounded) : rounded.toFixed(1);
  return rounded === 1 ? '1 serving' : `${text} servings`;
}

export function formatKcal(value: number | null): string {
  if (value == null) return 'Not estimated';
  return `${value} kcal`;
}

export function formatEtb(value: number): string {
  return `${Math.round(value)} ETB`;
}

export function clampPortion(portion: number): number {
  const next = Math.round(portion * 10) / 10;
  return Math.min(3, Math.max(0.5, next));
}

export function createId(prefix: string): string {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
}

export function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return 'G';
  return parts
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('');
}
