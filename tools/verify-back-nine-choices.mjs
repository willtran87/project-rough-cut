import fs from 'node:fs';
import assert from 'node:assert/strict';
import {createRun,updateRun} from '../web/back-nine-sim.js';
import {chaseActor,impactDamage} from '../web/chase-player.js';
import {ramDamageScale} from '../web/ram-damage.js';
import {COURSE,blocked,lineClear,mowerLineClear,planMowerRoute,navigationStats,distance,angleDelta,clamp} from '../web/back-nine-course.js';
import {hullOverlap,constrainFeatureMotion,vehicleOverlap} from '../web/vehicle-contact.js';
import {updateHunt} from '../web/back-nine-hunt.js';
const out='output/back-nine-route-choices';fs.mkdirSync(out,{recursive:true});const checks=[],gateResults=[],drives=[];
const tick=(r,input={},n=1)=>{for(let i=0;i<n;i++)updateRun(r,input,1/60);};
function trace(g,kind){let p={x:g.x,y:g.y-5,yaw:0,speed:8};for(let i=0;i<100;i++){const before={...p};p.y+=.1;if(blocked(p,kind==='foot'?.32:kind==='cart'?.85:1.65)){p=before;break;}if(constrainFeatureMotion(p,before,kind))break;}return p.y-g.y;}
for(const d of COURSE.decisions){
 assert(trace(d.gate,'cart')>4,d.id+' cart passes');assert(trace(d.gate,'mower')<0,d.id+' mower stops');assert(!mowerLineClear({x:d.gate.x,y:d.gate.y-6},{x:d.gate.x,y:d.gate.y+6}));
 const plan=planMowerRoute(d.entry,d.merge);assert(plan.points.length,d.id+' mower has a wide detour');let prior=d.entry;for(const p of plan.points){assert(mowerLineClear(prior,p));prior=p;}
 if(d.foot){assert(trace(d.foot,'foot')>4,d.id+' runner passes');assert(trace(d.foot,'cart')<0,d.id+' cart cannot fit');}
 gateResults.push({id:d.id,detourPoints:plan.points.length,expanded:plan.expanded,footGap:!!d.foot});
}
checks.push('Five cart gaps, three foot gaps and reachable mower detours use the actual swept hulls');
for(const checkpoint of [0,1,2]){const r=createRun(checkpoint);let prior=0;for(let y=0;y<=820;y++){r.cart.y=y;const scale=ramDamageScale(r);assert(scale>=prior);assert(scale<=2.150001);prior=scale;}if(checkpoint<2)assert(prior<2.15);}
const damage=[];for(const [checkpoint,y]of [[0,40],[1,310],[2,590],[2,740],[2,807]]){const r=createRun(checkpoint);r.cart.y=y;damage.push({checkpoint,y,multiplier:ramDamageScale(r),glance:impactDamage(.32,r,0),hard:impactDamage(1,r,1)});assert(impactDamage(.32,r,0)<impactDamage(1,r,1));}
for(const [checkpoint,y]of [[0,300],[1,580]]){const r=createRun(checkpoint);r.cart.y=y;const before=ramDamageScale(r);r.checkpoint++;assert.equal(ramDamageScale(r),before,'No relay discontinuity');}
checks.push('Damage is monotonic, capped, relay-gated, angle/speed-sensitive and continuous across relay activation');
function drive(r,route,limit=90){let i=1;for(let f=0;f<limit*60&&r.mode==='driving';f++){
 const c=chaseActor(r),goal=route[i],next=route[i+1],d=distance(c,goal);if(d<(r.foot?1:2)&&i<route.length-1){i++;continue;}if(i===route.length-1&&d<1.4)return true;
 const dx=goal.x-c.x,dy=goal.y-c.y,yaw=c.viewYaw||0;
 if(r.foot){const delta=angleDelta(Math.atan2(dx,dy),c.yaw);tick(r,{throttle:Math.abs(delta)>1.1?0:1,steer:clamp(delta*2,-1,1)});continue;}
 const delta=angleDelta(Math.atan2(dx,dy),c.yaw),bend=next?Math.abs(angleDelta(Math.atan2(next.x-goal.x,next.y-goal.y),Math.atan2(dx,dy))):0,desired=bend>.4&&d<10?4:Math.abs(delta)>.5?4:9;
 tick(r,{throttle:c.speed<desired?1:0,steer:clamp(delta*2,-1,1),brake:c.speed>desired+1});
 }return false;}
// Controlled pursuit-free runs isolate steering/collision clearance, separately
// from the live-Joe full-course runs in verify-back-nine.mjs.
for(let i=4;i<COURSE.paths.length;i++){const path=COURSE.paths[i].map(([x,y])=>({x,y})),r=createRun(path[0].y>580?2:path[0].y>300?1:0);r.mode='driving';r.grace=999;Object.assign(r.cart,{...path[0],yaw:Math.atan2(path[1].x-path[0].x,path[1].y-path[0].y)});assert(drive(r,path),JSON.stringify({branch:i,cart:r.cart,foot:r.foot}));assert(!r.foot);drives.push({branch:i,seconds:r.time});}
checks.push('Every new tight branch can be driven end to end without collisions trapping the cart');
const prediction=createRun(1);prediction.mode='driving';prediction.grace=0;prediction.cart.hits=1;Object.assign(prediction.cart,{x:-12,y:330,speed:8});Object.assign(prediction.joe,{x:0,y:307,speed:12});prediction.tension.phase='stalk';updateHunt(prediction,1/60,true);assert.equal(prediction.hunt.phase,'signal');const captured=JSON.stringify(prediction.hunt.waypoints);prediction.cart.x=15;updateHunt(prediction,.3,false);assert.equal(JSON.stringify(prediction.hunt.waypoints),captured);checks.push('Joe announces a feasible wide interception and does not track a hidden lane change');
// Real late impact, then normal on-foot input through the small service gap.
const late=createRun(2);late.mode='driving';late.grace=0;late.cart.health=25;Object.assign(late.cart,{x:-24,y:749,yaw:0});Object.assign(late.joe,{x:-24,y:744,yaw:0,speed:20});late.joe.ram.armed=true;
for(let i=0;i<180&&!late.foot;i++)tick(late,{});
assert(late.foot,'Actual ram ejects the player');assert(late.foot.invulnerable>4.9);assert.equal(late.events.filter(e=>e.type==='abandon-cart').length,1);assert(!blocked(late.foot,.32));assert(!vehicleOverlap(late.cart,late.joe));
const route=[{...late.foot},...COURSE.footPaths[1].map(([x,y])=>({x,y})),{x:-23,y:795},{...COURSE.finish}];assert(drive(late,route,50),JSON.stringify({foot:late.foot,joe:late.joe,mode:late.mode}));tick(late,{brake:true},400);assert.equal(late.mode,'complete');
const retry=createRun(late.checkpoint,late.story.collected);assert.equal(retry.cart.health,100);assert.equal(retry.foot,null);assert.equal(retry.checkpoint,2);
checks.push('Late ram -> protected ejection -> small fence gap -> garage victory with live Joe; retry restores the cart');
assert(navigationStats().baked);assert.equal(navigationStats().edgeChecks,0);
const report={passed:true,checks,gateResults,damage,drives,late:{seconds:late.time,events:late.events},navigation:navigationStats()};fs.writeFileSync(out+'/simulation.json',JSON.stringify(report,null,2));console.log(JSON.stringify(report));
