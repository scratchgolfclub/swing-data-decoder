// Helper function to parse numeric values from TrackMan data strings
const parseNumericValue = (value: string | undefined): number => {
  if (!value) return 0;
  return parseFloat(value.replace(/[^\d.-]/g, ''));
};

// Helper function to calculate variance in a set of values
const calculateVariance = (values: number[]): number => {
  if (values.length <= 1) return 0;
  const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
  const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
  return Math.sqrt(variance); // Return standard deviation
};

const analyzeSwingConsistency = (swings: any[]) => {
  const variances: Record<string, number> = {};
  
  if (swings.length <= 1) {
    return { isConsistent: true, variances, swingCount: swings.length };
  }
  
  const metrics = ['clubPath', 'faceAngle', 'attackAngle', 'clubSpeed', 'faceToPath', 'spinRate'];
  
  metrics.forEach(metric => {
    const values = swings.map(swing => parseNumericValue(swing[metric])).filter(val => !isNaN(val));
    if (values.length > 1) {
      variances[metric] = calculateVariance(values);
    }
  });
  
  return {
    isConsistent: Object.values(variances).every(variance => variance < 2), // Threshold for "consistent"
    variances,
    swingCount: swings.length
  };
};

// Helper function to determine club category for context
const getClubCategory = (club: string): string => {
  const clubLower = club.toLowerCase();
  
  if (clubLower === 'dr') return 'driver';
  if (clubLower.includes('w') || clubLower.includes('h')) return 'woods';
  if (clubLower.includes('i') && !clubLower.includes('pw')) return 'irons';
  if (clubLower.includes('pw') || clubLower.includes('sw') || clubLower.includes('lw') || clubLower.includes('°')) return 'wedges';
  
  return 'irons'; // default
};

