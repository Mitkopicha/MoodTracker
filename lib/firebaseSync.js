// lib/firebaseSync.js
'use client';
import { collection, doc, getDocs, writeBatch } from "firebase/firestore";
import { ensureAnonAuth, getDb } from "./firebaseClient";
import { getAllLogsMap, setAllLogsMap } from "./storage";

const SYNC_KEY = "moodtrack:syncEnabled";

export function isSyncEnabled() {
  if (typeof window === "undefined") return false;
  return localStorage.getItem(SYNC_KEY) === "1";
}
export function setSyncEnabled(on) {
  if (typeof window === "undefined") return;
  localStorage.setItem(SYNC_KEY, on ? "1" : "0");
}

export async function getSyncIdentity() {
  const user = await ensureAnonAuth();
  return { uid: user.uid };
}

// Upload local → cloud
export async function uploadLocalToCloud() {
  const { uid } = await getSyncIdentity();
  const db = getDb();
  const map = getAllLogsMap();
  const base = collection(db, "users", uid, "logs");
  const batch = writeBatch(db);
  Object.entries(map).forEach(([dateKey, entry]) => {
    batch.set(doc(base, dateKey), entry, { merge: true });
  });
  await batch.commit();
  return { count: Object.keys(map).length };
}

// Download cloud → local (OVERWRITE)
export async function downloadCloudToLocal() {
  const { uid } = await getSyncIdentity();
  const db = getDb();
  const snap = await getDocs(collection(db, "users", uid, "logs"));
  const map = {};
  snap.forEach(d => { map[d.id] = d.data(); });
  setAllLogsMap(map);
  return { count: Object.keys(map).length };
}
// Delete all cloud logs for the current user
export async function deleteAllCloudLogs() {
  const { uid } = await getSyncIdentity();
  const db = getDb();
  const base = collection(db, "users", uid, "logs");

  // Fetch in pages and delete in batches to avoid 500-write limits
  let deleted = 0;
  while (true) {
    const snap = await getDocs(base);
    if (snap.empty) break;

    // Chunk into batches of ~400 to be safe
    const docs = snap.docs;
    const chunkSize = 400;
    for (let i = 0; i < docs.length; i += chunkSize) {
      const batch = writeBatch(db);
      for (const d of docs.slice(i, i + chunkSize)) {
        batch.delete(d.ref);
      }
      await batch.commit();
      deleted += Math.min(chunkSize, docs.length - i);
    }

    // Loop again in case more documents exist (very large datasets)
  }
  return { deleted, uid };
}
