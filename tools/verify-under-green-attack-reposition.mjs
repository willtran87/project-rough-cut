import fs from 'node:fs';
import assert from 'node:assert/strict';
import {step} from '../web/under-green-sim.js';
import {distance,solid} from '../web/under-green-course.js';
import {JOE_RADIUS,weaponClear} from '../web/under-green-clearance.js';
import {trimmerContact} from '../web/under-green-trimmer.js';
import {rangeY} from '../web/under-green-layout.js';

const out='output/under-green/range-recovery';
fs.mkdirSync(out,{recursive:true});
const {fixtures}=JSON.parse(fs.readFileSync('tools/fixtures/under-green-blocked-attack.json'));
const checks=[],results=[],tapes=[];
function checkedStep(r,input={}){
 const before={...r.joe};step(r,input);
 assert(distance(before,r.joe)<=2.1/60+.00001,'Reposition exceeds ordinary walking speed');
 assert(!solid(r.player,.3)&&!solid(r.joe,JOE_RADIUS),'Actor entered solid geometry');
 assert(weaponClear(r.joe,r.gate),'Weapon entered scenery');
}
for(const fixture of fixtures){
 const initial=structuredClone(fixture.final),still=structuredClone(initial),inputs=[];
 let planned=null,firstStep=null,attack=null,usedLongTurn=false;
 for(let n=0;n<720&&still.mode==='playing';n++){
  checkedStep(still);inputs.push({});
  usedLongTurn ||= !!still.joe.attackReposition?.turnDirection;
  if(!planned&&still.joe.attackReposition)planned={frame:n,plan:structuredClone(still.joe.attackReposition),position:{x:still.joe.x,y:still.joe.y}};
  if(planned&&firstStep===null&&distance(planned.position,still.joe)>.01)firstStep=n;
  if(firstStep!==null&&still.joe.phase==='sweep')attack=n;
 }
 assert(planned&&firstStep!==null&&attack!==null);
 assert.equal(still.mode,'caught','A stationary player no longer exploits endlessly blocked swings');
 assert(trimmerContact(still.joe,still.player),'Defeat still requires actual blade contact');
 assert(distance(initial.joe,still.joe)>.3,'Joe must visibly walk instead of changing only his weapon pose');
 const escape=structuredClone(initial),p=escape.player,j=escape.joe;
 // The old integer-grid pilot tried to go through Joe. This authored recovery
 // takes the usable 0.7m side step, passes his body, and rejoins the dry route.
 const goals=[{x:p.x,y:p.y-.7},{x:j.x+1,y:p.y-.7},{x:j.x+1,y:p.y},{x:21,y:rangeY(23.5)},{x:21,y:rangeY(13)},{x:12,y:rangeY(13)}];
 let goal=0;const escapeInputs=[];
 for(let n=0;n<1800&&goal<goals.length&&escape.mode==='playing';n++){
  const target=goals[goal],gap=distance(escape.player,target);
  if(gap<.08){goal++;continue;}
  const dx=(target.x-escape.player.x)/gap,dy=(target.y-escape.player.y)/gap,yaw=escape.player.yaw;
  const input={forward:dx*Math.sin(yaw)+dy*Math.cos(yaw),strafe:dx*Math.cos(yaw)-dy*Math.sin(yaw),crouch:fixture.row.stance==='crouch',sprint:fixture.row.stance==='sprint'};
  checkedStep(escape,input);escapeInputs.push(input);
 }
 assert.equal(goal,goals.length,'The physical dry route must remain available around Joe');
 assert.equal(escape.mode,'playing');assert.equal(escape.waterHits,initial.waterHits);
 if(fixture.stage==='turn-obstructed')assert(usedLongTurn,'A blocked shortest turn must use the clear rotation');
 results.push({stage:fixture.stage||'original',phase:fixture.row.phase,stance:fixture.row.stance,planned,firstStep,attack,usedLongTurn,standingSeconds:still.elapsed-initial.elapsed,escapeSeconds:escape.elapsed-initial.elapsed});
 if(!tapes.length){tapes.push({name:'stationary',initial,inputs,final:still},{name:'escape',initial,inputs:escapeInputs,final:escape});}
 if(fixture.stage==='turn-obstructed'&&!tapes.some(t=>t.name==='long-turn'))tapes.push({name:'long-turn',initial,inputs,final:still});
}
checks.push('Four original stalled states and two obstructed-turn states produce a bounded physical reposition and a real blade-contact defeat for a stationary player');
checks.push('All six states have an ordinary-input dry escape at their original stance, with no additional water hit, solid overlap or weapon/scenery intersection');

const r=structuredClone(fixtures[0].final);
for(let i=0;i<300&&!r.joe.attackReposition;i++)checkedStep(r);
assert(r.joe.attackReposition);
const paused=structuredClone(r);paused.mode='paused';const before=structuredClone(paused);for(let i=0;i<120;i++)step(paused);assert.deepEqual(paused,before);
const hidden=[{x:0,y:5},{x:-24,y:37}].map(position=>{
 const run=structuredClone(r);Object.assign(run.player,position);
 for(let i=0;i<30;i++)checkedStep(run);
 assert(!run.joe.seen&&!run.joe.attackReposition);return run;
});
const decisions=({closingRate,previousGap,...joe})=>joe;
assert.deepEqual(decisions(hidden[0].joe),decisions(hidden[1].joe),'Hidden player locations must not steer repositioning');
checks.push('Pause freezes the step; loss of sight cancels the local plan and two hidden player locations yield identical enemy decisions');
fs.writeFileSync(out+'/reposition.json',JSON.stringify({passed:true,checks,results,limits:['Six retained standard-pressure fixtures, not a complete map/pressure audit.','The escape pilot uses authored waypoints and complete knowledge, not human cue recognition.']},null,2));
fs.writeFileSync(out+'/reposition-tapes.json',JSON.stringify(tapes));
console.log(JSON.stringify({passed:true,checks,results},null,2));
