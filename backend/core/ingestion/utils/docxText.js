const mammoth = require('mammoth');

// Purely mechanical: docx -> plain text. No knowledge of what a statement
// looks like - that's the extractor agent's job, since layouts vary.
async function extractText(buffer) {
  const { value } = await mammoth.extractRawText({ buffer });
  return value;
}

module.exports = { extractText };
