import { createStoryRenderer, type StoryFrame } from './renderer';
import { journeyChapters, journeyStops as stops, littleWins, meals, contexts, mapPlaces, routineSteps } from './journey';
import { phoneHandoff, storyStaging } from './staging';

const scenes = [
 {name:'hello',label:'A LITTLE COMPANY FOR YOUR EVERYDAY.'},
 {name:'phone',kicker:'A LITTLE LOOK INSIDE',title:'Your day.<br> In my hands.',description:'Come along. Let’s make a little room<br> for the everyday that feels good.',label:'YOUR EVERYDAY, IN GOOD HANDS.'},
 {name:'perspective',kicker:'COME OVER HERE',title:'See it from<br> my side.',description:'A little closer.<br> There’s a whole everyday in here.',label:'INTO GOBHI’S EVERYDAY.'},
 {name:'plan',kicker:'START WITH YOUR GOAL',title:'YOUR GOAL.<br> YOUR PLAN.',description:'Home, your gym, or a little wellbeing.<br> Build a week that gets you there.',label:'ONE GOAL / A WEEK THAT FITS.'},
 {name:'assistant',kicker:'A LITTLE HELP FROM GOBHI',title:'ASK A LITTLE.<br> DO A LITTLE.',description:'Your context. A useful suggestion.<br> You choose what to save and start.',label:'ASK GOBHI / A LITTLE HELP, YOUR CHOICE.'},
 {name:'today',kicker:'ONE CONNECTED DAY',title:'YOUR PLAN.<br> YOUR TODAY.',description:'Water, food and a little movement.<br> Every little log belongs to the same day.',label:'TODAY / YOUR LITTLE WINS, TOGETHER.'},
 {name:'water',kicker:'FIRST, A LITTLE HYDRATION',title:'SIP. LOG.<br> LET’S GO.',description:'Choose a glass, then log it.<br> Your total updates in Today.',label:'WATER / EVERY LITTLE SIP COUNTS.'},
 {name:'food',kicker:'THEN, A LITTLE FUEL',title:'GOOD FOOD.<br> GOOD MOOD.',description:'Pick something familiar for lunch.<br> Keep scrolling. We’ll save you a little effort.',label:'FOOD / FAMILIAR MEALS, LESS EFFORT.'},
 {name:'workout',kicker:'TIME FOR YOUR OWN STRONG',title:'YOUR SETS.<br> YOUR STRONG.',description:'A little scroll. One set stronger.<br> Your effort, remembered in Today.',label:'MOVEMENT / YOUR EFFORT, RECORDED.'},
 {name:'history',kicker:'LOOK AT THAT LITTLE DAY',title:'SMALL STEPS.<br> LOOK AT YOU.',description:'Watch your little efforts add up<br> toward your goal. Your day, your week, and room for rest.',label:'PROGRESS / SMALL THINGS, REAL MOMENTUM.'},
 {name:'buddies',kicker:'YOUR PEOPLE, YOUR KIND OF GOOD',title:'YOUR PEOPLE.<br> YOUR PACE.',description:'Find a buddy. Chat. Share your wins.<br> A little stronger, together.',label:'BUDDIES / YOUR PEOPLE ARE PART OF THE PROGRESS.'},
 {name:'map',kicker:'YOUR WORLD, A LITTLE BIGGER',title:'MORE PLACES.<br> MORE YOU.',description:'Explore gyms and places to move.<br> Find your own kind of spot.',label:'MAP / FIND YOUR KIND OF FITNESS.'},
 {name:'coins',kicker:'A LITTLE CELEBRATION',title:'SHOW UP.<br> GLOW UP.',description:'That little day? Worth celebrating.<br> Every win gets you closer to your goal.',label:'GOBHI COINS / MAKE THE EVERYDAY FEEL GOOD.'},
 {name:'join',label:'A LITTLE BETTER, TOGETHER.'},
];
const smooth = (a: number, b: number, v: number) => { const t = Math.max(0, Math.min(1, (v-a)/(b-a))); return t*t*(3-2*t); };
const tabChapters: Record<string, string> = { Home: 'today', Train: 'workout', Map: 'map', Buddies: 'buddies', You: 'history' };

