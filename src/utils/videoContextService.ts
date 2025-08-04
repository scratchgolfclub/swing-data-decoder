import { getStructuredMetrics, getMetricValue, type StructuredMetric } from './structuredMetricsHelper';

interface VideoContext {
  id: string;
  title: string;
  link: string;
  category: string;
  relatedDataPoints: string[];
  recommendWhen: string[];
  contextSummary: string;
}

const METRIC_NAME_MAPPING: Record<string, string> = {
  'clubSpeed': 'Club Speed',
  'ballSpeed': 'Ball Speed',
  'smashFactor': 'Smash Factor',
  'total': 'Total Distance',
  'carry': 'Carry Distance',
  'side': 'Side',
  'attackAngle': 'Attack Angle',
  'clubPath': 'Club Path',
  'faceAngle': 'Face Angle',
  'faceToPath': 'Face to Path',
  'launchAngle': 'Launch Angle',
  'launchDirection': 'Launch Direction',
  'dynamicLoft': 'Dynamic Loft',
  'spinLoft': 'Spin Loft',
  'spinRate': 'Spin Rate',
  'spinAxis': 'Spin Axis',
  'curve': 'Curve',
  'lowPoint': 'Low Point Distance',
  'swingDirection': 'Swing Direction',
  'dynamicLie': 'Dynamic Lie',
  'impactHeight': 'Impact Height',
  'impactOffset': 'Impact Offset'
};

