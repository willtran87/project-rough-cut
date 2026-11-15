import assert from 'node:assert/strict';
import fs from 'node:fs';
import {createVariation,validVariationSeed,nextVariationSeed,variationChoice,commitmentPreference,searchProbeSide,cloudDelay,enterVariationSegment} from '../web/chase-variation.js';
import {createRun,updateRun} from '../web/back-nine-sim.js';
import {updateSenses,updateSearch} from '../web/chase-senses.js';
import {tryCommitment,updateCommitment} from '../web/chase-commitments.js';
import {createChaseAtmosphere} from '../web/chase-atmosphere.js';
import {blocked,distance,COURSE} from '../web/back-nine-course.js';
const checks=[],seeds=Array.from({length:64},(_,i)=>Math.imul(i+1,2654435761)>>>0),profiles=new Set(),sides=new Set(),kinds=new Set(),clouds=new Set();
for(const bad of [undefined,null,NaN,Infinity,-1,1.1,4294967296,'12',{},[]]){assert(!validVariationSeed(bad));assert.equal(createVariation(bad).seed,0);}
for(const seed of [0,1,4294967295])assert(validVariationSeed(seed));
for(const value of [0,1,4294967295]){const seed=nextVariationSeed(value,{getRandomValues(a){a[0]=value;}});assert(seed>0&&seed!==value);}
assert(nextVariationSeed(1,{getRandomValues(){throw Error('unavailable');}})>0);checks.push('Seed validation, duplicate/zero draws and unavailable random source');
function staged(seed,cp=0){const r=createRun(cp,0,seed);r.mode='driving';r.time=20;r.grace=0;r.panic.serial=1;r.tension.phase='stalk';Object.assign(r.cart,{x:0,y:65,yaw:0,speed:8});Object.assign(r.joe,{x:0,y:40,yaw:0,speed:6});return r;}
for(const seed of seeds)for(const cp of [0,1,2]){
 const r=staged(seed,cp),copy=structuredClone(r),pref=commitmentPreference(r,r.hunt.commit);profiles.add(JSON.stringify([pref,cloudDelay(r)]));sides.add(pref.side);kinds.add(pref.kind);clouds.add(cloudDelay(r));
 for(let i=0;i<60;i++)variationChoice(r,'irrelevant-presentation',i,7);assert.deepEqual(r,copy,'Choice lookup has no stream to consume');assert.deepEqual(commitmentPreference(r,r.hunt.commit),pref);
 updateSenses(r,.1,true,false);const hidden=structuredClone(r);r.cart.x=30;r.cart.y=135;hidden.cart.x=-30;hidden.cart.y=90;updateSenses(r,.1,false,false);updateSenses(hidden,.1,false,false);updateSearch(r,.1);updateSearch(hidden,.1);assert.deepEqual(r.joe.senses.points,hidden.joe.senses.points,'Hidden movement cannot influence seeded search');assert(r.joe.senses.points.length<=3);for(const p of r.joe.senses.points.slice(1))assert(!blocked(p,2.7));
 const a=createChaseAtmosphere(),b=createChaseAtmosphere(),retry=staged(seed,cp);r.mode='driving';r.encounter.updated=true;r.encounter.owner='cruise';retry.encounter.updated=true;retry.encounter.owner='cruise';Object.assign(retry.cart,r.cart);Object.assign(retry.joe,{...r.joe,senses:structuredClone(r.joe.senses)});
 for(const t of [0,18,20,27,35,41,48,60,90]){r.time=t;retry.time=t;assert.deepEqual(a.update(r),b.update(retry),'Same checkpoint seed reproduces ambient envelopes');}
}
assert.equal(sides.size,2);assert.equal(kinds.size,2);assert.equal(clouds.size,3);assert(profiles.size>=8);checks.push('64 seeds ×3 checkpoints cover both tactical preferences, both sides and all three cloud offsets without hidden-player knowledge or random-stream coupling');
const actual=[];
for(const seed of seeds){
 const r=staged(seed);Object.assign(r.cart,{x:0,y:110,speed:8});Object.assign(r.joe,{x:0,y:86,speed:12});assert(tryCommitment(r,true,'pass'));assert.equal(r.hunt.phase,'commit_warning');assert.equal(r.variation.choices,1);const points=structuredClone(r.hunt.waypoints);for(let n=0;n<107;n++){r.hunt.age+=1/60;updateCommitment(r,1/60,false);}assert.equal(r.hunt.phase,'commit_warning');r.hunt.age+=1/30;updateCommitment(r,1/30,false);assert.equal(r.hunt.phase,'close_pass');assert.deepEqual(r.hunt.waypoints,points);actual.push({seed,side:r.hunt.commit.side,points});
}
assert.equal(new Set(actual.map(p=>p.side)).size,2);checks.push('Both passing sides launch through real clearance checks, retain full1.8s warning and keep fixed announced targets');
{
 const r=staged(seeds[0]);r.variation.choices=7;Object.assign(r.cart,{x:0,y:299,speed:0});Object.assign(r.joe,{x:0,y:260});updateRun(r,{},1/60);assert.equal(r.checkpoint,1);assert.equal(r.variation.choices,0);assert.equal(r.variation.segmentAt,r.time);assert.equal(r.variation.seed,seeds[0]);
 const retry=createRun(1,0,r.variation.seed);assert.deepEqual(commitmentPreference(r,r.hunt.commit),commitmentPreference(retry,retry.hunt.commit));assert.equal(cloudDelay(r),cloudDelay(retry));
 r.mode='paused';const frozen=JSON.stringify(r);for(let i=0;i<120;i++)updateRun(r,{throttle:1},1/60);assert.equal(JSON.stringify(r),frozen);
 const same=structuredClone(r);same.mode='driving';same.time=300;enterVariationSegment(same);const a=createChaseAtmosphere(),b=createChaseAtmosphere();r.mode='driving';for(const run of [r,same]){run.encounter.updated=true;run.encounter.owner='cruise';run.grace=0;}
 const start=r.variation.segmentAt;for(let n=0;n<60;n++){r.time=start+n;same.time=300+n;assert.deepEqual(a.update(r),b.update(same),'Ambient phase is checkpoint-relative, not accumulated time from the previous attempt');}
 checks.push('Actual relay activation resets local choices and cloud clock; pause and checkpoint-relative retry profiles stay stable');
}
const out='output/back-nine-experience/variation';fs.mkdirSync(out,{recursive:true});fs.writeFileSync(out+'/logic.json',JSON.stringify({passed:true,checks,profiles:profiles.size,actual},null,2));console.log(JSON.stringify({passed:true,checks,profiles:profiles.size}));
