import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { AlertCircle, CheckCircle, Loader2, Database, Zap } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface ProcessingStats {
  totalFiles: number;
  totalChunks: number;
  successfullyProcessed: number;
  failedChunks: number;
}

export const KnowledgePreprocessor = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [processed, setProcessed] = useState(false);
  const [stats, setStats] = useState<ProcessingStats | null>(null);
  const [progress, setProgress] = useState(0);

  const preprocessKnowledge = async () => {
    setIsProcessing(true);
    setProgress(0);
    
    try {
      console.log('Starting intelligent knowledge preprocessing...');
      
      // Start progress animation
      const progressInterval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 90) return prev;
          return prev + Math.random() * 10;
        });
      }, 500);

      const { data, error } = await supabase.functions.invoke('preprocess-knowledge', {
        body: {}
      });

      clearInterval(progressInterval);
      setProgress(100);

      if (error) {
        console.error('Error preprocessing knowledge:', error);
        toast.error('Failed to preprocess knowledge: ' + error.message);
        return;
      }

      if (!data.success) {
        throw new Error(data.error || 'Unknown error occurred');
      }

      console.log('Knowledge preprocessing result:', data);
      setStats(data.stats);
      
      toast.success(
        `Successfully processed ${data.stats.successfullyProcessed} chunks from ${data.stats.totalFiles} files!`,
        {
          description: `Created ${data.stats.totalChunks} intelligent chunks with optimal token sizes (100-300 tokens each)`
        }
      );
      setProcessed(true);
      
    } catch (error) {
      console.error('Error calling preprocess-knowledge function:', error);
      toast.error('Failed to preprocess knowledge base');
      setProgress(0);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="h-5 w-5" />
          Intelligent Knowledge Preprocessing
        </CardTitle>
        <CardDescription>
          Process and chunk your markdown files into optimized embeddings for semantic search.
          Uses intelligent chunking with 100-300 token limits for optimal retrieval performance.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div className="bg-muted/50 p-4 rounded-lg">
            <h4 className="font-semibold mb-2 flex items-center gap-2">
              <Zap className="h-4 w-4" />
              Intelligent Chunking
            </h4>
            <ul className="space-y-1 text-muted-foreground">
              <li>• Sections & paragraphs</li>
              <li>• 100-300 token limit</li>
              <li>• Context preservation</li>
            </ul>
          </div>
          
          <div className="bg-muted/50 p-4 rounded-lg">
            <h4 className="font-semibold mb-2">Files Processed</h4>
            <ul className="space-y-1 text-muted-foreground">
              <li>• knowledgebase.md</li>
              <li>• swingfaults.md</li>
              <li>• videolibrary.md</li>
            </ul>
          </div>
          
          <div className="bg-muted/50 p-4 rounded-lg">
            <h4 className="font-semibold mb-2">Embedding Model</h4>
            <ul className="space-y-1 text-muted-foreground">
              <li>• text-embedding-3-small</li>
              <li>• 1536 dimensions</li>
              <li>• Optimized for retrieval</li>
            </ul>
          </div>
        </div>

        {isProcessing && (
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              Processing chunks and generating embeddings...
            </div>
            <Progress value={progress} className="w-full" />
          </div>
        )}
        
        {processed && stats && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 p-4 bg-green-50 border border-green-200 rounded-lg">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <div>
                <p className="font-semibold text-green-700">Processing Complete!</p>
                <p className="text-sm text-green-600">Knowledge base is ready for semantic search</p>
              </div>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div className="bg-background border rounded-lg p-3">
                <div className="text-2xl font-bold text-primary">{stats.totalFiles}</div>
                <div className="text-sm text-muted-foreground">Files</div>
              </div>
              <div className="bg-background border rounded-lg p-3">
                <div className="text-2xl font-bold text-primary">{stats.totalChunks}</div>
                <div className="text-sm text-muted-foreground">Chunks</div>
              </div>
              <div className="bg-background border rounded-lg p-3">
                <div className="text-2xl font-bold text-green-600">{stats.successfullyProcessed}</div>
                <div className="text-sm text-muted-foreground">Embedded</div>
              </div>
              <div className="bg-background border rounded-lg p-3">
                <div className="text-2xl font-bold text-red-500">{stats.failedChunks}</div>
                <div className="text-sm text-muted-foreground">Failed</div>
              </div>
            </div>
          </div>
        )}

        <Button 
          onClick={preprocessKnowledge} 
          disabled={isProcessing || processed}
          className="w-full"
          size="lg"
        >
          {isProcessing ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Processing Knowledge Base...
            </>
          ) : processed ? (
            <>
              <CheckCircle className="mr-2 h-4 w-4" />
              Knowledge Base Processed
            </>
          ) : (
            <>
              <Database className="mr-2 h-4 w-4" />
              Start Intelligent Preprocessing
            </>
          )}
        </Button>

        <div className="text-xs text-muted-foreground space-y-2">
          <p><strong>Note:</strong> This process uses OpenAI's text-embedding-3-small model and may take 2-3 minutes to complete.</p>
          <p><strong>Advanced Features:</strong> Intelligent chunking preserves context while optimizing for semantic search performance.</p>
        </div>
      </CardContent>
    </Card>
  );
};