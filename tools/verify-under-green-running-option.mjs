import assert from 'node:assert/strict';
import fs from 'node:fs';
import {createRun,step,MOVEMENT} from '../web/under-green-sim.js';
import {WATERS,waterState,waterPoint,waterLocal,inWater,solid,lineClear,distance} from '../web/under-green-course.js';
import {crossingAdvice,runningCrossingOption} from '../web/under-green-guidance.js';
const out='output/under-green/running-option';fs.mkdirSync(out,{recursive:true});
const rows=[],excluded=[],failures=[],examples=[];
for(const w of WATERS.filter(w=>w.id!=='bypass'))for(const side of [-1,1])for(const approach of [.4,.65,1.25]){
 const start=waterPoint(w,0,side*(w.depth/2+approach)),target=waterPoint(w,0,-side*(w.depth/2+.4));
 const geometry={channel:w.id,side,approach};
 if(solid(start,.3)||solid(target,.3)||!lineClear(start,target,.3)||WATERS.some(v=>v!==w&&Array.from({length:101},(_,i)=>({x:start.x+(target.x-start.x)*i/100,y:start.y+(target.y-start.y)*i/100})).some(p=>inWater(p,v,.3)))){excluded.push(geometry);continue;}
 const runSeconds=crossingAdvice(start,w,waterState(w,24-w.offset,true),MOVEMENT.sprint).seconds;
 const walkSeconds=crossingAdvice(start,w,waterState(w,24-w.offset,true),MOVEMENT.walk).seconds;
 // Sample just before/at/after both decision boundaries plus their interior.
 for(const remaining of [runSeconds-.02,runSeconds,runSeconds+.02,(runSeconds+walkSeconds)/2,walkSeconds-.02,walkSeconds,walkSeconds+.02])for(const acceleration of [false,true]){
  const r=createRun(2);Object.assign(r,{mode:'playing',time:w.id==='return'?30:24+(w.lowSeconds??(w.lesson?5:3))+1.5-remaining-w.offset,bypass:true,bypassAt:w.id==='return'?28+remaining:0});Object.assign(r.player,start,{yaw:Math.atan2(target.x-start.x,target.y-start.y),grace:0});Object.assign(r.joe,{phase:'enter',age:-100000});
  const state=waterState(w,r.time,true,r.bypassAt),current=crossingAdvice(r.player,w,state,MOVEMENT.walk),option=runningCrossingOption(r.player,w,state,MOVEMENT.walk,MOVEMENT.sprint);
  const row={...geometry,remaining,acceleration,current:current.action,offered:!!option};
  if(option){
   assert.equal(current.action,'wait');assert(option.seconds<=state.safeFor);const initial=structuredClone(r),inputs=[];
   for(let i=0;i<15;i++){inputs.push({});step(r,{});}
   while(side*waterLocal(r.player,w).y>-(w.depth/2+.4)&&r.elapsed<8&&!r.waterHits){const input={forward:1,sprint:true,acceleration};inputs.push(input);step(r,input);}
   Object.assign(row,{cleared:side*waterLocal(r.player,w).y<=-(w.depth/2+.4),hits:r.waterHits,seconds:r.elapsed,solid:solid(r.player,.3)});
   if(!row.cleared||row.hits||row.solid)failures.push(row);
   if(w.id==='range-b'&&side===1&&approach===.65&&Math.abs(remaining-(runSeconds+walkSeconds)/2)<1e-8)examples.push({name:acceleration?'eased':'immediate',initial,inputs,final:r,row});
  }
  // Stances/recovery that override Run must never receive this option.
  for(const blocked of [{crouched:true},{focus:true},{sprinting:true},{stumble:.1},{recovery:{}}])assert.equal(runningCrossingOption({...start,...blocked},w,state,MOVEMENT.walk,MOVEMENT.sprint),null);
  assert.equal(runningCrossingOption(w,w,state,MOVEMENT.walk,MOVEMENT.sprint),null);
  rows.push(row);
 }
}
assert(rows.some(r=>r.offered));assert(rows.some(r=>!r.offered));
// Permanent event-controlled states never invent a transient run window. The
// return's actual two-second warning is tested as a timed window above.
for(const w of WATERS.filter(w=>['return','bypass'].includes(w.id)))for(const bypass of [false,true]){
 const p=waterPoint(w,0,w.depth/2+.65),state=waterState(w,24,bypass,21);
 assert.equal(runningCrossingOption(p,w,state,MOVEMENT.walk,MOVEMENT.sprint),null);
}
fs.writeFileSync(out+'/verified.json',JSON.stringify({passed:!failures.length,cases:rows.length,offered:rows.filter(r=>r.offered).length,rows,excluded,failures,limits:['Centered unobstructed banks, 250ms reaction delay, full movement input; both start-response settings.','Joe deliberately inactive to isolate timing. Does not establish that crossing is safe from a nearby trimmer.','Continuous adaptive route/pressure and actual-device usability need separate evidence.']},null,2));
fs.writeFileSync(out+'/examples.json',JSON.stringify(examples));assert.deepEqual(failures,[]);assert.equal(examples.length,2);
console.log(JSON.stringify({passed:true,cases:rows.length,offered:rows.filter(r=>r.offered).length,excluded:excluded.length,examples:examples.length}));