// This contains all the video data from the Context page
export const VIDEO_CONTEXTS: VideoContext[] = [
  // Setup for Success Videos
  {
    id: 'golf-posture',
    title: 'Golf Posture',
    link: 'https://scratchgc.wistia.com/medias/5u6i7fhjfk',
    category: 'Setup for Success',
    relatedDataPoints: ['Attack Angle', 'Swing Direction', 'Club Path', 'Low Point Distance', 'Impact Height'],
    recommendWhen: [
      'Attack Angle is positive with irons/wedges (should be negative)',
      'Swing Direction > ±4° (over-the-top or stuck inside)',
      'Club Path varies significantly across multiple uploads',
      'Low Point Distance is behind the ball (> 0.5" A)',
      'Impact Height is highly negative (< –5 mm)'
    ],
    contextSummary: 'Posture sets the foundation for consistent swing direction, attack angle, and low point. This video should be recommended when the user struggles to deliver a consistent downward strike or shows path inconsistency across multiple uploads.'
  },
  {
    id: 'balance-points',
    title: 'Balance Points',
    link: 'https://scratchgc.wistia.com/medias/gn0lpl2dfe',
    category: 'Setup for Success',
    relatedDataPoints: ['Club Path', 'Swing Direction', 'Low Point Distance', 'Impact Offset', 'Dynamic Lie'],
    recommendWhen: [
      'Club Path varies more than ±3° across swings',
      'Low Point Distance fluctuates between A and B (inconsistent strike pattern)',
      'Impact Offset is > 5 mm toe or heel',
      'Dynamic Lie is more than ±3° from neutral',
      'Swing Direction varies more than ±5° across swings'
    ],
    contextSummary: 'Imbalanced posture often leads to heel/toe strikes and erratic path/lie angles. Recommend this video when inconsistencies in path, low point, and strike location suggest poor balance or weight distribution.'
  },
  {
    id: 'posture-balance-checkpoints',
    title: 'Posture and Balance Checkpoints',
    link: 'https://scratchgc.wistia.com/medias/j1j0a6hlt1',
    category: 'Setup for Success',
    relatedDataPoints: ['Club Path', 'Dynamic Loft', 'Low Point Distance', 'Attack Angle', 'Face to Path'],
    recommendWhen: [
      'Dynamic Loft varies by > 4° across sessions',
      'Attack Angle is positive with short irons',
      'Club Path and Face to Path relationship is unstable across swings',
      'Low Point Distance is inconsistent (behind ball, then ahead)'
    ],
    contextSummary: 'Reinforces proper alignment and stance width to return to impact more consistently. Useful when setup errors cause fluctuating path/face relationships or low point issues.'
  },
  {
    id: 'grip-trail-hand',
    title: 'Grip Checkpoints – Trail Hand',
    link: 'https://scratchgc.wistia.com/medias/mqjewf6aqo',
    category: 'Setup for Success',
    relatedDataPoints: ['Face Angle', 'Face to Path', 'Smash Factor', 'Launch Direction'],
    recommendWhen: [
      'Face to Path > +2° or < –2° (hook or slice patterns)',
      'Face Angle varies more than ±2° across swings',
      'Smash Factor < 1.4 with driver, < 1.3 with irons',
      'Launch Direction is consistently left or right > 3°'
    ],
    contextSummary: 'Poor trail hand grip often leads to unstable face control. Recommend this video when user data shows inconsistent face angles and poor energy transfer (low smash).'
  },
  {
    id: 'grip-lead-hand',
    title: 'Grip Checkpoints – Lead Hand',
    link: 'https://scratchgc.wistia.com/medias/s9lx5jqzss',
    category: 'Setup for Success',
    relatedDataPoints: ['Face Angle', 'Face to Path', 'Spin Axis', 'Launch Direction'],
    recommendWhen: [
      'Spin Axis is consistently > +5° (slice) or < –5° (hook)',
      'Face to Path is consistently > ±2°',
      'Face Angle is inconsistent across uploads',
      'Launch Direction is misaligned relative to face angle (face control issue)'
    ],
    contextSummary: 'Improper lead hand grip often leads to large curvature or poor start direction. Recommend for players with erratic face angles or high curvature values.'
  },
  {
    id: 'ball-position',
    title: 'Ball Position',
    link: 'https://scratchgc.wistia.com/medias/a02r1906cd',
    category: 'Setup for Success',
    relatedDataPoints: ['Attack Angle', 'Launch Angle', 'Low Point Distance', 'Club Path', 'Face to Path'],
    recommendWhen: [
      'Attack Angle is steep (< –5°) or ascending with short irons',
      'Launch Angle is too low/high for club (e.g., 7i LA <12° or >20°)',
      'Low Point Distance is behind ball (> 0.5" A)',
      'Face to Path is erratic or extreme (> ±3°)'
    ],
    contextSummary: 'Ball position influences angle of attack and launch. Recommend when AoA, low point, or launch angle indicate ball is too far forward or back.'
  },
  {
    id: 'alignment',
    title: 'Alignment',
    link: 'https://scratchgc.wistia.com/medias/k6fn07gug6',
    category: 'Setup for Success',
    relatedDataPoints: ['Club Path', 'Face to Path', 'Launch Direction', 'Side / Side Total'],
    recommendWhen: [
      'Club Path shows consistent directionality mismatch (e.g., path right, ball starts left)',
      'Launch Direction is not aligned with path/face aim',
      'Side / Side Total > 10 ft despite good face/path values',
      'Face to Path is neutral but user still misses target line'
    ],
    contextSummary: 'Alignment issues cause directional misses even when swing metrics are good. Recommend when user has a square face-to-path but still pushes/pulls.'
  },
  {
    id: 'foot-orientation',
    title: 'Foot Orientation',
    link: 'https://scratchgc.wistia.com/medias/v23r3wqwdr',
    category: 'Setup for Success',
    relatedDataPoints: ['Club Path', 'Swing Direction', 'Dynamic Lie'],
    recommendWhen: [
      'Club Path is extreme (< –4° or > +4°)',
      'Swing Direction > ±5°',
      'Dynamic Lie is high (> +5°) (often from rotation restriction or stance issues)'
    ],
    contextSummary: 'Foot flare affects rotational mobility and alignment. Recommend when path or lie angles suggest restrictions or setup imbalance.'
  },
  // Club Path & Ball Flight Laws Videos
  {
    id: 'club-path-lesson-1',
    title: 'Club Path on TrackMan (Lesson 1)',
    link: 'https://scratchgc.wistia.com/medias/ufxhjffk9q',
    category: 'Club Path & Ball Flight Laws',
    relatedDataPoints: ['Club Path', 'Face Angle', 'Face to Path', 'Spin Axis', 'Curve'],
    recommendWhen: [
      'Club Path and Face Angle both have consistent directional bias (both right or both left) → leads to pushes/pulls',
      'Face to Path > ±4° → excessive curvature (slice/hook)',
      'Spin Axis > ±6° or Curve > 20 ft',
      'Multiple uploads show inconsistent Club Path values (>5° variance)'
    ],
    contextSummary: 'Introduces club path and how its relationship to face angle determines shot shape. Teaches the 2:1 path-to-face ratio concept for consistent curvature. Ideal for users with unclear shot shape patterns or trouble understanding why their ball curves the way it does.'
  },
  {
    id: 'ball-flight-laws-lesson-2',
    title: 'Ball Flight Laws (Lesson 2)',
    link: 'https://scratchgc.wistia.com/medias/m4e3w872wt',
    category: 'Club Path & Ball Flight Laws',
    relatedDataPoints: ['Face Angle', 'Club Path', 'Face to Path', 'Launch Direction', 'Spin Axis'],
    recommendWhen: [
      'Face to Path > ±3° and user doesn\'t understand shot shape',
      'Launch Direction and Spin Axis mismatch (e.g. starts right but spins left)',
      'User uploads several shots with inconsistent curve directions',
      'Curve is present but Face and Path both appear neutral'
    ],
    contextSummary: 'Provides a visual explanation of face and path relationships. Helps players understand how shot shapes (push, pull, slice, draw) are created. Best for players seeing confusing ball flights despite consistent data or struggling with visualizing how numbers affect ball behavior.'
  },
  {
    id: 'touraim-drill-lesson-3',
    title: 'TourAim Drill (Lesson 3)',
    link: 'https://scratchgc.wistia.com/medias/bsf7uxod06',
    category: 'Club Path & Ball Flight Laws',
    relatedDataPoints: ['Club Path', 'Face to Path', 'Launch Direction', 'Smash Factor'],
    recommendWhen: [
      'Club Path is consistently negative or positive > ±4°',
      'Face to Path relationship is inconsistent (varies between negative and positive)',
      'Player shows signs of coming over the top or dumping under (Swing Direction > ±5°)',
      'User struggles with straight-line contact or starting the ball on intended line'
    ],
    contextSummary: 'Drill-based approach for training a consistent inside path or outside path based on desired ball shape. Great for building a repeatable delivery pattern and helping users match their face and path over time. Recommend especially when user uploads multiple shots with erratic start lines or path swings wildly.'
  },
  {
    id: 'slice-fix-lesson-4',
    title: 'Slice Fix Drill – 10 and 4 (Lesson 4)',
    link: 'https://scratchgc.wistia.com/medias/t9v6ljw08v',
    category: 'Club Path & Ball Flight Laws',
    relatedDataPoints: ['Club Path', 'Face to Path', 'Face Angle', 'Spin Axis', 'Curve'],
    recommendWhen: [
      'Club Path is negative (< –2°) and Face to Path is strongly positive (> +3°) → classic slice pattern',
      'Spin Axis > +6° and Curve > 20 ft to the right',
      'Multiple uploads show consistent left path and open face (face angle > 0°, path < 0°)',
      'Launch Direction is consistently right and ball curves farther right'
    ],
    contextSummary: 'Designed specifically for players fighting a slice. Teaches exaggerated in-to-out club path and forearm release (toe rotation). Helps shift path to positive and square the face through impact. Recommend when user shows strong slice ball flight patterns in data.'
  },
  {
    id: 'hook-fix-lesson-5',
    title: 'Hook Fix Drill (Lesson 5)',
    link: 'https://scratchgc.wistia.com/medias/jgxopvfd57',
    category: 'Club Path & Ball Flight Laws',
    relatedDataPoints: ['Club Path', 'Face Angle', 'Face to Path', 'Spin Axis', 'Curve'],
    recommendWhen: [
      'Club Path is highly positive (> +5°) and Face to Path is strongly negative (< –3°)',
      'Spin Axis < –6° and Curve > 20 ft left',
      'Hook ball flight is common in multiple uploads',
      'Face angle shows inconsistency (alternating open/closed) and Smash Factor fluctuates with path direction'
    ],
    contextSummary: 'Aimed at players who struggle with hooks due to an overly closed face and too much inside path. Promotes a more passive release to hold the face open longer through impact while maintaining a controlled path. Recommend for players who see large leftward curvature or overdraw patterns.'
  },
  // Angle of Attack & Low Point Series
  {
    id: 'angle-of-attack-lesson-1',
    title: 'Angle of Attack on TrackMan (Lesson 1)',
    link: 'https://scratchgc.wistia.com/medias/wdbfqn6l5u',
    category: 'Angle of Attack & Low Point',
    relatedDataPoints: ['Attack Angle', 'Club Path', 'Spin Loft', 'Dynamic Loft', 'Face to Path'],
    recommendWhen: [
      'Angle of attack is positive with irons or negative with driver',
      'Angle of attack varies > 3° across multiple swings',
      'Spin loft exceeds ideal ranges (e.g. >16° driver, >18° irons)',
      'Club path shifts with attack angle, leading to face-to-path variability'
    ],
    contextSummary: 'Explains how angle of attack affects ball flight and distance. Essential for players with incorrect AoA for their club type or inconsistent attack angles across swings.'
  },
  {
    id: 'low-point-distance-drills',
    title: 'Low Point Distance + Drills (Low Point Lesson 1)',
    link: 'https://scratchgc.wistia.com/medias/6cm1m86qgi',
    category: 'Angle of Attack & Low Point',
    relatedDataPoints: ['Attack Angle', 'Dynamic Loft', 'Spin Loft', 'Carry', 'Launch Angle'],
    recommendWhen: [
      'Steep AOA and low dynamic loft suggest frequent fat shots',
      'High spin + low carry suggest poor low-point control',
      'Low point control varies significantly between uploads',
      'AOA swing-to-swing variance > 3°'
    ],
    contextSummary: 'Teaches proper low point control to eliminate fat shots and improve ball striking consistency. Critical for players struggling with ground contact issues.'
  },
  {
    id: 'low-point-driver-drill',
    title: 'Low Point with Driver Drill',
    link: 'https://scratchgc.wistia.com/medias/rku7xnxyci',
    category: 'Angle of Attack & Low Point',
    relatedDataPoints: ['Attack Angle', 'Dynamic Loft', 'Spin Rate', 'Carry', 'Launch Angle'],
    recommendWhen: [
      'Driver angle of attack < 0°',
      'Carry distance is short despite club speed',
      'Launch angle < 9° or > 16°',
      'Dynamic loft outside of 11°–16° for driver',
      'Spin rate > 3000 rpm (potentially from downward strike)'
    ],
    contextSummary: 'Specific drill for driver to promote upward strike and maximize distance. Essential for players hitting down on driver or struggling with carry distance.'
  },
  {
    id: 'dynamic-loft-kpis',
    title: 'Dynamic Loft (KPIs – Lesson 4)',
    link: 'https://scratchgc.wistia.com/medias/yqsx8hrli5',
    category: 'Dynamic Loft/Spin Loft',
    relatedDataPoints: ['Dynamic Loft', 'Attack Angle', 'Spin Loft', 'Ball Speed', 'Carry'],
    recommendWhen: [
      'Dynamic loft is too high for the club (e.g. >24° with 7i)',
      'Spin loft > 20° or < 10°',
      'Player has a shallow AOA and high dynamic loft (scooping pattern)',
      'Carry distance suffers despite club speed'
    ],
    contextSummary: 'Explains dynamic loft and its impact on ball flight. Key for players with poor compression or distance issues despite good swing speed.'
  },
  {
    id: 'dynamic-loft-shaft-lean',
    title: 'Dynamic Loft – Shaft Lean Drill (Lesson 5)',
    link: 'https://scratchgc.wistia.com/medias/sxzgttz5t7',
    category: 'Dynamic Loft/Spin Loft',
    relatedDataPoints: ['Dynamic Loft', 'Spin Loft', 'Attack Angle', 'Club Path', 'Face to Path'],
    recommendWhen: [
      'Dynamic loft is inconsistent across uploads',
      'High dynamic loft with short carry distance',
      'Smash factor is low despite center strikes',
      'Poor compression or excessive spin loft (>20° with irons)'
    ],
    contextSummary: 'Teaches proper shaft lean and compression for better ball striking. Essential for players struggling with consistent impact conditions.'
  },
  {
    id: 'club-speed-kpis',
    title: 'Club Speed (KPIs – Lesson 1)',
    link: 'https://scratchgc.wistia.com/medias/qh5g3jwy0j',
    category: 'Carry Distance Optimization',
    relatedDataPoints: ['Club Speed', 'Ball Speed', 'Smash Factor', 'Carry'],
    recommendWhen: [
      'Club speed is well below average (e.g. <85 mph with driver)',
      'Carry distance does not scale with club speed',
      'Large swing-to-swing club speed variance',
      'Player interested in increasing distance through speed training'
    ],
    contextSummary: 'Focuses on increasing club speed for more distance. Perfect for players with below-average speeds or those wanting to add distance.'
  },
  {
    id: 'ball-speed-kpis',
    title: 'Ball Speed (KPIs – Lesson 2)',
    link: 'https://scratchgc.wistia.com/medias/0w0yd82dp5',
    category: 'Carry Distance Optimization',
    relatedDataPoints: ['Ball Speed', 'Club Speed', 'Smash Factor', 'Carry', 'Launch Angle'],
    recommendWhen: [
      'Ball speed varies >5 mph between swings',
      'Carry distance lags behind similar club speed ranges',
      'Smash factor is stable but ball speed is still underperforming',
      'Ball speed doesn\'t align with expected distance profile'
    ],
    contextSummary: 'Teaches how to optimize ball speed for maximum distance. Key for players with inconsistent ball speeds or distance issues.'
  },
  {
    id: 'smash-factor-kpis',
    title: 'Smash Factor (KPIs – Lesson 3)',
    link: 'https://scratchgc.wistia.com/medias/d7olpgqvqj',
    category: 'Carry Distance Optimization',
    relatedDataPoints: ['Smash Factor', 'Ball Speed', 'Club Speed', 'Dynamic Loft', 'Spin Loft'],
    recommendWhen: [
      'Smash factor <1.45 (driver) or <1.35 (irons)',
      'Player has solid swing speed but poor ball speed',
      'Carry is underperforming relative to smash potential',
      'High dynamic loft with low smash indicates glancing strike'
    ],
    contextSummary: 'Focuses on maximizing energy transfer from club to ball. Essential for players with good speed but poor efficiency.'
  },
  {
    id: 'face-angle-trackman',
    title: 'Face Angle on TrackMan (Lesson 1)',
    link: 'https://scratchgc.wistia.com/medias/jic79uxex9',
    category: 'Face Angle Control',
    relatedDataPoints: ['Face Angle', 'Club Path', 'Face to Path', 'Launch Direction', 'Curve', 'Spin Axis'],
    recommendWhen: [
      'Face angle is outside ±2.0° across multiple swings',
      'Launch direction is misaligned with target despite good club path',
      'Face angle direction is inconsistent across uploads (> 3° variability)',
      'Player has similar path numbers but inconsistent curvature → indicates face control issue'
    ],
    contextSummary: 'Teaches face control fundamentals for consistent ball starting direction. Essential for players with erratic face angles or launch direction issues.'
  },
  // Additional Face Angle Control Videos
  {
    id: 'straight-edge-drill',
    title: 'Straight Edge Drill (Face Angle – Lesson 2)',
    link: 'https://scratchgc.wistia.com/medias/mpaxz6khcm',
    category: 'Face Angle Control',
    relatedDataPoints: ['Face Angle'],
    recommendWhen: [
      'Face angle is consistently more than ±2° offline',
      'Start line variability is high despite consistent path'
    ],
    contextSummary: 'Drill focused on improving face angle control through consistent setup and awareness. Helps players develop better face control when path is consistent but face varies.'
  },
  {
    id: 'start-line-punch-drill',
    title: 'Start Line Punch Drill (Face Angle – Lesson 3)',
    link: 'https://scratchgc.wistia.com/medias/hdgpd3m7bd',
    category: 'Face Angle Control',
    relatedDataPoints: ['Face Angle', 'Launch Direction'],
    recommendWhen: [
      'Face angle is greater than ±1°',
      'Launch direction is outside ±2°',
      'Smash factor is stable but ball starts offline'
    ],
    contextSummary: 'Punch drill specifically for improving start line control. Excellent when players have good contact (smash factor) but struggle with directional control.'
  },
  {
    id: 'p2-p6-checkpoints',
    title: 'P2/P6 Checkpoints (Face Angle – Lesson 4)',
    link: 'https://scratchgc.wistia.com/medias/2ns1sljopx',
    category: 'Face Angle Control',
    relatedDataPoints: ['Face Angle'],
    recommendWhen: [
      'Face angle is more than ±2°',
      'Video analysis shows face control issues through takeaway or downswing checkpoints'
    ],
    contextSummary: 'Advanced checkpoint system for face control through swing positions. Ideal for players who need positional awareness to improve face angle consistency.'
  },
  {
    id: 'grip-matchups',
    title: 'Grip Matchups (Face Angle – Lesson 5)',
    link: 'https://scratchgc.wistia.com/medias/1bps8imexk',
    category: 'Face Angle Control',
    relatedDataPoints: ['Face Angle', 'Club Path'],
    recommendWhen: [
      'Face angle is closed or open >2° with inconsistent ball flight',
      'Club path and face angle combination results in large curvatures'
    ],
    contextSummary: 'Teaches how to match grip to swing style for consistent face control. Essential when face and path combinations create unpredictable ball flights.'
  },
  {
    id: 'forearm-rotation',
    title: 'Forearm Rotation (Face Angle – Lesson 6)',
    link: 'https://scratchgc.wistia.com/medias/tgz7pqgzhz',
    category: 'Face Angle Control',
    relatedDataPoints: ['Face Angle', 'Club Path', 'Spin Axis'],
    recommendWhen: [
      'Face-to-path is >2°',
      'Spin axis is >5° left or right',
      'Curve is greater than 15 feet'
    ],
    contextSummary: 'Advanced technique for controlling face through impact via forearm rotation. Perfect for players with large face-to-path mismatches and excessive curve.'
  },
  // Early Extension Series
  {
    id: 'early-extension-overview',
    title: 'Early Extension (Overview)',
    link: 'https://scratchgc.wistia.com/medias/29qy2keo66',
    category: 'Swing Mechanics',
    relatedDataPoints: ['Low Point Distance', 'Attack Angle', 'Face Angle', 'Club Path'],
    recommendWhen: [
      'Low point is too far behind the ball (>2.5 in A)',
      'Face and path are inconsistent across swings',
      'Angle of attack is steep (e.g., < -3°) with contact issues'
    ],
    contextSummary: 'Overview of early extension pattern and its effects on ball striking. Recommend when multiple metrics suggest inconsistent impact position.'
  },
  {
    id: 'early-extension-causes',
    title: 'Early Extension Causes',
    link: 'https://scratchgc.wistia.com/medias/24p12cg53q',
    category: 'Swing Mechanics',
    relatedDataPoints: ['Attack Angle', 'Face Angle', 'Low Point', 'Dynamic Loft'],
    recommendWhen: [
      'Steep angle of attack (< -3°)',
      'Low point behind ball (>2.5 in A)',
      'Inconsistent dynamic loft or contact height'
    ],
    contextSummary: 'Explains root causes of early extension pattern. Essential for players showing steep attack angles and poor low point control.'
  },
  {
    id: 'basic-anatomy',
    title: 'Basic Anatomy',
    link: 'https://scratchgc.wistia.com/medias/2go38s944w',
    category: 'Swing Mechanics',
    relatedDataPoints: ['Face Angle', 'Club Path', 'Attack Angle'],
    recommendWhen: [
      'Player has multiple erratic metrics and struggles with physical awareness',
      'Face and path are erratic with no pattern'
    ],
    contextSummary: 'Fundamental body awareness and swing mechanics. Best for beginners or players with completely erratic swing data across all metrics.'
  },
  {
    id: 'swing-direction-lesson-1',
    title: 'Swing Direction on TrackMan (Swing Direction – Lesson 1)',
    link: 'https://scratchgc.wistia.com/medias/67ainfstsh',
    category: 'Swing Mechanics',
    relatedDataPoints: ['Swing Direction', 'Club Path', 'Attack Angle'],
    recommendWhen: [
      'Swing direction is more than ±5°',
      'Club path is significantly different than expected based on swing direction',
      'Face-to-path doesn\'t match curvature'
    ],
    contextSummary: 'Explains swing direction metric and its relationship to club path. Important for understanding why club path and intended direction don\'t match.'
  }
];

