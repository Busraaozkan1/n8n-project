const fs = require('node:fs/promises');
const path = require('node:path');
const { env } = require('../api/_config');

function toSafeFileName(name) {
  return String(name || 'note')
    .replace(/[<>:"/\\|?*\x00-\x1F]/g, '-')
    .replace(/\s+/g, ' ')
    .trim();
}

function escapeYamlString(value) {
  return String(value || '')
    .replace(/\\/g, '\\\\')
    .replace(/"/g, '\\"')
    .replace(/\r?\n/g, ' ');
}

async function saveMarkdownToVault(fileName, markdownContent) {
  const safeName = `${toSafeFileName(fileName).replace(/\.[^.]+$/, '')}.md`;
  const targetPath = path.join(env.OBSIDIAN_VAULT_PATH, safeName);
  await fs.mkdir(env.OBSIDIAN_VAULT_PATH, { recursive: true });
  await fs.writeFile(targetPath, markdownContent, 'utf8');
  return targetPath;
}

async function syncDocumentToObsidian({ title, content, metadata = {} }) {
  const escapedTitle = escapeYamlString(title || '');
  const escapedSource = escapeYamlString(metadata.source || 'n8n-rag');

  const frontmatter = [
    '---',
    `title: "${escapedTitle}"`,
    `synced_at: "${new Date().toISOString()}"`,
    `source: "${escapedSource}"`,
    '---',
    ''
  ].join('\n');

  return saveMarkdownToVault(title || 'synced-document', `${frontmatter}${content || ''}\n`);
}

module.exports = {
  saveMarkdownToVault,
  syncDocumentToObsidian
};
