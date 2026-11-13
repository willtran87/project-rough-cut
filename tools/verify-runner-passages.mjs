import assert from 'node:assert/strict';
import fs from 'node:fs';
import {createRun,updateRun} from '../web/back-nine-sim.js';
import {COURSE,distance,angleDelta,clamp,blocked,navigationStats} from '../web/back-nine-course.js';
import {hullOverlap,vehicleOverlap} from '../web/vehicle-contact.js';
const baseline=process.argv.includes('--baseline'),out='output/back-nine-experience/foot-clearance';fs.mkdirSync(out,{recursive:true});
const routes=[];
for(let id=0;id<COURSE.footPaths.length;id++)for(const reverse of [false,true])for(const hz of [30,60])for(const gap of [null,12,20,30]){
 const path=COURSE.footPaths[id].map(([x,y])=>({x,y}));if(reverse)path.reverse();
 const checkpoint=id===0?1:id===1?2:0,r=createRun(checkpoint,0,42);r.mode='driving';r.grace=gap===null?999:0;r.time=20;r.tension.phase='stalk';r.panic.serial=1;
 const yaw=Math.atan2(path[1].x-path[0].x,path[1].y-path[0].y);r.foot={...path[0],yaw,viewYaw:yaw,speed:0,invulnerable:0,onFoot:true};Object.assign(r.cart,{x:0,y:10,health:0});Object.assign(r.joe,{x:path[0].x,y:path[0].y-(reverse?-1:1)*(gap??70),yaw:reverse?Math.PI:0,speed:gap===null?0:8});
 let cursor=1,reached=false,hidden=0,maxStep=0,penetrations=0,stopped=0,longestStop=0;const surfaces=new Set();
 for(let f=0;f<20*hz&&r.mode==='driving';f++){
  const p=r.foot;let t=path[cursor];if(distance(p,t)<.6){if(cursor===path.length-1){reached=true;break;}t=path[++cursor];}
  const delta=angleDelta(Math.atan2(t.x-p.x,t.y-p.y),p.yaw),old={...p};updateRun(r,{throttle:Math.abs(delta)>1.1?0:1,steer:clamp(delta*2,-1,1)},1/hz);
  maxStep=Math.max(maxStep,distance(old,p));if(r.hunt.occluded)hidden+=1/hz;surfaces.add(p.surface);
  if(distance(old,p)<.0001&&Math.abs(delta)<=1.1)stopped+=1/hz;else stopped=0;longestStop=Math.max(longestStop,stopped);
  if(COURSE.features.some(f=>hullOverlap(p,'foot',f,'feature')))penetrations++;
  assert(!blocked(p,.32),'Runner crosses static wall');if(r.mode==='driving')assert(!vehicleOverlap(p,r.joe),'Living runner overlaps mower');
 }
 const result={id,reverse,hz,gap,reached,mode:r.mode,seconds:r.time-20,hidden,maxStep,penetrations,longestStop,surfaces:[...surfaces],endGap:distance(r.foot,r.joe),foot:{x:r.foot.x,y:r.foot.y,yaw:r.foot.yaw},joe:{x:r.joe.x,y:r.joe.y},cursor};routes.push(result);
}
fs.writeFileSync(out+'/'+(baseline?'before':'after')+'-routes.json',JSON.stringify({routes,navigation:navigationStats()},null,2));
if(!baseline){for(const r of routes){if(r.id===1&&r.reverse&&r.gap===12)assert.equal(r.mode,'dying','Close reverse approach remains a real danger');else assert(r.reached,JSON.stringify(r));assert.equal(r.penetrations,0,JSON.stringify(r));assert(r.longestStop<.3,JSON.stringify(r));assert(r.maxStep<=7.2/r.hz+.001);}}
console.log(JSON.stringify({baseline,cases:routes.length,reached:routes.filter(r=>r.reached).length,snagged:routes.filter(r=>r.longestStop>.5).map(r=>({id:r.id,reverse:r.reverse,hz:r.hz,gap:r.gap,longestStop:r.longestStop})),deaths:routes.filter(r=>r.mode==='dying').length,navigation:navigationStats()}));
