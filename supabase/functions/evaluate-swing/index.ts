import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

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

function analyzeSwing(swing: any): SwingInsight[] {
  const insights: SwingInsight[] = [];

  // Face Angle Analysis
  if (swing.face_angle !== null) {
    if (swing.face_angle > 5) {
      insights.push({
        title: "Face Too Open",
        description: `Your clubface is ${swing.face_angle}° open at impact, which typically causes shots to go right. Focus on strengthening your grip or rotating your hands more through impact.`,
        video_url: "https://www.youtube.com/watch?v=2V6utLRt37o",
        insight_type: "weakness",
        confidence_score: 0.9
      });
    } else if (swing.face_angle < -5) {
      insights.push({
        title: "Face Too Closed",
        description: `Your clubface is ${Math.abs(swing.face_angle)}° closed at impact, which typically causes hooks or draws. Try weakening your grip or slowing down your hand rotation.`,
        video_url: "https://www.youtube.com/watch?v=pB75alqHM8s",
        insight_type: "weakness",
        confidence_score: 0.9
      });
    } else {
      insights.push({
        title: "Great Face Control",
        description: `Excellent clubface control with only ${Math.abs(swing.face_angle)}° deviation. This square face position promotes consistent ball striking.`,
        insight_type: "strength",
        confidence_score: 0.8
      });
    }
  }

  // Club Path Analysis
  if (swing.club_path !== null) {
    if (swing.club_path > 4) {
      insights.push({
        title: "Too Much Inside-Out",
        description: `Your swing path is ${swing.club_path}° from the inside, which can cause pushes or hooks. Try working on your backswing plane to approach the ball more neutrally.`,
        video_url: "https://www.youtube.com/watch?v=xXWY4OXiU_g",
        insight_type: "weakness",
        confidence_score: 0.85
      });
    } else if (swing.club_path < -4) {
      insights.push({
        title: "Coming Over the Top",
        description: `Your swing path is ${Math.abs(swing.club_path)}° over the top (outside-in), which often causes slices or pulls. Focus on dropping the club into the slot on the downswing.`,
        video_url: "https://www.youtube.com/watch?v=ST79LJKx6-k",
        insight_type: "weakness",
        confidence_score: 0.9
      });
    } else {
      insights.push({
        title: "Neutral Swing Path",
        description: `Your swing path of ${swing.club_path}° is close to neutral, promoting consistent ball flight and direction control.`,
        insight_type: "strength",
        confidence_score: 0.8
      });
    }
  }

  // Attack Angle Analysis (for drivers)
  if (swing.attack_angle !== null && swing.club_type === 'driver') {
    if (swing.attack_angle < -2) {
      insights.push({
        title: "Hitting Down on Driver",
        description: `Your attack angle is ${swing.attack_angle}°, which is too steep for a driver. Try teeing the ball higher and positioning it more forward in your stance.`,
        video_url: "https://www.youtube.com/watch?v=WvSaosUPEXQ",
        insight_type: "recommendation",
        confidence_score: 0.9
      });
    } else if (swing.attack_angle >= 1 && swing.attack_angle <= 5) {
      insights.push({
        title: "Optimal Launch Conditions",
        description: `Great attack angle of ${swing.attack_angle}° for a driver. This upward strike maximizes distance and carry.`,
        insight_type: "strength",
        confidence_score: 0.85
      });
    }
  }

  // Smash Factor Analysis
  if (swing.smash_factor !== null && swing.club_type === 'driver') {
    if (swing.smash_factor >= 1.45) {
      insights.push({
        title: "Excellent Ball Striking",
        description: `Outstanding smash factor of ${swing.smash_factor}. You're making very solid contact and transferring energy efficiently to the ball.`,
        insight_type: "strength",
        confidence_score: 0.9
      });
    } else if (swing.smash_factor < 1.35) {
      insights.push({
        title: "Improve Contact Quality",
        description: `Your smash factor of ${swing.smash_factor} suggests room for improvement in contact quality. Focus on finding the center of the clubface consistently.`,
        video_url: "https://www.youtube.com/watch?v=kKGEXhgP3hA",
        insight_type: "recommendation",
        confidence_score: 0.8
      });
    }
  }

  // Spin Rate Analysis (for drivers)
  if (swing.spin_rate !== null && swing.club_type === 'driver') {
    if (swing.spin_rate > 3000) {
      insights.push({
        title: "High Spin Rate",
        description: `Your spin rate of ${swing.spin_rate} RPM is high for a driver. This reduces distance. Try a lower lofted driver or adjust your attack angle.`,
        insight_type: "recommendation",
        confidence_score: 0.8
      });
    } else if (swing.spin_rate >= 2000 && swing.spin_rate <= 2700) {
      insights.push({
        title: "Optimal Spin Rate",
        description: `Perfect spin rate of ${swing.spin_rate} RPM for maximum driver distance. This promotes an ideal ball flight trajectory.`,
        insight_type: "strength",
        confidence_score: 0.85
      });
    }
  }

  // Side/Accuracy Analysis
  if (swing.side !== null && swing.side !== '') {
    const sideMatch = swing.side.toString().match(/^([0-9]+\.?[0-9]*)/);
    if (sideMatch) {
      const sideValue = parseFloat(sideMatch[1]);
      if (sideValue > 25) {
        insights.push({
          title: "Accuracy Focus Needed",
          description: `Your shot landed ${swing.side} from the target line. Work on your fundamentals like grip, stance, and swing plane for better consistency.`,
          video_url: "https://www.youtube.com/watch?v=ZRz6Xaq6rdw",
          insight_type: "recommendation",
          confidence_score: 0.7
        });
      } else if (sideValue <= 15) {
        insights.push({
          title: "Great Accuracy",
          description: `Excellent accuracy with your shot landing only ${swing.side} from the target. Keep up the consistent fundamentals!`,
          insight_type: "strength",
          confidence_score: 0.8
        });
      }
    }
  }

  // Distance Analysis (for drivers)
  if (swing.total !== null && swing.club_type === 'driver') {
    if (swing.total > 270) {
      insights.push({
        title: "Great Distance",
        description: `Impressive total distance of ${swing.total} yards. You're generating excellent clubhead speed and making solid contact.`,
        insight_type: "strength",
        confidence_score: 0.8
      });
    }
  }

  return insights;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { swingId } = await req.json();

    if (!swingId) {
      throw new Error('Swing ID is required');
    }

    console.log('Evaluating swing:', swingId);

    // Fetch swing data
    const { data: swing, error: swingError } = await supabase
      .from('swings')
      .select('*')
      .eq('id', swingId)
      .single();

    if (swingError || !swing) {
      throw new Error(`Could not find swing: ${swingError?.message}`);
    }

    console.log('Analyzing swing data:', swing);

    // Generate insights
    const insights = analyzeSwing(swing);

    console.log('Generated insights:', insights);

    // Insert insights into database
    const insightPromises = insights.map(insight => 
      supabase
        .from('insights')
        .insert({
          swing_id: swingId,
          ...insight
        })
    );

    const results = await Promise.all(insightPromises);
    
    // Check for any errors
    const errors = results.filter(result => result.error);
    if (errors.length > 0) {
      console.error('Insight insertion errors:', errors);
    }

    const successCount = results.filter(result => !result.error).length;
    console.log(`Successfully inserted ${successCount} insights`);

    return new Response(JSON.stringify({
      success: true,
      insightsGenerated: successCount,
      insights: insights
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