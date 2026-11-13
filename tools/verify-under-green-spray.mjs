import assert from 'node:assert/strict';
import {WATERS,waterPoint,onFloor} from '../web/under-green-course.js';
import {channelJets} from '../web/under-green-flow.js';
import {spraySeed,sprayDrop,impactCloud,sprayFootprint} from '../web/under-green-spray.js';
let samples=0,maxLength=0,maxFanHeight=0;
for(const w of WATERS)for(const jet of channelJets(w))for(const impact of [.0282,.105,.38]){
 for(let i=0;i<96;i++)for(const splash of [false,true]){
  const seed=spraySeed(i);
  for(let time=0;time<3;time+=.17){
   const p=sprayDrop(jet,seed,time,impact,splash);samples++;
   assert(Object.values(p).every(Number.isFinite));assert(p.alpha>=0&&p.alpha<=1);
   assert(p.height>=impact-1e-8,'Droplets die at the water, not below it');
   assert(p.width>0&&p.width<.04);assert(p.length>0&&p.length<.09);
   maxLength=Math.max(maxLength,p.length);
   if(splash){maxFanHeight=Math.max(maxFanHeight,p.height-impact);
    const dt=.00001,q=sprayDrop(jet,seed,time+dt,impact,true);
    if(q.t>p.t){const ageDelta=dt*seed.rate*2*(.85+seed.spread*1.25)/9.8;
     assert(Math.abs((q.height-p.height)/ageDelta-p.vh)<.001,'Vertical velocity follows gravity');}
   }
   assert.deepEqual(p,sprayDrop(jet,seed,time,impact,splash),'No random respawn');
  }
 }
 for(let i=0;i<16;i++)for(let time=0;time<2;time+=.13){
  const p=impactCloud(jet,i,time,impact),point=waterPoint(w,p.x,p.y);
  assert(onFloor(point.x,point.y),'Cloud center must stay in authored floor');
  assert(p.alpha>=0&&p.alpha<=.65);assert(p.height-p.tall*.5>=impact);
 }
 // Phase wraps are invisible; positions need not coincide after particle death.
 const seed={...spraySeed(1),phase:0};
 for(const splash of [false,true])assert.equal(sprayDrop(jet,seed,0,impact,splash).alpha,0);
}
console.log(JSON.stringify({passed:true,samples,maxLength,maxFanHeight,checks:['finite/bounded dimensions','water-surface lifetime','gravity-driven fans','deterministic world clock','in-floor cloud origins','invisible phase wraps']}));

let footprints=0;
for(const height of [240,390,600,844,1600])for(const fov of [45,58,85])for(const depth of [.1,1,3,6,12,32])for(let i=0;i<96;i++){
 const p=sprayDrop(channelJets(WATERS[0])[0],spraySeed(i),24,.105),projection=1/Math.tan(fov*Math.PI/360),scale=sprayFootprint(p.width,p.length,depth,projection,height);footprints++;
 assert(scale>=1&&scale<=2.8);assert(p.width*scale<=.0650001&&p.length*scale<=.1000001);
 assert(sprayFootprint(p.width,p.length,depth,projection,height*2)<=scale,'Higher resolution must not enlarge the world footprint');
 const near=sprayFootprint(p.width,p.length,depth+.001,projection,height);assert(Math.abs(near-scale)<.02,'No step change on camera movement');
}
console.log(JSON.stringify({passed:true,footprints,checks:['bounded world footprint','resolution-aware scale','continuous distance response']}));
