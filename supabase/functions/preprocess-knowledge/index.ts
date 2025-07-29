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

// Rough token estimation (1 token ≈ 4 characters)
function estimateTokens(text: string): number {
  return Math.ceil(text.length / 4);
}

// Intelligent chunking by sections and paragraphs with token limits
function chunkContentIntelligently(content: string, namespace: string, minTokens = 100, maxTokens = 300): Array<{content: string, metadata: any}> {
  const chunks: Array<{content: string, metadata: any}> = [];
  const lines = content.split('\n');
  
  let currentChunk = '';
  let currentHeading = '';
  let chunkIndex = 0;
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    
    // Check if this is a heading
    if (line.startsWith('#')) {
      // Save previous chunk if it meets token requirements
      if (currentChunk.trim() && estimateTokens(currentChunk) >= minTokens) {
        chunks.push({
          content: currentChunk.trim(),
          metadata: {
            heading: currentHeading,
            namespace,
            tokens: estimateTokens(currentChunk),
            chunk_index: chunkIndex++,
            type: 'section'
          }
        });
        currentChunk = '';
      }
      
      // Start new section
      currentHeading = line.replace(/^#+\s*/, '');
      currentChunk = line + '\n';
    } else if (line === '') {
      // Empty line - potential paragraph break
      currentChunk += '\n';
      
      // Check if current chunk is large enough and we're at a paragraph break
      const currentTokens = estimateTokens(currentChunk);
      if (currentTokens >= maxTokens) {
        // Force chunk here to stay within token limit
        chunks.push({
          content: currentChunk.trim(),
          metadata: {
            heading: currentHeading,
            namespace,
            tokens: currentTokens,
            chunk_index: chunkIndex++,
            type: 'paragraph_group'
          }
        });
        currentChunk = '';
      }
    } else {
      // Regular content line
      const tempChunk = currentChunk + line + '\n';
      
      // Check if adding this line would exceed max tokens
      if (estimateTokens(tempChunk) > maxTokens && currentChunk.trim()) {
        // Save current chunk and start new one
        chunks.push({
          content: currentChunk.trim(),
          metadata: {
            heading: currentHeading,
            namespace,
            tokens: estimateTokens(currentChunk),
            chunk_index: chunkIndex++,
            type: 'paragraph_split'
          }
        });
        currentChunk = currentHeading ? `## ${currentHeading}\n${line}\n` : `${line}\n`;
      } else {
        currentChunk = tempChunk;
      }
    }
  }
  
  // Add final chunk if it exists and meets minimum requirements
  if (currentChunk.trim() && estimateTokens(currentChunk) >= minTokens) {
    chunks.push({
      content: currentChunk.trim(),
      metadata: {
        heading: currentHeading,
        namespace,
        tokens: estimateTokens(currentChunk),
        chunk_index: chunkIndex++,
        type: 'final'
      }
    });
  }
  
  return chunks;
}

