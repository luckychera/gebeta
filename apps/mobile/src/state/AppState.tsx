import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { initialModeration, initialReview, seedMenus } from '../data/providers';
import type {
  DiaryEntry,
  MenuItem,
  ModerationState,
  Profile,
  ProviderModerationStatus,
  ReviewState,
  ReviewStatus,
  ScanSession,
} from '../types';
import { createId } from '../utils/format';
import { emptyProfile } from '../utils/profile';

const STORAGE_KEY = 'gebeta.nutriguider.v1';

type Persisted = {
  version: 1;
  seenWelcome: boolean;
  profile: Profile;
  diary: DiaryEntry[];
  menus: Record<string, MenuItem[]>;
  review: ReviewState;
  moderation: ModerationState;
};

type AppStateValue = {
  hydrated: boolean;
  storageError: string | null;
  seenWelcome: boolean;
  profile: Profile;
  diary: DiaryEntry[];
  menus: Record<string, MenuItem[]>;
  review: ReviewState;
  moderation: ModerationState;
  scan: ScanSession | null;
  flash: string | null;
  completeWelcome: () => void;
  resetWelcome: () => void;
  saveProfile: (profile: Profile) => void;
  setScan: (scan: ScanSession | null) => void;
  addDiary: (entry: DiaryEntry) => void;
  removeDiary: (id: string) => void;
  toggleMenuItem: (providerId: string, itemId: string) => void;
  addMenuItem: (providerId: string, item: MenuItem) => void;
  setReview: (status: ReviewStatus, note: string) => void;
  setProviderVerification: (status: ProviderModerationStatus) => void;
  clearDemo: () => void;
  clearFlash: () => void;
};

const AppStateContext = createContext<AppStateValue | null>(null);

function parsePersisted(raw: string | null): Persisted | null {
  if (!raw) return null;
  try {
    const value = JSON.parse(raw) as Persisted;
    if (!value || value.version !== 1 || !value.profile || !Array.isArray(value.diary)) return null;
    return value;
  } catch {
    return null;
  }
}

export function AppStateProvider({ children }: { children: React.ReactNode }) {
  const [hydrated, setHydrated] = useState(false);
  const [storageError, setStorageError] = useState<string | null>(null);
  const [seenWelcome, setSeenWelcome] = useState(false);
  const [profile, setProfile] = useState<Profile>(emptyProfile);
  const [diary, setDiary] = useState<DiaryEntry[]>([]);
  const [menus, setMenus] = useState<Record<string, MenuItem[]>>(seedMenus);
  const [review, setReviewState] = useState<ReviewState>(initialReview);
  const [moderation, setModeration] = useState<ModerationState>(initialModeration);
  const [scan, setScan] = useState<ScanSession | null>(null);
  const [flash, setFlash] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    AsyncStorage.getItem(STORAGE_KEY)
      .then((raw) => {
        if (!active) return;
        const parsed = parsePersisted(raw);
        if (parsed) {
          setSeenWelcome(parsed.seenWelcome);
          setProfile(parsed.profile);
          setDiary(parsed.diary);
          setMenus(parsed.menus ?? seedMenus());
          setReviewState(parsed.review ?? initialReview());
          setModeration(parsed.moderation ?? initialModeration());
        }
      })
      .catch(() => {
        if (active) setStorageError('Saved data on this device could not be read. Starting from the demo catalogue.');
      })
      .finally(() => {
        if (active) setHydrated(true);
      });
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    const payload: Persisted = {
      version: 1,
      seenWelcome,
      profile,
      diary,
      menus,
      review,
      moderation,
    };
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(payload)).catch(() => {
      setStorageError('Changes could not be saved on this device.');
    });
  }, [hydrated, seenWelcome, profile, diary, menus, review, moderation]);

  const completeWelcome = useCallback(() => setSeenWelcome(true), []);
  const resetWelcome = useCallback(() => setSeenWelcome(false), []);
  const saveProfile = useCallback((next: Profile) => setProfile(next), []);
  const clearFlash = useCallback(() => setFlash(null), []);

  const addDiary = useCallback((entry: DiaryEntry) => {
    setDiary((current) => [entry, ...current]);
    setFlash('Saved on this device.');
  }, []);

  const removeDiary = useCallback((id: string) => {
    setDiary((current) => current.filter((entry) => entry.id !== id));
    setFlash('Meal removed from this device.');
  }, []);

  const toggleMenuItem = useCallback((providerId: string, itemId: string) => {
    setMenus((current) => ({
      ...current,
      [providerId]: (current[providerId] ?? []).map((item) =>
        item.id === itemId ? { ...item, published: !item.published } : item,
      ),
    }));
  }, []);

  const addMenuItem = useCallback((providerId: string, item: MenuItem) => {
    setMenus((current) => ({
      ...current,
      [providerId]: [item, ...(current[providerId] ?? [])],
    }));
    setFlash('Menu item added on this device.');
  }, []);

  const setReview = useCallback((status: ReviewStatus, note: string) => {
    setReviewState({ status, note: note.trim() });
    setFlash('Review status updated in the demo.');
  }, []);

  const setProviderVerification = useCallback((status: ProviderModerationStatus) => {
    const label =
      status === 'verified-demo' ? 'marked as demo verified' : status === 'needs-changes' ? 'sent back for changes' : 'set to pending';
    setModeration((current) => ({
      providerStatus: status,
      events: [{ id: createId('event'), text: `Sample moderation: Kafa Terrace Hotel ${label}.`, at: new Date().toISOString() }, ...current.events],
    }));
    setFlash('Moderation status updated in the demo.');
  }, []);

  const clearDemo = useCallback(() => {
    setProfile(emptyProfile);
    setDiary([]);
    setMenus(seedMenus());
    setReviewState(initialReview());
    setModeration(initialModeration());
    setScan(null);
    setFlash('Demo data on this device was cleared.');
  }, []);

  const value = useMemo<AppStateValue>(
    () => ({
      hydrated,
      storageError,
      seenWelcome,
      profile,
      diary,
      menus,
      review,
      moderation,
      scan,
      flash,
      completeWelcome,
      resetWelcome,
      saveProfile,
      setScan,
      addDiary,
      removeDiary,
      toggleMenuItem,
      addMenuItem,
      setReview,
      setProviderVerification,
      clearDemo,
      clearFlash,
    }),
    [
      hydrated,
      storageError,
      seenWelcome,
      profile,
      diary,
      menus,
      review,
      moderation,
      scan,
      flash,
      completeWelcome,
      resetWelcome,
      saveProfile,
      addDiary,
      removeDiary,
      toggleMenuItem,
      addMenuItem,
      setReview,
      setProviderVerification,
      clearDemo,
      clearFlash,
    ],
  );

  return <AppStateContext.Provider value={value}>{children}</AppStateContext.Provider>;
}

export function useAppState(): AppStateValue {
  const value = useContext(AppStateContext);
  if (!value) throw new Error('useAppState must be used within AppStateProvider');
  return value;
}
