import assert from 'node:assert/strict';
import {createRun} from '../web/under-green-sim.js';
import {JOE_SHADOW_BAYS,joeShadowBay,projectJoeShadow} from '../web/under-green-cast-shadow.js';
import {onFloor,solid,WATERS,inWater} from '../web/under-green-course.js';
let receiverSamples=0,poses=0;
for(const bay of JOE_SHADOW_BAYS){
 const b=bay.receiver;
 for(let x=b.minX;x<=b.maxX;x+=.1)for(let y=b.minY;y<=b.maxY;y+=.1){
  assert(onFloor(x,y));assert(!solid({x,y},.01),'Receiver crosses a solid obstacle');assert(!WATERS.some(w=>inWater({x,y},w)),'Receiver crosses a channel');receiverSamples++;
 }
 const r=createRun();r.mode='playing';Object.assign(r.joe,bay.centre,{phase:'walk',speed:2.1,paceScale:1});Object.assign(r.player,{x:bay.centre.x,y:bay.centre.y-2.8,yaw:0});
 assert.equal(joeShadowBay(r)?.bay.id,bay.id);
 for(const hz of [30,60,120])for(let i=0;i<hz;i++){
  const x=bay.centre.x+Math.sin(i/hz*Math.PI*2)*bay.extent.x*.6,y=bay.centre.y;
  Object.assign(r.joe,{x,y});const selection=joeShadowBay(r);assert(selection&&selection.weight>0&&selection.weight<=1);
  for(const height of [.1,.7,1.3,1.9]){
   const light={...bay.lamp,height:2.8},point={x,y,height},p=projectJoeShadow(point,light);
   assert.equal(p.height,.007);const t=(p.x-light.x)/(point.x-light.x||1);
   if(Math.abs(point.x-light.x)>.0001){assert(Math.abs(p.y-light.y-(point.y-light.y)*t)<1e-9);assert(Math.abs(p.height-light.height-(point.height-light.height)*t)<1e-9);}
   poses++;
  }
 }
 Object.assign(r.joe,bay.centre,{speed:5,paceScale:2});assert.equal(joeShadowBay(r),null);
 Object.assign(r.joe,{speed:2.1,paceScale:1});r.player.yaw=Math.PI;assert.equal(joeShadowBay(r),null);
 r.player.rearAngle=Math.PI;assert(joeShadowBay(r),'Q rear glance uses the same visibility rule');
 r.joe.phase='absent';assert.equal(joeShadowBay(r),null);
}
const r=createRun();Object.assign(r.joe,{x:0,y:8,phase:'walk',speed:2.1,paceScale:1});Object.assign(r.player,{x:12,y:14.6,yaw:Math.atan2(-12,-6.6)});assert(onFloor(r.player.x,r.player.y));assert.equal(joeShadowBay(r),null,'Opaque wall must suppress hidden pursuit shadow');
console.log(JSON.stringify({passed:true,receiverSamples,projectedPoses:poses,bays:JOE_SHADOW_BAYS.map(b=>b.id)}));
