// GET /api/stats
// Returns everything the frontend needs in one request:
//   - All team leaderboards (runs, sixes, fours, wickets, wins, highScore)
//   - Points table with NRR
//   - Completed match results
//   - Full schedule with status
//   - Season counts

import { connectDB, Match, Team, SCHEDULE } from './_db.js';

export default async function handler(req, res) {
  // Cache for 5 minutes on CDN — Vercel edge will serve this fast
  res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate=600');

  try {
    await connectDB();

    const [teams, completedMatches] = await Promise.all([
      Team.find({}).lean(),
      Match.find({ status: 'completed' }).sort({ matchId: 1 }).lean(),
    ]);

    const completedIds = new Set(completedMatches.map(m => m.matchId));

    // ── Points table: sorted by points desc, then NRR desc ──
    const pointsTable = [...teams].sort((a, b) =>
      b.points - a.points || b.nrr - a.nrr
    ).map((t, i) => ({
      rank:      i + 1,
      id:        t.id,
      name:      t.name,
      played:    t.played,
      wins:      t.wins,
      losses:    t.losses,
      points:    t.points,
      nrr:       t.nrr,
      form:      t.form || [],
    }));

    // ── Leaderboards: sorted desc, top 10 ────────────────────
    const lb = (key) =>
      [...teams]
        .filter(t => t[key] > 0)
        .sort((a, b) => b[key] - a[key])
        .slice(0, 10)
        .map((t, i) => ({ rank: i + 1, id: t.id, name: t.name, value: t[key] }));

    const leaderboards = {
      runs:      lb('runs'),
      sixes:     lb('sixes'),
      fours:     lb('fours'),
      wickets:   lb('wickets'),
      wins:      lb('wins'),
      highScore: lb('highScore'),
    };

    // ── Season counts ────────────────────────────────────────
    const counts = {
      total:     74,
      completed: completedMatches.length,
      remaining: 74 - completedMatches.length,
    };

    // ── Schedule with status ─────────────────────────────────
    const schedule = SCHEDULE.slice(0, 62).map(s => {
      const result = completedMatches.find(m => m.matchId === s.matchId);
      return {
        matchId: s.matchId,
        date:    s.date,
        t1:      s.t1,
        t2:      s.t2,
        venue:   s.venue,
        status:  result ? 'completed' : 'upcoming',
        ...(result && {
          s1:     result.s1,
          w1:     result.w1,
          ov1:    result.ov1,
          s2:     result.s2,
          w2:     result.w2,
          ov2:    result.ov2,
          winner: result.winner,
          result: result.result,
          potm:   result.potm,
        }),
      };
    });

    res.json({
      ok:           true,
      updatedAt:    new Date().toISOString(),
      counts,
      pointsTable,
      leaderboards,
      recentResults: completedMatches.slice(-5).reverse().map(m => ({
        matchId: m.matchId,
        date:    m.date,
        t1: m.t1, s1: m.s1, w1: m.w1, ov1: m.ov1,
        t2: m.t2, s2: m.s2, w2: m.w2, ov2: m.ov2,
        winner:  m.winner,
        result:  m.result,
        potm:    m.potm,
        venue:   m.venue,
      })),
      schedule,
    });

  } catch (err) {
    console.error('/api/stats error:', err);
    res.status(500).json({ ok: false, error: err.message });
  }
}
