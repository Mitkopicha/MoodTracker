// app/history/page.jsx
"use client";

import { useEffect, useState, useMemo } from "react";
import dynamic from "next/dynamic";
import { getLogsSinceDays } from "../../../lib/storage";
import { toMultiSeries, METRIC_BOUNDS } from "../../../lib/charts";

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

// subtle chart-area background (inside the card)
ChartJS.register({
  id: "chartAreaBackground",
  beforeDraw: (chart, _args, opts) => {
    const { ctx, chartArea } = chart;
    if (!chartArea) return;
    ctx.save();
    ctx.fillStyle = opts?.color || "transparent";
    ctx.fillRect(
      chartArea.left,
      chartArea.top,
      chartArea.right - chartArea.left,
      chartArea.bottom - chartArea.top
    );
    ctx.restore();
  },
});

const Line = dynamic(() => import("react-chartjs-2").then((m) => m.Line), { ssr: false });

const ALL_METRICS = ["mood", "sleepHours", "steps", "sunlightMins", "socialMins"];
const LABEL = (k) => METRIC_BOUNDS[k]?.label || k;
const RANGES = [7, 14, 30];

function fmtDate(d) {
  try {
    return new Date(d).toLocaleDateString(undefined, { year: "numeric", month: "2-digit", day: "2-digit" });
  } catch {
    return d;
  }
}
function fmtNum(value, key) {
  if (key === "steps") return Intl.NumberFormat().format(value);
  return String(value);
}

