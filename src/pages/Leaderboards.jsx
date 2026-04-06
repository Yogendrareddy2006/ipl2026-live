import React from 'react';
import { getTeam } from '../utils/teams.js';

function Skeleton() {
  return (
    <div className="card p-4">
      <div className="skeleton h-4 w-32 mb-4" />
      {[...Array(5)].map((_, i) => (
        <div key={i} className="flex items-center gap-2 mb-3">
          <div className="skeleton w-5 h-5 rounded-full" />
          <div className="skeleton h-3 w-10" />
          <div className="skeleton h-2 flex-1" />
          <div className="skeleton h-3 w-10" />
        </div>
      ))}
    </div>
  );
}

function LeaderboardCard({ title, icon, rows, suffix = '' }) {
  const max = rows[0]?.value || 1;
  return (
    <div className="card p-5 fade-up">
      <div className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-4">
        {icon} {title}
      </div>
      {rows.length === 0 ? (
        <div className="text-center text-gray-600 text-sm py-4">No data yet</div>
      ) : (
        rows.map((row, i) => {
          const meta = getTeam(row.id);
          const pct  = Math.round((row.value / max) * 100);
          return (
            <div key={row.id} className="flex items-center gap-2.5 mb-2.5">
              {/* Rank */}
              <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0
                ${i === 0 ? 'bg-yellow-400 text-black'
                : i === 1 ? 'bg-gray-500 text-white'
                : i === 2 ? 'bg-amber-700 text-white'
                : 'text-gray-600 text-[11px]'}`}>
                {i + 1}
              </div>

              {/* Team abbr */}
              <div className="text-xs font-bold w-9 flex-shrink-0" style={{ color: meta.color }}>
                {row.id}
              </div>

              {/* Bar */}
              <div className="flex-1 bg-gray-800 rounded-full h-1.5 overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-700"
                  style={{ width: `${pct}%`, background: meta.color }}
                />
              </div>

              {/* Value */}
              <div className="text-sm font-bold font-mono text-white w-12 text-right tabular-nums">
                {typeof row.value === 'number' ? row.value.toLocaleString() : row.value}{suffix}
              </div>
            </div>
          );
        })
      )}
    </div>
  );
}

export default function Leaderboards({ data, loading }) {
  if (loading) {
    return (
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {[...Array(6)].map((_, i) => <Skeleton key={i} />)}
      </div>
    );
  }

  const lb = data?.leaderboards || {};

  const cards = [
    { key:'runs',      title:'Most runs',           icon:'🔥' },
    { key:'sixes',     title:'Most sixes',           icon:'💥' },
    { key:'fours',     title:'Most fours',           icon:'🎯' },
    { key:'wickets',   title:'Most wickets taken',   icon:'🏹' },
    { key:'wins',      title:'Most wins',            icon:'🏆' },
    { key:'highScore', title:'Highest team score',   icon:'⚡' },
  ];

  return (
    <div>
      <p className="text-sm text-gray-500 mb-4">
        All leaderboards update automatically after every match · Sorted highest first
      </p>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {cards.map(c => (
          <LeaderboardCard
            key={c.key}
            title={c.title}
            icon={c.icon}
            rows={lb[c.key] || []}
          />
        ))}
      </div>
    </div>
  );
}
