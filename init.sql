CREATE EXTENSION IF NOT EXISTS vector;

-- HNSW Vector Index for High Performance Cosine Distance Search
CREATE INDEX IF NOT EXISTS idx_log_embedding_hnsw 
ON log_embedding 
USING hnsw (embedding vector_cosine_ops);