# Phool Gobhi Website

The `/` homepage is the interactive Gobhi story: a waving greeting, a small
phone held from the bottom, an over-the-shoulder camera move, and the app tour
ending in Android/iOS downloads. Marketing is available before gym launch;
gym, booking, check-in and wallet access gates remain in `proxy.ts`.

The app tour is Plan → Ask Gobhi → Today → water/food/movement → progress →
Map → coins. Choose Home, My gym or Wellbeing; preview/save a 2–4-day plan
(Wellbeing uses habits without training days). Explicitly save a scripted AI
suggestion to routines, then start it. This never silently changes the calendar.
Today and History use the same local journal; editing the plan preserves ticks.
The Map is an illustrative local preview with working Home/Train/Map/Buddies/You tabs;
Wellbeing omits Train. The website Explore menu also opens the Map chapter.
AI responses and places are labelled as sample content and require no live AI,
map SDK, location permission or account writes. App rollout flags are separate.

History starts a visible 2.4-second reveal once its stable screen comes into
view. Scroll also contributes to growth; the graph can finish while stationary,
and re-entry/week changes replay it. Transition snapshots include the current
growth, avoiding a frozen chart during crossfades. Animation budgets remain
finite, and idle frames stop. `node tools/preview-website.cjs --ecosystem`
(also the default browser check) verifies this complete journey on desktop,
phone and small-phone viewports, including persona changes and idle GPU draws.

The newer screens share the older tour's small, finite moments of delight:
calendar assembly and counting targets, drawn save stamps and sparkles,
assistant thinking dots and staggered suggestions, Today checklist/ring reveals,
map pin arrivals and a travelling route, and gentle Wellbeing card reveals.
Floating calendar, sparkle, habit tokens, map pin and leaf accents reuse existing
meshes. Entry and action phases run on the same renderer clock; transition
snapshots carry those phases without creating more than two cached surfaces.
Completed reveals stay settled when scrubbing backwards; replay and context
changes refresh them, and changing training days reassembles the calendar.
Reduced motion shows completed states. `--new-delights` checks entry/action
animation, unchanged journal records, geometry reuse and zero idle GPU draws.
Micro-motion continues for a bounded 4.2-second activity window on the newer
screens: floating/tilting calendar, rotating AI sparkle, independently drifting
habit tokens, a bobbing map pin, and small moving highlights, breathing rings
and flowing route dashes inside the phone. Text stays steady and native. Scrolling
or interacting wakes the same loop; idle and reduced motion still stop rendering.
`--micro-motion` inspects actual canvas operations after the entry reveals finish,
along with unchanged records, reused geometry, sharp text and the final idle pause.

Scroll naturally through Gobhi's day. The app controls let visitors choose
250/500 ml of water, select a sample meal and log three individual workout sets.
History reflects those actions, and the reward wheel collects its sample reward
once. Contextual links after logging continue the story without a presentation
step bar. The copy, phone hit areas and interactions follow rendered camera
progress; the camera uses a continuous path through its approved anchors.
Camera progress equals normalized native scroll position, without a catch-up
timer or snapping to scene stops. Reduced motion (also available as Calm motion)
pauses decorative animation while preserving the continuous scroll camera.
`node tools/preview-website.cjs --scroll-continuity` verifies exact progress and
matching reverse paths in both motion modes on desktop and mobile.

In the water section, a slow scroll previews a pouring glass and saves the
selected amount once. Gentle waves, bubbles, ripples and a gradually rising
counter replace the water confetti. Manual logging takes precedence over the
scroll entry; scrubbing back never duplicates it. Replay resets the sample day,
and reduced motion uses immediate static feedback.

The same scroll day now saves the selected meal, records three workout sets at
separate milestones, and spins the sample reward wheel. Meal stamps, animated
checkmarks and a brief reward burst provide feedback. The wheel turns on entry,
accelerates into its spin and lands on the 20-coin sector; the marked 3D coins
rotate on both faces and orbit the phone. Entries and rewards stay one-time on
reverse scroll, manual actions take precedence, and replay resets the day.

History reveals growing habit bars, a rising cumulative trace, a counting wins
total and staggered activity rings. The matching 3D bars grow beside the phone.
Switching to the sample week or revisiting history replays the reveal; reduced
motion shows the completed chart. `node tools/preview-website.cjs --history`
checks these animations, mobile layout and unchanged sample records.

The reach uses one moving arm surface through the entire hold and release,
without replacing it with a different hand mesh at the end of the reach.
Gobhi lowers both hands before the phone moves forward and enlarges. The goodbye
returns after the camera orbit, holding the phone in its right hand. `node tools/preview-website.cjs --staging` checks the transition and
ending across desktop, mobile and small-phone viewports.

The held-phone handoff restores departure at `.25` and distributes the close-in
camera move across `.205`, `.245` and `.28`. Gobhi stays solid until it is entirely
behind the camera at the centered `.35` anchor. Run the preview helper with
`--holding-review --assert-holding` for framing, reverse-scroll and cull checks.

The ending camera fits the phone, mascot and round platform into a measured
region beside the download copy on desktop, or below it on portrait tablets
and phones. The phone shares the hand's local anchor and scale. Canvas and CSS use
the same media query, including the tablet breakpoint and landscape layout.
`node tools/preview-website.cjs --responsive` checks nine viewport sizes for
figure proportions, overlap with copy and logging controls, overflow and
reduced motion.

