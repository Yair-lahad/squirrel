const express = require('express');
const path = require('path');
const vendorRoute = require('./routes/vendor');
const mockRoute = require('./routes/mock');
const fileRoute = require('./routes/file');
const analyticsRoute = require('./routes/analytics');
const advisorRoute = require('./routes/advisor');

const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, '..', 'frontend', 'dist')));

app.use(vendorRoute);
app.use(mockRoute);
app.use(fileRoute);
app.use(analyticsRoute);
app.use(advisorRoute);

// Client-side routing (no # in the URL) means the browser can request paths
// like /charts directly (e.g. on refresh) that don't exist as files — fall
// back to index.html so React Router-less client routing can handle them.
app.get(/^(?!\/api).*/, (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'frontend', 'dist', 'index.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Squirrel running at http://localhost:${PORT}`);
});
