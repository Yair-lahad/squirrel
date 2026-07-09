<img src="squirrel.png" alt="Squirrel mascot" width="140" />

# Squirrel

Understand the flow of your money — income and spending over time, by category.

## Frontend

Single-page React app, six nav destinations (switched client-side):

- **Home** — what the app is, at a glance.
- **Charts** — spend by category (bar or pie, amount or transaction count).
  Click a category for detail: a date-vs-amount scatter, plus the Advisor's take.
- **Transactions** — the full sortable list. Click a row's category to
  reassign it.
- **Categories** — manage persistent category rules (see below) and browse
  every category in use as an icon grid.
- **Load data** — fetch real transactions from a vendor (Isracard today, via
  [`israeli-bank-scrapers`](https://github.com/eshaham/israeli-bank-scrapers))
  or load a bundled sample file.

Whichever source you load from, the other pages all read the same in-session
dataset (kept in `sessionStorage`, cleared when the tab closes).

## Backend

- **Routes** (`backend/routes/`) — HTTP only. One thin file per endpoint,
  mirroring `frontend/src/routes/`. Parses the request, calls `logic/` or
  `agents/`, shapes the response.
- **Logic** (`backend/logic/`) — the actual work, one subdir per concern:
  `analytics/` (pure number-crunching for charts/tables/KPIs), `sources/`
  (one module per transaction provider: vendor, file, mock), and
  `categorization/` (persistent category rules — see below).
- **Agents** (`backend/agents/`) — turns data into plain-English output, one
  module per agent. `advisor.js` is the first: rule-based today, meant to be
  swapped for a real AI-generated response without touching anything else.

### Category rules

Raw transaction data (vendor scrape, sample files) is never modified. Instead,
`data/categories.db` — a local SQLite file, no server or Docker needed — holds
a small table of rules that get layered on top of every fetch:

- **contains** — any transaction whose description contains the pattern gets
  the rule's category (auto, matches future transactions too).
- **exact** — one specific transaction description only (what clicking a row
  in the Transactions table creates).
- **category** — remaps every transaction currently in category A to
  category B (e.g. merge "Delicatessen" into "Dining").

Unlike the transaction data itself, rules persist across reloads and sessions
until deleted from the Categories page.

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
├── data/                   # sample-data.json, hebrew-sample.json, categories.db (rules, gitignored)
├── backend/
│   ├── main.js            # Express app: mounts routes/, serves frontend/dist
│   ├── routes/             # thin HTTP handlers
│   ├── logic/
│   │   ├── sources/           # transaction providers: vendor, file, mock
│   │   ├── analytics/         # aggregations.js
│   │   └── categorization/    # category rules: db.js, rulesStore.js, applyRules.js
│   └── agents/
│       └── advisor.js         # helps understand charts
└── frontend/            # React + Vite app
    └── src/
        ├── core/               # format.js, palette.js, categoryVisuals.js
        ├── routes/             # http handlers
        ├── hooks/              # useTransactions, useAnalytics
        ├── components/         # mostly presentational; a few (CategorySelect,
        │                       # TransactionsTable) hold local UI state
        ├── agents/             # advisor/ — UI for the advisor agent
        ├── utils/              # FetchForm, FileLoader — side-effecting
        ├── pages/              # one composition per nav destination
        └── App.jsx, main.jsx, styles.css
```
