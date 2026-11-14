# Website story: Meet Gobhi (study 09)

Open the prototype root (http://localhost:4173/) while the existing static server
is running. Scroll naturally or use Next, Previous, chapter buttons or a click
on the 3D scene. Replay returns to the greeting. Reduced motion uses still scenes.

The app tour adds a brighter chapter palette, bold typography, animated water,
meal steam, staggered workout sets, growing history bars and a spinning reward
wheel. A few floating 3D accents and short logging celebrations surround the
phone. App textures update at most 20 times per second and reuse their canvas
and GPU texture. Reduced motion freezes these effects; background tabs stop rendering.

## Storyboard

1. Front-facing Gobhi waves with the cloud: Hi, I am Gobhi. Your health and fitness buddy.
2. A half-size phone appears, supported from its bottom edge. The visitor sees its back.
3. The camera travels around his shoulder and reveals his view of the app.
4. The camera approaches; the phone grows into the centred, readable app-tour size.
5. Water logging: add 250 ml in the preview.
6. Food logging: save the sample meal.
7. Workout logging: save the sample sets, reps and weights.
8. History: switch between recent records and the sample week.
9. Coins: spin for an illustrative reward. It cannot be collected twice.
10. Join our ecosystem, with Android and iOS store buttons.

## Assets and source

- The approved character archive in C:/Users/rohit/Phool-Gobhi/assets/3D/logo is unchanged.
- assets/gobhi-wave.glb is derived from the approved waving model, with a softer
  shoulder transition, buried arm roots and smoother upper-arm geometry.
- assets/gobhi-front-phone.glb adds a front-facing phone-holding pose using the
  same character and hand construction. The editable adaptation is in model-source/.
- Both website poses share the rounded shoulder profile and stem/arm material.
  tools/export-story-pose.cjs rebuilds both GLBs from that source.
- story-renderer.js uses the precompiled GLBs, avoiding model sculpting on page load.
- ui.js recreates the product screens with local fonts and illustrative data.
- story.js controls the scroll/click narrative and accessible UI.
- story.css preserves the app's warm paper, green, mustard and restrained accents.

The app actions are browser-local demonstrations with no account or backend writes.
Store destinations come from the customer app's SupportLinks constants. This
prototype does not establish whether the store listings are publicly available.

## Validation

Run node tools/preview-story.cjs while the local server is running. Screenshots and
results are written to .prototype-review/story/. Checks cover phone orientation,
camera path, centring, sample logging/rewards, navigation, store links, reduced
motion, responsive overflow and browser/WebGL errors.
