import assert from 'node:assert/strict';
import {DRAIN_SHALLOW_PATCHES,DRAIN_BOOT_TRACES,DRAIN_SCYTHE_SCORES,insideWetPolygon,SHALLOW_WATER_HEIGHT} from '../web/under-green-wet-ground.js';
import {onFloor,solid,WATERS,waterState} from '../web/under-green-course.js';
import {waterContactHeight,createDrainWaterContacts} from '../web/under-green-water-contacts.js';
import {createRun} from '../web/under-green-sim.js';
const states=WATERS.map(w=>waterState(w,0,false,0));let samples=0;
for(const patch of DRAIN_SHALLOW_PATCHES){
 const xs=patch.points.map(p=>p[0]),ys=patch.points.map(p=>p[1]);
 for(let x=Math.min(...xs);x<=Math.max(...xs);x+=.025)for(let y=Math.min(...ys);y<=Math.max(...ys);y+=.025){
  if(!insideWetPolygon({x,y},patch.points))continue;samples++;
  assert(onFloor(x,y),patch.id+' has no supporting floor');assert(!solid({x,y},.01),patch.id+' crosses solid geometry');
  assert(waterContactHeight({x,y},WATERS,states,0)>=SHALLOW_WATER_HEIGHT,patch.id+' is visibly wet but cannot produce contacts');
  assert.equal(waterContactHeight({x,y},WATERS,states,.38),.38,'Flood must cover shallow pools');
 }
}
for(const trace of DRAIN_BOOT_TRACES){assert(onFloor(trace.x,trace.y));assert(!solid(trace,.19),'Boot trace inside a solid');}
for(const score of DRAIN_SCYTHE_SCORES)for(let i=0;i<=40;i++){
 const a=score.start+(score.end-score.start)*i/40,p={x:score.x+Math.cos(a)*score.radius,y:score.y+Math.sin(a)*score.radius};assert(onFloor(p.x,p.y));assert(!solid(p,.03));
}
const r=createRun();r.mode='playing';r.joe.phase='absent';r.elapsed=0;Object.assign(r.player,{x:-2.3,y:12,speed:2,yaw:0});
const pool=createDrainWaterContacts(WATERS);pool.update(r,states,null);r.time=.1;r.player.walk=.8;pool.update(r,states,null);
assert.equal(pool.stats().totals.player,1,'A step into a shallow pool must ripple');assert.equal(pool.stats().last.height,SHALLOW_WATER_HEIGHT);
Object.assign(r.player,{x:0,y:12,walk:1.6});r.time=.2;pool.update(r,states,null);assert.equal(pool.stats().totals.player,1,'Adjacent dry floor must not ripple');
console.log(JSON.stringify({passed:true,samples,patches:DRAIN_SHALLOW_PATCHES.length,traces:DRAIN_BOOT_TRACES.length,scores:DRAIN_SCYTHE_SCORES.length,checks:['supported wet polygons','no solid overlap','contact boundaries','flood precedence','wet/dry footstep transitions','trace placement']}));
