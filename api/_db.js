const { Pool } = require('pg');
const { env } = require('./_config');

const pool = new Pool({
  connectionString: env.SUPABASE_DB_URL,
  ssl: { rejectUnauthorized: false }
});

async function query(text, params = []) {
  return pool.query(text, params);
}

async function insertDocument({ filename, filePath, googleDriveFileId }) {
  const sql = `
    insert into documents (filename, file_path, google_drive_file_id)
    values ($1, $2, $3)
    returning *
  `;
  const result = await query(sql, [filename, filePath, googleDriveFileId || null]);
  return result.rows[0];
}

async function insertEmbedding({ documentId, textChunk, vectorLiteral, metadata }) {
  const sql = `
    insert into embeddings (document_id, text_chunk, embedding_vector, metadata)
    values ($1, $2, $3::vector, $4::jsonb)
    returning id
  `;
  const result = await query(sql, [documentId, textChunk, vectorLiteral, JSON.stringify(metadata || {})]);
  return result.rows[0];
}

async function semanticSearch(vectorLiteral, limit = 5) {
  const sql = `
    select
      e.id,
      e.document_id,
      d.filename,
      e.text_chunk,
      e.metadata,
      1 - (e.embedding_vector <=> $1::vector) as similarity
    from embeddings e
    join documents d on d.id = e.document_id
    order by e.embedding_vector <=> $1::vector
    limit $2
  `;
  const result = await query(sql, [vectorLiteral, limit]);
  return result.rows;
}

async function saveChatHistory({ userId, queryText, responseText }) {
  const sql = `
    insert into chat_history (user_id, query, response)
    values ($1, $2, $3)
    returning *
  `;
  const result = await query(sql, [userId, queryText, responseText]);
  return result.rows[0];
}

async function listDocuments() {
  const sql = `
    select id, filename, file_path, google_drive_file_id, uploaded_at
    from documents
    order by uploaded_at desc
  `;
  const result = await query(sql);
  return result.rows;
}

module.exports = {
  query,
  insertDocument,
  insertEmbedding,
  semanticSearch,
  saveChatHistory,
  listDocuments,
  pool
};
