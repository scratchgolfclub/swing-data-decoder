import Header from '@/components/Header';
import { KnowledgePreprocessor } from '@/components/KnowledgePreprocessor';

export default function Preprocess() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/20">
      <Header />
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-bold text-foreground mb-2">
              Knowledge Base Preprocessing
            </h1>
            <p className="text-muted-foreground">
              Process and optimize your knowledge base for semantic search
            </p>
          </div>
          <KnowledgePreprocessor />
        </div>
      </div>
    </div>
  );
}