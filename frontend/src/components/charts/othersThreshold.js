// Below-threshold categories get folded into an "Others" slice when grouping
// is turned on. One default cutoff per metric, since amount and transaction
// count aren't on the same scale — editable per-session from the chart controls.
export const DEFAULT_OTHERS_THRESHOLD = {
  amount: 200,
  count: 2,
};

export const OTHERS_LABEL = 'Others';

export function groupSmallSlices(rows, metric, threshold) {
  const big = rows.filter((r) => r[metric] >= threshold);
  const small = rows.filter((r) => r[metric] < threshold);
  if (small.length < 2) return rows;

  const others = small.reduce(
    (acc, r) => ({
      category: OTHERS_LABEL,
      amount: acc.amount + r.amount,
      count: acc.count + r.count,
      categories: [...acc.categories, r.category],
    }),
    { category: OTHERS_LABEL, amount: 0, count: 0, categories: [] }
  );
  return [...big, others];
}