// Generate embeddings using OpenAI's text-embedding-3-small
async function generateEmbedding(text: string): Promise<number[]> {
  if (!openAIApiKey) {
    throw new Error('OpenAI API key not found');
  }

  console.log(`Generating embedding for text (${text.length} chars, ~${estimateTokens(text)} tokens)`);
  
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
    const errorText = await response.text();
    throw new Error(`OpenAI API error: ${response.status} - ${errorText}`);
  }

  const data = await response.json();
  console.log(`Embedding generated successfully (${data.data[0].embedding.length} dimensions)`);
  return data.data[0].embedding;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Starting intelligent knowledge base preprocessing...');
    
    if (!openAIApiKey) {
      throw new Error('OpenAI API key not configured in Supabase secrets');
    }

    // Knowledge base content - knowledgebase.md
    const knowledgeBase = `# Golf Swing Metrics and Analysis Guide

## Club Speed
- **Optimal Range**: 80-120 mph
- **Driver**: 100-120 mph (tour average: 113 mph)
- **7 Iron**: 75-95 mph (tour average: 87 mph)
- **Wedges**: 65-85 mph

Club speed is the velocity of the clubhead just before impact. It's measured in miles per hour (mph) and is one of the primary factors determining distance. Higher club speeds generally result in greater ball speeds and longer distances, but only when combined with solid contact.

For amateur golfers, focusing on technique and consistency often yields better results than simply trying to swing harder. Tour professionals average around 113 mph with their drivers, but recreational golfers typically see club speeds between 80-100 mph.

## Ball Speed
- **Optimal Range**: 100-180 mph
- **Driver**: 140-180 mph (tour average: 167 mph)
- **7 Iron**: 110-140 mph (tour average: 127 mph)
- **Efficiency**: Ball speed should be 1.4-1.5x club speed

Ball speed is the velocity of the golf ball immediately after impact. It's directly related to distance and is influenced by club speed, contact quality, and equipment. The relationship between club speed and ball speed is measured by smash factor.

For optimal performance, focus on center face contact rather than just swinging harder. A well-struck shot with slightly less club speed will often travel farther than a mishit with higher club speed.

## Smash Factor
- **Optimal Range**: 1.30-1.50
- **Driver**: 1.48-1.50 (maximum efficiency)
- **Irons**: 1.35-1.40
- **Below 1.30**: Poor contact, off-center hits
- **Above 1.50**: Equipment or measurement error

Smash factor represents the efficiency of energy transfer from club to ball. It's calculated by dividing ball speed by club speed. A higher smash factor indicates better contact and more efficient energy transfer.

Achieving consistent smash factors near the optimal range requires solid fundamentals: proper setup, balance throughout the swing, and center face contact. Equipment fitting can also help maximize smash factor.

## Launch Angle
- **Driver**: 10-15 degrees (optimal: 12-14°)
- **7 Iron**: 15-20 degrees (optimal: 16-18°)
- **Wedges**: 25-35 degrees
- **Too Low**: Reduces carry distance
- **Too High**: Reduces total distance

Launch angle is the vertical angle at which the ball leaves the clubface. It significantly affects both carry distance and total distance. The optimal launch angle varies by club type and individual swing characteristics.

Modern equipment and fitting emphasize optimizing launch conditions for each player's swing. Factors affecting launch angle include attack angle, dynamic loft, and impact location on the face.

## Spin Rate
- **Driver**: 1,500-3,000 rpm (optimal: 2,200-2,800 rpm)
- **7 Iron**: 5,000-7,500 rpm (optimal: 6,000-7,000 rpm)
- **Wedges**: 8,000-12,000 rpm
- **High Spin**: Reduces distance, increases curve
- **Low Spin**: Reduces carry, increases roll

Spin rate affects ball flight, distance, and stopping power. Backspin creates lift, helping the ball carry farther, but too much spin reduces distance and increases sensitivity to wind. Sidespin causes the ball to curve left or right.

Optimizing spin rate involves managing attack angle, club path, face angle, and equipment selection. Modern equipment allows for significant spin rate optimization through proper fitting.

## Attack Angle
- **Driver**: +2 to +5 degrees (hitting up)
- **Irons**: -2 to -5 degrees (hitting down)
- **Wedges**: -3 to -7 degrees (steeper descent)

Attack angle describes whether the club is moving upward or downward at impact. It's measured in degrees, with positive values indicating an upward strike and negative values indicating a downward strike.

For drivers, hitting up on the ball (positive attack angle) helps optimize launch and spin for maximum distance. For irons, a slightly descending blow ensures solid contact and proper ball flight.

## Club Path
- **Optimal**: -1 to +1 degrees (square to target)
- **In-to-Out**: Positive values (+1 to +4°)
- **Out-to-In**: Negative values (-1 to -4°)
- **Extreme Values**: >±4° indicates swing path issues

Club path is the horizontal direction the clubhead travels through impact relative to the target line. It's a primary factor in determining ball direction and curve.

A square path (0°) produces straight shots when combined with a square face angle. In-to-out paths tend to produce draws, while out-to-in paths produce fades or slices, depending on face angle.

## Face Angle
- **Optimal**: -1 to +1 degrees (square to target)
- **Closed**: Negative values (promotes draw/hook)
- **Open**: Positive values (promotes fade/slice)
- **Impact on Ball Flight**: Primary factor in initial direction

Face angle at impact is the most important factor determining initial ball direction. It's measured relative to the target line, with square being 0 degrees.

The relationship between face angle and club path determines ball curve. When face angle and path are aligned, the ball flies straight in that direction. When they differ, the ball curves.

## Carry Distance Ranges

### Driver
- **Amateur**: 200-260 yards
- **Low Handicap**: 240-280 yards
- **Tour Pro**: 270-320 yards

### 7 Iron
- **Amateur**: 120-150 yards
- **Low Handicap**: 140-170 yards
- **Tour Pro**: 160-180 yards

Distance varies significantly based on skill level, physical attributes, equipment, and conditions. These ranges provide general guidelines for different skill levels.

Focus on consistency and accuracy rather than maximum distance. A consistent 200-yard drive in the fairway is more valuable than an inconsistent 250-yard drive that might miss the fairway.

## Dynamic Loft
- **Driver**: 9-13 degrees (2-4° less than static loft)
- **7 Iron**: 28-34 degrees
- **Impact**: Affects launch angle and spin rate

Dynamic loft is the actual loft presented to the ball at impact, which differs from the club's static loft due to shaft lean and impact conditions.

Understanding dynamic loft helps optimize launch conditions and explains why two players with the same club might achieve different ball flights.

## Face to Path
- **Optimal**: -2 to +2 degrees
- **Determines Ball Curve**: Primary factor in side spin
- **Positive**: Face open to path (fade/slice)
- **Negative**: Face closed to path (draw/hook)

Face to path is the difference between face angle and club path. It's the primary determinant of ball curve and side spin.

Managing face to path relationship allows golfers to control ball shape intentionally and fix unwanted curves like slices or hooks.`;

    // Swing faults content - swingfaults.md
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
- Higher trajectory than desired
- Reduced roll after landing

