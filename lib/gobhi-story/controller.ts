import { createStoryRenderer, type StoryFrame } from './renderer';
import { journeyStops as stops, littleWins, meals, contexts, mapPlaces } from './journey';
import { storyStaging } from './staging';

const scenes = [
 {name:'hello',label:'A LITTLE COMPANY FOR YOUR EVERYDAY.'},
 {name:'phone',kicker:'A LITTLE LOOK INSIDE',title:'Your day.<br> In my hands.',description:'Come along. Let’s make a little room<br> for the everyday that feels good.',label:'YOUR EVERYDAY, IN GOOD HANDS.'},
 {name:'perspective',kicker:'COME OVER HERE',title:'See it from<br> my side.',description:'A little closer.<br> There’s a whole everyday in here.',label:'INTO GOBHI’S EVERYDAY.'},
 {name:'plan',kicker:'YOUR KIND OF FITNESS',title:'YOUR LIFE.<br> YOUR PLAN.',description:'Home, your gym, or a little wellbeing.<br> Build a week that makes room for you.',word:'PLAN',label:'ONE PLAN / A WEEK THAT FITS.'},
 {name:'assistant',kicker:'A LITTLE HELP FROM GOBHI',title:'ASK A LITTLE.<br> DO A LITTLE.',description:'Your context. A useful suggestion.<br> You choose what to save and start.',word:'ASK',label:'ASK GOBHI / A LITTLE HELP, YOUR CHOICE.'},
 {name:'today',kicker:'ONE CONNECTED DAY',title:'YOUR PLAN.<br> YOUR TODAY.',description:'Water, food and a little movement.<br> Every little log belongs to the same day.',word:'TODAY',label:'TODAY / YOUR LITTLE WINS, TOGETHER.'},
 {name:'water',kicker:'FIRST, A LITTLE HYDRATION',title:'SIP. LOG.<br> LET’S GO.',description:'A slow scroll. A little sip.<br> Watch a glass find its way into your day.',word:'FLOW',label:'WATER / EVERY LITTLE SIP COUNTS.'},
 {name:'food',kicker:'THEN, A LITTLE FUEL',title:'GOOD FOOD.<br> GOOD MOOD.',description:'Pick something familiar for lunch.<br> Keep scrolling. We’ll save you a little effort.',word:'FUEL',label:'FOOD / FAMILIAR MEALS, LESS EFFORT.'},
 {name:'workout',kicker:'TIME FOR YOUR OWN STRONG',title:'YOUR SETS.<br> YOUR STRONG.',description:'A little scroll. One set stronger.<br> Your effort, remembered in Today.',word:'STRONG',label:'MOVEMENT / YOUR EFFORT, RECORDED.'},
 {name:'history',kicker:'LOOK AT THAT LITTLE DAY',title:'SMALL STEPS.<br> LOOK AT YOU.',description:'Watch your little efforts add up.<br> Your day, your week, and room for rest.',word:'GROW',label:'PROGRESS / SMALL THINGS, REAL MOMENTUM.'},
 {name:'buddies',kicker:'YOUR PEOPLE, YOUR KIND OF GOOD',title:'YOUR PEOPLE.<br> YOUR PACE.',description:'Find a buddy. Chat. Share your wins.<br> A little stronger, together.',word:'TOGETHER',label:'BUDDIES / YOUR PEOPLE ARE PART OF THE PROGRESS.'},
 {name:'map',kicker:'YOUR WORLD, A LITTLE BIGGER',title:'MORE PLACES.<br> MORE YOU.',description:'Explore gyms and places to move.<br> Find your own corner of the ecosystem.',word:'EXPLORE',label:'MAP / FIND YOUR KIND OF FITNESS.'},
 {name:'coins',kicker:'A LITTLE CELEBRATION',title:'SHOW UP.<br> GLOW UP.',description:'That little day? Worth celebrating.<br> Your little win is coming.',word:'WIN!',label:'GOBHI COINS / MAKE THE EVERYDAY FEEL GOOD.'},
 {name:'join',label:'A LITTLE BETTER, TOGETHER.'},
];
const smooth = (a: number, b: number, v: number) => { const t = Math.max(0, Math.min(1, (v-a)/(b-a))); return t*t*(3-2*t); };

