import {BOARD_READY,BOARD_STARTUP} from './final-cut-arrival.js';
import {attackWarning} from './final-cut-ambush.js';
import {lightsDown} from './final-cut-basins.js';

const smooth=value=>{const t=Math.max(0,Math.min(1,value));return t*t*(3-2*t);};
// Tournament floodlights rise with deployment, then stay on through the
// aftermath. Their illumination must not follow the disabled rig's lamp fade.
const firstReveal=r=>!r.openingSeen&&(r.rig.phase==='waiting'||r.rig.phase==='reveal')?(r.rig.phase==='reveal'?smooth((r.rig.age-2)/2):0):1;
// The breaker drops every bank at once; they come back up on their own.
export function courseLightState(r){return firstReveal(r)*(1-.9*lightsDown(r));}

// The two high wing markers identify the folded machine before its working
// beams reveal the cab and full cutting width. Timing derives entirely from
// current/restored simulation state, without an independent presentation clock.
export function rigLampState(r){
 const fade=r.won?Math.max(0,1-r.ending.age/8):1;
 const marker=r.arrival.ready?1:smooth((r.arrival.age-(BOARD_READY-BOARD_STARTUP))/.65);
 const j=r.rig,staging=j.attack&&['turn','align','announce'].includes(j.phase);
 const stalk=staging?(j.phase==='announce'?smooth((j.age-attackWarning(r)+.35)/.35):0):1;
 // Each time he is held the machine comes out worse: first a working lamp
 // goes dim, then the wing markers that give his width away go dark.
 const stage=r.won?0:r.stage||0;
 return {marker:marker*fade*(staging?.04+.96*stalk:1)*(stage>=2?.06:1),beam:firstReveal(r)*fade*stalk*(stage>=1?.55:1)};
}
