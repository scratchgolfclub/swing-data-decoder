import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const openaiApiKey = Deno.env.get('OPENAI_API_KEY');
const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

const supabase = createClient(supabaseUrl, supabaseKey);

// Estimate tokens (rough approximation: ~4 characters per token)
function estimateTokens(text: string): number {
  return Math.ceil(text.length / 4);
}

// Generate embedding using OpenAI
async function generateEmbedding(text: string): Promise<number[]> {
  const response = await fetch('https://api.openai.com/v1/embeddings', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${openaiApiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'text-embedding-3-small',
      input: text,
    }),
  });

  if (!response.ok) {
    throw new Error(`OpenAI API error: ${response.statusText}`);
  }

  const data = await response.json();
  return data.data[0].embedding;
}

// Parse knowledge base metrics
function parseKnowledgeBase(content: string) {
  const entries: any[] = [];
  const sections = content.split('##').filter(Boolean);
  
  for (const section of sections) {
    const lines = section.trim().split('\n').filter(Boolean);
    if (lines.length === 0) continue;
    
    const title = lines[0].replace(/^#+\s*/, '').trim();
    if (!title || title.toLowerCase().includes('knowledge base')) continue;
    
    let unit = '';
    let description = '';
    let goodRanges = '';
    let drillsLow = '';
    let drillsHigh = '';
    let feelsLow = '';
    let feelsHigh = '';
    
    let currentSection = '';
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      
      if (line.startsWith('**Unit:**')) {
        unit = line.replace('**Unit:**', '').trim();
      } else if (line.startsWith('**Description:**')) {
        description = line.replace('**Description:**', '').trim();
        currentSection = 'description';
      } else if (line.startsWith('**Good Ranges:**')) {
        currentSection = 'ranges';
      } else if (line.startsWith('**Drills if Too Low:**')) {
        currentSection = 'drillsLow';
      } else if (line.startsWith('**Drills if Too High:**')) {
        currentSection = 'drillsHigh';
      } else if (line.startsWith('**Feels if Too Low:**')) {
        currentSection = 'feelsLow';
      } else if (line.startsWith('**Feels if Too High:**')) {
        currentSection = 'feelsHigh';
      } else if (line.startsWith('**') || line.startsWith('##')) {
        currentSection = '';
      } else if (line && currentSection) {
        switch (currentSection) {
          case 'description':
            description += ' ' + line;
            break;
          case 'ranges':
            goodRanges += ' ' + line;
            break;
          case 'drillsLow':
            drillsLow += ' ' + line;
            break;
          case 'drillsHigh':
            drillsHigh += ' ' + line;
            break;
          case 'feelsLow':
            feelsLow += ' ' + line;
            break;
          case 'feelsHigh':
            feelsHigh += ' ' + line;
            break;
        }
      }
    }
    
    // Create flattened content
    const contentParts = [
      `Metric: ${title}`,
      unit ? `Unit: ${unit}` : '',
      description ? `Description: ${description}` : '',
      goodRanges ? `Good Ranges: ${goodRanges}` : '',
      drillsLow ? `Drills if Too Low: ${drillsLow}` : '',
      drillsHigh ? `Drills if Too High: ${drillsHigh}` : '',
      feelsLow ? `Feels if Too Low: ${feelsLow}` : '',
      feelsHigh ? `Feels if Too High: ${feelsHigh}` : ''
    ].filter(Boolean);
    
    entries.push({
      title,
      type: 'metric',
      content: contentParts.join('\n'),
      trigger_metrics: [title],
      metadata: {
        unit,
        good_ranges: goodRanges.trim(),
        drills_low: drillsLow.trim(),
        drills_high: drillsHigh.trim(),
        feels_low: feelsLow.trim(),
        feels_high: feelsHigh.trim()
      }
    });
  }
  
  return entries;
}

