import { useEffect, useRef, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import type { AppState } from '../types';

const STATE_ROW_ID = '00000000-0000-0000-0000-000000000001';
const SAVE_DEBOUNCE_MS = 2000;
const LOCAL_STORAGE_KEY = 'killOs_v3_state';

type PersistableState = Omit<AppState, 'notifications'>;

function stripNotifications(state: AppState): PersistableState {
  const { notifications: _n, ...rest } = state;
  void _n;
  return rest;
}

// Returns raw persisted data and the cloud timestamp.
// The caller is responsible for hydrating it through their own hydrate function.
export async function loadStateFromCloud(): Promise<{ data: Record<string, unknown>; cloudTime: number } | null> {
  try {
    const { data, error } = await supabase
      .from('app_state')
      .select('data, updated_at')
      .eq('id', STATE_ROW_ID)
      .maybeSingle();

    if (error || !data) return null;

    const cloudTime = new Date(data.updated_at).getTime();
    const cloudData = data.data as Record<string, unknown>;

    // Compare with localStorage timestamp
    const localRaw = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (localRaw) {
      const localParsed = JSON.parse(localRaw);
      const localTime = localParsed._savedAt ?? 0;

      // Use whichever is newer
      if (localTime > cloudTime) {
        return { data: localParsed, cloudTime: localTime };
      }
    }

    return { data: cloudData, cloudTime };
  } catch {
    return null;
  }
}

async function saveToCloud(state: PersistableState): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('app_state')
      .upsert(
        {
          id: STATE_ROW_ID,
          data: state as unknown as Record<string, unknown>,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'id' },
      );

    return !error;
  } catch {
    return false;
  }
}

function saveToLocalStorage(state: AppState): void {
  try {
    const persistable = stripNotifications(state);
    const withTimestamp = { ...persistable, _savedAt: Date.now() };
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(withTimestamp));
  } catch { /* ignore */ }
}

export function useAutoSave(state: AppState) {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastSavedHashRef = useRef<string>('');

  const save = useCallback(async () => {
    const persistable = stripNotifications(state);
    const hash = JSON.stringify(persistable);

    // Skip if nothing changed
    if (hash === lastSavedHashRef.current) return;
    lastSavedHashRef.current = hash;

    // Always save to localStorage immediately
    saveToLocalStorage(state);

    // Save to cloud
    await saveToCloud(persistable);
  }, [state]);

  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current);

    timerRef.current = setTimeout(() => {
      save();
    }, SAVE_DEBOUNCE_MS);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [save]);

  // Save on unmount / page close
  useEffect(() => {
    const handleBeforeUnload = () => {
      const persistable = stripNotifications(state);
      const hash = JSON.stringify(persistable);
      if (hash !== lastSavedHashRef.current) {
        saveToLocalStorage(state);
        // Fire-and-forget cloud save via sendBeacon pattern
        // sendBeacon doesn't support Supabase API, so we just use localStorage as fallback
        // The next debounce save will catch up
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [state]);

  // Periodic save every 30s as safety net
  useEffect(() => {
    const interval = setInterval(() => {
      save();
    }, 30000);
    return () => clearInterval(interval);
  }, [save]);
}
