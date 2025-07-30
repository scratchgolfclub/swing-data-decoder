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

// Auto-initialize vector database if empty
async function ensureVectorDatabase(): Promise<void> {
  try {
    console.log('Checking if vector database is initialized...');
    const { data: existingEmbeddings, error } = await supabase
      .from('embedding_documents')
      .select('id')
      .limit(1);

    if (error) {
      console.error('Error checking embeddings:', error);
      return;
    }

    if (existingEmbeddings && existingEmbeddings.length > 0) {
      console.log('Vector database already initialized');
      return;
    }

    console.log('Vector database empty, initializing automatically...');
    await processKnowledgeBase();
    console.log('Vector database initialization complete');
  } catch (error) {
    console.error('Error ensuring vector database:', error);
  }
}

// Process knowledge base content into embeddings
async function processKnowledgeBase(): Promise<void> {
  const knowledgeBase = `# Golf Swing Metrics and Analysis Guide

## Club Speed
- **Optimal Range**: 80-120 mph
- **Driver**: 100-120 mph (tour average: 113 mph)
- **7 Iron**: 75-95 mph (tour average: 87 mph)
- **Wedges**: 65-85 mph

## Ball Speed
- **Optimal Range**: 100-180 mph
- **Driver**: 140-180 mph (tour average: 167 mph)
- **7 Iron**: 110-140 mph (tour average: 127 mph)
- **Efficiency**: Ball speed should be 1.4-1.5x club speed

## Smash Factor
- **Optimal Range**: 1.30-1.50
- **Driver**: 1.48-1.50 (maximum efficiency)
- **Irons**: 1.35-1.40
- **Below 1.30**: Poor contact, off-center hits
- **Above 1.50**: Equipment or measurement error

## Launch Angle
- **Driver**: 10-15 degrees (optimal: 12-14°)
- **7 Iron**: 15-20 degrees (optimal: 16-18°)
- **Wedges**: 25-35 degrees
- **Too Low**: Reduces carry distance
- **Too High**: Reduces total distance

## Spin Rate
- **Driver**: 1,500-3,000 rpm (optimal: 2,200-2,800 rpm)
- **7 Iron**: 5,000-7,500 rpm (optimal: 6,000-7,000 rpm)
- **Wedges**: 8,000-12,000 rpm
- **High Spin**: Reduces distance, increases curve
- **Low Spin**: Reduces carry, increases roll

## Attack Angle
- **Driver**: +2 to +5 degrees (hitting up)
- **Irons**: -2 to -5 degrees (hitting down)
- **Wedges**: -3 to -7 degrees (steeper descent)

## Club Path
- **Optimal**: -1 to +1 degrees (square to target)
- **In-to-Out**: Positive values (+1 to +4°)
- **Out-to-In**: Negative values (-1 to -4°)
- **Extreme Values**: >±4° indicates swing path issues

## Face Angle
- **Optimal**: -1 to +1 degrees (square to target)
- **Closed**: Negative values (promotes draw/hook)
- **Open**: Positive values (promotes fade/slice)
- **Impact on Ball Flight**: Primary factor in initial direction

## Carry Distance Ranges
### Driver
- **Amateur**: 200-260 yards
- **Low Handicap**: 240-280 yards
- **Tour Pro**: 270-320 yards

### 7 Iron
- **Amateur**: 120-150 yards
- **Low Handicap**: 140-170 yards
- **Tour Pro**: 160-180 yards

## Dynamic Loft
- **Driver**: 9-13 degrees (2-4° less than static loft)
- **7 Iron**: 28-34 degrees
- **Impact**: Affects launch angle and spin rate

## Face to Path
- **Optimal**: -2 to +2 degrees
- **Determines Ball Curve**: Primary factor in side spin
- **Positive**: Face open to path (fade/slice)
- **Negative**: Face closed to path (draw/hook)`;

  const swingFaults = `# Common Golf Swing Faults and Analysis

## Slice Pattern
**Trigger Conditions:**
- Face angle: +3° to +10° (open)
- Club path: -5° to -15° (out-to-in)
- Face to path: +5° to +15°

**Characteristics:**
- Ball curves left to right (for right-handed golfer)
- Weak ball flight, loss of distance
- Often starts left of target

**Common Causes:**
- Weak grip (hands rotated left)
- Open clubface at address
- Over-the-top swing plane
- Weight shift issues
- Poor setup alignment

## Hook Pattern
**Trigger Conditions:**
- Face angle: -3° to -10° (closed)
- Club path: +2° to +10° (in-to-out)
- Face to path: -5° to -15°

**Characteristics:**
- Ball curves right to left excessively
- Often starts right of target
- Can result in loss of control

**Common Causes:**
- Strong grip (hands rotated right)
- Closed clubface at address
- Too much in-to-out swing path
- Early release of hands
- Poor body rotation`;

  const videoLibrary = `# Golf Instruction Video Library

## SLICE CORRECTION VIDEOS

### Primary Videos:
- **Slice Fix Fundamentals**: https://fast.wistia.net/embed/iframe/abc123def - Complete slice correction system covering grip, setup, and swing changes
- **Clubface Control for Slicers**: https://fast.wistia.net/embed/iframe/def456ghi - Focus on face angle management and impact positions

### Supporting Videos:
- **Grip Correction for Slice**: https://fast.wistia.net/embed/iframe/ghi789jkl - Detailed grip adjustments to reduce slice spin
- **Setup Changes for Better Path**: https://fast.wistia.net/embed/iframe/jkl012mno - Alignment and posture modifications

## HOOK CORRECTION VIDEOS

### Primary Videos:
- **Taming the Hook**: https://fast.wistia.net/embed/iframe/mno345pqr - Comprehensive hook elimination strategies
- **Path Control for Hooks**: https://fast.wistia.net/embed/iframe/pqr678stu - Swing path modifications to reduce hooks

### Supporting Videos:
- **Grip Adjustments for Hooks**: https://fast.wistia.net/embed/iframe/stu901vwx - Hand position changes to control face angle
- **Release Pattern Corrections**: https://fast.wistia.net/embed/iframe/vwx234yza - Proper hand and wrist action through impact`;

  // Function to chunk content by headings
  const chunkContent = (content: string, namespace: string) => {
    const chunks: Array<{content: string, metadata: any}> = [];
    const lines = content.split('\n');
    let currentChunk = '';
    let currentHeading = '';
    
    for (const line of lines) {
      if (line.startsWith('## ')) {
        // Save previous chunk if it exists
        if (currentChunk.trim()) {
          chunks.push({
            content: currentChunk.trim(),
            metadata: { 
              heading: currentHeading,
              namespace,
              tokens: Math.ceil(currentChunk.length / 4) // Rough token estimate
            }
          });
        }
        // Start new chunk
        currentHeading = line.replace('## ', '');
        currentChunk = line + '\n';
      } else {
        currentChunk += line + '\n';
      }
    }
    
    // Add final chunk
    if (currentChunk.trim()) {
      chunks.push({
        content: currentChunk.trim(),
        metadata: { 
          heading: currentHeading,
          namespace,
          tokens: Math.ceil(currentChunk.length / 4)
        }
      });
    }
    
    return chunks;
  };

  // Process each knowledge base
  const knowledgeBases = [
    { content: knowledgeBase, namespace: 'knowledgebase' },
    { content: swingFaults, namespace: 'swingfaults' },
    { content: videoLibrary, namespace: 'videos' }
  ];

  for (const kb of knowledgeBases) {
    console.log(`Processing ${kb.namespace}...`);
    const chunks = chunkContent(kb.content, kb.namespace);
    
    for (const chunk of chunks) {
      try {
        console.log(`Generating embedding for: ${chunk.metadata.heading}`);
        const embedding = await generateQueryEmbedding(chunk.content);
        
        const { error } = await supabase
          .from('embedding_documents')
          .insert({
            namespace: kb.namespace,
            content: chunk.content,
            embedding: embedding,
            metadata: chunk.metadata
          });

        if (error) {
          console.error(`Error inserting chunk for ${chunk.metadata.heading}:`, error);
        } else {
          console.log(`Successfully processed: ${chunk.metadata.heading}`);
        }
      } catch (error) {
        console.error(`Error processing chunk ${chunk.metadata.heading}:`, error);
      }
    }
  }
}

// Search relevant knowledge using vector similarity
async function searchRelevantKnowledge(swingData: any, clubType: string): Promise<string> {
  try {
    // Ensure vector database is initialized
    await ensureVectorDatabase();
    
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
          match_threshold: 0.4, // Lowered from 0.7 to 0.4 for better recall
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
      console.log('No relevant chunks found after all searches, using fallback knowledge');
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
  console.log(`Filtered data size: ${JSON.stringify(filteredSwingData).length} chars vs original: ${JSON.stringify(swingData).length} chars`);

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