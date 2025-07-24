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

export const getVideoRecommendations = (swings: any[]) => {
  const videos = [];
  
  // If no swings data, return empty
  if (!swings || swings.length === 0) return videos;
  
  // Analyze consistency across multiple swings
  const consistency = analyzeSwingConsistency(swings);
  const primarySwing = swings[0]; // Use first swing as primary for analysis
  
  // Check for setup issues first (from provided context)
  const clubPath = parseNumericValue(primarySwing.clubPath);
  const attackAngle = parseNumericValue(primarySwing.attackAngle);
  const faceAngle = parseNumericValue(primarySwing.faceAngle);
  const faceToPath = parseNumericValue(primarySwing.faceToPath);
  const spinAxis = parseNumericValue(primarySwing.spinAxis);
  const dynamicLie = parseNumericValue(primarySwing.dynLie);
  const impactOffset = parseNumericValue(primarySwing.impactOffset);
  
  // Setup for Success Videos (based on provided context)
  
  // Golf Posture - if multiple issues or inconsistency
  if (attackAngle > 0 || Math.abs(clubPath) > 4 || (consistency.variances.clubPath || 0) > 3 || attackAngle < -5) {
    videos.push({
      title: "Golf Posture",
      description: "Posture sets the foundation for consistent swing direction, attack angle, and low point",
      url: "https://scratchgc.wistia.com/medias/5u6i7fhjfk"
    });
  }
  
  // Balance Points - if inconsistent path/lie or heel/toe strikes
  if ((consistency.variances.clubPath || 0) > 3 || Math.abs(impactOffset) > 5 || Math.abs(dynamicLie - 60) > 3) {
    videos.push({
      title: "Balance Points", 
      description: "Improve balance to reduce heel/toe strikes and stabilize swing path",
      url: "https://scratchgc.wistia.com/medias/gn0lpl2dfe"
    });
  }
  
  // Grip Videos
  if (Math.abs(faceToPath) > 2 || (consistency.variances.faceAngle || 0) > 2) {
    if (faceToPath > 2) {
      videos.push({
        title: "Grip Checkpoints – Trail Hand",
        description: "Fix your trail hand grip to improve face control and reduce slice patterns",
        url: "https://scratchgc.wistia.com/medias/mqjewf6aqo"
      });
    }
    if (Math.abs(spinAxis) > 5 || (consistency.variances.faceAngle || 0) > 2) {
      videos.push({
        title: "Grip Checkpoints – Lead Hand",
        description: "Proper lead hand grip for consistent face angles and reduced curvature",
        url: "https://scratchgc.wistia.com/medias/s9lx5jqzss"
      });
    }
  }
  
  // Ball Position
  if (attackAngle < -5 || attackAngle > 0 || Math.abs(faceToPath) > 3) {
    videos.push({
      title: "Ball Position",
      description: "Optimize ball position to improve attack angle and launch conditions",
      url: "https://scratchgc.wistia.com/medias/a02r1906cd"
    });
  }
  
  // Club Path & Ball Flight Laws Videos
  
  // Club Path Lesson 1 - for understanding basics
  if (Math.abs(clubPath) > 2 && Math.abs(faceAngle) > 1) {
    videos.push({
      title: "Club Path on TrackMan (Lesson 1)",
      description: "Learn the 2:1 path-to-face ratio concept for consistent shot shapes",
      url: "https://scratchgc.wistia.com/medias/ufxhjffk9q"
    });
  }
  
  // Ball Flight Laws - for confusing patterns
  if (Math.abs(faceToPath) > 3 || (consistency.variances.faceToPath || 0) > 2) {
    videos.push({
      title: "Ball Flight Laws (Lesson 2)",
      description: "Visual explanation of face and path relationships for clearer ball flight understanding",
      url: "https://scratchgc.wistia.com/medias/m4e3w872wt"
    });
  }
  
  // Specific pattern fixes
  
  // Slice Fix - classic slice pattern
  if (clubPath < -2 && faceToPath > 3) {
    videos.push({
      title: "Slice Fix Drill – 10 and 4 (Lesson 4)",
      description: "Specific drills to fix slice by promoting in-to-out path and square face",
      url: "https://scratchgc.wistia.com/medias/t9v6ljw08v"
    });
  }
  
  // Hook Fix - hook pattern
  if (clubPath > 5 && faceToPath < -3) {
    videos.push({
      title: "Hook Fix Drill (Lesson 5)", 
      description: "Control excessive inside path and closed face for straighter shots",
      url: "https://scratchgc.wistia.com/medias/jgxopvfd57"
    });
  }
  
  // TourAim Drill - for inconsistent patterns
  if ((consistency.variances.clubPath || 0) > 4 || (consistency.variances.faceToPath || 0) > 2) {
    videos.push({
      title: "TourAim Drill (Lesson 3)",
      description: "Build repeatable delivery patterns for consistent face-to-path relationships",
      url: "https://scratchgc.wistia.com/medias/bsf7uxod06"
    });
  }
  
  // If no specific issues found, recommend general improvement
  if (videos.length === 0) {
    videos.push({
      title: "Optimizing Your Iron Play",
      description: "Fine-tune your technique for consistent ball striking",
      url: "https://scratchgc.wistia.com/medias/general"
    });
  }
  
  // Limit to 3-4 most relevant videos
  return videos.slice(0, 4);
};

export const getTextRecommendations = (swings: any[]) => {
  // If no swings data, return default
  if (!swings || swings.length === 0) {
    return `📊 No swing data available. Please upload TrackMan data photos for analysis.`;
  }
  
  // Analyze consistency across multiple swings
  const consistency = analyzeSwingConsistency(swings);
  const primarySwing = swings[0]; // Use first swing as primary for analysis
  
  const clubPath = parseNumericValue(primarySwing.clubPath);
  const faceAngle = parseNumericValue(primarySwing.faceAngle);
  const faceToPath = parseNumericValue(primarySwing.faceToPath);
  
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
  
  // Specific pattern analysis - Out-to-in with open face (fade pattern)  
  if (clubPath < -2 && faceToPath > 1) {
    return `🧠 Understanding Club Path & Face Angle

In simple terms:

Club Path is the direction the club is traveling at impact — either right (in-to-out), left (out-to-in), or neutral.

Face Angle is where the clubface is pointing relative to the target at impact.

The relationship between face angle and club path determines the ball's starting direction and curve.${consistencyNote}In your case:

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
    return `🌪️ Classic Slice Pattern Detected${consistencyNote}Your data shows a strong slice pattern:
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
    return `🪝 Strong Hook Pattern Detected${consistencyNote}Your data shows excessive draw/hook:
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
      return `🎯 Consistency Focus Needed${consistencyNote}Your biggest inconsistency is in ${mostInconsistent[0]} (varies by ±${mostInconsistent[1].toFixed(1)}°).

This suggests focusing on:
1. Setup fundamentals (posture, alignment, ball position)
2. Tempo and rhythm consistency
3. Pre-shot routine development
4. Impact position awareness

Work on repeating the same setup and feel, rather than making big swing changes.`;
    }
  }
  
  // Default comprehensive analysis
  return `📊 Your Swing Analysis${consistencyNote}Based on your TrackMan data, here are the key areas to focus on:

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