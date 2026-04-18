# n8n RAG Project

Complete Retrieval-Augmented Generation (RAG) setup with:
- n8n workflows
- Supabase PostgreSQL + pgvector
- Google Drive file management
- Obsidian vault sync
- Node.js API endpoints

## Project Structure

```text
n8n-project/
├── .env.example
├── .github/workflows/
│   ├── deploy.yml
│   └── database.yml
├── n8n-workflows/
│   ├── document-upload.json
│   ├── rag-pipeline.json
│   ├── obsidian-sync.json
│   └── chat-interface.json
├── database/
│   ├── schema.sql
│   └── migrations/
│       └── 001_initial_schema.sql
├── api/
│   ├── upload.js
│   ├── chat.js
│   ├── sync.js
│   ├── files.js
│   ├── _config.js
│   ├── _db.js
│   ├── _http.js
│   └── server.js
├── scripts/
│   ├── google-drive-sync.js
│   ├── obsidian-sync.js
│   └── embedding-generator.js
└── package.json
```

## Required Environment Variables

- `GOOGLE_DRIVE_API_KEY`
- `GOOGLE_DRIVE_N8N_FILES_FOLDER_ID`
- `GOOGLE_DRIVE_OBSIDIAN_FOLDER_ID`
- `OBSIDIAN_VAULT_PATH`
- `OPENAI_API_KEY`
- `SUPABASE_ANON_KEY`
- `SUPABASE_DB_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `N8N_BASE_URL`

## Setup

1. Copy `.env.example` to `.env` and fill values.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Apply database schema:
   - Run `database/schema.sql` in Supabase SQL editor
   - or run migration workflow (`.github/workflows/database.yml`)
4. Import all JSON files from `n8n-workflows/` into your n8n instance.
5. Start API:
   ```bash
   npm start
   ```

## API Endpoints

- `POST /api/upload` - Upload PDF/PPTX to Google Drive, register document, and trigger n8n
- `POST /api/chat` - Query RAG system against embeddings
- `POST /api/sync` - Manual sync to Obsidian vault
- `GET /api/files` - List uploaded files

## Notes

- Google Drive upload requires an OAuth bearer token (`GOOGLE_DRIVE_ACCESS_TOKEN`) in addition to API key usage for metadata/listing.
- Embeddings use OpenAI model set by `OPENAI_EMBEDDING_MODEL`.
- Semantic search uses pgvector cosine distance (`<=>`).
