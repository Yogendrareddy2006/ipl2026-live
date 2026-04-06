import React, { useState } from 'react';
import { useStats }      from './hooks/useStats.js';
import Leaderboards      from './pages/Leaderboards.jsx';
import PointsTable       from './pages/PointsTable.jsx';
import Results           from './pages/Results.jsx';
import Schedule          from './pages/Schedule.jsx';

const TABS = [
  { id:'leaderboards', label:'Leaderboards' },
  { id:'points',       label:'Points Table' },
  { id:'results',      label:'Results'      },
  { id:'schedule',     label:'Schedule'     },
];

export default function App() {
  const [tab, setTab] = useState('leaderboards');
  const { data, loading, error, lastUpdated, refresh } = useStats();

  const counts = data?.counts;

  return (
    <div className="min-h-screen bg-dark text-white" style={{ fontFamily:'Inter,sans-serif' }}>

      {/* ── HEADER ─────────────────────────────────────────── */}
      <header className="sticky top-0 z-50 border-b border-border bg-dark/95 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex items-center gap-3 h-14 flex-wrap">

            {/* Logo */}
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-yellow-400 to-orange-500
                              flex items-center justify-center text-black font-black text-xs select-none">
                IPL
              </div>
              <div>
                <div className="text-sm font-bold leading-none">IPL 2026</div>
                <div className="text-[10px] text-gray-500 leading-none mt-0.5">Live Stats</div>
              </div>
            </div>

            {/* Match counter */}
            {counts && (
              <div className="hidden sm:flex items-center gap-1.5 bg-card border border-border
                              rounded-full px-3 py-1 text-xs text-gray-400">
                <span className="font-bold text-white font-mono">{counts.completed}</span>
                <span>of</span>
                <span className="font-bold text-white">74</span>
                <span>matches ·</span>
                <span className="text-gray-300">{counts.remaining} remaining</span>
              </div>
            )}

            {/* Last updated + refresh */}
            <div className="ml-auto flex items-center gap-2 text-xs text-gray-500">
              {lastUpdated && (
                <span className="hidden sm:inline">
                  Updated {lastUpdated.toLocaleTimeString('en-IN', { hour:'2-digit', minute:'2-digit' })}
                </span>
              )}
              <button
                onClick={refresh}
                className="btn text-xs px-3 py-1.5"
                title="Refresh data"
              >
                ↻ Refresh
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-1 pb-0 overflow-x-auto">
            {TABS.map(t => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-all whitespace-nowrap
                  ${tab === t.id
                    ? 'border-white text-white'
                    : 'border-transparent text-gray-500 hover:text-gray-300'}`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* ── MAIN ────────────────────────────────────────────── */}
      <main className="max-w-6xl mx-auto px-4 py-6">

        {/* Season progress bar */}
        {counts && (
          <div className="mb-6">
            <div className="flex justify-between text-xs text-gray-500 mb-1.5">
              <span>Season progress — IPL 2026</span>
              <span className="font-mono">{counts.completed} / 74 matches ({Math.round((counts.completed/74)*100)}%)</span>
            </div>
            <div className="bg-card rounded-full h-2 overflow-hidden border border-border">
              <div
                className="h-full bg-emerald-500 rounded-full transition-all duration-700"
                style={{ width: `${(counts.completed / 74) * 100}%` }}
              />
            </div>
          </div>
        )}

        {/* Error banner */}
        {error && (
          <div className="card border-red-500/30 bg-red-500/5 px-4 py-3 mb-6 text-sm text-red-400">
            ⚠ {error}
          </div>
        )}

        {/* Tab content */}
        {tab === 'leaderboards' && <Leaderboards data={data} loading={loading} />}
        {tab === 'points'       && <PointsTable  data={data} loading={loading} />}
        {tab === 'results'      && <Results      data={data} loading={loading} />}
        {tab === 'schedule'     && <Schedule     data={data} loading={loading} />}
      </main>

      {/* ── FOOTER ──────────────────────────────────────────── */}
      <footer className="border-t border-border mt-12 py-6 text-center text-xs text-gray-600">
        IPL 2026 Live Stats · Auto-updates daily at 11 PM IST via Claude AI web search · Free · No ads
      </footer>
    </div>
  );
}