export const getVideoRecommendations = (swings: any[], selectedClub: string = '') => {
  const videos = [];
  
  // If no swings data, return empty
  if (!swings || swings.length === 0) return videos;
  
  // Analyze consistency across multiple swings
  const consistency = analyzeSwingConsistency(swings);
  const primarySwing = swings[0]; // Use first swing as primary for analysis
  const clubCategory = getClubCategory(selectedClub);
  
  // Parse all metrics
  const clubPath = parseNumericValue(primarySwing.clubPath);
  const attackAngle = parseNumericValue(primarySwing.attackAngle);
  const faceAngle = parseNumericValue(primarySwing.faceAngle);
  const faceToPath = parseNumericValue(primarySwing.faceToPath);
  const spinAxis = parseNumericValue(primarySwing.spinAxis);
  const dynamicLie = parseNumericValue(primarySwing.dynLie);
  const impactOffset = parseNumericValue(primarySwing.impactOffset);
  const dynamicLoft = parseNumericValue(primarySwing.dynLoft);
  const lowPointDistance = parseNumericValue(primarySwing.lowPointDistance);
  const spinRate = parseNumericValue(primarySwing.spinRate);
  const launchAngle = parseNumericValue(primarySwing.launchAngle);
  const ballSpeed = parseNumericValue(primarySwing.ballSpeed);
  const clubSpeed = parseNumericValue(primarySwing.clubSpeed);
  const smashFactor = parseNumericValue(primarySwing.smashFactor);
  const carry = parseNumericValue(primarySwing.carry);
  const curve = parseNumericValue(primarySwing.curve);
  const launchDirection = parseNumericValue(primarySwing.launchDirection);
  const swingDirection = parseNumericValue(primarySwing.swingDirection);
  
  // Priority scoring system for video recommendations
  const videoRecommendations = [];
  
  // SETUP FOR SUCCESS VIDEOS (Highest Priority)
  
  // Golf Posture - Critical foundation
  if (attackAngle > 0 || Math.abs(clubPath) > 4 || (consistency.variances.clubPath || 0) > 3 || attackAngle < -5 || lowPointDistance > 0.5) {
    videoRecommendations.push({
      title: "Golf Posture",
      description: "Posture sets the foundation for consistent swing direction, attack angle, and low point",
      url: "https://scratchgc.wistia.com/medias/5u6i7fhjfk",
      priority: 10
    });
  }
  
  // Balance Points - Stability issues
  if ((consistency.variances.clubPath || 0) > 3 || Math.abs(impactOffset) > 5 || Math.abs(dynamicLie - 60) > 3 || Math.abs(swingDirection) > 5) {
    videoRecommendations.push({
      title: "Balance Points", 
      description: "Improve balance to reduce heel/toe strikes and stabilize swing path",
      url: "https://scratchgc.wistia.com/medias/gn0lpl2dfe",
      priority: 9
    });
  }
  
  // Posture and Balance Checkpoints - Reinforcement
  if ((consistency.variances.dynamicLoft || 0) > 4 || (attackAngle > 0 && clubCategory === 'irons') || !consistency.isConsistent) {
    videoRecommendations.push({
      title: "Posture and Balance Checkpoints",
      description: "Reinforces proper alignment and stance width for consistent impact",
      url: "https://scratchgc.wistia.com/medias/j1j0a6hlt1",
      priority: 8
    });
  }
  
  // Grip Videos - Face control
  if (Math.abs(faceToPath) > 2 || (consistency.variances.faceAngle || 0) > 2 || smashFactor < (clubCategory === 'driver' ? 1.4 : 1.3)) {
    if (faceToPath > 2 || Math.abs(launchDirection) > 3) {
      videoRecommendations.push({
        title: "Grip Checkpoints – Trail Hand",
        description: "Fix your trail hand grip to improve face control and reduce slice patterns",
        url: "https://scratchgc.wistia.com/medias/mqjewf6aqo",
        priority: 8
      });
    }
    if (Math.abs(spinAxis) > 5 || (consistency.variances.faceAngle || 0) > 2) {
      videoRecommendations.push({
        title: "Grip Checkpoints – Lead Hand",
        description: "Proper lead hand grip for consistent face angles and reduced curvature",
        url: "https://scratchgc.wistia.com/medias/s9lx5jqzss",
        priority: 8
      });
    }
  }
  
  // Ball Position - Impact fundamentals
  if (attackAngle < -5 || (attackAngle > 0 && clubCategory !== 'driver') || Math.abs(faceToPath) > 3 || lowPointDistance > 0.5) {
    videoRecommendations.push({
      title: "Ball Position",
      description: "Optimize ball position to improve attack angle and launch conditions",
      url: "https://scratchgc.wistia.com/medias/a02r1906cd",
      priority: 9
    });
  }
  
  // Alignment - Direction issues
  if (Math.abs(launchDirection) > 3 || (Math.abs(faceToPath) < 1 && Math.abs(curve) > 10)) {
    videoRecommendations.push({
      title: "Alignment",
      description: "Fix directional misses even when swing metrics are good",
      url: "https://scratchgc.wistia.com/medias/k6fn07gug6",
      priority: 7
    });
  }
  
  // Foot Orientation - Mobility issues
  if (Math.abs(clubPath) > 4 || Math.abs(swingDirection) > 5 || dynamicLie > 65) {
    videoRecommendations.push({
      title: "Foot Orientation",
      description: "Improve rotational mobility and setup balance",
      url: "https://scratchgc.wistia.com/medias/v23r3wqwdr",
      priority: 6
    });
  }
  
  // CLUB PATH & BALL FLIGHT LAWS (Medium-High Priority)
  
  // Club Path Lesson 1 - Understanding basics
  if ((Math.abs(clubPath) > 2 && Math.abs(faceAngle) > 1) || Math.abs(curve) > 20 || (consistency.variances.clubPath || 0) > 5) {
    videoRecommendations.push({
      title: "Club Path on TrackMan (Lesson 1)",
      description: "Learn the 2:1 path-to-face ratio concept for consistent shot shapes",
      url: "https://scratchgc.wistia.com/medias/ufxhjffk9q",
      priority: 7
    });
  }
  
  // Ball Flight Laws - Confusing patterns
  if (Math.abs(faceToPath) > 3 || (consistency.variances.faceToPath || 0) > 2 || Math.abs(launchDirection - spinAxis) > 3) {
    videoRecommendations.push({
      title: "Ball Flight Laws (Lesson 2)",
      description: "Visual explanation of face and path relationships for clearer ball flight understanding",
      url: "https://scratchgc.wistia.com/medias/m4e3w872wt",
      priority: 7
    });
  }
  
  // TourAim Drill - Inconsistent delivery
  if ((consistency.variances.clubPath || 0) > 4 || (consistency.variances.faceToPath || 0) > 2 || Math.abs(swingDirection) > 5) {
    videoRecommendations.push({
      title: "TourAim Drill (Lesson 3)",
      description: "Build repeatable delivery patterns for consistent face-to-path relationships",
      url: "https://scratchgc.wistia.com/medias/bsf7uxod06",
      priority: 6
    });
  }
  
  // Slice Fix - Classic slice pattern
  if (clubPath < -2 && faceToPath > 3 && spinAxis > 6 && curve > 20) {
    videoRecommendations.push({
      title: "Slice Fix Drill – 10 and 4 (Lesson 4)",
      description: "Specific drills to fix slice by promoting in-to-out path and square face",
      url: "https://scratchgc.wistia.com/medias/t9v6ljw08v",
      priority: 8
    });
  }
  
  // Hook Fix - Hook pattern
  if (clubPath > 5 && faceToPath < -3 && spinAxis < -6 && curve < -20) {
    videoRecommendations.push({
      title: "Hook Fix Drill (Lesson 5)", 
      description: "Control excessive inside path and closed face for straighter shots",
      url: "https://scratchgc.wistia.com/medias/jgxopvfd57",
      priority: 8
    });
  }
  
  // ANGLE OF ATTACK & LOW POINT (Medium Priority)
  
  // Angle of Attack fundamentals
  if ((attackAngle > 0 && clubCategory !== 'driver') || (attackAngle < 0 && clubCategory === 'driver') || (consistency.variances.attackAngle || 0) > 3) {
    videoRecommendations.push({
      title: "Angle of Attack on TrackMan (Lesson 1)",
      description: "Master proper angle of attack for each club type",
      url: "https://scratchgc.wistia.com/medias/wdbfqn6l5u",
      priority: 6
    });
  }
  
  // Low Point Distance + Drills
  if (Math.abs(lowPointDistance) > 0.5 || (attackAngle < -4 && dynamicLoft < 20)) {
    videoRecommendations.push({
      title: "Low Point Distance + Drills (Low Point Lesson 1)",
      description: "Eliminate fat shots and improve ball striking consistency",
      url: "https://scratchgc.wistia.com/medias/6cm1m86qgi",
      priority: 7
    });
  }
  
  // Low Point with Driver - Driver specific
  if (clubCategory === 'driver' && (attackAngle < 0 || launchAngle < 9 || launchAngle > 16 || spinRate > 3000)) {
    videoRecommendations.push({
      title: "Low Point with Driver Drill",
      description: "Promote upward strike and maximize driver distance",
      url: "https://scratchgc.wistia.com/medias/rku7xnxyci",
      priority: 7
    });
  }
  
  // DYNAMIC LOFT/SPIN LOFT (Medium Priority)
  
  // Dynamic Loft KPIs
  const spinLoft = dynamicLoft - attackAngle;
  if (dynamicLoft > (clubCategory === 'irons' ? 24 : 20) || spinLoft > 20 || spinLoft < 10) {
    videoRecommendations.push({
      title: "Dynamic Loft (KPIs – Lesson 4)",
      description: "Optimize dynamic loft for better ball flight and distance",
      url: "https://scratchgc.wistia.com/medias/yqsx8hrli5",
      priority: 5
    });
  }
  
  // Dynamic Loft - Shaft Lean Drill
  if ((consistency.variances.dynamicLoft || 0) > 4 || smashFactor < 1.3 || spinLoft > 20) {
    videoRecommendations.push({
      title: "Dynamic Loft – Shaft Lean Drill (Lesson 5)",
      description: "Improve compression and impact efficiency through proper shaft lean",
      url: "https://scratchgc.wistia.com/medias/sxzgttz5t7",
      priority: 5
    });
  }
  
  // CARRY DISTANCE OPTIMIZATION (Lower Priority)
  
  // Club Speed KPIs
  if (clubSpeed < 85 || (consistency.variances.clubSpeed || 0) > 5) {
    videoRecommendations.push({
      title: "Club Speed (KPIs – Lesson 1)",
      description: "Increase club speed for more distance through proper technique",
      url: "https://scratchgc.wistia.com/medias/qh5g3jwy0j",
      priority: 3
    });
  }
  
  // Ball Speed KPIs
  if ((consistency.variances.ballSpeed || 0) > 5 || ballSpeed < clubSpeed * 1.4) {
    videoRecommendations.push({
      title: "Ball Speed (KPIs – Lesson 2)",
      description: "Optimize ball speed for maximum distance potential",
      url: "https://scratchgc.wistia.com/medias/0w0yd82dp5",
      priority: 4
    });
  }
  
  // Smash Factor KPIs
  if (smashFactor < (clubCategory === 'driver' ? 1.45 : 1.35)) {
    videoRecommendations.push({
      title: "Smash Factor (KPIs – Lesson 3)",
      description: "Maximize energy transfer from club to ball",
      url: "https://scratchgc.wistia.com/medias/d7olpgqvqj",
      priority: 4
    });
  }
  
  // FACE ANGLE CONTROL (Lower Priority)
  
  // Face Angle fundamentals
  if (Math.abs(faceAngle) > 2 || (consistency.variances.faceAngle || 0) > 3) {
    videoRecommendations.push({
      title: "Face Angle on TrackMan (Lesson 1)",
      description: "Master face control for consistent ball starting direction",
      url: "https://scratchgc.wistia.com/medias/jic79uxex9",
      priority: 4
    });
  }
  
  // Sort by priority (highest first) and remove duplicates
  const uniqueVideos = videoRecommendations
    .sort((a, b) => b.priority - a.priority)
    .filter((video, index, array) => 
      array.findIndex(v => v.url === video.url) === index
    )
    .map(({ priority, ...video }) => video); // Remove priority from final output
  
  // Return top 6-8 most relevant videos based on data
  return uniqueVideos.slice(0, 8);
};

