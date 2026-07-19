// Rule-based placeholder for what will eventually be an AI-generated advisor.
// Takes the already-loaded transactions (the backend has no persistence of
// its own) and a category, and returns a handful of structured insights —
// formatting/labels are the frontend's job, this just computes the numbers.

const DAY_MS = 1000 * 60 * 60 * 24;

// Average gap between consecutive occurrences of the category, e.g. 2 items
// 2.5 weeks apart average out to one gap of 17.5 days.
function averageGapDays(items) {
  if (items.length < 2) return null;

  const sortedTimes = items.map((t) => new Date(t.date).getTime()).sort((a, b) => a - b);
  let totalGapMs = 0;
  for (let i = 1; i < sortedTimes.length; i++) {
    totalGapMs += sortedTimes[i] - sortedTimes[i - 1];
  }
  return totalGapMs / (sortedTimes.length - 1) / DAY_MS;
}

function getAdvice({ categories, transactions }) {
  const spendTxns = transactions.filter((t) => t.amount < 0);
  const totalSpend = spendTxns.reduce((s, t) => s + Math.abs(t.amount), 0);

  const items = spendTxns.filter((t) => categories.includes(t.category));
  const categorySpend = items.reduce((s, t) => s + Math.abs(t.amount), 0);
  const count = items.length;

  if (count === 0) {
    return [{ type: 'empty' }];
  }

  const insights = [];

  insights.push({ type: 'avg', amount: categorySpend / count });

  const biggest = items.reduce((max, t) => (Math.abs(t.amount) > Math.abs(max.amount) ? t : max));
  insights.push({
    type: 'max',
    amount: Math.abs(biggest.amount),
    title: biggest.title,
    date: biggest.date,
  });

  const avgGapDays = averageGapDays(items);
  if (avgGapDays !== null) {
    insights.push({ type: 'frequency', days: avgGapDays });
  }

  if (totalSpend > 0) {
    insights.push({ type: 'percent', percent: (categorySpend / totalSpend) * 100 });
  }

  return insights;
}

// Placeholder for free-form Q&A — real reasoning (and real insights, not
// just an acknowledgement) is future work, likely once this is backed by
// an actual AI-generated response instead of rules.
function answerQuestion({ question }) {
  return { answer: `Free-form answers aren't wired up yet — you asked: "${question}".` };
}

module.exports = { getAdvice, answerQuestion };
