import fs from 'node:fs';
import assert from 'node:assert/strict';
import {COURSE,blocked,distance,angleDelta,runnerSurfaceAt} from '../web/back-nine-course.js';
import {createStableSearchQueue} from '../web/stable-search-queue.js';
import {createRun} from '../web/back-nine-sim.js';
import {leaveBrokenCart,moveRunner} from '../web/chase-player.js';
import {hullOverlap,constrainVehicleMotion} from '../web/vehicle-contact.js';
import {insideGarage} from '../web/chase-garage.js';

// Offline fine-grid audit only. No runtime route planner or collision override.
const out='output/back-nine-experience/wreck-routes';fs.mkdirSync(out,{recursive:true});
const step=.5,cols=161,rows=1671,count=cols*rows,points=Array.from({length:count},(_,id)=>({x:id%cols*step-40,y:Math.floor(id/cols)*step,yaw:0}));
const free=Uint8Array.from(points,p=>!blocked(p,.32)),edges=new Uint8Array(count),known=new Uint8Array(count),cost=new Float64Array(count),parents=new Int32Array(count),closed=new Uint8Array(count),queue=createStableSearchQueue(count);
const dirs=[[-1,0],[1,0],[0,-1],[0,1],[-1,-1],[1,-1],[-1,1],[1,1]];
function segment(a,b,wreck){
 const n=Math.ceil(distance(a,b)/.08);
 for(let i=1;i<=n;i++)if(blocked({x:a.x+(b.x-a.x)*i/n,y:a.y+(b.y-a.y)*i/n},.32))return false;
 if(wreck){const p={...b,speed:0};if(constrainVehicleMotion(p,a,wreck,'foot','cart'))return false;}
 return true;
}
function edge(id,next,k,wreck){
 const bit=1<<k;
 if(!(known[id]&bit)){known[id]|=bit;if(segment(points[id],points[next],null))edges[id]|=bit;}
 if(!(edges[id]&bit))return false;
 if(!wreck||distance(points[id],wreck)>7)return true;
 const p={...points[next],speed:0};return !constrainVehicleMotion(p,points[id],wreck,'foot','cart');
}
function route(start,target,wreck){
 const garage=target===COURSE.finish,done=p=>garage?insideGarage(p,true):distance(p,target)<6.5;
 if(done(start))return [start];
 queue.clear();cost.fill(Infinity);parents.fill(-1);closed.fill(0);
 const cx=Math.round((start.x+40)/step),cy=Math.round(start.y/step);
 // Exact swept links reach beyond a sub-grid sliver beside a diagonal wreck.
 // A 0.5m lattice alone can miss a genuinely traversable local doorway.
 for(let dy=-8;dy<=8;dy++)for(let dx=-8;dx<=8;dx++){
  const x=cx+dx,y=cy+dy;if(x<0||x>=cols||y<0||y>=rows)continue;const id=y*cols+x,p=points[id];
  if(!free[id]||!segment(start,p,wreck))continue;cost[id]=distance(start,p);queue.set(id,cost[id]+Math.max(0,distance(p,target)-(garage?0:6.5)));
 }
 while(queue.length){const id=queue.pop();if(closed[id])continue;closed[id]=1;const p=points[id];
  if(done(p)){const path=[];for(let at=id;at>=0;at=parents[at])path.push(points[at]);path.push(start);path.reverse();return path;}
  for(let k=0;k<8;k++){const[dx,dy]=dirs[k],x=id%cols+dx,y=Math.floor(id/cols)+dy;if(x<0||x>=cols||y<0||y>=rows)continue;const next=y*cols+x;
   if(closed[next]||!free[next]||!edge(id,next,k,wreck))continue;const c=cost[id]+(k<4?step:step*Math.SQRT2);if(c>=cost[next])continue;cost[next]=c;parents[next]=id;queue.set(next,c+Math.max(0,distance(points[next],target)-(garage?0:6.5)));
  }
 }return null;
}
function legal(p,kind){return !blocked(p,kind==='cart'?.85:1.65)&&!COURSE.features.some(f=>hullOverlap(p,kind,f,'feature'));}
const placements=[],seen=new Set();
function add(x,y,yaw,kind){const key=[x,y,yaw].map(v=>v.toFixed(3)).join(',');if(seen.has(key))return;seen.add(key);const p={x,y,yaw};if(legal(p,'cart'))placements.push({...p,kind});}
for(const path of COURSE.paths)for(let i=1;i<path.length;i++){const a=path[i-1],b=path[i],length=Math.hypot(b[0]-a[0],b[1]-a[1]),yaw=Math.atan2(b[0]-a[0],b[1]-a[1]);for(let t=0;t<length;t+=20)add(a[0]+(b[0]-a[0])*t/length,a[1]+(b[1]-a[1])*t/length,yaw,'course');}
for(const target of [...COURSE.checkpoints,...COURSE.decisions.map(d=>d.gate),{x:-23,y:800},COURSE.finish])for(const dx of [-2,0,2])for(const dy of [-3,0,3])for(let i=0;i<8;i++)add(target.x+dx,target.y+dy,i*Math.PI/4,'critical');
const results=[],failures=[],replays=[];let skippedJoe=0;
for(const [index,cart]of placements.entries()){
 const checkpoint=cart.y>587?2:cart.y>307?1:0,r=createRun(checkpoint,0,12345);Object.assign(r.cart,cart);r.mode='driving';
 let joe=null;for(const angle of [Math.PI,Math.PI/2,-Math.PI/2,0]){const yaw=cart.yaw+angle,p={x:cart.x+Math.sin(yaw)*7,y:cart.y+Math.cos(yaw)*7,yaw:yaw+Math.PI};if(legal(p,'mower')&&!hullOverlap(cart,'cart',p,'mower')){joe=p;break;}}
 if(!joe){skippedJoe++;continue;}Object.assign(r.joe,joe);
 if(!leaveBrokenCart(r)){failures.push({kind:'landing',cart,joe});continue;}
 let from={...r.foot},total=0,waypoints=[],ok=true;
 for(const target of [...COURSE.checkpoints.slice(checkpoint),COURSE.finish]){
  const path=route(from,target,r.cart);
  if(!path){failures.push({kind:'route',cart,joe,landing:r.foot,target,baselineReachable:!!route(from,target,null)});ok=false;break;}
  for(let i=1;i<path.length;i++)total+=distance(path[i-1],path[i]);waypoints.push(...path.slice(1));from=path.at(-1);
 }
 results.push({cart,landing:{x:r.foot.x,y:r.foot.y},checkpoint,reachable:ok,meters:total,segments:waypoints.length});
 // Replay a representative spread through the real stepped runner movement.
 // No live Joe in this structural audit; his recovery/pursuit has its own tests.
 if(ok&&cart.kind==='critical'&&replays.length<18&&index%23===0){
  r.time=2;Object.assign(r.joe,{x:1000,y:-1000});let completed=0;
  for(const to of waypoints){
   const yaw=Math.atan2(to.x-r.foot.x,to.y-r.foot.y);for(let n=0;n<100&&Math.abs(angleDelta(yaw,r.foot.yaw))>.005;n++)moveRunner(r,{steer:Math.max(-1,Math.min(1,angleDelta(yaw,r.foot.yaw)/(2.6/60)))},1/60);
   let n=0;while(distance(r.foot,to)>.025&&n++<120){const yaw=Math.atan2(to.x-r.foot.x,to.y-r.foot.y);r.foot.surface=runnerSurfaceAt(r.foot);moveRunner(r,{throttle:Math.min(1,distance(r.foot,to)/.12),steer:Math.max(-1,Math.min(1,angleDelta(yaw,r.foot.yaw)/(2.6/60)))},1/60);}
   if(distance(r.foot,to)>.025){failures.push({kind:'replay',cart,at:{...r.foot},to,completed});break;}completed++;
  }replays.push({cart,completed,expected:waypoints.length,inside:insideGarage(r.foot,true)});
 }
 if(index%100===0)console.log(JSON.stringify({processed:index,total:placements.length,failures:failures.length}));
}
const report={passed:!failures.length,step,placements:placements.length,checked:results.length,skippedJoe,results,replays,failures};fs.writeFileSync(out+'/connectivity.json',JSON.stringify(report,null,2));console.log(JSON.stringify({passed:report.passed,checked:results.length,skippedJoe,replays:replays.length,failures:failures.slice(0,6)}));assert.equal(failures.length,0);
