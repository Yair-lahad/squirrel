<img src="squirrel.png" alt="Squirrel mascot" width="140" />

# Squirrel

Understand the flow of your money - income and spending over time, by category.

## Frontend

Single-page React app, six nav destinations (switched client-side):

- **Home** - what the app is, at a glance.
- **Charts** - spend by category (bar or pie, amount or transaction count).
  Click a category for detail: a date-vs-amount scatter, plus the Advisor's take.
- **Transactions** - the full sortable list. Click a row's category to
  reassign it.
- **Categories** - manage persistent category rules (see below) and browse
  every category in use as an icon grid.
- **Load data** - fetch real transactions from a vendor (Isracard today, via
  [`israeli-bank-scrapers`](https://github.com/eshaham/israeli-bank-scrapers)),
  load a bundled sample file, or upload a file yourself: a JSON array in the
  app's own shape, or a real statement document (`.docx` today) that an LLM
  reads and converts - see Statement upload below.

Whichever source you load from, the other pages all read the same in-session
dataset (kept in `sessionStorage`, cleared when the tab closes).

## Backend

Flow: **route → controller → core service (→ agent, if the feature needs AI)**.

- **Routes** (`backend/routes/`) - just the URL→handler map. Mounts each
  endpoint to a `controllers/` function; no logic of its own.
- **Controllers** (`backend/controllers/`) - HTTP only. Validates the
  request shape, calls exactly one `core/` service function, maps the result
  to a status code/response. No orchestration, no DB access, no calling
  `agents/` directly.
- **Core** (`backend/core/`) - the actual work, one subdir per concern:
  `ingestion/` (any source → stored transactions, via `ingestService.js`),
  `transactions/` (DB persistence only), `analytics/` (number-crunching),
  `categorization/` (category rules - see below).
- **Agents** (`backend/agents/`) - one module per agent: its prompt, schema,
  and logic, nothing else. `adapters/` holds the actual API-call plumbing,
  shared by every agent (`_template.js` shows the pattern for a new one).

### Category rules

Raw transaction data (vendor scrape, sample files) is never modified. Instead,
a `category_rules` table in Postgres (hosted on Supabase - see Run below)
holds a small table of rules that get layered on top of every fetch:

- **contains** - any transaction whose description contains the pattern gets
  the rule's category (auto, matches future transactions too).
- **exact** - one specific transaction description only (what clicking a row
  in the Transactions table creates).
- **category** - remaps every transaction currently in category A to
  category B (e.g. merge "Delicatessen" into "Dining").

Unlike the transaction data itself, rules persist across reloads and sessions
until deleted from the Categories page - and since they live in Supabase
rather than a local file, the same rules are shared across every machine you
run the app from.

### Statement upload

No hand-written parser - real statements vary too much in layout to hold up.
`docxText.js` pulls raw text out of the file; `statementExtractor.js` sends
it to Gemini along with every category already in use, asking it to reuse
one by meaning wherever it fits and only invent a new one as a last resort.
Needs a free `GEMINI_API_KEY` in `.env`. Re-uploading the same file is
idempotent (content-hashed) - returns the existing upload instead of a
duplicate or another LLM call.

## Run

Copy `.env.example` to `.env` and fill in `DATABASE_URL` with your Supabase
connection string (Project → Connect → **Transaction pooler** - the direct
connection is IPv6-only and won't resolve on most networks).

```bash
npm install
npm start
```

Open http://localhost:3000. (`npm start` builds the frontend and serves it
from the Express server. `npm install` covers both backend and frontend -
they're set up as npm workspaces.)

For active development, with auto-restart/reload on every change:

```bash
npm run dev
```

Runs the backend (nodemon, port 3000) and the Vite dev server (port 5173,
proxying `/api/*` to the backend) side by side - use the Vite URL while
developing.

## Structure

```
squirrel/
├── data/                   # sample-data.json, hebrew-sample.json (gitignored)
├── backend/
│   ├── main.js            # Express app: mounts routes/, serves frontend/dist
│   ├── routes/             # thin HTTP handlers
│   ├── core/               # ingestion/, transactions/, analytics/, categorization/
│   └── agents/             # adapters/, statementExtractor.js, advisor.js, _template.js
└── frontend/            # React + Vite app
    └── src/
        ├── core/               # format.js, palette.js, categoryVisuals.js
        ├── routes/             # http handlers
        ├── hooks/              # useTransactions, useAnalytics
        ├── components/         # mostly presentational; a few (CategorySelect,
        │                       # TransactionsTable) hold local UI state
        ├── agents/             # advisor/ - UI for the advisor agent
        ├── utils/              # FetchForm, FileLoader - side-effecting
        ├── pages/              # one composition per nav destination
        └── App.jsx, main.jsx, styles.css
```