**Common Causes:**
- Weak grip (hands rotated left on club)
- Open clubface at address
- Over-the-top swing plane (steep, out-to-in)
- Weight shift issues (staying on back foot)
- Poor setup alignment (aimed too far left)
- Tension in arms and shoulders
- Early release of lag angle

The slice is the most common ball flight issue for amateur golfers. It results from an open clubface relative to the swing path at impact. While many focus on swing path, the clubface position is actually the primary factor in initial ball direction.

## Hook Pattern
**Trigger Conditions:**
- Face angle: -3° to -10° (closed)
- Club path: +2° to +10° (in-to-out)
- Face to path: -5° to -15°

**Characteristics:**
- Ball curves right to left excessively
- Often starts right of target
- Can result in loss of control
- Lower trajectory
- Significant roll after landing

**Common Causes:**
- Strong grip (hands rotated right on club)
- Closed clubface at address
- Too much in-to-out swing path
- Early release of hands through impact
- Poor body rotation (arms overtaking body)
- Ball position too far back in stance
- Overactive right hand (for right-handed golfers)

Hooks often develop when golfers overcorrect slice tendencies. While a controlled draw is desirable, excessive hooking indicates timing and release issues that need correction.

## Fat Shots
**Trigger Conditions:**
- Attack angle: Too steep for irons (< -7°)
- Impact location: Behind ball (divot starts behind ball)
- Low point: Too far behind ball position

**Characteristics:**
- Heavy contact with ground before ball
- Reduced distance and accuracy
- Divot starts behind ball
- Slower ball speed than expected
- Often results in low, weak ball flight

**Common Causes:**
- Weight remaining on back foot at impact
- Reverse pivot (weight moves to front foot in backswing)
- Early extension (standing up through impact)
- Poor weight transfer through downswing
- Casting or early release
- Ball position too far forward
- Trying to help ball up

Fat shots indicate poor impact dynamics and weight transfer. The club reaches its low point behind the ball instead of at or slightly ahead of ball position.

## Thin Shots
**Trigger Conditions:**
- Attack angle: Too shallow or positive for irons
- Impact location: Blade contact (leading edge hits ball)
- Dynamic loft: Reduced significantly from static loft

**Characteristics:**
- Ball flies low with little trajectory
- Reduced carry distance
- Contact on leading edge of club
- Often travels farther than expected initially
- Poor stopping power on greens

**Common Causes:**
- Weight transfer issues
- Standing up through impact (loss of posture)
- Ball position too far forward in stance
- Loss of spine angle during downswing
- Trying to help ball up
- Poor setup posture
- Tension causing restricted rotation

Thin shots often alternate with fat shots as golfers compensate. Both indicate inconsistent low point control and impact dynamics.

## Topped Shots
**Trigger Conditions:**
- Attack angle: Extremely shallow or positive
- Impact height: Above ball's equator
- Severe loss of posture through impact

**Characteristics:**
- Ball rolls along ground with no carry
- No carry distance
- Contact above ball's center
- Frustrating lack of ball flight
- Often preceded by practice swings that look good

