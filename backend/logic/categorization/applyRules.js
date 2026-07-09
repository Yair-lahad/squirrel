// Layers stored category rules on top of a transaction's raw category without
// mutating the source data — callers pass in transactions from vendor/file/mock
// and get back a new array with `category` overridden where a rule matches.
//
// Two passes: description rules (exact/contains) decide the category first —
// exact wins over contains, earlier-created wins within a type — then category
// rules remap on top of that result, so "merge Delicatessen into Dining" keeps
// working even for Delicatessen transactions that got there via a contains rule
// or straight from the raw source.
function findDescriptionMatch(description, rules) {
  const desc = (description || '').toLowerCase();
  const exact = rules.filter((r) => r.matchType === 'exact');
  const contains = rules.filter((r) => r.matchType === 'contains');

  const exactHit = exact.find((r) => desc === r.pattern.toLowerCase());
  if (exactHit) return exactHit;

  return contains.find((r) => desc.includes(r.pattern.toLowerCase()));
}

function findCategoryMatch(category, rules) {
  const cat = (category || '').toLowerCase();
  return rules.find((r) => cat === r.pattern.toLowerCase());
}

function applyRules(transactions, rules) {
  if (!rules.length) return transactions;

  const descriptionRules = rules.filter((r) => r.matchType === 'exact' || r.matchType === 'contains');
  const categoryRules = rules.filter((r) => r.matchType === 'category');

  return transactions.map((t) => {
    let category = t.category;

    const descriptionMatch = findDescriptionMatch(t.description, descriptionRules);
    if (descriptionMatch) category = descriptionMatch.category;

    const categoryMatch = findCategoryMatch(category, categoryRules);
    if (categoryMatch) category = categoryMatch.category;

    return category === t.category ? t : { ...t, category };
  });
}

module.exports = { applyRules };
