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

async function loadKnowledgeBase(): Promise<string> {
  try {
    // Try to load knowledge files, with fallbacks for missing files
    let knowledgeBase = '';
    let swingFaults = '';
    let videoLibrary = '';
    
    try {
      knowledgeBase = await Deno.readTextFile('./markdown/knowledgeBase.md');
    } catch (e) {
      console.log('knowledgeBase.md not found, using basic metrics');
      knowledgeBase = `
CLUB SPEED: Good range 80-120 mph
BALL SPEED: Good range 100-180 mph
SMASH FACTOR: Good range 1.3-1.5
LAUNCH ANGLE: Good range 8-15 degrees
SPIN RATE: Good range 1500-3500 rpm
CARRY: Good range varies by club
`;
    }
    
    try {
      swingFaults = await Deno.readTextFile('./markdown/swingFaults_clean.md');
    } catch (e) {
      console.log('swingFaults_clean.md not found, using basic faults');
      swingFaults = `
SLICE: Face angle open relative to path
HOOK: Face angle closed relative to path
FAT SHOT: Low point behind ball
THIN SHOT: Low point too far forward
`;
    }
    
    try {
      videoLibrary = await Deno.readTextFile('./markdown/videoLibrary.md');
    } catch (e) {
      console.log('videoLibrary.md not found, using basic library');
      videoLibrary = `
Basic golf instruction videos available for common swing faults.
`;
    }
    
    return `
# GOLF SWING ANALYSIS KNOWLEDGE BASE

## SWING METRICS AND RANGES
${knowledgeBase}

## SWING FAULT PATTERNS
${swingFaults}

## INSTRUCTIONAL VIDEO LIBRARY
${videoLibrary}
`;
  } catch (error) {
    console.error('Error loading knowledge base:', error);
    return `
# BASIC GOLF SWING ANALYSIS

Analyze swing metrics against standard ranges:
- Club Speed: 80-120 mph
- Ball Speed: 100-180 mph  
- Smash Factor: 1.3-1.5
- Launch Angle: 8-15 degrees
- Spin Rate: 1500-3500 rpm
`;
  }
}

async function analyzeSwingWithAI(swingData: any, clubType: string): Promise<SwingInsight[]> {
  const knowledgeBase = await loadKnowledgeBase();
  
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

  // Retry configuration for rate limiting
  const maxRetries = 5;
  const baseDelay = 2000; // 2 seconds base delay

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${openAIApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini', // Use faster, cheaper model to reduce rate limiting
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt }
          ],
          temperature: 0.3,
          max_tokens: 1500
        }),
      });

      if (response.status === 429) {
        // Rate limited - wait and retry with exponential backoff
        const delay = baseDelay * Math.pow(2, attempt - 1) + Math.random() * 1000; // Add jitter
        console.log(`Rate limited. Retrying in ${delay}ms (attempt ${attempt}/${maxRetries})`);
        
        if (attempt < maxRetries) {
          await new Promise(resolve => setTimeout(resolve, delay));
          continue;
        } else {
          throw new Error('Rate limit exceeded after all retries');
        }
      }

      if (!response.ok) {
        throw new Error(`OpenAI API error: ${response.status} - ${await response.text()}`);
      }

      const data = await response.json();
      const content = data.choices[0].message.content;
      
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
      if (attempt === maxRetries) {
        console.error('AI analysis error after all retries:', error);
        return [{
          title: "Analysis Error",
          description: "Unable to complete AI analysis. Please try again.",
          insight_type: "recommendation", 
          confidence_score: 0.5
        }];
      }
      
      // Log the error and continue to next attempt
      console.log(`Attempt ${attempt} failed:`, error.message);
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