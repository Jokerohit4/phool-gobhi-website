# Website journey: planning, AI and the transition regression

## Recommendation

Make the product story **Plan → Ask → Do → Understand → Celebrate**. Planning
and contextual AI are two main chapters of the current customer-app direction,
not small extras after a logging demonstration.

Research used customer-app `dev` commit `03422e4` (11 November 2026) against
`main` commit `3cef9b2` (24 August 2026), using read-only Git inspection. Existing
uncommitted app work was left untouched. The branch comparison spans 1,944 files.
The proposal describes implemented dev capabilities; production availability
still depends on rollout flags.

## Proposed scroll sequence

| Beat | What the visitor sees and does | Purpose |
| --- | --- | --- |
| Meet Gobhi | Preserve the approved greeting, small held phone and one gradual over-the-shoulder camera move. | Establish the character and enter the product naturally. |
| Your kind of day | A small Home / My gym / Wellbeing choice changes the sample context inside the phone. | Show that the app extends beyond gym discovery. |
| A plan that fits your life | Choose three training days. The week assembles into workout/rest days; water, steps and sleep appear in Today. A preview becomes the saved sample plan. | Explain the central planning product before individual logs. |
| Ask Gobhi | A sample prompt, “I have 20 minutes and I’m training at home,” leads to an illustrative routine suggestion. The visitor chooses Save to routines, then Start this routine. | Show contextual AI through a useful action the person controls. |
| Do a little good | Water, meal and workout logging tick off the same Today checklist. Keep the existing micro-interactions, with less repeated introductory copy. | Connect the actions to a purpose and a persistent day. |
| See your week | The existing History chapter grows into plan completion, hydration, food and workout progress. A brief training-volume/record reveal and a planned rest day can follow. | Show that the records become useful feedback. |
| A little win | Preserve the finite coin-wheel celebration after the sample day. | Reward the journey, without an endless GPU animation. |
| Join the ecosystem | Preserve Gobhi supporting the large front-facing phone and the app download buttons. Use inclusive home/gym/wellbeing copy. | Finish with a clear next action. |

The Wellbeing variation should show water, steps, sleep and mood, with no
training-days setting or workout log.

Planning and AI are the highest-priority additions. Put the AI suggestion before
logging, so the sample workout can follow the routine the visitor just accepted. Persona choice can be a small
variation within Planning. Strengthen History rather than adding another separate
analytics chapter. Keep the camera settled during all app chapters; animate their
UI inside the existing phone. This adds product depth without extra camera orbits
or new heavy 3D assets.

Use a scripted sample AI conversation and browser-local acceptance state for the
website demonstration. A live model call is unnecessary for this interaction and
would add waiting time. Preserve the existing sample-data notice.

## What the app actually supports

| Capability | Source evidence | Website interpretation |
| --- | --- | --- |
| One Plan preview/save, sessions per week, steps, sleep and optional Food-layer calories | `../phool-gobhi-customer-app/lib/presentation/pages/coach/plan/plan_edit_screen.dart:20`; `lib/data/data_sources/plan_api_data_source.dart:8` | A week preview that becomes Today; edits preserve completed ticks. |
| Connected Today actions and Train using the same plan | `../phool-gobhi-customer-app/lib/presentation/widgets/plan/today_card.dart:231`; `lib/presentation/pages/train/train_tab_screen.dart:40` | Water, food and exercise should fill the same checklist, rather than act as unrelated slides. |
| Contextual assistant with user-approved plan/routine actions | `../phool-gobhi-customer-app/lib/presentation/pages/assistant/assistant_chat_panel.dart:292`; `lib/presentation/bloc/assistant/assistant_chat_cubit.dart:288`; `../phool-gobhi-backend/services/health-service/services/assistant/coachGrounding.js:57`; `services/health-service/services/aiPrescriptionService.js:26` | Show suggestion → review → Accept → saved routine → start. Workout-template acceptance saves a routine; it does not automatically schedule the week. The specific 20-minute response is proposed demo copy. |
| Home, own gym, linked gym, wellness, sports and explorer personas | `../phool-gobhi-customer-app/lib/domain/progress/progress_persona.dart:3`; `lib/presentation/pages/main_screen/main_screen_constants.dart:48` | “Your kind of fitness,” including wellbeing without workouts. |
| Weekly summary and training stats | `../phool-gobhi-customer-app/lib/data/models/week_summary_model.dart:2`; `lib/presentation/pages/train/train_stats_section.dart:29` | Connect logs to a useful weekly view, training volume and records. |
| Planned rest and next session | `../phool-gobhi-customer-app/lib/presentation/pages/train/train_tab_screen.dart:560` | Show planned rest as part of a sustainable plan. |
| Reviewable photo-food candidates | `../phool-gobhi-customer-app/lib/presentation/pages/health/ledger/food_photo_screen.dart:35` | Optional later detail: photo → proposed foods → review/correction → save. |

