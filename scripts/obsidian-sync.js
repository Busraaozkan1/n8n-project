const fs = require('node:fs/promises');
const path = require('node:path');
const { env } = require('../api/_config');

function toSafeFileName(name) {
  return String(name || 'note')
    .replace(/[<>:"/\\|?*\x00-\x1F]/g, '-')
    .replace(/\s+/g, ' ')
    .trim();
}

async function saveMarkdownToVault(fileName, markdownContent) {
  const safeName = `${toSafeFileName(fileName).replace(/\.[^.]+$/, '')}.md`;
  const targetPath = path.join(env.OBSIDIAN_VAULT_PATH, safeName);
  await fs.mkdir(env.OBSIDIAN_VAULT_PATH, { recursive: true });
  await fs.writeFile(targetPath, markdownContent, 'utf8');
  return targetPath;
}

async function syncDocumentToObsidian({ title, content, metadata = {} }) {
  const frontmatter = [
    '---',
    `title: "${String(title || '').replace(/"/g, '\\"')}"`,
    `synced_at: "${new Date().toISOString()}"`,
    `source: "${String(metadata.source || 'n8n-rag')}"`,
    '---',
    ''
  ].join('\n');

  return saveMarkdownToVault(title || 'synced-document', `${frontmatter}${content || ''}\n`);
}

module.exports = {
  saveMarkdownToVault,
  syncDocumentToObsidian
};
