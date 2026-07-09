// Rule-based placeholder for what will eventually be an AI-generated advisor.
// Takes the already-loaded transactions (the backend has no persistence of
// its own) and a category, and returns a handful of plain-English messages.

function formatCurrency(amount) {
  return new Intl.NumberFormat('en-IL', { style: 'currency', currency: 'ILS' }).format(amount);
}

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

function formatGap(days) {
  const weeks = days / 7;
  if (weeks >= 1) return `${weeks.toFixed(1)} week${weeks.toFixed(1) === '1.0' ? '' : 's'}`;
  return `${days.toFixed(1)} day${days.toFixed(1) === '1.0' ? '' : 's'}`;
}

function getAdvice({ category, transactions }) {
  const spendTxns = transactions.filter((t) => t.amount < 0);
  const totalSpend = spendTxns.reduce((s, t) => s + Math.abs(t.amount), 0);

  const items = spendTxns.filter((t) => t.category === category);
  const categorySpend = items.reduce((s, t) => s + Math.abs(t.amount), 0);
  const count = items.length;

  const messages = [];

  if (count === 0) {
    messages.push(`No spending recorded for ${category} yet.`);
    return messages;
  }

  const avg = categorySpend / count;
  messages.push(`Your average ${category} charge is ${formatCurrency(avg)}.`);

  const biggest = items.reduce((max, t) => (Math.abs(t.amount) > Math.abs(max.amount) ? t : max));
  messages.push(`Your biggest ${category} charge was "${biggest.description}" for ${formatCurrency(Math.abs(biggest.amount))} on ${biggest.date}.`);

  const avgGapDays = averageGapDays(items);
  if (avgGapDays !== null) {
    messages.push(`You spend on ${category} about every ${formatGap(avgGapDays)} on average.`);
  }

  if (totalSpend > 0) {
    const percent = (categorySpend / totalSpend) * 100;
    messages.push(`${category} makes up ${percent.toFixed(1)}% of your total spend.`);
  }

  return messages;
}

module.exports = { getAdvice };
