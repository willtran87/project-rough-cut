import assert from 'node:assert/strict';
import fs from 'node:fs';
import {pathToFileURL} from 'node:url';
import {validateEncounters,validateCrossings,validateInteractions} from '../web/under-green-authoring.js';
import {ARRIVAL,CROSSINGS,SEARCH_POINTS,BUNKER_INSPECTION,RANGE_INSPECTION} from '../web/under-green-encounters.js';
import {INTERACTIONS,nearbyAction,interactionFeedback} from '../web/under-green-interactions.js';
import {createCrossingObserver} from '../web/under-green-crossing-observer.js';
import {observeEncounter} from '../web/under-green-observation.js';
import {createRun} from '../web/under-green-sim.js';
import {traverse} from './probe-under-green-folded.mjs';
import {WATERS} from '../web/under-green-course.js';
import {createLocalTelemetry} from '../web/local-telemetry.js';

const out='output/under-green/encounter-contract';fs.mkdirSync(out,{recursive:true});
async function original(name){
 const source=fs.readFileSync(`tools/fixtures/under-green-${name}-contract.txt`,'utf8').replace(/from '(\.\/[^']+)'/g,(_,relative)=>`from '${new URL(relative,pathToFileURL(process.cwd()+'/web/entry.js')).href}'`);
 return import('data:text/javascript;base64,'+Buffer.from(source).toString('base64'));
}
const oldObservation=await original('observation'),oldInteractions=await original('interactions');
const definitions={arrival:ARRIVAL,crossings:CROSSINGS,searchPoints:SEARCH_POINTS,bunkerInspection:BUNKER_INSPECTION,rangeInspection:RANGE_INSPECTION};
validateEncounters(definitions,WATERS);validateInteractions(INTERACTIONS);
const rejected=[];
for(const [name,mutate] of [
 ['arrival duration',d=>d.arrival.walkSeconds=0],['arrival position',d=>d.arrival.spawn.x=NaN],
 ['search destination',d=>d.searchPoints[0].y=Infinity],['empty search',d=>d.searchPoints=[]],
 ['inspection delay',d=>d.bunkerInspection.afterSeconds=-1],['inspection bounds',d=>d.rangeInspection.maximumY=d.rangeInspection.minimumY],
 ['duplicate crossing',d=>d.crossings.push({...d.crossings[0]})],['missing channel',d=>d.crossings[0].channels=['missing']],
 ['reserved report key',d=>d.crossings[0].id='__proto__'],
 ['unknown reference',d=>{d.crossings[0].water='missing';d.crossings[0].channels=['missing'];}],
 ['arrival not included',d=>d.crossings[0].water='bunker'],['duplicate channel',d=>d.crossings[0].channels.push('spillway')],
 ['wrong axis',d=>d.crossings[0].axis='x'],['reversed travel',d=>d.crossings[0].direction=-1],
 ['invalid direction',d=>d.crossings[0].direction=0],['unreachable dry branch',d=>d.crossings[0].dryX=15],
 ['nonfinite bound',d=>d.crossings[0].minLateral=NaN],['string flag',d=>d.crossings[0].requiresBypass='false'],
 ['channel outside span',d=>d.crossings[0].exit=54],['unknown parent',d=>d.crossings[3].parent='missing'],
 ['self parent',d=>d.crossings[3].parent=d.crossings[3].id],['parent corridor',d=>d.crossings[3].center=0],
 ['parent span',d=>d.crossings[3].entry=39],['parent missing channel',d=>d.crossings[2].channels=['range-a']],
 ]){const d=structuredClone(definitions);mutate(d);assert.throws(()=>validateEncounters(d,WATERS),Error,name);rejected.push(name);}
for(const [name,mutate]of [
 ['unknown action',d=>d[0].id='other'],['missing action',d=>d.pop()],['duplicate action',d=>d[1].id='bypass'],
 ['reach',d=>d[0].reach=NaN],['feedback reach',d=>d[0].feedbackReach=1],['height',d=>d[0].height=Infinity],
 ['facing',d=>d[0].facing=4],['target',d=>d[0].target.x=NaN],['housing',d=>d[0].target.surfaceRadius=-1],['text',d=>d[0].detail=''],
 ]){const d=structuredClone(INTERACTIONS);mutate(d);assert.throws(()=>validateInteractions(d),Error,name);rejected.push(name);}
assert.throws(()=>{CROSSINGS[0].channels.push('untracked');},TypeError);
assert.throws(()=>{ARRIVAL.landing.y=0;},TypeError);
assert.throws(()=>{INTERACTIONS[0].reach=50;},TypeError);

