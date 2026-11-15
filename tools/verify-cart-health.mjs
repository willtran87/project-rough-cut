import assert from 'node:assert/strict';
import fs from 'node:fs';
import {createRun,updateRun} from '../web/back-nine-sim.js';
import {chaseActor,impactDamage,leaveBrokenCart,repairCart} from '../web/chase-player.js';
import {vehicleOverlap,hullOverlap} from '../web/vehicle-contact.js';
import {COURSE,distance,blocked,navigationStats,angleDelta,clamp} from '../web/back-nine-course.js';
const checks=[],test=(name,fn)=>{fn();checks.push(name);},tick=(r,input={},n=1)=>{for(let i=0;i<n;i++)updateRun(r,input,1/60);};
test('Health scales with impact, three glancing hits are survivable, and repairs are bounded',()=>{
 assert(impactDamage(.32)<impactDamage(.7)&&impactDamage(.7)<impactDamage(1));
 const r=createRun();r.mode='driving';for(let i=0;i<3;i++){r.grace=0;Object.assign(r.cart,{x:0,y:35,speed:0,invulnerable:0});Object.assign(r.joe,{x:0,y:33,speed:0});r.joe.ram.phase='none';tick(r);}
 assert.equal(r.cart.hits,3);assert(r.cart.health>0&&r.cart.health<100);assert(!r.foot);const before=r.cart.health;assert(repairCart(r,25));assert.equal(r.cart.health,Math.min(100,before+25));repairCart(r,100);assert.equal(r.cart.health,100);
});
test('A real fatal ram leaves a solid wreck, a safe runner and a five-second escape window',()=>{
 const r=createRun();r.mode='driving';r.grace=0;r.cart.health=10;Object.assign(r.cart,{x:0,y:35});Object.assign(r.joe,{x:0,y:30,yaw:0,speed:16});for(let i=0;i<90&&!r.foot;i++)tick(r);
 assert(r.foot);assert.equal(r.mode,'driving');assert.equal(r.cart.health,0);assert(r.foot.invulnerable>=4.9);assert(!blocked(r.foot,.32));assert(!vehicleOverlap(r.foot,r.joe));assert(!hullOverlap(r.foot,'foot',r.cart,'cart'));assert.equal(r.events.filter(e=>e.type==='abandon-cart').length,1);
 const wreck={...r.cart};tick(r,{},52);tick(r,{throttle:1},90);assert(distance(r.foot,wreck)>8);assert(!hullOverlap(r.foot,'foot',r.cart,'cart'));assert(!repairCart(r,100));const paused=JSON.stringify(r);r.mode='paused';const frozen=JSON.stringify(r);tick(r,{throttle:1},60);assert.equal(JSON.stringify(r),frozen);assert(paused!==frozen);
});
test('Runner steers, respects visible boundaries and cannot pass through the wreck',()=>{
 const r=createRun();r.mode='driving';leaveBrokenCart(r);r.grace=999;Object.assign(r.foot,{x:38.5,y:30,viewYaw:0});tick(r,{steer:1},60);assert(r.foot.x<=39.68);assert(r.foot.y===30);Object.assign(r.foot,{x:0,y:r.cart.y+3.5,viewYaw:0,yaw:0});tick(r,{throttle:-1},60);assert(!hullOverlap(r.foot,'foot',r.cart,'cart'));assert(r.foot.y>r.cart.y);
});
test('Joe detours around the wreck and can catch a stationary runner without unbounded repathing',()=>{
 const r=createRun();r.mode='driving';Object.assign(r.cart,{x:0,y:35});Object.assign(r.joe,{x:0,y:30,yaw:0,speed:16});r.grace=0;r.cart.health=10;for(let i=0;i<75*60&&['driving','dying'].includes(r.mode);i++){tick(r);if(r.wreck.crush<1)assert(!vehicleOverlap(r.cart,r.joe));if(r.foot)assert(!hullOverlap(r.foot,'foot',r.cart,'cart'));}
 assert.equal(r.mode,'caught');assert(r.foot);assert(r.joe.plans<200);assert.equal(r.cart.health,0);const retry=createRun(r.checkpoint);assert.equal(retry.cart.health,100);assert.equal(retry.foot,null);
});
test('Relays and chargers repair health; intact timber blocks the runner from both sides',()=>{
 const r=createRun();r.mode='driving';r.grace=999;r.cart.health=70;Object.assign(r.cart,{x:0,y:299,speed:0});tick(r);assert.equal(r.cart.health,90);tick(r,{brake:true},70);assert.equal(r.cart.health,95,'Short service stop gives partial repair');assert(r.story.collected&1);tick(r,{brake:true},30);assert.equal(r.cart.health,100,'Holding longer completes the needed repair');
 for(const direction of [-1,1]){const f=createRun();f.mode='driving';leaveBrokenCart(f);f.time+=2;f.grace=999;const gate=COURSE.hurdles.find(h=>h.shortcut===0),index=COURSE.hurdles.indexOf(gate);Object.assign(f.foot,{x:gate.x,y:gate.y-direction*2,viewYaw:0});tick(f,{throttle:direction},90);assert.equal(f.courseFX.breaks[index].age,-1);assert((f.foot.y-gate.y)*direction<0);}
});
const routes=[];
// The forced opening wreck is a stress case: Joe is still ahead on his
// working fairway, rather than behind after an actual fatal ram. Use the
// connected main path; intact shortcut timber cannot be pushed open now.
// Relay-stage fixtures isolate the later portions of that same route.
const footRoute=COURSE.paths[0];
for(const start of [0,1,2]){
 const r=createRun(start);r.mode='driving';leaveBrokenCart(r);let i=1,closest=Infinity,maxStep=0,last={...r.joe};
 for(let f=0;f<240*60&&['driving','sealing'].includes(r.mode);f++){
  const p=chaseActor(r),route=footRoute;while(i<route.length-1&&(distance(p,{x:route[i][0],y:route[i][1]})<2||p.y>route[i][1]+2))i++;
  const releasing=p.y>788&&!r.exitRelease.released;
  const goal=releasing?{x:-23,y:795.5}:p.y>796?COURSE.finish:{x:route[i][0],y:route[i][1]},dx=goal.x-p.x,dy=goal.y-p.y,d=Math.hypot(dx,dy),stop=releasing?distance(p,{x:-23,y:795.5})<2:distance(p,COURSE.finish)<1;
  const delta=angleDelta(Math.atan2(dx,dy),p.yaw);tick(r,{throttle:stop||Math.abs(delta)>1.1?0:1,steer:stop?0:clamp(delta*2,-1,1),brake:stop});closest=Math.min(closest,distance(p,r.joe));maxStep=Math.max(maxStep,distance(last,r.joe));last={...r.joe};assert(!blocked(p,.32));if(r.wreck.crush<1)assert(!vehicleOverlap(r.cart,r.joe));
 }
 routes.push({start,mode:r.mode,seconds:r.time,checkpoint:r.checkpoint,closest,maxStep,plans:r.joe.plans});assert.equal(r.mode,'complete',JSON.stringify(routes));assert.equal(r.cart.health,0);assert.equal(r.checkpoint,2);assert(maxStep<20/60+.003);
}
checks.push('All three on-foot starts reach both required relays and seal the garage with live Joe');assert(navigationStats().baked);assert.equal(navigationStats().edgeChecks,0);
fs.writeFileSync('output/chase-on-foot/simulation.json',JSON.stringify({passed:true,checks,routes,navigation:navigationStats()},null,2));console.log(JSON.stringify({passed:true,checks,routes}));
