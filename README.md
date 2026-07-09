<img src="squirrel.png" alt="Squirrel mascot" width="140" />

# Squirrel

Understand the flow of your money — income and spending over time, by category.

A single-page React app with five nav destinations (switched client-side, no
page reload):

- **Fetch from Isracard** — pulls real transactions. Isracard has no public
  API, so this drives
  [`israeli-bank-scrapers`](https://github.com/eshaham/israeli-bank-scrapers),
  which logs into the Isracard website with your normal login details.
- **Sample file** — loads a real (privacy-scrubbed) Isracard statement
  bundled with the project, for exploring the app without connecting an
  account.
- **Charts** — spend by category (bar or pie, amount or transaction count).
  Click a category to jump to its transactions.
- **Transactions** — the full sortable list, or a single category's history
  as a date-vs-amount scatter when arriving via a chart click.
- **Overview** — income / spend / net totals.

Whichever source you load from, all three topic pages read the same
in-session dataset. Everything is local: fetched data lives only in the
browser session (nothing is written to disk or a database).

## Run

```bash
npm install
cd frontend && npm install && cd ..
npm start
```

Open http://localhost:3000. (`npm start` builds the frontend and serves it
from the Express server.)

For active development, with auto-reload on frontend changes:

```bash
npm run dev
```

This runs the backend (port 3000) and the Vite dev server (port 5173,
proxying `/api/*` to the backend) side by side — use the Vite URL while
developing.

## Structure

```
squirrel/
├── squirrel.png        # mascot — also served as frontend/public/squirrel.png
├── data/              # JSON transaction fixtures
├── backend/           # HTTP layer + data fetching
│   ├── server.js         # thin Express server; wires routes to sources/,
│   │                     # serves frontend/dist in production
│   └── sources/          # data fetching, kept separate from backend/frontend code
│       ├── isracardSource.js   # vendor: runs israeli-bank-scrapers
│       ├── fileSource.js       # a real statement (data/hebrew-sample.json),
│       │                       # translated to English for display
│       └── mockSource.js       # synthetic mock data (data/sample-data.json)
└── frontend/           # React + Vite single-page app
    ├── public/squirrel.png  # favicon + header logo
    ├── index.html         # Vite entry (mounts <div id="root">)
    ├── vite.config.js
    └── src/
        ├── core/             # framework-agnostic logic: no React/Vite imports.
        │   ├── aggregations.js  # totals, by-category (amount + count), top-N-with-other, sorting
        │   ├── format.js        # currency formatting
        │   └── palette.js       # chart colors
        │                     # ↳ pure data transforms — if React/Vite is ever
        │                     #   swapped out, this layer survives unchanged.
        ├── routes/           # one file per backend API route, called from utils/
        │   ├── http.js          # shared response/error handling
        │   ├── isracard.js      # POST /api/fetch/isracard
        │   ├── mock.js          # GET  /api/fetch/mock
        │   └── file.js          # GET  /api/fetch/file
        ├── hooks/
        │   └── useTransactions.js   # sessionStorage-backed global transaction state
        ├── components/       # presentational only — render props, no side effects
        │   ├── layout/           # Header.jsx, Nav.jsx, EmptyState.jsx
        │   ├── charts/           # SpendingChart.jsx (bar/pie), CategoryScatterChart.jsx
        │   ├── KpiPanel.jsx, TransactionsTable.jsx, CategoryDetail.jsx
        ├── utils/            # functional components with side effects (fetching, form state)
        │   ├── FetchForm.jsx     # Isracard credentials form -> routes/isracard.js
        │   └── FileLoader.jsx    # sample-file load button -> routes/file.js
        ├── pages/            # one composition per nav destination
        │   ├── IsracardPage.jsx, FilePage.jsx
        │   └── ChartsPage.jsx, TransactionsPage.jsx, OverviewPage.jsx
        ├── App.jsx           # routing only: which page is active, browser history
        ├── main.jsx           # ReactDOM entry point + Chart.js registration
        └── styles.css
```

Credentials entered in the fetch form are sent directly to your own local
server for that one request only — never stored or logged.
