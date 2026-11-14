export const journeyStops = [0, .11, .23, .35, .415, .48, .545, .61, .675, .73, .78, .825, .875, 1];
export const journeyScreens = ['home','home','home','plan','assistant','home','water','food','workout','history','buddies','map','coins','home'];
export const visualScenes = [0,1,2,3,3,3,4,5,6,7,3,3,8,9];
export const chapterIndex = (p: number) => { let i=0;for(let n=1;n<journeyStops.length;n++)if(p>=(journeyStops[n-1]+journeyStops[n])/2)i=n;return i; };
export const chapterAt = (p: number) => journeyScreens[chapterIndex(p)];
export const tourTiming = { waterStart:.520, waterEnd:.562, waterSave:.568, mealStart:.585, mealEnd:.632, workoutStart:.650, workoutEnd:.697, historyStart:.715, historyEnd:.758, coinSave:.883 };
export const contexts = { home:'At home', gym:'My gym', wellbeing:'Wellbeing' };
export const mapPlaces = ['Neighbourhood strength','Move & stretch studio','Your next little adventure'];
export const meals = {
  dal: { name: 'Dal, rice & a little sabzi', short: 'Dal & rice', protein: '18g', carbs: '62g', fat: '12g' },
  paneer: { name: 'Paneer & a colourful bowl', short: 'Paneer bowl', protein: '26g', carbs: '38g', fat: '18g' },
};
export type Meal = keyof typeof meals;
export const createDemoDay = () => ({
  context: 'home' as keyof typeof contexts, trainingDays: 3, planSaved: false, routineSaved: false, routineStarted: false, wellbeingDone: false, buddyFollowing: false, buddyShared: false, mapPlace: 0,
  water: 1000, waterAmount: 250, waterLogs: 0, waterScrollLogged: false, meal: 'dal' as Meal,
  loggedMeal: null as Meal | null, foodSaved: false, foodScrollLogged: false, workoutSets: 0,
  loggedWorkoutContext: null as keyof typeof contexts | null, workoutSaved: false, workoutScrollSets: 0, historyWeek: false, coinsCollected: false, coins: 0,
});
export type DemoDay = ReturnType<typeof createDemoDay>;
export const littleWins = (day: DemoDay) => Number(day.waterLogs > 0) + Number(day.foodSaved) + Number(day.context==='wellbeing'?day.wellbeingDone:day.workoutSaved);
export function waterScrollProgress(progress: number) {
  const t = Math.max(0, Math.min(1, (progress - tourTiming.waterStart) / (tourTiming.waterEnd-tourTiming.waterStart)));
  return t*t*(3-2*t);
}
export const rewardSpinDuration = 2800;
export function rewardLandingAngle(start: number) {
  const turn=Math.PI*2;
  return start+turn*4+((2.15-start)%turn+turn)%turn;
}
export function chapterProgress(progress: number, start: number, end: number) {
  const t=Math.max(0,Math.min(1,(progress-start)/(end-start)));
  return t*t*(3-2*t);
}
export function scrollWorkoutSets(progress: number) {
  return [.659,.677,.695].filter(point=>progress>=point).length;
}

/** A connected sample day, with no persistence or writes to the visitor's account. */
export function applyDemoAction(day: DemoDay, action: string, value?: string | number) {
  const state = { ...day };
  let message = '', celebrate = false;
  if(action==='context' && (value==='home'||value==='gym'||value==='wellbeing')) { state.context=value;state.planSaved=false;state.routineSaved=false;state.routineStarted=false; }
  if(action==='training-days' && (value===2||value===3||value===4)) { state.trainingDays=value;state.planSaved=false; }
  if(action==='plan') { state.planSaved=true;message='Your sample plan is saved. Your completed habits stay with you.'; }
  if(action==='assistant') { if(!state.routineSaved){state.routineSaved=true;message='Suggestion saved to your sample routines. Your weekly schedule stays yours.';}else{state.routineStarted=true;message=state.context==='wellbeing'?'Your little reset is ready.':'Your 20-minute routine is ready to start.';} }
  if(action==='wellbeing') { state.wellbeingDone=true;message='A walk, a sleep intention, a little check-in. Saved to this sample day.';celebrate=true; }
  if(action==='buddies') { if(!state.buddyFollowing){state.buddyFollowing=true;message='Following Asha in this sample. A little encouragement goes a long way.';}else if(!state.buddyShared){state.buddyShared=true;message='Your little win is shared to the sample feed.';}else message='Your sample win is already shared.'; }
  if(action==='map') { state.mapPlace=(state.mapPlace+1)%mapPlaces.length;message=mapPlaces[state.mapPlace]+' ? illustrative place'; }
  if (action === 'water-amount' && (value === 250 || value === 500)) state.waterAmount = value;
  if (action === 'meal' && (value === 'dal' || value === 'paneer')) state.meal = value;
  if (action === 'water-scroll' && (state.waterScrollLogged || state.waterLogs > 0)) return { state, message, celebrate };
  if (action === 'water' || action === 'water-scroll') {
    state.water += state.waterAmount; state.waterLogs++; celebrate = true;
    if (action === 'water-scroll') state.waterScrollLogged = true;
    message = action === 'water-scroll' ? `${state.waterAmount} ml saved with your scroll.` : `${state.waterAmount} ml logged. A little good, added to your day.`;
  }
  if (action === 'food-scroll' && state.foodSaved) return { state, message, celebrate };
  if (action === 'food' || action === 'food-scroll') {
    if (state.foodSaved && state.loggedMeal === state.meal) message = 'Your meal is already in this sample journal.';
    else { state.foodSaved = true; state.loggedMeal = state.meal; state.foodScrollLogged=action==='food-scroll'; celebrate = true; message = `${meals[state.meal].short}, logged. Your day is coming together.`; }
  }
  if(action==='workout-scroll'){
    const count=typeof value==='number'&&Number.isFinite(value)?Math.max(0,Math.min(3,Math.floor(value))):0;
    if(count>state.workoutSets){if(state.workoutSets===0)state.loggedWorkoutContext=state.context;state.workoutSets=count;state.workoutSaved=count===3;state.workoutScrollSets=count;celebrate=true;message=count===3?'Three sets. All you. Your workout is saved.':`Set ${count} logged. One set stronger.`;}
  }
  if (action === 'workout') {
    if (state.workoutSaved) message = 'All three sets are already saved.';
    else {
      if(state.workoutSets===0)state.loggedWorkoutContext=state.context;
      state.workoutSets++; state.workoutSaved = state.workoutSets === 3; celebrate = true;
      message = state.workoutSaved ? 'Three sets. All you. Your workout is saved.' : `Set ${state.workoutSets} logged. One set stronger.`;
    }
  }
  if (action === 'history') { state.historyWeek = !state.historyWeek; message = state.historyWeek ? 'Your sample week, with today’s little wins.' : 'Everything you just logged, together.'; }
  if (action === 'coins') {
    if (state.coinsCollected) message = 'Your sample reward is already collected.';
    else { state.coinsCollected = true; state.coins += 20; celebrate = true; message = '+20 sample Gobhi coins. A little celebration for showing up.'; }
  }
  return { state, message, celebrate };
}
