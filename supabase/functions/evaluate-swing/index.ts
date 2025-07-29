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

// Initialize Supabase client
const supabase = createClient(supabaseUrl!, supabaseServiceKey!);

interface SwingInsight {
  title: string;
  description: string;
  video_url?: string;
  insight_type: 'strength' | 'weakness' | 'recommendation' | 'drill';
  confidence_score: number;
}

// Generate embedding for query
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
    // Create search query from swing data and club type
    const metrics = Object.entries(swingData)
      .filter(([key, value]) => value !== null && value !== undefined && key !== 'id' && key !== 'user_id' && key !== 'created_at')
      .map(([key, value]) => `${key}: ${value}`)
      .slice(0, 10) // Limit to most important metrics
      .join(', ');
    
    const searchQuery = `Golf swing analysis for ${clubType} club with swing metrics: ${metrics}. What are the optimal ranges, common faults, and improvement recommendations?`;
    
    console.log('Search query:', searchQuery.substring(0, 200) + '...');
    
    const queryEmbedding = await generateQueryEmbedding(searchQuery);
    
    console.log('Searching for relevant knowledge chunks...');
    const { data: relevantChunks, error } = await supabase.rpc('match_embedding', {
      query_embedding: queryEmbedding,
      match_threshold: 0.7,
      match_count: 12
    });

    if (error) {
      console.error('Error searching embeddings:', error);
      throw error;
    }

    if (!relevantChunks || relevantChunks.length === 0) {
      console.log('No relevant chunks found, using fallback knowledge');
      return `# BASIC GOLF SWING ANALYSIS FOR ${clubType.toUpperCase()}
      
Analyze swing metrics against standard ranges and provide recommendations based on common patterns.`;
    }

    console.log(`Found ${relevantChunks.length} relevant knowledge chunks`);
    console.log('Relevance scores:', relevantChunks.map(c => c.similarity).slice(0, 5));

    // Group chunks by namespace for organized knowledge
    const groupedChunks = relevantChunks.reduce((acc: any, chunk: any) => {
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

  const userPrompt = `Analyze this ${clubType} swing data:
${JSON.stringify(swingData, null, 2)}

Focus on the most impactful metrics for this ${clubType}. Provide specific insights with metric values and actionable recommendations.`;

  // Simple retry configuration - let OpenAI handle rate limiting
  const maxRetries = 3;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`Making OpenAI API call (attempt ${attempt}/${maxRetries})`);
      console.log(`Using model: gpt-4o`);
      console.log(`System prompt length: ${systemPrompt.length} chars`);
      console.log(`User prompt length: ${userPrompt.length} chars`);
      
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
      console.log(`OpenAI API response headers:`, Object.fromEntries(response.headers.entries()));

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`OpenAI API error: ${response.status} - ${errorText}`);
        throw new Error(`OpenAI API error: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      console.log(`OpenAI API success - response received`);
      console.log(`OpenAI response usage:`, data.usage);
      
      const content = data.choices[0].message.content;
      console.log(`Generated content length: ${content.length} chars`);
      
      
      // Parse JSON response
      try {
        return JSON.parse(content);
      } catch (parseError) {
        console.error('Failed to parse AI response:', content);
        return [{
          title: "Analysis Complete",
          description: "Your swing has been analyzed. Check your fundamentals and practice consistency.",
          insight_type: "recommendation",
          confidence_score: 0.7
        }];
      }
    } catch (error) {
      console.log(`Attempt ${attempt} failed:`, error.message);
      
      if (attempt === maxRetries) {
        console.error('AI analysis error after all retries:', error);
        return [{
          title: "Analysis Error",
          description: "Unable to complete AI analysis. Please try again.",
          insight_type: "recommendation", 
          confidence_score: 0.5
        }];
      }
    }
  }
  
  // Fallback (shouldn't reach here)
  return [{
    title: "Analysis Error",
    description: "Unable to complete AI analysis. Please try again.",
    insight_type: "recommendation", 
    confidence_score: 0.5
  }];
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const { swingId, swings, selectedClub } = body;

    let swingData: any;
    let clubType: string;

    if (swingId) {
      // Fetch from database
      console.log('Fetching swing data for ID:', swingId);
      const { data: swing, error: swingError } = await supabase
        .from('swings')
        .select('*')
        .eq('id', swingId)
        .single();

      if (swingError || !swing) {
        throw new Error(`Could not find swing: ${swingError?.message}`);
      }
      
      swingData = swing;
      clubType = swing.club_type;
    } else if (swings && selectedClub) {
      // Use provided data
      console.log('Using provided swing data');
      swingData = swings[0]; // Analyze first swing
      clubType = selectedClub;
    } else {
      throw new Error('Either swingId or swings data must be provided');
    }

    console.log('Analyzing swing data:', { clubType, swingData });

    // Generate AI-powered insights
    const insights = await analyzeSwingWithAI(swingData, clubType);
    console.log('Generated insights:', insights);

    // Insert insights into database if swingId provided
    if (swingId) {
      const insightPromises = insights.map(insight => 
        supabase
          .from('insights')
          .insert({
            swing_id: swingId,
            ...insight
          })
      );

      const results = await Promise.all(insightPromises);
      const errors = results.filter(result => result.error);
      
      if (errors.length > 0) {
        console.error('Insight insertion errors:', errors);
      }

      const successCount = results.filter(result => !result.error).length;
      console.log(`Successfully inserted ${successCount} insights`);
    }

    return new Response(JSON.stringify({
      success: true,
      insights: insights,
      insightsGenerated: insights.length
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in evaluate-swing function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});