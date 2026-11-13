import assert from 'node:assert/strict';
import fs from 'node:fs';
import {createRun,step} from '../web/under-green-sim.js';
import {WATERS,waterState,distance,solid} from '../web/under-green-course.js';
import {ARRIVAL} from '../web/under-green-encounters.js';
import {createLocalTelemetry,recordLocal,telemetrySnapshot} from '../web/local-telemetry.js';
import {pursuitCaption} from '../web/under-green-observation.js';
import {crossingAdvice} from '../web/under-green-guidance.js';
const tick=(r,n,input={})=>{for(let k=0;k<n;k++)step(r,input);},checks=[];
let r=createRun();r.mode='playing';r.player.y=ARRIVAL.triggerY+.1;step(r);assert.equal(r.joe.phase,'enter');
const entered={...r.joe};let maxStep=0;
for(let i=0;i<190;i++){const before={...r.joe};step(r);maxStep=Math.max(maxStep,distance(before,r.joe));assert(!solid(r.joe,.4));}
assert(maxStep<.04);assert.equal(r.joe.phase,'walk');assert(r.joe.walk>2.7);assert(r.player.y<r.joe.y);
checks.push('Joe enters ahead through connected ground floor, with continuous walking translation and no airborne descent');

// A surge at the middle must visibly return to the entry bank, never move metres in one frame.
r=createRun();r.mode='playing';Object.assign(r.player,{x:0,y:64,waterEntry:{spillway:-1}});r.time=2;r.joe.phase='enter';r.joe.age=-100;
let biggest=0;for(let i=0;i<90;i++){const before={...r.player};step(r,{lookX:.002});biggest=Math.max(biggest,distance(before,r.player));assert(!solid(r.player,.3));}
assert(biggest<=8/60+.0001);assert(r.player.y<60);assert.equal(r.waterHits,1);assert(r.player.yaw>.1);
checks.push('Surge recovery is bounded to 8m/s, preserves look control, reaches entry bank and avoids repeated hits');
// Collision with Joe and walls cannot become a teleport through either actor.
r=createRun(1);r.mode='playing';r.time=2;Object.assign(r.player,{x:0,y:61,waterEntry:{spillway:-1}});Object.assign(r.joe,{x:0,y:59.9,phase:'recover',age:-2});
tick(r,25);assert(distance(r.player,r.joe)>.64);assert(r.player.y>r.joe.y);
r=createRun();r.mode='playing';r.time=2;Object.assign(r.player,{x:2.65,y:64,waterEntry:{spillway:-1}});r.joe.phase='enter';r.joe.age=-100;tick(r,60,{strafe:1});assert(!solid(r.player,.3));
checks.push('Water recovery respects actor and structural clearance');

r=createRun(1);r.mode='playing';Object.assign(r.player,{x:0,y:48,grace:0});Object.assign(r.joe,{x:0,y:55,yaw:0,last:{x:0,y:58},phase:'walk'});tick(r,1);
assert.equal(r.joe.seen,false);assert.deepEqual(r.joe.last,{x:0,y:58});
Object.assign(r.player,{y:59});tick(r,1);assert(r.joe.seen);assert.equal(r.joe.evidence,'sight');
r.joe.phase='walk';r.joe.speed=0;r.joe.closingRate=0;r.player.y=42;r.player.yaw=0;r.player.pitch=0;r.joe.y=55;
assert(!pursuitCaption(r,'R').includes('GETTING CLOSER'));
r.joe.phase='search';assert(pursuitCaption(r,'R').includes('SEARCHING'));
r.joe.phase='water-wait';assert(pursuitCaption(r,'R').includes('WATER'));
checks.push('Perception requires sight cone or real footsteps; captions distinguish stationary, search and water states');

const spill=WATERS.find(w=>w.id==='spillway');
function crossing(route,time,gap){
 const r=createRun(1);r.mode='playing';r.time=time;r.telemetry=createLocalTelemetry();
 Object.assign(r.player,{x:0,y:53,yaw:0,grace:0});Object.assign(r.joe,{x:0,y:53-gap,yaw:0,phase:'walk',last:{x:0,y:53}});
 const goals=route==='dry'?[{x:9.5,y:57},{x:10,y:72},{x:0,y:73.5}]:[{x:0,y:59.5},{x:0,y:73.5}];let index=0;
 for(let i=0;i<1800&&r.mode==='playing'&&index<goals.length;i++){
  const goal=goals[index],d=distance(r.player,goal);if(d<.15){index++;continue;}
  let go=true;
  if(route==='wet'&&index===1&&r.player.y<60){const a=crossingAdvice(r.player,spill,waterState(spill,r.time),3.84);go=a.action!=='wait';}
  const dx=goal.x-r.player.x,dy=goal.y-r.player.y;step(r,go?{strafe:dx/d,forward:dy/d}:{});
 }
 return {route,startTime:time,startGap:gap,mode:r.mode,seconds:r.elapsed,finished:index===goals.length,waterHits:r.waterHits,player:{x:r.player.x,y:r.player.y},telemetry:telemetrySnapshot(r.telemetry)};
}
const comparisons=[];for(const time of [7.5,9,11,1,3,5])for(const gap of [7,14])for(const route of ['wet','dry'])comparisons.push(crossing(route,time,gap));
let wetWins=0,dryWins=0;
for(let i=0;i<comparisons.length;i+=2){const wet=comparisons[i],dry=comparisons[i+1];if(wet.finished&&(!dry.finished||wet.seconds<dry.seconds))wetWins++;if(dry.finished&&(!wet.finished||dry.seconds<wet.seconds))dryWins++;}
assert(wetWins>0&&dryWins>0,'Arrival phase and threat distance must change the better route');
assert(comparisons.some(c=>c.mode==='caught'),'Waiting in the wrong situation must expose the player to Joe');
assert(comparisons.some(c=>c.route==='dry'&&c.finished&&c.waterHits===0));
assert(comparisons.some(c=>c.route==='wet'&&c.finished&&c.waterHits===0));
checks.push('Across 24 live-Joe scenarios, wet and dry routes each win some comparisons; waiting can cause defeat');
const bounded=createLocalTelemetry(3);for(let i=0;i<10;i++)recordLocal(bounded,'test',i);assert.equal(bounded.events.length,3);assert.equal(bounded.dropped,7);assert.equal(bounded.totals.test,10);
checks.push('Opt-in telemetry bounds memory while retaining aggregate counts');
fs.mkdirSync('output/under-green/encounters',{recursive:true});
fs.writeFileSync('output/under-green/encounters/comparisons.json',JSON.stringify({passed:true,checks,wetWins,dryWins,comparisons},null,2));
console.log(JSON.stringify({passed:true,checks,wetWins,dryWins,summary:comparisons.map(({route,startTime,startGap,mode,seconds,finished})=>({route,startTime,startGap,mode,seconds,finished}))},null,2));
