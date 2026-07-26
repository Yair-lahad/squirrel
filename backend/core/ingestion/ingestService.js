const crypto = require('crypto');
const transactionService = require('../transactions/transactionService');
const ruleService = require('../categorization/ruleService');
const fileSource = require('./fileSource');
const mockSource = require('./mockSource');
const vendorSource = require('./vendorSource');
const docxText = require('./utils/docxText');
const statementExtractor = require('../../agents/statementExtractor');

// Every "load some transactions" flow ends the same way: persist them, then
// layer the user's category rules on top before returning. Centralizing that
// here is what lets each controller stay pure HTTP (parse request, call one
// service function, shape the response).

function hashContent(data) {
  return crypto.createHash('sha256').update(data).digest('hex');
}

async function ingestFile() {
  const existing = await transactionService.findUploadBySource('file');
  const stored = existing
    ? await transactionService.getTransactions({ uploadId: existing.id })
    : await transactionService.storeAndGetIds(fileSource.getTransactions(), 'file', 'Sample file');
  return ruleService.applyRulesTo(stored);
}

async function ingestMock() {
  const stored = await transactionService.storeAndGetIds(mockSource.getTransactions(), 'mock', 'Mock data');
  return ruleService.applyRulesTo(stored);
}

async function ingestVendor({ id, password, card6Digits, startDate }) {
  const transactions = await vendorSource.fetchTransactions({ id, password, card6Digits, startDate });
  const stored = await transactionService.storeAndGetIds(transactions, 'vendor', `Isracard fetch (from ${startDate})`);
  return ruleService.applyRulesTo(stored);
}

async function ingestUploadJson(transactions, label) {
  const contentHash = hashContent(JSON.stringify(transactions));
  const stored = await transactionService.storeAndGetIds(transactions, 'upload', label, contentHash);
  return ruleService.applyRulesTo(stored);
}

// Any non-JSON statement document (currently .docx) - text is extracted
// mechanically, then an LLM (see agents/statementExtractor.js) does the
// actual understanding of whatever layout the statement happens to use.
async function ingestUploadDoc(file) {
  const contentHash = hashContent(file.buffer);
  // Checked up front, before spending an LLM call re-extracting a file
  // that's already been uploaded.
  const existing = await transactionService.findUploadByContentHash(contentHash);
  if (existing) {
    const stored = await transactionService.getTransactions({ uploadId: existing.id });
    return ruleService.applyRulesTo(stored);
  }

  const text = await docxText.extractText(file.buffer);
  const dbCategories = (await ruleService.listCategories()).map((c) => c.name);
  const existingCategories = [...new Set([...fileSource.CANONICAL_CATEGORIES, ...dbCategories])];
  const transactions = await statementExtractor.extractTransactions(text, existingCategories);
  const stored = await transactionService.storeAndGetIds(transactions, 'upload', file.originalname, contentHash);
  return ruleService.applyRulesTo(stored);
}

module.exports = { ingestFile, ingestMock, ingestVendor, ingestUploadJson, ingestUploadDoc };
