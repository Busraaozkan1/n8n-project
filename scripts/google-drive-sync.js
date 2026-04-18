const { env } = require('../api/_config');

function ensureDriveUploadAuth() {
  if (!env.GOOGLE_DRIVE_ACCESS_TOKEN) {
    throw new Error('GOOGLE_DRIVE_ACCESS_TOKEN is required for Drive uploads');
  }
}

async function uploadFileToGoogleDrive({ filename, mimeType, contentBase64, folderId }) {
  ensureDriveUploadAuth();

  const boundary = `n8n-rag-${Date.now()}`;
  const metadata = {
    name: filename,
    parents: [folderId || env.GOOGLE_DRIVE_N8N_FILES_FOLDER_ID]
  };

  const multipartBody = Buffer.concat([
    Buffer.from(`--${boundary}\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n${JSON.stringify(metadata)}\r\n`),
    Buffer.from(`--${boundary}\r\nContent-Type: ${mimeType}\r\nContent-Transfer-Encoding: base64\r\n\r\n${contentBase64}\r\n`),
    Buffer.from(`--${boundary}--`)
  ]);

  const response = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${env.GOOGLE_DRIVE_ACCESS_TOKEN}`,
      'Content-Type': `multipart/related; boundary=${boundary}`
    },
    body: multipartBody
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Google Drive upload error: ${response.status} ${errText}`);
  }

  return response.json();
}

async function listFolderFiles(folderId = env.GOOGLE_DRIVE_N8N_FILES_FOLDER_ID) {
  const q = encodeURIComponent(`'${folderId}' in parents and trashed = false`);
  const fields = encodeURIComponent('files(id,name,mimeType,createdTime,webViewLink)');
  const url = `https://www.googleapis.com/drive/v3/files?q=${q}&fields=${fields}&key=${encodeURIComponent(env.GOOGLE_DRIVE_API_KEY)}`;

  const response = await fetch(url);
  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Google Drive list error: ${response.status} ${errText}`);
  }

  const payload = await response.json();
  return payload.files || [];
}

module.exports = {
  uploadFileToGoogleDrive,
  listFolderFiles
};