function phoneSummary({ scene, demo: day, rewardPhase }: StoryFrame) {
  const hydration = `${day.water} ml of water logged towards 2.5 litres.`;
  const meal = day.loggedMeal ? `${meals[day.loggedMeal].name} logged.` : 'No meal logged yet.';
  const movement = day.context === 'wellbeing'
    ? (day.wellbeingDone ? 'Wellbeing intentions saved.' : 'Wellbeing intentions are open.')
    : `${day.workoutSets} of 3 workout sets logged.`;
  switch (journeyChapters[scene]) {
    case 'plan':
      return `${day.planSaved ? 'Saved week' : 'Sample week'} for ${contexts[day.context]}. ${day.context === 'wellbeing' ? 'Wellbeing intentions' : `${day.trainingDays} training days`}. Daily targets are 2.5 litres of water, 8,000 steps and 8 hours of sleep.`;
    case 'assistant':
      return `Sample 20-minute routine. ${routineSteps[day.context].join('. ')}. ${day.routineStarted ? 'Ready to start.' : day.routineSaved ? 'Saved to your sample routines.' : 'Ready to review.'}`;
    case 'today':
      return `Today. ${littleWins(day)} of 3 little wins. ${hydration} ${meal} ${movement}`;
    case 'water':
      return `Hydration. ${hydration} Selected glass is ${day.waterAmount} ml.`;
    case 'food': {
      const selected = meals[day.meal];
      return `Lunch preview. ${selected.name}, with ${selected.protein} protein, ${selected.carbs} carbs and ${selected.fat} fat. ${meal}`;
    }
    case 'workout':
      if (day.context === 'wellbeing') return `Wellbeing. A gentle walk, 8 hours of sleep and a mood check-in. ${movement}`;
      return `${(day.loggedWorkoutContext || day.context) === 'home' ? 'Bodyweight squat' : 'Goblet squat with 24 kg'}. Three sets of 10 reps. ${movement}`;
    case 'history':
      return `${day.historyWeek ? 'Illustrative week chart' : 'Today’s progress'}. ${littleWins(day)} little wins today. ${hydration} ${meal} ${movement}`;
    case 'buddies':
      return `Sample buddy Asha. ${day.buddyShared ? 'You shared a sample win.' : day.buddyFollowing ? 'You follow Asha.' : 'You can follow Asha and then share a sample win.'}`;
    case 'map':
      return `Sample map. Selected place is ${mapPlaces[day.mapPlace]}. Use Explore another place to cycle through the sample locations.`;
    case 'coins':
      return rewardPhase === 'won' ? `${day.coins} sample Gobhi coins collected.` : rewardPhase === 'spinning' ? 'The sample reward wheel is spinning.' : 'Spin the wheel to collect a sample reward.';
    default:
      return '';
  }
}

