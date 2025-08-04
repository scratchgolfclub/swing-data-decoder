import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const supabaseUrl = Deno.env.get('SUPABASE_URL');
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

console.log('Evaluate-swing function starting...');
console.log('Environment check:');
console.log('- SUPABASE_URL:', supabaseUrl ? 'present' : 'missing');
console.log('- SUPABASE_SERVICE_ROLE_KEY:', supabaseServiceKey ? 'present' : 'missing');
console.log('- OPENAI_API_KEY:', openAIApiKey ? 'present' : 'missing');

// Initialize Supabase client
const supabase = createClient(supabaseUrl!, supabaseServiceKey!);

interface SwingInsight {
  title: string;
  description: string;
  video_url?: string;
  insight_type: 'strength' | 'weakness' | 'recommendation' | 'drill';
  confidence_score: number;
}

// Generate embedding for search queries only
async function generateQueryEmbedding(text: string): Promise<number[]> {
  if (!openAIApiKey) {
    throw new Error('OpenAI API key not found');
  }

  console.log('Generating query embedding...');
  const response = await fetch('https://api.openai.com/v1/embeddings', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${openAIApiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'text-embedding-3-small',
      input: text,
    }),
  });

  if (!response.ok) {
    throw new Error(`OpenAI API error: ${response.status}`);
  }

  const data = await response.json();
  return data.data[0].embedding;
}

// Search relevant knowledge using vector similarity
async function searchRelevantKnowledge(swingData: any, clubType: string): Promise<string> {
  try {
    // Filter out non-metric fields and create multiple targeted search queries
    const excludeFields = ['id', 'user_id', 'created_at', 'updated_at', 'session_name', 'trackman_image_url'];
    const validMetrics = Object.entries(swingData)
      .filter(([key, value]) => value !== null && value !== undefined && !excludeFields.includes(key));
    
    // Create targeted search queries for specific metrics
    const searchQueries = [];
    
    // Primary search: Club-specific optimal ranges
    searchQueries.push(`${clubType} optimal ranges club speed ball speed smash factor launch angle spin rate`);
    
    // Secondary searches: Specific problematic metrics
    const metricQueries = validMetrics
      .slice(0, 5) // Limit to top 5 metrics to avoid too many queries
      .map(([key, value]) => `${key.replace(/_/g, ' ')} ${value} optimal range swing fault`);
    
    searchQueries.push(...metricQueries);
    
    console.log('Generated search queries:', searchQueries.slice(0, 3));
    
    let allRelevantChunks: any[] = [];
    
    // Execute multiple targeted searches with lower threshold
    for (const query of searchQueries) {
      try {
        const queryEmbedding = await generateQueryEmbedding(query);
        
        const { data: chunks, error } = await supabase.rpc('match_embedding', {
          query_embedding: queryEmbedding,
          match_threshold: 0.4,
          match_count: 5
        });

        if (error) {
          console.error('Error in search query:', query, error);
          continue;
        }

        if (chunks && chunks.length > 0) {
          console.log(`Query "${query.substring(0, 50)}..." found ${chunks.length} chunks, scores:`, 
            chunks.map(c => c.similarity.toFixed(3)));
          allRelevantChunks.push(...chunks);
        } else {
          console.log(`Query "${query.substring(0, 50)}..." found no chunks`);
        }
      } catch (queryError) {
        console.error(`Error processing query "${query}":`, queryError);
      }
    }

    // Remove duplicates and sort by similarity
    const uniqueChunks = allRelevantChunks
      .filter((chunk, index, self) => 
        index === self.findIndex(c => c.id === chunk.id)
      )
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, 12); // Keep top 12 most relevant

    if (uniqueChunks.length === 0) {
      console.log('No relevant chunks found, using fallback knowledge');
      return `# BASIC GOLF SWING ANALYSIS FOR ${clubType.toUpperCase()}
      
Analyze swing metrics against standard ranges and provide recommendations based on common patterns.`;
    }

    console.log(`Found ${uniqueChunks.length} total relevant knowledge chunks`);
    console.log('Top relevance scores:', uniqueChunks.slice(0, 5).map(c => c.similarity.toFixed(3)));
    console.log('Chunks by namespace:', uniqueChunks.reduce((acc: any, chunk: any) => {
      acc[chunk.namespace] = (acc[chunk.namespace] || 0) + 1;
      return acc;
    }, {}));

    // Group chunks by namespace for organized knowledge
    const groupedChunks = uniqueChunks.reduce((acc: any, chunk: any) => {
      if (!acc[chunk.namespace]) acc[chunk.namespace] = [];
      acc[chunk.namespace].push(chunk);
      return acc;
    }, {});

    // Build focused knowledge base from most relevant chunks
    let knowledgeBase = `# FOCUSED GOLF SWING ANALYSIS FOR ${clubType.toUpperCase()}\n\n`;
    
    if (groupedChunks.knowledgebase) {
      knowledgeBase += `## SWING METRICS AND OPTIMAL RANGES\n`;
      knowledgeBase += groupedChunks.knowledgebase.map((chunk: any) => chunk.content).join('\n\n');
      knowledgeBase += '\n\n';
    }
    
    if (groupedChunks.swingfaults) {
      knowledgeBase += `## SWING FAULT PATTERNS AND TRIGGERS\n`;
      knowledgeBase += groupedChunks.swingfaults.map((chunk: any) => chunk.content).join('\n\n');
      knowledgeBase += '\n\n';
    }
    
    if (groupedChunks.videos) {
      knowledgeBase += `## INSTRUCTIONAL VIDEO RECOMMENDATIONS\n`;
      knowledgeBase += groupedChunks.videos.map((chunk: any) => chunk.content).join('\n\n');
    }

    console.log(`Built focused knowledge base: ${knowledgeBase.length} characters`);
    console.log(`Token estimate: ~${Math.ceil(knowledgeBase.length / 4)} tokens`);

    return knowledgeBase;
    
  } catch (error) {
    console.error('Error in vector search:', error);
    return `# BASIC GOLF SWING ANALYSIS FOR ${clubType.toUpperCase()}
    
Analyze swing metrics against standard ranges:
- Club Speed: 80-120 mph optimal
- Ball Speed: 1.4-1.5x club speed
- Smash Factor: 1.30-1.50 optimal  
- Launch Angle: Varies by club type
- Spin Rate: Optimal range depends on club
- Face Angle: Square to target preferred
- Club Path: Square to slightly in-to-out preferred

Provide specific recommendations based on metric deviations from optimal ranges.`;
  }
}

