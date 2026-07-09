export function formatCurrency(n) {
  return new Intl.NumberFormat('en-IL', { style: 'currency', currency: 'ILS' }).format(n);
}