// Helper function to find video by URL
export const findVideoByUrl = (url: string): VideoContext | undefined => {
  return VIDEO_CONTEXTS.find(video => video.link === url);
};

// Helper function to get video recommendations by matching URLs
export const getVideosByUrls = (urls: string[]) => {
  return urls.map(url => {
    const videoContext = findVideoByUrl(url);
    if (videoContext) {
      return {
        title: videoContext.title,
        description: videoContext.contextSummary,
        url: videoContext.link
      };
    }
    return null;
  }).filter(Boolean);
};

// Helper function to evaluate condition with structured metrics
export const evaluateRecommendCondition = (condition: string, metrics: StructuredMetric[]): boolean => {
  // Parse common condition patterns and check against structured metrics
  // Examples: "Club Path is negative (< –2°)" or "Smash Factor < 1.4 with driver"
  
  const numericPatterns = [
    /(\w+[\w\s]*)\s*([<>]=?|is)\s*(positive|negative|[+-]?\d*\.?\d+)([°%\s\w]*)/i,
    /(\w+[\w\s]*)\s*>\s*[±]?(\d+\.?\d*)([°%\s\w]*)/i,
    /(\w+[\w\s]*)\s*<\s*[±]?(\d+\.?\d*)([°%\s\w]*)/i,
    /(\w+[\w\s]*)\s*varies.*>.*(\d+\.?\d*)([°%\s\w]*)/i
  ];

  for (const pattern of numericPatterns) {
    const match = condition.match(pattern);
    if (match) {
      const metricName = match[1].trim();
      const operator = match[2] || '';
      const value = match[3];
      
      // Map metric name to structured format
      const structuredName = METRIC_NAME_MAPPING[metricName] || metricName;
      const metricValue = getMetricValue(metrics, structuredName);
      
      if (metricValue !== null) {
        if (value === 'positive' && metricValue > 0) return true;
        if (value === 'negative' && metricValue < 0) return true;
        
        const numValue = parseFloat(value);
        if (!isNaN(numValue)) {
          if (operator.includes('<') && metricValue < numValue) return true;
          if (operator.includes('>') && metricValue > numValue) return true;
        }
      }
    }
  }
  
  return false;
};

