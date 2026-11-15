import {WATER_TIMING,recurringSafeWindow} from './under-green-water-state.js';
import {navigationPoints,WATERS,inWater,waterState,solid,distance,wrap,lineClear,waterLocal} from './under-green-course.js';
import {createStableSearchQueue} from './stable-search-queue.js';

// Joe knows the irrigation plant's repeatable cycles, not the unseen player's
// position. Plan whole bank-to-bank crossings; a temporarily green first metre
// is not sufficient reason to walk into a discharge he cannot clear.
const directions=[[0,1],[1,0],[0,-1],[-1,0]],clearance=.6,reserve=.25;
let graph;

// A dry shortcut must not bypass a planned crossing, even during low flow.
// Segment/rectangle clipping catches a water bed between distant endpoints.
function touchesWater(from,to,water){
 const a=waterLocal(from,water),b=waterLocal(to,water);
 let near=0,far=1;
 for(const [axis,half]of [['x',water.width/2+clearance],['y',water.depth/2+clearance]]){
  const delta=b[axis]-a[axis];
  if(Math.abs(delta)<1e-9){if(Math.abs(a[axis])>half)return false;continue;}
  let enter=(-half-a[axis])/delta,leave=(half-a[axis])/delta;
  if(enter>leave)[enter,leave]=[leave,enter];
  near=Math.max(near,enter);far=Math.min(far,leave);if(near>far)return false;
 }
 return true;
}

export function clearDryPursuitLine(from,to,gate=false){
 return !WATERS.some(w=>touchesWater(from,to,w))&&lineClear(from,to,.8,gate);
}

// Caller supplies fresh observed evidence only. Stop short enough that a
// player beside a wall still has a reachable approach, then use the normal
// committed attack rather than steering the body into the player's position.
export function visibleApproachTarget(from,observed,gate=false){
 const gap=distance(from,observed);if(gap<=1.25)return null;
 const scale=(gap-1.25)/gap,target={x:from.x+(observed.x-from.x)*scale,y:from.y+(observed.y-from.y)*scale};
 return clearDryPursuitLine(from,target,gate)?target:null;
}

// Search the continuation of witnessed movement, then nearby branches. Each
// probe is clipped against walkable dry ground; it never samples the player.
export function localSearchTarget(origin,heading,index,gate=false){
 const turns=[0,Math.PI/2,-Math.PI/2];
 if(index>=turns.length)return null;
 const angle=heading+turns[index];let target=null;
 for(let d=.5;d<=5;d+=.5){
  const point={x:origin.x+Math.sin(angle)*d,y:origin.y+Math.cos(angle)*d};
  if(!clearDryPursuitLine(origin,point,gate))break;
  if(d>=1.5)target=point;
 }
 return target;
}

export function smoothJoeRoute(from,route,gate=false){
 const result=[];let anchor=from,index=0;
 while(index<route.length){
  let next=index;
  // Keep every crossing endpoint and its approach. Timing is still checked
  // at the bank using actual arrival time after any shortened dry approach.
  if(!route[index].crossing)for(let i=index+1;i<route.length&&!route[i].crossing;i++){
   if(clearDryPursuitLine(anchor,route[i],gate))next=i;
  }
  result.push(route[next]);anchor=route[next];index=next+1;
 }
 result.destination=route.destination;
 return result;
}
function courseGraph(){
 if(graph)return graph;
 const cells=navigationPoints(.8).filter(p=>!WATERS.some(w=>inWater(p,w,clearance)));
 const lookup=new Map(cells.map((p,i)=>[`${p.x},${p.y}`,i]));
 const nodes=cells.map(p=>({...p,edges:[]}));
 for(const node of nodes)for(let heading=0;heading<4;heading++){
  const [dx,dy]=directions[heading],next={x:node.x+dx,y:node.y+dy};
  const water=WATERS.find(w=>inWater(next,w,clearance));
  if(water&&((water.axis==='x'&&dy)||(water.axis!=='x'&&dx)))continue;
  for(let length=1;length<=20;length++){
   const p={x:node.x+dx*length,y:node.y+dy*length};
   if(solid(p,.8))break;
   if(WATERS.some(w=>w!==water&&inWater(p,w,clearance)))break;
   const target=lookup.get(`${p.x},${p.y}`);
   if(target!==undefined){node.edges.push({target,length,heading,water});break;}
   if(!water)break;
  }
 }
 return graph=nodes;
}

export function crossingWait(w,time,seconds,bypass,bypassAt){
 const state=waterState(w,time,bypass,bypassAt);
 if(!state.danger&&(state.safeFor===null||state.safeFor>=seconds+reserve))return 0;
 // Event-controlled return/outflow cannot promise another timed opening.
 const window=recurringSafeWindow(w);
 if(window===null)return Infinity;
 if(seconds+reserve>window)return Infinity;
 return WATER_TIMING.period-state.cycle;
}

export function planJoeRoute(from,to,time,{speed=2.1,bypass=false,bypassAt=-99,gate=false}={}){
 if(![from.x,from.y,to.x,to.y,time,speed,bypassAt].every(Number.isFinite)||speed<=0)throw new RangeError('Joe route requires finite positions/times and a positive speed');
 const nodes=courseGraph();
 const nearest=p=>{let best=0,least=Infinity;nodes.forEach((n,i)=>{const d=distance(p,n);if(d<least){best=i;least=d;}});return best;};
 const start=nearest(from),goal=nearest(to),heading=((Math.round((from.yaw||0)/(Math.PI/2))%4)+4)%4;
 const count=nodes.length*4,queue=createStableSearchQueue(count),cost=new Float64Array(count).fill(Infinity),previous=new Map();
 const startKey=start*4+heading;cost[startKey]=time;queue.set(startKey,time);
 let end=startKey,best=distance(nodes[start],nodes[goal]);
 while(queue.length){
  const key=queue.pop(),index=Math.floor(key/4),node=nodes[index],d=distance(node,nodes[goal]);
  if(d<best){best=d;end=key;}if(index===goal){end=key;break;}
  for(const edge of node.edges){
   const target=nodes[edge.target];if(gate&&solid(target,.8,true))continue;
   const turn=Math.abs(wrap((edge.heading-key%4)*Math.PI/2))/2.4;
   const duration=edge.length/speed,arrival=cost[key]+turn;
   const wait=edge.water?crossingWait(edge.water,arrival,duration,bypass,bypassAt):0;
   const total=arrival+wait+duration,nextKey=edge.target*4+edge.heading;
   if(total>=cost[nextKey])continue;
   cost[nextKey]=total;previous.set(nextKey,{key,edge});queue.set(nextKey,total+distance(target,nodes[goal])/speed);
  }
 }
 const route=[];
 for(let key=end;key!==startKey;){const link=previous.get(key);if(!link)break;const point=nodes[Math.floor(key/4)];route.push({x:point.x,y:point.y,...(link.edge.water?{crossing:link.edge.water.id}:{} )});key=link.key;}
 route.reverse();route.destination={x:nodes[Math.floor(end/4)].x,y:nodes[Math.floor(end/4)].y};return smoothJoeRoute(from,route,gate);
}
