import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { ResultsScreen } from '@/components/ResultsScreen';
import { LoadingScreen } from '@/components/LoadingScreen';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

const SwingResults = () => {
  const { swingId } = useParams<{ swingId: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [results, setResults] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadSwingData = async () => {
      if (!swingId || !user) {
        navigate('/dashboard');
        return;
      }

      try {
        const { data: swingData, error } = await (supabase as any)
          .from('swing_data')
          .select('*')
          .eq('id', swingId)
          .eq('user_id', user.id)
          .single();

        if (error) {
          console.error('Error loading swing data:', error);
          toast.error('Could not load swing data');
          navigate('/dashboard');
          return;
        }

        // Use the current database structure with structured_metrics
        const structuredMetrics = swingData.is_baseline 
          ? swingData.structured_baseline_metrics 
          : swingData.structured_metrics;

        // Create a complete swing data object for ResultsScreen
        const swingDataObject = {
          ...swingData,
          structuredMetrics: structuredMetrics
        };

        // Format the data to match the expected structure for ResultsScreen
        const formattedResults = {
          swings: [swingDataObject],
          club: swingData.club_type
        };

        setResults(formattedResults);
      } catch (error) {
        console.error('Error loading swing data:', error);
        toast.error('Could not load swing data');
        navigate('/dashboard');
      } finally {
        setIsLoading(false);
      }
    };

    loadSwingData();
  }, [swingId, user, navigate]);

  if (isLoading) {
    return <LoadingScreen />;
  }

  if (!results) {
    return null;
  }

  return <ResultsScreen data={results} onReset={() => navigate('/dashboard')} />;
};

export default SwingResults;