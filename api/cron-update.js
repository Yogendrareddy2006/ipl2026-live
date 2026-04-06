// ============================================================
// VERCEL CRON JOB — runs automatically at 11 PM IST every day
// (17:30 UTC = 23:00 IST)
//
// What it does:
//   1. Finds all upcoming matches whose date has passed
//   2. Asks Claude AI (web search) for the real result
//   3. Saves to MongoDB
//   4. Updates team stats cumulatively
//   5. Done — website frontend shows new data on next load
// ============================================================

import { connectDB, Match, SCHEDULE } from './_db.js';
import { applyMatchStats }            from './_updateStats.js';
import Anthropic                      from '@anthropic-ai/sdk';

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export const config = { maxDuration: 60 };

export default async function handler(req, res) {
  // Security: only Vercel cron or requests with secret can call this
  const auth = req.headers['authorization'];
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  await connectDB();

  const today = new Date();
  const results = [];

  // Find all completed matches already in DB
  const doneDocs   = await Match.find({ status: 'completed' });
  const doneIds    = new Set(doneDocs.map(m => m.matchId));

  // Process up to 3 new matches per cron run (handles double-headers)
  let processed = 0;

  for (const fixture of SCHEDULE) {
    if (doneIds.has(fixture.matchId)) continue;
    if (fixture.t1 === 'TBD')        continue;

    // Only check matches whose date has passed
    const matchDate = new Date(fixture.date);
    matchDate.setHours(23, 59, 0, 0); // match ends by midnight IST
    if (matchDate > today)            continue;

    console.log(`Fetching result: M${fixture.matchId} ${fixture.t1} vs ${fixture.t2} (${fixture.date})`);

    const result = await fetchMatchResult(fixture);

    if (result && result.completed) {
      // Save match
      const matchDoc = await Match.findOneAndUpdate(
        { matchId: fixture.matchId },
        {
          $set: {
            ...fixture,
            s1: result.s1, w1: result.w1, ov1: result.ov1,
            six1: result.six1, four1: result.four1,
            s2: result.s2, w2: result.w2, ov2: result.ov2,
            six2: result.six2, four2: result.four2,
            winner: result.winner,
            result: result.result,
            potm:   result.potm,
            status: 'completed',
          },
        },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );

      // Update team stats (cumulative +=, idempotent)
      await applyMatchStats(matchDoc);

      results.push({
        matchId:  fixture.matchId,
        match:    `${fixture.t1} vs ${fixture.t2}`,
        winner:   result.winner,
        result:   result.result,
      });

      processed++;
      if (processed >= 3) break;
    } else {
      // Not yet played — stop here, don't skip ahead
      console.log(`M${fixture.matchId} not yet played, stopping.`);
      break;
    }
  }

  console.log(`Cron done. Processed ${processed} new match(es).`);
  res.json({ ok: true, processed, results, timestamp: new Date().toISOString() });
}

// ── ASK CLAUDE TO SEARCH FOR REAL MATCH RESULT ───────────────
async function fetchMatchResult(fixture) {
  const prompt = `Search ESPNcricinfo for the real result of this IPL 2026 match:
Match ${fixture.matchId}: ${fixture.t1} vs ${fixture.t2}, ${fixture.date}, ${fixture.venue}

If completed, reply ONLY with this JSON (no markdown, no explanation):
{
  "completed": true,
  "winner": "${fixture.t1} or ${fixture.t2}",
  "s1": <${fixture.t1} total runs as integer>,
  "w1": <${fixture.t1} wickets lost as integer>,
  "ov1": <${fixture.t1} overs as decimal like 20 or 18.3>,
  "six1": <${fixture.t1} sixes hit>,
  "four1": <${fixture.t1} fours hit>,
  "s2": <${fixture.t2} total runs as integer>,
  "w2": <${fixture.t2} wickets lost as integer>,
  "ov2": <${fixture.t2} overs as decimal>,
  "six2": <${fixture.t2} sixes hit>,
  "four2": <${fixture.t2} fours hit>,
  "result": "<one-line result e.g. RCB won by 6 wickets>",
  "potm": "<Player of the Match name and figures>"
}

If NOT yet played: {"completed": false}`;

  try {
    const message = await anthropic.messages.create({
      model:      'claude-sonnet-4-20250514',
      max_tokens: 500,
      tools: [{ type: 'web_search_20250305', name: 'web_search' }],
      messages: [{ role: 'user', content: prompt }],
    });

    const text = message.content
      .filter(b => b.type === 'text')
      .map(b => b.text)
      .join('');

    const start = text.indexOf('{');
    const end   = text.lastIndexOf('}');
    if (start === -1 || end === -1) return null;

    const parsed = JSON.parse(text.slice(start, end + 1));
    return parsed;
  } catch (err) {
    console.error(`fetchMatchResult error for M${fixture.matchId}:`, err.message);
    return null;
  }
}
