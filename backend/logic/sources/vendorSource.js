// Isracard is the current vendor implementation — israeli-bank-scrapers
// supports other Israeli banks/cards too, so swapping CompanyTypes.isracard
// for another one here (or making it configurable) is the extension point.
const { createScraper, CompanyTypes } = require('israeli-bank-scrapers');

function normalize(txn) {
  return {
    date: txn.date,
    description: txn.description || '',
    amount: txn.chargedAmount,
    category: txn.category || 'Uncategorized',
  };
}

async function fetchTransactions({ id, password, card6Digits, startDate }) {
  const scraper = createScraper({
    companyId: CompanyTypes.isracard,
    startDate: new Date(startDate),
    combineInstallments: false,
    showBrowser: false,
  });

  const result = await scraper.scrape({ id, password, card6Digits });

  if (!result.success) {
    throw new Error(result.errorMessage || result.errorType || 'Scrape failed');
  }

  return result.accounts.flatMap((account) => account.txns.map(normalize));
}

module.exports = { fetchTransactions };
