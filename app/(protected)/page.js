// app/page.js
"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import { getRecentLogs } from "../../lib/storage";
import { getNudges } from "../../lib/nudges";
import RequireAuth from "../../components/RequireAuth";

const Line = dynamic(() => import("react-chartjs-2").then(m => m.Line), { ssr: false });
import {
  Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend,
} from "chart.js";
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend);

function fmtDate(d) {
  try { return new Date(d).toLocaleDateString(undefined, { month: "short", day: "2-digit" }); }
  catch { return d; }
}
const moodEmoji = (m) => ["","😟","😕","😐","🙂","😊","😄","🤩"][Math.max(0, Math.min(7, Math.round(m||0)))];

export default function Page() {
  return (
    <RequireAuth>
      <DashboardInner />
    </RequireAuth>
  );
}

function DashboardInner() {
  const [logs, setLogs] = useState([]);
  const [nudges, setNudges] = useState([]);

  useEffect(() => {
    const recent = getRecentLogs(7) || [];
    setLogs(recent);
    setNudges(getNudges(recent) || []);
  }, []);

  const latest = useMemo(() => logs[logs.length - 1], [logs]);

  const chartData = useMemo(() => {
    if (!logs.length) return { labels: [], datasets: [] };
    return {
      labels: logs.map(l => fmtDate(l.date)),
      datasets: [{
        label: "Mood (last 7 days)",
        data: logs.map(l => Number(l.mood || 0)),
        borderWidth: 2,
        pointRadius: 3,
        tension: 0.25,
      }],
    };
  }, [logs]);

  const chartOptions = useMemo(() => ({
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: { min: 1, max: 7, ticks: { stepSize: 1 } },
      x: { ticks: { maxRotation: 0, autoSkip: true } },
    },
    plugins: { legend: { display: false }, tooltip: { intersect: false, mode: "index" } },
    interaction: { intersect: false, mode: "index" },
    spanGaps: true,
  }), []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-100 to-blue-200 px-4 py-6 space-y-4">
      <h1 className="text-2xl font-bold">MoodTrack</h1>
      <p className="opacity-80 text-sm">Local-first. Optional sync if you want it later.</p>

      {/* Today snapshot */}
      <div className="rounded-2xl border border-gray-200/80 bg-white/80 backdrop-blur-sm shadow-sm p-4">
        <div className="flex items-center gap-3">
          <div className="text-4xl">{moodEmoji(latest?.mood) || "🗓️"}</div>
          <div>
            <div className="font-semibold">{latest ? `Today • ${fmtDate(latest.date)}` : "No entry for today"}</div>
            {latest ? (
              <div className="text-sm text-gray-600">Mood {latest.mood}/7</div>
            ) : (
              <div className="text-sm text-gray-600">Add a quick log to get started.</div>
            )}
          </div>
          <div className="ml-auto">
            <Link href="/log" className="rounded-lg px-3 py-2 border hover:bg-black/5 text-sm">
              {latest ? "Update log" : "Log today"}
            </Link>
          </div>
        </div>

        {latest && (
          <div className="mt-3 flex flex-wrap gap-2 text-sm">
            {latest.sleepHours != null && (
              <span className="px-2 py-1 rounded-lg bg-blue-50 border border-blue-100">Sleep: {latest.sleepHours}h</span>
            )}
            {Number.isFinite(latest.steps) && (
              <span className="px-2 py-1 rounded-lg bg-green-50 border border-green-100">
                Steps: {Intl.NumberFormat().format(latest.steps)}
              </span>
            )}
            {latest.sunlightMins != null && (
              <span className="px-2 py-1 rounded-lg bg-yellow-50 border border-yellow-100">Sun: {latest.sunlightMins}m</span>
            )}
            {latest.socialMins != null && (
              <span className="px-2 py-1 rounded-lg bg-purple-50 border border-purple-100">Social: {latest.socialMins}m</span>
            )}
            {latest.note && <span className="px-2 py-1 rounded-lg bg-gray-50 border border-gray-200">“{latest.note}”</span>}
          </div>
        )}
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Link href="/log" className="rounded-xl border border-gray-200/80 bg-white/80 backdrop-blur-sm shadow-sm p-4 text-center">
          <div className="text-2xl">✍️</div>
          <div className="mt-1 font-medium">Log today</div>
        </Link>
        <Link href="/history" className="rounded-xl border border-gray-200/80 bg-white/80 backdrop-blur-sm shadow-sm p-4 text-center">
          <div className="text-2xl">📈</div>
          <div className="mt-1 font-medium">History</div>
        </Link>
        <Link href="/settings" className="rounded-xl border border-gray-200/80 bg-white/80 backdrop-blur-sm shadow-sm p-4 text-center">
          <div className="text-2xl">⚙️</div>
          <div className="mt-1 font-medium">Settings</div>
        </Link>
        <Link href="/chat" className="rounded-xl border border-gray-200/80 bg-white/80 backdrop-blur-sm shadow-sm p-4 text-center">
          <div className="text-2xl">💬</div>
          <div className="mt-1 font-medium">Chatbot</div>
        </Link>
      </div>

      {/* Suggestion */}
      <div className="rounded-2xl border border-gray-200/80 bg-white/80 backdrop-blur-sm shadow-sm p-4">
        <div className="font-semibold mb-1">Today’s suggestions</div>
        {nudges.length ? (
          <ul className="list-disc pl-5 space-y-1">
            {nudges.map((n, i) => <li key={i}>{n}</li>)}
          </ul>
        ) : (
          <p className="text-gray-600 text-sm">No suggestions yet. Log something today.</p>
        )}
      </div>

      {/* Mini chart preview */}
      <div className="rounded-2xl border border-gray-200/80 bg-white/80 backdrop-blur-sm shadow-sm p-4">
        <div className="flex items-center justify-between mb-2">
          <div className="font-semibold">Mood trend (7 days)</div>
          <Link href="/history" className="text-sm underline">Open history</Link>
        </div>
        <div className="h-40">
          {logs.length ? (
            <Line data={chartData} options={chartOptions} />
          ) : (
            <div className="h-full flex items-center justify-center text-sm text-gray-600">No data yet</div>
          )}
        </div>
      </div>

      <footer className="pt-2 pb-1 text-center text-gray-600 text-sm">
        💙 Thanks for using <span className="font-semibold">MoodTrack</span>.
      </footer>
    </div>
  );
}
