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

// t.date arrives as a plain 'YYYY-MM-DD' string (see transactionService's
// SELECT_COLUMNS) — parsed here by splitting rather than `new Date()`, since
// that would reinterpret it in the browser's local timezone and can shift
// the displayed day.
export function formatDate(isoDate) {
  const [y, m, d] = isoDate.split('-');
  return `${d}.${m}.${y}`;
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
