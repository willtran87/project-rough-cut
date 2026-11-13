import fs from 'node:fs';
import assert from 'node:assert/strict';
import {TRAVEL_ROUTES} from '../web/final-cut-travel-routes.js';
import {planRollingTravel,advanceRollingTravel,TRAVEL_SOLIDS,TRAVEL} from '../web/final-cut-travel.js';
import {rigWallHit,rigWheelAngle,RIG_WHEELS} from '../web/final-cut-rig.js';
const out='output/final-cut/rolling-boss';fs.mkdirSync(out,{recursive:true});const runs=[];let poses=0,maxAcceleration=0,maxSlip=0,minCornerSpeed=Infinity,maxWheelAngle=0;
for(const key of Object.keys(TRAVEL_ROUTES)){
 const [x,y,yaw,ex,ey,eyaw]=key.split(',').map(Number),start={x,y,yaw},end={x:ex,y:ey,yaw:eyaw};
 // Keys are millimetre/radian indices; use the exact authored tangent poses.
 const raw=TRAVEL_ROUTES[key];start.yaw=raw[0].a.yaw;end.yaw=raw.at(-1).b.yaw;
 const route=planRollingTravel(start,end);assert(route);assert.equal(route.samples[0].speed,0);assert.equal(route.samples.at(-1).speed,0);
 for(const p of route.samples){assert(!rigWallHit({...p,phase:'turn',deployment:0},TRAVEL_SOLIDS),key);if(p.distance>3&&p.distance<route.length-3&&Math.abs(p.curvature)>.025)minCornerSpeed=Math.min(minCornerSpeed,p.speed);}
 for(const hz of [30,60,120,144]){
  const j={...start,phase:'turn',deployment:0,steering:0,speed:0,distance:0,path:[end],attack:{from:end,yaw:end.yaw}};let time=0,stops=0,done=false;
  while(time<45&&!done){const old={x:j.x,y:j.y,yaw:j.yaw,speed:j.speed};done=advanceRollingTravel(j,1/hz);assert.notEqual(done,'blocked');time+=1/hz;poses++;
   const moved=Math.hypot(j.x-old.x,j.y-old.y),angle=Math.atan2(Math.sin(j.yaw-old.yaw),Math.cos(j.yaw-old.yaw));
   assert(moved<=TRAVEL.speed/hz+.001);assert(!(moved<1e-6&&Math.abs(angle)>.001),'Stationary pivot');
   if(!done&&j.travel.distance>1&&route.length-j.travel.distance>1&&j.speed<.1)stops++;
   const acceleration=Math.abs(j.speed-old.speed)*hz;maxAcceleration=Math.max(maxAcceleration,acceleration);assert(acceleration<=TRAVEL.acceleration+.02);
   if(moved>.001){const heading=old.yaw+angle/2,slip=Math.abs((j.x-old.x)*Math.cos(heading)-(j.y-old.y)*Math.sin(heading))/moved;maxSlip=Math.max(maxSlip,slip);assert(slip<.025,'Lateral skating');}
   for(const wheel of RIG_WHEELS)maxWheelAngle=Math.max(maxWheelAngle,Math.abs(rigWheelAngle(j,wheel)));
  }
  assert(done);assert.equal(stops,0);assert(Math.hypot(j.x-end.x,j.y-end.y)<1e-8);assert(Math.abs(Math.atan2(Math.sin(j.yaw-end.yaw),Math.cos(j.yaw-end.yaw)))<1e-8);
  runs.push({key,hz,seconds:time,length:route.length,stops});
 }
}
assert(minCornerSpeed>3.5);fs.writeFileSync(out+'/rolling-rules.json',JSON.stringify({passed:true,routes:Object.keys(TRAVEL_ROUTES).length,runs,poses,maxAcceleration,maxSlip,minCornerSpeed,maxWheelAngle},null,2));console.log(JSON.stringify({passed:true,runs:runs.length,poses,maxAcceleration,maxSlip,minCornerSpeed,maxWheelAngle}));
