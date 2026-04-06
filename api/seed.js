// ============================================================
// SEED ENDPOINT — call ONCE after deployment to load real data
// POST /api/seed?secret=YOUR_CRON_SECRET
// ============================================================

import { connectDB, Match } from './_db.js';
import { applyMatchStats }  from './_updateStats.js';

export const config = { maxDuration: 30 };

const REAL_RESULTS = [
  {
    matchId:1, date:"28 Mar 2026", t1:"SRH", t2:"RCB",
    venue:"M. Chinnaswamy Stadium, Bengaluru", status:"completed",
    s1:201, w1:9,  ov1:20,   six1:10, four1:18,
    s2:203, w2:4,  ov2:15.4, six2:9,  four2:18,
    winner:"RCB",
    result:"RCB won by 6 wickets (26 balls remaining)",
    potm:"Jacob Duffy (3/22)",
  },
  {
    matchId:2, date:"29 Mar 2026", t1:"MI", t2:"KKR",
    venue:"Wankhede Stadium, Mumbai", status:"completed",
    s1:224, w1:4, ov1:19.1, six1:12, four1:20,
    s2:220, w2:4, ov2:20,   six2:14, four2:18,
    winner:"MI",
    result:"MI won by 6 wickets (5 balls remaining)",
    potm:"Shardul Thakur (3/39)",
  },
  {
    matchId:3, date:"30 Mar 2026", t1:"RR", t2:"CSK",
    venue:"Barsapara Cricket Stadium, Guwahati", status:"completed",
    s1:128, w1:2,  ov1:12.1, six1:7, four1:11,
    s2:127, w2:10, ov2:19.4, six2:4, four2:12,
    winner:"RR",
    result:"RR won by 8 wickets (47 balls remaining)",
    potm:"Nandre Burger (2/26)",
  },
];

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'POST only' });

  const secret = req.query.secret || req.body?.secret;
  if (secret !== process.env.CRON_SECRET) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  await connectDB();

  const seeded = [];
  for (const data of REAL_RESULTS) {
    const doc = await Match.findOneAndUpdate(
      { matchId: data.matchId },
      { $set: data },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
    await applyMatchStats(doc);
    seeded.push(`M${data.matchId}: ${data.t1} vs ${data.t2} — ${data.winner} won`);
  }

  res.json({ ok: true, seeded });
}