Avoid promising that chat silently regenerates a whole week or reads every food
entry. Verified assistant grounding includes training history/profile, goals,
equipment and, under the coach flag, plan slots/targets and approved coaching
notes. Full food-diary grounding was not established.

Do not label readiness as AI measuring bodily recovery. The readiness model
explicitly uses a fixed-window, non-ML heuristic
(`lib/data/models/muscle_readiness_model.dart:1`). Planned rest and training history
are suitable claims.

Gym check-in is a gym flow with location checks, not a home-training action.
Keep photo-food, outdoor tracking, buddy/social and health records as optional
ecosystem details instead of stretching the main story into a feature catalogue.

The backend flag registry defaults `coachJourney`, `fitnessAssistant`,
`coachAssistant`, `weeklySummary`, `foodPhotoLogging` and `runTracker` to off;
admin overrides may differ. Check the actual launch configuration before saying
these features are enabled for every production app user.

## What changed after the three screenshot reports

This comparison uses the source uploaded to the actual Vercel deployments,
not recollection or the latest local files.

- First 3D production deployment: `dpl_9sFLwdAgrNCLG7QyQSKRHhduYVGh`.
- Second, after the three screenshot bug report:
  `dpl_4sMfxr4cSeHy3Cr8csqLkPhYkSFW`.
- Their `gobhi-home.css`, `paint.js` and `motion.ts` source hashes are identical.
- Their renderer and controller differ; `staging.ts` was introduced in the second.

| Change in the second deployment | Consequence |
| --- | --- |
| Delayed phone departure from scroll `.25–.35` to `.27–.35`, while keeping the camera anchors and `.29–.35` phone growth unchanged. | The camera arrived close before the phone began its approach; more movement was compressed into the end of the handoff. |
| Replaced the first renderer’s gradual `.265–.33` actor exit with `actorVisible: p < .285`. | Gobhi could disappear at one exact scroll threshold. This was a choreography regression introduced by the overlap fix. |
| Added shoulder rotation to release the hands during `.205–.25`. | This solved clearance by changing the original holding/approach coordination and needed a matching camera/phone retime. |
| Added runtime reach preparation with a nearest-of-65-curve-samples search for each arm vertex, plus animated buffer uploads during the reach. | Added startup and early-scroll CPU work. Later optimization precomputed the reach, so this work is no longer performed on page load. |
| Separated and resized the ending phone and delayed the mascot/CTA return. | Addressed the ending overlap but changed the approved composition; later iterations restored a held, front-facing display. |

Later changes added the visible checkerboard dissolve and more staging adjustments.
Those are distinct from the second deployment. The fix should restore coordinated,
physical camera/phone movement and remove the initial dissolve, while retaining
the later power-saving policy and the requested final display.

The decoded first/second renderer and second staging source are retained under
`.prototype-review/` for comparison. That ignored QA directory is not published.

## Implementation boundary

The immediate implementation is the holding-to-screen transition repair. This
document proposes the feature additions; it does not add planning or AI screens
to the public website yet. The correction must preserve zero idle WebGL draws,
the mobile pixel budget, disabled live mobile shadows, existing logging/reward
behavior and the large front-facing ending phone.

## Transition repair

The targeted repair restores phone departure to `.25–.35`, with the hand release
complete at `.25`. It removes the initial checkerboard dissolve and keeps Gobhi
opaque while the camera passes. Gobhi is culled only after leaving the view.
The close-in camera anchors are redistributed through `.205`, `.245` and `.28`,
preserving the approved opening/holding anchors and the centered app view at `.35`.

Measured at the same two scroll positions, `.205` and `.23`, before this repair
and after it:

| Viewport | Previous deployed phone height | Repaired phone height |
| --- | --- | --- |
| Desktop, 1440×900 | 101 → 349 px | 170 → 218 px |
| Mobile, 390×844 | 81 → 283 px | 137 → 177 px |

These framing measurements compare the latest pre-repair website to the patch;
they are separate from the exact first-versus-second source comparison above.
They demonstrate a more distributed approach rather than a concentrated zoom.

Verification: 21 focused tests pass. Desktop/mobile playback checks confirm
distributed phone growth, bounded zoom speed, viewport fit and matching camera/phone
positions in forward and reverse. A generous whole-Gobhi box is fully behind the
camera at `.3501` (maximum depth `-0.15`), so the `.35` cull creates no visible
cut. Power checks confirm zero idle draws after manual logging and the automatic
reward, bounded mobile pixels, disabled mobile live shadows and one wake-up loop.

The production verification also caught a small late mobile-fit reversal. The
viewport-fit multiplier now finishes with the main zoom at `.35`, rather than
continuing to shrink the device until `.37`. The full app and ending display sizes
are preserved. This is a separate inherited fit-curve issue, not one of the
first-versus-second changes listed above.
