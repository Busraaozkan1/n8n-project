const REQUIRED_ENV = [
  'GOOGLE_DRIVE_API_KEY',
  'GOOGLE_DRIVE_N8N_FILES_FOLDER_ID',
  'GOOGLE_DRIVE_OBSIDIAN_FOLDER_ID',
  'OBSIDIAN_VAULT_PATH',
  'OPENAI_API_KEY',
  'SUPABASE_ANON_KEY',
  'SUPABASE_DB_URL',
  'SUPABASE_SERVICE_ROLE_KEY',
  'N8N_BASE_URL'
];

const env = {
  GOOGLE_DRIVE_API_KEY: process.env.GOOGLE_DRIVE_API_KEY || '',
  GOOGLE_DRIVE_N8N_FILES_FOLDER_ID: process.env.GOOGLE_DRIVE_N8N_FILES_FOLDER_ID || '',
  GOOGLE_DRIVE_OBSIDIAN_FOLDER_ID: process.env.GOOGLE_DRIVE_OBSIDIAN_FOLDER_ID || '',
  GOOGLE_DRIVE_ACCESS_TOKEN: process.env.GOOGLE_DRIVE_ACCESS_TOKEN || '',
  OBSIDIAN_VAULT_PATH: process.env.OBSIDIAN_VAULT_PATH || '',
  OPENAI_API_KEY: process.env.OPENAI_API_KEY || '',
  OPENAI_EMBEDDING_MODEL: process.env.OPENAI_EMBEDDING_MODEL || 'text-embedding-3-small',
  OPENAI_CHAT_MODEL: process.env.OPENAI_CHAT_MODEL || 'gpt-4o-mini',
  SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY || '',
  SUPABASE_DB_URL: process.env.SUPABASE_DB_URL || '',
  SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY || '',
  N8N_BASE_URL: process.env.N8N_BASE_URL || '',
  N8N_WEBHOOK_DOCUMENT_UPLOAD: process.env.N8N_WEBHOOK_DOCUMENT_UPLOAD || '/webhook/document-upload',
  N8N_WEBHOOK_CHAT: process.env.N8N_WEBHOOK_CHAT || '/webhook/rag-chat',
  N8N_WEBHOOK_OBSIDIAN_SYNC: process.env.N8N_WEBHOOK_OBSIDIAN_SYNC || '/webhook/obsidian-sync',
  PORT: Number(process.env.PORT || 3000)
};

function assertRequiredEnv() {
  const missing = REQUIRED_ENV.filter((key) => !env[key]);
  if (missing.length) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }
}

module.exports = {
  env,
  assertRequiredEnv,
  REQUIRED_ENV
};
