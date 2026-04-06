import React, { useState } from 'react';
import { getTeam, formatOvers } from '../utils/teams.js';

const TEAMS = ['RCB','MI','CSK','KKR','SRH','RR','DC','PBKS','GT','LSG'];

export default function Schedule({ data, loading }) {
  const [filterTeam,   setFilterTeam]   = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  const schedule = data?.schedule || [];

  const filtered = schedule.filter(m => {
    if (filterTeam   && m.t1 !== filterTeam   && m.t2 !== filterTeam)   return false;
    if (filterStatus && m.status !== filterStatus)                       return false;
    return true;
  });

  // Group by month
  const grouped = filtered.reduce((acc, m) => {
    const key = m.date ? m.date.split(' ').slice(1).join(' ') : 'TBD';
    (acc[key] = acc[key] || []).push(m);
    return acc;
  }, {});

  // Find the next upcoming match
  const nextMatch = schedule.find(m => m.status === 'upcoming' && m.t1 !== 'TBD');

  const completed = schedule.filter(m => m.status === 'completed').length;
  const upcoming  = schedule.filter(m => m.status === 'upcoming').length;

  if (loading) return <div className="skeleton h-96 w-full rounded-xl" />;

  return (
    <div className="fade-up">
      {/* Summary bar */}
      <div className="flex items-center gap-4 text-sm text-gray-500 mb-4 flex-wrap">
        <span>
          <span className="text-emerald-400 font-semibold">{completed}</span> completed
        </span>
        <span>
          <span className="text-gray-300 font-semibold">{upcoming}</span> upcoming
        </span>
        {nextMatch && (
          <span className="ml-auto text-xs bg-yellow-500/10 text-yellow-400
                           border border-yellow-500/20 rounded-full px-3 py-1">
            Next: {nextMatch.t1} vs {nextMatch.t2} · {nextMatch.date}
          </span>
        )}
      </div>

      {/* Filters */}
      <div className="flex gap-3 mb-5 flex-wrap">
        <select
          value={filterTeam}
          onChange={e => setFilterTeam(e.target.value)}
          className="bg-card border border-border rounded-lg px-3 py-2 text-sm text-gray-300
                     focus:outline-none focus:border-gray-500 cursor-pointer"
        >
          <option value="">All teams</option>
          {TEAMS.map(t => (
            <option key={t} value={t} className="bg-gray-900">
              {t} — {getTeam(t).name}
            </option>
          ))}
        </select>

        <select
          value={filterStatus}
          onChange={e => setFilterStatus(e.target.value)}
          className="bg-card border border-border rounded-lg px-3 py-2 text-sm text-gray-300
                     focus:outline-none focus:border-gray-500 cursor-pointer"
        >
          <option value="">All matches</option>
          <option value="completed">Completed only</option>
          <option value="upcoming">Upcoming only</option>
        </select>

        <span className="self-center text-xs text-gray-600">
          {filtered.length} matches shown
        </span>
      </div>

      {/* Schedule grouped by month */}
      {Object.entries(grouped).map(([month, matches]) => (
        <section key={month} className="mb-8">
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-3">
            {month}
          </h3>
          <div className="space-y-2">
            {matches.map(m => <ScheduleRow key={m.matchId} match={m} isNext={nextMatch?.matchId === m.matchId} />)}
          </div>
        </section>
      ))}

      {filtered.length === 0 && (
        <div className="card px-6 py-10 text-center text-gray-500 text-sm">
          No matches found for selected filters
        </div>
      )}
    </div>
  );
}

function ScheduleRow({ match, isNext }) {
  const t1   = getTeam(match.t1);
  const t2   = getTeam(match.t2);
  const done = match.status === 'completed';

  return (
    <div className={`flex items-center gap-3 px-4 py-3 rounded-xl border transition-colors flex-wrap
      ${done
        ? 'border-emerald-500/20 bg-emerald-500/5'
        : isNext
          ? 'border-yellow-500/30 bg-yellow-500/5'
          : 'border-border bg-card hover:border-gray-600'}`}>

      {/* Match # */}
      <div className="text-xs text-gray-600 font-mono w-8 flex-shrink-0">
        M{match.matchId}
      </div>

      {/* Date */}
      <div className="text-xs text-gray-500 w-24 flex-shrink-0">{match.date}</div>

      {/* Teams */}
      <div className="flex-1 flex items-center gap-2 min-w-0">
        <span className="text-sm font-semibold" style={{ color: done && match.winner === match.t1 ? t1.color : '#d1d5db' }}>
          {match.t1}
        </span>
        <span className="text-gray-600 text-xs">vs</span>
        <span className="text-sm font-semibold" style={{ color: done && match.winner === match.t2 ? t2.color : '#d1d5db' }}>
          {match.t2}
        </span>

        {/* Scores inline for completed */}
        {done && (
          <span className="text-xs text-gray-500 font-mono ml-1 hidden sm:inline">
            {match.s1}/{match.w1} ({formatOvers(match.ov1)}) v {match.s2}/{match.w2} ({formatOvers(match.ov2)})
          </span>
        )}
      </div>

      {/* Venue */}
      <div className="text-xs text-gray-600 hidden lg:block max-w-[180px] truncate">
        {match.venue}
      </div>

      {/* Status badge */}
      {done ? (
        <span className="text-xs bg-emerald-500/10 text-emerald-400
                         border border-emerald-500/20 rounded-full px-2.5 py-0.5 flex-shrink-0">
          {match.winner} won
        </span>
      ) : isNext ? (
        <span className="text-xs bg-yellow-500/10 text-yellow-400
                         border border-yellow-500/20 rounded-full px-2.5 py-0.5 flex-shrink-0">
          Next
        </span>
      ) : (
        <span className="text-xs text-gray-600 flex-shrink-0">Upcoming</span>
      )}
    </div>
  );
}