Runtime models are generated with `python tools/build-gobhi-runtime.py` from
the approved website derivatives into `public/gobhi/runtime/`. They keep every
authored broccoli bud with simpler geometry and include a precomputed arm reach
and a right-hand phone grip. The large ending display faces the viewer and settles into the grip's lower-corner anchor. Its position, size and rotation stay continuous through the return. Original sculpt assets remain unchanged.
The renderer uses smaller app textures, simpler prop meshes, a 512px shadow map
for the mascot only, and no shadow redraw or floor overdraw during the app tour.
Scroll motion follows requestAnimationFrame. Mobile feedback animations use a
lower cadence, then rendering stops until the next scroll or interaction.
Desktop props keep rotating while the app tour is visible, without mouse input.
After feedback completes, this uses a capped 20fps cadence and reuses the sharp
phone texture; only the reward wheel keeps updating its texture. No new meshes,
shadow passes or animation loops are added. Hidden pages, reduced motion and the
ending still pause rendering. Mobile activity windows are unchanged.
New visits always start with Motion on; the Calm motion toggle pauses decorative
animation when selected. OS motion preferences do not choose the initial mode.
The former "Interactive app preview · sample data" footer label is removed.
`node tools/preview-website.cjs --motion-default` checks initial motion with the
OS reduced-motion preference enabled, the manual toggle, and the removed label.
`node tools/preview-website.cjs --prop-rotation` checks actual WebGL orientation
changes and screenshot pixels for all ten chapters on desktop/mobile, texture
reuse, unchanged logs, and hidden/reduced-motion pausing.
One scheduler handles automatic logging
and feedback. Mobile rendering keeps live shadows disabled. App textures use
768px width on mobile/tablet and 1024px on desktop, with edge antialiasing enabled.
Canvas resolution follows display density up to 2.5x on mobile and 2x on desktop,
with 3M/6M pixel budgets (never below native CSS resolution on larger viewports).
Resolution stays consistent during scrolling; idle pausing and bounded texture
updates preserve efficiency without switching to a blurry moving image.
`node tools/preview-website.cjs --clarity` captures high-density desktop, phone
and tablet views and verifies texture and canvas resolution.
During the settled app tour, glyphs render as native SVG text at display density,
outside the WebGL texture. The shared screen painter supplies text, font weights,
opacity and transforms, including rotating wheel labels and chapter crossfades.
The layer follows the projected screen corners and ignores pointer input. It
blends into the textured screen during the entrance/exit; camera orbits keep the
3D texture for correct perspective and occlusion. It shares the existing renderer
schedule and is removed on disposal. `--native-text` verifies this on desktop and
mobile, including logging updates and idle pause.
App screens and props crossfade in scroll bands; the camera and returning phone
never reset or disappear between poses. `node tools/preview-website.cjs --thermal`
checks zero idle GPU draws, wake-up behavior, the mobile budget, and continuous
front-facing display motion. Physical-device temperature remains unmeasured.

Run `npm run dev` for local development, or `npm run build` followed by
`npm start -- --port 3100` to review the production build. Run `npm test` and
`npm run typecheck` for the existing checks. With the production server running,
`node tools/preview-website.cjs` checks the real homepage in desktop/mobile Chrome,
including demo actions, route navigation, renderer disposal and fallbacks.

Homepage implementation:

- `components/gobhi/GobhiHome.tsx`: server-rendered content, navigation and store links.
- `components/gobhi/gobhi-home.css`: styles scoped to the homepage.
- `lib/gobhi-story/controller.ts`: native scroll progression and accessible app controls.
- `lib/gobhi-story/journey.ts` and `motion.ts`: the sample day and continuous camera path.
- `lib/gobhi-story/renderer.js` and `paint.js`: lazy-loaded WebGL world and animated app screens.
- `public/gobhi/`: local fonts, logo and approved website model derivatives. The
  holding asset includes only the arms; both poses share the same body geometry.

The canonical model archive at `C:/Users/rohit/Phool-Gobhi/assets/3D/logo` remains
unchanged. Editable model construction is retained in `public/prototype/story/model-source/`.
The standalone approved prototype is still available at `/prototype/index.html`.

The app tour uses illustrative records and rewards without account writes.
Store links honour `NEXT_PUBLIC_PLAY_STORE_URL` and `NEXT_PUBLIC_APP_STORE_URL`,
falling back to the destinations used in the approved prototype. Reduced motion
uses still views. If WebGL or model loading fails, or JavaScript is disabled,
the page offers the product introduction, site links and app download buttons.

Buddies is a main story chapter between progress and Map, with a permanent
phone navbar tab, an Explore-menu shortcut and closing copy about fitness
buddies. The interactive preview follows a sample profile, then shares a sample
win; neither action sends anything to the app or modifies the local habit/reward
journal. Discovery, chat with matches and shareable records reflect the customer
app's existing Buddy discovery/chat/social screens. Sample avatars, linked 3D
medallions and finite confirmation effects reuse existing geometry and the same
rendering budget. `--buddies` checks both navigation and phone-button hit areas,
follow/share state, five/four-tab layouts, five viewport sizes, replay/reverse,
reduced motion, bounded desktop rotation and zero mobile idle draws. Live app visibility remains flag-controlled.
