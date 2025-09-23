"use client";
import { exportJSON, importJSON, clearAll, exportCSV } from "../../../lib/storage";
import { useEffect, useRef, useState } from "react";
import {
  isSyncEnabled, setSyncEnabled,
  getSyncIdentity, uploadLocalToCloud, downloadCloudToLocal, deleteAllCloudLogs
} from "../../../lib/firebaseSync";
import { useAuth } from "../../../components/AuthProvider";

/* ------- tiny UI helpers (styles only) ------- */
const btn = "inline-flex items-center justify-center h-10 px-4 rounded-xl border text-sm font-medium transition active:scale-[.99]";
const btnPrimary = `${btn} bg-blue-600 text-white border-blue-600 hover:brightness-110`;
const btnGhost   = `${btn} bg-white hover:bg-slate-50 border-slate-300`;
const btnDanger  = `${btn} bg-red-600 text-white border-red-600 hover:brightness-110`;
const section    = "rounded-2xl bg-white/95 ring-1 ring-black/5 shadow-sm p-4 sm:p-6 space-y-3";

/* -------------------------------------------- */

export default function SettingsPage() {
  const fileRef = useRef(null);
  const [pid, setPid] = useState("");
  const [syncOn, setSyncOn] = useState(false);
  const [uid, setUid] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");
  const { user } = useAuth();
  const SURVEY_URL = process.env.NEXT_PUBLIC_SURVEY_URL || "https://example.com/your-survey";

  useEffect(() => {
    setPid(localStorage.getItem("moodtrack:pid") || "");
    const on = isSyncEnabled();
    setSyncOn(on);
    if (on) getSyncIdentity().then(({ uid }) => setUid(uid)).catch(()=>{});
  }, []);

  function toast(s) { setMsg(s); setTimeout(() => setMsg(""), 1800); }

  async function toggleSync(e) {
    const on = e.target.checked;
    setSyncOn(on);
    setSyncEnabled(on);
    if (on) {
      try {
        const { uid } = await getSyncIdentity();
        setUid(uid);
        await import("../../lib/autoSync").then(m => m.safeUpload()).catch(() => {});
        toast("Cloud sync enabled");
      } catch {
        setSyncOn(false); setSyncEnabled(false);
        alert("Failed to enable sync. Check Firebase config.");
      }
    } else toast("Cloud sync disabled");
  }

  async function doUpload() {
    try { setBusy(true); const { count } = await uploadLocalToCloud(); toast(`Uploaded ${count} days`); }
    catch { alert("Upload failed."); }
    finally { setBusy(false); }
  }

  async function doDownload() {
    if (!confirm("This will OVERWRITE local data with cloud data. Continue?")) return;
    try { setBusy(true); const { count } = await downloadCloudToLocal(); toast(`Downloaded ${count} days`); }
    catch { alert("Download failed."); }
    finally { setBusy(false); }
  }

  function handleImport(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const ok = importJSON(String(reader.result || ""));
      alert(ok ? "Import successful" : "Import failed");
    };
    reader.readAsText(file);
  }

  return (
    <div className="relative min-h-screen">
  {/* background */}
  <div
    aria-hidden
    className="
      absolute inset-0 -z-10
      bg-white
      md:bg-gradient-to-b md:from-sky-100 md:via-sky-200/80 md:to-sky-300/80
    "
  />

  {/* blue panel behind cards on desktop */}
  <div className="hidden md:block absolute inset-x-0 top-12 bottom-0 -z-10">
    <div className="mx-auto max-w-5xl h-full rounded-3xl bg-sky-50/80 ring-1 ring-sky-200/70" />
  </div>

  {/* content container (keeps phone comfy, desktop roomy) */}
  <div className="mx-auto max-w-2xl sm:max-w-3xl px-safe sm:px-6 py-4 sm:py-10 ...">
  

  
        {/* page header card */}
        <div className="rounded-2xl bg-amber-50/95 backdrop-blur shadow-lg ring-1 ring-amber-300/60 p-4 sm:p-6">
        <h1 className="text-2xl font-bold">Settings</h1>
          <p className="text-sm text-slate-600">Signed in as <span className="font-medium">{user?.email || "anonymous"}</span></p>
        </div>
  
        {/* --- Data --- */}
        <section className="rounded-2xl bg-white/95 backdrop-blur shadow-lg ring-1 ring-sky-200/70 p-4 sm:p-6">
          <h2 className="text-lg font-semibold">Data</h2>
          <div className="mt-3 flex flex-wrap gap-2 sm:gap-3">
            <button className="h-11 px-4 rounded-xl text-sm font-medium border border-slate-300 hover:bg-slate-50 active:scale-[.99]" onClick={exportJSON}>Export JSON</button>
            <button className="h-11 px-4 rounded-xl text-sm font-medium border border-slate-300 hover:bg-slate-50 active:scale-[.99]" onClick={() => fileRef.current?.click()}>Import JSON</button>
            <button className="h-11 px-4 rounded-xl text-sm font-medium border border-slate-300 hover:bg-slate-50 active:scale-[.99]" onClick={exportCSV}>Export CSV</button>
            <input ref={fileRef} type="file" accept="application/json" className="hidden" onChange={handleImport} />
            <button className="h-11 px-4 rounded-xl text-sm font-medium border border-slate-300 hover:bg-slate-50 active:scale-[.99]" onClick={() => { clearAll(); alert("Cleared"); }}>Clear All</button>
          </div>
        </section>
  
        {/* --- Study & Privacy --- */}
        <section className="rounded-2xl bg-white/95 backdrop-blur shadow-lg ring-1 ring-sky-200/70 p-4 sm:p-6">
          <h2 className="text-lg font-semibold">Study & Privacy</h2>
          <div className="mt-2 text-sm">
            <div><span className="font-semibold">Participant ID:</span> {pid || "—"}</div>
            <button
              className="mt-3 h-10 px-3 rounded-xl border border-slate-300 hover:bg-slate-50 active:scale-[.99]"
              onClick={() => { navigator.clipboard.writeText(pid); alert("Participant ID copied"); }}
              disabled={!pid}
            >
              Copy ID
            </button>
          </div>
        </section>
  
        {/* --- Cloud Sync --- */}
        <section className="rounded-2xl bg-white/95 backdrop-blur shadow-lg ring-1 ring-sky-200/70 p-4 sm:p-6">
          <h2 className="text-lg font-semibold">Cloud Sync (optional)</h2>
  
          <label className="mt-2 flex items-center gap-3 text-sm">
            <input type="checkbox" checked={syncOn} onChange={toggleSync} className="scale-125 accent-blue-600" />
            Enable Firebase sync (anonymous). Local-first remains the default.
          </label>
  
          {syncOn && (
            <div className="mt-3 space-y-3">
              <div className="text-sm text-slate-600">Signed in as <code>{uid || "…"}</code></div>
              <div className="flex flex-wrap gap-2 sm:gap-3">
                <button
                  disabled={busy}
                  onClick={doUpload}
                  className="h-11 px-4 rounded-xl text-sm font-medium bg-blue-600 text-white border border-blue-600 hover:brightness-110 disabled:opacity-50 active:scale-[.99]"
                >
                  Upload local → cloud
                </button>
                <button
                  disabled={busy}
                  onClick={doDownload}
                  className="h-11 px-4 rounded-xl text-sm font-medium border border-slate-300 hover:bg-slate-50 disabled:opacity-50 active:scale-[.99]"
                >
                  Download cloud → local (overwrite)
                </button>
              </div>
            </div>
          )}
          {msg && <p className="mt-2 text-sm text-green-600">{msg}</p>}
        </section>
  
        {/* --- Account --- */}
        <section className="rounded-2xl bg-white/95 backdrop-blur shadow-lg ring-1 ring-sky-200/70 p-4 sm:p-6">
          <h2 className="text-lg font-semibold">Account</h2>
          {/* …leave your existing account block unchanged… */}
        </section>
  
        {/* --- Delete Cloud Data --- */}
        <section className="rounded-2xl bg-white/95 backdrop-blur shadow-lg ring-1 ring-sky-200/70 p-4 sm:p-6">
          <h2 className="text-lg font-semibold text-red-700">Delete Cloud Data</h2>
          <p className="mt-1 text-sm text-slate-600">
            This deletes all synced logs in your cloud account (Firestore). Local data on this device is not affected.
          </p>
          <button
            disabled={!syncOn || busy}
            onClick={deleteAllCloudLogs}
            className="mt-3 h-11 px-4 rounded-xl text-sm font-medium bg-red-600 text-white border border-red-600 hover:brightness-110 disabled:opacity-50 active:scale-[.99]"
          >
            Delete ALL cloud logs
          </button>
        </section>
  
        {/* --- Full Reset --- */}
        <section className="rounded-2xl bg-white/95 backdrop-blur shadow-lg ring-1 ring-sky-200/70 p-4 sm:p-6">
          <h2 className="text-lg font-semibold text-red-700">Full Reset</h2>
          <p className="mt-1 text-sm text-slate-600">
            Deletes your cloud logs (if sync is on) and clears all local data on this device.
          </p>
          <button
            className="mt-3 h-11 px-4 rounded-xl text-sm font-medium bg-red-700 text-white border border-red-700 hover:brightness-110 disabled:opacity-50 active:scale-[.99]"
            onClick={() => { if (!confirm("Delete ALL cloud logs (if any) and clear ALL local data? This cannot be undone.")) return;
              clearAll();
              toast("All data removed (cloud + local)");
            }}
          >
            Delete cloud + local data
          </button>
        </section>
  
        {/* --- Evaluation --- */}
        <section className="rounded-2xl bg-white/95 backdrop-blur shadow-lg ring-1 ring-sky-200/70 p-4 sm:p-6 mb-3">
          <h2 className="text-lg font-semibold">Evaluation</h2>
          <p className="mt-1 text-sm text-slate-600">
            If you’re taking part in the study, open the survey below. Your Participant ID will be attached automatically.
          </p>
          <div className="mt-3 flex flex-wrap gap-2 sm:gap-3">
            <a
              className="h-11 px-4 rounded-xl text-sm font-medium bg-blue-600 text-white border border-blue-600 hover:brightness-110 active:scale-[.99]"
              href={`${SURVEY_URL}?pid=${encodeURIComponent(pid || "")}`}
              target="_blank" rel="noreferrer"
            >
              Open Survey
            </a>
            <button
              className="h-11 px-4 rounded-xl text-sm font-medium border border-slate-300 hover:bg-slate-50 active:scale-[.99]"
              onClick={() => { if (!pid) return alert("No Participant ID found."); navigator.clipboard.writeText(pid); alert("Participant ID copied"); }}
            >
              Copy Participant ID
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}