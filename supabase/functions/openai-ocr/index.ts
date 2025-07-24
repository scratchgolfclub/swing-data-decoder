import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const openAIApiKey = Deno.env.get('openaikey');

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
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'You are a golf data extraction expert. Extract ALL visible TrackMan metrics from images with perfect accuracy. Include every single data point you can see, no matter how small or unclear.'
          },
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: `Extract ALL TrackMan launch monitor data from this screenshot. Be extremely thorough and extract EVERY metric visible, including:

CLUB DATA: Club Speed, Attack Angle, Club Path, Dynamic Loft, Face Angle, Spin Loft, Face to Path, Swing Plane, Swing Direction, Low Point Distance, Impact Offset, Impact Height, Dynamic Lie

BALL DATA: Ball Speed, Smash Factor, Launch Angle, Launch Direction, Spin Rate, Spin Axis

FLIGHT DATA: Curve, Height, Carry, Total, Side, Side Total, Landing Angle, Hang Time, Last Data

Format EXACTLY as: "METRIC_NAME - VALUE UNIT"
Example: "Club Speed - 98.5 mph"
Extract every single number and label you can see, even if partially obscured. Be extremely thorough.`
              },
              {
                type: 'image_url',
                image_url: {
                  url: `data:image/png;base64,${imageBase64}`
                }
              }
            ]
          }
        ],
        max_tokens: 2000,
        temperature: 0.1
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`OpenAI API error: ${error}`);
    }

    const data = await response.json();
    const extractedText = data.choices[0].message.content;

    return new Response(JSON.stringify({ text: extractedText }), {
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