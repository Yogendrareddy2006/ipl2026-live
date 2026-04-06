// Shared MongoDB connection — reused across serverless function calls
// Vercel keeps connections warm between invocations on the same instance

import mongoose from 'mongoose';

let cached = global._mongoConn;
if (!cached) cached = global._mongoConn = { conn: null, promise: null };

export async function connectDB() {
  if (cached.conn) return cached.conn;
  if (!cached.promise) {
    cached.promise = mongoose.connect(process.env.MONGODB_URI, {
      bufferCommands: false,
      serverSelectionTimeoutMS: 8000,
    }).then(m => m);
  }
  cached.conn = await cached.promise;
  return cached.conn;
}

// ── Match Schema ──────────────────────────────────────────────
const MatchSchema = new mongoose.Schema({
  matchId:   { type: Number, unique: true, index: true },
  date:      String,
  t1:        String,
  t2:        String,
  venue:     String,
  status:    { type: String, enum: ['upcoming','completed'], default: 'upcoming' },
  // Scores
  s1: Number, w1: Number, ov1: Number,
  s2: Number, w2: Number, ov2: Number,
  // Boundaries
  six1: { type: Number, default: 0 },
  four1:{ type: Number, default: 0 },
  six2: { type: Number, default: 0 },
  four2:{ type: Number, default: 0 },
  // Result
  winner: String,
  result: String,
  potm:   String,
  // Guard: prevent double-processing
  statsApplied: { type: Boolean, default: false },
}, { timestamps: true });

// ── Team Schema ───────────────────────────────────────────────
const TeamSchema = new mongoose.Schema({
  id:       { type: String, unique: true, index: true },
  name:     String,
  // All stats are cumulative — ONLY ever use $inc to update
  played:   { type: Number, default: 0 },
  wins:     { type: Number, default: 0 },
  losses:   { type: Number, default: 0 },
  points:   { type: Number, default: 0 },
  runs:     { type: Number, default: 0 },
  sixes:    { type: Number, default: 0 },
  fours:    { type: Number, default: 0 },
  wickets:  { type: Number, default: 0 },
  highScore:{ type: Number, default: 0 },
  // NRR components
  runsScored:   { type: Number, default: 0 },
  oversFaced:   { type: Number, default: 0 },
  runsConceded: { type: Number, default: 0 },
  oversBowled:  { type: Number, default: 0 },
  nrr:          { type: Number, default: 0 },
  form:         { type: [String], default: [] },
}, { timestamps: true });

// Use existing models if already compiled (important for serverless)
export const Match = mongoose.models.Match || mongoose.model('Match', MatchSchema);
export const Team  = mongoose.models.Team  || mongoose.model('Team',  TeamSchema);

