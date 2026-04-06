// ============================================================
// STATS ENGINE
// Called after every completed match.
// Uses $inc (+=) ONLY — never overwrites, never double-counts.
// Protected by statsApplied flag on each match document.
// ============================================================

import { Match, Team, TEAM_NAMES } from './_db.js';

// Convert "19.3" overs to decimal for NRR arithmetic
function ovsToDecimal(o) {
  const [w, b = 0] = String(o || 0).split('.').map(Number);
  return w + (b / 6);
}

export async function applyMatchStats(matchDoc) {
  // Guard: never process same match twice
  if (matchDoc.statsApplied) return;

  const { t1, t2, s1, w1, ov1, six1, four1, s2, w2, ov2, six2, four2, winner } = matchDoc;

  const ov1d = ovsToDecimal(ov1);
  const ov2d = ovsToDecimal(ov2);

  const res1 = winner === t1 ? 'W' : 'L';
  const res2 = winner === t2 ? 'W' : 'L';

  // ── Team 1 update (batting = s1, bowling = s2) ────────────
  await Team.findOneAndUpdate(
    { id: t1 },
    {
      $setOnInsert: { name: TEAM_NAMES[t1] || t1 },
      $inc: {
        played:       1,
        wins:         res1 === 'W' ? 1 : 0,
        losses:       res1 === 'L' ? 1 : 0,
        points:       res1 === 'W' ? 2 : 0,
        runs:         s1,
        sixes:        six1,
        fours:        four1,
        wickets:      w2,      // wickets team1 TOOK (= t2's wickets lost)
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

  // ── Team 2 update (batting = s2, bowling = s1) ────────────
  await Team.findOneAndUpdate(
    { id: t2 },
    {
      $setOnInsert: { name: TEAM_NAMES[t2] || t2 },
      $inc: {
        played:       1,
        wins:         res2 === 'W' ? 1 : 0,
        losses:       res2 === 'L' ? 1 : 0,
        points:       res2 === 'W' ? 2 : 0,
        runs:         s2,
        sixes:        six2,
        fours:        four2,
        wickets:      w1,      // wickets team2 TOOK
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

  // ── Mark match as processed ───────────────────────────────
  await Match.findOneAndUpdate(
    { matchId: matchDoc.matchId },
    { $set: { statsApplied: true } }
  );
}

async function recomputeNRR(team) {
  if (!team) return;
  const br = team.oversFaced   > 0 ? team.runsScored   / team.oversFaced   : 0;
  const bl = team.oversBowled  > 0 ? team.runsConceded / team.oversBowled  : 0;
  const nrr = parseFloat((br - bl).toFixed(3));
  await Team.findOneAndUpdate({ id: team.id }, { $set: { nrr } });
}
