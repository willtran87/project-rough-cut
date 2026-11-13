import {irrigationPhase} from './chase-irrigation.js';
import {isDestructibleFeature} from './course-destruction-state.js';
import {LANDSCAPE_BEDS} from './back-nine-landscape.js';
import bakedNavigation from './assets/baked/course-navigation.js';
import {createStableSearchQueue} from './stable-search-queue.js';
import {createCourseObstacleIndex} from './course-obstacle-index.js';
import {addCourseChoices} from './back-nine-choices.js';
import {createFootpathLayout,onFootpath} from './chase-footpath-layout.js';
// Metres: +y runs toward the clubhouse; x runs across the fairway.
export const COURSE = {
 width:40,length:835,start:{x:0,y:12},finish:{x:-23,y:807},
 checkpoints:[{x:0,y:300,name:'Maintenance shelter'},{x:0,y:580,name:'Night-range shelter'}],
 paths:[
  [[0,0],[0,45],[-13,85],[0,115],[18,155],[10,190],[-14,235],[0,280],[0,325],[-22,380],[-8,425],[18,470],[6,515],[-18,550],[0,580],[0,620],[-23,660],[-25,710],[-12,755],[-23,795],[-23,822]],
  [[-13,85],[-28,115],[-24,165],[10,190]],
  [[-22,380],[-30,420],[-28,480],[6,515]],
  [[0,620],[24,650],[27,705],[-12,755]]
 ],
 wet:[{x:-12,y:238,r:13},{x:15,y:469,r:14},{x:-29,y:449,r:10}],
 cartGates:[{x:-26.8,y:130,yaw:.07983}],
 alarms:[],
 machinery:[{x:34,y:190},{x:-34,y:352},{x:34,y:550},{x:-34,y:731}],
 sand:[{x:20,y:238,rx:13,ry:19},{x:17,y:390,rx:12,ry:20},{x:-20,y:470,rx:9,ry:18},{x:10,y:686,rx:11,ry:19}],
 sightbreaks:[{id:'nursery',x:-12,y:136,rx:1.5,ry:18,trigger:100},{id:'windbreak',x:-19,y:434,rx:1.5,ry:20,trigger:399},{id:'last-fairway',x:0,y:681,rx:1.5,ry:20,trigger:646}],
 shortcuts:[
  {id:'nursery-cut',name:'Nursery cut',from:{x:0,y:60},to:{x:0,y:108},x:0,y:84,yaw:0},
  {id:'pump-cut',name:'Pump cut',from:{x:-15,y:355},to:{x:-8,y:420},x:-11.23,y:390,yaw:Math.atan2(7,65)},
  {id:'clubhouse-cut',name:'Clubhouse cut',from:{x:-23,y:660},to:{x:-12,y:750},x:-16.89,y:710,yaw:Math.atan2(11,90)}
 ],
 features:[
  {id:'nursery-fall',kind:'fallen-tree',x:12,y:101,rx:5,ry:1},
  {id:'grounds-trailer',kind:'trailer',x:12,y:205,rx:2.5,ry:3.2},
  {id:'west-irrigation',kind:'cistern',x:-29,y:230,rx:3,ry:4.5},
  {id:'range-irrigation',kind:'cistern',x:9,y:342,rx:3,ry:4.5},
  {id:'range-fall',kind:'fallen-tree',x:4,y:366,rx:5,ry:1},
  {id:'east-irrigation',kind:'cistern',x:26,y:503,rx:3,ry:4.5},
  {id:'range-trailer',kind:'trailer',x:-10,y:600,rx:2.5,ry:3.2},
  {id:'clubhouse-fall',kind:'fallen-tree',x:-7,y:720,rx:5,ry:1},
  {id:'abandoned-repair',kind:'trailer',x:13,y:742,rx:2.5,ry:3.2}
 ],
 obstacles:[]
};
export const distance=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y);
export const clamp=(x,a,b)=>Math.max(a,Math.min(b,x));
export const angleDelta=(a,b)=>Math.atan2(Math.sin(a-b),Math.cos(a-b));
export const noise=n=>{const a=Math.sin(n*127.1+311.7)*43758.5453;return a-Math.floor(a);};
export function pathDistance(p){let best=Infinity;for(const route of COURSE.paths)for(let i=1;i<route.length;i++){
 const a=route[i-1],b=route[i],dx=b[0]-a[0],dy=b[1]-a[1],t=clamp(((p.x-a[0])*dx+(p.y-a[1])*dy)/(dx*dx+dy*dy),0,1);
 best=Math.min(best,Math.hypot(p.x-a[0]-dx*t,p.y-a[1]-dy*t));
}return best;}
export function shortcutDistance(p,s){const dx=s.to.x-s.from.x,dy=s.to.y-s.from.y,t=clamp(((p.x-s.from.x)*dx+(p.y-s.from.y)*dy)/(dx*dx+dy*dy),0,1);return Math.hypot(p.x-s.from.x-dx*t,p.y-s.from.y-dy*t);}
addCourseChoices(COURSE);
COURSE.footways=createFootpathLayout(COURSE.footPaths);
COURSE.cartGates.push(...COURSE.shortcuts.map(s=>({x:s.x,y:s.y,yaw:s.yaw})));
// Deliberately placed planting islands replace scattered shrubs and rocks.
// Preserve lane/checkpoint clearances before admitting any solid bed.
for(const [x,y,r]of LANDSCAPE_BEDS){
 const p={x,y};
 if(COURSE.shortcuts.some(s=>shortcutDistance(p,s)<r+3.8)||COURSE.footPaths.some(path=>path.slice(1).some((b,i)=>shortcutDistance(p,{from:{x:path[i][0],y:path[i][1]},to:{x:b[0],y:b[1]}})<r+1.2))||pathDistance(p)<r+4||COURSE.checkpoints.some(c=>distance(c,p)<r+12))continue;
 COURSE.obstacles.push({...p,r,kind:'hedge'});
}
// Clear procedural shrubs beneath authored landmarks, then give each landmark
// the same solid footprint used by sight, vehicle movement and baked routing.
for(const f of COURSE.features){
 COURSE.obstacles=COURSE.obstacles.filter(o=>!['hedge','rock'].includes(o.kind)||Math.abs(o.x-f.x)>f.rx+o.r+1||Math.abs(o.y-f.y)>f.ry+o.r+1);
 if(!isDestructibleFeature(f))COURSE.obstacles.push({...f,box:true});
}
// Low maintenance hurdles stand outside the driving lanes and splinter on contact.
COURSE.hurdles=COURSE.sightbreaks.flatMap((s,i)=>[-1,1].map(side=>({x:s.x+side*(i===1&&side===-1?5.3:s.rx+6),y:s.y+s.ry-(i===0?4:8)})));
// These portable rails sit on the shoulder: the player can go around them,
// while Joe's wider approach can tear through them. Shortcut gates stay shut.
COURSE.hurdles.push({x:-13.6,y:70},{x:-18.5,y:365},{x:-27,y:735});
COURSE.hurdles.push(...COURSE.shortcuts.map((s,i)=>({...s,shortcut:i})));
for(const g of COURSE.cartGates)for(const side of [-1,1])COURSE.obstacles.push({x:g.x+Math.cos(g.yaw)*side*1.75,y:g.y-Math.sin(g.yaw)*side*1.75,r:.2,kind:'cart-gate'});
for(const p of COURSE.machinery)COURSE.obstacles.push({...p,r:1.8,kind:'pump'});
for(const a of COURSE.alarms)for(const side of [-1,1])COURSE.obstacles.push({x:a.x+side*2.8,y:a.y,r:.12,kind:'alarm-post'});
// The clubhouse blocks the obvious finish; visible service lanes lead around it.
for(const s of COURSE.sightbreaks)COURSE.obstacles.push({...s,kind:'windbreak',box:true});
COURSE.obstacles.push({x:4,y:795,rx:16,ry:13,kind:'clubhouse',box:true});
for(const x of [-29,-17])COURSE.obstacles.push({x,y:807,rx:.5,ry:7,kind:'garage',box:true});
COURSE.obstacles.push({x:-23,y:814,rx:6,ry:.5,kind:'garage',box:true});
for(const x of [-24.9,-21.1])COURSE.obstacles.push({x,y:800,r:.18,kind:'garage-bollard'});
for(const c of COURSE.checkpoints)for(const side of [-1,1])for(const dy of [-4,4])COURSE.obstacles.push({x:c.x+side*3.7,y:c.y+dy,r:.18,kind:'post'});
const obstacleIndex=createCourseObstacleIndex(COURSE.obstacles),featureIndex=createCourseObstacleIndex(COURSE.features.filter(f=>!isDestructibleFeature(f)),true);
export function blocked(p,r=0){
 if(Math.abs(p.x)>COURSE.width-r||p.y<r||p.y>COURSE.length-r)return true;
 return obstacleIndex.blocked(p,r);
}
export function lineClear(a,b,r=1.65){const n=Math.ceil(distance(a,b)/1.5);for(let i=1;i<=n;i++)if(blocked({x:a.x+(b.x-a.x)*i/n,y:a.y+(b.y-a.y)*i/n},r))return false;return true;}
function mowerBlocked(p){return blocked(p,1.85)||featureIndex.blocked(p,2.55);}
export function mowerLineClear(a,b){
 if(!lineClear(a,b,1.85))return false;
 const n=Math.ceil(distance(a,b)/1.5);for(let i=1;i<=n;i++){const p={x:a.x+(b.x-a.x)*i/n,y:a.y+(b.y-a.y)*i/n};if(featureIndex.blocked(p,2.55))return false;}return true;
}
// Without a run this is the authored hazard map; live actors pass their run.
export function surfaceAt(p,run=null){
 if(COURSE.wet.some((w,i)=>distance(w,p)<w.r&&(!run||irrigationPhase(run,i).active)))return 'wet';
 if(pathDistance(p)<3.0)return 'path';
 if(COURSE.sand.some(s=>((p.x-s.x)/s.rx)**2+((p.y-s.y)/s.ry)**2<1))return 'sand';
 return 'rough';
}
// The narrow paving supports running feet, not the wheelbase of either
// vehicle. Keep vehicle traction/navigation exactly as authored.
export function runnerSurfaceAt(p,run=null){
 const ground=surfaceAt(p,run);
 return ground!=='wet'&&onFootpath(p,COURSE.footways)?'path':ground;
}
// A small fixed grid is built once. A bounded search runs only when evidence or
// the pursuit waypoint changes, never on a render frame or every simulation step.
const STEP=4,COLS=21,ROWS=210,nav=new Uint8Array(COLS*ROWS);
const gridPoints=Array.from({length:nav.length},(_,id)=>({x:(id%COLS)*STEP-40,y:Math.floor(id/COLS)*STEP}));
const point=id=>gridPoints[id];
for(let i=0;i<nav.length;i++)nav[i]=!mowerBlocked(point(i));
// Reuse exact directed edge clearances for the fixed course. The signature
// includes geometry and clearance code; stale bakes safely fall back to the
// original checks and cache their results. Search order/heuristics stay intact.
let signature=2166136261;
// V8 versions differ by nanometres in Math.sin-generated scenery. Normalize
// only the fingerprint to micrometres; actual collision geometry is untouched.
const fingerprint=JSON.stringify([STEP,COLS,ROWS,1.85,COURSE.width,COURSE.length,gridPoints,COURSE.obstacles],(_,v)=>typeof v==='number'?Math.round(v*1e6)/1e6:v)+blocked.toString()+lineClear.toString()+distance.toString()+mowerBlocked.toString()+mowerLineClear.toString()+createCourseObstacleIndex.toString();
for(let i=0;i<fingerprint.length;i++)signature=Math.imul(signature^fingerprint.charCodeAt(i),16777619)>>>0;
const baked=bakedNavigation.signature===signature&&bakedNavigation.edges.length===nav.length;
const edgeMasks=baked?new Uint16Array(bakedNavigation.edges):new Uint16Array(nav.length),knownEdges=new Uint16Array(nav.length).fill(baked?511:0);
let edgeChecks=0;
// Synchronous searches never overlap. Reuse scratch storage instead of feeding
// the garbage collector on every pursuit replan; returned waypoints are copies.
const search={costs:new Float32Array(nav.length),parents:new Int32Array(nav.length),closed:new Uint8Array(nav.length),estimates:new Float64Array(nav.length),open:createStableSearchQueue(nav.length)};
function edgeClear(id,next,dx,dy){const bit=1<<((dy+1)*3+dx+1);if(!(knownEdges[id]&bit)){knownEdges[id]|=bit;edgeChecks++;if(mowerLineClear(point(id),point(next)))edgeMasks[id]|=bit;}return !!(edgeMasks[id]&bit);}
export function navigationStats(){return {baked,signature,edgeChecks,nodes:nav.length};}
export function navigationSnapshot(){
 for(let id=0;id<nav.length;id++)if(nav[id]){const x=id%COLS,y=Math.floor(id/COLS);for(let dy=-1;dy<=1;dy++)for(let dx=-1;dx<=1;dx++){if(!dx&&!dy||x+dx<0||x+dx>=COLS||y+dy<0||y+dy>=ROWS)continue;const next=id+dx+dy*COLS;if(nav[next])edgeClear(id,next,dx,dy);}}
 return {signature,edges:Array.from(edgeMasks)};
}
function nearest(p,approach=false,canReach=null){let best=-1,d=Infinity;const cx=clamp(Math.round((p.x+40)/STEP),0,COLS-1),cy=clamp(Math.round(p.y/STEP),0,ROWS-1);
 for(let y=Math.max(0,cy-3);y<=Math.min(ROWS-1,cy+3);y++)for(let x=Math.max(0,cx-3);x<=Math.min(COLS-1,cx+3);x++){const id=y*COLS+x,n=distance(p,point(id));if(nav[id]&&n<d&&(approach||mowerLineClear(p,point(id)))&&(!canReach||canReach(p,point(id)))){d=n;best=id;}}return best;}
