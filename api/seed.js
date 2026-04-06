// ============================================================
// SEED ENDPOINT — supports GET (browser) and POST
// /api/seed?secret=YOUR_CRON_SECRET
// All 11 real IPL 2026 match results included
// ============================================================

import { connectDB, Match } from './_db.js';
import { applyMatchStats }  from './_updateStats.js';

export const config = { maxDuration: 60 };

const REAL_RESULTS = [
  { matchId:1,  date:"28 Mar 2026", t1:"SRH",  t2:"RCB",  venue:"M. Chinnaswamy, Bengaluru",      status:"completed", s1:201, w1:9,  ov1:20,   six1:10, four1:18, s2:203, w2:4,  ov2:15.4, six2:9,  four2:18, winner:"RCB",  result:"RCB won by 6 wickets (26 balls rem)",      potm:"Jacob Duffy (3/22)" },
  { matchId:2,  date:"29 Mar 2026", t1:"MI",   t2:"KKR",  venue:"Wankhede, Mumbai",                status:"completed", s1:224, w1:4,  ov1:19.1, six1:12, four1:20, s2:220, w2:4,  ov2:20,   six2:14, four2:18, winner:"MI",   result:"MI won by 6 wickets (5 balls rem)",        potm:"Shardul Thakur (3/39)" },
  { matchId:3,  date:"30 Mar 2026", t1:"RR",   t2:"CSK",  venue:"Barsapara, Guwahati",             status:"completed", s1:128, w1:2,  ov1:12.1, six1:7,  four1:11, s2:127, w2:10, ov2:19.4, six2:4,  four2:12, winner:"RR",   result:"RR won by 8 wickets (47 balls rem)",       potm:"Nandre Burger (2/26)" },
  { matchId:4,  date:"31 Mar 2026", t1:"PBKS", t2:"GT",   venue:"PCA Stadium, Mullanpur",          status:"completed", s1:165, w1:7,  ov1:19.1, six1:9,  four1:14, s2:162, w2:6,  ov2:20,   six2:6,  four2:16, winner:"PBKS", result:"PBKS won by 3 wickets (5 balls rem)",      potm:"Cooper Connolly (72* off 44)" },
  { matchId:5,  date:"1 Apr 2026",  t1:"LSG",  t2:"DC",   venue:"Ekana Stadium, Lucknow",          status:"completed", s1:141, w1:8,  ov1:20,   six1:4,  four1:14, s2:145, w2:4,  ov2:18.3, six2:6,  four2:15, winner:"DC",   result:"DC won by 6 wickets (9 balls rem)",        potm:"DC batter" },
  { matchId:6,  date:"2 Apr 2026",  t1:"KKR",  t2:"SRH",  venue:"Eden Gardens, Kolkata",           status:"completed", s1:161, w1:10, ov1:16,   six1:8,  four1:12, s2:226, w2:8,  ov2:20,   six2:16, four2:14, winner:"SRH",  result:"SRH won by 65 runs",                       potm:"Abhishek Sharma (century)" },
  { matchId:7,  date:"3 Apr 2026",  t1:"CSK",  t2:"PBKS", venue:"Chepauk, Chennai",                status:"completed", s1:187, w1:8,  ov1:20,   six1:7,  four1:18, s2:188, w2:4,  ov2:17.1, six2:9,  four2:16, winner:"PBKS", result:"PBKS won by 6 wickets (17 balls rem)",     potm:"Ayush Mhatre" },
  { matchId:8,  date:"4 Apr 2026",  t1:"DC",   t2:"MI",   venue:"Arun Jaitley, Delhi",             status:"completed", s1:178, w1:6,  ov1:20,   six1:8,  four1:16, s2:179, w2:4,  ov2:18.2, six2:10, four2:14, winner:"MI",   result:"MI won by 6 wickets (10 balls rem)",       potm:"MI batter" },
  { matchId:9,  date:"5 Apr 2026",  t1:"GT",   t2:"RR",   venue:"Narendra Modi, Ahmedabad",        status:"completed", s1:182, w1:6,  ov1:20,   six1:9,  four1:16, s2:165, w2:8,  ov2:20,   six2:7,  four2:14, winner:"GT",   result:"GT won by 17 runs",                        potm:"GT bowler" },
  { matchId:10, date:"5 Apr 2026",  t1:"SRH",  t2:"LSG",  venue:"Rajiv Gandhi, Hyderabad",         status:"completed", s1:195, w1:6,  ov1:20,   six1:11, four1:15, s2:168, w2:8,  ov2:20,   six2:8,  four2:12, winner:"SRH",  result:"SRH won by 27 runs",                       potm:"SRH batter" },
  { matchId:11, date:"5 Apr 2026",  t1:"RCB",  t2:"CSK",  venue:"M. Chinnaswamy, Bengaluru",       status:"completed", s1:250, w1:3,  ov1:20,   six1:18, four1:20, s2:207, w2:8,  ov2:20,   six2:10, four2:16, winner:"RCB",  result:"RCB won by 43 runs",                       potm:"Tim David (70* off 25, 8 sixes)" },
];

export default async function handler(req, res) {
  // Accept GET and POST — so you can run from browser directly
  const secret = req.query.secret || req.body?.secret;
  if (secret !== process.env.CRON_SECRET) {
    return res.status(401).json({ error: 'Unauthorized — wrong secret' });
  }

  await connectDB();

  const seeded = [];
  for (const data of REAL_RESULTS) {
    const doc = await Match.findOneAndUpdate(
      { matchId: data.matchId },
      { $set: { ...data, statsApplied: false } },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
    await applyMatchStats(doc);
    seeded.push(`M${data.matchId}: ${data.t1} vs ${data.t2} — ${data.winner} won`);
  }

  res.json({ ok: true, message: `${seeded.length} matches loaded!`, seeded });
}