export const getTextRecommendations = (swings: any[], selectedClub: string = '') => {
  // If no swings data, return default
  if (!swings || swings.length === 0) {
    return `📊 No swing data available. Please upload TrackMan data photos for analysis.`;
  }
  
  // Get club category for context
  const clubCategory = getClubCategory(selectedClub);
  
  // Analyze consistency across multiple swings
  const consistency = analyzeSwingConsistency(swings);
  const primarySwing = swings[0]; // Use first swing as primary for analysis
  
  const clubPath = parseNumericValue(primarySwing.clubPath);
  const faceAngle = parseNumericValue(primarySwing.faceAngle);
  const faceToPath = parseNumericValue(primarySwing.faceToPath);
  const attackAngle = parseNumericValue(primarySwing.attackAngle);
  const spinRate = parseNumericValue(primarySwing.spinRate);
  const launchAngle = parseNumericValue(primarySwing.launchAngle);
  const dynamicLoft = parseNumericValue(primarySwing.dynLoft);
  
  // Build consistency context if multiple swings
  let consistencyNote = '';
  if (swings.length > 1) {
    const inconsistentMetrics = Object.entries(consistency.variances)
      .filter(([_, variance]) => variance > 2)
      .map(([metric, variance]) => `${metric} (±${variance.toFixed(1)}°)`)
      .join(', ');
    
    if (inconsistentMetrics) {
      consistencyNote = `\n\n📊 Consistency Analysis (${swings.length} swings):\nYou show inconsistency in: ${inconsistentMetrics}. This suggests focusing on setup fundamentals and repeatable delivery patterns.\n\n`;
    } else {
      consistencyNote = `\n\n📊 Consistency Analysis (${swings.length} swings):\nGood news! Your swing metrics are relatively consistent across swings. This shows good fundamentals and repeatable patterns.\n\n`;
    }
  }
  
  // Club-specific context and ranges
  let clubSpecificContext = '';
  let outOfRangeIssues: string[] = [];
  
  if (clubCategory === 'driver') {
    clubSpecificContext = `\n🚀 Driver Analysis:\nOptimal ranges: AoA +0° to +6°, Club Path -1° to +3°, Face-to-Path ≤1°, Spin Rate 2000-3000 rpm\n\n`;
    
    if (attackAngle < 0) outOfRangeIssues.push(`Attack angle (${attackAngle.toFixed(1)}°) is negative - should be positive for driver distance`);
    if (Math.abs(faceToPath) > 1) outOfRangeIssues.push(`Face-to-path (${faceToPath.toFixed(1)}°) is outside ±1° - work on consistency`);
    if (spinRate > 3000) outOfRangeIssues.push(`Spin rate (${spinRate} rpm) is high - work on upward strike`);
  }
  
  else if (clubCategory === 'woods') {
    clubSpecificContext = `\n🌲 Woods/Hybrids Analysis:\nOptimal ranges: AoA -2° to +2°, Club Path -1° to +3°, Face-to-Path ≤2°, Spin Rate 3000-4500 rpm\n\n`;
    
    if (attackAngle < -2 || attackAngle > 2) outOfRangeIssues.push(`Attack angle (${attackAngle.toFixed(1)}°) outside optimal range (-2° to +2°)`);
    if (Math.abs(faceToPath) > 2) outOfRangeIssues.push(`Face-to-path (${faceToPath.toFixed(1)}°) is outside ±2°`);
    if (spinRate < 3000 || spinRate > 4500) outOfRangeIssues.push(`Spin rate (${spinRate} rpm) outside optimal range (3000-4500)`);
  }
  
  else if (clubCategory === 'irons') {
    clubSpecificContext = `\n🛠️ Irons Analysis:\nOptimal ranges: AoA -4° to -2°, Club Path -2° to +2°, Face-to-Path ≤2°, Spin Rate 5000-7000 rpm\n\n`;
    
    if (attackAngle > -2 || attackAngle < -4) outOfRangeIssues.push(`Attack angle (${attackAngle.toFixed(1)}°) outside optimal range (-4° to -2°)`);
    if (Math.abs(faceToPath) > 2) outOfRangeIssues.push(`Face-to-path (${faceToPath.toFixed(1)}°) is outside ±2°`);
    if (spinRate < 5000 || spinRate > 7000) outOfRangeIssues.push(`Spin rate (${spinRate} rpm) outside optimal range (5000-7000)`);
  }
  
  else if (clubCategory === 'wedges') {
    clubSpecificContext = `\n⛳ Wedges Analysis:\nOptimal ranges: AoA -6° to -4°, Club Path -2° to +2°, Face-to-Path ≤2°, Spin Rate 7000-9000 rpm\n\n`;
    
    if (attackAngle > -4 || attackAngle < -6) outOfRangeIssues.push(`Attack angle (${attackAngle.toFixed(1)}°) outside optimal range (-6° to -4°)`);
    if (Math.abs(faceToPath) > 2) outOfRangeIssues.push(`Face-to-path (${faceToPath.toFixed(1)}°) is outside ±2°`);
    if (spinRate < 7000 || spinRate > 9000) outOfRangeIssues.push(`Spin rate (${spinRate} rpm) outside optimal range (7000-9000)`);
  }
  
  // Build out-of-range issues context
  let rangeIssuesContext = '';
  if (outOfRangeIssues.length > 0) {
    rangeIssuesContext = `\n⚠️ Areas Outside Optimal Ranges:\n${outOfRangeIssues.map(issue => `• ${issue}`).join('\n')}\n\n`;
  }
  
  // Specific pattern analysis - Out-to-in with open face (fade pattern)  
  if (clubPath < -2 && faceToPath > 1) {
    return `🧠 Understanding Club Path & Face Angle${clubSpecificContext}In simple terms:

Club Path is the direction the club is traveling at impact — either right (in-to-out), left (out-to-in), or neutral.

Face Angle is where the clubface is pointing relative to the target at impact.

The relationship between face angle and club path determines the ball's starting direction and curve.${consistencyNote}${rangeIssuesContext}In your case:

Your club is traveling ${Math.abs(clubPath).toFixed(1)}° left of target (out-to-in).

Your face is ${Math.abs(faceAngle).toFixed(1)}° closed to target, but ${faceToPath.toFixed(1)}° open to your path, which is why your shots are fading slightly right.

🌀 This is a textbook fade setup — ball starts slightly left and curves back right.

🛠️ What to Work On: Neutralizing Club Path

Your face-to-path relationship is solid, but the out-to-in club path is the root of the fade. To hit straighter or even draw-biased shots, we want to move your club path closer to 0°, or even slightly positive (in-to-out).

✅ Drills & Feel Changes to Try:

Alignment Stick Drill:
Place an alignment stick on the ground pointing slightly right of your target (1–2 yards).
Feel your swing path trace along the stick on your downswing to promote an in-to-out path.

Split Hand Drill:
Grip the club with your normal top hand (left hand for righties).
Place your bottom hand halfway down the shaft.
Make slow swings feeling the club move from inside to out — this exaggerates the correct path.

"Swing to Right Field" Feel:
On the range, pick a target to the right of your actual target.
Make swings visualizing the ball launching in that direction — this encourages shallowing and an in-to-out move.

Check Setup Alignment:
Ensure your feet, hips, and shoulders aren't aimed left of target — this often promotes an out-to-in path subconsciously.

🔁 Goal:
Shift club path from ${clubPath.toFixed(1)}° closer to neutral (0°) or even slightly positive (+1 to +2°).
Maintain a face angle that's 1–2° closed to the path to produce a slight draw or straight shot.`;
  }
  
  // Additional patterns based on video context
  
  // Strong slice pattern
  if (clubPath < -2 && faceToPath > 3) {
    return `🌪️ Classic Slice Pattern Detected${clubSpecificContext}${consistencyNote}${rangeIssuesContext}Your data shows a strong slice pattern:
- Club Path: ${clubPath.toFixed(1)}° (out-to-in)
- Face to Path: ${faceToPath.toFixed(1)}° (open to path)

This creates excessive left-to-right curve. Focus on:
1. Grip adjustments (strengthen lead hand)
2. Setup alignment (check shoulder position)
3. Swing path drills (in-to-out feel)
4. Release pattern (active forearm rotation)

Priority: Work on swing path first, then face control.`;
  }
  
  // Hook pattern
  if (clubPath > 5 && faceToPath < -3) {
    return `🪝 Strong Hook Pattern Detected${clubSpecificContext}${consistencyNote}${rangeIssuesContext}Your data shows excessive draw/hook:
- Club Path: ${clubPath.toFixed(1)}° (in-to-out)
- Face to Path: ${faceToPath.toFixed(1)}° (closed to path)

This creates excessive right-to-left curve. Focus on:
1. Grip adjustments (weaken both hands slightly)
2. Setup (check alignment and ball position)
3. Release pattern (more passive through impact)
4. Path control (feel more neutral delivery)

Priority: Moderate the release while maintaining good path.`;
  }
  
  // Inconsistency focus
  if (swings.length > 1 && !consistency.isConsistent) {
    const mostInconsistent = Object.entries(consistency.variances)
      .sort(([,a], [,b]) => b - a)[0];
    
    if (mostInconsistent) {
      return `🎯 Consistency Focus Needed${clubSpecificContext}${consistencyNote}${rangeIssuesContext}Your biggest inconsistency is in ${mostInconsistent[0]} (varies by ±${mostInconsistent[1].toFixed(1)}°).

This suggests focusing on:
1. Setup fundamentals (posture, alignment, ball position)
2. Tempo and rhythm consistency
3. Pre-shot routine development
4. Impact position awareness

Work on repeating the same setup and feel, rather than making big swing changes.`;
    }
  }
  
  // Default comprehensive analysis with club-specific context
  return `📊 Your Swing Analysis${clubSpecificContext}${consistencyNote}${rangeIssuesContext}Based on your TrackMan data, here are the key areas to focus on:

🎯 Ball Flight: Your current setup produces ${clubPath < 0 ? 'fade' : clubPath > 2 ? 'draw' : 'relatively straight'} patterns.

🔧 Primary Focus Areas:
1. Club Path: Currently ${clubPath.toFixed(1)}° - ${Math.abs(clubPath) > 2 ? 'work on neutralizing' : 'maintain good control'}
2. Face Control: Face to path is ${faceToPath.toFixed(1)}° - ${Math.abs(faceToPath) > 2 ? 'improve face control' : 'good relationship'}
3. Impact Quality: Continue developing consistent strike patterns

💡 Practice Recommendations:
• Focus on tempo and rhythm in your swing
• Work on impact position drills
• Practice alignment and setup consistency${swings.length > 1 ? '\n• Use multiple swings to monitor consistency trends' : ''}

Keep up the great work and continue monitoring your progress with TrackMan data!`;
};