export function planMowerRoute(start,end,avoid=null){
 // One abandoned cart is a temporary obstacle over the baked course graph.
 // Keep cached static edges; only test the small dynamic exclusion circle.
 const clear=(a,b,endpoint=false)=>{
  if(!avoid)return true;const ax=a.x-avoid.x,ay=a.y-avoid.y,bx=b.x-avoid.x,by=b.y-avoid.y,dx=bx-ax,dy=by-ay,r=4.8;
  const ad=Math.hypot(ax,ay),bd=Math.hypot(bx,by);
  if(ad<r&&bd>ad&&ax*dx+ay*dy>=0)return true;
  if(endpoint&&bd<r&&ad>bd&&ax*bx+ay*by>0&&bx*dx+by*dy<=0)return true;
  const t=clamp(-(ax*dx+ay*dy)/(dx*dx+dy*dy||1),0,1);return Math.hypot(ax+dx*t,ay+dy*t)>r;
 };
 if(mowerLineClear(start,end)&&clear(start,end,true))return {points:[{...end}],expanded:0};
 const from=nearest(start,false,clear),to=nearest(end,mowerBlocked(end));if(from<0||to<0)return {points:[],expanded:0};
 const {costs,parents,closed,estimates,open}=search;costs.fill(Infinity);parents.fill(-1);closed.fill(0);estimates.fill(NaN);open.clear();costs[from]=0;estimates[from]=distance(point(from),point(to));open.set(from,estimates[from]);let expanded=0,found=false;
 while(open.length&&expanded<1600){
  const id=open.pop();closed[id]=1;expanded++;if(id===to){found=true;break;}
  const x=id%COLS,y=Math.floor(id/COLS);
  for(let dy=-1;dy<=1;dy++)for(let dx=-1;dx<=1;dx++){if(!dx&&!dy||x+dx<0||x+dx>=COLS||y+dy<0||y+dy>=ROWS)continue;const next=id+dx+dy*COLS;if(!nav[next]||closed[next]||!edgeClear(id,next,dx,dy)||!clear(point(id),point(next),next===to))continue;
   const cost=costs[id]+STEP*Math.hypot(dx,dy);if(cost<costs[next]){costs[next]=cost;parents[next]=id;if(Number.isNaN(estimates[next]))estimates[next]=distance(point(next),point(to));open.set(next,costs[next]+estimates[next]);}
  }
 }
 if(!found)return {points:[],expanded};const route=[];for(let id=to;id!==from&&id>=0;id=parents[id])route.unshift({...point(id)});
 // The graph's first node can sit behind a post relative to the actor. Its
 // outgoing edge is safe from that node, not necessarily from the actor's
 // current pose. Keep the entry when skipping it would cut the corner.
 if(route.length&&(!mowerLineClear(start,route[0])||!clear(start,route[0])))route.unshift({...point(from)});
 if(mowerLineClear(route.at(-1)||start,end)&&clear(route.at(-1)||start,end,true))route.push({...end});return {points:route,expanded};
}
