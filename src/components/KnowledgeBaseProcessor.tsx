import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle, CheckCircle, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export const KnowledgeBaseProcessor = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [processed, setProcessed] = useState(false);

  const processKnowledgeBase = async () => {
    setIsProcessing(true);
    try {
      console.log('Starting knowledge base processing...');
      
      const { data, error } = await supabase.functions.invoke('process-knowledge-base', {
        body: {}
      });

      if (error) {
        console.error('Error processing knowledge base:', error);
        toast.error('Failed to process knowledge base: ' + error.message);
        return;
      }

      console.log('Knowledge base processing result:', data);
      toast.success(`Successfully processed ${data.totalProcessed} knowledge chunks!`);
      setProcessed(true);
      
    } catch (error) {
      console.error('Error calling process-knowledge-base function:', error);
      toast.error('Failed to process knowledge base');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertCircle className="h-5 w-5" />
          Knowledge Base Setup
        </CardTitle>
        <CardDescription>
          Process the golf knowledge base into vector embeddings for intelligent swing analysis.
          This needs to be done once to enable AI-powered insights.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-sm text-muted-foreground space-y-2">
          <p>This process will:</p>
          <ul className="list-disc pl-4 space-y-1">
            <li>Chunk the golf knowledge base into semantic sections</li>
            <li>Generate vector embeddings using OpenAI</li>
            <li>Store embeddings in Supabase Vector database</li>
            <li>Enable contextual knowledge retrieval for swing analysis</li>
          </ul>
        </div>
        
        {processed && (
          <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <span className="text-sm text-green-700">Knowledge base successfully processed!</span>
          </div>
        )}

        <Button 
          onClick={processKnowledgeBase} 
          disabled={isProcessing || processed}
          className="w-full"
        >
          {isProcessing ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Processing Knowledge Base...
            </>
          ) : processed ? (
            'Knowledge Base Processed'
          ) : (
            'Process Knowledge Base'
          )}
        </Button>

        <div className="text-xs text-muted-foreground">
          <p><strong>Note:</strong> This process uses OpenAI's embedding API and may take 1-2 minutes to complete.</p>
        </div>
      </CardContent>
    </Card>
  );
};