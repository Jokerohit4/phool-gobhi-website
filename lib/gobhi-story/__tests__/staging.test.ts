import { journeyStops } from '../journey';
import { describe, expect, it } from 'vitest';
import { storyStaging, appTransition } from '../staging';

describe('phone and mascot staging', () => {
  it('keeps the same reached hand surface across the former pose switch', () => {
    const before=storyStaging(.095-.000001,true),after=storyStaging(.095+.000001,true);
    expect(Math.abs(after.reach-before.reach)).toBeLessThan(.000001);
    for(const p of [.11,.175,.23,.28,.349])expect(storyStaging(p,true).reach).toBe(1);
    expect(storyStaging(.5,true).reach).toBe(0);
  });
  it('fully releases the grip before moving the phone toward the camera', () => {
    for(let p=.2;p<=.35;p+=.001){
      const stage=storyStaging(p,true);
      if(stage.departure>0)expect(stage.release).toBe(1);
    }
    expect(storyStaging(.11,true).holding).toBe(true);
    expect(storyStaging(.23,true).release).toBeGreaterThan(.5);
  });
  it('lets the camera pass the solid mascot without a visible dissolve', () => {
    for(let p=.11;p<=.349;p+=.001)expect(storyStaging(p,true).actorOpacity).toBe(1);
    expect(storyStaging(.25,true).departure).toBe(0);
    expect(storyStaging(.26,true).departure).toBeGreaterThan(0);
  });
  it('reveals the mascot gradually without changing its physical scale', () => {
    for(const mobile of [false,true]){
      let previous=0;
      for(let p=.925;p<=.985;p+=.001){const s=storyStaging(p,mobile);expect(s.actorOpacity).toBeGreaterThanOrEqual(previous);previous=s.actorOpacity;expect(s.actorScale).toBeGreaterThan(.69);}
      expect(storyStaging(1,mobile).actorOpacity).toBe(1);
    }
  });
  it('fits a large display into the hand anchor with its lower edge at the palm', () => {
    for(const mobile of [false,true]){
      const s=storyStaging(1,mobile);
      expect(s.phoneX).toBeCloseTo(s.actorX-1.40*s.actorScale);
      expect((s.phoneFinalY-1.36*s.phoneFinalScale)/s.actorScale).toBeCloseTo(.55);
      expect(s.phoneFinalScale/s.actorScale).toBeCloseTo(.78);
    }
  });
  it('keeps scroll transitions continuous and reversible at every boundary', () => {
    for(const boundary of [...journeyStops.slice(3,-2).map((p,i)=>(p+journeyStops[i+4])/2),.925]){
      const a=appTransition(boundary-.00001)!,b=appTransition(boundary+.00001)!;
      expect(a.from).toBe(b.from);expect(a.to).toBe(b.to);
      expect(b.blend-a.blend).toBeGreaterThan(0);expect(b.blend-a.blend).toBeLessThan(.002);
      expect(appTransition(boundary)).toEqual(appTransition(boundary));
    }
  });
});
