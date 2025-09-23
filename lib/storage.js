// lib/storage.js
// Simple localStorage-backed storage helpers for mood + habit logs

const STORAGE_KEY = "moodtrack:logs";

function isBrowser() {
  return typeof window !== "undefined" && typeof localStorage !== "undefined";
}

export function dateKey(date = new Date()) {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function readAll() {
  if (!isBrowser()) return {};
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function writeAll(data) {
  if (!isBrowser()) return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

// --- NEW: shape normalisation for backward compatibility ---
function normalise(entry) {
  if (!entry) return null;
  const base = {
    date: entry.date,
    mood: Number(entry.mood ?? 0),
    note: String(entry.note ?? ""),
    // New habit fields (all optional numbers)
    sleepHours: Number(entry.sleepHours ?? 0),
    steps: Number(entry.steps ?? 0),
    sunlightMins: Number(entry.sunlightMins ?? 0),
    socialMins: Number(entry.socialMins ?? 0),
  };
  return base;
}

export function getLogForDate(date = new Date()) {
  const key = dateKey(date);
  const all = readAll();
  return normalise(all[key] || null);
}

// --- UPDATED: can save mood-only or full habit payload ---
export function saveLogForDate(
  date = new Date(),
  {
    mood = 0,
    note = "",
    sleepHours = 0,
    steps = 0,
    sunlightMins = 0,
    socialMins = 0,
  } = {}
) {
  const key = dateKey(date);
  const all = readAll();
  all[key] = normalise({
    date: key,
    mood,
    note,
    sleepHours,
    steps,
    sunlightMins,
    socialMins,
  });
  writeAll(all);
  return all[key];
}

export function getRecentLogs(days = 7) {
  const all = readAll();
  const keys = Object.keys(all).sort((a, b) => (a < b ? 1 : -1));
  const recent = keys.slice(0, days).map((k) => normalise(all[k]));
  return recent;
}

export function exportJSON() {
  const all = readAll();
  const json = JSON.stringify(all, null, 2);
  if (isBrowser()) {
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "moodtrack-export.json";
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }
  return json;
}

export function importJSON(jsonString) {
  try {
    const data = JSON.parse(jsonString || "{}");
    if (data && typeof data === "object" && !Array.isArray(data)) {
      writeAll(data);
      return true;
    }
    return false;
  } catch {
    return false;
  }
}

export function clearAll() {
  if (!isBrowser()) return;
  localStorage.removeItem(STORAGE_KEY);
}
// --- add these helpers ---
export function getAllLogsMap() {
  if (typeof window === "undefined" || typeof localStorage === "undefined") return {};
  try { return JSON.parse(localStorage.getItem("moodtrack:logs") || "{}"); }
  catch { return {}; }
}

export function setAllLogsMap(obj = {}) {
  if (typeof window === "undefined" || typeof localStorage === "undefined") return;
  localStorage.setItem("moodtrack:logs", JSON.stringify(obj));
}

export function exportCSV() {
  if (typeof window === "undefined" || typeof localStorage === "undefined") return "";
  const map = JSON.parse(localStorage.getItem("moodtrack:logs") || "{}");
  const rows = [
    ["date","mood","sleepHours","steps","sunlightMins","socialMins","note"]
  ];
  Object.keys(map).sort().forEach(k => {
    const l = map[k] || {};
    rows.push([
      l.date || k,
      Number(l.mood ?? 0),
      Number(l.sleepHours ?? 0),
      Number(l.steps ?? 0),
      Number(l.sunlightMins ?? 0),
      Number(l.socialMins ?? 0),
      (l.note ?? "").replace(/\r?\n/g, " ")
    ]);
  });
  const csv = rows.map(r => r.map(cell => {
    const s = String(cell);
    return /[",\n]/.test(s) ? `"${s.replace(/"/g,'""')}"` : s;
  }).join(",")).join("\n");

  // trigger download
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = "moodtrack-export.csv";
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);

  return csv;
}


export function deleteLogForDate(date = new Date()) {
  const key = dateKey(date);
  if (typeof window === "undefined" || typeof localStorage === "undefined") return false;
  try {
    const raw = localStorage.getItem("moodtrack:logs");
    const all = raw ? JSON.parse(raw) : {};
    if (!all[key]) return false;
    delete all[key];
    localStorage.setItem("moodtrack:logs", JSON.stringify(all));
    return true;
  } catch {
    return false;
  }
}
// Add this new export
export function getLogsSinceDays(days = 7) {
  // returns entries whose date >= today - days
  const allRaw = (typeof window !== "undefined" && typeof localStorage !== "undefined")
    ? JSON.parse(localStorage.getItem("moodtrack:logs") || "{}")
    : {};

  const today = new Date();
  const cutoff = new Date(today);
  cutoff.setDate(today.getDate() - (Number(days) || 0));

  const cutoffKey = (() => {
    const y = cutoff.getFullYear();
    const m = String(cutoff.getMonth() + 1).padStart(2, "0");
    const d = String(cutoff.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  })();

  const keys = Object.keys(allRaw)
    .filter(k => k >= cutoffKey)      // keep only dates within window
    .sort((a, b) => (a < b ? 1 : -1)); // newest first

  return keys.map(k => allRaw[k]);
}