// Function to get video recommendations based on swing data
export const getVideoRecommendations = (swingData: any[]): VideoContext[] => {
  const recommendations: VideoContext[] = [];
  
  if (!swingData || swingData.length === 0) return recommendations;
  
  // Get latest swing data - handle both raw swing objects and structured data
  const latestSwing = swingData[0];
  const metrics = getStructuredMetrics(latestSwing.structuredMetrics || latestSwing.structured_metrics || latestSwing || {});
  
  // Check each video's recommendation conditions
  for (const video of VIDEO_CONTEXTS) {
    let recommendationScore = 0;
    
    for (const condition of video.recommendWhen) {
      if (evaluateRecommendCondition(condition, metrics)) {
        recommendationScore++;
      }
    }
    
    // If any conditions match, recommend the video (lowered threshold)
    if (recommendationScore > 0) {
      recommendations.push(video);
    }
  }
  
  // Sort by relevance (number of matching conditions)
  return recommendations.sort((a, b) => {
    const scoreA = a.recommendWhen.filter(condition => 
      evaluateRecommendCondition(condition, metrics)
    ).length;
    const scoreB = b.recommendWhen.filter(condition => 
      evaluateRecommendCondition(condition, metrics)
    ).length;
    return scoreB - scoreA;
  }).slice(0, 6); // Limit to top 6 videos
};