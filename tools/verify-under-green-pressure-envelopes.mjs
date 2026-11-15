// Physical fixture matrix, not human play or proof of first-time comprehension.
// Actors start on validated dry floor. Joe then uses live perception/navigation.
import fs from 'node:fs';
import assert from 'node:assert/strict';
import {fileURLToPath} from 'node:url';
import {resolve} from 'node:path';
import {createRun,step,MOVEMENT} from '../web/under-green-sim.js';
import {WATERS,waterState,waterPoint,waterLocal,inWater,distance,solid,lineClear,navigationPoints,pathTo} from '../web/under-green-course.js';
import {rangeY} from '../web/under-green-layout.js';
import {JOE_RADIUS,weaponClear} from '../web/under-green-clearance.js';
import {crossingAdvice} from '../web/under-green-guidance.js';

const out='output/under-green/pressure-envelopes';fs.mkdirSync(out,{recursive:true});
export const stances=[['walk',MOVEMENT.walk,{}],['sprint',MOVEMENT.sprint,{sprint:true}],['crouch',MOVEMENT.crouch,{crouch:true}]];
const rows=[],excluded=[],failures=[],examples=[],candidates=navigationPoints(JOE_RADIUS);
function fixture(w,gap){
 const direction=w.forward||1,start=waterPoint(w,0,-direction*(w.depth/2+.75));
 if(w.lesson)return {start,joe:null,gap:null};
 const valid=candidates.map(p=>({p,gap:distance(p,start)})).filter(v=>Math.abs(v.gap-gap)<.8&&waterLocal(v.p,w).y*direction<=waterLocal(start,w).y*direction)
  .sort((a,b)=>Math.abs(a.gap-gap)-Math.abs(b.gap-gap));
 for(const v of valid){
  const j={...v.p,yaw:Math.atan2(start.x-v.p.x,start.y-v.p.y),phase:'walk',age:0};
  if(WATERS.some(water=>inWater(j,water,JOE_RADIUS))||!weaponClear(j,0)||!lineClear(j,start,JOE_RADIUS))continue;
  return {start,joe:j,gap:v.gap};
 }
 return null;
}
function detour(w){
 if(w.id==='spillway')return [{x:10,y:57},{x:10,y:72},{x:0,y:72}];
 if(w.id==='bunker')return [{x:-20,y:70},{x:-30,y:70},{x:-30,y:54},{x:-20,y:54}];
 if(w.id==='range-a')return [{x:12,y:38},{x:21,y:38},{x:21,y:rangeY(23.5)},{x:12,y:rangeY(23.5)}];
 if(w.id==='range-b')return [{x:21,y:rangeY(23.5)},{x:21,y:rangeY(13)},{x:12,y:rangeY(13)}];
 return [];
}
export function execute(w,phase,stance,gap,policy,{diagnostic=false}={}){
 const initial=fixture(w,gap),key={channel:w.id,phase,stance:stance[0],requestedGap:gap,policy};
 if(!initial){excluded.push({...key,reason:'No dry body/tool-clear start in this distance band with a clear same-bank approach.'});return;}
 const direction=w.forward||1,r=createRun();
 Object.assign(r,{mode:'playing',time:24+phase-(w.offset??0),bypass:w.id==='bypass'||w.id.startsWith('range-')||w.id==='sluice',bypassAt:0});
 assert(Number.isFinite(r.time),'Event-controlled outlets have no recurring phase offset');
 Object.assign(r.player,initial.start,{yaw:w.axis==='x'?Math.PI/2:direction===1?0:Math.PI,grace:0});
 if(initial.joe)Object.assign(r.joe,initial.joe,{last:{...initial.start},route:[],evidence:'sight',evidenceAt:r.time});
 else Object.assign(r.joe,{phase:'absent'});
 const advice=crossingAdvice(r.player,w,waterState(w,r.time,r.bypass,r.bypassAt),stance[1]);
 const original=structuredClone(r),trace=[],samples=[];
 let firstHit=null,recoveredAt=null,minimumGap=Infinity,attacks=0,priorPhase=r.joe.phase,dodge=null,dodgedThisAttack=false,committed=false,route=[],repath=0,goals=[],goalIndex=0,usedDry=false,cleared=false,maximumStep=0,maximumJoeStep=0,protectedCapture=false,protectedFrames=0;
 // A dry detour must actually rejoin the destination bank. Merely passing its
 // longitudinal coordinate in a separate parallel corridor is not a clear.
 const farther=()=>{const local=waterLocal(r.player,w);return direction*local.y>=w.depth/2+.5&&Math.abs(local.x)<=w.width/2-.35;};
 const vectorTo=point=>{const d=distance(r.player,point);if(d<.04)return {};const dx=(point.x-r.player.x)/d,dy=(point.y-r.player.y)/d,yaw=r.player.yaw;return {forward:dx*Math.sin(yaw)+dy*Math.cos(yaw),strafe:dx*Math.cos(yaw)-dy*Math.sin(yaw)};};
 for(let frame=0;frame<1800&&r.mode==='playing';frame++){
  if(farther()){cleared=true;break;}
  const previous={...r.player},previousJoe={...r.joe};
  const current=crossingAdvice(r.player,w,waterState(w,r.time,r.bypass,r.bypassAt),stance[1]);
  let input={...stance[2]};
  if(frame<15){} // Match the advice contract's 250ms response reserve.
  else if(policy==='signal-only'){
   if(['cross','approach'].includes(current.action)||inWater(r.player,w,.3))committed=true;
   if(committed)input.forward=1;
  }else{
   // Deliberately attempt entry once, including an unsuitable warning/surge.
   // After a hit, choose an authored dry route or time another opening.
   if(firstHit===null)input.forward=1;
   else{
    if(!usedDry&&w.detour){goals=detour(w);usedDry=true;goals.push(waterPoint(w,0,direction*(w.depth/2+.75)));}
    if(goals.length){
     while(goalIndex<goals.length&&distance(r.player,goals[goalIndex])<.3){goalIndex++;route=[];repath=0;}
     const target=goals[goalIndex];
     if(target){if(--repath<=0||!route.length){route=pathTo(r.player,target,r.time,r.bypass,false,r.bypassAt,.3);repath=24;}
      while(route.length&&distance(r.player,route[0])<.2)route.shift();let next=route[0];
      if(!next&&distance(r.player,target)<1.5&&lineClear(r.player,target,.3))next=target;
      if(next)Object.assign(input,vectorTo(next));
     }
    }else if(['cross','approach'].includes(current.action)||inWater(r.player,w,.3)&&!r.player.recovery)input.forward=1;
   }
   // Omniscient mechanical dodge pilot: proves movement opportunity only.
   // Whether a person notices the cue is a separate observation requirement.
   // One dodge per committed attack. Re-selecting after reaching a safe spot
   // can alternate sides and walk the pilot straight back into the same blade.
   if(!['windup','sweep'].includes(r.joe.phase))dodgedThisAttack=false;
   if(!dodge&&!dodgedThisAttack&&r.joe.phase==='windup'&&distance(r.player,r.joe)<3){
    for(const side of [1,-1]){
     const candidate={x:r.player.x+Math.cos(r.joe.yaw)*1.65*side,y:r.player.y-Math.sin(r.joe.yaw)*1.65*side};
     if(lineClear(r.player,candidate,.3)&&!WATERS.some(v=>waterState(v,r.time,r.bypass,r.bypassAt).danger&&inWater(candidate,v,.35))){dodge=candidate;dodgedThisAttack=true;break;}
    }
   }
   if(dodge){if(distance(r.player,dodge)<.12){dodge=null;route=[];repath=0;}else input={...stance[2],...vectorTo(dodge)};}
  }
  if(diagnostic&&frame%15===0)samples.push({frame,player:{x:r.player.x,y:r.player.y},joe:{x:r.joe.x,y:r.joe.y,phase:r.joe.phase,yaw:r.joe.yaw},gap:distance(r.player,r.joe),goalIndex,goal:goals[goalIndex],next:route[0],dodge:dodge&&{...dodge},input:{...input},waterHits:r.waterHits});
  trace.push(input);step(r,input);
  maximumStep=Math.max(maximumStep,distance(previous,r.player));maximumJoeStep=Math.max(maximumJoeStep,distance(previousJoe,r.joe));
  minimumGap=Math.min(minimumGap,distance(r.player,r.joe));
  if(r.joe.phase==='windup'&&priorPhase!=='windup')attacks++;priorPhase=r.joe.phase;
  if(firstHit===null&&r.waterHits)firstHit=r.elapsed;
  if(previous.recovery&&!r.player.recovery&&recoveredAt===null)recoveredAt=r.elapsed;
  if(previous.recovery?.protected||r.player.recovery?.protected)protectedFrames++;
  if(r.mode==='caught'&&(previous.recovery?.protected||r.player.recovery?.protected))protectedCapture=true;
  if(solid(r.player,.3)||solid(r.joe,JOE_RADIUS)&&r.joe.phase!=='absent')failures.push({...key,type:'solid overlap',frame});
 }
 const row={...key,actualGap:initial.gap,firstAdvice:advice.action,cleared,mode:r.mode,seconds:r.elapsed,waterHits:r.waterHits,firstHit,recoveredAt,attacks,minimumGap,usedDry,protectedCapture,protectedFrames,maximumStep,maximumJoeStep};
 if(maximumStep>(MOVEMENT.sprint+8)/60+.0001||maximumJoeStep>2.1/60+.0001)failures.push({...row,type:'discontinuous motion'});
 if(protectedCapture)failures.push({...row,type:'capture during protected displacement'});
 if(policy==='signal-only'&&['cross','approach'].includes(advice.action)&&(!cleared||r.waterHits))failures.push({...row,type:'advertised crossing failed with live Joe'});
 rows.push(row);
 const exampleKind=protectedCapture?'protected-capture':firstHit!==null&&cleared?(protectedFrames?'protected-recovery':'recovered'):r.mode==='caught'?'caught':null;
 if(exampleKind&&!examples.some(v=>v.channel===w.id&&v.kind===exampleKind))examples.push({channel:w.id,kind:exampleKind,row,initial:original,inputs:trace});
 return {row,initial:original,inputs:trace,samples,final:structuredClone(r)};
}
if(process.argv[1]&&fileURLToPath(import.meta.url)===resolve(process.argv[1])){
for(const w of WATERS){
 const close=(w.lowSeconds??(w.lesson?5:3))+1.5;
 const phases=['return','bypass'].includes(w.id)?[0]:[0,close-.75,close-.25,close+.25,11.75];
 for(const phase of phases)for(const stance of stances)for(const gap of w.lesson?[null]:[3,6,9])for(const policy of ['signal-only','recover-and-evade'])execute(w,phase,stance,gap,policy);
 fs.writeFileSync(`${out}/partial.json`,JSON.stringify({rows,excluded,failures},null,2));
 console.log(JSON.stringify({channel:w.id,cases:rows.filter(v=>v.channel===w.id).length,cleared:rows.filter(v=>v.channel===w.id&&v.cleared).length,failures:failures.length}));
}
for(const w of WATERS.filter(w=>!['return','bypass'].includes(w.id)))if(!rows.some(r=>r.channel===w.id&&r.protectedFrames>0))failures.push({channel:w.id,type:'No actual in-channel protected displacement exercised'});
const report={passed:failures.length===0,method:'Dry, body/tool-clear initial fixtures; live sight/navigation/attacks; 250ms initial response delay; ordinary fixed-step inputs. Signal-only waiting is deliberately naive; recovery pilot has perfect attack-state information. No teleport or enemy speed override within attempts.',limits:['Forward authored approach only; distances with no valid dry same-bank sightline are excluded.','Usable event-controlled crossings only: return before pump and outflow after pump. Permanent closure/operation are covered by separate progression tests.','A failed pilot does not prove an unavoidable loss. No human recognition, fairness, fun or route preference inference.'],rows,excluded,failures};
fs.writeFileSync(`${out}/verified.json`,JSON.stringify(report,null,2));fs.writeFileSync(`${out}/examples.json`,JSON.stringify(examples,null,2));
console.log(JSON.stringify({passed:report.passed,cases:rows.length,excluded:excluded.length,failures:failures.slice(0,20),recoveries:rows.filter(v=>v.firstHit!==null&&v.cleared).length,caught:rows.filter(v=>v.mode==='caught').length},null,2));
assert.equal(failures.length,0,'Physical pressure-envelope invariant failed; inspect retained fixtures.');
assert(WATERS.filter(w=>!['return','bypass'].includes(w.id)).every(w=>rows.some(r=>r.channel===w.id&&r.protectedFrames>0)),'Every periodic channel must exercise actual in-channel displacement, not only contact at its bank.');
}
