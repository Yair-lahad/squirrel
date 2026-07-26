// Template for a new agent. An agent's only job is: given some input, ask an
// LLM a specific question via an adapter (see adapters/) and return a typed
// result. It should NOT contain HTTP handling (that's the controller), DB
// access (that's a service in core/), or the mechanics of talking to a
// model provider (that's the adapter) - only the prompt, the expected
// response shape, and any logic specific to this one job.
//
// Copy this file, rename it, delete this comment block, and fill in the
// three pieces below. See statementExtractor.js for a real example.

// Adapters is a barrel - type "Adapters." to see every adapter available
// (Gemini today) instead of guessing a file path to require directly.
const Adapters = require('./adapters');

// 1. The shape you want back. Gemini enforces this server-side, so the
// result is always valid JSON matching it - still worth checking the
// top-level shape you expect (e.g. "is this actually an array"), but no
// need to defensively re-check every field.
const RESPONSE_SCHEMA = {
  type: 'OBJECT',
  properties: {
    // ...
  },
  required: [],
};

// 2. The prompt. Keep it self-contained - everything the model needs to
// know about the task. Each call is stateless, no prior turns to rely on.
const PROMPT = `...`;

// 3. The exported function(s). Take whatever plain-JS input this agent's
// job needs, build the final prompt, call the adapter, return the result.
async function doTheThing(input) {
  const prompt = PROMPT + input;
  return Adapters.Gemini.generateJson({ prompt, responseSchema: RESPONSE_SCHEMA });
}

module.exports = { doTheThing };
