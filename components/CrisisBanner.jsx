'use client';
import { useEffect, useState } from 'react';

export default function CrisisBanner() {
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    setHidden(sessionStorage.getItem('moodtrack:hideCrisisBanner') === '1');
  }, []);

  if (hidden) return null;

  return (
    <div className="mb-4 rounded-lg border border-red-400 bg-red-50 text-red-900 p-3 text-sm">
      <div className="flex items-start justify-between gap-3">
        <p>
          If you’re in immediate danger or thinking about harming yourself, call your local
          emergency number (<strong>112</strong> in the EU) or seek urgent help. MoodTrack is not a medical service.
        </p>
        <button
          className="shrink-0 rounded border px-2 py-1"
          onClick={() => {
            sessionStorage.setItem('moodtrack:hideCrisisBanner', '1');
            setHidden(true);
          }}
          aria-label="Hide crisis banner"
        >
          Dismiss
        </button>
      </div>
    </div>
  );
}
