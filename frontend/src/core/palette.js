// Reads the same custom properties defined in styles.css — one place
// (:root in styles.css) defines every color; this just makes them available
// as plain hex for Chart.js, which draws to canvas and can't use CSS
// variables directly.
function cssVar(name, fallback) {
  if (typeof window === 'undefined') return fallback;
  const value = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  return value || fallback;
}

export const PALETTE = {
  categorical: [
    cssVar('--chart-1', '#2a78d6'),
    cssVar('--chart-2', '#1baf7a'),
    cssVar('--chart-3', '#eda100'),
    cssVar('--chart-4', '#008300'),
    cssVar('--chart-5', '#4a3aa7'),
    cssVar('--chart-6', '#e34948'),
    cssVar('--chart-7', '#e87ba4'),
    cssVar('--chart-8', '#eb6834'),
  ],
  muted: cssVar('--color-text-muted', '#898781'),
  grid: cssVar('--color-border', '#e1e0d9'),
  surface: cssVar('--color-surface', '#fcfcfb'),
  textPrimary: cssVar('--color-text-primary', '#0b0b0b'),
};