// Parse swing faults
function parseSwingFaults(content: string) {
  const entries: any[] = [];
  const sections = content.split('##').filter(Boolean);
  
  for (const section of sections) {
    const lines = section.trim().split('\n').filter(Boolean);
    if (lines.length === 0) continue;
    
    const title = lines[0].replace(/^#+\s*/, '').trim();
    if (!title || title.toLowerCase().includes('swing faults')) continue;
    
    let description = '';
    let triggerMetrics: string[] = [];
    let drills = '';
    let feels = '';
    
    let currentSection = '';
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      
      if (line.startsWith('**Description:**')) {
        description = line.replace('**Description:**', '').trim();
        currentSection = 'description';
      } else if (line.startsWith('**Trigger Conditions:**')) {
        currentSection = 'triggers';
      } else if (line.startsWith('**Drills:**')) {
        currentSection = 'drills';
      } else if (line.startsWith('**Feels:**')) {
        currentSection = 'feels';
      } else if (line.startsWith('**') || line.startsWith('##')) {
        currentSection = '';
      } else if (line && currentSection) {
        switch (currentSection) {
          case 'description':
            description += ' ' + line;
            break;
          case 'triggers':
            // Extract metric names from trigger conditions
            const metricMatch = line.match(/"([^"]+)"|(\w+\s+\w+):/g);
            if (metricMatch) {
              metricMatch.forEach(match => {
                let metric = match.replace(/"/g, '').replace(/:$/, '');
                if (metric.includes('angle')) metric = metric.replace(' angle', ' Angle');
                if (metric.includes('path')) metric = metric.replace(' path', ' Path');
                if (metric.includes('face')) metric = metric.replace(' face', ' Face');
                if (!triggerMetrics.includes(metric)) {
                  triggerMetrics.push(metric);
                }
              });
            }
            break;
          case 'drills':
            drills += ' ' + line;
            break;
          case 'feels':
            feels += ' ' + line;
            break;
        }
      }
    }
    
    // Create flattened content
    const contentParts = [
      `Fault: ${title}`,
      description ? `Description: ${description}` : '',
      triggerMetrics.length ? `Trigger Metrics: ${triggerMetrics.join(', ')}` : '',
      drills ? `Drills: ${drills}` : '',
      feels ? `Feels: ${feels}` : ''
    ].filter(Boolean);
    
    entries.push({
      title,
      type: 'fault',
      content: contentParts.join('\n'),
      trigger_metrics: triggerMetrics,
      metadata: {
        description: description.trim(),
        drills: drills.trim(),
        feels: feels.trim()
      }
    });
  }
  
  return entries;
}

