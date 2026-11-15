import assert from 'node:assert/strict';
import {createRun} from '../web/under-green-sim.js';
import {WATERS,waterState} from '../web/under-green-course.js';
import {createDrainWaterContacts} from '../web/under-green-water-contacts.js';
import {contactSplashSample,CONTACT_SPLASH_DROPS} from '../web/under-green-contact-splash.js';
const states=WATERS.map(w=>waterState(w,0,false,0));let samples=0;
for(const hz of [30,60,120]){
 const r=createRun();r.mode='playing';r.joe.phase='recover';r.elapsed=49;
 const blade=(x,height)=>({near:{x,y:8,height},far:{x:x+.5,y:8,height}});
 const actor={blade:blade(0,.65)},pool=createDrainWaterContacts(WATERS);pool.update(r,states,actor);
 r.time=1/hz;actor.blade=blade(.4,.15);pool.update(r,states,actor);
 const hit=pool.stats().last;assert.equal(hit.kind,'blade');assert(Math.abs(hit.x-.216)<1e-8);assert.equal(hit.height,.38);assert(hit.time>0&&hit.time<r.time);assert(hit.vx>0);
 for(let i=0;i<CONTACT_SPLASH_DROPS;i++)for(let age=0;age<=.4;age+=.01){
  const p=contactSplashSample(hit,i,hit.time+age);if(!p)continue;samples++;
  assert(p.height>=hit.height&&p.height<hit.height+.1,'Splash exceeds low impact fan');
  assert(p.x>=hit.x,'Blade fan must follow actual travel direction');
  assert(p.alpha>=0&&p.alpha<=1);assert.deepEqual(p,contactSplashSample(hit,i,hit.time+age));
 }
 assert.equal(contactSplashSample(hit,12,hit.time+.05),null);assert.equal(contactSplashSample(hit,0,hit.time+.5),null);
 const frozen=pool.stats();pool.update(r,states,actor);assert.deepEqual(pool.stats(),frozen);
 r.time+=1/hz;pool.update(r,states,actor);assert.equal(pool.stats().totals.blade,1,'Submerged stationary blade cannot repeatedly splash');
 r.time+=1/hz;actor.blade=blade(.4,.65);pool.update(r,states,actor);
 r.time+=1/hz;actor.blade=blade(.4,.15);pool.update(r,states,actor);assert.equal(pool.stats().totals.blade,2,'Fresh entry at same location must splash');
 const next=createRun();next.mode='playing';pool.update(next,states,actor);assert.equal(pool.stats().active,0);
}
console.log(JSON.stringify({passed:true,frameRates:[30,60,120],ballisticSamples:samples,sweptEntry:true,reentry:true,boundedLowFan:true}));
