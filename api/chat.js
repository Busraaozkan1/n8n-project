const { env } = require('./_config');
const { sendJson, readJsonBody } = require('./_http');
const { createEmbedding, toVectorLiteral } = require('../scripts/embedding-generator');
const { semanticSearch, saveChatHistory } = require('./_db');

async function generateRagResponse(query, contextRows) {
  const context = contextRows
    .map((row, index) => `#${index + 1} (${row.filename})\n${row.text_chunk}`)
    .join('\n\n');

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${env.OPENAI_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: env.OPENAI_CHAT_MODEL,
      messages: [
        {
          role: 'system',
          content: 'You answer based only on the provided context. If context is insufficient, say so clearly.'
        },
        {
          role: 'user',
          content: `Context:\n${context}\n\nQuestion: ${query}`
        }
      ]
    })
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`OpenAI chat error: ${response.status} ${errText}`);
  }

  const payload = await response.json();
  return payload.choices?.[0]?.message?.content || 'No response generated.';
}

async function triggerN8nChatWorkflow(payload) {
  const url = `${env.N8N_BASE_URL}${env.N8N_WEBHOOK_CHAT}`;
  await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
}

async function handler(req, res) {
  if (req.method !== 'POST') {
    return sendJson(res, 405, { error: 'Method not allowed' });
  }

  try {
    const body = await readJsonBody(req);
    const { user_id: userId = 'anonymous', query } = body;

    if (!query || !String(query).trim()) {
      return sendJson(res, 400, { error: 'query is required' });
    }

    const queryEmbedding = await createEmbedding(query);
    const results = await semanticSearch(toVectorLiteral(queryEmbedding), 5);
    const responseText = await generateRagResponse(query, results);

    const history = await saveChatHistory({ userId, queryText: query, responseText });
    await triggerN8nChatWorkflow({ user_id: userId, query, response: responseText, context_hits: results.length });

    return sendJson(res, 200, {
      response: responseText,
      context: results,
      chat_history: history
    });
  } catch (error) {
    return sendJson(res, error.statusCode || 500, { error: error.message });
  }
}

module.exports = {
  handler
};