async function analyzeSwingWithAI(swingData: any, clubType: string): Promise<SwingInsight[]> {
  const knowledgeBase = await searchRelevantKnowledge(swingData, clubType);
  
  const systemPrompt = `You are a professional golf instructor analyzing TrackMan swing data. Use the provided knowledge base to give accurate, metric-based insights.

${knowledgeBase}

INSTRUCTIONS:
1. Analyze the swing data against the good ranges in the knowledge base
2. Identify specific swing faults using the trigger conditions
3. Provide 3 targeted insights maximum
4. Include video recommendations when metrics match trigger conditions
5. Use the exact drills and feels from the knowledge base
6. Reference specific metric values in your analysis

Return ONLY a JSON array of insights in this exact format:
[
  {
    "title": "Clear, specific title",
    "description": "Detailed analysis with specific metric values and actionable advice",
    "video_url": "https://scratchgc.wistia.com/medias/...", 
    "insight_type": "strength|weakness|recommendation|drill",
    "confidence_score": 0.8
  }
]`;

  // Filter swing data to remove base64 image and other non-metric fields
  const excludeFields = ['id', 'user_id', 'created_at', 'updated_at', 'session_name', 'trackman_image_url'];
  const filteredSwingData = Object.fromEntries(
    Object.entries(swingData).filter(([key]) => !excludeFields.includes(key))
  );

  const userPrompt = `Analyze this ${clubType} swing data:
${JSON.stringify(filteredSwingData, null, 2)}

Focus on the most impactful metrics for this ${clubType}. Provide specific insights with metric values and actionable recommendations.`;

  console.log(`Filtered swing data - removed ${Object.keys(swingData).length - Object.keys(filteredSwingData).length} non-metric fields`);

  // Simple retry configuration
  const maxRetries = 3;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`Making OpenAI API call (attempt ${attempt}/${maxRetries})`);
      
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${openAIApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4o',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt }
          ],
          temperature: 0.3,
          max_tokens: 1500
        }),
      });

      console.log(`OpenAI API response status: ${response.status}`);

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`OpenAI API error (attempt ${attempt}):`, response.status, errorText);
        
        if (attempt === maxRetries) {
          throw new Error(`OpenAI API failed after ${maxRetries} attempts: ${response.status}`);
        }
        continue;
      }

      const data = await response.json();
      const content = data.choices[0].message.content;
      
      console.log('Raw OpenAI response content preview:', content.substring(0, 200));

      try {
        const insights = JSON.parse(content);
        console.log(`Successfully parsed ${insights.length} insights`);
        
        // Validate insights structure
        const validInsights = insights.filter((insight: any) => 
          insight.title && insight.description && insight.insight_type && 
          typeof insight.confidence_score === 'number'
        );
        
        if (validInsights.length === 0) {
          throw new Error('No valid insights found in OpenAI response');
        }
        
        return validInsights;
      } catch (parseError) {
        console.error('Failed to parse OpenAI response as JSON:', parseError);
        console.log('Full content that failed to parse:', content);
        
        // Return a fallback insight
        return [{
          title: 'Analysis Complete',
          description: `Your ${clubType} swing has been analyzed. Please check the metrics for detailed feedback.`,
          insight_type: 'recommendation' as const,
          confidence_score: 0.7
        }];
      }
    } catch (error) {
      console.error(`Error on attempt ${attempt}:`, error);
      if (attempt === maxRetries) {
        throw error;
      }
    }
  }

  throw new Error('Failed to get analysis after all retries');
}

