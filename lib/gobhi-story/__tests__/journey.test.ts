import { describe, expect, it } from 'vitest';
import { applyDemoAction, createDemoDay, littleWins, waterScrollProgress, scrollWorkoutSets, rewardLandingAngle, tourTiming } from '../journey';
import { sampleCameraPath } from '../motion';

describe('a connected sample day', () => {
  it('logs the chosen water amount repeatedly without changing the initial day', () => {
    const initial = createDemoDay();
    let day = applyDemoAction(initial, 'water-amount', 500).state;
    day = applyDemoAction(day, 'water').state;
    day = applyDemoAction(day, 'water').state;
    expect(day.water).toBe(2000); expect(day.waterLogs).toBe(2);
    expect(initial.water).toBe(1000); expect(littleWins(day)).toBe(1);
  });
  it('keeps the logged meal when a different meal is only being previewed', () => {
    let day = applyDemoAction(createDemoDay(), 'meal', 'paneer').state;
    day = applyDemoAction(day, 'food').state;
    day = applyDemoAction(day, 'meal', 'dal').state;
    expect(day.meal).toBe('dal'); expect(day.loggedMeal).toBe('paneer');
    expect(applyDemoAction(day, 'food').state.loggedMeal).toBe('dal');
  });
  it('records each set and saves only after the third, without creating extra sets', () => {
    let day = createDemoDay();
    for (let set = 1; set <= 3; set++) {
      day = applyDemoAction(day, 'workout').state;
      expect(day.workoutSets).toBe(set); expect(day.workoutSaved).toBe(set === 3);
    }
    const again = applyDemoAction(day, 'workout');
    expect(again.state.workoutSets).toBe(3); expect(again.celebrate).toBe(false);
  });
  it('carries water, food and workout wins into history and awards the sample reward once', () => {
    let day = createDemoDay();
    for (const action of ['water', 'food', 'workout', 'workout', 'workout', 'history']) day = applyDemoAction(day, action).state;
    expect(littleWins(day)).toBe(3); expect(day.water).toBe(1250);
    expect(day.loggedMeal).toBe('dal'); expect(day.historyWeek).toBe(true);
    day = applyDemoAction(day, 'coins').state;
    const again = applyDemoAction(day, 'coins');
    expect(again.state.coins).toBe(20); expect(again.celebrate).toBe(false);
    expect(createDemoDay().coins).toBe(0);
  });
  it('ignores unsupported meal and water choices', () => {
    const initial = createDemoDay();
    expect(applyDemoAction(initial, 'water-amount', -500).state).toEqual(initial);
    expect(applyDemoAction(initial, 'meal', 'unknown').state).toEqual(initial);
  });
});

describe('scrolling a little sip into the day', () => {
  it('saves the selected amount once even when the visitor scrubs back and forth', () => {
    let day = applyDemoAction(createDemoDay(), 'water-amount', 500).state;
    day = applyDemoAction(day, 'water-scroll').state;
    expect(day.water).toBe(1500); expect(day.waterLogs).toBe(1); expect(day.waterScrollLogged).toBe(true);
    expect(applyDemoAction(day, 'water-scroll').state).toEqual(day);
    expect(littleWins(day)).toBe(1);
  });
  it('lets a manual glass take precedence over the automatic scroll entry', () => {
    const manual = applyDemoAction(createDemoDay(), 'water').state;
    expect(applyDemoAction(manual, 'water-scroll').state).toEqual(manual);
    expect(manual.waterScrollLogged).toBe(false);
    expect(applyDemoAction(manual, 'water').state.water).toBe(1500);
  });
  it('allows a new scroll sip after replay creates a fresh day', () => {
    const first=applyDemoAction(createDemoDay(),'water-scroll').state;
    const fresh=createDemoDay();
    expect(fresh.waterScrollLogged).toBe(false);
    expect(applyDemoAction(fresh,'water-scroll').state.water).toBe(first.water);
  });
  it('scrubs a smooth, bounded preview without changing the journal', () => {
    expect(waterScrollProgress(tourTiming.waterStart-.01)).toBe(0);expect(waterScrollProgress(tourTiming.waterEnd+.01)).toBe(1);
    expect(waterScrollProgress((tourTiming.waterStart+tourTiming.waterEnd)/2)).toBeGreaterThan(0);expect(waterScrollProgress((tourTiming.waterStart+tourTiming.waterEnd)/2)).toBeLessThan(1);
    expect(waterScrollProgress(tourTiming.waterStart+.01)).toBeLessThan(waterScrollProgress(tourTiming.waterEnd-.01));
    expect(createDemoDay().waterLogs).toBe(0);
  });
});

