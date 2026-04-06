// PointsTable.jsx
import React from 'react';
import { getTeam, formatNRR } from '../utils/teams.js';

function FormBadge({ r }) {
  return (
    <span className={`w-4 h-4 rounded text-[9px] font-bold flex items-center justify-center inline-flex
      ${r==='W'?'bg-emerald-500/20 text-emerald-400':'bg-red-500/20 text-red-400'}`}>
      {r}
    </span>
  );
}

export default function PointsTable({ data, loading }) {
  const table = data?.pointsTable || [];
  if (loading) return <div className="skeleton h-80 w-full rounded-xl" />;

  return (
    <div className="fade-up">
      <p className="text-sm text-gray-500 mb-4">
        Win = 2 pts · Tie/No Result = 1 pt · Loss = 0 pts · Top 4 qualify for playoffs
      </p>
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                {['#','Team','P','W','L','Form','NRR','Pts'].map(h => (
                  <th key={h} className={`px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider
                    ${h==='Team'?'text-left':'text-center'}`}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {table.map((row, i) => {
                const meta = getTeam(row.id);
                const nrrVal = parseFloat(row.nrr || 0);
                return (
                  <React.Fragment key={row.id}>
                    {i === 4 && (
                      <tr><td colSpan={8} className="px-4">
                        <div className="border-t-2 border-dashed border-gray-600/50 my-0.5" />
                        <div className="text-[9px] text-gray-600 text-center py-0.5">Playoff qualification line</div>
                      </td></tr>
                    )}
                    <tr className="border-b border-border/50 hover:bg-gray-800/40 transition-colors">
                      <td className="px-4 py-3 text-center text-gray-500 font-mono text-xs">{row.rank}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-lg flex items-center justify-center text-[9px] font-black flex-shrink-0"
                            style={{ background: meta.bg, color: meta.color }}>
                            {row.id}
                          </div>
                          <div>
                            <div className="font-medium text-white text-sm">{row.id}</div>
                            <div className="text-[10px] text-gray-500 hidden sm:block">{meta.name}</div>
                          </div>
                          {i < 4 && <span className="hidden lg:inline text-[9px] bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 rounded px-1.5 py-0.5">Q</span>}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-center font-mono text-gray-400">{row.played}</td>
                      <td className="px-4 py-3 text-center font-mono font-semibold"
                        style={{ color: row.wins>0?'#4ade80':'#6b7280' }}>{row.wins}</td>
                      <td className="px-4 py-3 text-center font-mono"
                        style={{ color: row.losses>0?'#f87171':'#6b7280' }}>{row.losses}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-0.5 justify-center">
                          {(row.form||[]).slice(-5).map((r,j)=><FormBadge key={j} r={r}/>)}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-center font-mono text-xs"
                        style={{ color: nrrVal>0?'#4ade80':nrrVal<0?'#f87171':'#9ca3af' }}>
                        {formatNRR(nrrVal)}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className="font-bold text-lg font-mono"
                          style={{ color: row.points>0?'white':'#374151' }}>
                          {row.points}
                        </span>
                      </td>
                    </tr>
                  </React.Fragment>
                );
              })}
              {!loading && table.length===0 && (
                <tr><td colSpan={8} className="text-center text-gray-600 py-10 text-sm">
                  No data yet — season starts 28 March 2026
                </td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
