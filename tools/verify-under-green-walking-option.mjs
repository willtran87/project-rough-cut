import assert from 'node:assert/strict';
import fs from 'node:fs';
import {createRun,step,MOVEMENT} from '../web/under-green-sim.js';
import {WATERS,waterState,waterPoint,waterLocal,inWater,solid,lineClear} from '../web/under-green-course.js';
import {crossingAdvice,walkingCrossingOption} from '../web/under-green-guidance.js';
import {ARRIVAL} from '../web/under-green-encounters.js';

const out='output/under-green/walking-option';fs.mkdirSync(out,{recursive:true});
const rows=[],excluded=[],failures=[];
for(const w of WATERS.filter(w=>w.id!=='bypass'))for(const side of [-1,1])for(const approach of [.4,.65,1.25]){
 const start=waterPoint(w,0,side*(w.depth/2+approach)),target=waterPoint(w,0,-side*(w.depth/2+.4));
 if(solid(start,.3)||solid(target,.3)||!lineClear(start,target,.3)||WATERS.some(v=>v!==w&&Array.from({length:101},(_,i)=>({x:start.x+(target.x-start.x)*i/100,y:start.y+(target.y-start.y)*i/100})).some(p=>inWater(p,v,.3)))){excluded.push({channel:w.id,side,approach});continue;}
 const state=waterState(w,24-w.offset,true),walking=crossingAdvice(start,w,state,MOVEMENT.walk).seconds,slow=crossingAdvice(start,w,state,MOVEMENT.crouch).seconds;
 for(const remaining of [walking-.02,walking,walking+.02,(walking+slow)/2,slow-.02,slow,slow+.02])for(const acceleration of [false,true])for(const stance of ['crouch','focus','both']){
  const r=createRun(2);Object.assign(r,{mode:'playing',time:w.id==='return'?30:24+(w.lowSeconds??(w.lesson?5:3))+1.5-remaining-w.offset,bypass:true,bypassAt:w.id==='return'?28+remaining:0});
  const held={crouch:stance!=='focus',focus:stance!=='crouch'};
  Object.assign(r.player,start,{crouched:held.crouch,focus:held.focus,yaw:Math.atan2(target.x-start.x,target.y-start.y),grace:0});Object.assign(r.joe,{...ARRIVAL.spawn,phase:'enter',age:-100000});
  const water=waterState(w,r.time,true,r.bypassAt),current=crossingAdvice(r.player,w,water,MOVEMENT.crouch),option=walkingCrossingOption(r.player,w,water,MOVEMENT.crouch,MOVEMENT.walk);
  const row={channel:w.id,side,approach,remaining,stance,acceleration,current:current.action,offered:!!option};
  if(option){
   assert.equal(current.action,'wait');assert(option.seconds<=water.safeFor);
   for(let i=0;i<15;i++)step(r,held);
   while(r.mode==='playing'&&side*waterLocal(r.player,w).y>-(w.depth/2+.4)&&r.elapsed<8&&!r.waterHits)step(r,{forward:1,acceleration});
   Object.assign(row,{cleared:side*waterLocal(r.player,w).y<=-(w.depth/2+.4),hits:r.waterHits,seconds:r.elapsed,solid:solid(r.player,.3)});
   if(!row.cleared||row.hits||row.solid)failures.push(row);
  }
  for(const blocked of [{crouched:false,focus:false},{crouched:true,stumble:.1},{crouched:true,recovery:{}}])assert.equal(walkingCrossingOption({...start,...blocked},w,water,MOVEMENT.crouch,MOVEMENT.walk),null);
  assert.equal(walkingCrossingOption({...w,crouched:true},w,water,MOVEMENT.crouch,MOVEMENT.walk),null);
  rows.push(row);
 }
}
for(const w of WATERS.filter(w=>['return','bypass'].includes(w.id)))for(const bypass of [false,true]){
 const p={...waterPoint(w,0,w.depth/2+.65),crouched:true},state=waterState(w,24,bypass,21);
 assert.equal(walkingCrossingOption(p,w,state,MOVEMENT.crouch,MOVEMENT.walk),null);
}
fs.writeFileSync(out+'/rules.json',JSON.stringify({passed:!failures.length,rows,failures,excluded,limits:['Centered unobstructed approaches from both banks with 250ms reaction delay, both movement responses and crouch/listen/combined stances.','Joe inactive to isolate timing; no guarantee against nearby attacks or human reading-time claim.']},null,2));
assert.deepEqual(failures,[]);assert(rows.some(r=>r.offered));assert(rows.some(r=>!r.offered));
console.log(JSON.stringify({passed:true,cases:rows.length,offered:rows.filter(r=>r.offered).length,excluded:excluded.length}));
