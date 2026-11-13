// Isolated water-advice contract, exercised through actual fixed-step movement.
// Joe is held in a pre-entry fixture. This is NOT pursuit/recovery-envelope proof.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {createRun, step, MOVEMENT} from '../web/under-green-sim.js';
import {WATERS, waterState, waterPoint, waterLocal, inWater, solid, lineClear, distance} from '../web/under-green-course.js';
import {crossingAdvice} from '../web/under-green-guidance.js';

const out = 'output/under-green/crossing-advice';
const stances = [
  {name:'walk', speed:MOVEMENT.walk, input:{}},
  {name:'sprint', speed:MOVEMENT.sprint, input:{sprint:true}},
  {name:'crouch', speed:MOVEMENT.crouch, input:{crouch:true}},
];
const rows = [], excluded = [], failures = [];
const reactionFrames = 15; // 250 ms of the advice's declared 350 ms reserve.

function states(w) {
  if(w.id === 'return') return [
    {name:'before-pump', time:30, bypass:false, bypassAt:0},
    {name:'return-warning', time:30.5, bypass:true, bypassAt:30},
    {name:'return-latched', time:33, bypass:true, bypassAt:30},
  ];
  if(w.id === 'bypass') return [
    {name:'blocked-before-pump', time:30, bypass:false, bypassAt:0},
    {name:'drained-after-pump', time:33, bypass:true, bypassAt:30},
  ];
  return Array.from({length:48}, (_, i) => ({
    name:`cycle-${i/4}`, time:24+i/4-w.offset,
    bypass:w.id.startsWith('range-') || w.id === 'sluice', bypassAt:0,
  }));
}

for(const w of WATERS) for(const state of states(w)) {
  for(const side of [-1, 1]) for(const approach of [.6, 1.8, 3.2]) for(const stance of stances) {
    const start = waterPoint(w, 0, side*(w.depth/2+approach));
    const target = waterPoint(w, 0, -side*(w.depth/2+.4));
    const key = {channel:w.id, state:state.name, side, approach, stance:stance.name};
    if(solid(start,.3) || solid(target,.3) || !lineClear(start,target,.3)) {
      excluded.push({...key, reason:'The centered approach/landing is not an unobstructed body-safe segment.'});
      continue;
    }
    const segments=Math.ceil(distance(start,target)/.1);
    const other=WATERS.find(v=>v!==w && Array.from({length:segments+1},(_,i)=>({
      x:start.x+(target.x-start.x)*i/segments,y:start.y+(target.y-start.y)*i/segments,
    })).some(p=>inWater(p,v,.3)));
    if(other) {
      excluded.push({...key, reason:`The approach also crosses ${other.id}; it needs a multi-channel scenario, not isolated advice.`});
      continue;
    }
    const r = createRun();
    Object.assign(r, {mode:'playing', time:state.time, bypass:state.bypass, bypassAt:state.bypassAt});
    Object.assign(r.player, start, {yaw:Math.atan2(target.x-start.x,target.y-start.y), grace:0});
    Object.assign(r.joe, {phase:'enter', age:-100000});
    const advice = crossingAdvice(r.player,w,waterState(w,r.time,r.bypass,r.bypassAt),stance.speed);
    const row = {...key, action:advice.action, advertisedSeconds:advice.seconds};
    if(['cross','approach'].includes(advice.action)) {
      for(let n=0;n<reactionFrames;n++) step(r,stance.input);
      // Commit at the advertised speed. No teleports, invulnerability, forced
      // water phase, phase-aware path solver or hidden sprint after the advice.
      let frames=0;
      while(side*waterLocal(r.player,w).y>-(w.depth/2+.4)+1e-7 && frames<1200 && r.mode==='playing') {
        step(r,{...stance.input,forward:1});
        frames++;
        if(r.waterHits) break;
      }
      row.seconds=r.elapsed;
      row.waterHits=r.waterHits;
      row.cleared=side*waterLocal(r.player,w).y<=-(w.depth/2+.4)+1e-7;
      row.bodyClear=!solid(r.player,.3);
      if(!row.cleared || row.waterHits || !row.bodyClear || r.mode!=='playing') failures.push(row);
    }
    rows.push(row);
  }
}

const summary=WATERS.map(w=>({
  channel:w.id,
  tested:rows.filter(r=>r.channel===w.id).length,
  advertised:rows.filter(r=>r.channel===w.id&&r.cleared!==undefined).length,
  failures:failures.filter(r=>r.channel===w.id).length,
  excluded:excluded.filter(r=>r.channel===w.id).length,
}));
const report={
  passed:failures.length===0, reactionSeconds:reactionFrames/60,
  scope:'All eight channel definitions; periodic phases sampled every 0.25s; event-controlled states; both banks; three approach distances and three stances. Only advertised crossings are committed.',
  limits:['Joe deliberately inactive: no pressure/recovery-envelope or human reaction-time qualification.','Centered straight approaches only; obstructed and multi-channel approaches are recorded as excluded.','No claim that a WAIT recommendation makes waiting safe from Joe.','Changing stance or direction after advice requires reassessment and is not tested here.'],
  summary, failures, excluded, rows,
};
fs.mkdirSync(out,{recursive:true});
fs.writeFileSync(`${out}/verified.json`,JSON.stringify(report,null,2));
console.log(JSON.stringify({passed:report.passed,cases:rows.length,advertised:rows.filter(r=>r.cleared!==undefined).length,excluded:excluded.length,summary,failures:failures.slice(0,12)},null,2));
assert.equal(failures.length,0,'An advertised crossing failed using actual movement; inspect retained scenarios.');
assert(summary.every(s=>s.advertised>0),'Every channel must have an exercised usable state.');
