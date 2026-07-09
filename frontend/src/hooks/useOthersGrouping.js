/**
 * Owns the "group small categories into Others" toggle and its per-metric
 * threshold, and applies it to already-sorted category rows.
 */
import { useState } from 'react';
import { DEFAULT_OTHERS_THRESHOLD, groupSmallSlices } from '../components/charts/othersThreshold';

export function useOthersGrouping(sortedRows, metric) {
  const [groupSmall, setGroupSmall] = useState(false);
  const [thresholds, setThresholds] = useState(DEFAULT_OTHERS_THRESHOLD);
  const threshold = thresholds[metric];

  const rows = groupSmall ? groupSmallSlices(sortedRows, metric, threshold) : sortedRows;

  function setThreshold(value) {
    if (Number.isNaN(value) || value < 0) return;
    setThresholds((t) => ({ ...t, [metric]: value }));
  }

  return { rows, groupSmall, toggleGroupSmall: () => setGroupSmall((g) => !g), threshold, setThreshold };
}
