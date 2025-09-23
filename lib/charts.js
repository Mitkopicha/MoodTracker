// lib/charts.js
// Existing single-series helper (keep this)
export function toChartSeries(logs = [], metric = "mood") {
  const sorted = [...logs].sort((a, b) => (a.date < b.date ? -1 : 1));
  const labelMap = {
    mood: "Mood",
    sleepHours: "Sleep (h)",
    steps: "Steps",
    sunlightMins: "Sunlight (mins)",
    socialMins: "Social (mins)",
  };
  return {
    labels: sorted.map((l) => l.date),
    datasets: [
      {
        label: labelMap[metric] || metric,
        data: sorted.map((l) => Number(l[metric] || 0)),
        borderColor: "#3b82f6",
        backgroundColor: "rgba(59,130,246,0.2)",
        tension: 0.3,
      },
    ],
  };
}

// Bounds per metric (for normalization)
export const METRIC_BOUNDS = {
  mood:         { min: 0,  max: 10, label: "Mood" },
  sleepHours:   { min: 0,  max: 14, label: "Sleep (h)" },
  steps:        { min: 0,  max: 20000, label: "Steps" },
  sunlightMins: { min: 0,  max: 180, label: "Sunlight (mins)" },
  socialMins:   { min: 0,  max: 240, label: "Social (mins)" },
};

// New: multi-series (optionally normalized 0–1 so different units can be compared)
export function toMultiSeries(logs = [], metrics = ["mood"], { normalize = true } = {}) {
  const sorted = [...logs].sort((a, b) => (a.date < b.date ? -1 : 1));
  const labels = sorted.map((l) => l.date);

  const palette = [
    "#3b82f6", // blue
    "#10b981", // emerald
    "#f59e0b", // amber
    "#ef4444", // red
    "#8b5cf6", // violet
  ];

  const datasets = metrics.map((m, i) => {
    const bounds = METRIC_BOUNDS[m] || { min: 0, max: 1, label: m };
    const raw = sorted.map((l) => Number(l?.[m] ?? 0));
    const data = normalize
      ? raw.map((v) => {
          const span = Math.max(1, bounds.max - bounds.min);
          return (v - bounds.min) / span; // 0..1
        })
      : raw;

    const color = palette[i % palette.length];
    return {
      label: bounds.label + (normalize ? " (norm)" : ""),
      data,
      borderColor: color,
      backgroundColor: color + "33",
      tension: 0.3,
    };
  });

  return { labels, datasets };
}