// Rename all encounter/channel identities, then rotate the complete recording
// into an x-axis corridor. Choice, timing and channel phases must still agree.
const fixture=structuredClone(CROSSINGS.filter(c=>c.id==='range'||c.parent==='range'));
const renamedWaters=structuredClone(WATERS.filter(w=>w.id.startsWith('range-')));
for(const w of renamedWaters)w.id='outlet-'+w.id;
for(const c of fixture){c.id='encounter-'+c.id;if(c.parent)c.parent='encounter-'+c.parent;c.water='outlet-'+c.water;c.channels=c.channels.map(id=>'outlet-'+id);}
validateCrossings(fixture,renamedWaters);
const rotated=structuredClone(fixture),rotatedWaters=structuredClone(renamedWaters);
for(const c of rotated)c.axis='x';
for(const w of rotatedWaters){[w.x,w.y]=[w.y,w.x];w.axis='x';}
const observers=[createCrossingObserver(fixture,renamedWaters),createCrossingObserver(rotated,rotatedWaters)];
const samples=[[12,38],[12,32],[12,28.575],[21,25],[21,21],[12,20]];
const runs=observers.map(()=>({player:{speed:3},time:0,bypass:true,bypassAt:0,waterHits:0,telemetry:createLocalTelemetry()}));
samples.forEach(([x,y],i)=>runs.forEach((r,index)=>{Object.assign(r.player,index?{x:y,y:x}:{x,y});r.time=i;observers[index](r,8,1);r.telemetry.samples=i+1;}));
assert.deepEqual(runs[0].telemetry,runs[1].telemetry);
assert.equal(runs[0].telemetry.crossings['encounter-range'].choice,'mixed');
assert.equal(runs[0].telemetry.crossings['encounter-range-a'].choice,'wet');
assert.equal(runs[0].telemetry.crossings['encounter-range-b'].choice,'dry');
assert(runs[0].telemetry.crossings['encounter-range'].finished);

let interactionCases=0;
for(const c of INTERACTIONS)for(const radius of [.1,1,1.8,1.81,3.2,3.21])for(const angle of [0,Math.PI/2,Math.PI,-Math.PI/2])for(const rearAngle of [0,Math.PI])for(const pitch of [-.85,0,.85])for(const state of [0,1,2,3]){
 const r=createRun(c.id==='gate'?3:1);r.mode='playing';r.bypass=!!(state&1);r.evidence=!!(state&2);r.useFeedbackUntil=r.time+1;
 Object.assign(r.player,{x:c.target.x-radius*Math.sin(angle),y:c.target.y-radius*Math.cos(angle),yaw:angle,rearAngle,pitch});
 assert.deepEqual(nearbyAction(r),oldInteractions.nearbyAction(r));assert.deepEqual(interactionFeedback(r),oldInteractions.interactionFeedback(r));interactionCases++;
}

let observedFrames=0;const routes=[];
for(const [timeOffset,crouch,expectedSeconds]of [[7,false,31.633333333332818],[8.5,false,19.916666666666817],[7,true,22.699999999999992],[8.5,true,42.64999999999886]]){
 const oldTelemetry=createLocalTelemetry(),newTelemetry=createLocalTelemetry();
 const result=traverse({cp:2,timeOffset,crouch,rangeRoute:'reactive',timedKeeper:true,adaptiveRun:true,adaptiveStance:crouch,rearChecks:crouch,dodge:true,inspect:r=>{
  // Both observers consume exactly the same live simulation state, with
  // independent accumulated event/report state; compare every complete record.
  const a={...r,joe:{...r.joe},telemetry:oldTelemetry},b={...r,joe:{...r.joe},telemetry:newTelemetry};
  oldObservation.observeEncounter(a,1/60);observeEncounter(b,1/60);
  assert.deepEqual(newTelemetry,oldTelemetry);observedFrames++;
 }});
 assert.equal(result.mode,'complete');assert.equal(result.waterHits,0);
 assert(Math.abs(result.elapsed-expectedSeconds)<1e-7);
 routes.push({timeOffset,crouch,mode:result.mode,seconds:result.elapsed,hits:result.waterHits});
}
const report={passed:true,rejected,interactionCases,observedFrames,routes,renamedAndRotated:true,nestedMutationRejected:true};
fs.writeFileSync(out+'/verified.json',JSON.stringify(report,null,2));console.log(JSON.stringify(report));
