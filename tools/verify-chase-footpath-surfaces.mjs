import fs from 'node:fs';
import assert from 'node:assert/strict';
import {performance} from 'node:perf_hooks';
import {pathToFileURL} from 'node:url';
import {resolve} from 'node:path';
import {COURSE,surfaceAt,runnerSurfaceAt,blocked,navigationStats} from '../web/back-nine-course.js';
import {FOOTPATH_WIDTH,onFootpath} from '../web/chase-footpath-layout.js';
import {createRun,updateRun} from '../web/back-nine-sim.js';
const out='output/back-nine-experience/footpath-surfaces';fs.mkdirSync(out,{recursive:true});
const previousSource=fs.readFileSync(out+'/baseline-source/back-nine-course.js','utf8').replace(/from '([^']+)'/g,(_,path)=>`from '${pathToFileURL(resolve('web',path)).href}'`);
const previous=await import('data:text/javascript;base64,'+Buffer.from(previousSource).toString('base64'));
const rows=[];let points=0;
for(const [id,path]of COURSE.footways.entries()){
 let wasRough=0;
 for(const s of path.segments){const length=Math.sqrt(s.length2);for(let n=0;n<=Math.ceil(length*5);n++){
  const t=n/Math.ceil(length*5),x=s.x+s.dx*t,y=s.y+s.dy*t,p={x,y};
  assert(onFootpath(p,COURSE.footways));assert.equal(runnerSurfaceAt(p),'path');assert(!blocked(p,.32));
  if(surfaceAt(p)==='rough')wasRough++;
  // Interior points on both sides of each maintained bed have firm footing.
  for(const side of [-1,1])assert.equal(runnerSurfaceAt({x:x+s.dy/length*.3*side,y:y-s.dx/length*.3*side}),'path');points++;
 }}assert(wasRough>0);rows.push({id,points:path.route.length,wasRough});
}
// Every vehicle ground classification stays on the original function, including
// narrow foot strips. Compare a dense whole-course grid to the previous rules.
let vehiclePoints=0,runnerOnlyChanges=0;
for(let y=0;y<=835;y+=.5)for(let x=-40;x<=40;x+=.5){
 const p={x,y},ground=surfaceAt(p),foot=runnerSurfaceAt(p);vehiclePoints++;assert.equal(ground,previous.surfaceAt(p));
 const wet=COURSE.wet.some(w=>Math.hypot(x-w.x,y-w.y)<w.r);
 if(wet)assert.equal(foot,'wet');
 if(ground!==foot){runnerOnlyChanges++;assert.equal(foot,'path');assert(onFootpath(p,COURSE.footways));}
 if(!onFootpath(p,COURSE.footways))assert.equal(foot,ground);
}
assert(runnerOnlyChanges>0);assert.equal(navigationStats().signature,2693326411);assert(navigationStats().baked);
const travel=[];
for(const [id,path]of COURSE.footways.entries())for(const hz of [30,60]){
 const s=path.segments.find(s=>Math.abs(s.dx)<.01&&s.dy>10),r=createRun();r.mode='driving';r.time=20;r.grace=999;
 r.foot={x:s.x,y:s.y+3,yaw:0,viewYaw:0,speed:0,invulnerable:0,onFoot:true};Object.assign(r.cart,{x:0,y:10,health:0});Object.assign(r.joe,{x:0,y:20});
 const start=r.foot.y;
 for(let i=0;i<hz;i++)updateRun(r,{throttle:1},1/hz);
 assert.equal(r.foot.surface,'path');assert(r.foot.speed>7.19);assert(r.foot.y-start>6.8&&r.foot.y-start<7.21);
 travel.push({id,hz,meters:r.foot.y-start,speed:r.foot.speed});
}
const before=JSON.parse(fs.readFileSync(out+'/before-routes.json')),after=JSON.parse(fs.readFileSync('output/back-nine-experience/foot-clearance/after-routes.json'));
const comparisons=after.routes.map((r,i)=>({id:r.id,reverse:r.reverse,hz:r.hz,gap:r.gap,before:before.routes[i].seconds,after:r.seconds,reached:r.reached}));
assert.equal(after.routes.filter(r=>r.reached).length,46);assert.equal(after.routes.filter(r=>r.mode==='dying').length,2);assert(after.routes.every(r=>r.penetrations===0&&r.longestStop<.3));
// A bounded warm query profile, not a GPU/perceived-frame-time claim.
const probes=COURSE.footways.map(p=>({x:p.segments[3].x,y:p.segments[3].y}));let sum=0;for(let n=0;n<2000;n++)sum+=onFootpath(probes[n%3],COURSE.footways);
const start=performance.now();for(let n=0;n<100000;n++)sum+=onFootpath(probes[n%3],COURSE.footways);const milliseconds=performance.now()-start;assert(sum>0);
const result={passed:true,width:FOOTPATH_WIDTH,points,vehiclePoints,runnerOnlyChanges,rows,travel,comparisons,queryProfile:{queries:100000,milliseconds},navigation:navigationStats()};fs.writeFileSync(out+'/rules.json',JSON.stringify(result,null,2));console.log(JSON.stringify({passed:true,points,vehiclePoints,runnerOnlyChanges,travel,queryMilliseconds:milliseconds}));
