# IPL 2026 Live Stats Website
## Deploys to Vercel · Free · Updates automatically every day

---

## What this does

- Real IPL 2026 leaderboards: runs, sixes, fours, wickets (ordered highest first)
- Points table with real NRR, wins, losses
- Full 74-match schedule with results
- **Auto-updates at 11 PM IST every day** — no manual work needed
- Costs ₹0/month (tiny Claude API cost ~₹0.003 per match = ₹0.22 for full season)

---

## Prerequisites (all free)

1. **GitHub account** — github.com
2. **MongoDB Atlas account** — cloud.mongodb.com (free M0 tier)
3. **Vercel account** — vercel.com (free hobby tier)
4. **Anthropic API key** — console.anthropic.com (~₹0.22 for full IPL season)

---

## STEP 1 — MongoDB Atlas (free database)

1. Go to https://cloud.mongodb.com
2. Sign up → Create a free M0 cluster
3. **Database Access** → Add Database User:
   - Username: `ipl2026`
   - Password: (generate a strong one, save it)
   - Role: `Atlas admin`
4. **Network Access** → Add IP Address → `0.0.0.0/0` (allow all)
5. **Connect** → Drivers → Copy the connection string:
   ```
   mongodb+srv://ipl2026:<password>@cluster0.xxxxx.mongodb.net/ipl2026
   ```
   Replace `<password>` with your actual password.

---

## STEP 2 — Anthropic API key

1. Go to https://console.anthropic.com
2. Sign up → API Keys → Create Key
3. Copy the key (starts with `sk-ant-api03-...`)
4. Add a small credit ($5 is more than enough for the entire IPL season)
   - Each match fetch costs ~$0.003 (less than ₹0.30)
   - 74 matches × $0.003 = $0.22 total (~₹18 for the whole season)

---

## STEP 3 — Push code to GitHub

```bash
# In the ipl-website folder:
git init
git add .
git commit -m "IPL 2026 live stats website"

# Create a new repo on github.com, then:
git remote add origin https://github.com/YOUR_USERNAME/ipl2026-live.git
git branch -M main
git push -u origin main
```

---

## STEP 4 — Deploy to Vercel

1. Go to https://vercel.com → Sign in with GitHub
2. Click **Add New Project**
3. Import your `ipl2026-live` repository
4. Framework: **Vite**
5. Root Directory: `/` (leave as default)
6. Build Command: `npm run build`
7. Output Directory: `dist`
8. Click **Environment Variables** and add these 3:

   | Name               | Value                                    |
   |--------------------|------------------------------------------|
   | `MONGODB_URI`      | `mongodb+srv://ipl2026:pass@cluster...`  |
   | `ANTHROPIC_API_KEY`| `sk-ant-api03-...`                       |
   | `CRON_SECRET`      | `any-random-string-you-make-up`          |

9. Click **Deploy**
10. Wait ~2 minutes → Your site is live at `https://ipl2026-live.vercel.app`

---

## STEP 5 — Seed real match data (do this ONCE)

After deployment, call the seed endpoint to load the 3 real completed matches:

```bash
curl -X POST "https://YOUR-SITE.vercel.app/api/seed?secret=your-cron-secret"
```

You should see:
```json
{
  "ok": true,
  "seeded": [
    "M1: SRH vs RCB — RCB won",
    "M2: MI vs KKR — MI won",
    "M3: RR vs CSK — RR won"
  ]
}
```

Open your website — all leaderboards and points table are now populated with real data.

---

## STEP 6 — Verify cron job is set up

In Vercel dashboard:
1. Go to your project → **Settings** → **Crons**
2. You should see `cron-update` scheduled at `30 17 * * *` (11 PM IST)
3. This runs automatically every day — no action needed

To test it manually:
```bash
curl -H "Authorization: Bearer your-cron-secret" \
  "https://YOUR-SITE.vercel.app/api/cron-update"
```

---

## How it works after deployment

```
Every day at 11 PM IST (automatically):
│
├── Vercel triggers /api/cron-update
│
├── Finds next unprocessed match from schedule
│
├── Asks Claude AI: "What was the result of Match X?"
│   └── Claude searches ESPN Cricinfo with web_search tool
│   └── Returns: { winner, scores, sixes, fours, wickets, potm }
│
├── Saves to MongoDB (cumulative +=, never overwrites)
│
└── Next visitor to your website sees updated stats
    ├── Leaderboards reordered (runs, sixes, fours, wickets)
    ├── Points table updated (NRR recalculated)
    └── Schedule shows match as completed
```

---

## Your website pages

| URL | Content |
|-----|---------|
| `/` | Leaderboards — runs, sixes, fours, wickets (ordered) |
| `/` → Points Table tab | Full points table with NRR |
| `/` → Results tab | Last 5 completed matches with scorecards |
| `/` → Schedule tab | All 74 matches, filter by team/status |

---

## Troubleshooting

**Leaderboards show no data:**
→ Run the seed endpoint: `POST /api/seed?secret=YOUR_SECRET`

**Cron not updating:**
→ Check Vercel → Functions → Logs for errors
→ Verify `ANTHROPIC_API_KEY` is set correctly in environment variables

**MongoDB connection failed:**
→ Check Network Access in Atlas has `0.0.0.0/0` allowed
→ Verify the connection string has the correct password

**Build fails on Vercel:**
→ Make sure Node.js version is 18+ in Vercel project settings

---

## Cost summary for the entire IPL 2026 season

| Item | Cost |
|------|------|
| Vercel (frontend + cron) | Free |
| MongoDB Atlas M0 | Free |
| Anthropic API (74 matches × $0.003) | ~$0.22 (~₹18) |
| **Total** | **~₹18 for the whole season** |

---

## File structure

```
ipl-website/
├── api/
│   ├── _db.js           — MongoDB models + schedule data
│   ├── _updateStats.js  — Stats engine (cumulative +=)
│   ├── cron-update.js   — Daily auto-update job (11 PM IST)
│   ├── seed.js          — One-time real data seeder
│   └── stats.js         — Frontend data endpoint
├── src/
│   ├── App.jsx          — Layout + navigation
│   ├── hooks/
│   │   └── useStats.js  — Auto-refresh every 5 min
│   ├── pages/
│   │   ├── Leaderboards.jsx
│   │   ├── PointsTable.jsx
│   │   ├── Results.jsx
│   │   └── Schedule.jsx
│   └── utils/
│       └── teams.js     — Team colours + helpers
├── vercel.json          — Cron schedule + routing
├── .env.example         — Environment variables template
└── package.json
```
