import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
const supabaseUrl = Deno.env.get('SUPABASE_URL');
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Initialize Supabase client with service role key
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
        // Clean up potential markdown formatting
        const cleanContent = content.replace(/```json\n?|\n?```/g, '').trim();
        const insights = JSON.parse(cleanContent);
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
        
        // Try to extract insights from malformed JSON
        const cleanContent = content.replace(/```json\n?|\n?```/g, '').trim();
        try {
          const fallbackInsights = JSON.parse(cleanContent);
          if (Array.isArray(fallbackInsights) && fallbackInsights.length > 0) {
            return fallbackInsights;
          }
        } catch {}
        
        // Return a fallback insight only as last resort
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

// Mapping from OCR metric titles to database column names
const metricMapping: Record<string, string> = {
  // Club metrics - Title Case
  'Club Speed': 'club_speed',
  'Attack Angle': 'attack_angle',
  'Dyn. Loft': 'dynamic_loft',
  'Dynamic Loft': 'dynamic_loft',
  'Club Path': 'club_path',
  'Face Ang.': 'face_angle',
  'Face Angle': 'face_angle',
  'Face to Path': 'face_to_path',
  'Spin Loft': 'spin_loft',
  'Swing Plane': 'swing_plane',
  'Swing Direction': 'swing_direction',
  'Low Point': 'low_point',
  'Imp. Height': 'impact_height',
  'Impact Height': 'impact_height',
  'Imp. Offset': 'impact_offset',
  'Impact Offset': 'impact_offset',
  'Dynamic Lie': 'dynamic_lie',
  
  // Ball metrics - Title Case
  'Ball Speed': 'ball_speed',
  'Smash Fac.': 'smash_factor',
  'Smash Factor': 'smash_factor',
  'Launch Ang.': 'launch_angle',
  'Launch Angle': 'launch_angle',
  'Spin Rate': 'spin_rate',
  'Launch Dir.': 'launch_direction',
  'Launch Direction': 'launch_direction',
  'Spin Axis': 'spin_axis',
  
  // Flight metrics - Title Case
  'Height': 'height',
  'Curve': 'curve',
  'Land. Ang.': 'landing_angle',
  'Landing Angle': 'landing_angle',
  'Carry': 'carry',
  'Side': 'side',
  'Total': 'total',
  'Side Tot.': 'side_total',
  'Side Total': 'side_total',
  'Swing Radius': 'swing_radius',
  'Max Height Distance': 'max_height_distance',
  'Low Point Height': 'low_point_height',
  'Low Point Side': 'low_point_side',
  'D Plane Tilt': 'd_plane_tilt',
  'Hang Time': 'hang_time',

  // ALL CAPS versions (from OpenAI Vision API)
  'CLUB SPEED': 'club_speed',
  'ATTACK ANGLE': 'attack_angle',
  'DYN. LOFT': 'dynamic_loft',
  'DYNAMIC LOFT': 'dynamic_loft',
  'CLUB PATH': 'club_path',
  'FACE ANG.': 'face_angle',
  'FACE ANGLE': 'face_angle',
  'FACE TO PATH': 'face_to_path',
  'SPIN LOFT': 'spin_loft',
  'SWING PLANE': 'swing_plane',
  'SWING DIRECTION': 'swing_direction',
  'LOW POINT': 'low_point',
  'IMP. HEIGHT': 'impact_height',
  'IMPACT HEIGHT': 'impact_height',
  'IMP. OFFSET': 'impact_offset',
  'IMPACT OFFSET': 'impact_offset',
  'DYNAMIC LIE': 'dynamic_lie',
  'BALL SPEED': 'ball_speed',
  'SMASH FAC.': 'smash_factor',
  'SMASH FACTOR': 'smash_factor',
  'LAUNCH ANG.': 'launch_angle',
  'LAUNCH ANGLE': 'launch_angle',
  'SPIN RATE': 'spin_rate',
  'LAUNCH DIR.': 'launch_direction',
  'LAUNCH DIRECTION': 'launch_direction',
  'SPIN AXIS': 'spin_axis',
  'HEIGHT': 'height',
  'CURVE': 'curve',
  'LAND ANG.': 'landing_angle',
  'LAND. ANG.': 'landing_angle',
  'LANDING ANGLE': 'landing_angle',
  'CARRY': 'carry',
  'SIDE': 'side',
  'TOTAL': 'total',
  'SIDE TOT.': 'side_total',
  'SIDE TOTAL': 'side_total',
  'SWING RADIUS': 'swing_radius',
  'MAX HEIGHT DISTANCE': 'max_height_distance',
  'LOW POINT HEIGHT': 'low_point_height',
  'LOW POINT SIDE': 'low_point_side',
  'D PLANE TILT': 'd_plane_tilt',
  'HANG TIME': 'hang_time'
};