/** Native scrolling is the input; rendered camera progress owns all visible UI. */
export function mountGobhiStory(root: HTMLElement) {
  const lifecycle = new AbortController(), { signal } = lifecycle;
  const $ = <T extends HTMLElement = HTMLElement>(selector: string) => {
    const element = root.querySelector<T>(selector);
    if (!element) throw new Error(`Missing story element: ${selector}`);
    return element;
  };
  root.classList.remove('no-webgl'); $('.loading').classList.remove('done');
  $('.story-content').inert = true;
  const canvas = $<HTMLCanvasElement>('#story-canvas');
  const instance = createStoryRenderer(canvas, root);
  if (!instance) return () => lifecycle.abort();
  const renderer = instance;
  const flowingEnding = matchMedia('(max-width: 639px) and (max-height: 640px)');
  let active = 0, reduced = false, queued = 0, renderedScene = '';
  let focusDestination: number | undefined;
  let lastFrame: StoryFrame | undefined, feedbackScene = '', feedbackMessage = '';
  let interactionKey = '';
  let toastTimer: ReturnType<typeof setTimeout> | undefined;
  const totalScroll = () => Math.max(1, flowingEnding.matches
    ? $('#join').getBoundingClientRect().top + scrollY
    : document.documentElement.scrollHeight - innerHeight);
  const scrollTarget = () => {
    queued = 0;
    renderer.setProgress(Math.max(0, Math.min(1, scrollY / totalScroll())), reduced);
  };
  function focusChapter(index: number) {
    $(index === 0 ? '#story-heading' : index === stops.length - 1 ? '#join-heading' : '#scene-heading').focus({ preventScroll: true });
  }
  function go(chapter: string, { instant = false, focus = false, phone = false } = {}) {
    const index = journeyChapters.indexOf(chapter);
    if (index === -1) return;
    focusDestination = focus ? index : undefined;
    if (phone) renderer.navigate(stops[index]);
    scrollTo({ top: totalScroll() * stops[index], behavior: reduced || instant || phone ? 'instant' : 'smooth' });
    if (focus && active === index && Math.abs((lastFrame?.progress ?? 0) - stops[index]) < .002) {
      focusChapter(index);
      focusDestination = undefined;
    }
    scrollTarget();
  }
  const goToHash = () => go(location.hash.slice(1), { instant: true, focus: true });
  function followAnchor(event: MouseEvent) {
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    const { hash } = event.currentTarget as HTMLAnchorElement;
    history.replaceState(history.state, '', hash);
    go(hash.slice(1), { instant: true, focus: true });
  }
  function setMotion() {
    root.classList.toggle('reduced-motion', reduced);
    $('#motion').setAttribute('aria-pressed', String(reduced));
    $('#motion').setAttribute('aria-label', reduced ? 'Enable decorative animations' : 'Pause decorative animations');
    $('#motion').innerHTML = '◌ <span>' + (reduced ? 'Calm motion' : 'Motion on') + '</span>';
    scrollTarget();
  }
  function renderInteraction(state: StoryFrame) {
    const waterPhase=state.waterEntry==='saved'?'saved':state.waterPreview>1?'pouring':'ready';
    const key = state.scene + JSON.stringify(state.demo) + feedbackScene + feedbackMessage + state.rewardPhase + (state.scene===6?waterPhase:'');
    if (key === interactionKey) return;
    interactionKey = key;
    const day = state.demo, index = state.scene, action = $<HTMLButtonElement>('#interaction-action');
    $('#water-choices').hidden = index !== 6 || waterPhase==='saved'; $('#meal-choices').hidden = index !== 7;
    root.querySelectorAll<HTMLElement>('[data-water-amount],[data-phone-water-amount]').forEach(button => button.setAttribute('aria-pressed', String(Number(button.dataset.waterAmount ?? button.dataset.phoneWaterAmount) === day.waterAmount)));
    root.querySelectorAll<HTMLElement>('[data-meal]').forEach(button => button.setAttribute('aria-pressed', String(button.dataset.meal === day.meal)));
    $('#plan-choices').hidden=index!==3;
    $('#context-choices').hidden=index!==3;
    $('#training-choices').hidden=index!==3||day.context==='wellbeing';
    root.querySelectorAll<HTMLElement>('[data-context]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.context===day.context)));
    root.querySelectorAll<HTMLElement>('[data-training-days]').forEach(b=>b.setAttribute('aria-pressed',String(Number(b.dataset.trainingDays)===day.trainingDays)));
    let stat = '', detail = '', label = '', done = false, follow = '';
    if(index===3){stat=contexts[day.context];detail=day.context==='wellbeing'?'Water, steps, sleep and mood.':`${day.trainingDays} training days. Rest has a place, too.`;label=day.planSaved?'Ask Gobhi next':'Save this plan';done=day.planSaved;follow='A little help from Gobhi';}
    if(index===4){stat=day.routineStarted?'Ready for your day':day.routineSaved?'Saved to your routines':'20 minutes. Your kind of good.';detail='Illustrative AI suggestion. You choose what to keep.';label=day.routineStarted?'See your Today':day.routineSaved?'Start this routine':'Save this routine';done=day.routineStarted;follow='Your connected Today';}
    if(index===5){stat=`${littleWins(day)} of 3 little wins`;detail=`${day.water} ml of water logged in Today.`;label='Open water log';}
    if(index===10){stat=day.buddyShared?'A little win, shared':day.buddyFollowing?'Your people, found':'Meet Asha, your sample buddy';detail=day.buddyShared?'Your effort belongs in the story, too.':'Discover people. Chat with matches. Share your records.';label=day.buddyShared?'Win shared':day.buddyFollowing?'Share your sample win':'Follow Asha';done=day.buddyShared;follow='Explore your world';}
    if(index===11){stat=mapPlaces[day.mapPlace];detail='Illustrative places. Your location stays private.';label='Explore another place';done=true;follow='A little celebration';}

    if (index === 6) {
      stat = `${day.water} ml logged`;
      detail = waterPhase==='saved'?'+ '+day.waterAmount+' ml saved to Today.':waterPhase==='pouring'?'Preview pour. Pick a glass to log it.':'Choose how much water to log.';
      label = waterPhase==='saved'?'Back to Today':`Log ${day.waterAmount} ml`;
      done = waterPhase==='saved'; follow = 'Then, a little fuel';
      root.dataset.waterPhase=waterPhase;
    }
    if (index === 7) { stat = meals[day.meal].short; detail = day.foodSaved && day.loggedMeal === day.meal ? 'Saved to your sample journal.' : 'Scroll to save. Or log your own.'; done = day.foodSaved && day.loggedMeal === day.meal; label = done ? 'Meal logged ✓' : 'Log this meal'; follow = 'Make a little move'; }
    if (index === 8) { stat = `${day.workoutSets} of 3 sets logged`; detail = day.workoutSaved?'Three little efforts. All remembered.':'Scroll to log. Or tap for your next set.'; done = day.workoutSaved; label = done ? 'Workout saved ✓' : `Log set ${day.workoutSets+1}`; follow = 'See it adding up'; }
    if(index===8&&day.context==='wellbeing'){stat=day.wellbeingDone?'A little reset, saved':'A little room for you';detail='A walk, sleep intention and check-in. No workout needed.';label=day.wellbeingDone?'Intentions saved':'Save sample intentions';done=day.wellbeingDone;follow='See it adding up';}
    if (index === 9) { stat = `${littleWins(day)} little wins`; detail = 'Your sample day, remembered.'; label = day.historyWeek ? 'Back to today' : 'See your week'; done = true; follow = 'Meet your people'; }
    if (index === 12) { stat = state.rewardPhase==='spinning'?'A little suspense...':state.rewardPhase==='won'?'+20 Gobhi coins':littleWins(day)?`${littleWins(day)} little wins`:'Showing up counts.'; detail = 'Sample reward · no cash value'; done = state.rewardPhase==='won'; label = done?'Reward collected ✓':state.rewardPhase==='spinning'?'Spinning…':'Spin the wheel'; follow = 'Get the app'; if(root.dataset.rewardPhase!==state.rewardPhase)root.dataset.rewardPhase=state.rewardPhase; }
    $('#interaction-stat').textContent = stat; $('#interaction-detail').textContent = detail;
    const summary = $('#phone-screen-summary');
    const description = phoneSummary(state);
    if (summary.textContent !== description) summary.textContent = description;
    action.textContent = label;
    action.disabled = ((index === 7 || index === 8) && done) || (index === 12 && state.rewardPhase !== 'idle') || (index===10&&day.buddyShared);
    const phoneAction = $<HTMLButtonElement>('#demo-action');
    phoneAction.disabled = action.disabled;
    phoneAction.setAttribute('aria-label', label);
    const feedback = $('#interaction-feedback');
    const message = index===12&&state.rewardPhase==='spinning'?'Here comes your little win.':index===12&&state.rewardPhase==='won'?'+20 sample Gobhi coins. Nice one!':index===8&&day.workoutScrollSets>=day.workoutSets&&day.workoutScrollSets>0?day.workoutSaved?'Your workout, saved along the way.':`Set ${day.workoutSets}, logged with your scroll.`:index===6&&waterPhase!=='saved'?'Sample day · yours to try':feedbackScene === state.screen ? feedbackMessage : index===7&&day.foodScrollLogged?'Lunch, saved with your scroll.':'Sample day · yours to try';
    if (feedback.textContent !== message) feedback.textContent = message;
    const next = $('#journey-follow'); next.hidden = !done; next.innerHTML = follow + ' <span aria-hidden="true">→</span>';
  }
  function renderFrame(state: StoryFrame) {
    lastFrame = state; active = state.scene;
    const scene = active===8&&state.demo.context==='wellbeing'?{...scenes[active],title:'A LITTLE SPACE.<br> A BETTER DAY.',description:'Steps, sleep and a check-in.<br> Your wellbeing belongs here, too.'}:scenes[active], p = state.progress;
    if (renderedScene !== active+state.demo.context) {
      renderedScene = active+state.demo.context;
      root.dataset.phase = active === 0 ? 'hello' : active === 13 ? 'join' : active >= 3 ? 'app' : 'setup';
      root.dataset.scene = scene.name;
      $('#scene-copy').hidden = active === 0 || active === 13;
      $('#intro-caption').hidden = active !== 0; $('#join-panel').hidden = active !== 13;
      $('#app-interaction').hidden = active < 3 || active > 12;
      $('#scroll-hint').hidden = active >= 3;
      $('#scene-kicker').textContent = scene.kicker || '';
      $('#scene-heading').innerHTML = scene.title || '';
      if (active >= 3 && active <= 12) $('#scene-heading').setAttribute('aria-describedby', 'phone-screen-summary');
      else $('#scene-heading').removeAttribute('aria-describedby');
      $('#scene-description').innerHTML = scene.description || '';
      $('.edition').textContent = scene.label || '';
    }
    root.style.setProperty('--story-p', p.toFixed(4));
    const left = active ? (stops[active-1]+stops[active])/2 : 0;
    const right = active < 13 ? (stops[active]+stops[active+1])/2 : 1;
    const fade = reduced ? 1 : smooth(left,left+(right-left)*.25,p)*(1-smooth(right-(right-left)*.25,right,p))
      * (active === 3 ? smooth(phoneHandoff.settled, stops[3] - .0005, p) : 1);
    $('#scene-copy').style.opacity = String(active === 2 ? 1-smooth(.18,.21,p) : fade);
    const joinReveal = reduced ? 1 : storyStaging(p, innerWidth < 1024).joinReveal;
    $('#join-panel').style.opacity = String(joinReveal);
    $('#join-panel').style.pointerEvents = joinReveal < .5 ? 'none' : 'auto';
    $('#join-panel').inert = joinReveal < .5;
    const blocked = fade < .5 || state.phoneTransitioning;
    const panel = $('#app-interaction'); panel.style.opacity = String(fade); panel.style.pointerEvents = blocked ? 'none' : 'auto';
    panel.inert = blocked;
    if (active >= 3 && active <= 12) renderInteraction(state);
    const compactNav = state.navRects.some(rect => rect.width < 24);
    $('.story-controls').classList.toggle('compact-phone-nav', compactNav);
    root.querySelectorAll<HTMLButtonElement>('[data-phone-tab]').forEach(button => {
      const rect = state.navRects.find(item => item.tab === button.dataset.phoneTab);
      button.hidden = !rect;
      button.inert = state.phoneTransitioning;
      if (!rect) return;
      button.setAttribute('aria-current', String(tabChapters[rect.tab] === scene.name));
      if (compactNav) button.removeAttribute('style');
      else Object.assign(button.style, { left: rect.x + 'px', top: rect.y + 'px', width: rect.width + 'px', height: Math.max(28, rect.height) + 'px' });
    });
    const button = $('#demo-action'), rect = state.actionRect;
    button.hidden = !rect || active < 3 || active > 12;
    button.inert = blocked;
    const optionsBottom = Math.max(0, ...state.waterAmountRects.map(option => option.y + option.height));
    if(rect){
      const navTop=Math.min(Infinity,...state.navRects.map(r=>r.y));
      const hitHeight=Math.max(rect.height,Math.min(40,navTop-optionsBottom-4));
      const hitY=Math.max(optionsBottom+1,Math.min(rect.y,navTop-hitHeight-3));
      placeHotspot(button,{...rect,y:hitY,height:hitHeight},blocked);
    }
    placeHotspot($('#phone-water-row'),state.waterRowRect,blocked,32);
    root.querySelectorAll<HTMLButtonElement>('[data-phone-water-amount]').forEach(choice => {
      const option=state.waterAmountRects.find(rect=>rect.amount===Number(choice.dataset.phoneWaterAmount));
      const hitHeight=option?Math.max(28,option.height):0;
      placeHotspot(choice,option?{...option,y:option.y+option.height-hitHeight,height:hitHeight}:null,blocked);
    });
    if (!state.phoneTransitioning && focusDestination === active && Math.abs(p - stops[active]) < .002) {
      focusChapter(active);
      focusDestination = undefined;
    }
  }
  function placeHotspot(button: HTMLElement, rect: StoryFrame['actionRect'], blocked: boolean, minHeight = 0) {
    button.hidden = !rect;
    button.inert = blocked;
    if (!rect) return;
    const height = Math.max(minHeight, rect.height);
    const y = rect.y-(height-rect.height)/2;
    Object.assign(button.style,{left:'0',top:'0',transform:`translate3d(${rect.x}px,${y}px,0)`,width:rect.width+'px',height:height+'px'});
  }
  const openWater = () => go('water', { focus: true, phone: true });
  function act() {
    if (!lastFrame || lastFrame.phoneTransitioning) return;
    if(lastFrame.screen==='home'){openWater();return;}
    if(lastFrame.screen==='water' && lastFrame.waterEntry==='saved'){go('today', { focus: true, phone: true });return;}
    if(lastFrame.screen==='plan'&&lastFrame.demo.planSaved){go('assistant', { focus: true });return;}
    if(lastFrame.screen==='assistant'&&lastFrame.demo.routineStarted){go('today', { focus: true });return;}
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
  window.addEventListener('hashchange', goToHash, { signal });
  $('#start-story').addEventListener('click', () => go('phone', { focus: true }), { signal });
  $('#get-app').addEventListener('click', () => go('join', { focus: true }), { signal });
  $('#replay').addEventListener('click', () => {
    feedbackMessage = ''; feedbackScene = ''; renderer.resetDemo();
    if (journeyChapters.includes(location.hash.slice(1))) history.replaceState(history.state, '', location.pathname + location.search);
    go('hello', { focus: true });
  }, { signal });
  $('.brand').addEventListener('click', followAnchor, { signal });
  $('.skip').addEventListener('click', followAnchor, { signal });
  $('#motion').addEventListener('click', () => { reduced = !reduced; setMotion(); }, { signal });
  $('#demo-action').addEventListener('click', act, { signal });
  $('#phone-water-row').addEventListener('click', openWater, { signal });
  $('#interaction-action').addEventListener('click', act, { signal });
  $('#journey-follow').addEventListener('click', () => go(journeyChapters[active+1], { focus: true }), { signal });
  root.querySelectorAll<HTMLElement>('[data-water-amount],[data-phone-water-amount]').forEach(button => button.addEventListener('click', () => renderer.act('water-amount',Number(button.dataset.waterAmount ?? button.dataset.phoneWaterAmount)), { signal }));
  root.querySelectorAll<HTMLElement>('[data-meal]').forEach(button => button.addEventListener('click', () => renderer.act('meal',button.dataset.meal), { signal }));
  root.querySelectorAll<HTMLElement>('[data-context]').forEach(b=>b.addEventListener('click',()=>renderer.act('context',b.dataset.context),{signal}));
  root.querySelectorAll<HTMLElement>('[data-training-days]').forEach(b=>b.addEventListener('click',()=>renderer.act('training-days',Number(b.dataset.trainingDays)),{signal}));
  root.querySelectorAll<HTMLElement>('[data-phone-tab]').forEach(b => b.addEventListener('click', () => go(tabChapters[b.dataset.phoneTab!], { focus: true, phone: true }), { signal }));
  $('#explore-buddies').addEventListener('click',()=>{go('buddies', { focus: true });$<HTMLDetailsElement>('.story-menu').open=false;},{signal});
  $('#explore-map').addEventListener('click',()=>{go('map', { focus: true });$<HTMLDetailsElement>('.story-menu').open=false;},{signal});
  const dialog = $<HTMLDialogElement>('#about-dialog'), menu = $<HTMLDetailsElement>('.story-menu');
  menu.open = false;
  document.addEventListener('pointerdown', event => { if (event.target instanceof Node && !menu.contains(event.target)) menu.open = false; }, { signal });
  root.addEventListener('keydown', event => { if (event.key === 'Escape' && menu.open) { menu.open = false; menu.querySelector('summary')?.focus(); } }, { signal });
  $('#about').addEventListener('click', () => dialog.showModal(), { signal });
  $('.dialog-close').addEventListener('click', () => dialog.close(), { signal });
  $('.dialog-button').addEventListener('click', () => dialog.close(), { signal });
  dialog.addEventListener('click', event => { const r = dialog.getBoundingClientRect(); if (event.target === dialog && (event.clientX < r.left || event.clientX > r.right || event.clientY < r.top || event.clientY > r.bottom)) dialog.close(); }, { signal });
  root.addEventListener('gobhi:ready', () => {
    $('.story-content').inert = false;
    $('.loading').classList.add('done');
    goToHash();
  }, { signal });
  setMotion();
  return () => { lifecycle.abort(); cancelAnimationFrame(queued); clearTimeout(toastTimer); if (dialog.open) dialog.close(); renderer.dispose(); };
}