serve(async (req) => {
  console.log('=== Evaluate-swing function called ===');
  console.log('Request method:', req.method);
  console.log('Request headers:', Object.fromEntries(req.headers.entries()));
  
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    console.log('Handling CORS preflight request');
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('=== Starting swing evaluation ===');
    const requestBody = await req.text();
    console.log('Raw request body:', requestBody);
    
    const { swingId, swingData } = JSON.parse(requestBody);
    
    let actualSwingData = swingData;
    
    // If swingId provided, fetch the swing data
    if (swingId && !swingData) {
      console.log(`Fetching swing data for ID: ${swingId}`);
      
      const { data: swing, error: swingError } = await supabase
        .from('swings')
        .select('*')
        .eq('id', swingId)
        .single();

      if (swingError) {
        console.error('Error fetching swing:', swingError);
        return new Response(
          JSON.stringify({ error: 'Swing not found' }),
          { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      actualSwingData = swing;
    }

    if (!actualSwingData || !actualSwingData.club_type) {
      return new Response(
        JSON.stringify({ error: 'Invalid swing data - club_type is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Analyzing ${actualSwingData.club_type} swing`);
    
    // Generate insights using AI
    const insights = await analyzeSwingWithAI(actualSwingData, actualSwingData.club_type);
    
    // Insert insights into database if swingId provided
    if (swingId) {
      console.log(`Inserting ${insights.length} insights for swing ${swingId}`);
      
      for (const insight of insights) {
        const { error: insertError } = await supabase
          .from('insights')
          .insert({
            swing_id: swingId,
            title: insight.title,
            description: insight.description,
            video_url: insight.video_url,
            insight_type: insight.insight_type,
            confidence_score: insight.confidence_score
          });

        if (insertError) {
          console.error('Error inserting insight:', insertError);
        }
      }
    }

    console.log('=== Swing evaluation completed successfully ===');
    
    return new Response(
      JSON.stringify({ insights }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in evaluate-swing function:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});