/** Native scrolling is the input; rendered camera progress owns all visible UI. */
export function mountGobhiStory(root: HTMLElement) {
  const lifecycle = new AbortController(), { signal } = lifecycle;
  const $ = <T extends HTMLElement = HTMLElement>(selector: string) => {
    const element = root.querySelector<T>(selector);
    if (!element) throw new Error(`Missing story element: ${selector}`);
    return element;
  };
  root.classList.remove('no-webgl'); $('.loading').classList.remove('done');
  const canvas = $<HTMLCanvasElement>('#story-canvas');
  const instance = createStoryRenderer(canvas, root);
  if (!instance) return () => lifecycle.abort();
  const renderer = instance;
  let active = 0, reduced = false, queued = 0, renderedScene = '';
  let lastFrame: StoryFrame | undefined, feedbackScene = '', feedbackMessage = '';
  let interactionKey = '';
  let toastTimer: ReturnType<typeof setTimeout> | undefined;
  const totalScroll = () => Math.max(1, document.documentElement.scrollHeight - innerHeight);
  const scrollTarget = () => {
    queued = 0;
    renderer.setProgress(Math.max(0, Math.min(1, scrollY / totalScroll())), reduced);
  };
  function go(index: number) {
    scrollTo({ top: totalScroll() * stops[Math.max(0, Math.min(stops.length-1, index))], behavior: reduced ? 'instant' : 'smooth' });
  }
  function setMotion() {
    root.classList.toggle('reduced-motion', reduced);
    $('#motion').setAttribute('aria-pressed', String(reduced));
    $('#motion').setAttribute('aria-label', reduced ? 'Enable decorative animations' : 'Pause decorative animations');
    $('#motion').innerHTML = '◌ <span>' + (reduced ? 'Calm motion' : 'Motion on') + '</span>';
    scrollTarget();
  }
  function renderInteraction(state: StoryFrame) {
    const waterPhase=state.demo.waterLogs>0?'saved':state.waterScrollProgress>.01?'pouring':'ready';
    const key = state.scene + JSON.stringify(state.demo) + feedbackScene + feedbackMessage + state.rewardPhase + (state.scene===6?Math.round(state.waterDisplay/10)+waterPhase:'');
    if (key === interactionKey) return;
    interactionKey = key;
    const day = state.demo, index = state.scene, action = $<HTMLButtonElement>('#interaction-action');
    $('#water-choices').hidden = index !== 6; $('#meal-choices').hidden = index !== 7;
    root.querySelectorAll<HTMLElement>('[data-water-amount]').forEach(button => button.setAttribute('aria-pressed', String(Number(button.dataset.waterAmount) === day.waterAmount)));
    root.querySelectorAll<HTMLElement>('[data-meal]').forEach(button => button.setAttribute('aria-pressed', String(button.dataset.meal === day.meal)));
    $('#plan-choices').hidden=index!==3;
    $('#context-choices').hidden=index!==3;
    $('#training-choices').hidden=index!==3||day.context==='wellbeing';
    root.querySelectorAll<HTMLElement>('[data-context]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.context===day.context)));
    root.querySelectorAll<HTMLElement>('[data-training-days]').forEach(b=>b.setAttribute('aria-pressed',String(Number(b.dataset.trainingDays)===day.trainingDays)));
    let stat = '', detail = '', label = '', done = false, follow = '';
    if(index===3){stat=contexts[day.context];detail=day.context==='wellbeing'?'Water, steps, sleep and mood.':`${day.trainingDays} training days. Rest has a place, too.`;label=day.planSaved?'Ask Gobhi next':'Save this plan';done=day.planSaved;follow='A little help from Gobhi';}
    if(index===4){stat=day.routineStarted?'Ready for your day':day.routineSaved?'Saved to your routines':'20 minutes. Your kind of good.';detail='Illustrative AI suggestion. You choose what to keep.';label=day.routineStarted?'See your Today':day.routineSaved?'Start this routine':'Save this routine';done=day.routineStarted;follow='Your connected Today';}
    if(index===5){stat=`${littleWins(day)} of 3 little wins`;detail=day.planSaved?'Your saved week, your everyday actions.':'A sample day. Start with one small thing.';label='Start with water';done=true;follow='A little sip';}
    if(index===10){stat=day.buddyShared?'A little win, shared':day.buddyFollowing?'Your people, found':'Meet Asha, your sample buddy';detail=day.buddyShared?'Your effort belongs in the story, too.':'Discover people. Chat with matches. Share your records.';label=day.buddyShared?'Win shared':day.buddyFollowing?'Share your sample win':'Follow Asha';done=day.buddyShared;follow='Explore your world';}
    if(index===11){stat=mapPlaces[day.mapPlace];detail='Illustrative places. Your location stays private.';label='Explore another place';done=true;follow='A little celebration';}

    if (index === 6) { stat = `${(state.waterDisplay/1000).toFixed(2).replace(/0$/,'')} L${waterPhase==='pouring'?' · pouring':' logged'}`; detail = day.waterLogs>0?'A glass at a time.':waterPhase==='pouring'?'Keep scrolling. We’ll save this sip.':'Scroll to pour. Or log it yourself.'; label = `Log ${day.waterAmount} ml`; done = day.waterLogs > 0; follow = 'Then, a little fuel'; if(root.dataset.waterPhase!==waterPhase)root.dataset.waterPhase=waterPhase; }
    if (index === 7) { stat = meals[day.meal].short; detail = day.foodSaved && day.loggedMeal === day.meal ? 'Saved to your sample journal.' : 'Scroll to save. Or log your own.'; done = day.foodSaved && day.loggedMeal === day.meal; label = done ? 'Meal logged ✓' : 'Log this meal'; follow = 'Make a little move'; }
    if (index === 8) { stat = `${day.workoutSets} of 3 sets logged`; detail = day.workoutSaved?'Three little efforts. All remembered.':'Scroll to log. Or tap for your next set.'; done = day.workoutSaved; label = done ? 'Workout saved ✓' : `Log set ${day.workoutSets+1}`; follow = 'See it adding up'; }
    if(index===8&&day.context==='wellbeing'){stat=day.wellbeingDone?'A little reset, saved':'A little room for you';detail='A walk, sleep intention and check-in. No workout needed.';label=day.wellbeingDone?'Intentions saved':'Save sample intentions';done=day.wellbeingDone;follow='See it adding up';}
    if (index === 9) { stat = `${littleWins(day)} little wins`; detail = 'Your sample day, remembered.'; label = day.historyWeek ? 'Back to today' : 'See your week'; done = true; follow = 'Meet your people'; }
    if (index === 12) { stat = state.rewardPhase==='spinning'?'A little suspense...':state.rewardPhase==='won'?'+20 Gobhi coins':littleWins(day)?`${littleWins(day)} little wins`:'Showing up counts.'; detail = 'Sample reward · no cash value'; done = state.rewardPhase==='won'; label = done?'Reward collected ✓':state.rewardPhase==='spinning'?'Spinning…':'Spin the wheel'; follow = 'Join the ecosystem'; if(root.dataset.rewardPhase!==state.rewardPhase)root.dataset.rewardPhase=state.rewardPhase; }
    $('#interaction-stat').textContent = stat; $('#interaction-detail').textContent = detail;
    action.textContent = label;
    action.disabled = ((index === 7 || index === 8) && done) || (index === 12 && state.rewardPhase !== 'idle') || (index===10&&day.buddyShared);
    const phoneAction = $<HTMLButtonElement>('#demo-action');
    phoneAction.disabled = action.disabled;
    phoneAction.setAttribute('aria-label', label);
    const feedback = $('#interaction-feedback');
    const message = index===12&&state.rewardPhase==='spinning'?'Here comes your little win.':index===12&&state.rewardPhase==='won'?'+20 sample Gobhi coins. Nice one!':index===8&&day.workoutScrollSets>=day.workoutSets&&day.workoutScrollSets>0?day.workoutSaved?'Your workout, saved along the way.':`Set ${day.workoutSets}, logged with your scroll.`:feedbackScene === state.screen ? feedbackMessage : index===7&&day.foodScrollLogged?'Lunch, saved with your scroll.':index===6&&day.waterScrollLogged?'A little sip, saved with your scroll.':'Sample day · yours to try';
    if (feedback.textContent !== message) feedback.textContent = message;
    const next = $('#journey-follow'); next.hidden = !done; next.innerHTML = follow + ' <span aria-hidden="true">→</span>';
  }
  function renderFrame(state: StoryFrame) {
    lastFrame = state; active = state.scene;
    const scene = active===8&&state.demo.context==='wellbeing'?{...scenes[active],title:'A LITTLE SPACE.<br> A BETTER DAY.',description:'Steps, sleep and a check-in.<br> Your wellbeing belongs here, too.',word:'BREATHE'}:scenes[active], p = state.progress;
    if (renderedScene !== active+state.demo.context) {
      renderedScene = active+state.demo.context;
      root.dataset.phase = active === 0 ? 'hello' : active === 13 ? 'join' : active >= 3 ? 'app' : 'setup';
      root.dataset.scene = scene.name; $('.app-atmosphere').dataset.word = scene.word || '';
      $('#scene-copy').hidden = active === 0 || active === 13;
      $('#intro-caption').hidden = active !== 0; $('#join-panel').hidden = active !== 13;
      $('#app-interaction').hidden = active < 3 || active > 12;
      $('#scroll-hint').hidden = active >= 3;
      $('#scene-kicker').textContent = scene.kicker || '';
      $('#scene-heading').innerHTML = scene.title || '';
      $('#scene-description').innerHTML = scene.description || '';
    }
    const left = active ? (stops[active-1]+stops[active])/2 : 0;
    const right = active < 13 ? (stops[active]+stops[active+1])/2 : 1;
    const fade = reduced ? 1 : smooth(left,left+(right-left)*.25,p)*(1-smooth(right-(right-left)*.25,right,p));
    $('.app-atmosphere').style.opacity = String(active>=3&&active<=12?.27*fade:0);
    $('#scene-copy').style.opacity = String(active === 2 ? 1-smooth(.18,.21,p) : fade);
    const joinReveal = reduced ? 1 : storyStaging(p, innerWidth < 1024).joinReveal;
    $('#join-panel').style.opacity = String(joinReveal);
    $('#join-panel').style.pointerEvents = joinReveal < .5 ? 'none' : 'auto';
    const panel = $('#app-interaction'); panel.style.opacity = String(fade); panel.style.pointerEvents = fade < .5 ? 'none' : 'auto';
    if (active >= 3 && active <= 12) renderInteraction(state);
    root.querySelectorAll<HTMLButtonElement>('[data-phone-tab]').forEach(button=>{const r=state.navRects.find(r=>r.tab===button.dataset.phoneTab);button.hidden=!r;if(r)Object.assign(button.style,{left:r.x+'px',top:r.y+'px',width:r.width+'px',height:Math.max(28,r.height)+'px'});});
    const button = $('#demo-action'), rect = state.actionRect;
    button.hidden = !rect || active < 3 || active > 12;
    button.style.pointerEvents = fade < .5 ? 'none' : 'auto';
    if(rect){const hitHeight=Math.max(40,rect.height),navTop=state.navRects.length?Math.min(...state.navRects.map(r=>r.y)):Infinity,hitY=Math.min(rect.y,navTop-hitHeight-3);Object.assign(button.style,{left:'0',top:'0',transform:`translate3d(${rect.x}px,${hitY}px,0)`,width:rect.width+'px',height:hitHeight+'px'});}
  }
  function act() {
    if (!lastFrame) return;
    if(lastFrame.screen==='home'){go(6);return;}
    if(lastFrame.screen==='plan'&&lastFrame.demo.planSaved){go(4);return;}
    if(lastFrame.screen==='assistant'&&lastFrame.demo.routineStarted){go(5);return;}
    feedbackScene = lastFrame.screen;
    const message = renderer.act(lastFrame.screen==='workout'&&lastFrame.demo.context==='wellbeing'?'wellbeing':lastFrame.screen);
    feedbackMessage = message;
    if (lastFrame) renderInteraction(lastFrame);
    if(['water','coins','plan','assistant','map','buddies'].includes(lastFrame.screen)){clearTimeout(toastTimer);$('.toast').classList.remove('visible');}
    if (message && !['water','coins','plan','assistant','map','buddies'].includes(lastFrame.screen)) {
      clearTimeout(toastTimer); $('.toast').textContent = message; $('.toast').classList.add('visible');
      toastTimer = setTimeout(() => $('.toast').classList.remove('visible'), 2400);
    }
  }
  root.addEventListener('gobhi:frame', event => renderFrame((event as CustomEvent<StoryFrame>).detail), { signal });
  window.addEventListener('scroll', () => { if (!queued) queued = requestAnimationFrame(scrollTarget); }, { passive: true, signal });
  window.addEventListener('resize', scrollTarget, { signal });
  $('#start-story').addEventListener('click', () => go(1), { signal });
  $('#get-app').addEventListener('click', () => go(13), { signal });
  $('#replay').addEventListener('click', () => { feedbackMessage = ''; feedbackScene = ''; renderer.resetDemo(); go(0); }, { signal });
  $('.brand').addEventListener('click', event => { event.preventDefault(); go(0); }, { signal });
  $('.skip').addEventListener('click', event => { event.preventDefault(); go(3); }, { signal });
  $('#motion').addEventListener('click', () => { reduced = !reduced; setMotion(); }, { signal });
  $('#demo-action').addEventListener('click', act, { signal });
  $('#interaction-action').addEventListener('click', act, { signal });
  $('#journey-follow').addEventListener('click', () => go(active+1), { signal });
  root.querySelectorAll<HTMLElement>('[data-water-amount]').forEach(button => button.addEventListener('click', () => renderer.act('water-amount',Number(button.dataset.waterAmount)), { signal }));
  root.querySelectorAll<HTMLElement>('[data-meal]').forEach(button => button.addEventListener('click', () => renderer.act('meal',button.dataset.meal), { signal }));
  root.querySelectorAll<HTMLElement>('[data-context]').forEach(b=>b.addEventListener('click',()=>renderer.act('context',b.dataset.context),{signal}));
  root.querySelectorAll<HTMLElement>('[data-training-days]').forEach(b=>b.addEventListener('click',()=>renderer.act('training-days',Number(b.dataset.trainingDays)),{signal}));
  root.querySelectorAll<HTMLElement>('[data-phone-tab]').forEach(b=>b.addEventListener('click',()=>go(b.dataset.phoneTab==='Map'?11:b.dataset.phoneTab==='Buddies'?10:b.dataset.phoneTab==='Train'?8:b.dataset.phoneTab==='You'?9:5),{signal}));
  $('#explore-buddies').addEventListener('click',()=>{go(10);$<HTMLDetailsElement>('.story-menu').open=false;},{signal});
  $('#explore-map').addEventListener('click',()=>{go(11);$<HTMLDetailsElement>('.story-menu').open=false;},{signal});
  const dialog = $<HTMLDialogElement>('#about-dialog'), menu = $<HTMLDetailsElement>('.story-menu');
  menu.open = false;
  document.addEventListener('pointerdown', event => { if (event.target instanceof Node && !menu.contains(event.target)) menu.open = false; }, { signal });
  root.addEventListener('keydown', event => { if (event.key === 'Escape' && menu.open) { menu.open = false; menu.querySelector('summary')?.focus(); } }, { signal });
  $('#about').addEventListener('click', () => dialog.showModal(), { signal });
  $('.dialog-close').addEventListener('click', () => dialog.close(), { signal });
  $('.dialog-button').addEventListener('click', () => dialog.close(), { signal });
  dialog.addEventListener('click', event => { const r = dialog.getBoundingClientRect(); if (event.target === dialog && (event.clientX < r.left || event.clientX > r.right || event.clientY < r.top || event.clientY > r.bottom)) dialog.close(); }, { signal });
  root.addEventListener('gobhi:ready', () => { setMotion(); $('.loading').classList.add('done'); }, { signal });
  setMotion();
  return () => { lifecycle.abort(); cancelAnimationFrame(queued); clearTimeout(toastTimer); if (dialog.open) dialog.close(); renderer.dispose(); };
}