export default function HistoryPage() {
  const [range, setRange] = useState(14);
  const [mounted, setMounted] = useState(false);
  const [logs, setLogs] = useState([]);
  const [selected, setSelected] = useState(["mood"]);
  const [normalize, setNormalize] = useState(true);
  const [showTrend, setShowTrend] = useState(false);
  const [trendWindow, setTrendWindow] = useState(3);

  useEffect(() => setMounted(true), []);
  useEffect(() => {
    if (mounted) setLogs(getLogsSinceDays(range));
  }, [mounted, range]);

  // main chart data
  const chartData = useMemo(
    () => toMultiSeries(logs, selected.length ? selected : ["mood"], { normalize }),
    [logs, selected, normalize]
  );

  // optional rolling average on first selected metric
  const trendData = useMemo(() => {
    if (!showTrend || !logs.length || selected.length === 0) return null;
    const key = selected[0];
    const w = Math.max(2, Math.min(trendWindow, 7));
    const vals = logs.map((l) => Number(l?.[key] ?? NaN));
    const trend = vals.map((_, i) => {
      const start = Math.max(0, i - (w - 1));
      const slice = vals.slice(start, i + 1).filter((v) => Number.isFinite(v));
      if (!slice.length) return NaN;
      const avg = slice.reduce((a, b) => a + b, 0) / slice.length;
      return normalize && METRIC_BOUNDS[key]
        ? (avg - METRIC_BOUNDS[key].min) / (METRIC_BOUNDS[key].max - METRIC_BOUNDS[key].min)
        : avg;
    });
    return {
      label: `${LABEL(key)} — ${w}-day avg`,
      data: trend,
      borderWidth: 2,
      borderDash: [6, 6],
      pointRadius: 0,
      tension: 0.35,
    };
  }, [logs, selected, trendWindow, showTrend, normalize]);

  const mergedData = useMemo(() => {
    if (!chartData?.datasets) return chartData;
    return {
      ...chartData,
      datasets: trendData ? [...chartData.datasets, trendData] : chartData.datasets,
    };
  }, [chartData, trendData]);

  // readable grid/ticks that work on your light cards
  const options = useMemo(() => {
    let y = {};
    if (normalize) y = { min: 0, max: 1 };
    else if (selected.length === 1) {
      const b = METRIC_BOUNDS[selected[0]];
      if (b) y = { min: b.min, max: b.max };
    }

    const gridColor = "rgba(0,0,0,.08)";
    const tickColor = "rgba(17,24,39,.8)"; // gray-900-ish

    return {
      responsive: true,
      maintainAspectRatio: false,
      spanGaps: true,
      interaction: { mode: "index", intersect: false },
      elements: { point: { radius: 3 }, line: { tension: 0.25 } },
      scales: {
        x: { ticks: { maxRotation: 0, autoSkip: true, color: tickColor }, grid: { color: gridColor, drawBorder: false } },
        y: { ...y, ticks: { color: tickColor }, grid: { color: gridColor, drawBorder: false } },
      },
      plugins: {
        legend: { display: true, labels: { color: tickColor } },
        tooltip: {
          callbacks: {
            title(items) { return items?.[0]?.label || ""; },
            label(ctx) {
              const key = ctx.dataset?.metricKey;
              if (!key) return ctx.formattedValue;
              if (normalize && selected.length === 1) {
                const b = METRIC_BOUNDS[key];
                if (b) {
                  const raw = Math.round(ctx.parsed.y * (b.max - b.min) + b.min);
                  return `${LABEL(key)}: ${ctx.formattedValue} (≈ ${fmtNum(raw, key)})`;
                }
              }
              return `${LABEL(key)}: ${fmtNum(ctx.raw, key)}`;
            },
          },
        },
        chartAreaBackground: { color: "rgba(255,255,255,0.55)" }, // soft fill that matches your cards
      },
    };
  }, [normalize, selected]);

  // averages (raw)
  const averages = useMemo(() => {
    const map = {};
    selected.forEach((m) => {
      const vals = logs.map((l) => Number(l?.[m])).filter((v) => Number.isFinite(v));
      const avg = vals.length ? vals.reduce((a, b) => a + b, 0) / vals.length : 0;
      map[m] = +avg.toFixed(m === "mood" ? 1 : 2);
    });
    return map;
  }, [logs, selected]);

  function toggleMetric(m) {
    setSelected((prev) => (prev.includes(m) ? prev.filter((x) => x !== m) : [...prev, m]));
  }

  function downloadCSV() {
    const headers = ["date", "mood", "sleepHours", "steps", "sunlightMins", "socialMins", "note"];
    const rows = [headers.join(",")].concat(logs.map((l) => headers.map((h) => l[h] ?? "").join(",")));
    const blob = new Blob([rows.join("\n")], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `moodtrack_${range}d.csv`; a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-100 to-blue-200 px-4 py-6 space-y-4">
      <h1 className="text-2xl font-bold text-center">This is your MoodTrack History</h1>
      <p className="text-sm text-center text-gray-600">See how your mood and habits have changed over time</p>
      {/* Controls card — same vibe as your other pages */}
      <div className="rounded-2xl border border-gray-200/80 bg-white/80 backdrop-blur-sm shadow-sm p-3 md:p-4 flex items-center gap-3 flex-wrap">
        <label className="text-sm text-gray-600">Range:</label>
        <select className="border rounded px-2 py-1" value={range} onChange={(e) => setRange(Number(e.target.value))}>
          {RANGES.map((n) => (
            <option key={n} value={n}>{n} days</option>
          ))}
        </select>

        <span className="divider" />

        <span className="text-sm text-gray-600">Compare:</span>
        <div className="flex items-center gap-3 flex-wrap max-w-full overflow-x-auto no-scrollbar">
          {ALL_METRICS.map((m) => (
            <label key={m} className="text-sm flex items-center gap-1 whitespace-nowrap">
              <input type="checkbox" checked={selected.includes(m)} onChange={() => toggleMetric(m)} />
              {LABEL(m)}
            </label>
          ))}
        </div>

        <span className="divider" />

        <label className="text-sm flex items-center gap-2 whitespace-nowrap">
          <input type="checkbox" checked={normalize} onChange={(e) => setNormalize(e.target.checked)} />
          Normalize (0–1)
        </label>

        <label className="text-sm flex items-center gap-2 whitespace-nowrap">
          <input type="checkbox" checked={showTrend} onChange={(e) => setShowTrend(e.target.checked)} />
          Trend
        </label>

        {showTrend && (
          <select className="border rounded px-2 py-1 text-sm" value={trendWindow} onChange={(e) => setTrendWindow(Number(e.target.value))}>
            {[3, 5, 7].map((n) => (
              <option key={n} value={n}>{n}-day avg</option>
            ))}
          </select>
        )}

        <button onClick={downloadCSV} className="ml-auto border rounded px-2 py-1 text-sm hover:bg-black/5">
          Export your MoodTrack History as a CSV file
        </button>

        <span className="text-xs text-gray-500">
          &nbsp;Showing {logs.length} entr{logs.length === 1 ? "y" : "ies"}
        </span>
      </div>

      {/* Chart card */}
      {!mounted ? (
        <div className="h-72 rounded-2xl border border-gray-200/80 bg-white/80 backdrop-blur-sm shadow-sm flex items-center justify-center text-gray-500">
          Loading…
        </div>
      ) : logs.length ? (
        <div className="h-72 rounded-2xl border border-gray-200/80 bg-white/80 backdrop-blur-sm shadow-sm p-2 md:p-3">
          <Line
            key={`${range}-${normalize}-${selected.join(",")}-${logs.length}-${logs[0]?.date ?? ""}`}
            data={{
              ...mergedData,
              datasets: (mergedData?.datasets || []).map((ds) => ({
                ...ds,
                metricKey: ds.metricKey,
              })),
            }}
            options={options}
          />
        </div>
      ) : (
        <p className="opacity-80">No data yet. Log your mood and habits to see history.</p>
      )}

      {/* Averages as stat cards */}
      {logs.length > 0 && (
        <div className="space-y-2">
          <div className="text-sm font-semibold">Averages (last {range} days)</div>
          <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 md:grid-cols-3">
            {selected.map((m) => (
              <div
                key={m}
                className="rounded-xl border border-gray-200/80 bg-white/80 backdrop-blur-sm shadow-sm px-4 py-3"
              >
                <div className="text-xs text-gray-600">{LABEL(m)}</div>
                <div className="text-lg font-semibold">
                  {fmtNum(averages[m], m)}
                  {m === "sleepHours" ? " h" : ""}
                  {m === "sunlightMins" ? " mins" : ""}
                  {m === "socialMins" ? " mins" : ""}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

     {/* Raw list (newest first) */}
<div className="space-y-3">
  {mounted &&
    [...logs].reverse().map((l) => (
      <div
        key={l.date}
        className="rounded-xl border border-gray-200/70 bg-white/80 backdrop-blur-sm shadow-sm p-4"
      >
        <div className="flex justify-between items-center mb-2">
          <span className="font-semibold">{fmtDate(l.date)}</span>
          <span className="text-sm text-gray-600">Mood: {l.mood}</span>
        </div>

        <div className="flex flex-wrap gap-2 text-sm text-gray-700">
          {l.sleepHours && (
            <span className="px-2 py-1 rounded-lg bg-blue-50 border border-blue-100">
              Sleep: {l.sleepHours}h
            </span>
          )}
          {Number.isFinite(l.steps) && (
            <span className="px-2 py-1 rounded-lg bg-green-50 border border-green-100">
              Steps: {fmtNum(l.steps, "steps")}
            </span>
          )}
          {l.sunlightMins && (
            <span className="px-2 py-1 rounded-lg bg-yellow-50 border border-yellow-100">
              Sun: {l.sunlightMins}m
            </span>
          )}
          {l.socialMins && (
            <span className="px-2 py-1 rounded-lg bg-purple-50 border border-purple-100">
              Social: {l.socialMins}m
            </span>
          )}
        </div>

        {l.note && (
          <p className="mt-2 text-sm text-gray-600 italic">“{l.note}”</p>
        )}
      </div>
    ))}
</div>
</div>
  );
}