**Common Causes:**
- Lifting up during downswing (loss of spine angle)
- Poor posture maintenance throughout swing
- Ball position too far forward
- Trying to help ball up into air
- Fear of hitting ground (fat shots)
- Standing too far from ball at address
- Tension causing restricted movement

Topped shots are often mental as much as physical, resulting from trying to help the ball up rather than trusting the club's loft.

## Pulled Shots
**Trigger Conditions:**
- Club path: -5° to -15° (out-to-in)
- Face angle: Aligned with path (square to path)
- Face to path: 0° to -2°

**Characteristics:**
- Ball flies straight left of target
- Good contact but poor direction
- Consistent leftward flight
- Normal trajectory and distance
- No curve during flight

**Common Causes:**
- Alignment issues (aimed left of target)
- Over-the-top swing plane
- Poor setup position relative to target
- Body positioning at address
- Shoulder alignment left of target
- Ball position too far forward
- Overactive upper body in downswing

Pulled shots indicate good contact but poor alignment or swing direction. The club path and face are aligned but pointed left of the target.

## Pushed Shots
**Trigger Conditions:**
- Club path: +5° to +15° (in-to-out)
- Face angle: Aligned with path (square to path)
- Face to path: 0° to +2°

**Characteristics:**
- Ball flies straight right of target
- Good contact but poor direction
- Consistent rightward flight
- Normal trajectory and distance
- No curve during flight

**Common Causes:**
- Alignment issues (aimed right of target)
- Too much in-to-out swing path
- Poor hip rotation through impact
- Weight shift problems
- Shoulder alignment right of target
- Ball position too far back
- Restricted body rotation

Pushed shots often result from overcorrecting pulled shots or poor alignment. The swing is working correctly but in the wrong direction.

## Weak Ball Striking
**Trigger Conditions:**
- Smash factor: < 1.30
- Ball speed: Low relative to club speed
- Impact location: Off-center consistently

**Characteristics:**
- Reduced distance for given club speed
- Poor feel at impact
- Inconsistent ball flight
- Variable distance with same club
- Lack of solid contact sensation

**Common Causes:**
- Poor impact location on clubface
- Inconsistent contact patterns
- Equipment issues (wrong club specifications)
- Setup problems affecting impact
- Timing issues in swing sequence
- Lack of proper rotation
- Poor grip pressure or grip position

Weak ball striking indicates efficiency problems in energy transfer from club to ball, often solvable through better fundamentals.

## Steep Swing (Driver)
**Trigger Conditions:**
- Attack angle: Negative with driver (< -2°)
- Spin rate: Excessively high (> 3,500 rpm)
- Launch angle: Too low (< 8°)

**Characteristics:**
- High spin, low launch ball flight
- Reduced carry distance
- Ballooning ball flight in wind
- Divots with driver
- Pop-up tendency

**Common Causes:**
- Poor tee height (too low)
- Ball position too far back in stance
- Weight transfer issues
- Swing plane problems (too steep)
- Iron swing applied to driver
- Fear of hitting up on ball
- Setup problems

Steep driver swings reduce distance significantly by creating unfavorable launch conditions. The driver is designed to be hit with an ascending blow.

## Shallow Swing (Irons)
**Trigger Conditions:**
- Attack angle: Too shallow for irons (> -1°)
- Impact location: Inconsistent
- Divot pattern: No divot or very thin divot

**Characteristics:**
- Inconsistent contact
- Poor distance control
- Difficulty with lies that aren't perfect
- Lack of spin for stopping power
- Variable trajectory

**Common Causes:**
- Trying to help ball up
- Poor weight transfer to front foot
- Swing plane issues (too flat)
- Setup problems
- Fear of taking divots
- Misunderstanding of iron impact
- Lack of proper body rotation

Shallow iron swings prevent proper ball-first contact and reduce consistency, especially from less-than-perfect lies.`;

    // Video library content - videolibrary.md
    const videoLibrary = `# Golf Instruction Video Library

## SLICE CORRECTION VIDEOS

### Primary Videos:
- **Slice Fix Fundamentals**: https://scratchgc.wistia.com/medias/slice-fix-fundamentals - Complete slice correction system covering grip, setup, and swing changes to eliminate the slice pattern
- **Clubface Control for Slicers**: https://scratchgc.wistia.com/medias/clubface-control-slice - Focus on face angle management and impact positions for better ball flight

