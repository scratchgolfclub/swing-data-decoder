-- Enable pgvector extension
CREATE EXTENSION IF NOT EXISTS vector;

-- Create embedding_documents table for storing vectorized content chunks
CREATE TABLE public.embedding_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  namespace TEXT NOT NULL, -- 'knowledgebase', 'videos', 'swingfaults'
  content TEXT NOT NULL,
  embedding vector(1536), -- OpenAI embedding vector dimension
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.embedding_documents ENABLE ROW LEVEL SECURITY;

-- Create policy for reading embeddings (anyone can read for analysis)
CREATE POLICY "Anyone can view embeddings" 
ON public.embedding_documents 
FOR SELECT 
USING (true);

-- Create policy for inserting embeddings (service role only)
CREATE POLICY "Service role can manage embeddings" 
ON public.embedding_documents 
FOR ALL 
USING (auth.role() = 'service_role');

-- Create index for vector similarity search
CREATE INDEX embedding_documents_embedding_idx ON public.embedding_documents 
USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);

-- Create index for namespace filtering
CREATE INDEX embedding_documents_namespace_idx ON public.embedding_documents (namespace);

-- Create similarity search function
CREATE OR REPLACE FUNCTION public.match_embedding(
  query_embedding vector(1536),
  match_threshold float DEFAULT 0.8,
  match_count int DEFAULT 10,
  filter_namespace text DEFAULT NULL
)
RETURNS TABLE (
  id uuid,
  namespace text,
  content text,
  metadata jsonb,
  similarity float
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    embedding_documents.id,
    embedding_documents.namespace,
    embedding_documents.content,
    embedding_documents.metadata,
    1 - (embedding_documents.embedding <=> query_embedding) AS similarity
  FROM embedding_documents
  WHERE 
    (filter_namespace IS NULL OR embedding_documents.namespace = filter_namespace)
    AND 1 - (embedding_documents.embedding <=> query_embedding) > match_threshold
  ORDER BY embedding_documents.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;