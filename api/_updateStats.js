// ============================================================
// STATS ENGINE
// Cumulative += only. Never overwrites. Idempotent via statsApplied flag.
// Handles: win, loss, no_result (abandoned) — 1 point each for NR
// ============================================================

import { Match, Team, TEAM_NAMES } from './_db.js';

function ovsToDecimal(o) {
  const [w, b = 0] = String(o || 0).split('.').map(Number);
  return w + (b / 6);
}

export async function applyMatchStats(matchDoc) {
  if (matchDoc.statsApplied) return;

  const { t1, t2, s1, w1, ov1, six1, four1,
                  s2, w2, ov2, six2, four2,
                  winner, status } = matchDoc;

  const isNR = status === 'no_result' || status === 'abandoned';

  // For abandoned matches — only award points (1 each), no batting/bowling stats
  if (isNR) {
    for (const team of [t1, t2]) {
      if (!team || !TEAM_NAMES[team]) continue;
      await Team.findOneAndUpdate(
        { id: team },
        {
          $setOnInsert: { name: TEAM_NAMES[team] || team },
          $inc: { played: 1, noResult: 1, points: 1 },
        },
        { upsert: true, new: true }
      );
    }
    await Match.findOneAndUpdate({ matchId: matchDoc.matchId }, { $set: { statsApplied: true } });
    return;
  }

  const ov1d = ovsToDecimal(ov1);
  const ov2d = ovsToDecimal(ov2);
  const res1 = winner === t1 ? 'W' : 'L';
  const res2 = winner === t2 ? 'W' : 'L';

  // Team 1
  await Team.findOneAndUpdate(
    { id: t1 },
    {
      $setOnInsert: { name: TEAM_NAMES[t1] || t1 },
      $inc: {
        played: 1,
        wins:         res1 === 'W' ? 1 : 0,
        losses:       res1 === 'L' ? 1 : 0,
        points:       res1 === 'W' ? 2 : 0,
        runs:         s1,
        sixes:        six1,
        fours:        four1,
        wickets:      w2,
        runsScored:   s1,
        oversFaced:   ov1d,
        runsConceded: s2,
        oversBowled:  ov2d,
      },
      $max:  { highScore: s1 },
      $push: { form: { $each: [res1], $slice: -5 } },
    },
    { upsert: true, new: true }
  ).then(t => recomputeNRR(t));

  // Team 2
  await Team.findOneAndUpdate(
    { id: t2 },
    {
      $setOnInsert: { name: TEAM_NAMES[t2] || t2 },
      $inc: {
        played: 1,
        wins:         res2 === 'W' ? 1 : 0,
        losses:       res2 === 'L' ? 1 : 0,
        points:       res2 === 'W' ? 2 : 0,
        runs:         s2,
        sixes:        six2,
        fours:        four2,
        wickets:      w1,
        runsScored:   s2,
        oversFaced:   ov2d,
        runsConceded: s1,
        oversBowled:  ov1d,
      },
      $max:  { highScore: s2 },
      $push: { form: { $each: [res2], $slice: -5 } },
    },
    { upsert: true, new: true }
  ).then(t => recomputeNRR(t));

  await Match.findOneAndUpdate({ matchId: matchDoc.matchId }, { $set: { statsApplied: true } });
}

async function recomputeNRR(team) {
  if (!team) return;
  const br = team.oversFaced  > 0 ? team.runsScored   / team.oversFaced  : 0;
  const bl = team.oversBowled > 0 ? team.runsConceded / team.oversBowled : 0;
  const nrr = parseFloat((br - bl).toFixed(3));
  await Team.findOneAndUpdate({ id: team.id }, { $set: { nrr } });
}