### Supporting Videos:
- **Grip Correction for Slice**: https://scratchgc.wistia.com/medias/grip-correction-slice - Detailed grip adjustments to reduce slice spin and improve face control
- **Setup Changes for Better Path**: https://scratchgc.wistia.com/medias/setup-path-changes - Alignment and posture modifications to improve swing path

The slice correction series addresses the most common ball flight issue in golf. These videos provide systematic approaches to fixing open clubface and out-to-in swing path problems.

## HOOK CORRECTION VIDEOS

### Primary Videos:
- **Taming the Hook**: https://scratchgc.wistia.com/medias/taming-the-hook - Comprehensive hook elimination strategies focusing on grip and release
- **Path Control for Hooks**: https://scratchgc.wistia.com/medias/path-control-hooks - Swing path modifications to reduce excessive in-to-out movement

### Supporting Videos:
- **Grip Adjustments for Hooks**: https://scratchgc.wistia.com/medias/grip-adjust-hooks - Hand position changes to control face angle and prevent hooks
- **Release Pattern Corrections**: https://scratchgc.wistia.com/medias/release-pattern-fix - Proper hand and wrist action through impact zone

Hook correction focuses on controlling excessive right-to-left ball flight through grip, setup, and release modifications.

## BALL STRIKING IMPROVEMENT

### Primary Videos:
- **Solid Contact Fundamentals**: https://scratchgc.wistia.com/medias/solid-contact-fundamentals - Essential elements for consistent ball-first contact
- **Impact Position Mastery**: https://scratchgc.wistia.com/medias/impact-position-mastery - Achieving optimal impact conditions for pure strikes

### Supporting Videos:
- **Weight Transfer Basics**: https://scratchgc.wistia.com/medias/weight-transfer-basics - Proper weight shift for better contact and power
- **Posture and Balance**: https://scratchgc.wistia.com/medias/posture-balance - Setup fundamentals for solid strikes and consistency

Ball striking improvement focuses on the fundamentals of consistent contact, which is the foundation of good golf.

## DISTANCE IMPROVEMENT

### Primary Videos:
- **Power Generation Secrets**: https://scratchgc.wistia.com/medias/power-generation - Maximizing clubhead speed and ball speed through proper sequence
- **Smash Factor Optimization**: https://scratchgc.wistia.com/medias/smash-factor-optimization - Improving efficiency of energy transfer from club to ball

### Supporting Videos:
- **Sequence and Timing**: https://scratchgc.wistia.com/medias/sequence-timing - Proper kinematic sequence for maximum power generation
- **Equipment Optimization**: https://scratchgc.wistia.com/medias/equipment-optimization - Getting the most distance from your current clubs

Distance improvement combines technique refinement with understanding of launch conditions and equipment optimization.

## CONSISTENCY TRAINING

### Primary Videos:
- **Tempo and Rhythm**: https://scratchgc.wistia.com/medias/tempo-rhythm - Developing consistent swing timing for repeatable results
- **Pre-Shot Routine**: https://scratchgc.wistia.com/medias/pre-shot-routine - Building consistency through systematic preparation

### Supporting Videos:
- **Swing Plane Basics**: https://scratchgc.wistia.com/medias/swing-plane-basics - Maintaining consistent swing plane for repeatable contact
- **Practice Strategies**: https://scratchgc.wistia.com/medias/practice-strategies - Effective practice methods for lasting improvement

Consistency training focuses on developing repeatable fundamentals that work under pressure and various conditions.

## CLUB-SPECIFIC INSTRUCTION

### Driver Videos:
- **Driver Setup and Technique**: https://scratchgc.wistia.com/medias/driver-setup-technique - Optimizing driver performance through proper setup and swing modifications
- **Tee Height and Ball Position**: https://scratchgc.wistia.com/medias/tee-height-position - Critical setup elements for driver success and distance

### Iron Videos:
- **Iron Fundamentals**: https://scratchgc.wistia.com/medias/iron-fundamentals - Solid iron play techniques for consistent ball striking
- **Ball-First Contact**: https://scratchgc.wistia.com/medias/ball-first-contact - Achieving crisp iron strikes with proper attack angle

### Wedge Videos:
- **Short Game Basics**: https://scratchgc.wistia.com/medias/short-game-basics - Wedge technique and strategy for scoring
- **Spin Control**: https://scratchgc.wistia.com/medias/spin-control - Managing backspin and trajectory with wedges

Club-specific instruction addresses the unique requirements and techniques for different clubs in the bag.

## PRACTICE DRILLS

