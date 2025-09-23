// components/EmojiMoodPicker.jsx
"use client";

export default function EmojiMoodPicker({ value = 4, onChange }) {
  const moods = [
    { v: 1, e: "😞", label: "Very low" },
    { v: 2, e: "😕", label: "Low" },
    { v: 3, e: "😐", label: "Okay" },
    { v: 4, e: "🙂", label: "Good" },
    { v: 5, e: "😊", label: "Positive" },
    { v: 6, e: "😄", label: "Great" },
    { v: 7, e: "🤩", label: "Excellent" },
  ];

  const current = moods.find((m) => m.v === value) ?? moods[3];

  return (
    <div className="select-none">
      {/* Big emoji + label */}
      <div className="flex items-center justify-center gap-3">
        <span className="leading-none text-5xl md:text-6xl">{current.e}</span>
        <div className="text-left">
          <div className="text-lg font-semibold">{current.label}</div>
          <div className="text-xs text-slate-500">Mood: {value} / 7</div>
        </div>
      </div>

      {/* Segmented selector – wraps on desktop, scrolls on small screens without showing bar */}
      <div className="mt-4 flex gap-1 sm:grid sm:grid-cols-7 sm:gap-1 overflow-x-auto no-scrollbar">
        {moods.map((m) => {
          const active = m.v === value;
          return (
            <button
              key={m.v}
              type="button"
              aria-label={m.label}
              title={m.label}
              onClick={() => onChange?.(m.v)}
              className={[
                "shrink-0 h-12 w-12 sm:h-12 sm:w-auto sm:flex-1",
                "rounded-xl border text-xl transition active:scale-[.98]",
                active
                  ? "bg-blue-600 text-white border-blue-600"
                  : "bg-white hover:bg-slate-50 border-slate-300",
              ].join(" ")}
            >
              {m.e}
            </button>
          );
        })}
      </div>
    </div>
  );
}