// Helper function to find metric mapping with case-insensitive matching
function findMetricMapping(title: string): string | undefined {
  // Try exact match first
  if (metricMapping[title]) {
    return metricMapping[title];
  }
  
  // Try case-insensitive match
  const upperTitle = title.toUpperCase();
  const foundKey = Object.keys(metricMapping).find(key => key.toUpperCase() === upperTitle);
  return foundKey ? metricMapping[foundKey] : undefined;
}

function parseMetricValue(value: string, columnName: string): any {
  // Ensure value is a string before calling trim
  const stringValue = String(value || '');
  if (!stringValue || stringValue.trim() === '') return null;
  
  // Handle text fields that should remain as strings
  if (columnName === 'side' || columnName === 'side_total') {
    return stringValue.trim();
  }
  
  // Extract numeric value from strings like "95.2 mph", "5.2 R", etc.
  const numericMatch = stringValue.match(/^([+-]?\d+\.?\d*)/);
  if (numericMatch) {
    const numericValue = parseFloat(numericMatch[1]);
    
    // For spin_rate, ensure it's an integer
    if (columnName === 'spin_rate') {
      return Math.round(numericValue);
    }
    
    return numericValue;
  }
  
  return null;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { imageBase64, clubType, sessionName = 'Practice Session', userId } = await req.json();

    if (!openAIApiKey) {
      throw new Error('OpenAI API key not found');
    }

    if (!userId) {
      throw new Error('User ID is required');
    }

    console.log('Processing OCR for user:', userId, 'club:', clubType);

    // Call OpenAI Vision API
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: 'Read and extract all displayed golf swing metrics from this launch monitor screen. This is for personal swing analysis and improvement. Return a structured JSON array where each metric is an object with 3 keys: "title" (the label shown), "value" (numeric value, supports negatives), and "descriptor" (unit like "deg", "mph", "yds"). Return ONLY the JSON array, no additional text or formatting.'
              },
              {
                type: 'image_url',
                image_url: {
                  url: `data:image/jpeg;base64,${imageBase64}`
                }
              }
            ]
          }
        ]
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`OpenAI API error: ${error}`);
    }

    const data = await response.json();
    const cleanedText = data.choices[0].message.content.replace(/```json\n?|\n?```/g, '').trim();
    const parsedMetrics = JSON.parse(cleanedText);

    console.log('Extracted metrics:', parsedMetrics);

    // Convert metrics to database columns
    const swingData: any = {
      user_id: userId,
      club_type: clubType,
      session_name: sessionName
      // Note: Removed trackman_image_url to avoid database storage issues with large base64 images
    };

    // Map each metric to its corresponding database column
    parsedMetrics.forEach((metric: any) => {
      const columnName = findMetricMapping(metric.title);
      if (columnName) {
        const parsedValue = parseMetricValue(metric.value, columnName);
        if (parsedValue !== null) {
          swingData[columnName] = parsedValue;
          console.log(`Mapped "${metric.title}" -> ${columnName}: ${parsedValue}`);
        }
      } else {
        console.log('Unmapped metric:', metric.title);
      }
    });

    console.log('Mapped swing data:', swingData);

    // Insert swing data into database
    const { data: insertedSwing, error: insertError } = await supabase
      .from('swings')
      .insert(swingData)
      .select()
      .single();

    if (insertError) {
      console.error('Database insert error:', insertError);
      throw new Error(`Database insert error: ${insertError.message}`);
    }

    console.log('Inserted swing:', insertedSwing);

    // Generate insights using integrated AI analysis with vector search
    let insights: SwingInsight[] = [];
    try {
      console.log('=== Starting direct insight generation ===');
      console.log(`Analyzing ${clubType} swing for ID: ${insertedSwing.id}`);
      
      // Generate insights using AI
      insights = await analyzeSwingWithAI(insertedSwing, clubType);
      
      // Insert insights into database
      console.log(`Inserting ${insights.length} insights for swing ${insertedSwing.id}`);
      
      for (const insight of insights) {
        const { error: insertError } = await supabase
          .from('insights')
          .insert({
            swing_id: insertedSwing.id,
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
      
      console.log('=== Insight generation completed successfully ===');
    } catch (insightError) {
      console.error('Failed to generate insights:', insightError);
      // Continue without failing - swing data is still saved
      insights = [{
        title: 'Analysis Complete',
        description: `Your ${clubType} swing data has been saved successfully. Analysis will be available shortly.`,
        insight_type: 'recommendation' as const,
        confidence_score: 0.7
      }];
    }

    return new Response(JSON.stringify({
      success: true,
      swingId: insertedSwing.id,
      metrics: parsedMetrics,
      swingData: insertedSwing,
      insights: insights
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in openai-ocr function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});