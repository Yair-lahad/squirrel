<img src="squirrel.png" alt="Squirrel mascot" width="140" />

# Squirrel

Understand the flow of your money — income and spending over time, by category.

A single-page React app with five nav destinations (switched client-side, no
page reload):

- **Home** — what the app is, at a glance.
- **Charts** — spend by category (bar or pie, amount or transaction count).
  Click a category to see its detail: a date-vs-amount scatter of just that
  category's transactions, plus the Advisor's take on it.
- **Transactions** — the full sortable list.
- **Overview** — income / spend / net totals.
- **Load data** — fetch real transactions from a vendor (Isracard today, via
  [`israeli-bank-scrapers`](https://github.com/eshaham/israeli-bank-scrapers),
  which has no public API so this drives the same login flow as the Isracard
  website) or load a bundled sample file (a real, privacy-scrubbed statement).

Whichever source you load from, the other pages all read the same in-session
dataset. Everything is local: fetched data lives only in the browser session
(nothing is written to disk or a database).

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

This runs the backend (nodemon, port 3000) and the Vite dev server (port
5173, proxying `/api/*` to the backend) side by side — use the Vite URL
while developing. Nodemon restarts the backend automatically on backend file
changes, same as Vite hot-reloads the frontend.

## Naming, so it stays consistent

- **Analytics** = numbers. `backend/analytics/` computes totals, category
  breakdowns, sorting — anything a chart, table, or KPI tile needs to
  *display data*. Pure, deterministic, no prose.
- **Advisor** = words. `backend/advisor/` turns a category's transactions
  into a handful of plain-English messages, shown as speech bubbles next to
  the squirrel avatar. It's rule-based today; the whole point of keeping it
  separate from analytics is that swapping these templates for a real
  AI-generated response later only touches this one module.
- **Vendor** = wherever the real transactions come from. Isracard is the
  only vendor implemented right now (`backend/sources/vendorSource.js`), but
  the naming doesn't bake that in — `israeli-bank-scrapers` supports other
  banks too, and that's the extension point if/when a second one is added.

## Structure

```
squirrel/
├── squirrel.png          # mascot — also served as frontend/public/squirrel.png
├── data/                 # JSON transaction fixtures (gitignored)
├── backend/              # HTTP layer + all data computation
│   ├── server.js            # thin Express server; wires routes to the modules below,
│   │                         # serves frontend/dist in production
│   ├── sources/              # fetching raw transactions
│   │   ├── vendorSource.js      # runs israeli-bank-scrapers (Isracard today)
│   │   ├── fileSource.js        # a real statement (data/hebrew-sample.json),
│   │   │                        # translated to English for display
│   │   └── mockSource.js        # synthetic mock data (data/sample-data.json)
│   ├── analytics/             # the numbers — see "Naming" above
│   │   └── aggregations.js      # totals, by-category, top-N-with-other, sort, category detail
│   └── advisor/               # the words — see "Naming" above
│       └── advisor.js           # rule-based messages per category
└── frontend/              # React + Vite single-page app
    ├── index.html            # Vite entry (mounts <div id="root">)
    ├── vite.config.js
    └── src/
        ├── core/                 # framework-agnostic presentation logic (no React/Vite
        │   ├── format.js            # imports): currency formatting, and...
        │   └── palette.js           # ...chart colors, read from styles.css's CSS
        │                            # variables at runtime (one color source, two consumers)
        ├── routes/               # one file per backend API route
        │   ├── http.js               # shared response/error handling
        │   ├── vendor.js             # POST /api/fetch/vendor
        │   ├── mock.js               # GET  /api/fetch/mock
        │   ├── file.js               # GET  /api/fetch/file
        │   ├── analytics.js          # POST /api/analytics/*
        │   └── advisor.js            # POST /api/advisor/messages
        ├── hooks/
        │   ├── useTransactions.js    # sessionStorage-backed global transaction state
        │   └── useAnalytics.js       # generic "fetch + hold result" wiring for routes/analytics.js
        ├── components/           # presentational only — render props, no side effects
        │   ├── layout/                Header.jsx, Nav.jsx, EmptyState.jsx
        │   ├── charts/                 SpendingChart.jsx (bar/pie), CategoryScatterChart.jsx
        │   └── KpiPanel.jsx, TransactionsTable.jsx, CategoryDetail.jsx
        ├── advisor/               # the UI half of the Advisor feature (not a "util" —
        │   └── Advisor.jsx           # it's its own feature area, just living on the Charts page)
        ├── utils/                 # functional components with side effects (fetching, form state)
        │   ├── FetchForm.jsx          Isracard credentials form -> routes/vendor.js
        │   └── FileLoader.jsx         sample-file load button -> routes/file.js
        ├── pages/                 # one composition per nav destination
        │   ├── HomePage.jsx, LoadDataPage.jsx
        │   └── ChartsPage.jsx, TransactionsPage.jsx, OverviewPage.jsx
        ├── App.jsx                # routing only: which page is active, browser history
        ├── main.jsx               # ReactDOM entry point + Chart.js registration
        └── styles.css             # single source of truth for color (CSS custom properties)
```

Credentials entered in the fetch form are sent directly to your own local
server for that one request only — never stored or logged.
