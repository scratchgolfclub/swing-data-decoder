### Slice
- **Description:** A severe left-to-right curvature for a right-handed golfer due to an open clubface relative to the swing path.
- **Trigger Metrics:** `[
      { metric: "Club Path", comparison: "<", value: -3 },
      { metric: "Face To Path", comparison: ">", value: 3 }
    ]`
- **Drills:** `[
      "Inside-Out Path Drill: Place an alignment stick or club slightly outside the ball-target line, encouraging a swing path from the inside to correct the slice.",
      "Closed Stance Drill: Adjust your stance slightly closed to the target line, helping your swing path naturally shift to the inside.",
      "Release Drill: Practice gently rotating your forearms through impact, helping close the clubface relative to the path."
    ]`
- **Feels:** `[
      "Feel your trail shoulder staying back slightly longer, promoting an inside-out path.",
      "Imagine the clubface softly turning over through impact, gently closing toward your target.",
      "Visualize swinging toward right field (for a right-handed golfer), helping neutralize the slice."
    ]`

---

### Hook
- **Description:** A severe right-to-left curvature for a right-handed golfer caused by a closed clubface relative to the swing path.
- **Trigger Metrics:** `[
      { metric: "Club Path", comparison: ">", value: 3 },
      { metric: "Face To Path", comparison: "<", value: -3 }
    ]`
- **Drills:** `[
      "Neutral Path Drill: Align your feet and shoulders squarely, using alignment sticks to maintain a neutral path.",
      "Hold-off Finish Drill: Practice swings with a controlled, abbreviated finish to limit excessive face rotation.",
      "Alignment Stick Feedback Drill: Place a stick along your toe line, promoting a more neutral swing path and face angle."
    ]`
- **Feels:** `[
      "Feel as if the clubface stays gently open through impact, minimizing excessive closure.",
      "Imagine your arms softly guiding the clubface straight through the ball, without rolling over.",
      "Visualize a straighter path, swinging directly along your target line."
    ]`

---

### Pull
- **Description:** A shot that travels straight left of the target for a right-handed golfer, resulting from an out-to-in path with a square clubface.
- **Trigger Metrics:** `[
      { metric: "Club Path", comparison: "<", value: -3 },
      { metric: "Face Angle", comparison: "<", value: -3 }
    ]`
- **Drills:** `[
      "Path Alignment Drill: Place alignment rods parallel to your target, practicing swings to maintain a neutral path.",
      "Trail Foot Back Drill: Move your trail foot slightly back, promoting an inside-out swing path to correct pulls.",
      "Gate Drill: Create a gate with tees slightly right of the target line, practicing swinging through this gate to correct your path."
    ]`
- **Feels:** `[
      "Feel the club gently dropping slightly from the inside during your downswing.",
      "Imagine swinging outward towards the right side of the fairway (for right-handed golfers).",
      "Visualize your clubhead moving directly toward the target rather than across it."
    ]`

---

### Push
- **Description:** A shot that travels straight right of the target for a right-handed golfer, caused by an inside-out path with a square clubface.
- **Trigger Metrics:** `[
      { metric: "Club Path", comparison: ">", value: 3 },
      { metric: "Face Angle", comparison: ">", value: 3 }
    ]`
- **Drills:** `[
      "Square Path Drill: Use alignment sticks to visually guide a neutral, target-oriented swing path.",
      "Lead Foot Forward Drill: Move your lead foot slightly forward, naturally promoting a more neutral swing path.",
      "Intermediate Target Drill: Aim at an intermediate target slightly left of your intended line, encouraging a neutral swing path."
    ]`
- **Feels:** `[
      "Feel your clubhead moving more directly toward your target through impact.",
      "Imagine guiding the clubhead along a straight line down your target line.",
      "Visualize the clubface pointing straight down the target line throughout the swing."
    ]`

---

### Fat Shot
- **Description:** A shot where the club hits the ground before the ball, causing significant loss of distance and poor contact.
- **Trigger Metrics:** `[
      { metric: "Low Point Height", comparison: "<", value: -1 },
      { metric: "Attack Angle", comparison: "<", value: -6 }
    ]`
- **Drills:** `[
      "Ball Forward Drill: Place the ball slightly forward in your stance to help the club strike the ball first.",
      "Divot After Ball Drill: Place a tee or small object just ahead of the ball, ensuring your divot occurs after impact.",
      "Balance and Transfer Drill: Emphasize shifting your weight onto your lead side earlier in the downswing to improve strike quality."
    ]`
- **Feels:** `[
      "Feel your weight firmly moving forward onto your front foot during the downswing.",
      "Imagine clipping the ball cleanly, striking it first before brushing the turf.",
      "Visualize driving the ball forward, with your low point ahead of the ball at impact."
    ]`

