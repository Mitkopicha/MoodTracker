'use client';
import { useEffect, useState } from 'react';

const CONSENT_KEY = 'moodtrack:consentAccepted';
const PID_KEY = 'moodtrack:pid';

function makePID() {
  return 'MT-' + Math.random().toString(36).slice(2, 8).toUpperCase();
}

export default function ConsentModal() {
  const [show, setShow] = useState(false);
  const [checks, setChecks] = useState({ a:false, b:false, c:false, d:false });

  useEffect(() => {
    const accepted = localStorage.getItem(CONSENT_KEY);
    if (!accepted) setShow(true);
  }, []);

  if (!show) return null;

  const allChecked = Object.values(checks).every(Boolean);

  function accept() {
    if (!localStorage.getItem(PID_KEY)) {
      localStorage.setItem(PID_KEY, makePID());
    }
    localStorage.setItem(CONSENT_KEY, new Date().toISOString());
    setShow(false);
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
      <div className="max-w-lg w-full rounded-lg bg-white text-black p-5 space-y-3">
        <h2 className="text-xl font-semibold">Before you start</h2>
        <p className="text-sm opacity-80">
          MoodTrack is a private self-monitoring tool for reflection and routines. It is <strong>not</strong> a
          diagnostic or treatment app. You can stop using it at any time. Data is stored on your device
          (local-first). The chatbot gives general, fact-based suggestions only.
        </p>

        <div className="space-y-2 text-sm">
          <label className="flex gap-2">
            <input type="checkbox" onChange={e=>setChecks(s=>({...s,a:e.target.checked}))}/>
            I am 18+ and not in crisis.
          </label>
          <label className="flex gap-2">
            <input type="checkbox" onChange={e=>setChecks(s=>({...s,b:e.target.checked}))}/>
            I understand data is stored locally and I can export/delete it in Settings.
          </label>
          <label className="flex gap-2">
            <input type="checkbox" onChange={e=>setChecks(s=>({...s,c:e.target.checked}))}/>
            I understand the chatbot is not medical advice.
          </label>
          <label className="flex gap-2">
            <input type="checkbox" onChange={e=>setChecks(s=>({...s,d:e.target.checked}))}/>
            I can withdraw any time and omit questions.
          </label>
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <button className="rounded border px-3 py-1" onClick={()=>setShow(false)}>Close</button>
          <button
            disabled={!allChecked}
            className="rounded px-3 py-1 bg-blue-600 text-white disabled:opacity-50"
            onClick={accept}
          >
            I Agree
          </button>
        </div>
      </div>
    </div>
  );
}
