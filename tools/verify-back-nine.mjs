import {irrigationPhase} from '../web/chase-irrigation.js';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {chaseActor} from '../web/chase-player.js';
import {createRun,updateRun} from '../web/back-nine-sim.js';
import {COURSE,angleDelta,clamp,distance,blocked,lineClear,planMowerRoute} from '../web/back-nine-course.js';
const checks=[];const check=(name,f)=>{f();checks.push(name)};const step=(r,input,n)=>{for(let i=0;i<n;i++)updateRun(r,input,1/60)};
check('Acceleration, reverse and braking',()=>{const r=createRun();r.mode='driving';r.grace=999;step(r,{throttle:1},60);assert(r.cart.y>17&&r.cart.speed>7);step(r,{brake:true},60);assert(Math.abs(r.cart.speed)<.1);step(r,{throttle:-1},60);assert(r.cart.speed<-4);});
check('Visible boundaries and garage walls stop vehicles',()=>{const r=createRun();r.mode='driving';r.grace=999;Object.assign(r.cart,{x:38,y:30,yaw:Math.PI/2,speed:14});step(r,{throttle:1},120);assert(r.cart.x<=39.15);assert(blocked({x:-29,y:807},.85));assert(blocked({x:4,y:795},.85));});
check('Pause does not advance either vehicle',()=>{const r=createRun();r.mode='paused';const before=JSON.stringify(r);step(r,{throttle:1},180);assert.equal(JSON.stringify(r),before);});
check('Wet turf and bunker handling differ from the road',()=>{const a=createRun(),b=createRun();for(const r of [a,b]){r.mode='driving';r.grace=999;}while(!irrigationPhase(a,0).active)a.time+=1;Object.assign(a.cart,{x:-12,y:235,speed:8});Object.assign(b.cart,{x:0,y:30,speed:8});step(a,{throttle:1,steer:1},12);step(b,{throttle:1,steer:1},12);assert.equal(a.cart.surface,'wet');assert(a.cart.yaw<b.cart.yaw);const s=createRun();s.mode='driving';s.grace=999;Object.assign(s.cart,{x:20,y:238,speed:14});step(s,{throttle:1},1);assert.equal(s.cart.surface,'sand');assert(s.cart.speed<=5.4);});
check('Mower routes around solid clubhouse without corner cutting',()=>{const from={x:4,y:770},to={x:4,y:820},plan=planMowerRoute(from,to);assert(plan.points.length>2);assert(plan.expanded<1600);let prior=from;for(const p of plan.points){assert(lineClear(prior,p),JSON.stringify({prior,p}));prior=p;}assert(distance(prior,to)<1);});
check('Hidden stationary player does not update Joe knowledge',()=>{const r=createRun();r.mode='driving';r.grace=0;Object.assign(r.cart,{x:4,y:820});Object.assign(r.joe,{x:4,y:770,lastSeen:{x:0,y:760},seenAge:1});step(r,{},1);assert.deepEqual(r.joe.lastSeen,{x:0,y:760});assert.equal(r.joe.mode,'search');});
check('Stationary player can be caught; a fresh attempt starts at the shed',()=>{const r=createRun(1);r.mode='driving';r.grace=0;for(let i=0;i<7200&&['driving','dying'].includes(r.mode);i++)step(r,{},1);assert.equal(r.mode,'caught');assert(r.foot);assert.equal(r.cart.health,0);const retry=createRun();assert.equal(retry.checkpoint,0);assert.equal(retry.cart.hits,0);assert.equal(retry.cart.y,14);});
const drives=[];
for(const scenario of [{start:0},{start:1},{start:2},{start:0,branch:1},{start:0,branch:2},{start:0,branch:3},{start:0,branch:4},{start:0,branch:5},{start:0,branch:6},{start:0,branch:7},{start:0,branch:8},{start:0,branch:9}]){
 const {start,branch}=scenario;let drivingRoute=COURSE.paths[0];if(branch){const alt=COURSE.paths[branch],first=drivingRoute.findIndex(p=>p[1]===alt[0][1]),last=drivingRoute.findIndex(p=>p[1]===alt.at(-1)[1]);drivingRoute=[...drivingRoute.slice(0,first),...alt,...drivingRoute.slice(last+1)];}
 const r=createRun(start,0,Number(process.env.CHASE_UPGRADE_SEED||0));r.mode='driving';let i=1,min=Infinity,last={...r.joe},largestStep=0,served=start,serviceHold=0;
 for(let f=0;f<180*60&&(r.mode==='driving'||r.mode==='sealing');f++){
  const actor=chaseActor(r),route=drivingRoute;while(i<route.length-1&&(distance(actor,{x:route[i][0],y:route[i][1]})<(r.foot?2:7)||actor.y>route[i][1]+2))i++;
  const releasing=actor.y>788&&!r.exitRelease.released;
  let target=releasing?{x:-23,y:795.5}:actor.y>788?COURSE.finish:{x:route[i][0],y:route[i][1]},delta=angleDelta(Math.atan2(target.x-actor.x,target.y-actor.y),actor.yaw),near=releasing?distance(actor,{x:-23,y:795.5})<3.2:distance(actor,COURSE.finish)<(r.foot?1:4.5);
  const dx=target.x-actor.x,dy=target.y-actor.y,d=Math.max(1,Math.hypot(dx,dy)),yaw=actor.viewYaw||0;
  const service=branch===9&&!r.foot&&served<2&&actor.y>COURSE.checkpoints[served].y-25&&actor.y<COURSE.checkpoints[served].y+5;
  if(service){target=COURSE.checkpoints[served];const d=distance(actor,target),turn=angleDelta(Math.atan2(target.x-actor.x,target.y-actor.y),actor.yaw),charging=d<4&&actor.speed<.7;
   if(charging){serviceHold+=1/60;if(serviceHold>3.6){served++;serviceHold=0;}}
   const desired=clamp((d-2)*2,0,14);updateRun(r,{throttle:charging?0:actor.speed<desired?1:0,steer:charging?0:clamp(turn*2,-1,1),brake:charging||actor.speed>desired+1},1/60);
  }else updateRun(r,r.foot?{throttle:near?0:Math.abs(delta)>1.1?0:1,steer:near?0:clamp(delta*2,-1,1),brake:near}:{throttle:near?0:1,steer:clamp(delta*2,-1,1),brake:near||Math.abs(delta)>.7&&r.cart.speed>8},1/60);
  min=Math.min(min,distance(r.cart,r.joe));largestStep=Math.max(largestStep,distance(last,r.joe));last={...r.joe};
 }
 assert.equal(r.mode,'complete',JSON.stringify(r));assert.equal(r.checkpoint,2);assert(largestStep<44/60+.003,'Joe must stay within the physical 44 m/s catch-up cap');assert(largestStep>.1,'Joe must roam/pursue in each relay-stage fixture');if(start===0)assert(r.tension.beats+r.hunt.interceptions+r.hunt.commit.count+r.joe.ram.launches>0,'Full routes must include warned pursuit beats');drives.push({start,branch,surges:r.tension.beats,interceptions:r.hunt.interceptions,alongside:r.hunt.alongside,commitments:r.hunt.commit.count,closePasses:r.hunt.commit.passes,pressureWaves:r.pressure.waves,brokenHurdles:r.courseFX.breaks.filter(b=>b.age>=0).length,seconds:r.time,onFoot:!!r.foot,health:r.cart.health,contacts:r.cart.hits,closestJoe:min,largestJoeStep:largestStep,events:r.events});
}
checks.push('Full start and both isolated relay-stage fixtures can reach victory after driving or ejection with live Joe; no teleports');
fs.mkdirSync('output/back-nine',{recursive:true});fs.writeFileSync('output/back-nine/simulation.json',JSON.stringify({checks,drives},null,2));console.log(JSON.stringify({passed:true,checks,drives},null,2));