// Parse video library
function parseVideoLibrary(content: string) {
  const entries: any[] = [];
  const sections = content.split('###').filter(Boolean);
  
  for (const section of sections) {
    const lines = section.trim().split('\n').filter(Boolean);
    if (lines.length === 0) continue;
    
    const firstLine = lines[0].trim();
    if (!firstLine.includes(':') || firstLine.includes('Videos:')) continue;
    
    const title = firstLine.replace(/^\*\*/, '').replace(/\*\*:.*$/, '').trim();
    if (!title) continue;
    
    let url = '';
    let triggerMetrics: string[] = [];
    let recommendationReason = '';
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      
      if (line.includes('https://')) {
        const urlMatch = line.match(/https:\/\/[^\s]+/);
        if (urlMatch) {
          url = urlMatch[0];
          const descMatch = line.split(' - ');
          if (descMatch.length > 1) {
            recommendationReason = descMatch[1];
          }
        }
      }
    }
    
    // Infer trigger metrics from title and content
    if (title.toLowerCase().includes('slice')) {
      triggerMetrics = ['Face Angle', 'Club Path'];
    } else if (title.toLowerCase().includes('hook')) {
      triggerMetrics = ['Face Angle', 'Club Path'];
    } else if (title.toLowerCase().includes('contact') || title.toLowerCase().includes('impact')) {
      triggerMetrics = ['Smash Factor', 'Attack Angle'];
    } else if (title.toLowerCase().includes('power') || title.toLowerCase().includes('distance')) {
      triggerMetrics = ['Club Speed', 'Ball Speed'];
    } else if (title.toLowerCase().includes('driver')) {
      triggerMetrics = ['Launch Angle', 'Spin Rate'];
    } else if (title.toLowerCase().includes('iron')) {
      triggerMetrics = ['Attack Angle', 'Dynamic Loft'];
    }
    
    if (!url) continue;
    
    // Create flattened content
    const contentParts = [
      `Video: ${title}`,
      url ? `URL: ${url}` : '',
      triggerMetrics.length ? `Trigger Metrics: ${triggerMetrics.join(', ')}` : '',
      recommendationReason ? `Recommendation: ${recommendationReason}` : ''
    ].filter(Boolean);
    
    entries.push({
      title,
      type: 'video',
      content: contentParts.join('\n'),
      trigger_metrics: triggerMetrics,
      metadata: {
        url,
        recommendation_reason: recommendationReason
      }
    });
  }
  
  return entries;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Starting intelligent knowledge preprocessing...');
    
    // Clear existing embeddings
    console.log('Clearing existing embeddings...');
    const { error: clearError } = await supabase
      .from('embedding_documents')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000');
    
    if (clearError) {
      console.error('Error clearing embeddings:', clearError);
      throw clearError;
    }

    // Embedded markdown content (since we can't access files from other directories in edge functions)
    const markdownContent = {
      'knowledgeBase.md': `### Club Speed
- **Unit:** mph
- **Description:** The linear speed of the club head's geometric center just prior to first touch with the golf ball.
- **Good Ranges:** \`{ wedge: [40,60], iron: [65,90], wood: [85,115], driver: [90,126], all: [65,115] }\`
- **Drills if Too Low:** \`[
        "Speed Stick Protocol: Swing weighted training sticks quickly to build neuromuscular speed. Perform 3 sets of 10 swings.",
        "Medicine Ball Throws: Stand side-on to a wall, throwing a medicine ball explosively in a rotational motion to enhance core strength.",
        "Step-Change Drill: Begin backswing normally; step forward with your lead foot at the start of your downswing to encourage powerful weight transfer."
      ]\`
- **Drills if Too High:** \`[
        "Metronome Tempo Drill: Practice swings matching a metronome's rhythm, creating consistent timing and smoother transition.",
        "Pause-at-Top Drill: Pause briefly at the top of your backswing for 2 seconds before initiating downswing to promote controlled tempo.",
        "Feet Together Drill: Practice swings with your feet close together, promoting balance and reducing excessive swing speed."
      ]\`
- **Feels if Too Low:** \`[
        "Imagine cracking a whip at impact, emphasizing a rapid snap through the ball.",
        "Visualize quickly releasing your hands and wrists through the hitting zone, as if skipping a stone.",
        "Feel an explosive hip rotation, like you're quickly turning to face the target at impact."
      ]\`
- **Feels if Too High:** \`[
        "Swing as if you're moving underwater, slow and controlled to ensure smoother transitions.",
        "Feel a gentle transition from backswing to downswing, as if turning a heavy steering wheel slowly.",
        "Imagine your body and arms moving as one synchronized unit, avoiding quick, jerky movements."
      ]\`

---

### Attack Angle
- **Unit:** deg
- **Description:** The up or down movement of the club head at the time of maximum compression.
- **Good Ranges:** \`{ wedge: [-8,-4], iron: [-5,-2], wood: [-1,3], driver: [-1,5], all: [-5,3] }\`
- **Drills if Too Low:** \`[
        "Towel Behind Ball Drill: Place a towel or board behind the ball and practice hitting down to encourage a descending strike.",
        "Forward Shaft Lean Drill: Practice maintaining a slight forward shaft lean through impact to naturally steepen your attack angle.",
        "Impact Bag Drill: Focus on hitting an impact bag placed ahead of your ball to reinforce a proper downward strike."
      ]\`
- **Drills if Too High:** \`[
        "Low Tee Drill: Tee the ball lower and practice sweeping the ball smoothly off the tee rather than hitting sharply upwards.",
        "Level Swing Plane Drill: Swing above alignment sticks placed horizontally at waist height to create a shallower swing path.",
        "Balance Board Drill: Swing while standing on a balance board to promote a stable and level swing path."
      ]\`
- **Feels if Too Low:** \`[
        "Feel as though you're driving a stake into the ground through the ball, emphasizing a downward strike.",
        "Imagine compressing the ball against the ground at impact, creating a divot after the ball.",
        "Visualize brushing the grass aggressively just past the ball position."
      ]\`
- **Feels if Too High:** \`[
        "Feel like you're gently sweeping or skimming the club along the grass through impact.",
        "Imagine the clubhead gliding smoothly and evenly across the turf, avoiding digging.",
        "Think of softly brushing the grass rather than striking down or lifting upwards excessively."
      ]\`

---

### Dynamic Loft
- **Unit:** deg
- **Description:** The vertical angle of the club face at the center-point of contact between the club and ball at the time of maximum compression.
- **Good Ranges:** \`{ wedge: [40, 50], iron: [18, 28], wood: [13, 18], driver: [12, 16], all: [15, 30] }\`
- **Drills if Too Low:** \`[
          "Impact Bag Drill: Position an impact bag slightly ahead of the ball and strike it, maintaining a slight upward feeling in your wrists to increase dynamic loft at impact.",
          "Shaft Angle Drill: Practice swings with a neutral or slightly backward shaft angle at impact to naturally deliver more loft.",
          "Half Swing Loft Drill: Use a controlled half-swing, focusing on allowing the clubface to naturally release and add loft through impact."
        ]\`
- **Drills if Too High:** \`[
          "Forward Shaft Lean Drill: Exaggerate forward shaft lean at impact, reducing delivered loft and improving compression.",
          "Hands Forward Impact Drill: Practice positioning your hands ahead of the ball at impact to de-loft the clubface slightly.",
          "Punch Shot Drill: Hit low punch shots focusing on maintaining a lower, forward-angled clubface through impact."
        ]\`
- **Feels if Too Low:** \`[
          "Feel as if you're gently flipping or releasing the clubface upward through impact.",
          "Imagine the clubface softly sliding under the ball, promoting higher loft at contact.",
          "Visualize your wrists naturally relaxing at impact to help the clubface gently lift the ball higher."
        ]\`
- **Feels if Too High:** \`[
          "Feel your hands leading the clubhead through impact, creating a downward, forward-leaning shaft angle.",
          "Imagine striking the ball with a firm, downward motion to compress it against the turf.",
          "Visualize squeezing the ball lower with the clubface angled slightly downward at impact."
        ]\`

---

### Club Path
- **Unit:** deg
- **Description:** The in-to-out or out-to-in movement of the club head's geometric center at the time of maximum compression.
- **Good Ranges:** \`{ all: [-3, 3] }\`
- **Drills if Too Low:** \`[
          "Inside-Out Gate Drill: Set alignment sticks slightly outside the ball-target line, and practice swinging the clubhead through the gate, promoting a gentle inside-out swing path.",
          "Right Foot Back Drill: Slightly pull your trail foot back at address to naturally encourage an inside-to-out club path.",
          "Baseball Swing Drill: Perform horizontal baseball-like swings to feel the club moving naturally from inside to outside."
        ]\`
- **Drills if Too High:** \`[
          "Alignment Stick Drill: Position alignment sticks on the inside path of the club to encourage a neutral or slightly out-to-in swing.",
          "Left Foot Forward Drill: Move your lead foot slightly forward at address, promoting an out-to-in swing path.",
          "Over-the-Top Prevention Drill: Practice slow-motion swings, focusing on dropping your hands straight down from the top to avoid excessive path movement."
        ]\`
- **Feels if Too Low:** \`[
          "Feel the clubhead gently approaching the ball from your body's inside, moving outward through impact.",
          "Imagine swinging towards the second baseman (right-handed golfer), encouraging an inside-out swing.",
          "Think of keeping your trail elbow tucked close to your body through the downswing."
        ]\`
- **Feels if Too High:** \`[
          "Feel as if your clubhead is moving slightly across the ball from outside to inside.",
          "Imagine swinging towards the shortstop (right-handed golfer), guiding your club on an out-to-in path.",
          "Think about your lead shoulder opening earlier, guiding your club path slightly left of target through impact."
        ]\`
- **Description:** The up or down movement of the club head at the time of maximum compression.
- **Good Ranges:** \`{ wedge: [-8,-4], iron: [-5,-2], wood: [-1,3], driver: [-1,5], all: [-5,3] }\`
- **Drills if Too Low:** \`[
        "Towel Behind Ball Drill: Place a towel or board behind the ball and practice hitting down to encourage a descending strike.",
        "Forward Shaft Lean Drill: Practice maintaining a slight forward shaft lean through impact to naturally steepen your attack angle.",
        "Impact Bag Drill: Focus on hitting an impact bag placed ahead of your ball to reinforce a proper downward strike."
      ]\`
- **Drills if Too High:** \`[
        "Low Tee Drill: Tee the ball lower and practice sweeping the ball smoothly off the tee rather than hitting sharply upwards.",
        "Level Swing Plane Drill: Swing above alignment sticks placed horizontally at waist height to create a shallower swing path.",
        "Balance Board Drill: Swing while standing on a balance board to promote a stable and level swing path."
      ]\`
- **Feels if Too Low:** \`[
        "Feel as though you're driving a stake into the ground through the ball, emphasizing a downward strike.",
        "Imagine compressing the ball against the ground at impact, creating a divot after the ball.",
        "Visualize brushing the grass aggressively just past the ball position."
      ]\`
- **Feels if Too High:** \`[
        "Feel like you're gently sweeping or skimming the club along the grass through impact.",
        "Imagine the clubhead gliding smoothly and evenly across the turf, avoiding digging.",
        "Think of softly brushing the grass rather than striking down or lifting upwards excessively."
      ]\`

---

### Dynamic Loft
- **Unit:** deg
- **Description:** The vertical angle of the club face at the center-point of contact between the club and ball at the time of maximum compression.
- **Good Ranges:** \`{ wedge: [40, 50], iron: [18, 28], wood: [13, 18], driver: [12, 16], all: [15, 30] }\`
- **Drills if Too Low:** \`[
          "Impact Bag Drill: Position an impact bag slightly ahead of the ball and strike it, maintaining a slight upward feeling in your wrists to increase dynamic loft at impact.",
          "Shaft Angle Drill: Practice swings with a neutral or slightly backward shaft angle at impact to naturally deliver more loft.",
          "Half Swing Loft Drill: Use a controlled half-swing, focusing on allowing the clubface to naturally release and add loft through impact."
        ]\`
- **Drills if Too High:** \`[
          "Forward Shaft Lean Drill: Exaggerate forward shaft lean at impact, reducing delivered loft and improving compression.",
          "Hands Forward Impact Drill: Practice positioning your hands ahead of the ball at impact to de-loft the clubface slightly.",
          "Punch Shot Drill: Hit low punch shots focusing on maintaining a lower, forward-angled clubface through impact."
        ]\`
- **Feels if Too Low:** \`[
          "Feel as if you're gently flipping or releasing the clubface upward through impact.",
          "Imagine the clubface softly sliding under the ball, promoting higher loft at contact.",
          "Visualize your wrists naturally relaxing at impact to help the clubface gently lift the ball higher."
        ]\`
- **Feels if Too High:** \`[
          "Feel your hands leading the clubhead through impact, creating a downward, forward-leaning shaft angle.",
          "Imagine striking the ball with a firm, downward motion to compress it against the turf.",
          "Visualize squeezing the ball lower with the clubface angled slightly downward at impact."
        ]\`

---

### Club Path
- **Unit:** deg
- **Description:** The in-to-out or out-to-in movement of the club head's geometric center at the time of maximum compression.
- **Good Ranges:** \`{ all: [-3, 3] }\`
- **Drills if Too Low:** \`[
          "Inside-Out Gate Drill: Set alignment sticks slightly outside the ball-target line, and practice swinging the clubhead through the gate, promoting a gentle inside-out swing path.",
          "Right Foot Back Drill: Slightly pull your trail foot back at address to naturally encourage an inside-to-out club path.",
          "Baseball Swing Drill: Perform horizontal baseball-like swings to feel the club moving naturally from inside to outside."
        ]\`
- **Drills if Too High:** \`[
          "Alignment Stick Drill: Position alignment sticks on the inside path of the club to encourage a neutral or slightly out-to-in swing.",
          "Left Foot Forward Drill: Move your lead foot slightly forward at address, promoting an out-to-in swing path.",
          "Over-the-Top Prevention Drill: Practice slow-motion swings, focusing on dropping your hands straight down from the top to avoid excessive path movement."
        ]\`
- **Feels if Too Low:** \`[
          "Feel the clubhead gently approaching the ball from your body's inside, moving outward through impact.",
          "Imagine swinging towards the second baseman (right-handed golfer), encouraging an inside-out swing.",
          "Think of keeping your trail elbow tucked close to your body through the downswing."
        ]\`
- **Feels if Too High:** \`[
          "Feel as if your clubhead is moving slightly across the ball from outside to inside.",
          "Imagine swinging towards the shortstop (right-handed golfer), guiding your club on an out-to-in path.",
          "Think about your lead shoulder opening earlier, guiding your club path slightly left of target through impact."
        ]\`

---

### Face Angle
- **Unit:** deg
- **Description:** The direction the club face is pointing at the center-point of contact between the club and ball at the time of maximum compression.
- **Good Ranges:** \`{ all: [-2, 2] }\`
- **Drills if Too Low:** \`[
          "Closed Face Drill: Set the clubface slightly closed at address and practice returning it square through impact.",
          "Alignment Mirror Drill: Use a mirror to ensure your clubface remains slightly closed at impact during practice swings.",
          "Slow Motion Impact Drill: Perform slow swings focusing on maintaining a consistently closed face angle into impact."
        ]\`
- **Drills if Too High:** \`[
          "Open Face Alignment Drill: Set up with the face slightly open at address and practice returning it square at impact.",
          "Right Hand Control Drill: Focus on your trailing hand gently rotating to square the clubface through impact.",
          "Impact Bag Face Drill: Strike an impact bag, concentrating on maintaining an open-to-square face angle consistently."
        ]\`
- **Feels if Too Low:** \`[
          "Feel like the toe of the club is subtly turning downward through impact.",
          "Imagine your lead wrist gently bowing to keep the face slightly closed at impact.",
          "Visualize the clubface pointing slightly left of your target at the point of contact."
        ]\`
- **Feels if Too High:** \`[
          "Feel as though the clubface remains gently open, pointing slightly right of the target through impact.",
          "Imagine your trailing wrist softly extending to maintain a subtly open clubface.",
          "Visualize the heel of your club leading slightly through the impact area."
        ]\``,
        
      'swingFaults_clean.md': `### Slice
- **Description:** A severe left-to-right curvature for a right-handed golfer due to an open clubface relative to the swing path.
- **Trigger Metrics:** \`[
      { metric: "Club Path", comparison: "<", value: -3 },
      { metric: "Face To Path", comparison: ">", value: 3 }
    ]\`
- **Drills:** \`[
      "Inside-Out Path Drill: Place an alignment stick or club slightly outside the ball-target line, encouraging a swing path from the inside to correct the slice.",
      "Closed Stance Drill: Adjust your stance slightly closed to the target line, helping your swing path naturally shift to the inside.",
      "Release Drill: Practice gently rotating your forearms through impact, helping close the clubface relative to the path."
    ]\`
- **Feels:** \`[
      "Feel your trail shoulder staying back slightly longer, promoting an inside-out path.",
      "Imagine the clubface softly turning over through impact, gently closing toward your target.",
      "Visualize swinging toward right field (for a right-handed golfer), helping neutralize the slice."
    ]\`

---

### Hook
- **Description:** A severe right-to-left curvature for a right-handed golfer caused by a closed clubface relative to the swing path.
- **Trigger Metrics:** \`[
      { metric: "Club Path", comparison: ">", value: 3 },
      { metric: "Face To Path", comparison: "<", value: -3 }
    ]\`
- **Drills:** \`[
      "Neutral Path Drill: Align your feet and shoulders squarely, using alignment sticks to maintain a neutral path.",
      "Hold-off Finish Drill: Practice swings with a controlled, abbreviated finish to limit excessive face rotation.",
      "Alignment Stick Feedback Drill: Place a stick along your toe line, promoting a more neutral swing path and face angle."
    ]\`
- **Feels:** \`[
      "Feel as if the clubface stays gently open through impact, minimizing excessive closure.",
      "Imagine your arms softly guiding the clubface straight through the ball, without rolling over.",
      "Visualize a straighter path, swinging directly along your target line."
    ]\`

---

### Fat Shot
- **Description:** A shot where the club hits the ground before the ball, causing significant loss of distance and poor contact.
- **Trigger Metrics:** \`[
      { metric: "Low Point Height", comparison: "<", value: -1 },
      { metric: "Attack Angle", comparison: "<", value: -6 }
    ]\`
- **Drills:** \`[
      "Ball Forward Drill: Place the ball slightly forward in your stance to help the club strike the ball first.",
      "Divot After Ball Drill: Place a tee or small object just ahead of the ball, ensuring your divot occurs after impact.",
      "Balance and Transfer Drill: Emphasize shifting your weight onto your lead side earlier in the downswing to improve strike quality."
    ]\`
- **Feels:** \`[
      "Feel your weight firmly moving forward onto your front foot during the downswing.",
      "Imagine clipping the ball cleanly, striking it first before brushing the turf.",
      "Visualize driving the ball forward, with your low point ahead of the ball at impact."
    ]\``,
    
      'videoLibrary.md': `### Golf Posture
- **URL:** [https://scratchgc.wistia.com/medias/5u6i7fhjfk](https://scratchgc.wistia.com/medias/5u6i7fhjfk)
- **Trigger Metrics:** \`["Attack Angle"]\`
- **Recommendation Reason:** Posture sets the foundation for consistent swing direction and optimal attack angle.

---

### Balance Points
- **URL:** [https://scratchgc.wistia.com/medias/gn0lpl2dfe](https://scratchgc.wistia.com/medias/gn0lpl2dfe)
- **Trigger Metrics:** \`["Impact Offset"]\`
- **Recommendation Reason:** Improve your balance to avoid significant heel or toe strikes.

---

### Club Path on TrackMan (Lesson 1)
- **URL:** [https://scratchgc.wistia.com/medias/ufxhjffk9q](https://scratchgc.wistia.com/medias/ufxhjffk9q)
- **Trigger Metrics:** \`["Club Path"]\`
- **Recommendation Reason:** Understand and control your club path for more consistent ball flight.

---

### Ball Flight Laws (Lesson 2)
- **URL:** [https://scratchgc.wistia.com/medias/m4e3w872wt](https://scratchgc.wistia.com/medias/m4e3w872wt)
- **Trigger Metrics:** \`["Face To Path"]\`
- **Recommendation Reason:** Learn the relationship between face and path to better control your ball flight.

---

### Slice Fix Drill – 10 and 4 (Lesson 4)
- **URL:** [https://scratchgc.wistia.com/medias/t9v6ljw08v](https://scratchgc.wistia.com/medias/t9v6ljw08v)
- **Trigger Metrics:** \`["Club Path", "Face To Path"]\`
- **Recommendation Reason:** Correct slicing by improving your club path and face angle relationship.

---

### Hook Fix Drill (Lesson 5)
- **URL:** [https://scratchgc.wistia.com/medias/jgxopvfd57](https://scratchgc.wistia.com/medias/jgxopvfd57)
- **Trigger Metrics:** \`["Club Path", "Face To Path"]\`
- **Recommendation Reason:** Manage your hook by refining your club path and face-to-path relationship.

---

### Dynamic Loft (KPIs – Lesson 4)
- **URL:** [https://scratchgc.wistia.com/medias/yqsx8hrli5](https://scratchgc.wistia.com/medias/yqsx8hrli5)
- **Trigger Metrics:** \`["Dynamic Loft"]\`
- **Recommendation Reason:** Optimize your dynamic loft to improve ball flight and maximize distance.

---

### Club Speed (KPIs – Lesson 1)
- **URL:** [https://scratchgc.wistia.com/medias/qh5g3jwy0j](https://scratchgc.wistia.com/medias/qh5g3jwy0j)
- **Trigger Metrics:** \`["Club Speed"]\`
- **Recommendation Reason:** Increase club speed through improved technique to maximize distance potential.

---

### Face Angle on TrackMan (Lesson 1)
- **URL:** [https://scratchgc.wistia.com/medias/jic79uxex9](https://scratchgc.wistia.com/medias/jic79uxex9)
- **Trigger Metrics:** \`["Face Angle"]\`
- **Recommendation Reason:** Develop better face control for consistent starting direction.`
    };

    // Knowledge base definitions with file paths
    const knowledgeBases = [
      {
        name: 'knowledgeBase.md',
        namespace: 'metrics',
        parser: parseKnowledgeBase
      },
      {
        name: 'swingFaults_clean.md', 
        namespace: 'faults',
        parser: parseSwingFaults
      },
      {
        name: 'videoLibrary.md',
        namespace: 'videos', 
        parser: parseVideoLibrary
      }
    ];

    let totalProcessed = 0;
    let totalFailed = 0;
    const typeStats = { metric: 0, fault: 0, video: 0 };

    for (const kb of knowledgeBases) {
      console.log(`Processing ${kb.name}...`);
      
      try {
        // Get the content from embedded markdown
        const content = markdownContent[kb.name];
        
        if (!content) {
          throw new Error(`Content not found for ${kb.name}`);
        }
        
        // Parse the content
        const entries = kb.parser(content);
        console.log(`Parsed ${entries.length} entries from ${kb.name}`);
        
        // Process each entry
        for (const entry of entries) {
          try {
            console.log(`Processing ${entry.type}: ${entry.title}`);
            
            // Generate embedding
            const embedding = await generateEmbedding(entry.content);
            
            // Insert into database
            const { error: insertError } = await supabase
              .from('embedding_documents')
              .insert({
                namespace: kb.namespace,
                title: entry.title,
                type: entry.type,
                content: entry.content,
                trigger_metrics: entry.trigger_metrics,
                metadata: entry.metadata,
                embedding: embedding
              });
            
            if (insertError) {
              console.error(`Error inserting ${entry.title}:`, insertError);
              totalFailed++;
            } else {
              totalProcessed++;
              typeStats[entry.type as keyof typeof typeStats]++;
              console.log(`✓ Successfully processed: ${entry.title}`);
            }
            
          } catch (error) {
            console.error(`Error processing entry ${entry.title}:`, error);
            totalFailed++;
          }
        }
        
      } catch (error) {
        console.error(`Error processing ${kb.name}:`, error);
        totalFailed++;
      }
    }

    console.log('\n=== PROCESSING COMPLETE ===');
    console.log(`Total embeddings created: ${totalProcessed}`);
    console.log(`Total failed: ${totalFailed}`);
    console.log('Embeddings by type:');
    console.log(`- Metrics: ${typeStats.metric}`);
    console.log(`- Faults: ${typeStats.fault}`);
    console.log(`- Videos: ${typeStats.video}`);
    
    return new Response(JSON.stringify({
      success: true,
      stats: {
        totalFiles: knowledgeBases.length,
        totalChunks: totalProcessed + totalFailed,
        successfullyProcessed: totalProcessed,
        failedChunks: totalFailed,
        typeBreakdown: typeStats
      }
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Error in preprocess-knowledge function:', error);
    return new Response(JSON.stringify({
      success: false,
      error: error.message
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});