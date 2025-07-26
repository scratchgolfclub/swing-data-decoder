import { getStructuredMetrics, getMetricValue } from './structuredMetricsHelper';

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
  
  const metricTitles = ['Club Path', 'Face Angle', 'Attack Angle', 'Club Speed', 'Face to Path', 'Spin Rate'];
  
  metricTitles.forEach(metricTitle => {
    const values = swings.map(swing => {
      const structuredMetrics = getStructuredMetrics(swing.structuredMetrics || swing.structured_metrics || []);
      return getMetricValue(structuredMetrics, metricTitle);
    }).filter(val => val !== null && !isNaN(val)) as number[];
    
    if (values.length > 1) {
      variances[metricTitle] = calculateVariance(values);
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
  console.log('getVideoRecommendations called with:', { swings, selectedClub });
  
  const videos = [];
  
  // If no swings data, return empty
  if (!swings || swings.length === 0) {
    console.log('No swings provided to getVideoRecommendations');
    return videos;
  }

  // Filter out undefined/null swings and ensure they have structured metrics
  const validSwings = swings.filter(swing => {
    if (!swing) {
      console.log('Found null/undefined swing');
      return false;
    }
    if (!swing.structuredMetrics) {
      console.log('Swing missing structuredMetrics:', swing);
      return false;
    }
    return true;
  });

  if (validSwings.length === 0) {
    console.log('No valid swings with structured metrics found');
    return [];
  }

  // Analyze consistency across multiple swings
  const consistency = analyzeSwingConsistency(validSwings);
  const primarySwing = validSwings[0]; // Use first valid swing as primary for analysis
  const clubCategory = getClubCategory(selectedClub);
  
  // Get structured metrics for the primary swing
  const structuredMetrics = getStructuredMetrics(primarySwing.structuredMetrics || primarySwing.structured_metrics || []);
  
  // Parse all metrics using structured format
  const clubPath = getMetricValue(structuredMetrics, 'Club Path') || 0;
  const attackAngle = getMetricValue(structuredMetrics, 'Attack Angle') || 0;
  const faceAngle = getMetricValue(structuredMetrics, 'Face Angle') || 0;
  const faceToPath = getMetricValue(structuredMetrics, 'Face to Path') || 0;
  const spinAxis = getMetricValue(structuredMetrics, 'Spin Axis') || 0;
  const dynamicLie = getMetricValue(structuredMetrics, 'Dynamic Lie') || 0;
  const impactOffset = getMetricValue(structuredMetrics, 'Impact Offset') || 0;
  const dynamicLoft = getMetricValue(structuredMetrics, 'Dynamic Loft') || 0;
  const lowPointDistance = getMetricValue(structuredMetrics, 'Low Point Distance') || 0;
  const spinRate = getMetricValue(structuredMetrics, 'Spin Rate') || 0;
  const launchAngle = getMetricValue(structuredMetrics, 'Launch Angle') || 0;
  const ballSpeed = getMetricValue(structuredMetrics, 'Ball Speed') || 0;
  const clubSpeed = getMetricValue(structuredMetrics, 'Club Speed') || 0;
  const smashFactor = getMetricValue(structuredMetrics, 'Smash Factor') || 0;
  const carry = getMetricValue(structuredMetrics, 'Carry Distance') || 0;
  const curve = getMetricValue(structuredMetrics, 'Curve') || 0;
  const launchDirection = getMetricValue(structuredMetrics, 'Launch Direction') || 0;
  const swingDirection = getMetricValue(structuredMetrics, 'Swing Direction') || 0;
  
  // Priority scoring system for video recommendations
  const videoRecommendations = [];
  
  // SETUP FOR SUCCESS VIDEOS (Highest Priority)
  
  // Golf Posture - Critical foundation
  if (attackAngle > 0 || Math.abs(clubPath) > 4 || (consistency.variances.clubPath || 0) > 3 || attackAngle < -5 || lowPointDistance > 0.5) {
    let reason = '';
    if (attackAngle > 0 && clubCategory !== 'driver') reason = `Your attack angle is ${attackAngle.toFixed(1)}° (hitting up on irons)`;
    else if (Math.abs(clubPath) > 4) reason = `Your swing path is ${clubPath.toFixed(1)}° (should be closer to 0°)`;
    else if (attackAngle < -5) reason = `Your attack angle is too steep at ${attackAngle.toFixed(1)}°`;
    else if (lowPointDistance > 0.5) reason = `Your low point is ${lowPointDistance.toFixed(1)}" behind the ball`;
    else reason = 'Your swing shows inconsistent path control';
    
    videoRecommendations.push({
      title: "Golf Posture",
      description: "Posture sets the foundation for consistent swing direction, attack angle, and low point",
      url: "https://scratchgc.wistia.com/medias/5u6i7fhjfk",
      reason: reason,
      priority: 10
    });
  }
  
  // Balance Points - Stability issues
  if ((consistency.variances.clubPath || 0) > 3 || Math.abs(impactOffset) > 5 || Math.abs(dynamicLie - 60) > 3 || Math.abs(swingDirection) > 5) {
    let reason = '';
    if (Math.abs(impactOffset) > 5) reason = `You're hitting ${Math.abs(impactOffset).toFixed(0)}mm off center`;
    else if (Math.abs(dynamicLie - 60) > 3) reason = `Your impact lie angle is ${dynamicLie.toFixed(1)}° (should be ~60°)`;
    else if (Math.abs(swingDirection) > 5) reason = `Your swing direction is ${swingDirection.toFixed(1)}° off target`;
    else reason = 'Your swing path varies significantly between shots';
    
    videoRecommendations.push({
      title: "Balance Points", 
      description: "Improve balance to reduce heel/toe strikes and stabilize swing path",
      url: "https://scratchgc.wistia.com/medias/gn0lpl2dfe",
      reason: reason,
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
    let reason = '';
    if (attackAngle < -5) reason = `Your attack angle is too steep at ${attackAngle.toFixed(1)}°`;
    else if (attackAngle > 0 && clubCategory !== 'driver') reason = `You're hitting up on ${clubCategory} (${attackAngle.toFixed(1)}°)`;
    else if (Math.abs(faceToPath) > 3) reason = `Your face-to-path is ${faceToPath.toFixed(1)}° (should be closer to 0°)`;
    else reason = `Your low point is ${lowPointDistance.toFixed(1)}" behind the ball`;
    
    videoRecommendations.push({
      title: "Ball Position",
      description: "Optimize ball position to improve attack angle and launch conditions",
      url: "https://scratchgc.wistia.com/medias/a02r1906cd",
      reason: reason,
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
      reason: `You're slicing: ${clubPath.toFixed(1)}° out-to-in path with ${faceToPath.toFixed(1)}° open face`,
      priority: 8
    });
  }
  
  // Hook Fix - Hook pattern
  if (clubPath > 5 && faceToPath < -3 && spinAxis < -6 && curve < -20) {
    videoRecommendations.push({
      title: "Hook Fix Drill (Lesson 5)", 
      description: "Control excessive inside path and closed face for straighter shots",
      url: "https://scratchgc.wistia.com/medias/jgxopvfd57",
      reason: `You're hooking: ${clubPath.toFixed(1)}° in-to-out path with ${faceToPath.toFixed(1)}° closed face`,
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
    let reason = '';
    if (Math.abs(lowPointDistance) > 0.5) reason = `Your low point is ${lowPointDistance.toFixed(1)}" from the ball (should be 0-0.5")`;
    else reason = `Your attack angle is ${attackAngle.toFixed(1)}° with low dynamic loft`;
    
    videoRecommendations.push({
      title: "Low Point Distance + Drills (Low Point Lesson 1)",
      description: "Eliminate fat shots and improve ball striking consistency",
      url: "https://scratchgc.wistia.com/medias/6cm1m86qgi",
      reason: reason,
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
      reason: `Your smash factor is ${smashFactor.toFixed(2)} (target: ${clubCategory === 'driver' ? '1.45+' : '1.35+'})`,
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
  
  // Straight Edge Drill - Face angle control
  if (Math.abs(faceAngle) > 2 || (consistency.variances.faceAngle || 0) > 2) {
    videoRecommendations.push({
      title: "Straight Edge Drill (Face Angle – Lesson 2)",
      description: "Drill focused on improving face angle control through consistent setup and awareness",
      url: "https://scratchgc.wistia.com/medias/mpaxz6khcm",
      reason: `Your face angle is ${faceAngle.toFixed(1)}° (should be within ±2°)`,
      priority: 5
    });
  }
  
  // Start Line Punch Drill - Launch direction control
  if (Math.abs(faceAngle) > 1 || Math.abs(launchDirection) > 2 || (smashFactor > 1.3 && Math.abs(launchDirection) > 1)) {
    videoRecommendations.push({
      title: "Start Line Punch Drill (Face Angle – Lesson 3)",
      description: "Punch drill specifically for improving start line control",
      url: "https://scratchgc.wistia.com/medias/hdgpd3m7bd",
      reason: `Your launch direction is ${launchDirection.toFixed(1)}° off target`,
      priority: 5
    });
  }
  
  // P2/P6 Checkpoints - Advanced face control
  if (Math.abs(faceAngle) > 2 || (consistency.variances.faceAngle || 0) > 3) {
    videoRecommendations.push({
      title: "P2/P6 Checkpoints (Face Angle – Lesson 4)",
      description: "Advanced checkpoint system for face control through swing positions",
      url: "https://scratchgc.wistia.com/medias/2ns1sljopx",
      priority: 4
    });
  }
  
  // Grip Matchups - Face and path combinations
  if ((Math.abs(faceAngle) > 2 && Math.abs(curve) > 15) || (Math.abs(clubPath) > 2 && Math.abs(faceAngle) > 2)) {
    videoRecommendations.push({
      title: "Grip Matchups (Face Angle – Lesson 5)",
      description: "Teaches how to match grip to swing style for consistent face control",
      url: "https://scratchgc.wistia.com/medias/1bps8imexk",
      priority: 4
    });
  }
  
  // Forearm Rotation - Advanced face control
  if (Math.abs(faceToPath) > 2 || Math.abs(spinAxis) > 5 || Math.abs(curve) > 15) {
    videoRecommendations.push({
      title: "Forearm Rotation (Face Angle – Lesson 6)",
      description: "Advanced technique for controlling face through impact via forearm rotation",
      url: "https://scratchgc.wistia.com/medias/tgz7pqgzhz",
      reason: `Your face-to-path is ${faceToPath.toFixed(1)}° with ${curve.toFixed(0)}ft curve`,
      priority: 5
    });
  }
  
  // SWING MECHANICS SECTION
  
  // Early Extension Overview - Multiple impact issues
  if (lowPointDistance > 2.5 || (Math.abs(clubPath) > 3 && Math.abs(faceAngle) > 2) || (attackAngle < -3 && dynamicLoft < 18)) {
    videoRecommendations.push({
      title: "Early Extension (Overview)",
      description: "Overview of early extension pattern and its effects on ball striking",
      url: "https://scratchgc.wistia.com/medias/29qy2keo66",
      reason: `Multiple impact issues suggest early extension pattern`,
      priority: 6
    });
  }
  
  // Early Extension Causes - Specific early extension patterns
  if (attackAngle < -3 || lowPointDistance > 2.5 || (consistency.variances.dynamicLoft || 0) > 4) {
    videoRecommendations.push({
      title: "Early Extension Causes",
      description: "Explains root causes of early extension pattern",
      url: "https://scratchgc.wistia.com/medias/24p12cg53q",
      priority: 6
    });
  }
  
  // Basic Anatomy - Fundamental understanding needed
  if (!consistency.isConsistent && (consistency.variances.faceAngle || 0) > 3 && (consistency.variances.clubPath || 0) > 3) {
    videoRecommendations.push({
      title: "Basic Anatomy",
      description: "Fundamental body awareness and swing mechanics",
      url: "https://scratchgc.wistia.com/medias/2go38s944w",
      priority: 3
    });
  }
  
  // Swing Direction - Path vs direction mismatch
  if (Math.abs(swingDirection) > 5 || Math.abs(swingDirection - clubPath) > 4) {
    videoRecommendations.push({
      title: "Swing Direction on TrackMan (Swing Direction – Lesson 1)",
      description: "Explains swing direction metric and its relationship to club path",
      url: "https://scratchgc.wistia.com/medias/67ainfstsh",
      reason: `Your swing direction (${swingDirection.toFixed(1)}°) doesn't match your club path`,
      priority: 5
    });
  }

  // Sort by priority (highest first) and remove duplicates
  const uniqueVideos = videoRecommendations
    .sort((a, b) => b.priority - a.priority)
    .filter((video, index, array) => 
      array.findIndex(v => v.url === video.url) === index
    )
    .map(({ priority, ...video }) => video); // Remove priority from final output
  
  // Return top 1-3 most critical videos only
  return uniqueVideos.slice(0, 3);
};

export const getTextRecommendations = (swings: any[], selectedClub: string = '') => {
  console.log('getTextRecommendations called with:', { swings, selectedClub });
  
  // If no swings data, return default
  if (!swings || swings.length === 0) {
    return `📊 No swing data available. Please upload your TrackMan data photos for analysis.`;
  }

  // Filter out undefined/null swings and ensure they have structured metrics
  const validSwings = swings.filter(swing => {
    return swing && swing.structuredMetrics;
  });

  if (validSwings.length === 0) {
    return "No valid swing data found. Please upload a TrackMan image for analysis.";
  }

  // Get club category for context
  const clubCategory = getClubCategory(selectedClub);
  
  // Analyze consistency across multiple swings
  const consistency = analyzeSwingConsistency(validSwings);
  const primarySwing = validSwings[0]; // Use first valid swing as primary for analysis
  
  // Get structured metrics for the primary swing
  const structuredMetrics = getStructuredMetrics(primarySwing.structuredMetrics || primarySwing.structured_metrics || []);
  
  // Extract metrics using structured format
  const clubPath = getMetricValue(structuredMetrics, 'Club Path') || 0;
  const faceAngle = getMetricValue(structuredMetrics, 'Face Angle') || 0;
  const faceToPath = getMetricValue(structuredMetrics, 'Face to Path') || 0;
  const attackAngle = getMetricValue(structuredMetrics, 'Attack Angle') || 0;
  const spinRate = getMetricValue(structuredMetrics, 'Spin Rate') || 0;
  const launchAngle = getMetricValue(structuredMetrics, 'Launch Angle') || 0;
  const dynamicLoft = getMetricValue(structuredMetrics, 'Dynamic Loft') || 0;
  
  // Build consistency context if multiple swings
  let consistencyNote = '';
  if (validSwings.length > 1) {
    const inconsistentMetrics = Object.entries(consistency.variances)
      .filter(([_, variance]) => variance > 2)
      .map(([metric, variance]) => `${metric} (±${variance.toFixed(1)}°)`)
      .join(', ');
    
    if (inconsistentMetrics) {
      consistencyNote = `\n\n📊 Consistency Check (${validSwings.length} swings):\nYour swing shows some inconsistency in: ${inconsistentMetrics}. This suggests working on your setup and developing a more repeatable swing.\n\n`;
    } else {
      consistencyNote = `\n\n📊 Consistency Check (${validSwings.length} swings):\nGood news! Your swing is quite consistent across multiple shots. This shows you have solid fundamentals.\n\n`;
    }
  }
  
  // Club-specific context and ranges
  let clubSpecificContext = '';
  let outOfRangeIssues: string[] = [];
  
  if (clubCategory === 'driver') {
    clubSpecificContext = `\n🚀 Driver Goals:\nOptimal ranges: Upward strike (+0° to +6°), Straight path (-1° to +3°), Square face (within 1°), Good spin (2000-3000 rpm)\n\n`;
    
    if (attackAngle < 0) outOfRangeIssues.push(`You're hitting down on the driver (${attackAngle.toFixed(1)}°) - try hitting up for more distance`);
    if (Math.abs(faceToPath) > 1) outOfRangeIssues.push(`Your clubface isn't square to your swing path (${faceToPath.toFixed(1)}°) - work on face control`);
    if (spinRate > 3000) outOfRangeIssues.push(`Your ball spin is high (${spinRate} rpm) - try hitting more upward`);
  }
  
  else if (clubCategory === 'woods') {
    clubSpecificContext = `\n🌲 Woods/Hybrids Goals:\nOptimal ranges: Shallow strike (-2° to +2°), Straight path (-1° to +3°), Square face (within 2°), Good spin (3000-4500 rpm)\n\n`;
    
    if (attackAngle < -2 || attackAngle > 2) outOfRangeIssues.push(`Your strike angle (${attackAngle.toFixed(1)}°) is too steep or shallow - aim for a sweeping motion`);
    if (Math.abs(faceToPath) > 2) outOfRangeIssues.push(`Your clubface angle (${faceToPath.toFixed(1)}°) needs work for straighter shots`);
    if (spinRate < 3000 || spinRate > 4500) outOfRangeIssues.push(`Your ball spin (${spinRate} rpm) could be optimized for better distance`);
  }
  
  else if (clubCategory === 'irons') {
    clubSpecificContext = `\n🛠️ Irons Goals:\nOptimal ranges: Downward strike (-4° to -2°), Straight path (-2° to +2°), Square face (within 2°), Good spin (5000-7000 rpm)\n\n`;
    
    if (attackAngle > -2 || attackAngle < -4) outOfRangeIssues.push(`Your strike angle (${attackAngle.toFixed(1)}°) - try hitting down on the ball more for better contact`);
    if (Math.abs(faceToPath) > 2) outOfRangeIssues.push(`Your clubface angle (${faceToPath.toFixed(1)}°) could be straighter for more accurate shots`);
    if (spinRate < 5000 || spinRate > 7000) outOfRangeIssues.push(`Your ball spin (${spinRate} rpm) could be improved for better ball flight`);
  }
  
  else if (clubCategory === 'wedges') {
    clubSpecificContext = `\n⛳ Wedges Goals:\nOptimal ranges: Steep downward strike (-6° to -4°), Straight path (-2° to +2°), Square face (within 2°), High spin (7000-9000 rpm)\n\n`;
    
    if (attackAngle > -4 || attackAngle < -6) outOfRangeIssues.push(`Your strike angle (${attackAngle.toFixed(1)}°) - try hitting down steeper for better wedge contact`);
    if (Math.abs(faceToPath) > 2) outOfRangeIssues.push(`Your clubface angle (${faceToPath.toFixed(1)}°) could be improved for more accurate short shots`);
    if (spinRate < 7000 || spinRate > 9000) outOfRangeIssues.push(`Your ball spin (${spinRate} rpm) could be optimized for better wedge control`);
  }
  
  let rangeIssuesContext = '';
  if (outOfRangeIssues.length > 0) {
    rangeIssuesContext = `\n⚠️ Areas to Improve:\n${outOfRangeIssues.map(issue => `• ${issue}`).join('\n')}\n\n`;
  }
  
  // Specific pattern analysis - Out-to-in with open face (fade/slice pattern)  
  if (clubPath < -2 && faceToPath > 1) {
    return `🧠 Understanding Your Ball Flight${clubSpecificContext}Let me explain what's happening with your swing in simple terms:

**Club Path** is the direction your club is moving when it hits the ball — either to the right, left, or straight toward the target.

**Clubface Angle** is where the clubface is pointing when it hits the ball.

The relationship between these two determines where your ball starts and how it curves.${consistencyNote}${rangeIssuesContext}**What's Happening in Your Swing:**

Your club is moving ${Math.abs(clubPath).toFixed(1)}° to the left of your target (called an "outside-in" swing path).

Your clubface is pointing ${Math.abs(faceAngle).toFixed(1)}° closed to the target, but ${faceToPath.toFixed(1)}° open compared to where your club is swinging.

🌀 This creates a **fade pattern** — your ball starts slightly left and curves back to the right.

**What to Work On: Getting a Straighter Swing Path**

Your clubface control is actually pretty good, but the outside-in swing path is causing the fade. To hit straighter shots (or even draws), we want to get your club swinging more straight or slightly to the right.

✅ **Simple Drills to Try:**

**Alignment Stick Drill:**
Place a stick or club on the ground pointing slightly right of your target.
Practice swinging along this line to feel an inside-out path.

**"Swing to Right Field" Feel:**
Pick a target to the right of where you actually want the ball to go.
Practice swinging toward that target to encourage a straighter path.

**Setup Check:**
Make sure your feet, hips, and shoulders aren't aimed left of your target — this often causes the outside-in swing naturally.

🎯 **Goal:**
Move your swing path from ${clubPath.toFixed(1)}° closer to straight (0°) or even slightly to the right (+1 to +2°).
Keep your clubface control as it is — you're doing well there!`;
  }
  
  // Additional patterns based on video context
  
  // Strong slice pattern
  if (clubPath < -2 && faceToPath > 3) {
    return `🌪️ Strong Slice Pattern Detected${clubSpecificContext}${consistencyNote}${rangeIssuesContext}Your data shows a strong slice pattern:
- Swing Path: ${clubPath.toFixed(1)}° (swinging left)
- Clubface: ${faceToPath.toFixed(1)}° (open to your swing)

This creates a lot of left-to-right curve. Here's what to focus on:

**Priority Actions:**
1. **Grip Check** - Try strengthening your lead hand (show more knuckles)
2. **Setup Position** - Check that your shoulders aren't aimed left
3. **Swing Path** - Practice swinging more to the right
4. **Release** - Work on rotating your hands through impact

**Most Important:** Start with your grip and setup first, then work on swing path.`;
  }
  
  // Hook pattern
  if (clubPath > 5 && faceToPath < -3) {
    return `🪝 Strong Hook Pattern Detected${clubSpecificContext}${consistencyNote}${rangeIssuesContext}Your data shows a strong hook/draw:
- Swing Path: ${clubPath.toFixed(1)}° (swinging right)
- Clubface: ${faceToPath.toFixed(1)}° (closed to your swing)

This creates too much right-to-left curve. Here's what to focus on:

**Priority Actions:**
1. **Grip Check** - Try weakening both hands slightly (show fewer knuckles)
2. **Setup** - Check your alignment and ball position
3. **Release** - Focus on keeping hands quieter through impact
4. **Swing Path** - Work on a more neutral swing direction

**Most Important:** Start with grip adjustments while keeping your good swing path.`;
  }
  
  // Inconsistency focus
  if (validSwings.length > 1 && !consistency.isConsistent) {
    const mostInconsistent = Object.entries(consistency.variances)
      .sort(([,a], [,b]) => b - a)[0];
    
    if (mostInconsistent) {
      return `🎯 Consistency is Key${clubSpecificContext}${consistencyNote}${rangeIssuesContext}Your biggest area for improvement is consistency in ${mostInconsistent[0]} (varies by ±${mostInconsistent[1].toFixed(1)}°).

**What This Means:**
Your swing changes quite a bit from shot to shot, which makes it hard to predict where the ball will go.

**Focus Areas:**
1. **Setup Routine** - Do the same thing before every shot
2. **Tempo** - Keep the same rhythm on every swing  
3. **Practice** - Work on repeating the same feel
4. **Fundamentals** - Get your posture, grip, and alignment consistent

**Key Point:** Right now, focus more on making the same swing every time rather than making big changes to your technique.`;
    }
  }
  
  // Default comprehensive analysis with club-specific context
  return `📊 Your Swing Summary${clubSpecificContext}${consistencyNote}${rangeIssuesContext}Based on your swing data, here are the key things to know:

🎯 **Ball Flight Pattern:** Your current swing typically produces ${clubPath < 0 ? 'fade (left-to-right)' : clubPath > 2 ? 'draw (right-to-left)' : 'relatively straight'} shots.

🔧 **Main Focus Areas:**
1. **Swing Direction:** Currently ${clubPath.toFixed(1)}° - ${Math.abs(clubPath) > 2 ? 'work on getting this more straight' : 'this looks pretty good'}
2. **Clubface Control:** Face angle is ${faceToPath.toFixed(1)}° relative to your swing - ${Math.abs(faceToPath) > 2 ? 'work on squaring the face' : 'this is in good shape'}
3. **Contact Quality:** Continue working on solid, consistent contact

💡 **Simple Practice Tips:**
• Focus on making the same swing every time
• Work on your setup routine and fundamentals
• Practice with a consistent tempo and rhythm${swings.length > 1 ? '\n• Use multiple shots to check your consistency patterns' : ''}

Keep up the great work! Small improvements in consistency will make a big difference in your game.`;
};