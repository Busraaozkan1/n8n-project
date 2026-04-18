create extension if not exists vector;

create table if not exists documents (
  id bigserial primary key,
  filename text not null,
  file_path text not null,
  google_drive_file_id text,
  uploaded_at timestamptz not null default now()
);

create table if not exists embeddings (
  id bigserial primary key,
  document_id bigint not null references documents(id) on delete cascade,
  text_chunk text not null,
  embedding_vector vector(1536) not null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists embeddings_document_id_idx on embeddings(document_id);
create index if not exists embeddings_vector_idx on embeddings using ivfflat (embedding_vector vector_cosine_ops);

create table if not exists chat_history (
  id bigserial primary key,
  user_id text not null,
  query text not null,
  response text not null,
  "timestamp" timestamptz not null default now()
);

create index if not exists chat_history_user_id_idx on chat_history(user_id);
create index if not exists chat_history_timestamp_idx on chat_history("timestamp" desc);
