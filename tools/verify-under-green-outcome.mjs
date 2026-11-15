import assert from 'node:assert/strict';
import fs from 'node:fs';
import {createRun,step,snapshot,readSave} from '../web/under-green-sim.js';
import {captureFailure,retryProgress} from '../web/under-green-outcome.js';
const out='output/under-green/outcome';fs.mkdirSync(out,{recursive:true});
const fixture=JSON.parse(fs.readFileSync('output/under-green/navigation/service-encounter.json','utf8'));
const cases=[],advance=(r,n,input={})=>{for(let i=0;i<n&&r.mode==='playing';i++)step(r,input);};
for(const crouch of [false,true]){
 const r=structuredClone(fixture);advance(r,100,{crouch});assert.equal(r.mode,'caught');assert.equal(r.failure.kind,crouch?'crouched':'sweep');assert.match(r.failure.advice,/sideways/);cases.push({name:crouch?'crouched':'ordinary',failure:r.failure});
}
const r=createRun();r.mode='playing';r.time=3;Object.assign(r.player,{x:0,y:60,yaw:0,grace:0});Object.assign(r.joe,{phase:'search',x:-20,y:40,last:{x:-20,y:40}});
advance(r,50);assert.equal(r.waterHits,1);assert(!r.player.recovery);
Object.assign(r.joe,{x:r.player.x,y:r.player.y-1.3,yaw:0,phase:'windup',age:0,weaponPose:null,weaponBlocked:false});
advance(r,100);assert.equal(r.mode,'caught');assert.equal(r.failure.kind,'after-surge');assert.equal(r.failure.water,'spillway');assert.match(r.failure.advice,/dry route/);cases.push({name:'actual-surge-then-strike',failure:r.failure});
fs.writeFileSync(out+'/caught-after-surge.json',JSON.stringify(r,null,2));
const stale=structuredClone(r);stale.time+=10;assert.notEqual(captureFailure(stale).kind,'after-surge');
const distant=structuredClone(r);distant.player.x+=20;assert.notEqual(captureFailure(distant).kind,'after-surge');
const unknown=structuredClone(r);unknown.events=unknown.events.map(e=>e.type==='water-hit'?{...e,id:'unknown'}:e);assert.notEqual(captureFailure(unknown).kind,'after-surge');
const bank=createRun();bank.mode='playing';bank.time=3;Object.assign(bank.player,{x:0,y:58.8,grace:0});Object.assign(bank.joe,{x:0,y:57.5,yaw:0,phase:'windup',age:0});advance(bank,100);assert.equal(bank.mode,'caught');assert.equal(bank.failure.kind,'blocked-bank');cases.push({name:'actual-blocked-bank-strike',failure:bank.failure});
const closure=structuredClone(fixture);closure.closing=true;assert.equal(captureFailure(closure).kind,'closing');
const lesson=structuredClone(r);lesson.events=[{type:'water-hit',id:'lesson',time:lesson.time,x:lesson.player.x,y:lesson.player.y}];assert(!captureFailure(lesson).advice.includes('dry route'));
// A failed attempt saves preferences, not mechanisms, evidence or spawn points.
const saved=readSave(JSON.stringify(snapshot({...r,checkpoint:2,bypass:true,evidence:true})));
const retry=createRun(0,false,saved.difficulty);assert(!retry.bypass&&!retry.evidence);assert(!retry.failure);assert.equal(retry.waterHits,0);assert.equal(retry.player.x,0);assert.equal(retry.player.y,5);assert.equal(retry.joe.phase,'absent');assert(!('checkpoint' in saved));assert(!saved.evidence);
assert.match(retryProgress(retry),/Every attempt starts at the drain entrance/);
fs.writeFileSync(out+'/rules.json',JSON.stringify({passed:true,cases,checks:['Real sweep, crouched, recent-surge and blocked-bank captures select factual coaching','Stale, distant and unknown water events cannot blame a surge','Gate context and no-detour water wording remain specific','Retry starts at the entrance with mechanisms, evidence and pursuit reset']},null,2));
console.log(JSON.stringify({passed:true,cases}));
