import assert from 'node:assert/strict';
import fs from 'node:fs';
import {createRun,readSave,snapshot,step,nearbyAction} from '../web/final-cut-sim.js';
import {evidenceFields,evidenceItems,finaleOutcome,earnedMastery} from '../web/final-cut-outcome.js';
import {finaleEntry,recordFinaleCompletion,FINAL_CAREER_KEY} from '../web/final-cut-campaign.js';
import {traverse} from './probe-final-cut.mjs';
const records=new Map(),checks=[];
globalThis.localStorage={getItem:k=>records.get(k)??null,setItem:(k,v)=>records.set(k,String(v))};
const put=(k,v)=>localStorage.setItem(k,JSON.stringify(v)),career=()=>JSON.parse(localStorage.getItem(FINAL_CAREER_KEY)),tick=(r,n,i={})=>{for(let k=0;k<n*60;k++)step(r,i,1/60);};
put('rough-cut.career.v1',{filedChangeRequests:['standard','standard','crosswind']});
put('rough-cut.under-green.v1',{evidence:true});
for(const mask of [0,1,2,3]){
 put('rough-cut.back-nine.v1',{collected:mask});
 const garage=createRun(finaleEntry('garage')),drain=createRun(finaleEntry('drain'));
 assert.equal(garage.crewLogs,mask);assert.equal(garage.groundskeeper,false);assert.equal(garage.priorEvidence,2);
 const ids=evidenceItems(garage).map(r=>r.id);assert.equal(ids.includes('crew-night-order'),!!(mask&1));assert.equal(ids.includes('crew-clubhouse'),!!(mask&2));
 assert.equal(drain.crewLogs,0);assert(drain.groundskeeper);assert(!drain.loadLimit);
}
assert.equal(finaleEntry('direct').crewLogs,0);assert.equal(finaleEntry('direct').groundskeeper,false);
checks.push('Both actual crew-log bits retain their identities; branch imports never invent the other route’s records');
for(const route of ['garage','drain','direct'])for(const loadLimit of [false,true])for(const groundskeeper of [false,true])for(const crewLogs of [0,1,2,3])for(const priorEvidence of [0,3]){
 const r=createRun({route,evidenceVersion:2,loadLimit,groundskeeper,crewLogs,priorEvidence}),o=finaleOutcome(r),has=loadLimit||groundskeeper||crewLogs||priorEvidence;
 assert.equal(o.id,has?'documented':'survived');assert.match(o.survival,/assignment is over/);assert.match(o.aftermath,/suspends the turf-telemetry pilot/);
 assert.equal(o.art,'./assets/optimized/final-cut-story/06-public-road.webp');assert.equal(o.records.length,+loadLimit + +groundskeeper + !!(crewLogs&1) + !!(crewLogs&2) + !!priorEvidence);
 assert.deepEqual(evidenceItems(createRun(readSave(JSON.stringify(snapshot(r))))),o.records);
}
checks.push('96 route/evidence combinations keep survival, source-specific aftermath, correct artwork and save round trips');
assert(evidenceFields({route:'drain',evidence:true}).groundskeeper);assert(!evidenceFields({route:'drain',evidence:true}).loadLimit);
assert(evidenceFields({route:'garage',evidence:true}).loadLimit);
assert.deepEqual(evidenceItems(createRun({branchRecord:true})).map(r=>r.id),['crew-legacy']);
let r=createRun(finaleEntry('drain'));r.mode='playing';Object.assign(r.player,{x:11.5,y:38,yaw:Math.PI});
assert.equal(nearbyAction(r)?.id,'record');step(r,{use:true});assert(r.loadLimit&&r.groundskeeper);
checks.push('Legacy evidence migrates conservatively; imported drainage evidence does not hide the local load-limit collectible');
r=createRun();r.mode='playing';Object.assign(r.player,{x:0,y:26});Object.assign(r.rig,{x:6,y:26,yaw:-Math.PI/2,phase:'pass',deployment:1,direction:-1});tick(r,2);
assert.equal(r.mode,'caught');assert.equal(r.captures,1);const id=r.runId,elapsed=r.elapsed;
r=createRun(readSave(JSON.stringify(snapshot(r))));assert.equal(r.captures,1);assert.equal(r.runId,id);assert.equal(r.elapsed,elapsed);
r.completed=true;r.stats.crossings=[0,1,2];assert(!earnedMastery(r).includes('unbroken'));assert(!earnedMastery(r).includes('read-the-wake'));
checks.push('Actual capture persists across retry/reload and prevents clean-run awards');
r=createRun({openingSeen:true});r.mode='playing';Object.assign(r.player,{x:16,y:42,yaw:0});let serial=r.saveSerial;step(r,{chipStart:true,chipHeld:true});tick(r,.6,{chipHeld:true});step(r,{chipRelease:true});assert.equal(r.stats.balls,1);assert(r.saveSerial>serial);assert.equal(r.stats.ballRedirects,0);
r=createRun(readSave(JSON.stringify(snapshot(r))));assert.equal(r.stats.balls,1);assert.equal(r.stats.ballRedirects,0);
// Exercise the eligible selection, not just a manually awarded success counter.
r.mode='playing';Object.assign(r.player,{x:16,y:42,yaw:0});step(r,{chipStart:true,chipHeld:true});tick(r,.6,{chipHeld:true});step(r,{chipRelease:true});tick(r,1);serial=r.saveSerial;Object.assign(r.rig,{phase:'disengage',age:2.2});step(r);
assert.equal(r.stats.ballRedirects,1);assert(r.saveSerial>serial);assert.equal(r.rig.evidence,'golf ball');assert.equal(createRun(readSave(JSON.stringify(snapshot(r)))).stats.ballRedirects,1);
r.completed=true;assert(earnedMastery(r).includes('borrowed-attention'));
checks.push('Thrown balls are saved immediately; only a landed ball actually selected for the next pass earns distraction credit');
const {run:full}=traverse();assert.deepEqual(earnedMastery(full),['unbroken','read-the-wake']);
const {run:prepared}=traverse({checkpoint:1});assert.deepEqual(earnedMastery(prepared),[]);
const legacy=createRun(readSave(JSON.stringify({version:1,checkpoint:2,completed:true,won:true})));assert.deepEqual(earnedMastery(legacy),[]);
checks.push('Full ordinary-input pilot earns its clean crossings; checkpoint-only and untracked legacy completions earn no mastery');
put(FINAL_CAREER_KEY,{version:1,completed:true,bestSeconds:0,mastery:{bad:true},routes:['invalid']});
recordFinaleCompletion(legacy);assert.equal(career().bestSeconds,null);
recordFinaleCompletion(full);const best=career().bestSeconds;assert(best>70);const once=career();recordFinaleCompletion(createRun(readSave(JSON.stringify(snapshot(full)))));assert.deepEqual(career(),once);
recordFinaleCompletion(prepared);assert.equal(career().bestSeconds,best);assert.deepEqual(career().mastery,['unbroken','read-the-wake']);
checks.push('Career merge survives malformed data; repeated completion is idempotent and checkpoint reloads cannot create a zero-time best');
globalThis.localStorage={getItem:()=>{throw Error('denied');},setItem:()=>{throw Error('denied');}};
assert.equal(recordFinaleCompletion(full),false);assert.equal(finaleEntry('garage').crewLogs,0);
checks.push('Unavailable storage leaves outcomes usable and reports persistence failure');
fs.mkdirSync('output/final-cut/outcome',{recursive:true});fs.writeFileSync('output/final-cut/outcome/rules.json',JSON.stringify({passed:true,checks},null,2));console.log(JSON.stringify({passed:true,checks},null,2));
