'use client';
import { isSyncEnabled, uploadLocalToCloud } from './firebaseSync';

let t = null;

export function autoUploadDebounced(delayMs = 800) {
  if (!isSyncEnabled()) return;                 // only if user enabled sync
  clearTimeout(t);
  t = setTimeout(() => { void safeUpload(); }, delayMs);
}

export async function safeUpload() {
  if (!isSyncEnabled()) return;
  try {
    if (typeof navigator !== 'undefined' && !navigator.onLine) {
      localStorage.setItem('moodtrack:pendingUpload', '1');
      return;
    }
    await uploadLocalToCloud();
    localStorage.removeItem('moodtrack:pendingUpload');
  } catch {
    // mark pending so we retry later
    localStorage.setItem('moodtrack:pendingUpload', '1');
  }
}

/** Call this on app start to retry pending uploads when online/focused */
export function attachAutoSyncListeners() {
  if (typeof window === 'undefined') return;
  const maybeFlush = () => {
    if (localStorage.getItem('moodtrack:pendingUpload') === '1') {
      void safeUpload();
    }
  };
  window.addEventListener('online', maybeFlush);
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') maybeFlush();
  });
  // run once on mount
  maybeFlush();
}
