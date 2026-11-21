import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { FOODS } from '../data/foods';
import { PROVIDERS, initialModeration, initialReview, seedMenus } from '../data/providers';
import { getSupabase } from '../services/supabase/client';
import { fetchCatalogue } from '../services/supabase/repositories/catalogue';
import { deleteDiaryEntry, fetchDiary, insertDiaryEntry } from '../services/supabase/repositories/diary';
import { fetchProfile, saveProfile as saveProfileRemote } from '../services/supabase/repositories/profile';
import {
  fetchProviders,
  insertMenuItem,
  setMenuItemPublished,
  updateMenuItemRow,
} from '../services/supabase/repositories/providers';
import type {
  DiaryEntry,
  FoodRecord,
  MenuItem,
  ModerationState,
  Profile,
  ProviderModerationStatus,
  ProviderRecord,
  ReviewState,
  ReviewStatus,
  ScanSession,
} from '../types';
import { createId } from '../utils/format';
import { emptyProfile, normalizeProfile } from '../utils/profile';
import { useAuth } from './AuthState';

const STORAGE_KEY = 'gebeta.nutriguider.v1';

export type MenuItemPatch = Pick<MenuItem, 'name' | 'description' | 'priceEtb'>;

/** Where the data on screen came from. The UI says this out loud. */
export type DataSource = 'supabase' | 'on-device';

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

  foods: FoodRecord[];
  providers: ProviderRecord[];
  catalogueSource: DataSource;
  catalogueLoading: boolean;
  catalogueError: string | null;
  getFood: (slug: string) => FoodRecord | undefined;
  getProvider: (slug: string) => ProviderRecord | undefined;

  profile: Profile;
  diary: DiaryEntry[];
  menus: Record<string, MenuItem[]>;
  /** 'supabase' once the signed-in account's own rows are in use. */
  accountSource: DataSource;
  accountLoading: boolean;
  syncError: string | null;

  review: ReviewState;
  moderation: ModerationState;
  scan: ScanSession | null;
  flash: string | null;

  completeWelcome: () => void;
  resetWelcome: () => void;
  saveProfile: (profile: Profile) => Promise<void>;
  setScan: (scan: ScanSession | null) => void;
  addDiary: (entry: DiaryEntry) => Promise<void>;
  removeDiary: (id: string) => Promise<void>;
  toggleMenuItem: (providerId: string, itemId: string) => Promise<void>;
  addMenuItem: (providerId: string, item: MenuItem) => Promise<void>;
  updateMenuItem: (providerId: string, itemId: string, patch: MenuItemPatch) => Promise<void>;
  setReview: (status: ReviewStatus, note: string) => void;
  setProviderVerification: (status: ProviderModerationStatus) => void;
  reloadCatalogue: () => void;
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
  const { status: authStatus, userId } = useAuth();
  const client = getSupabase();
  const usingAccount = authStatus === 'signed-in' && client !== null && userId !== null;

  const [hydrated, setHydrated] = useState(false);
  const [storageError, setStorageError] = useState<string | null>(null);
  const [persistBlocked, setPersistBlocked] = useState(false);
  const [seenWelcome, setSeenWelcome] = useState(false);

  // On-device copies. These stay untouched by anything the server returns, so
  // signing in never writes account data into the guest record and signing
  // out never leaves it behind.
  const [localProfile, setLocalProfile] = useState<Profile>(emptyProfile);
  const [localDiary, setLocalDiary] = useState<DiaryEntry[]>([]);
  const [localMenus, setLocalMenus] = useState<Record<string, MenuItem[]>>(seedMenus);

  // Account copies, held in memory only for the length of the session.
  const [accountProfile, setAccountProfile] = useState<Profile | null>(null);
  const [accountDiary, setAccountDiary] = useState<DiaryEntry[]>([]);
  const [accountLoading, setAccountLoading] = useState(false);
  const [syncError, setSyncError] = useState<string | null>(null);

  const [foods, setFoods] = useState<FoodRecord[]>(FOODS);
  const [providers, setProviders] = useState<ProviderRecord[]>(PROVIDERS);
  const [remoteMenus, setRemoteMenus] = useState<Record<string, MenuItem[]> | null>(null);
  const [catalogueSource, setCatalogueSource] = useState<DataSource>('on-device');
  const [catalogueLoading, setCatalogueLoading] = useState(false);
  const [catalogueError, setCatalogueError] = useState<string | null>(null);
  const [catalogueTick, setCatalogueTick] = useState(0);

  const [review, setReviewState] = useState<ReviewState>(initialReview);
  const [moderation, setModeration] = useState<ModerationState>(initialModeration);
  const [scan, setScan] = useState<ScanSession | null>(null);
  const [flash, setFlash] = useState<string | null>(null);

  // --- on-device hydration -------------------------------------------------

  useEffect(() => {
    let active = true;
    AsyncStorage.getItem(STORAGE_KEY)
      .then((raw) => {
        if (!active) return;
        if (!raw) return;
        const parsed = parsePersisted(raw);
        if (!parsed) {
          setStorageError(
            'Saved data on this device could not be read, so it was left untouched. New changes will not be saved until you use "Clear saved demo data" on Profile.',
          );
          setPersistBlocked(true);
          return;
        }
        setSeenWelcome(parsed.seenWelcome);
        setLocalProfile(normalizeProfile(parsed.profile));
        setLocalDiary(parsed.diary);
        setLocalMenus(parsed.menus ?? seedMenus());
        setReviewState(parsed.review ?? initialReview());
        setModeration(parsed.moderation ?? initialModeration());
      })
      .catch(() => {
        if (!active) return;
        setStorageError(
          'Saved data on this device could not be read, so it was left untouched. The demo is running from the sample catalogue.',
        );
        setPersistBlocked(true);
      })
      .finally(() => {
        if (active) setHydrated(true);
      });
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!hydrated || persistBlocked) return;
    const payload: Persisted = {
      version: 1,
      seenWelcome,
      profile: localProfile,
      diary: localDiary,
      menus: localMenus,
      review,
      moderation,
    };
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(payload)).catch(() => {
      setStorageError('Changes could not be saved on this device.');
    });
  }, [hydrated, persistBlocked, seenWelcome, localProfile, localDiary, localMenus, review, moderation]);

  // --- catalogue and providers --------------------------------------------

  useEffect(() => {
    if (!client) {
      setCatalogueSource('on-device');
      return undefined;
    }

    let active = true;
    setCatalogueLoading(true);

    void Promise.all([fetchCatalogue(client), fetchProviders(client, userId)])
      .then(([catalogue, providerBundle]) => {
        if (!active) return;

        if (!catalogue.ok) {
          setCatalogueError(catalogue.message);
          setCatalogueSource('on-device');
          setFoods(FOODS);
          setProviders(PROVIDERS);
          setRemoteMenus(null);
          return;
        }
        if (catalogue.data.length === 0) {
          setCatalogueError('The Supabase catalogue is empty, so the bundled sample catalogue is being shown.');
          setCatalogueSource('on-device');
          setFoods(FOODS);
          setProviders(PROVIDERS);
          setRemoteMenus(null);
          return;
        }

        setCatalogueError(null);
        setCatalogueSource('supabase');
        setFoods(catalogue.data);

        if (providerBundle.ok && providerBundle.data.providers.length > 0) {
          setProviders(providerBundle.data.providers);
          setRemoteMenus(providerBundle.data.menus);
        } else {
          setProviders(PROVIDERS);
          setRemoteMenus(null);
        }
      })
      .catch(() => {
        if (!active) return;
        setCatalogueError('The catalogue could not be loaded from Supabase. The bundled sample catalogue is being shown.');
        setCatalogueSource('on-device');
      })
      .finally(() => {
        if (active) setCatalogueLoading(false);
      });

    return () => {
      active = false;
    };
  }, [client, userId, catalogueTick]);

  // --- account profile and diary ------------------------------------------

  useEffect(() => {
    if (!usingAccount || !client || !userId) {
      setAccountProfile(null);
      setAccountDiary([]);
      setSyncError(null);
      return undefined;
    }

    let active = true;
    setAccountLoading(true);

    void Promise.all([fetchProfile(client, userId), fetchDiary(client, userId)])
      .then(([profileResult, diaryResult]) => {
        if (!active) return;
        if (!profileResult.ok) {
          setSyncError(profileResult.message);
        } else if (profileResult.data) {
          setAccountProfile(normalizeProfile(profileResult.data));
        } else {
          setAccountProfile(emptyProfile);
          setSyncError(
            'Your account has no profile row yet. Saving the profile will create one.',
          );
        }
        if (!diaryResult.ok) setSyncError(diaryResult.message);
        else setAccountDiary(diaryResult.data);
      })
      .finally(() => {
        if (active) setAccountLoading(false);
      });

    return () => {
      active = false;
    };
  }, [usingAccount, client, userId]);

  // --- derived -------------------------------------------------------------

  const profile = usingAccount ? (accountProfile ?? emptyProfile) : localProfile;
  const diary = usingAccount ? accountDiary : localDiary;
  const menus = catalogueSource === 'supabase' && remoteMenus ? remoteMenus : localMenus;
  const accountSource: DataSource = usingAccount ? 'supabase' : 'on-device';

  const getFood = useCallback((slug: string) => foods.find((food) => food.id === slug), [foods]);
  const getProvider = useCallback((slug: string) => providers.find((item) => item.id === slug), [providers]);

  // --- actions -------------------------------------------------------------

  const completeWelcome = useCallback(() => setSeenWelcome(true), []);
  const resetWelcome = useCallback(() => setSeenWelcome(false), []);
  const clearFlash = useCallback(() => setFlash(null), []);
  const reloadCatalogue = useCallback(() => setCatalogueTick((value) => value + 1), []);

  const saveProfile = useCallback(
    async (next: Profile) => {
      if (usingAccount && client && userId) {
        setAccountProfile(next);
        const result = await saveProfileRemote(client, next, userId);
        if (!result.ok) {
          setSyncError(result.message);
          return;
        }
        setSyncError(null);
        setFlash('Profile saved to your Gebeta account.');
        return;
      }
      setLocalProfile(next);
      setFlash('Profile saved on this device.');
    },
    [usingAccount, client, userId],
  );

  const addDiary = useCallback(
    async (entry: DiaryEntry) => {
      if (usingAccount && client && userId) {
        const result = await insertDiaryEntry(client, entry, userId);
        if (!result.ok) {
          setSyncError(result.message);
          return;
        }
        setSyncError(null);
        setAccountDiary((current) => [result.data, ...current]);
        setFlash('Saved to your Gebeta account.');
        return;
      }
      setLocalDiary((current) => [entry, ...current]);
      setFlash('Saved on this device.');
    },
    [usingAccount, client, userId],
  );

  const removeDiary = useCallback(
    async (id: string) => {
      if (usingAccount && client) {
        const result = await deleteDiaryEntry(client, id);
        if (!result.ok) {
          setSyncError(result.message);
          return;
        }
        setSyncError(null);
        setAccountDiary((current) => current.filter((entry) => entry.id !== id));
        setFlash('Meal removed from your account.');
        return;
      }
      setLocalDiary((current) => current.filter((entry) => entry.id !== id));
      setFlash('Meal removed from this device.');
    },
    [usingAccount, client],
  );

  const patchRemoteMenu = useCallback(
    (providerSlug: string, change: (items: MenuItem[]) => MenuItem[]) => {
      setRemoteMenus((current) =>
        current ? { ...current, [providerSlug]: change(current[providerSlug] ?? []) } : current,
      );
    },
    [],
  );

  const remoteMenusActive = catalogueSource === 'supabase' && remoteMenus !== null && client !== null;

  const toggleMenuItem = useCallback(
    async (providerId: string, itemId: string) => {
      if (remoteMenusActive && client) {
        const item = (remoteMenus?.[providerId] ?? []).find((entry) => entry.id === itemId);
        if (!item) return;
        const result = await setMenuItemPublished(client, itemId, !item.published);
        if (!result.ok) {
          setSyncError(result.message);
          return;
        }
        setSyncError(null);
        patchRemoteMenu(providerId, (items) =>
          items.map((entry) => (entry.id === itemId ? { ...entry, published: !entry.published } : entry)),
        );
        return;
      }
      setLocalMenus((current) => ({
        ...current,
        [providerId]: (current[providerId] ?? []).map((item) =>
          item.id === itemId ? { ...item, published: !item.published } : item,
        ),
      }));
    },
    [remoteMenusActive, client, remoteMenus, patchRemoteMenu],
  );

  const addMenuItem = useCallback(
    async (providerId: string, item: MenuItem) => {
      if (remoteMenusActive && client) {
        const provider = providers.find((entry) => entry.id === providerId);
        if (!provider?.remoteId) {
          setSyncError('That provider is not in the database, so the item was not added.');
          return;
        }
        const result = await insertMenuItem(client, provider.remoteId, item);
        if (!result.ok) {
          setSyncError(result.message);
          return;
        }
        setSyncError(null);
        patchRemoteMenu(providerId, (items) => [result.data, ...items]);
        setFlash('Menu item added to the database.');
        return;
      }
      setLocalMenus((current) => ({ ...current, [providerId]: [item, ...(current[providerId] ?? [])] }));
      setFlash('Menu item added on this device.');
    },
    [remoteMenusActive, client, providers, patchRemoteMenu],
  );

  const updateMenuItem = useCallback(
    async (providerId: string, itemId: string, patch: MenuItemPatch) => {
      if (remoteMenusActive && client) {
        const result = await updateMenuItemRow(client, itemId, patch);
        if (!result.ok) {
          setSyncError(result.message);
          return;
        }
        setSyncError(null);
        patchRemoteMenu(providerId, (items) =>
          items.map((entry) => (entry.id === itemId ? { ...entry, ...patch } : entry)),
        );
        setFlash('Menu item updated in the database.');
        return;
      }
      setLocalMenus((current) => ({
        ...current,
        [providerId]: (current[providerId] ?? []).map((item) => (item.id === itemId ? { ...item, ...patch } : item)),
      }));
      setFlash('Menu item updated on this device.');
    },
    [remoteMenusActive, client, patchRemoteMenu],
  );

  const setReview = useCallback((status: ReviewStatus, note: string) => {
    setReviewState({ status, note: note.trim() });
    setFlash('Review status updated in the demo.');
  }, []);

  const setProviderVerification = useCallback((status: ProviderModerationStatus) => {
    const label =
      status === 'verified-demo'
        ? 'marked as demo verified'
        : status === 'needs-changes'
          ? 'sent back for changes'
          : 'set to pending';
    setModeration((current) => ({
      providerStatus: status,
      events: [
        { id: createId('event'), text: `Sample moderation: Kafa Terrace Hotel ${label}.`, at: new Date().toISOString() },
        ...current.events,
      ],
    }));
    setFlash('Moderation status updated in the demo.');
  }, []);

  const clearDemo = useCallback(() => {
    setLocalProfile(emptyProfile);
    setLocalDiary([]);
    setLocalMenus(seedMenus());
    setReviewState(initialReview());
    setModeration(initialModeration());
    setScan(null);
    setStorageError(null);
    setPersistBlocked(false);
    setFlash('Demo data on this device was cleared. Nothing was deleted from a Gebeta account.');
  }, []);

  const value = useMemo<AppStateValue>(
    () => ({
      hydrated,
      storageError,
      seenWelcome,
      foods,
      providers,
      catalogueSource,
      catalogueLoading,
      catalogueError,
      getFood,
      getProvider,
      profile,
      diary,
      menus,
      accountSource,
      accountLoading,
      syncError,
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
      updateMenuItem,
      setReview,
      setProviderVerification,
      reloadCatalogue,
      clearDemo,
      clearFlash,
    }),
    [
      hydrated,
      storageError,
      seenWelcome,
      foods,
      providers,
      catalogueSource,
      catalogueLoading,
      catalogueError,
      getFood,
      getProvider,
      profile,
      diary,
      menus,
      accountSource,
      accountLoading,
      syncError,
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
      updateMenuItem,
      setReview,
      setProviderVerification,
      reloadCatalogue,
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
