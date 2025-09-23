import { useState } from "react";

export default function MoodPicker({ initial = 5, onChange }) {
  const [mood, setMood] = useState(initial);

  function set(val) {
    setMood(val);
    onChange && onChange(val);
  }

  return (
    <div className="flex items-center gap-2">
      <span className="text-sm opacity-70">Mood:</span>
      <input
        type="range"
        min="1"
        max="10"
        value={mood}
        onChange={(e) => set(Number(e.target.value))}
      />
      <span className="w-6 text-center text-sm">{mood}</span>
    </div>
  );
}