---

### Thin Shot
- **Description:** A shot that strikes the ball low on the clubface, typically resulting in a low trajectory and less control.
- **Trigger Metrics:** `[
      { metric: "Impact Height", comparison: "<", value: -0.5 }
    ]`
- **Drills:** `[
      "Consistent Ball Position Drill: Maintain consistent ball placement in your stance to promote solid contact.",
      "Controlled Swing Length Drill: Use shorter, controlled swings to ensure consistent vertical impact position.",
      "Head Stability Drill: Keep your head steady through impact, improving the vertical position of your strike."
    ]`
- **Feels:** `[
      "Feel the club gently descending through impact, ensuring solid contact slightly higher on the face.",
      "Imagine softly compressing the ball against the turf, avoiding upward or scooping movements.",
      "Visualize your clubface meeting the ball squarely in the center, providing clean, crisp contact."
    ]`

---

### Topped Shot
- **Description:** A shot where the club strikes the ball extremely high on the face or top, resulting in minimal forward movement and a bouncing trajectory.
- **Trigger Metrics:** `[
      { metric: "Impact Height", comparison: ">", value: 0.5 }
    ]`
- **Drills:** `[
      "Stay Down Drill: Practice maintaining your posture through impact, preventing lifting or standing up.",
      "Brushing Turf Drill: Make swings focusing on gently brushing the turf just beneath the ball position.",
      "Steady Head Drill: Maintain a steady head position to ensure proper vertical alignment at impact."
    ]`
- **Feels:** `[
      "Feel your chest staying down and over the ball throughout the swing.",
      "Imagine your club smoothly brushing the ground through impact, ensuring lower face contact.",
      "Visualize a level and controlled swing path, avoiding upward motion through the hitting area."
    ]`

---

### Shank
- **Description:** A severe mis-hit striking the hosel of the club, resulting in a sharply deflected shot.
- **Trigger Metrics:** `[
      { metric: "Impact Offset", comparison: "<", value: -0.5 }
    ]`
- **Drills:** `[
      "Gate Drill: Place two tees closely spaced just outside the toe and heel of your clubhead, ensuring centered strikes.",
      "Ball Position Adjustment: Slightly adjust ball position to encourage central face contact.",
      "Inside Path Drill: Focus on keeping the clubhead slightly inside the ball-target line, avoiding hosel contact."
    ]`
- **Feels:** `[
      "Feel your clubface centered behind the ball, moving clearly away from the hosel through impact.",
      "Imagine striking the ball with the toe side of the clubface to prevent hosel contact.",
      "Visualize your hands and clubhead maintaining a safe distance from the ball's inside edge at impact."
    ]`

---

### Ballooning
- **Description:** An excessively high trajectory causing the ball to climb steeply and lose distance, typically due to excessive spin or launch angle.
- **Trigger Metrics:** `[
      { metric: "Launch Angle", comparison: ">", value: 20 },
      { metric: "Spin Rate", comparison: ">", value: 7000 }
    ]`
- **Drills:** `[
      "Punch Shot Drill: Practice hitting controlled, lower trajectory shots by positioning the ball back in your stance and leaning the shaft forward.",
      "Lower Finish Drill: Focus on finishing your swing at shoulder height to promote a more penetrating ball flight.",
      "Reduced Loft Drill: Use a less lofted club or slightly close the clubface to lower the launch angle and spin rate."
    ]`
- **Feels:** `[
      "Feel as though you're driving the ball forward and low through impact.",
      "Imagine compressing the ball firmly against the turf with less loft to achieve a flatter trajectory.",
      "Visualize your shot traveling forward on a more direct, penetrating path rather than climbing steeply."
    ]`

---

### Too Low Ball Flight
- **Description:** Difficulty achieving proper height on shots, resulting in a trajectory that's excessively low with limited carry and increased roll-out.
- **Trigger Metrics:** `[
      { metric: "Launch Angle", comparison: "<", value: 10 },
      { metric: "Spin Rate", comparison: "<", value: 2500 }
    ]`
- **Drills:** `[
      "High Tee Drill: Tee the ball slightly higher, promoting an upward angle of attack and higher ball flight.",
      "Sweep and Lift Drill: Practice gently sweeping the club through the ball, promoting increased loft at impact.",
      "Loft Maintenance Drill: Practice maintaining or slightly increasing loft through impact to elevate ball trajectory."
    ]`
- **Feels:** `[
      "Feel as though you're gently sliding the clubhead under the ball, softly launching it upward.",
      "Imagine softly lifting the ball up off the clubface, increasing trajectory height.",
      "Visualize your ball climbing gradually higher immediately after leaving the clubface."
    ]`

