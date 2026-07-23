export function formatCurrency(n) {
  return new Intl.NumberFormat('en-IL', {
    style: 'currency',
    currency: 'ILS',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(n);
}

export function formatGap(days) {
  const weeks = days / 7;
  if (weeks >= 1) return `${weeks.toFixed(1)}w`;
  return `${days.toFixed(1)}d`;
}

export function formatDayMonth(date) {
  const d = new Date(date);
  return `${String(d.getDate()).padStart(2, '0')}.${String(d.getMonth() + 1).padStart(2, '0')}`;
}

// A period is labeled by its last month only (e.g. "Jun 26"), not a
// start-end range — a range computed two different ways (client-side
// literal min/max vs a backend-trimmed range) is how the headline and the
// upload selector ended up disagreeing; showing only the end avoids that.
export function formatMonthYear(date) {
  return new Date(date).toLocaleDateString('en-GB', { month: 'short', year: '2-digit' });
}

export function formatPeriod(transactions) {
  if (!transactions.length) return '';
  const times = transactions.map((t) => new Date(t.date).getTime());
  return formatMonthYear(new Date(Math.max(...times)));
}
