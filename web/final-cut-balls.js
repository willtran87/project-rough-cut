import {clamp,distance,wrap,WALLS,FIXTURES,BREAKABLES,REFUGES,ROAD_FENCE,BOUNDS,lineClear} from './final-cut-course.js';
import {groundHeight,ACCESS_FENCE,ACCESS_GATE} from './final-cut-arrival-layout.js';
import {refugeRoofEnvelopes} from './final-cut-architecture-layout.js';

export const BALL_CAPACITY=3,MAX_WORLD_BALLS=12,CHARGE_SECONDS=1.2;
export const freshAim=()=>({active:false,held:0,power:0,plan:null});
const radius=.055;
const roofObstacles=refugeRoofEnvelopes(REFUGES);
// The visible preview and moving ball sample this same parabola.
export function flightPoint(plan,t){t=clamp(t,0,1);return {x:plan.from.x+(plan.end.x-plan.from.x)*t,y:plan.from.y+(plan.end.y-plan.from.y)*t,z:plan.from.z+(plan.end.z-plan.from.z)*t+4*plan.loft*t*(1-t)};}
function hitBox(a,b,box){
 let lo=0,hi=1;
 for(const [axis,min,max]of [['x',box.x-box.w/2-radius,box.x+box.w/2+radius],['y',box.y-box.d/2-radius,box.y+box.d/2+radius],['z',(box.bottom||0)-radius,box.h+radius]]){
  const d=b[axis]-a[axis];if(Math.abs(d)<1e-9){if(a[axis]<min||a[axis]>max)return null;continue;}
  let t0=(min-a[axis])/d,t1=(max-a[axis])/d;if(t0>t1)[t0,t1]=[t1,t0];lo=Math.max(lo,t0);hi=Math.min(hi,t1);if(lo>hi)return null;
 }
 if(box.roofSlope)for(const side of [-1,1]){
  const slope=side*box.roofSlope,limit=box.roofPeak+radius*Math.hypot(1,slope);
  const from=a.z+slope*(a.x-box.x)-limit,to=b.z+slope*(b.x-box.x)-limit;
  if(from>0&&to>0)return null;
  if(from<=0&&to<=0)continue;
  const t=from/(from-to);if(from>0)lo=Math.max(lo,t);else hi=Math.min(hi,t);
  if(lo>hi)return null;
 }
 return lo;
}
export function planChip(r,power=0){
 const p=r.player,yaw=p.yaw+p.rearAngle,range=(6+18*clamp(power,0,1))*clamp((1-Math.min(.15,p.pitch)*.65)*.15/Math.max(.15,p.pitch),.08,1.3),from={x:p.x,y:p.y,z:groundHeight(p)+.12};
 const end={x:p.x+Math.sin(yaw)*range,y:p.y+Math.cos(yaw)*range};end.z=groundHeight(end)+radius;
 const plan={from,end,loft:clamp(1.2+power*1.5-p.pitch*.7,.5,3.4),duration:.6+.5*power,blocked:false,reason:'',points:[from]};
 const obstacles=[...WALLS,...FIXTURES,...ROAD_FENCE,...ACCESS_FENCE,{...ACCESS_GATE,x:ACCESS_GATE.x-4*r.arrival.gate},...BREAKABLES.filter(b=>!r.broken.includes(b.id)),...roofObstacles];
 let previous=from;
 for(let k=1;k<=48;k++){
  const point=flightPoint(plan,k/48);let first=1,blocked=false;
  for(const box of obstacles){const t=hitBox(previous,point,box);if(t!==null&&t<=first){first=t;blocked=true;plan.obstacle=box.id||'fence';}}
  if(blocked){plan.points.push({x:previous.x+(point.x-previous.x)*first,y:previous.y+(point.y-previous.y)*first,z:previous.z+(point.z-previous.z)*first});plan.blocked=true;plan.reason='Blocked — lower the arc or aim through an opening';break;}
  if(point.x<BOUNDS.left+.3||point.x>BOUNDS.right-.3||point.y<BOUNDS.start+.3||point.y>93.5){plan.points.push(point);plan.blocked=true;plan.reason='Outside the playable course';break;}
  if(k<48&&point.z<groundHeight(point)+radius){plan.points.push(point);plan.blocked=true;plan.reason='Raised ground blocks the shot';break;}
  plan.points.push(point);previous=point;
 }
 plan.target=plan.points.at(-1);return plan;
}
export function restoreBallState(saved){
 const ballCount=Number.isFinite(saved.ballCount)?clamp(Math.floor(saved.ballCount),0,BALL_CAPACITY):BALL_CAPACITY;
 const balls=Array.isArray(saved.groundBalls)?saved.groundBalls.filter(b=>b&&Number.isFinite(b.x)&&Number.isFinite(b.y)&&b.x>BOUNDS.left&&b.x<BOUNDS.right&&b.y>BOUNDS.start&&b.y<94).slice(-MAX_WORLD_BALLS).map((b,i)=>({id:i+1,x:b.x,y:b.y,z:groundHeight(b)+radius,age:0,landed:true,plan:null})):[];
 const flight=saved.ballFlight,point=p=>p&&['x','y','z'].every(k=>Number.isFinite(p[k]))&&p.x>BOUNDS.left&&p.x<BOUNDS.right&&p.y>BOUNDS.start&&p.y<94&&p.z>=0&&p.z<=5;
 if(flight&&point(flight.from)&&point(flight.end)&&Number.isFinite(flight.loft)&&flight.loft>=.5&&flight.loft<=3.4&&Number.isFinite(flight.duration)&&flight.duration>=.6&&flight.duration<=1.1&&Number.isFinite(flight.age)&&flight.age>=0&&flight.age<flight.duration){
  if(balls.length>=MAX_WORLD_BALLS)balls.shift();const plan={from:{...flight.from},end:{...flight.end},loft:flight.loft,duration:flight.duration};balls.push({id:MAX_WORLD_BALLS+1,...plan.end,age:flight.age,landed:false,plan});
 }
 return {ballCount,balls,ballSerial:Math.max(0,...balls.map(b=>b.id)),ballAim:freshAim()};
}
export function ballSnapshot(r){const b=r.balls.find(b=>!b.landed);return {ballCount:r.ballCount,groundBalls:r.balls.filter(b=>b.landed).map(b=>({x:b.x,y:b.y})),ballFlight:b?{from:{...b.plan.from},end:{...b.plan.end},loft:b.plan.loft,duration:b.plan.duration,age:b.age}:null};}
export function ballAction(r){
 if(r.ballCount>=BALL_CAPACITY)return null;
 const p=r.player,view=p.yaw+p.rearAngle;
 const b=r.balls.find(b=>b.landed&&distance(p,b)<1.7&&Math.abs(groundHeight(p)-b.z)<.75&&Math.abs(wrap(Math.atan2(b.x-p.x,b.y-p.y)-view))<1.05&&lineClear(p,b,.4));
 return b?{id:'recover-ball',ballId:b.id,x:b.x,y:b.y,label:'Recover golf ball'}:null;
}
export function advanceBalls(r,i,dt,event,say){
 let aim=r.ballAim;
 if(i.chipStart&&!r.won){
  if(!r.ballCount)say(r,'No balls carried. Recover a ball or refill at a shelter basket.',3);
  else if(r.balls.some(b=>!b.landed))say(r,'Wait for the ball to land.',2);
  else {r.ballAim=aim=freshAim();aim.active=true;}
 }
 if(aim.active){
  if(r.won||i.cancelChip){r.ballAim=freshAim();}
  else{
   if(i.chipHeld)aim.held=Math.min(CHARGE_SECONDS,aim.held+dt);
   aim.power=aim.held/CHARGE_SECONDS;
   const p=r.player,key=[p.x,p.y,p.yaw,p.pitch,p.rearAngle,aim.power,r.arrival.gate,r.broken.join(',')].join('|');
   if(key!==aim.planKey){aim.plan=planChip(r,aim.power);aim.planKey=key;}
   if(i.chipRelease){
    if(aim.plan.blocked)say(r,'Shot held. '+aim.plan.reason+'.',3);
    else{
     r.ballCount--;r.stats.balls++;r.saveSerial++;const plan=aim.plan;
     if(r.balls.length>=MAX_WORLD_BALLS)r.balls.shift();
     r.balls.push({id:++r.ballSerial,x:plan.end.x,y:plan.end.y,z:plan.end.z,age:0,landed:false,plan});event(r,'chip',{x:plan.from.x,y:plan.from.y});
    }r.ballAim=freshAim();
   }
  }
 }
 for(const b of r.balls){
  if(b.landed)continue;b.age+=dt;
  if(b.age>=b.plan.duration){b.landed=true;r.saveSerial++;const reach=lineClear(b,r.rig,.5)?65:24,heard=!r.won&&distance(b,r.rig)<reach;
   if(heard)r.lure={x:b.x,y:b.y,time:r.time,source:'golf ball',trap:false};
   event(r,'ball-land',{x:b.x,y:b.y,heard});if(!r.won)say(r,heard?'Ball landed. Joe can choose that strip after his current pass.':'Ball landed beyond Joe’s hearing. You can recover it.',3);
  }
 }
}
