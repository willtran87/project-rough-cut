import assert from 'node:assert/strict';
import {drainDetailGain,createDrainTonalGrade} from '../web/under-green-tonal-grade.js';
let previous=0;
for(let i=0;i<=12000;i++){
 const value=i/100000,gain=drainDetailGain(value),result=value*gain;
 assert(gain>=1&&gain<=1.4200001);assert(result>=previous,'Detail curve must not reverse contrast');previous=result;
}
assert.equal(drainDetailGain(0),1);assert.equal(drainDetailGain(.12),1);assert.equal(drainDetailGain(1),1);
assert(drainDetailGain(.006)>1.4);
// Semantic exclusions survive cloned material data. Existing compile hooks
// and their owning material must still run, and disposal must restore them.
const calls=[],compile=function(shader){calls.push(this);shader.fragmentShader+='\n// previous surface finish';},key=()=> 'previous';
const material=overrides=>({isMeshPhongMaterial:true,userData:{},onBeforeCompile:compile,customProgramCacheKey:key,...overrides});
const stone=material({}),water=material({userData:{drainColorRole:'water'}}),glass=material({transparent:true}),signal=material({isMeshPhongMaterial:false,isMeshBasicMaterial:true});
const grade=createDrainTonalGrade({traverse:visit=>[stone,water,glass,signal].forEach(m=>visit({isMesh:true,material:m}))});
const shader={fragmentShader:'#include <opaque_fragment>'};stone.onBeforeCompile(shader);assert.equal(calls[0],stone);assert(shader.fragmentShader.includes('outgoingLight*=drainDetailLift'));assert(shader.fragmentShader.includes('previous surface finish'));
for(const m of [water,glass,signal])assert.equal(m.onBeforeCompile,compile);
assert.equal(grade.stats().materials,1);grade.dispose();assert.equal(stone.onBeforeCompile,compile);assert.equal(stone.customProgramCacheKey,key);
console.log(JSON.stringify({passed:true,curveSamples:12001,waterAndEffectsExcluded:true,hookRestoration:true}));
