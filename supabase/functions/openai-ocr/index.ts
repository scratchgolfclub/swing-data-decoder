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

    // Call evaluate-swing function to generate insights
    try {
      const { data: insights, error: insightError } = await supabase.functions.invoke('evaluate-swing', {
        body: { swingId: insertedSwing.id }
      });

      if (insightError) {
        console.error('Insight generation error:', insightError);
        // Don't fail the main operation if insights fail
      } else {
        console.log('Generated insights:', insights);
      }
    } catch (insightError) {
      console.error('Failed to generate insights:', insightError);
      // Continue without failing
    }

    return new Response(JSON.stringify({
      success: true,
      swingId: insertedSwing.id,
      metrics: parsedMetrics,
      swingData: insertedSwing
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