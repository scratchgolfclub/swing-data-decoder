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
        </div>
      </div>
    </div>
  );
};

export default Context;