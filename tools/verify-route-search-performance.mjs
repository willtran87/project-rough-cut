import fs from 'node:fs';
import assert from 'node:assert/strict';
import * as current from '../web/back-nine-course.js';
import * as sim from '../web/back-nine-sim.js';
import {chaseActor} from '../web/chase-player.js';
import {createStableSearchQueue} from '../web/stable-search-queue.js';
const out='output/chase-route-performance';
const moduleURL=(source,overrides={})=>'data:text/javascript;base64,'+Buffer.from(source.replace(/from '([^']+)'/g,(_,p)=>`from '${overrides[p]||new URL('../web/'+p,import.meta.url).href}'`)).toString('base64');
const oldBake='data:text/javascript;base64,'+Buffer.from(fs.readFileSync(out+'/baseline/course-navigation.js','utf8')).toString('base64');
const baseURL=moduleURL(fs.readFileSync(out+'/baseline/back-nine-course.js','utf8'),{'./assets/baked/course-navigation.js':oldBake}),base=await import(baseURL);
const huntURL=moduleURL(fs.readFileSync('web/back-nine-hunt.js','utf8'),{'./back-nine-course.js':baseURL});
const reference=await import(moduleURL(fs.readFileSync('web/back-nine-sim.js','utf8'),{'./back-nine-course.js':baseURL,'./back-nine-hunt.js':huntURL}));
// Decrease-key keeps old insertion precedence, including equal scores.
const queue=createStableSearchQueue(10);queue.set(1,20);queue.set(2,10);queue.set(3,10);queue.set(1,10);assert.deepEqual([queue.pop(),queue.pop(),queue.pop()],[1,2,3]);queue.clear();queue.set(3,2);queue.set(2,1);assert.deepEqual([queue.pop(),queue.pop(),queue.pop()],[2,3,-1]);
const pairs=[[{x:4,y:770},{x:4,y:820}],[{x:29,y:187},{x:0,y:280}],[{x:33,y:480},{x:-28,y:480}],[{x:-35,y:663},{x:24,y:705}]];
let collisionSamples=0;
for(let i=0;i<10000;i++)for(const r of [0,.32,.85,1.65,1.85,2.55,8]){const p={x:Math.sin(i*3.1)*43,y:-3+(i*1.739)%845};assert.equal(current.blocked(p,r),base.blocked(p,r));collisionSamples++;}
for(const o of current.COURSE.obstacles)for(const r of [0,.32,1.85,2.55])for(const epsilon of [-.000001,0,.000001])for(const axis of ['x','y']){
 const p={x:o.x,y:o.y};p[axis]+=(o.box?(axis==='x'?o.rx:o.ry):o.r)+r+epsilon;assert.equal(current.blocked(p,r),base.blocked(p,r));collisionSamples++;
}
assert.deepEqual(current.navigationSnapshot().edges,base.navigationSnapshot().edges,'Every baked edge remains identical');
for(let i=0;i<512;i++)pairs.push([{x:Math.sin(i*7.1)*39,y:5+(i*71)%815},{x:Math.cos(i*3.8)*39,y:5+(i*97)%815}]);
let expanded=0;const hard=[];
for(const [a,b]of pairs){for(const avoid of [null,{x:(a.x+b.x)/2,y:(a.y+b.y)/2}]){const expected=base.planMowerRoute(a,b,avoid),actual=current.planMowerRoute(a,b,avoid);assert.deepEqual(actual,expected,JSON.stringify({a,b,avoid}));expanded+=actual.expanded;if(actual.expanded>600&&hard.length<16)hard.push([a,b,avoid,actual.expanded]);}}
assert(current.navigationStats().baked);assert.equal(current.navigationStats().edgeChecks,0);
let frames=0;const runs=[];
for(const start of [0,1,2]){const r=sim.createRun(start),ref=reference.createRun(start);r.mode=ref.mode='driving';let waypoint=1;
 for(let n=0;n<10800&&['driving','sealing'].includes(r.mode);n++){
  const c=chaseActor(r),path=current.COURSE.paths[0];while(waypoint<path.length-1&&(current.distance(c,{x:path[waypoint][0],y:path[waypoint][1]})<(r.foot?2:7)||c.y>path[waypoint][1]+2))waypoint++;
  const t=c.y>788?current.COURSE.finish:{x:path[waypoint][0],y:path[waypoint][1]},delta=current.angleDelta(Math.atan2(t.x-c.x,t.y-c.y),c.yaw),near=current.distance(c,current.COURSE.finish)<(r.foot?1.2:4.5),dx=t.x-c.x,dy=t.y-c.y,d=Math.max(1,Math.hypot(dx,dy)),yaw=c.viewYaw||0;
  const input=r.foot?{throttle:near?0:(dx*Math.sin(yaw)+dy*Math.cos(yaw))/d,steer:near?0:(dx*Math.cos(yaw)-dy*Math.sin(yaw))/d,brake:near}:{throttle:near?0:1,steer:current.clamp(delta*2,-1,1),brake:near||Math.abs(delta)>.7&&c.speed>8};
  sim.updateRun(r,input,1/60);reference.updateRun(ref,input,1/60);assert.deepEqual(r,ref,`Checkpoint ${start}, frame ${n}`);frames++;
 }assert.equal(r.mode,'complete');runs.push({start,seconds:r.time,onFoot:!!r.foot,plans:r.joe.plans});
}
const samples=[[],[]];for(let repeat=0;repeat<20;repeat++)for(const pair of hard)for(const i of repeat%2?[1,0]:[0,1]){const start=performance.now();[base,current][i].planMowerRoute(...pair.slice(0,3));samples[i].push(performance.now()-start);}
const stats=a=>{a.sort((x,y)=>x-y);return {samples:a.length,median:a[Math.floor(a.length*.5)],p95:a[Math.floor(a.length*.95)],max:a.at(-1)};};
const report={passed:true,collisionSamples,exactRoutes:pairs.length*2,expanded,identicalFrames:frames,runs,navigation:current.navigationStats(),hardCases:hard.length,baseline:stats(samples[0]),current:stats(samples[1])};fs.writeFileSync(out+'/search.json',JSON.stringify(report,null,2));console.log(JSON.stringify(report));
