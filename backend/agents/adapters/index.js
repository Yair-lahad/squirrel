// Barrel file: every adapter is a named property here, so consumers get
// IDE autocomplete over what's available (Adapters.<Tab>) instead of having
// to know/guess a file path to require directly.
const Gemini = require('./geminiClient');

module.exports = { Gemini };
