import { PALETTE } from './palette';

// Keyword -> emoji for common category names; anything unmatched (e.g. a
// user's custom "MyStuff" category) falls back to its initial letter.
const ICON_KEYWORDS = [
  [['grocer', 'super', 'market'], '🛒'],
  [['dining', 'restaurant', 'cafe', 'coffee', 'delicat'], '🍽️'],
  [['fuel', 'gas', 'petrol'], '⛽'],
  [['transport', 'bus', 'train', 'taxi'], '🚌'],
  [['subscription', 'netflix', 'streaming'], '📺'],
  [['utilit', 'electric', 'water', 'authorit'], '💡'],
  [['insurance'], '🛡️'],
  [['health', 'medical', 'doctor'], '🩺'],
  [['pharma', 'drug'], '💊'],
  [['cloth', 'fashion', 'apparel'], '👕'],
  [['entertain', 'movie', 'culture'], '🎬'],
  [['leisure', 'sport', 'gym', 'fitness'], '⚽'],
  [['home', 'furniture'], '🏠'],
  [['communicat', 'phone', 'mobile'], '📱'],
  [['income', 'salary', 'paycheck'], '💰'],
  [['travel', 'flight', 'hotel'], '✈️'],
  [['education', 'school', 'tuition'], '🎓'],
  [['pet'], '🐾'],
  [['gift', 'donat'], '🎁'],
  [['misc'], '🗂️'],
];

function hash(str) {
  let h = 0;
  for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) >>> 0;
  return h;
}

export function categoryVisual(category) {
  const lower = (category || '').toLowerCase();
  const match = ICON_KEYWORDS.find(([keywords]) => keywords.some((k) => lower.includes(k)));
  return {
    icon: match ? match[1] : null,
    initial: (category || '?').charAt(0).toUpperCase(),
    color: PALETTE.categorical[hash(category || '') % PALETTE.categorical.length],
  };
}
