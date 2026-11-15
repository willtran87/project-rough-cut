import fs from 'node:fs';
import assert from 'node:assert/strict';
import {createRun,step} from '../web/under-green-sim.js';
import {solid,distance,wrap} from '../web/under-green-course.js';
const baseline=process.argv.includes('--baseline'),out='output/under-green/pursuit-motion/'+(baseline?'before':'after');
fs.mkdirSync(out,{recursive:true});const results=[];
for(const [name,jx,jy,px,py,seconds,moveWest]of [
 ['diagonal-east',-3,7,3,13,16,false],['diagonal-west',3,7,-3,13,16,false],
 ['pump-corner',-17,37,-24,46,24,false],['lost-service-trail',0,34,-4,40,24,true],
]){
 const r=createRun();r.mode='playing';r.time=10;r.messageTime=0;
 Object.assign(r.player,{x:px,y:py,yaw:-Math.PI/2,grace:0});Object.assign(r.joe,{x:jx,y:jy,yaw:Math.atan2(px-jx,py-jy),phase:'walk',last:{x:px,y:py}});
 assert(!solid(r.player,.3));assert(!solid(r.joe,.72));
 const initial=structuredClone(r),frames=[],phases={},metrics={turnSeconds:0,searchSeconds:0,visibleStationary:0,travel:0,headingTravel:0,firstWindup:null};
 for(let i=0;i<seconds*60&&r.mode==='playing';i++){
  const old={x:r.joe.x,y:r.joe.y,yaw:r.joe.yaw};step(r,moveWest&&i<120?{forward:1}:{});
  phases[r.joe.phase]=(phases[r.joe.phase]||0)+1/60;
  if(r.joe.phase==='turn')metrics.turnSeconds+=1/60;if(r.joe.phase==='search')metrics.searchSeconds+=1/60;
  if(r.joe.seen&&r.joe.speed<.05&&!['windup','sweep','recover'].includes(r.joe.phase))metrics.visibleStationary+=1/60;
  metrics.travel+=distance(old,r.joe);metrics.headingTravel+=Math.abs(wrap(r.joe.yaw-old.yaw));
  if(r.joe.phase==='windup'&&metrics.firstWindup===null)metrics.firstWindup=r.elapsed;
  assert(!solid(r.joe,.72));assert(distance(old,r.joe)<=2.1/60+1e-6);
  if(i%3===0){const {telemetry,...state}=r;frames.push(structuredClone(state));}
 }
 results.push({name,initial,mode:r.mode,elapsed:r.elapsed,metrics,phases,gap:distance(r.player,r.joe),player:r.player,joe:r.joe,frames});
}
fs.writeFileSync(out+'/report.json',JSON.stringify({baseline,results}));
console.log(JSON.stringify(results.map(({frames,initial,player,joe,...r})=>r),null,2));
