import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openAIApiKey) {
      throw new Error('OpenAI API key not found');
    }

    console.log('Starting knowledge base processing...');

    // Knowledge base content
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
- Poor body rotation

## Fat Shots
**Trigger Conditions:**
- Attack angle: Too steep for irons (< -7°)
- Impact location: Behind ball
- Low point: Too far behind ball

**Characteristics:**
- Heavy contact with ground before ball
- Reduced distance and accuracy
- Divot starts behind ball

**Common Causes:**
- Weight on back foot at impact
- Reverse pivot
- Early extension
- Poor weight transfer

## Thin Shots
**Trigger Conditions:**
- Attack angle: Too shallow or positive for irons
- Impact location: Blade contact
- Dynamic loft: Reduced significantly

**Characteristics:**
- Ball flies low with little trajectory
- Reduced carry distance
- Contact on leading edge of club

**Common Causes:**
- Weight transfer issues
- Standing up through impact
- Ball position too far forward
- Loss of spine angle

## Topped Shots
**Trigger Conditions:**
- Attack angle: Extremely shallow or positive
- Impact height: Above ball's equator
- Severe loss of posture

**Characteristics:**
- Ball rolls along ground
- No carry distance
- Contact above ball's center

**Common Causes:**
- Lifting up during downswing
- Poor posture maintenance
- Ball position too far forward
- Trying to help ball up

## Pulled Shots
**Trigger Conditions:**
- Club path: -5° to -15° (out-to-in)
- Face angle: Aligned with path
- Face to path: 0° to -2°

**Characteristics:**
- Ball flies straight left of target
- Good contact but poor direction
- Consistent leftward flight

**Common Causes:**
- Alignment issues
- Over-the-top swing
- Poor setup position
- Body positioning at address

## Pushed Shots
**Trigger Conditions:**
- Club path: +5° to +15° (in-to-out)
- Face angle: Aligned with path
- Face to path: 0° to +2°

**Characteristics:**
- Ball flies straight right of target
- Good contact but poor direction
- Consistent rightward flight

**Common Causes:**
- Alignment issues
- Too much in-to-out path
- Poor hip rotation
- Weight shift problems

## Weak Ball Striking
**Trigger Conditions:**
- Smash factor: < 1.30
- Ball speed: Low relative to club speed
- Impact location: Off-center

**Characteristics:**
- Reduced distance for given club speed
- Poor feel at impact
- Inconsistent ball flight

**Common Causes:**
- Poor impact location
- Inconsistent contact
- Equipment issues
- Setup problems

## Steep Swing (Driver)
**Trigger Conditions:**
- Attack angle: Negative with driver (< -2°)
- Spin rate: Excessively high (> 3,500 rpm)
- Launch angle: Too low (< 8°)

**Characteristics:**
- High spin, low launch
- Reduced carry distance
- Ballooning ball flight

**Common Causes:**
- Poor tee height
- Ball position too far back
- Weight transfer issues
- Swing plane problems

## Shallow Swing (Irons)
**Trigger Conditions:**
- Attack angle: Too shallow for irons (> -1°)
- Impact location: Inconsistent
- Divot pattern: No divot or thin divot

**Characteristics:**
- Inconsistent contact
- Poor distance control
- Difficulty with lies

