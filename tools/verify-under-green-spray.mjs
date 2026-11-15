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

// Droplet orientation follows the actual curved flight, including packet sway.
// Repeated lifetimes must change launch spread without a visible reset.
let tangents=0,varied=0,cycles=0,maxTangentError=0;
for(const w of WATERS)for(const jet of channelJets(w))for(let i=0;i<64;i++){
 const seed=spraySeed(i),dt=1e-6,time=1.234,p=sprayDrop(jet,seed,time,.38),q=sprayDrop(jet,seed,time+dt,.38);
 if(q.t>p.t){
  for(const [position,velocity]of [['x','vx'],['y','vy'],['height','vh']]){
   const error=Math.abs((q[position]-p[position])/(dt*seed.rate)-p[velocity]);
   assert(error<.001,'Billboard tangent diverges from particle travel');maxTangentError=Math.max(maxTangentError,error);tangents++;
  }
 }
 const first=(.5-seed.phase)/seed.rate+4/seed.rate,next=first+1/seed.rate;
 const a=sprayDrop(jet,seed,first,.105),b=sprayDrop(jet,seed,next,.105);
 if(Math.hypot(a.x-b.x,a.y-b.y)>.002)varied++;cycles++;
 const wrap=(5-seed.phase)/seed.rate;
 for(const t of [wrap-dt,wrap+dt])assert(sprayDrop(jet,seed,t,.105).alpha<.001,'Packet respawn is visible');
}
assert(varied>cycles*.9,'Successive emissions repeat the same narrow path');
console.log(JSON.stringify({passed:true,tangents,maxTangentError,varied,cycles,checks:['flight-aligned billboards','varied consecutive emissions','invisible lifetime transitions']}));
