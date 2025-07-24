export const getVideoRecommendations = (data: any) => {
  const videos = [];
  
  // Check club path - if out-to-in (-2.7), recommend path correction video
  const clubPath = parseFloat(data.clubPath?.replace(/[^\d.-]/g, '') || '0');
  if (clubPath < -2) {
    videos.push({
      title: "Fixing Your Out-to-In Swing Path",
      description: "Learn drills to neutralize your club path and hit straighter shots",
      url: "https://scratchgc.wistia.com/medias/t9v6ljw08v"
    });
  }
  
  // Check attack angle - if too steep (negative), recommend shallow drill
  const attackAngle = parseFloat(data.attackAngle?.replace(/[^\d.-]/g, '') || '0');
  if (attackAngle < -3) {
    videos.push({
      title: "Creating a Shallower Attack Angle",
      description: "Stop hitting down too steeply and improve your ball striking",
      url: "https://scratchgc.wistia.com/medias/example1"
    });
  }
  
  // Check spin rate - if too high, recommend spin reduction
  const spinRate = parseInt(data.spinRate?.replace(/[^\d]/g, '') || '0');
  if (spinRate > 4000) {
    videos.push({
      title: "Reducing Spin Rate for More Distance",
      description: "Lower your spin rate to maximize carry distance",
      url: "https://scratchgc.wistia.com/medias/example2"
    });
  }
  
  // If no specific issues, recommend general improvement video
  if (videos.length === 0) {
    videos.push({
      title: "Optimizing Your Iron Play",
      description: "Fine-tune your technique for consistent ball striking",
      url: "https://scratchgc.wistia.com/medias/general"
    });
  }
  
  return videos;
};

export const getTextRecommendations = (data: any) => {
  const clubPath = parseFloat(data.clubPath?.replace(/[^\d.-]/g, '') || '0');
  const faceAngle = parseFloat(data.faceAngle?.replace(/[^\d.-]/g, '') || '0');
  const faceToPath = parseFloat(data.faceToPath?.replace(/[^\d.-]/g, '') || '0');
  
  if (clubPath < -2 && faceToPath > 1) {
    return `🧠 Understanding Club Path & Face Angle

In simple terms:

Club Path is the direction the club is traveling at impact — either right (in-to-out), left (out-to-in), or neutral.

Face Angle is where the clubface is pointing relative to the target at impact.

The relationship between face angle and club path determines the ball's starting direction and curve.

In your case:

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
  
  // Default recommendation
  return `📊 Your Swing Analysis

Based on your TrackMan data, here are the key areas to focus on:

🎯 Ball Flight: Your current setup produces a fade pattern with the ball starting slightly left and curving right.

🔧 Primary Focus Areas:
1. Club Path: Work on neutralizing your swing path
2. Impact Quality: Continue developing consistent strike patterns
3. Launch Conditions: Optimize your angle of attack for better trajectory

💡 Practice Recommendations:
• Focus on tempo and rhythm in your swing
• Work on impact position drills
• Practice alignment and setup consistency

Keep up the great work and continue monitoring your progress with TrackMan data!`;
};