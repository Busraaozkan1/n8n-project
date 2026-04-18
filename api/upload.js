const { env } = require('./_config');
const { sendJson, readJsonBody } = require('./_http');
const { uploadFileToGoogleDrive } = require('../scripts/google-drive-sync');
const { insertDocument, insertEmbedding } = require('./_db');
const { chunkText, createEmbedding, toVectorLiteral } = require('../scripts/embedding-generator');

const SUPPORTED_EXTENSIONS = ['.pdf', '.pptx'];

function getExt(name = '') {
  const idx = name.lastIndexOf('.');
  return idx >= 0 ? name.slice(idx).toLowerCase() : '';
}

async function triggerN8nDocumentWorkflow(payload) {
  const url = `${env.N8N_BASE_URL}${env.N8N_WEBHOOK_DOCUMENT_UPLOAD}`;
  await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
}

async function processChunks(chunks, documentId, concurrency = 3) {
  for (let start = 0; start < chunks.length; start += concurrency) {
    const batch = chunks.slice(start, start + concurrency);
    const outcomes = await Promise.allSettled(
      batch.map(async (chunk, offset) => {
        const index = start + offset;
        const embedding = await createEmbedding(chunk);
        await insertEmbedding({
          documentId,
          textChunk: chunk,
          vectorLiteral: toVectorLiteral(embedding),
          metadata: { chunk_index: index }
        });
        return index;
      })
    );

    const failedOffset = outcomes.findIndex((item) => item.status === 'rejected');
    if (failedOffset >= 0) {
      const failed = outcomes[failedOffset];
      const failedIndex = start + failedOffset;
      throw new Error(`Embedding persistence failed at chunk index ${failedIndex}: ${failed.reason?.message || 'unknown error'}`);
    }
  }
}

async function handler(req, res) {
  if (req.method !== 'POST') {
    return sendJson(res, 405, { error: 'Method not allowed' });
  }

  try {
    const body = await readJsonBody(req);
    const { filename, mimeType, contentBase64, extractedText = '' } = body;

    if (!filename || !contentBase64) {
      return sendJson(res, 400, { error: 'filename and contentBase64 are required' });
    }

    const ext = getExt(filename);
    if (!SUPPORTED_EXTENSIONS.includes(ext)) {
      return sendJson(res, 400, { error: 'Only PDF/PPTX files are supported' });
    }

    const driveFile = await uploadFileToGoogleDrive({
      filename,
      mimeType: mimeType || (ext === '.pdf' ? 'application/pdf' : 'application/vnd.openxmlformats-officedocument.presentationml.presentation'),
      contentBase64,
      folderId: env.GOOGLE_DRIVE_N8N_FILES_FOLDER_ID
    });

    const document = await insertDocument({
      filename,
      filePath: `gdrive://${driveFile.id}`,
      googleDriveFileId: driveFile.id
    });

    const chunks = chunkText(extractedText);
    await processChunks(chunks, document.id);

    await triggerN8nDocumentWorkflow({
      document_id: document.id,
      filename,
      google_drive_file_id: driveFile.id,
      chunk_count: chunks.length
    });

    return sendJson(res, 201, {
      message: 'File uploaded and processed',
      document,
      googleDrive: driveFile,
      chunks: chunks.length
    });
  } catch (error) {
    return sendJson(res, error.statusCode || 500, { error: error.message });
  }
}

module.exports = {
  handler
};
