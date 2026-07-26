// Turns raw text from an arbitrary bank/card statement (any layout, any
// language, table structure often already lost by the time it reaches us)
// into the app's plain transaction shape. Unlike a hand-written parser, this
// doesn't assume a fixed column order or fixed set of section headers - that
// tradeoff (an API call, non-determinism) is what buys tolerance for messy
// input instead of breaking on the next statement that isn't formatted
// exactly like the last one.
const Adapters = require('./adapters');

const RESPONSE_SCHEMA = {
  type: 'ARRAY',
  items: {
    type: 'OBJECT',
    properties: {
      date: { type: 'STRING', description: 'Transaction date, YYYY-MM-DD' },
      description: { type: 'STRING', description: 'Merchant or payee, plus any relevant detail (installment number, refund note, etc.)' },
      amount: { type: 'NUMBER', description: 'Negative for money spent, positive for income or a refund/credit' },
      category: { type: 'STRING', description: 'One of the existing category names given below - inventing a new one is a last resort, only when truly none fit' },
    },
    required: ['date', 'description', 'amount', 'category'],
  },
};

const PROMPT = `The following text was extracted from a bank or credit card statement document. Formatting may be messy - table structure is often lost, columns may run together, and there may be unrelated sections (summaries, foreign-currency breakdowns, fee explanations). Extract every individual transaction line item.

Rules:
- date: ISO format YYYY-MM-DD.
- amount: negative for money spent, positive for income/refunds/credits.
- description: the merchant/payee name only - do not repeat the category inside it. If there's a relevant note attached to the line (installment count, "refund", a discount), append it in parentheses, e.g. "Merchant Name (installment 2 of 12)".
- Skip totals, subtotals, and anything that isn't an actual individual transaction.
`;

// Without this, re-running extraction (a different statement, or the same
// one on a different day) drifts: "Transport" one time, "Transportation" the
// next, "Fuel" vs "Gas" - same real category, different label, so it shows
// up twice in the app. This is the primary category rule, not an aside -
// matching an existing category (translating the statement's language to
// compare, if needed) always takes priority over labeling something fresh.
function categoryRule(existingCategories) {
  if (!existingCategories.length) {
    return '- category: a short English label for the transaction.\n';
  }
  return (
    `- category: pick from this existing list - match by meaning, not spelling, even if the statement is in another language:\n` +
    `  ${existingCategories.join(', ')}\n` +
    `  Creating a new category is a LAST RESORT, not a normal outcome. Prefer the closest broad existing fit over precision - e.g. a home-repair callout fits under "Housing" rather than inventing "Home Repair", and a parking garage fits under "Transport" rather than inventing "Parking". Only invent a new category if the transaction has no reasonable connection to anything in the list at all.\n`
  );
}

async function extractTransactions(text, existingCategories = []) {
  const prompt = PROMPT + categoryRule(existingCategories) + '\nStatement text:\n' + text;

  const transactions = await Adapters.Gemini.generateJson({ prompt, responseSchema: RESPONSE_SCHEMA });
  if (!Array.isArray(transactions)) {
    throw new Error('Gemini did not return a transactions array');
  }
  return transactions;
}

module.exports = { extractTransactions };