---

### Heel Strike
- **Description:** Consistently hitting the ball toward the heel of the clubface, causing weaker shots and potential slices.
- **Trigger Metrics:** `[
      { metric: "Impact Offset", comparison: "<", value: -0.3 }
    ]`
- **Drills:** `[
      "Toe-Focused Drill: Place a tee just outside the heel, encouraging a strike closer to the center or toe.",
      "Gate Drill: Set up two tees narrowly spaced to ensure the club passes through, centered on impact.",
      "Head Stability Drill: Maintain a stable head position through impact, improving horizontal strike consistency."
    ]`
- **Feels:** `[
      "Feel the clubhead moving slightly outward through impact, guiding the ball toward the center or toe.",
      "Imagine your hands and clubhead slightly extending away from your body as you approach impact.",
      "Visualize hitting the ball closer to the toe side of the clubface."
    ]`

---

### Toe Strike
- **Description:** Consistently hitting the ball toward the toe of the clubface, resulting in reduced power and potential hooks.
- **Trigger Metrics:** `[
      { metric: "Impact Offset", comparison: ">", value: 0.3 }
    ]`
- **Drills:** `[
      "Heel-Focused Drill: Position a tee just outside the toe, practicing strikes closer to the center or heel.",
      "Inside Path Adjustment Drill: Encourage a slightly more inside path to bring the strike towards the center.",
      "Swing Radius Control Drill: Practice controlling your swing radius to avoid excessive outward club movement."
    ]`
- **Feels:** `[
      "Feel your clubhead slightly closer to your body at impact, centering the strike.",
      "Imagine pulling the club gently inward through impact to encourage center-face contact.",
      "Visualize making contact closer to the heel or center of the clubface."
    ]`

---

### Inconsistent Impact Point
- **Description:** General inconsistency in impact location, leading to unpredictable ball flights and reduced shot reliability.
- **Trigger Metrics:** `[
      { metric: "Impact Offset", comparison: "abs", value: 0.4 },
      { metric: "Impact Height", comparison: "abs", value: 0.4 }
    ]`
- **Drills:** `[
      "Gate Drill: Set tees or alignment rods to form a gate around the ball, practicing consistent centered strikes.",
      "Half Swing Drill: Execute controlled, shorter swings, focusing purely on achieving consistent impact points.",
      "Impact Tape Feedback: Regularly use impact tape on the clubface to visually identify and correct inconsistency."
    ]`
- **Feels:** `[
      "Feel the clubhead repeatedly returning to the exact same spot behind the ball every swing.",
      "Imagine your swing path and impact point as precisely repeatable each time.",
      "Visualize your clubhead consistently striking the ball in the center of the clubface."
    ]`

---

### Quick Transition
- **Description:** A rushed transition from backswing to downswing, causing timing issues, loss of control, and inconsistent strikes.
- **Trigger Metrics:** `[
      { metric: "Club Speed", comparison: ">", value: 120 },
      { metric: "Smash Factor", comparison: "<", value: 1.3 }
    ]`
- **Drills:** `[
      "Pause-at-Top Drill: Pause briefly at the top of your backswing, creating a deliberate, smooth transition into the downswing.",
      "Counting Rhythm Drill: Count slowly 'one-two' during backswing and 'three' for downswing to slow the transition.",
      "Metronome Tempo Drill: Practice swings using a metronome to encourage consistent, unhurried transitions."
    ]`
- **Feels:** `[
      "Feel your backswing smoothly pausing before calmly beginning the downswing.",
      "Imagine your transition occurring naturally without force or rush.",
      "Visualize your downswing smoothly following a clear, deliberate pause at the top."
    ]`

---

### Slow, Stalled Transition
- **Description:** Excessively slow or hesitant transition from backswing to downswing, disrupting rhythm and reducing swing efficiency.
- **Trigger Metrics:** `[
      { metric: "Club Speed", comparison: "<", value: 70 },
      { metric: "Smash Factor", comparison: "<", value: 1.3 }
    ]`
- **Drills:** `[
      "Continuous Motion Drill: Practice swings without pausing at the top, promoting a fluid, continuous transition.",
      "Step-Change Drill: Step forward slightly with your lead foot at the top of your backswing to encourage smooth momentum into downswing.",
      "Acceleration Drill: Gradually increase swing speed during your downswing to improve rhythm and avoid stalling."
    ]`
- **Feels:** `[
      "Feel your transition smoothly accelerating from backswing directly into downswing without delay.",
      "Imagine seamlessly flowing from backswing to downswing in one uninterrupted motion.",
      "Visualize your clubhead building speed progressively through the transition and into impact."
    ]`