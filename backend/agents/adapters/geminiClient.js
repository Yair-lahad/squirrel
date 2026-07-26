// Shared infra for every agent that calls Gemini - auth, model selection,
// the request/response shape, and unwrapping the JSON out of the response.
// An agent file should only contain its own prompt, schema, and logic; this
// is the only place that knows how to actually talk to the API.
const DEFAULT_MODEL = process.env.GEMINI_MODEL || 'gemini-flash-lite-latest';

async function generateJson({ prompt, responseSchema, model = DEFAULT_MODEL }) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is not set');
  }

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          responseMimeType: 'application/json',
          responseSchema,
        },
      }),
    }
  );

  if (!response.ok) {
    throw new Error(`Gemini request failed: ${response.status} ${await response.text()}`);
  }

  const result = await response.json();
  const content = result.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!content) {
    throw new Error('Gemini returned no content');
  }

  return JSON.parse(content);
}

module.exports = { generateJson };
