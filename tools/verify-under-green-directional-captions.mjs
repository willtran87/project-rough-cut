import fs from 'node:fs';
import assert from 'node:assert/strict';
import {createRun} from '../web/under-green-sim.js';
import {observeJoe} from '../web/under-green-senses.js';
import {heardSide,pursuitCaption,urgentThreatCaption,soundDescription} from '../web/under-green-observation.js';

const out='output/under-green/directional-captions';fs.mkdirSync(out,{recursive:true});
const checks=[],cases=[];
for(const pan of [-1,-.4,-.399,0,.399,.4,1,NaN,Infinity]){
 const actual=heardSide({audible:true,pan});
 assert.equal(actual,Number.isFinite(pan)&&Math.abs(pan)>=.4?(pan<0?'to your left':'to your right'):'');
 assert.equal(heardSide({audible:false,pan}),'');
}
checks.push('Only audible finite stereo panning outside the broad centre band names a side');
const r=createRun(1);r.mode='playing';r.messageTime=0;r.time=0;
Object.assign(r.player,{x:0,y:54,yaw:0,pitch:0,eyeHeight:1.65});
for(const x of [-2,2])for(const rearAngle of [0,Math.PI]){
 r.player.rearAngle=rearAngle;Object.assign(r.joe,{x,y:54,phase:'windup',age:.1});
 const observed=observeJoe(r),expected=(x<0)!==(rearAngle!==0)?'to your left':'to your right';
 assert(observed.imminent&&!observed.visible);assert.equal(heardSide(observed),expected);
 assert(urgentThreatCaption(r,observed).includes(expected));
 const hidden=[];
 for(const phase of ['walk','turn','search','water-wait','water-recovery','recover']){
  r.joe.phase=phase;hidden.push(pursuitCaption(r,'T'));assert(soundDescription(r).includes(expected));
 }
 assert.equal(new Set(hidden).size,1);assert(hidden[0].includes(expected.toUpperCase()));assert(hidden[0].includes('LOOK TOWARD THE SOUND'));assert(!hidden[0].includes('GLANCE BACK'));
 cases.push({x,rearAngle,pan:observed.pan,expected,caption:urgentThreatCaption({...r,joe:{...r.joe,phase:'windup'}},observed)});
}
checks.push('The camera-relative audible side reverses with rear view while hidden search/wait/recovery states remain indistinguishable');
Object.assign(r.player,{yaw:Math.PI,rearAngle:0});Object.assign(r.joe,{x:0,y:56,phase:'windup'});
assert(!observeJoe(r).visible);assert.equal(heardSide(observeJoe(r)),'');assert(!/left|right|behind|ahead/.test(urgentThreatCaption(r)));
r.player.yaw=0;assert.match(urgentThreatCaption(r),/^Joe raises/);assert(!/left|right/.test(urgentThreatCaption(r)));
checks.push('Centred sound does not disclose front/back position; a visible preparation keeps its visual description');
const retained=[];
for(const {name}of JSON.parse(fs.readFileSync('output/under-green/range-captures/diagnostic.json')).reports){
 const {windup}=JSON.parse(fs.readFileSync(`output/under-green/range-captures/${name}.json`)),o=observeJoe(windup),text=urgentThreatCaption(windup,o);
 assert(o.imminent&&!o.visible);assert(Math.abs(o.pan)>.99);assert(text.includes(o.pan<0?'to your left':'to your right'));
 retained.push({name,pan:o.pan,text});
}
checks.push('All four reproduced range captures receive the same side conveyed by their existing stereo source');
fs.writeFileSync(out+'/rules.json',JSON.stringify({passed:true,checks,cases,retained},null,2));
console.log(JSON.stringify({passed:true,checks}));
