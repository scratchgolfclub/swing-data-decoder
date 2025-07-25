import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { ThumbnailService } from '@/utils/thumbnailService';
import { Upload, CheckCircle, XCircle } from 'lucide-react';

export function ThumbnailMigration() {
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const { toast } = useToast();
  
  const localThumbnails = ThumbnailService.getThumbnailMappings();
  const thumbnailCount = Object.keys(localThumbnails).length;
  
  const handleMigration = async () => {
    if (thumbnailCount === 0) {
      toast({
        title: "No thumbnails to migrate",
        description: "No local thumbnails found in storage.",
      });
      return;
    }
    
    setIsLoading(true);
    setProgress(0);
    
    try {
      const results = await ThumbnailService.migrateLocalThumbnailsToSupabase();
      
      setProgress(100);
      
      if (results.success > 0) {
        toast({
          title: "Migration completed",
          description: `Successfully migrated ${results.success} thumbnails${results.failed > 0 ? `, ${results.failed} failed` : ''}.`,
        });
      }
      
      if (results.failed > 0) {
        console.error('Migration errors:', results.errors);
        toast({
          variant: "destructive",
          title: "Some migrations failed",
          description: `${results.failed} thumbnails failed to migrate. Check console for details.`,
        });
      }
    } catch (error) {
      console.error('Migration error:', error);
      toast({
        variant: "destructive",
        title: "Migration failed",
        description: "An error occurred during migration. Check console for details.",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  if (thumbnailCount === 0) {
    return (
      <div className="flex items-center gap-2 text-muted-foreground">
        <CheckCircle className="h-4 w-4" />
        <span className="text-sm">No local thumbnails to migrate</span>
      </div>
    );
  }
  
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Upload className="h-4 w-4" />
          <span className="text-sm font-medium">
            {thumbnailCount} local thumbnail{thumbnailCount > 1 ? 's' : ''} found
          </span>
        </div>
        <Button 
          onClick={handleMigration}
          disabled={isLoading}
          size="sm"
        >
          {isLoading ? 'Migrating...' : 'Migrate to Supabase'}
        </Button>
      </div>
      
      {isLoading && (
        <div className="space-y-2">
          <Progress value={progress} className="w-full" />
          <p className="text-xs text-muted-foreground">
            Uploading thumbnails to Supabase...
          </p>
        </div>
      )}
    </div>
  );
}