### Primary Videos:
- **Essential Practice Drills**: https://scratchgc.wistia.com/medias/essential-practice-drills - Top drills for improvement in key areas
- **Range Practice Guide**: https://scratchgc.wistia.com/medias/range-practice-guide - Effective range sessions and practice planning

### Supporting Videos:
- **Home Practice Drills**: https://scratchgc.wistia.com/medias/home-practice-drills - Drills you can do anywhere without a golf course
- **Mirror Work**: https://scratchgc.wistia.com/medias/mirror-work - Using visual feedback for swing improvement

Practice drills provide structured ways to work on specific aspects of the swing and build muscle memory.

## FUNDAMENTALS SERIES

### Primary Videos:
- **Golf Fundamentals Part 1**: https://scratchgc.wistia.com/medias/fundamentals-part-1 - Grip, stance, and posture basics
- **Golf Fundamentals Part 2**: https://scratchgc.wistia.com/medias/fundamentals-part-2 - Swing mechanics and basic movement patterns

### Supporting Videos:
- **Equipment Basics**: https://scratchgc.wistia.com/medias/equipment-basics - Understanding your clubs and how they work
- **Course Management**: https://scratchgc.wistia.com/medias/course-management - Strategic thinking and decision making

The fundamentals series covers the essential building blocks that every golfer needs to understand and master.

## ADVANCED TECHNIQUES

### Primary Videos:
- **Advanced Ball Flight Laws**: https://scratchgc.wistia.com/medias/ball-flight-laws - Understanding ball flight physics for better control
- **Shot Shaping**: https://scratchgc.wistia.com/medias/shot-shaping - Intentional draws and fades for course management

### Supporting Videos:
- **Troubleshooting**: https://scratchgc.wistia.com/medias/troubleshooting - Fixing common issues and quick adjustments
- **Mental Game**: https://scratchgc.wistia.com/medias/mental-game - Psychology of golf and performance under pressure

Advanced techniques build upon solid fundamentals to provide greater control and shot-making ability.`;

    // Clear existing embeddings
    console.log('Clearing existing embeddings...');
    const { error: deleteError } = await supabase
      .from('embedding_documents')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000');
    
    if (deleteError) {
      console.error('Error clearing embeddings:', deleteError);
    }

    // Process each knowledge base with intelligent chunking
    const knowledgeBases = [
      { content: knowledgeBase, namespace: 'knowledgebase' },
      { content: swingFaults, namespace: 'swingfaults' },
      { content: videoLibrary, namespace: 'videos' }
    ];

    let totalProcessed = 0;
    let totalChunks = 0;

    for (const kb of knowledgeBases) {
      console.log(`\n=== Processing ${kb.namespace} ===`);
      const chunks = chunkContentIntelligently(kb.content, kb.namespace);
      totalChunks += chunks.length;
      
      console.log(`Created ${chunks.length} intelligent chunks for ${kb.namespace}`);
      console.log(`Token range: ${Math.min(...chunks.map(c => c.metadata.tokens))} - ${Math.max(...chunks.map(c => c.metadata.tokens))} tokens`);
      
      for (const chunk of chunks) {
        try {
          console.log(`Processing chunk ${chunk.metadata.chunk_index + 1}/${chunks.length}: "${chunk.metadata.heading}" (${chunk.metadata.tokens} tokens)`);
          
          const embedding = await generateEmbedding(chunk.content);
          
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
            totalProcessed++;
            console.log(`✓ Successfully processed: ${chunk.metadata.heading}`);
          }
        } catch (error) {
          console.error(`✗ Error processing chunk ${chunk.metadata.heading}:`, error);
        }
      }
    }

    const stats = {
      totalFiles: knowledgeBases.length,
      totalChunks,
      successfullyProcessed: totalProcessed,
      failedChunks: totalChunks - totalProcessed
    };

    console.log('\n=== Processing Complete ===');
    console.log(`Files processed: ${stats.totalFiles}`);
    console.log(`Total chunks created: ${stats.totalChunks}`);
    console.log(`Successfully embedded: ${stats.successfullyProcessed}`);
    console.log(`Failed: ${stats.failedChunks}`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `Intelligent preprocessing complete!`,
        stats
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error) {
    console.error('Error in preprocess-knowledge function:', error);
    return new Response(
      JSON.stringify({ 
        success: false,
        error: error.message,
        message: 'Failed to preprocess knowledge base'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});