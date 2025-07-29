-- Add new columns to embedding_documents table for golf knowledge processing
ALTER TABLE public.embedding_documents 
ADD COLUMN IF NOT EXISTS title text,
ADD COLUMN IF NOT EXISTS type text,
ADD COLUMN IF NOT EXISTS trigger_metrics text[];

-- Create index on type for faster filtering
CREATE INDEX IF NOT EXISTS idx_embedding_documents_type ON public.embedding_documents(type);

-- Create index on trigger_metrics for faster array searches  
CREATE INDEX IF NOT EXISTS idx_embedding_documents_trigger_metrics ON public.embedding_documents USING GIN(trigger_metrics);

-- Add check constraint for valid types
ALTER TABLE public.embedding_documents 
ADD CONSTRAINT check_valid_type CHECK (type IN ('metric', 'fault', 'video') OR type IS NULL);