// ── Full IPL 2026 schedule ─────────────────────────────────────
export const SCHEDULE = [
  {matchId:1, date:"28 Mar 2026",t1:"SRH",t2:"RCB",venue:"M. Chinnaswamy, Bengaluru"},
  {matchId:2, date:"29 Mar 2026",t1:"MI", t2:"KKR",venue:"Wankhede, Mumbai"},
  {matchId:3, date:"30 Mar 2026",t1:"RR", t2:"CSK",venue:"Barsapara, Guwahati"},
  {matchId:4, date:"31 Mar 2026",t1:"PBKS",t2:"GT",venue:"PCA, Mullanpur"},
  {matchId:5, date:"1 Apr 2026", t1:"LSG",t2:"DC", venue:"Ekana, Lucknow"},
  {matchId:6, date:"2 Apr 2026", t1:"KKR",t2:"SRH",venue:"Eden Gardens, Kolkata"},
  {matchId:7, date:"3 Apr 2026", t1:"CSK",t2:"PBKS",venue:"Chepauk, Chennai"},
  {matchId:8, date:"4 Apr 2026", t1:"DC", t2:"MI", venue:"Arun Jaitley, Delhi"},
  {matchId:9, date:"5 Apr 2026", t1:"GT", t2:"RR", venue:"Narendra Modi, Ahmedabad"},
  {matchId:10,date:"6 Apr 2026", t1:"SRH",t2:"LSG",venue:"Rajiv Gandhi, Hyderabad"},
  {matchId:11,date:"7 Apr 2026", t1:"RCB",t2:"CSK",venue:"M. Chinnaswamy, Bengaluru"},
  {matchId:12,date:"8 Apr 2026", t1:"KKR",t2:"PBKS",venue:"Eden Gardens, Kolkata"},
  {matchId:13,date:"9 Apr 2026", t1:"RR", t2:"MI", venue:"Sawai Mansingh, Jaipur"},
  {matchId:14,date:"10 Apr 2026",t1:"DC", t2:"GT", venue:"Arun Jaitley, Delhi"},
  {matchId:15,date:"11 Apr 2026",t1:"KKR",t2:"LSG",venue:"Eden Gardens, Kolkata"},
  {matchId:16,date:"12 Apr 2026",t1:"RR", t2:"RCB",venue:"Sawai Mansingh, Jaipur"},
  {matchId:17,date:"13 Apr 2026",t1:"PBKS",t2:"SRH",venue:"PCA, Mullanpur"},
  {matchId:18,date:"14 Apr 2026",t1:"CSK",t2:"DC", venue:"Chepauk, Chennai"},
  {matchId:19,date:"15 Apr 2026",t1:"LSG",t2:"GT", venue:"Ekana, Lucknow"},
  {matchId:20,date:"16 Apr 2026",t1:"MI", t2:"RCB",venue:"Wankhede, Mumbai"},
  {matchId:21,date:"17 Apr 2026",t1:"SRH",t2:"RR", venue:"Rajiv Gandhi, Hyderabad"},
  {matchId:22,date:"18 Apr 2026",t1:"CSK",t2:"KKR",venue:"Chepauk, Chennai"},
  {matchId:23,date:"19 Apr 2026",t1:"RCB",t2:"LSG",venue:"M. Chinnaswamy, Bengaluru"},
  {matchId:24,date:"20 Apr 2026",t1:"MI", t2:"PBKS",venue:"Wankhede, Mumbai"},
  {matchId:25,date:"21 Apr 2026",t1:"GT", t2:"KKR",venue:"Narendra Modi, Ahmedabad"},
  {matchId:26,date:"22 Apr 2026",t1:"RCB",t2:"DC", venue:"M. Chinnaswamy, Bengaluru"},
  {matchId:27,date:"23 Apr 2026",t1:"SRH",t2:"CSK",venue:"Rajiv Gandhi, Hyderabad"},
  {matchId:28,date:"24 Apr 2026",t1:"KKR",t2:"RR", venue:"Eden Gardens, Kolkata"},
  {matchId:29,date:"25 Apr 2026",t1:"PBKS",t2:"LSG",venue:"PCA, Mullanpur"},
  {matchId:30,date:"26 Apr 2026",t1:"GT", t2:"MI", venue:"Narendra Modi, Ahmedabad"},
  {matchId:31,date:"27 Apr 2026",t1:"SRH",t2:"DC", venue:"Rajiv Gandhi, Hyderabad"},
  {matchId:32,date:"28 Apr 2026",t1:"LSG",t2:"RR", venue:"Ekana, Lucknow"},
  {matchId:33,date:"29 Apr 2026",t1:"MI", t2:"CSK",venue:"Wankhede, Mumbai"},
  {matchId:34,date:"30 Apr 2026",t1:"RCB",t2:"GT", venue:"M. Chinnaswamy, Bengaluru"},
  {matchId:35,date:"1 May 2026", t1:"DC", t2:"PBKS",venue:"Arun Jaitley, Delhi"},
  {matchId:36,date:"2 May 2026", t1:"RR", t2:"SRH",venue:"Sawai Mansingh, Jaipur"},
  {matchId:37,date:"3 May 2026", t1:"GT", t2:"CSK",venue:"Narendra Modi, Ahmedabad"},
  {matchId:38,date:"4 May 2026", t1:"LSG",t2:"KKR",venue:"Ekana, Lucknow"},
  {matchId:39,date:"5 May 2026", t1:"DC", t2:"RCB",venue:"Arun Jaitley, Delhi"},
  {matchId:40,date:"6 May 2026", t1:"PBKS",t2:"RR",venue:"PCA, Mullanpur"},
  {matchId:41,date:"7 May 2026", t1:"MI", t2:"SRH",venue:"Wankhede, Mumbai"},
  {matchId:42,date:"8 May 2026", t1:"GT", t2:"RCB",venue:"Narendra Modi, Ahmedabad"},
  {matchId:43,date:"9 May 2026", t1:"RR", t2:"DC", venue:"Sawai Mansingh, Jaipur"},
  {matchId:44,date:"10 May 2026",t1:"CSK",t2:"GT", venue:"Chepauk, Chennai"},
  {matchId:45,date:"11 May 2026",t1:"KKR",t2:"MI", venue:"Eden Gardens, Kolkata"},
  {matchId:46,date:"12 May 2026",t1:"SRH",t2:"PBKS",venue:"Rajiv Gandhi, Hyderabad"},
  {matchId:47,date:"13 May 2026",t1:"LSG",t2:"RCB",venue:"Ekana, Lucknow"},
  {matchId:48,date:"14 May 2026",t1:"MI", t2:"RR", venue:"Wankhede, Mumbai"},
  {matchId:49,date:"15 May 2026",t1:"GT", t2:"SRH",venue:"Narendra Modi, Ahmedabad"},
  {matchId:50,date:"16 May 2026",t1:"PBKS",t2:"KKR",venue:"PCA, Mullanpur"},
  {matchId:51,date:"17 May 2026",t1:"DC", t2:"LSG",venue:"Arun Jaitley, Delhi"},
  {matchId:52,date:"18 May 2026",t1:"RCB",t2:"MI", venue:"M. Chinnaswamy, Bengaluru"},
  {matchId:53,date:"19 May 2026",t1:"CSK",t2:"RR", venue:"Chepauk, Chennai"},
  {matchId:54,date:"20 May 2026",t1:"KKR",t2:"GT", venue:"Eden Gardens, Kolkata"},
  {matchId:55,date:"21 May 2026",t1:"PBKS",t2:"DC",venue:"PCA, Mullanpur"},
  {matchId:56,date:"22 May 2026",t1:"LSG",t2:"SRH",venue:"Ekana, Lucknow"},
  {matchId:57,date:"23 May 2026",t1:"MI", t2:"GT", venue:"Wankhede, Mumbai"},
  {matchId:58,date:"24 May 2026",t1:"RCB",t2:"KKR",venue:"M. Chinnaswamy, Bengaluru"},
  {matchId:59,date:"27 May 2026",t1:"TBD",t2:"TBD",venue:"Qualifier 1 — TBC"},
  {matchId:60,date:"28 May 2026",t1:"TBD",t2:"TBD",venue:"Eliminator — TBC"},
  {matchId:61,date:"30 May 2026",t1:"TBD",t2:"TBD",venue:"Qualifier 2 — TBC"},
  {matchId:62,date:"1 Jun 2026", t1:"TBD",t2:"TBD",venue:"Final — TBC"},
];

export const TEAM_NAMES = {
  RCB:"Royal Challengers Bengaluru", SRH:"Sunrisers Hyderabad",
  MI:"Mumbai Indians",               KKR:"Kolkata Knight Riders",
  RR:"Rajasthan Royals",             CSK:"Chennai Super Kings",
  PBKS:"Punjab Kings",               GT:"Gujarat Titans",
  LSG:"Lucknow Super Giants",        DC:"Delhi Capitals",
};
