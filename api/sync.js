const { env } = require('./_config');
const { sendJson, readJsonBody } = require('./_http');
const { syncDocumentToObsidian } = require('../scripts/obsidian-sync');

async function triggerN8nSyncWorkflow(payload) {
  const url = `${env.N8N_BASE_URL}${env.N8N_WEBHOOK_OBSIDIAN_SYNC}`;
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
    const { title, content, metadata } = body;

    if (!title || !content) {
      return sendJson(res, 400, { error: 'title and content are required' });
    }

    const savedPath = await syncDocumentToObsidian({ title, content, metadata });
    await triggerN8nSyncWorkflow({ title, vault_path: savedPath });

    return sendJson(res, 200, { message: 'Synced to Obsidian vault', path: savedPath });
  } catch (error) {
    return sendJson(res, error.statusCode || 500, { error: error.message });
  }
}

module.exports = {
  handler
};
