# Phool Gobhi — a day with Gobhi (concept 02)

A continuous scroll-driven 3-D prototype. The production homepage, booking,
check-in, payment and account routes are untouched.

Open http://localhost:4173/ while the local server is running, or open index.html.

```powershell
python -m http.server 4173 --bind 127.0.0.1 --directory public/prototype
```

## The story

1. Gobhi holds and taps the app on his phone.
2. Scrolling moves the camera around Gobhi and towards the phone screen.
3. The camera crosses the screen into the app journey.
4. Training, nourishment and weekly progress appear as objects in the same world.
5. The camera pulls back to Gobhi and your own beginning.

Use the six chapter buttons to jump to a moment. If the operating system requests
reduced motion, the prototype uses still chapter views. Click the motion control
to opt into the continuous camera flight, or switch it off at any time.

All scenery, the character, the phone, and app panels are WebGL meshes. The app
panels use locally generated canvas textures based on current product components.
They are illustrative recreations with sample data, not captured app screenshots.
The procedural character is a prototype model rather than final production art.
No CDN, external assets, API credentials, accounts or backend writes are required.

Files: index.html, journey.css, journey.js, journey-webgl.js, assets/.

The previous landing-page study is preserved at landing-v1.html with its original
style.css, scene.js and prototype.js.

## Browser review

```powershell
node tools/preview-journey.cjs
```

The helper uses an isolated headless Chrome profile and checks the camera path,
chapter navigation, loading completion, dialog keyboard handling, reduced motion,
WebGL errors and responsive overflow. Frames and the verification report are in
.prototype-review/journey/ (ignored by Git).

## Logo-derived model (concept 03)

Open model.html to inspect the improved Gobhi from the original green logo.
The inspector supports drag rotation, wheel zoom, keyboard arrows, front/side
views and three poses: the barbell logo pose, using the phone, and waving.

The crown is one smooth implicit surface, with a tapered stem, curved swept
limbs, defined fingers, brand colours and soft shadow mapping. The code is in
gobhi-model.js; the standalone native WebGL renderer is in model-renderer.js.

Download a static GLB of the current pose using the inspector, or use the saved
assets/gobhi-logo.glb. The GLB contains reusable mesh geometry and materials;
it is not a skinned animation rig. Website motion is driven by the procedural
pose controls. Character changes are reviewed in the standalone model studio before website integration.

Run node tools/preview-gobhi.cjs for model, GLB and responsive rendering checks.


## Standalone model study 04

The website journey is restored to its pre-integration version. Its index loads
journey-webgl.js and does not load gobhi-model.js or model-renderer.js.

Model-only changes: paired grooves recessed into the stem surface; compact arms
and hands; more defined crown clusters with densely embedded geometric florets.
The model inspector and downloadable GLB are the review artifacts.


## Hand study 05

Hands now have four fingers with three phalanges each, an opposable thumb,
a shaped palm, knuckles and subtle nail surfaces. The wrist transition is
stitched and welded into each forearm; there are no separate hand cuffs.
Gripping, phone-holding, open and relaxed shapes are authored in gobhi-hands.js.
Use the Hands button in the standalone inspector for a close view, then drag
to inspect its palm, fingers and wrist. Reset returns to the full character.
The website remains separate from this model study.