**Common Causes:**
- Trying to help ball up
- Poor weight transfer
- Swing plane issues
- Setup problems`;

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
- **Release Pattern Corrections**: https://fast.wistia.net/embed/iframe/vwx234yza - Proper hand and wrist action through impact

## BALL STRIKING IMPROVEMENT

### Primary Videos:
- **Solid Contact Fundamentals**: https://fast.wistia.net/embed/iframe/yza567bcd - Essential elements for consistent ball striking
- **Impact Position Mastery**: https://fast.wistia.net/embed/iframe/bcd890efg - Achieving optimal impact conditions

### Supporting Videos:
- **Weight Transfer Basics**: https://fast.wistia.net/embed/iframe/efg123hij - Proper weight shift for better contact
- **Posture and Balance**: https://fast.wistia.net/embed/iframe/hij456klm - Setup fundamentals for solid strikes

## DISTANCE IMPROVEMENT

### Primary Videos:
- **Power Generation Secrets**: https://fast.wistia.net/embed/iframe/klm789nop - Maximizing clubhead speed and ball speed
- **Smash Factor Optimization**: https://fast.wistia.net/embed/iframe/nop012qrs - Improving efficiency of energy transfer

### Supporting Videos:
- **Sequence and Timing**: https://fast.wistia.net/embed/iframe/qrs345tuv - Proper kinematic sequence for power
- **Equipment Optimization**: https://fast.wistia.net/embed/iframe/tuv678wxy - Getting the most from your clubs

## CONSISTENCY TRAINING

### Primary Videos:
- **Tempo and Rhythm**: https://fast.wistia.net/embed/iframe/wxy901zab - Developing consistent swing timing
- **Pre-Shot Routine**: https://fast.wistia.net/embed/iframe/zab234cde - Building consistency through routine

### Supporting Videos:
- **Swing Plane Basics**: https://fast.wistia.net/embed/iframe/cde567fgh - Maintaining consistent swing plane
- **Practice Strategies**: https://fast.wistia.net/embed/iframe/fgh890ijk - Effective practice methods

## CLUB-SPECIFIC INSTRUCTION

### Driver Videos:
- **Driver Setup and Technique**: https://fast.wistia.net/embed/iframe/ijk123lmn - Optimizing driver performance
- **Tee Height and Ball Position**: https://fast.wistia.net/embed/iframe/lmn456opq - Critical setup elements for driver

### Iron Videos:
- **Iron Fundamentals**: https://fast.wistia.net/embed/iframe/opq789rst - Solid iron play techniques
- **Ball-First Contact**: https://fast.wistia.net/embed/iframe/rst012uvw - Achieving crisp iron strikes

### Wedge Videos:
- **Short Game Basics**: https://fast.wistia.net/embed/iframe/uvw345xyz - Wedge technique and strategy
- **Spin Control**: https://fast.wistia.net/embed/iframe/xyz678abc - Managing backspin and trajectory

## PRACTICE DRILLS

### Primary Videos:
- **Essential Practice Drills**: https://fast.wistia.net/embed/iframe/abc901def - Top drills for improvement
- **Range Practice Guide**: https://fast.wistia.net/embed/iframe/def234ghi - Effective range sessions

### Supporting Videos:
- **Home Practice Drills**: https://fast.wistia.net/embed/iframe/ghi567jkl - Drills you can do anywhere
- **Mirror Work**: https://fast.wistia.net/embed/iframe/jkl890mno - Using visual feedback

## FUNDAMENTALS SERIES

### Primary Videos:
- **Golf Fundamentals Part 1**: https://fast.wistia.net/embed/iframe/mno123pqr - Grip, stance, and posture
- **Golf Fundamentals Part 2**: https://fast.wistia.net/embed/iframe/pqr456stu - Swing mechanics basics

### Supporting Videos:
- **Equipment Basics**: https://fast.wistia.net/embed/iframe/stu789vwx - Understanding your clubs
- **Course Management**: https://fast.wistia.net/embed/iframe/vwx012yza - Strategic thinking

## ADVANCED TECHNIQUES

### Primary Videos:
- **Advanced Ball Flight Laws**: https://fast.wistia.net/embed/iframe/yza345bcd - Understanding ball flight physics
- **Shot Shaping**: https://fast.wistia.net/embed/iframe/bcd678efg - Intentional draws and fades

### Supporting Videos:
- **Troubleshooting**: https://fast.wistia.net/embed/iframe/efg901hij - Fixing common issues
- **Mental Game**: https://fast.wistia.net/embed/iframe/hij234klm - Psychology of golf`;

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

    // Generate embeddings function
    const generateEmbedding = async (text: string) => {
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
    };

    // Clear existing embeddings
    console.log('Clearing existing embeddings...');
    await supabaseClient.from('embedding_documents').delete().neq('id', '00000000-0000-0000-0000-000000000000');

    // Process each knowledge base
    const knowledgeBases = [
      { content: knowledgeBase, namespace: 'knowledgebase' },
      { content: swingFaults, namespace: 'swingfaults' },
      { content: videoLibrary, namespace: 'videos' }
    ];

    let totalProcessed = 0;

    for (const kb of knowledgeBases) {
      console.log(`Processing ${kb.namespace}...`);
      const chunks = chunkContent(kb.content, kb.namespace);
      
      for (const chunk of chunks) {
        try {
          console.log(`Generating embedding for: ${chunk.metadata.heading}`);
          const embedding = await generateEmbedding(chunk.content);
          
          const { error } = await supabaseClient
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
            totalProcessed++;
            console.log(`Successfully processed: ${chunk.metadata.heading}`);
          }
        } catch (error) {
          console.error(`Error processing chunk ${chunk.metadata.heading}:`, error);
        }
      }
    }

    console.log(`Knowledge base processing complete! Processed ${totalProcessed} chunks.`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `Successfully processed ${totalProcessed} knowledge chunks`,
        totalProcessed 
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error) {
    console.error('Error in process-knowledge-base function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});