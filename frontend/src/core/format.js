export function formatCurrency(n) {
  return new Intl.NumberFormat('en-IL', { style: 'currency', currency: 'ILS' }).format(n);
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

export function formatMonthYear(date) {
  return new Date(date).toLocaleDateString('en-GB', { month: 'long', year: 'numeric' });
}
