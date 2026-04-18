const { env } = require('../api/_config');

function chunkText(text, chunkSize = 1200, overlap = 150) {
  const normalized = String(text || '').replace(/\s+/g, ' ').trim();
  if (!normalized) return [];

  const chunks = [];
  let cursor = 0;
  while (cursor < normalized.length) {
    const end = Math.min(cursor + chunkSize, normalized.length);
    chunks.push(normalized.slice(cursor, end));
    if (end === normalized.length) break;
    cursor = Math.max(end - overlap, cursor + 1);
  }
  return chunks;
}

async function createEmbedding(text) {
  const response = await fetch('https://api.openai.com/v1/embeddings', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${env.OPENAI_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: env.OPENAI_EMBEDDING_MODEL,
      input: text
    })
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`OpenAI embedding error: ${response.status} ${errText}`);
  }

  const payload = await response.json();
  return payload.data?.[0]?.embedding || [];
}

function toVectorLiteral(arr) {
  return `[${arr.map((v) => Number(v).toFixed(10)).join(',')}]`;
}

module.exports = {
  chunkText,
  createEmbedding,
  toVectorLiteral
};