describe('the rest of Gobhi’s scroll day', () => {
  it('saves the selected meal once and respects a manually saved lunch', () => {
    let day=applyDemoAction(createDemoDay(),'meal','paneer').state;
    day=applyDemoAction(day,'food-scroll').state;
    expect(day.loggedMeal).toBe('paneer');expect(day.foodScrollLogged).toBe(true);
    expect(applyDemoAction(day,'food-scroll').celebrate).toBe(false);
    const manual=applyDemoAction(createDemoDay(),'food').state;
    expect(applyDemoAction(manual,'food-scroll').state).toEqual(manual);
  });
  it('logs one set at each milestone and never duplicates or reverses a set', () => {
    let day=createDemoDay();
    for(const [p,count] of [[.650,0],[.666,1],[.685,2],[.700,3]]){
      day=applyDemoAction(day,'workout-scroll',scrollWorkoutSets(p)).state;
      expect(day.workoutSets).toBe(count);expect(day.workoutSaved).toBe(count===3);
    }
    expect(applyDemoAction(day,'workout-scroll',1).state.workoutSets).toBe(3);
    expect(applyDemoAction(day,'workout-scroll',3).celebrate).toBe(false);
  });
  it('merges manually logged sets with scroll progress instead of adding them twice', () => {
    let day=applyDemoAction(createDemoDay(),'workout').state;
    day=applyDemoAction(day,'workout-scroll',1).state;expect(day.workoutSets).toBe(1);
    day=applyDemoAction(day,'workout-scroll',2).state;expect(day.workoutSets).toBe(2);
    day=applyDemoAction(day,'workout').state;expect(day.workoutSets).toBe(3);expect(day.workoutSaved).toBe(true);
  });
  it('lands on the same 20-coin sector from any idle angle, with at least four forward turns', () => {
    const turn=Math.PI*2,values=[10,15,20,25,30,50];
    for(const start of [-40,0,.2,2.15,7,40,123]){
      const landing=rewardLandingAngle(start),pointer=((-Math.PI/2-landing)%turn+turn)%turn;
      expect(landing-start).toBeGreaterThanOrEqual(turn*4-1e-9);
      expect(values[Math.floor(pointer/(turn/6))]).toBe(20);
    }
  });
});

const key = (p: number, eye: number[]) => ({ p, eye, target: [0, 0, 0], me: eye.map(v => v+1), mt: [0, 1, 0] });
describe('continuous camera motion', () => {
  const keys = [key(0,[0,0,0]),key(.4,[4,2,-2]),key(.8,[7,3,1]),key(1,[8,4,2])];
  it('passes through every approved anchor and clamps the ends', () => {
    for (const point of keys) expect(sampleCameraPath(keys, point.p, false).eye).toEqual(point.eye);
    expect(sampleCameraPath(keys, -1, false).eye).toEqual(keys[0].eye);
    expect(sampleCameraPath(keys, 2, true).eye).toEqual(keys[3].me);
  });
  it('maintains velocity through waypoints instead of stopping at every one', () => {
    const e = 1e-5;
    for (const p of [.4, .8]) {
      const a=sampleCameraPath(keys,p-e,false).eye,b=sampleCameraPath(keys,p,false).eye,c=sampleCameraPath(keys,p+e,false).eye;
      for (let axis=0;axis<3;axis++) expect(Math.abs((b[axis]-a[axis])/e-(c[axis]-b[axis])/e)).toBeLessThan(.02);
      expect(Math.abs(c[0]-a[0])).toBeGreaterThan(e);
    }
  });
  it('does not overshoot or drift during the stationary app tour', () => {
    for (let i=0;i<keys.length-1;i++) for(let t=0;t<=1;t+=.05){
      const v=sampleCameraPath(keys,keys[i].p+(keys[i+1].p-keys[i].p)*t,false).eye;
      v.forEach((value,axis)=>{expect(value).toBeGreaterThanOrEqual(Math.min(keys[i].eye[axis],keys[i+1].eye[axis])-1e-8);expect(value).toBeLessThanOrEqual(Math.max(keys[i].eye[axis],keys[i+1].eye[axis])+1e-8);});
    }
    const paused=[key(0,[0,0,0]),key(.4,[4,2,0]),key(.8,[4,2,0]),key(1,[8,3,1])];
    expect(sampleCameraPath(paused,.6,false).eye).toEqual([4,2,0]);
  });
});


describe('planning and contextual suggestions',()=>{
 it('keeps completed logs while editing and saving a weekly plan',()=>{
  let day=applyDemoAction(createDemoDay(),'water').state;
  day=applyDemoAction(day,'training-days',4).state;day=applyDemoAction(day,'plan').state;
  expect(day.trainingDays).toBe(4);expect(day.planSaved).toBe(true);expect(day.water).toBe(1250);expect(day.waterLogs).toBe(1);
 });
 it('requires a saved suggestion before starting and never rewrites the weekly schedule',()=>{
  let day=applyDemoAction(createDemoDay(),'plan').state;
  day=applyDemoAction(day,'assistant').state;expect(day.routineSaved).toBe(true);expect(day.routineStarted).toBe(false);
  day=applyDemoAction(day,'assistant').state;expect(day.routineStarted).toBe(true);expect(day.trainingDays).toBe(3);expect(day.planSaved).toBe(true);
 });
 it('counts wellbeing intentions instead of workout sets in a wellbeing day',()=>{
  let day=applyDemoAction(createDemoDay(),'context','wellbeing').state;
  for(const action of ['water','food','wellbeing'])day=applyDemoAction(day,action).state;
  expect(littleWins(day)).toBe(3);expect(day.workoutSets).toBe(0);expect(day.workoutSaved).toBe(false);
 });
});


describe('Buddies in the sample story',()=>{
 it('follows a sample profile and shares a sample win without duplicating logs or rewards',()=>{
  let day=applyDemoAction(createDemoDay(),'water').state;
  day=applyDemoAction(day,'buddies').state;expect(day.buddyFollowing).toBe(true);expect(day.buddyShared).toBe(false);
  day=applyDemoAction(day,'buddies').state;expect(day.buddyShared).toBe(true);expect(day.waterLogs).toBe(1);expect(day.coins).toBe(0);
  expect(applyDemoAction(day,'buddies').state).toEqual(day);expect(createDemoDay().buddyShared).toBe(false);
 });
});
