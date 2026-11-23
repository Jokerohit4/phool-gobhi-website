import { journeyStops } from './journey';
export const smooth = (a: number, b: number, p: number) => {
  const t = Math.max(0, Math.min(1, (p-a)/(b-a)));
  return t*t*(3-2*t);
};

/** Reveals and the returning display follow scroll position, in either direction. */
export function storyStaging(p: number, mobile: boolean) {
  const ending = smooth(.89, .985, p);
  const finalScale = mobile ? .70 : 1, finalX = mobile ? .65 : 1.25;
  const actorOpacity = p<.35?1:smooth(.925,.965,p);
  return {
    reach: smooth(.025, .095, p)*(1-smooth(.35, .5, p)),
    holding: p >= .095 && p < .5,
    release: smooth(.205, .25, p),
    departure: smooth(.25, .35, p),
    actorVisible: actorOpacity > .002,
    actorOpacity,
    actorScale: 1+(finalScale-1)*ending,
    endingGrip: p > .89,
    ending,
    phoneX: ending * (finalX-1.40*finalScale),
    actorX: ending * finalX,
    phoneFinalScale: .78*finalScale,
    phoneFinalY: 1.6108*finalScale,
    phoneFinalZ: .82*finalScale,
    plinthX: ending * (finalX-.5*finalScale),
    plinthRadius: 2.1,
    joinReveal: smooth(.96, .99, p),
  };
}

/** Crossfade the app and its props through a scroll band. */
export function appTransition(p: number) {
  for(let index=3;index<journeyStops.length-2;index++){
    const boundary=(journeyStops[index]+journeyStops[index+1])/2;
    if(p>=boundary-.010&&p<=boundary+.010)
      return {from:index,to:index+1,blend:smooth(boundary-.010,boundary+.010,p)};
  }
  if(p>=.895&&p<=.955)return {from:journeyStops.length-2,to:journeyStops.length-1,blend:smooth(.895,.955,p)};
  return null;
}
