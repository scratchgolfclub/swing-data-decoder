import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const openAIApiKey = Deno.env.get('key 4');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { imageBase64 } = await req.json();

    if (!openAIApiKey) {
      throw new Error('OpenAI API key not found');
    }

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
                text: 'Read and extract all displayed golf swing metrics from this launch monitor screen. This is for personal swing analysis and improvement. Return a structured JSON array where each metric is an object with 3 keys: "title" (the label shown), "value" (numeric value, supports negatives), and "descriptor" (unit like "deg", "mph", "yds"). Return ONLY the JSON array, no additional text or formatting. Example: [{"title": "Club Speed", "value": 84.5, "descriptor": "mph"}, {"title": "Face Angle", "value": -2.1, "descriptor": "deg"}]'
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
    const extractedText = data.choices[0].message.content;

    // Try to parse structured JSON metrics
    let metrics = [];
    try {
      // Remove any markdown formatting if present
      const cleanedText = extractedText.replace(/```json\n?|\n?```/g, '').trim();
      const parsedMetrics = JSON.parse(cleanedText);
      
      // Validate the structure
      if (Array.isArray(parsedMetrics)) {
        metrics = parsedMetrics.filter(metric => 
          metric.title && 
          typeof metric.value === 'number' && 
          metric.descriptor
        );
      }
      console.log('Parsed structured metrics:', metrics);
    } catch (parseError) {
      console.warn('Failed to parse structured metrics, falling back to text only:', parseError);
    }

    return new Response(JSON.stringify({ 
      text: extractedText,
      metrics: metrics 
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