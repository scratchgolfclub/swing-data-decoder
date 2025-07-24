import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

interface VideoContext {
  id: string;
  title: string;
  link: string;
  category: string;
  relatedDataPoints: string[];
  recommendWhen: string[];
  contextSummary: string;
}

const Context = () => {
  const [videoContexts, setVideoContexts] = useState<VideoContext[]>([
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
        'Player has similar path numbers but inconsistent curvature → indicates face control issue',
        'Face angle and curve direction don\'t match expected flight'
      ],
      contextSummary: 'Teaches what face angle is, how it controls 80% of launch direction, and how it interacts with club path to shape shots. Good for players struggling with start line consistency or confused by face-to-path effects.'
    },
    {
      id: 'straight-line-punch-drill',
      title: 'Straight Line Punch Drill (Lesson 2)',
      link: 'https://scratchgc.wistia.com/medias/jv54feuq4x',
      category: 'Face Angle Control',
      relatedDataPoints: ['Face Angle', 'Launch Direction', 'Face to Path', 'Dynamic Loft'],
      recommendWhen: [
        'Face angle has high variance across swings (> 3° difference)',
        'Launch direction is inconsistent swing to swing',
        'Dynamic loft is fluctuating, suggesting face angle and impact variability',
        'Path is stable but start lines vary → face angle issue'
      ],
      contextSummary: 'Simple drill for stabilizing face angle at impact using controlled punch shots. Helps players who struggle to start the ball online even with good mechanics. Great early step in face control training.'
    },
    {
      id: 'stick-drill-start-line',
      title: 'Stick Drill for Start Line (Lesson 3)',
      link: 'https://scratchgc.wistia.com/medias/z8ejy46d57',
      category: 'Face Angle Control',
      relatedDataPoints: ['Face Angle', 'Launch Direction', 'Spin Axis', 'Curve'],
      recommendWhen: [
        'User has consistent face angle but curve direction still inconsistent → suggests poor alignment or visual reference',
        'Face angle is inside ±2°, but launch is still off target',
        'Spin axis is small, but start lines are off (→ visual/face setup issue)',
        'Multiple uploads show erratic start lines despite similar swing metrics'
      ],
      contextSummary: 'Alignment-based drill for controlling face orientation at address and impact. Best for users whose swing numbers look neutral but start lines and shot directions are still inconsistent.'
    },
    {
      id: 'delivery-face-matching',
      title: 'Delivery & Face Matching (Lesson 4)',
      link: 'https://scratchgc.wistia.com/medias/hqjqm74t0q',
      category: 'Face Angle Control',
      relatedDataPoints: ['Face Angle', 'Club Path', 'Face to Path', 'Spin Loft', 'Curve', 'Spin Axis', 'Height', 'Dynamic Loft'],
      recommendWhen: [
        'Club path is neutral but curvature is inconsistent',
        'Spin loft or dynamic loft is erratic (→ face control or delivery issue)',
        'Face-to-path varies drastically between swings',
        'User sees major changes in peak height or land angle with similar swing speeds'
      ],
      contextSummary: 'Focuses on syncing face angle and delivery dynamics. Useful for players whose swing speed and path are consistent but results vary — especially in terms of trajectory, curvature, or height.'
    },
    {
      id: 'wrist-angles-face-control',
      title: 'Wrist Angles for Face Control (Lesson 5)',
      link: 'https://scratchgc.wistia.com/medias/56rq5hruj2',
      category: 'Face Angle Control',
      relatedDataPoints: ['Face Angle', 'Face to Path', 'Dynamic Loft', 'Spin Loft', 'Height', 'Curve'],
      recommendWhen: [
        'Face angle shifts > 3° with similar club path → indicates wrist instability',
        'Spin loft values vary across swings despite consistent club speed → suggests inconsistent impact geometry',
        'Launch height fluctuates by > 15 ft across uploads',
        'Face to path alternates from open to closed → inconsistent face rotation'
      ],
      contextSummary: 'Advanced video focused on how wrist angles affect face angle, dynamic loft, and spin. Best for skilled players or instructors analyzing face delivery issues across multiple metrics.'
    }
  ]);

  const [editingVideo, setEditingVideo] = useState<string | null>(null);
  const [editingSummary, setEditingSummary] = useState<string>('');

  const handleEditSummary = (videoId: string, newSummary: string) => {
    setVideoContexts(prev => prev.map(video => 
      video.id === videoId ? { ...video, contextSummary: newSummary } : video
    ));
    setEditingVideo(null);
  };

  const groupedVideos = videoContexts.reduce((acc, video) => {
    if (!acc[video.category]) {
      acc[video.category] = [];
    }
    acc[video.category].push(video);
    return acc;
  }, {} as Record<string, VideoContext[]>);

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Recommendation Context Management</h1>
          <p className="text-muted-foreground">
            Manage and edit the context used for video and text recommendations based on TrackMan data.
          </p>
        </div>

        {/* Video Recommendations */}
        <div className="mb-12">
          <h2 className="text-2xl font-semibold text-foreground mb-6">Video Recommendations</h2>
          
          {Object.entries(groupedVideos).map(([category, videos]) => (
            <div key={category} className="mb-8">
              <h3 className="text-xl font-medium text-foreground mb-4 border-b border-border pb-2">
                {category}
              </h3>
              
              <div className="grid gap-4">
                {videos.map((video) => (
                  <Card key={video.id} className="border border-border bg-card">
                    <CardHeader>
                      <CardTitle className="text-lg text-card-foreground">{video.title}</CardTitle>
                      <CardDescription>
                        <a 
                          href={video.link} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-primary hover:underline"
                        >
                          {video.link}
                        </a>
                      </CardDescription>
                    </CardHeader>
                    
                    <CardContent className="space-y-4">
                      <div>
                        <h4 className="font-medium text-sm text-card-foreground mb-2">Related Data Points:</h4>
                        <div className="flex flex-wrap gap-2">
                          {video.relatedDataPoints.map((point) => (
                            <span 
                              key={point}
                              className="px-2 py-1 bg-muted text-muted-foreground text-xs rounded"
                            >
                              {point}
                            </span>
                          ))}
                        </div>
                      </div>
                      
                      <div>
                        <h4 className="font-medium text-sm text-card-foreground mb-2">Recommend When:</h4>
                        <ul className="text-sm text-muted-foreground space-y-1">
                          {video.recommendWhen.map((condition, index) => (
                            <li key={index} className="flex items-start">
                              <span className="text-primary mr-2">•</span>
                              {condition}
                            </li>
                          ))}
                        </ul>
                      </div>
                      
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium text-sm text-card-foreground">Context Summary:</h4>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setEditingVideo(video.id);
                              setEditingSummary(video.contextSummary);
                            }}
                          >
                            Edit
                          </Button>
                        </div>
                        
                        {editingVideo === video.id ? (
                          <div className="space-y-2">
                            <Textarea
                              value={editingSummary}
                              onChange={(e) => setEditingSummary(e.target.value)}
                              className="min-h-[100px]"
                            />
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                onClick={() => handleEditSummary(video.id, editingSummary)}
                              >
                                Save
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setEditingVideo(null)}
                              >
                                Cancel
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <p className="text-sm text-muted-foreground">{video.contextSummary}</p>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Text Recommendations */}
        <div>
          <h2 className="text-2xl font-semibold text-foreground mb-6">Text Recommendations</h2>
          
          <Card className="border border-border bg-card">
            <CardHeader>
              <CardTitle className="text-lg text-card-foreground">Current Text Recommendation Logic</CardTitle>
              <CardDescription>
                Based on the recommendation engine in utils/recommendationEngine.ts
              </CardDescription>
            </CardHeader>
            
            <CardContent>
              <Accordion type="single" collapsible>
                <AccordionItem value="fade-pattern">
                  <AccordionTrigger>Out-to-In Path with Open Face (Fade Pattern)</AccordionTrigger>
                  <AccordionContent className="space-y-4">
                    <div>
                      <h4 className="font-medium text-sm text-card-foreground mb-2">Conditions:</h4>
                      <ul className="text-sm text-muted-foreground space-y-1">
                        <li>• Club Path &lt; -2° (out-to-in)</li>
                        <li>• Face to Path &gt; 1° (open to path)</li>
                      </ul>
                    </div>
                    
                    <div>
                      <h4 className="font-medium text-sm text-card-foreground mb-2">Recommendation Focus:</h4>
                      <ul className="text-sm text-muted-foreground space-y-1">
                        <li>• Explains club path and face angle relationship</li>
                        <li>• Identifies fade ball flight pattern</li>
                        <li>• Provides specific drills to neutralize club path</li>
                        <li>• Includes alignment stick drill, split hand drill, and setup checks</li>
                      </ul>
                    </div>
                  </AccordionContent>
                </AccordionItem>
                
                <AccordionItem value="default-recommendation">
                  <AccordionTrigger>Default Swing Analysis</AccordionTrigger>
                  <AccordionContent className="space-y-4">
                    <div>
                      <h4 className="font-medium text-sm text-card-foreground mb-2">When Used:</h4>
                      <p className="text-sm text-muted-foreground">
                        When the swing data doesn't match the specific fade pattern criteria
                      </p>
                    </div>
                    
                    <div>
                      <h4 className="font-medium text-sm text-card-foreground mb-2">Content:</h4>
                      <ul className="text-sm text-muted-foreground space-y-1">
                        <li>• General ball flight analysis</li>
                        <li>• Key focus areas (Club Path, Impact Quality, Launch Conditions)</li>
                        <li>• Basic practice recommendations</li>
                      </ul>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </CardContent>
          </Card>
          
          {/* Club-Specific Ranges */}
          <Card className="border border-border bg-card mt-8">
            <CardHeader>
              <CardTitle className="text-lg text-card-foreground">Club-Specific Ranges & Guidance</CardTitle>
              <CardDescription>
                Optimal ranges for each club category with drills and interactions
              </CardDescription>
            </CardHeader>
            
            <CardContent>
              <Accordion type="single" collapsible>
                <AccordionItem value="wedges">
                  <AccordionTrigger>⛳ Wedges (SW, LW, PW, 60°–46°)</AccordionTrigger>
                  <AccordionContent className="space-y-4">
                    <div>
                      <h4 className="font-medium text-sm text-card-foreground mb-2">Good Ranges:</h4>
                      <ul className="text-sm text-muted-foreground space-y-1">
                        <li>• Club Speed: 50–70 mph</li>
                        <li>• Attack Angle: –6° to –4°</li>
                        <li>• Club Path: –2° to +2°</li>
                        <li>• Face Angle: ±1°</li>
                        <li>• Face-to-Path: ≤ 2° (to control spin axis)</li>
                        <li>• Spin Loft: ~18°+</li>
                        <li>• Spin Rate: 7000–9000 rpm</li>
                        <li>• Launch Angle: 30°–40°</li>
                        <li>• Landing Angle: ~50°</li>
                      </ul>
                    </div>
                    
                    <div>
                      <h4 className="font-medium text-sm text-card-foreground mb-2">Key Notes:</h4>
                      <ul className="text-sm text-muted-foreground space-y-1">
                        <li>• Attack Angle – Wedges should be descending (~–6°) for crisp contact</li>
                        <li>• Club Path & Face Angle – Ideal is neutral; large deviations cause big misses</li>
                        <li>• Spin Loft – High values necessary for spin; if low, ball skids on green</li>
                      </ul>
                    </div>
                    
                    <div>
                      <h4 className="font-medium text-sm text-card-foreground mb-2">Drills:</h4>
                      <ul className="text-sm text-muted-foreground space-y-1">
                        <li>• Towel drill: Place towel 2" behind ball—strike steeply to compress downward</li>
                        <li>• Gate drill at impact: Use two tees aligned with target line</li>
                        <li>• High-spin feel: Swing with slightly closed face through impact</li>
                      </ul>
                    </div>
                  </AccordionContent>
                </AccordionItem>
                
                <AccordionItem value="irons">
                  <AccordionTrigger>🛠️ Irons (5–9 Iron)</AccordionTrigger>
                  <AccordionContent className="space-y-4">
                    <div>
                      <h4 className="font-medium text-sm text-card-foreground mb-2">Good Ranges:</h4>
                      <ul className="text-sm text-muted-foreground space-y-1">
                        <li>• Club Speed: 70–90 mph</li>
                        <li>• Attack Angle: –4° to –2°</li>
                        <li>• Club Path: –2° to +2°</li>
                        <li>• Face Angle: ±1°</li>
                        <li>• Face-to-Path: ≤ 2°</li>
                        <li>• Spin Loft: ~14°–18°</li>
                        <li>• Spin Rate: 5000–7000 rpm</li>
                        <li>• Launch Angle: 18°–28°</li>
                        <li>• Landing Angle: ~45°</li>
                      </ul>
                    </div>
                    
                    <div>
                      <h4 className="font-medium text-sm text-card-foreground mb-2">Key Notes:</h4>
                      <ul className="text-sm text-muted-foreground space-y-1">
                        <li>• Attack Angle – Slightly descending strike is optimal for crisp contact</li>
                        <li>• Club Path/Face – Draw/fade control within 2° ensures consistent curvature</li>
                        <li>• Spin Loft – Balanced to ensure carry + stopping power</li>
                      </ul>
                    </div>
                    
                    <div>
                      <h4 className="font-medium text-sm text-card-foreground mb-2">Drills:</h4>
                      <ul className="text-sm text-muted-foreground space-y-1">
                        <li>• Alignment grid: Lay sticks for target line at both ball and feet</li>
                        <li>• Tee drill: Tee ball low and forward; promotes descending strike</li>
                        <li>• Ball flight feel: Start with inside → outside path</li>
                      </ul>
                    </div>
                  </AccordionContent>
                </AccordionItem>
                
                <AccordionItem value="woods">
                  <AccordionTrigger>🌲 Woods (Fairways & Hybrids)</AccordionTrigger>
                  <AccordionContent className="space-y-4">
                    <div>
                      <h4 className="font-medium text-sm text-card-foreground mb-2">Good Ranges:</h4>
                      <ul className="text-sm text-muted-foreground space-y-1">
                        <li>• Club Speed: 90–110 mph</li>
                        <li>• Attack Angle: –2° to +2°</li>
                        <li>• Club Path: –1° to +3° (slight in-to-out)</li>
                        <li>• Face Angle: ±1°</li>
                        <li>• Face-to-Path: ≤ 1°–2°</li>
                        <li>• Spin Loft: 10°–14°</li>
                        <li>• Spin Rate: 3000–4500 rpm</li>
                        <li>• Launch Angle: 10°–18°</li>
                      </ul>
                    </div>
                    
                    <div>
                      <h4 className="font-medium text-sm text-card-foreground mb-2">Key Notes:</h4>
                      <ul className="text-sm text-muted-foreground space-y-1">
                        <li>• Attack Angle – Neutral to ascending maximizes launch + roll</li>
                        <li>• Club Path – Slight in-to-out promotes slight draw/roll launch</li>
                        <li>• Spin Loft – Balanced to avoid ballooning or excessive roll</li>
                      </ul>
                    </div>
                    
                    <div>
                      <h4 className="font-medium text-sm text-card-foreground mb-2">Drills:</h4>
                      <ul className="text-sm text-muted-foreground space-y-1">
                        <li>• Stubby tee: Use low tee to promote sweeping swing</li>
                        <li>• Headcover target: Place outside ball's target line</li>
                        <li>• "Right-field" swing path: Visualize launch slightly right</li>
                      </ul>
                    </div>
                  </AccordionContent>
                </AccordionItem>
                
                <AccordionItem value="driver">
                  <AccordionTrigger>🚀 Driver</AccordionTrigger>
                  <AccordionContent className="space-y-4">
                    <div>
                      <h4 className="font-medium text-sm text-card-foreground mb-2">Good Ranges:</h4>
                      <ul className="text-sm text-muted-foreground space-y-1">
                        <li>• Club Speed: 100–120+ mph</li>
                        <li>• Attack Angle: +0° to +6°</li>
                        <li>• Club Path: –1° to +3°</li>
                        <li>• Face Angle: ±1° (relative to path: 0°–1° open for fade, 0°–1° closed for draw)</li>
                        <li>• Face-to-Path: ≤ 1° (tour-level consistency)</li>
                        <li>• Spin Loft: 10°–14°</li>
                        <li>• Spin Rate: 2000–3000 rpm</li>
                        <li>• Launch Angle: 10°–15°</li>
                      </ul>
                    </div>
                    
                    <div>
                      <h4 className="font-medium text-sm text-card-foreground mb-2">Key Notes:</h4>
                      <ul className="text-sm text-muted-foreground space-y-1">
                        <li>• Attack Angle – Slightly positive drives distance; PGA avg –1.5°, top players +4–5°</li>
                        <li>• Club Path & Face – Neutral path + square face is key</li>
                        <li>• Spin Loft – Lower spin loft gives roll; but too low balloons or stingers</li>
                      </ul>
                    </div>
                    
                    <div>
                      <h4 className="font-medium text-sm text-card-foreground mb-2">Drills:</h4>
                      <ul className="text-sm text-muted-foreground space-y-1">
                        <li>• Lateral head movement: Slide head inside ball on downswing</li>
                        <li>• Fairway block drill: Set target line guides</li>
                        <li>• Launch feeling: Visualize ball launching slightly right, then drawing back</li>
                      </ul>
                    </div>
                  </AccordionContent>
                </AccordionItem>
                
                <AccordionItem value="cross-metrics">
                  <AccordionTrigger>💡 Cross-Metric Relationships</AccordionTrigger>
                  <AccordionContent className="space-y-4">
                    <div>
                      <h4 className="font-medium text-sm text-card-foreground mb-2">Key Interactions:</h4>
                      <ul className="text-sm text-muted-foreground space-y-1">
                        <li>• Attack Angle → Club Path: Steep descent drives path right; ascending sends path left</li>
                        <li>• Club Path + Face Angle → Face-to-Path: The difference dictates curvature</li>
                        <li>• Face-to-Path ≈ 0 = straight; Positive = fade; Negative = draw</li>
                        <li>• Spin Loft = Dyn Loft – Attack Angle: Higher spin loft = more spin</li>
                        <li>• Landing Angle: Balanced launch + spin loft yield optimal landing (~45–50°)</li>
                      </ul>
                    </div>
                    
                    <div>
                      <h4 className="font-medium text-sm text-card-foreground mb-2">Summary Guidance:</h4>
                      <ul className="text-sm text-muted-foreground space-y-1">
                        <li>• Establish attack angle baseline by club group</li>
                        <li>• Keep club path within ±2–3° (driver ±3°, irons ±2°, wedges ±2°)</li>
                        <li>• Ensure face-to-path stays tight: ≤ 1° for driver, ≤ 2° for irons/wedges</li>
                        <li>• Manage spin loft relative to attack angle for distance and stopping control</li>
                        <li>• Prescribe drills matching the addressed data point</li>
                      </ul>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Context;