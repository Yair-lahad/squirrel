<img src="squirrel.png" alt="Squirrel mascot" width="140" />

# Squirrel

Understand the flow of your money — income and spending over time, by category.

## Frontend

Single-page React app, five nav destinations (switched client-side):

- **Home** — what the app is, at a glance.
- **Charts** — spend by category (bar or pie, amount or transaction count).
  Click a category for detail: a date-vs-amount scatter, plus the Advisor's take.
- **Transactions** — the full sortable list.
- **Overview** — income / spend / net totals.
- **Load data** — fetch real transactions from a vendor (Isracard today, via
  [`israeli-bank-scrapers`](https://github.com/eshaham/israeli-bank-scrapers))
  or load a bundled sample file.

Whichever source you load from, the other pages all read the same in-session
dataset.

## Backend

- **Routes** (`backend/routes/`) — HTTP only. One thin file per endpoint,
  mirroring `frontend/src/routes/`. Parses the request, calls `logic/` or
  `agents/`, shapes the response.
- **Logic** (`backend/logic/`) — the actual work, one subdir per concern:
  `analytics/` (pure number-crunching for charts/tables/KPIs) and `sources/`
  (one module per transaction provider: vendor, file, mock).
- **Agents** (`backend/agents/`) — turns data into plain-English output, one
  module per agent. `advisor.js` is the first: rule-based today, meant to be
  swapped for a real AI-generated response without touching anything else.

## Run

```bash
npm install
cd frontend && npm install && cd ..
npm start
```

Open http://localhost:3000. (`npm start` builds the frontend and serves it
from the Express server.)

For active development, with auto-restart/reload on every change:

```bash
npm run dev
```

Runs the backend (nodemon, port 3000) and the Vite dev server (port 5173,
proxying `/api/*` to the backend) side by side — use the Vite URL while
developing.

## Structure

```
squirrel/
├── data/               # JSON transaction fixtures
├── backend/
│   ├── main.js            # Express app: mounts routes/, serves frontend/dist
│   ├── routes/             # thin HTTP handlers
│   ├── logic/
│   │   ├── sources/           # transaction providers: vendor, file, mock
│   │   └── analytics/         # aggregations.js
│   └── agents/
│       └── advisor.js         # first agent
└── frontend/            # React + Vite app
    └── src/
        ├── core/               # format.js, palette.js
        ├── routes/             # htttp handler
        ├── hooks/              # useTransactions, useAnalytics
        ├── components/         # presentational only
        ├── advisor/            # UI half of the Advisor feature
        ├── utils/              # FetchForm, FileLoader — side-effecting
        ├── pages/              # one composition per nav destination
        └── App.jsx, main.jsx, styles.css
```
