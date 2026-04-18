const { sendJson } = require('./_http');
const { listDocuments } = require('./_db');
const { listFolderFiles } = require('../scripts/google-drive-sync');

async function handler(req, res) {
  if (req.method !== 'GET') {
    return sendJson(res, 405, { error: 'Method not allowed' });
  }

  try {
    const [documents, driveFiles] = await Promise.all([listDocuments(), listFolderFiles()]);
    return sendJson(res, 200, { documents, google_drive_files: driveFiles });
  } catch (error) {
    return sendJson(res, error.statusCode || 500, { error: error.message });
  }
}

module.exports = {
  handler
};
