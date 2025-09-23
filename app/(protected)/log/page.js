// app/log/page.js
"use client";

import { useEffect, useMemo, useState } from "react";
import EmojiMoodPicker from "../../../components/EmojiMoodPicker.jsx";
import {
  getLogForDate,
  saveLogForDate,
  dateKey,
  deleteLogForDate,
} from "../../../lib/storage";
import { autoUploadDebounced } from "../../../lib/autoSync";

function toInputDate(d) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}
function fromInputDate(s) {
  const [y, m, d] = s.split("-").map(Number);
  return new Date(y, (m || 1) - 1, d || 1);
}

export default function LogPage() {
  const [dateStr, setDateStr] = useState(toInputDate(new Date()));
  const selectedDate = useMemo(() => fromInputDate(dateStr), [dateStr]);

  const [mood, setMood] = useState(5);
  const [note, setNote] = useState("");
  const [sleepHours, setSleepHours] = useState(0);
  const [steps, setSteps] = useState(0);
  const [sunlightMins, setSunlightMins] = useState(0);
  const [socialMins, setSocialMins] = useState(0);
  const [savedMsg, setSavedMsg] = useState("");

  useEffect(() => {
    const existing = getLogForDate(selectedDate);
    setMood(existing?.mood ?? 5);
    setNote(existing?.note ?? "");
    setSleepHours(existing?.sleepHours ?? 0);
    setSteps(existing?.steps ?? 0);
    setSunlightMins(existing?.sunlightMins ?? 0);
    setSocialMins(existing?.socialMins ?? 0);
  }, [selectedDate]);

  function save() {
    saveLogForDate(selectedDate, {
      mood,
      note,
      sleepHours,
      steps,
      sunlightMins,
      socialMins,
    });
    autoUploadDebounced();
    setSavedMsg("Saved ✓");
    setTimeout(() => setSavedMsg(""), 1500);
  }

  function removeDay() {
    if (!confirm(`Delete entry for ${dateKey(selectedDate)}? This cannot be undone.`)) return;
    if (deleteLogForDate(selectedDate)) {
      setNote("");
      setSleepHours(0);
      setSteps(0);
      setSunlightMins(0);
      setSocialMins(0);
      setMood(5);
      autoUploadDebounced();
      setSavedMsg("Deleted ✓");
      setTimeout(() => setSavedMsg(""), 1500);
    } else {
      alert("No entry to delete for this date.");
    }
  }

  const card =
    "rounded-2xl bg-white/95 backdrop-blur shadow-lg ring-1 ring-sky-200/70 p-4 sm:p-6";
  const input =
    "h-11 w-full rounded-xl border border-slate-300 px-3 text-[15px] " +
    "focus:outline-none focus:ring-2 focus:ring-sky-300 focus:border-sky-300";
  const btn =
    "h-11 inline-flex items-center justify-center rounded-xl px-4 text-sm font-medium active:scale-[.99]";
  const btnPrimary = `${btn} bg-blue-600 text-white border border-blue-600 hover:brightness-110`;
  const btnGhost = `${btn} border border-slate-300 hover:bg-slate-50`;
  const btnDanger = `${btn} bg-red-600 text-white border border-red-600 hover:brightness-110`;

  return (
    <div className="relative min-h-screen">
      {/* calm sky background */}
      <div
        aria-hidden
        className="absolute inset-0 -z-10 bg-gradient-to-b from-sky-100 via-sky-200/80 to-sky-300/80"
      />
  
      {/* page container */}
      <div className="mx-auto max-w-2xl sm:max-w-3xl px-3 sm:px-6 pb-28 sm:pb-10 space-y-3 sm:space-y-6">
        {/* Header */}
        <header className={`${card} p-3 sm:p-6`}>
          <h1 className="text-[22px] sm:text-3xl font-bold text-center">Record today’s mood and habits. </h1>
          <p className="text-xs sm:text-sm text-slate-600 text-center">
          Entries save locally (and sync if enabled)
          </p>
  
          {/* Date row */}
          <div className="mt-3 sm:mt-4 flex items-center gap-2 sm:gap-3 flex-wrap">
            <label className="text-xs sm:text-sm opacity-80">Date:</label>
            <input
              type="date"
              className={input + " w-auto h-10 sm:h-11"}
              value={dateStr}
              onChange={(e) => setDateStr(e.target.value)}
              max={toInputDate(new Date())}
            />
            <span className="text-xs sm:text-sm opacity-60">
              ({dateKey(selectedDate)})
            </span>
            <div className="ml-auto">
              <button
                className={`${btnGhost} h-10 sm:h-11 px-3 sm:px-4`}
                onClick={() => setDateStr(toInputDate(new Date()))}
                title="Jump to today"
              >
                Today
              </button>
            </div>
          </div>
        </header>
  
        {/* Mood */}
        <section className="rounded-2xl bg-amber-50/95 backdrop-blur shadow-lg ring-1 ring-amber-300/60 p-4 sm:p-6 space-y-4">
          <h2 className="text-base sm:text-lg font-semibold">Mood</h2>
          {/* Bigger, thumb-friendly emojis that scroll horizontally on narrow screens */}
          <EmojiMoodPicker value={mood} onChange={setMood} />
        </section>
  
        {/* Habits + Note */}
        <section className={`${card} p-3 sm:p-6 space-y-3`}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
            <label className="text-sm">
              <span className="opacity-70 mb-1 block">Sleep (hours)</span>
              <input
                type="number"
                inputMode="decimal"
                step="0.5"
                min="0"
                className={input + " h-10 sm:h-11"}
                value={sleepHours}
                onChange={(e) => setSleepHours(Number(e.target.value))}
              />
            </label>
  
            <label className="text-sm">
              <span className="opacity-70 mb-1 block">Steps</span>
              <input
                type="number"
                inputMode="numeric"
                step="100"
                min="0"
                className={input + " h-10 sm:h-11"}
                value={steps}
                onChange={(e) => setSteps(Number(e.target.value))}
              />
            </label>
  
            <label className="text-sm">
              <span className="opacity-70 mb-1 block">Sunlight (mins)</span>
              <input
                type="number"
                inputMode="numeric"
                step="5"
                min="0"
                className={input + " h-10 sm:h-11"}
                value={sunlightMins}
                onChange={(e) => setSunlightMins(Number(e.target.value))}
              />
            </label>
  
            <label className="text-sm">
              <span className="opacity-70 mb-1 block">Social time (mins)</span>
              <input
                type="number"
                inputMode="numeric"
                step="5"
                min="0"
                className={input + " h-10 sm:h-11"}
                value={socialMins}
                onChange={(e) => setSocialMins(Number(e.target.value))}
              />
            </label>
          </div>
  
          <label className="text-sm block">
            <span className="opacity-70 mb-1 block">Note</span>
            <textarea
              rows={4}
              className={input + " resize-y"}
              placeholder="Anything meaningful about today…"
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />
          </label>
        </section>
      </div>
  
      {/*mobile */}
      <div
        className="
          fixed bottom-0 left-0 right-0 z-30
          sm:static sm:z-auto
          bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/65
          border-t border-slate-200
          px-3 sm:px-0
          pt-2 pb-[calc(env(safe-area-inset-bottom,0)+8px)]
        "
      >
    <div className="mx-auto w-full max-w-[720px] px-safe sm:px-5 pb-10 space-y-4 sm:space-y-6">
     <button onClick={save} className={`${btnPrimary} col-span-1 sm:col-span-2`}>
            Save
          </button>
          <button onClick={removeDay} className={btnDanger}>
            Delete this day
          </button>
        </div>
  
        {savedMsg && (
          <div className="mx-auto max-w-2xl sm:max-w-3xl px-safe sm:px-6 pb-10 ...">
          {savedMsg}
          </div>
        )}
      </div>
    </div>
  );
}