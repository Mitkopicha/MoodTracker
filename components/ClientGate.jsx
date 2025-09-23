'use client';
import { useEffect } from 'react';

const PID_KEY = 'moodtrack:pid';

function ensurePID() {
  if (typeof window === 'undefined') return;
  if (!localStorage.getItem(PID_KEY)) {
    const pid = 'MT-' + Math.random().toString(36).slice(2, 8).toUpperCase();
    localStorage.setItem(PID_KEY, pid);
  }
}

export default function ClientGate({ children }) {
  useEffect(() => { ensurePID(); }, []);
  return (
    <div>
      {children}
    </div>
  );
}
