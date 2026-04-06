import React from 'react';
import { getTeam, formatOvers } from '../utils/teams.js';

function MatchCard({ match }) {
  const t1 = getTeam(match.t1);
  const t2 = getTeam(match.t2);
  const isT1Win = match.winner === match.t1;

  return (
    <div className="card p-5 fade-up hover:border-gray-600 transition-colors">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="text-xs text-gray-500 font-mono">
          Match {match.matchId} · {match.date}
        </div>
        <span className="text-xs bg-emerald-500/10 text-emerald-400 border border-emerald-500/20
                         rounded-full px-2.5 py-0.5 font-medium">
          Completed
        </span>
      </div>

      {/* Scores */}
      <div className="space-y-3 mb-4">
        {/* Team 1 */}
        <div className={`flex items-center gap-3 ${isT1Win ? 'opacity-100' : 'opacity-50'}`}>
          <div className="w-9 h-9 rounded-xl flex items-center justify-center text-[10px] font-black flex-shrink-0"
            style={{ background: t1.bg, color: t1.color, border: `1px solid ${t1.color}40` }}>
            {match.t1}
          </div>
          <div className="flex-1">
            <div className="font-semibold text-sm" style={{ color: isT1Win ? t1.color : '#9ca3af' }}>
              {t1.name}
            </div>
          </div>
          <div className="text-right">
            <div className={`text-xl font-bold font-mono ${isT1Win ? 'text-white' : 'text-gray-500'}`}>
              {match.s1}/{match.w1}
            </div>
            <div className="text-xs text-gray-600">({formatOvers(match.ov1)} ov)</div>
          </div>
          {isT1Win && (
            <div className="w-1.5 h-8 rounded-full bg-emerald-500 flex-shrink-0" />
          )}
        </div>

        {/* Divider */}
        <div className="border-t border-border" />

        {/* Team 2 */}
        <div className={`flex items-center gap-3 ${!isT1Win ? 'opacity-100' : 'opacity-50'}`}>
          <div className="w-9 h-9 rounded-xl flex items-center justify-center text-[10px] font-black flex-shrink-0"
            style={{ background: t2.bg, color: t2.color, border: `1px solid ${t2.color}40` }}>
            {match.t2}
          </div>
          <div className="flex-1">
            <div className="font-semibold text-sm" style={{ color: !isT1Win ? t2.color : '#9ca3af' }}>
              {t2.name}
            </div>
          </div>
          <div className="text-right">
            <div className={`text-xl font-bold font-mono ${!isT1Win ? 'text-white' : 'text-gray-500'}`}>
              {match.s2}/{match.w2}
            </div>
            <div className="text-xs text-gray-600">({formatOvers(match.ov2)} ov)</div>
          </div>
          {!isT1Win && (
            <div className="w-1.5 h-8 rounded-full bg-emerald-500 flex-shrink-0" />
          )}
        </div>
      </div>

      {/* Result + venue */}
      <div className="border-t border-border pt-3 space-y-1">
        <div className="text-sm font-medium text-emerald-400">{match.result}</div>
        {match.potm && (
          <div className="text-xs text-gray-500">
            🏅 Player of the Match: <span className="text-gray-300">{match.potm}</span>
          </div>
        )}
        {match.venue && (
          <div className="text-xs text-gray-600">{match.venue}</div>
        )}
      </div>

      {/* Mini boundary stats */}
      <div className="mt-3 pt-3 border-t border-border grid grid-cols-4 gap-2 text-center">
        {[
          { label: `${match.t1} 6s`, value: match.six1  || 0 },
          { label: `${match.t1} 4s`, value: match.four1 || 0 },
          { label: `${match.t2} 6s`, value: match.six2  || 0 },
          { label: `${match.t2} 4s`, value: match.four2 || 0 },
        ].map(s => (
          <div key={s.label} className="bg-gray-800/50 rounded-lg py-1.5">
            <div className="text-sm font-bold font-mono text-white">{s.value}</div>
            <div className="text-[9px] text-gray-600">{s.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function Results({ data, loading }) {
  const results = data?.recentResults || [];

  if (loading) {
    return (
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {[1,2,3].map(i => <div key={i} className="skeleton h-64 rounded-xl" />)}
      </div>
    );
  }

  return (
    <div className="fade-up">
      <p className="text-sm text-gray-500 mb-4">
        Showing {results.length} most recent completed matches
      </p>

      {results.length === 0 ? (
        <div className="card px-6 py-12 text-center">
          <div className="text-3xl mb-3">🏏</div>
          <div className="text-gray-400 font-medium">No completed matches yet</div>
          <div className="text-gray-600 text-sm mt-1">Season started 28 March 2026</div>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {results.map(m => <MatchCard key={m.matchId} match={m} />)}
        </div>
      )}
    </div>
  );
}
