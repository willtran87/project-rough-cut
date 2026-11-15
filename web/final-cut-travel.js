import {WALLS,FIXTURES,ROAD_FENCE,clamp,wrap} from './final-cut-course.js';
import {ACCESS_FENCE,BAY} from './final-cut-arrival-layout.js';
import {rigWallHit} from './final-cut-rig.js';
import {TRAVEL_ROUTES} from './final-cut-travel-routes.js';

export const TRAVEL={speed:18,acceleration:12,lateralAcceleration:12,spacing:.18};
const ROAD_NODES=[...[-39,39].flatMap(x=>[25,40,70,91,105].flatMap(y=>[0,Math.PI].map(yaw=>({x,y,yaw})))),...[-50,50].flatMap(x=>[25,80,105].flatMap(y=>[-Math.PI/2,Math.PI/2].map(yaw=>({x,y,yaw})))),...[-Math.PI/2,Math.PI/2].map(yaw=>({x:0,y:105,yaw}))];
const roadEdges=new Map();
const TAU=Math.PI*2,mod=a=>(a%TAU+TAU)%TAU,cache=new Map();
// Include structures outside the playable collision map: the stand, bay and
// road/arrival fences are real clearance constraints for a rolling machine.
export const TRAVEL_SOLIDS=[...WALLS,...FIXTURES,...ROAD_FENCE,...ACCESS_FENCE,
 {id:'stand-envelope',x:50,y:49,w:11,d:36,h:6},
 {id:'equipment-bay',x:BAY.x,y:BAY.y,w:BAY.w,d:BAY.d,h:4}];
const center=(p,s,R)=>({x:p.x+s*R*Math.cos(p.yaw),y:p.y-s*R*Math.sin(p.yaw)});
const angleAt=(p,c,s)=>Math.atan2((p.y-c.y)*s,(c.x-p.x)*s);
function arc(p,c,s,R,yaw){const angle=mod(s*(yaw-p.yaw));return {kind:'arc',a:p,b:{x:c.x-s*R*Math.cos(yaw),y:c.y+s*R*Math.sin(yaw),yaw:wrap(yaw)},c,s,R,angle,length:angle*R};}
function rawPaths(start,end,R){
 const paths=[];
 for(const s of [-1,1])for(const t of [-1,1]){
  const c=center(start,s,R),d=center(end,t,R),dx=d.x-c.x,dy=d.y-c.y,D=Math.hypot(dx,dy);
  if(D<1e-7||s!==t&&D<2*R)continue;
  const yaw=Math.atan2(dx,dy)+(s===t?0:Math.asin(2*s*R/D)),first=arc(start,c,s,R,yaw),lastPoint={x:d.x-t*R*Math.cos(yaw),y:d.y+t*R*Math.sin(yaw),yaw};
  paths.push([first,{kind:'line',a:first.b,b:lastPoint,length:Math.hypot(lastPoint.x-first.b.x,lastPoint.y-first.b.y)},arc(lastPoint,d,t,R,end.yaw)]);
 }
 for(const s of [-1,1]){
  const c=center(start,s,R),d=center(end,s,R),dx=d.x-c.x,dy=d.y-c.y,D=Math.hypot(dx,dy);if(D<1e-7||D>4*R)continue;
  const h=Math.sqrt(Math.max(0,4*R*R-D*D/4));
  for(const side of [-1,1]){
   const middle={x:(c.x+d.x)/2-side*dy/D*h,y:(c.y+d.y)/2+side*dx/D*h},p={x:(c.x+middle.x)/2,y:(c.y+middle.y)/2},q={x:(d.x+middle.x)/2,y:(d.y+middle.y)/2};
   const first=arc(start,c,s,R,angleAt(p,c,s)),second=arc(first.b,middle,-s,R,angleAt(q,middle,-s));paths.push([first,second,arc(second.b,d,s,R,end.yaw)]);
  }
 }
 return paths.map(p=>p.filter(s=>s.length>1e-6));
}
function at(s,t){if(s.kind==='line')return {x:s.a.x+(s.b.x-s.a.x)*t,y:s.a.y+(s.b.y-s.a.y)*t,yaw:s.a.yaw};const yaw=s.a.yaw+s.s*s.angle*t;return {x:s.c.x-s.s*s.R*Math.cos(yaw),y:s.c.y+s.s*s.R*Math.sin(yaw),yaw:wrap(yaw)};}
const choose=[1,5,10,10,5,1],choose4=[1,4,6,4,1],choose3=[1,3,3,1];
function curve(points,t){
 let x=0,y=0,dx=0,dy=0,ddx=0,ddy=0;const u=1-t;
 for(let i=0;i<6;i++){const w=choose[i]*u**(5-i)*t**i;x+=w*points[i].x;y+=w*points[i].y;}
 for(let i=0;i<5;i++){const w=5*choose4[i]*u**(4-i)*t**i;dx+=w*(points[i+1].x-points[i].x);dy+=w*(points[i+1].y-points[i].y);}
 for(let i=0;i<4;i++){const w=20*choose3[i]*u**(3-i)*t**i;ddx+=w*(points[i+2].x-2*points[i+1].x+points[i].x);ddy+=w*(points[i+2].y-2*points[i+1].y+points[i].y);}
 return {x,y,yaw:Math.atan2(dx,dy),curvature:(dy*ddx-dx*ddy)/Math.hypot(dx,dy)**3};
}
function smoothPath(raw){
 const parts=[];
 for(const s of raw){const n=s.kind==='arc'?Math.max(1,Math.ceil(s.angle/(Math.PI/3))):1;for(let i=0;i<n;i++)parts.push({a:at(s,i/n),b:at(s,(i+1)/n),length:s.length/n,k:s.kind==='arc'?s.s/s.R:0});}
 const samples=[];let length=0;
 for(let index=0;index<parts.length;index++){
  const p=parts[index],L=p.length,k0=index&&parts[index-1].k===p.k?p.k:0,k1=index+1<parts.length&&parts[index+1].k===p.k?p.k:0;
  const point=(v,along,normal)=>({x:v.x+Math.sin(v.yaw)*along+Math.cos(v.yaw)*normal,y:v.y+Math.cos(v.yaw)*along-Math.sin(v.yaw)*normal});
  const points=[p.a,point(p.a,L/5,0),point(p.a,2*L/5,k0*L*L/20),point(p.b,-2*L/5,k1*L*L/20),point(p.b,-L/5,0),p.b],n=Math.max(4,Math.ceil(L/TRAVEL.spacing));
  for(let i=index?1:0;i<=n;i++){
   const v=curve(points,i/n);if(!Number.isFinite(v.curvature)||Math.abs(v.curvature)>.32)return null;
   if(samples.length)length+=Math.hypot(v.x-samples.at(-1).x,v.y-samples.at(-1).y);
   samples.push({...v,distance:length,steering:Math.atan(1.55*v.curvature)/.7});
  }
 }
 return {samples,length};
}
function clear(route){
 if(!route)return false;
 for(const p of route.samples){
  // Transit never cuts across the central arena. The only inside-boundary
  // connectors are the screened ends of the north/south corridor.
  if(Math.abs(p.x)<29.5&&p.y<98&&!(p.x>19&&((p.y>=22&&p.y<=34)||(p.y>=81&&p.y<=91))))return false;
  if(p.x>62||p.x<-62||p.y<-10||p.y>114)return false;
  if(rigWallHit({...p,phase:'turn',deployment:0},TRAVEL_SOLIDS))return false;
 }
 return true;
}
function candidates(start,end){return [4.5,6,8,10,12].flatMap(R=>rawPaths(start,end,R)).sort((a,b)=>a.reduce((n,p)=>n+p.length,0)-b.reduce((n,p)=>n+p.length,0));}
function connection(start,end){for(const raw of candidates(start,end)){const route=smoothPath(raw);if(clear(route))return {raw,route};}return null;}
function speedProfile(route){
 const a=TRAVEL.acceleration,s=route.samples;
 for(const p of s)p.speed=Math.min(TRAVEL.speed,Math.sqrt(TRAVEL.lateralAcceleration/Math.max(1e-8,Math.abs(p.curvature))));
 s[0].speed=0;s.at(-1).speed=0;
 for(let i=1;i<s.length;i++)s[i].speed=Math.min(s[i].speed,Math.sqrt(s[i-1].speed**2+2*a*(s[i].distance-s[i-1].distance)));
 for(let i=s.length-2;i>=0;i--)s[i].speed=Math.min(s[i].speed,Math.sqrt(s[i+1].speed**2+2*a*(s[i+1].distance-s[i].distance)));
 s[0].time=0;for(let i=1;i<s.length;i++)s[i].time=s[i-1].time+2*(s[i].distance-s[i-1].distance)/(s[i].speed+s[i-1].speed);
 route.duration=s.at(-1).time;return route;
}
export function travelKey(start,end){return [start.x,start.y,mod(start.yaw),end.x,end.y,mod(end.yaw)].map(v=>(Math.abs(v)<1e-7?0:v).toFixed(3)).join(',');}
export function planRollingTravel(start,end,build=false){
 const key=travelKey(start,end);if(!build&&cache.has(key))return cache.get(key);
 if(!build&&TRAVEL_ROUTES[key]){const route=speedProfile(smoothPath(TRAVEL_ROUTES[key]));cache.set(key,route);return route;}
 let best=connection(start,end);
 if(!best){
  const nodes=[start,end,...ROAD_NODES],cost=new Map([[0,0]]),previous=new Map(),open=new Set([0]),closed=new Set();
  while(open.size){
   const index=[...open].sort((a,b)=>(cost.get(a)+Math.hypot(nodes[a].x-end.x,nodes[a].y-end.y))-(cost.get(b)+Math.hypot(nodes[b].x-end.x,nodes[b].y-end.y)))[0];
   if(index===1){const raw=[];let at=1;while(at!==0){const p=previous.get(at);raw.unshift(...p.edge.raw);at=p.from;}const route=smoothPath(raw);if(clear(route))best={raw,route};break;}
   open.delete(index);closed.add(index);
   for(let k=1;k<nodes.length;k++){
    if(k===index||closed.has(k))continue;
    const a=nodes[index],b=nodes[k],d=Math.hypot(a.x-b.x,a.y-b.y);
    if(index>1&&k>1&&a.x!==b.x&&a.y!==b.y&&d>38)continue;
    if(d<.001&&Math.abs(wrap(a.yaw-b.yaw))<.001)continue;
    const edgeKey=JSON.stringify([a,b]);if(!roadEdges.has(edgeKey))roadEdges.set(edgeKey,connection(a,b));const edge=roadEdges.get(edgeKey);if(!edge)continue;
    const next=cost.get(index)+edge.route.length;if(next>=(cost.get(k)??Infinity))continue;
    cost.set(k,next);previous.set(k,{from:index,edge});open.add(k);
   }
  }
 }
 const route=best?speedProfile({...best.route,raw:best.raw}):null;if(cache.size>=128)cache.delete(cache.keys().next().value);cache.set(key,route);return route;
}
export function travelPose(route,distance){
 const s=route.samples;let lo=0,hi=s.length-1;while(hi-lo>1){const m=(lo+hi)>>1;if(s[m].distance<distance)lo=m;else hi=m;}
 const a=s[lo],b=s[hi],t=clamp((distance-a.distance)/Math.max(1e-9,b.distance-a.distance),0,1);
 return {x:a.x+(b.x-a.x)*t,y:a.y+(b.y-a.y)*t,yaw:wrap(a.yaw+wrap(b.yaw-a.yaw)*t),steering:a.steering+(b.steering-a.steering)*t};
}
export function advanceRollingTravel(j,dt){
 if(!j.travel){const route=planRollingTravel(j,{...j.attack.from,yaw:j.attack.yaw});if(!route)return 'blocked';j.travel={route,time:0,distance:0,index:0};}
 const travel=j.travel,s=travel.route.samples,time=Math.min(travel.route.duration,travel.time+dt);
 while(travel.index<s.length-2&&s[travel.index+1].time<time)travel.index++;
 const a=s[travel.index],b=s[travel.index+1],elapsed=time-a.time,acceleration=(b.speed-a.speed)/(b.time-a.time),distance=a.distance+a.speed*elapsed+acceleration*elapsed*elapsed/2;
 const pose=travelPose(travel.route,distance);if(rigWallHit({...j,...pose},TRAVEL_SOLIDS))return 'blocked';
 Object.assign(j,pose);j.speed=Math.max(0,a.speed+acceleration*elapsed);j.travelSpeed=j.speed;j.distance+=distance-travel.distance;j.reverse=false;
 travel.time=time;travel.distance=distance;
 if(time>=travel.route.duration){Object.assign(j,{...j.attack.from,yaw:j.attack.yaw,speed:0,steering:0});j.path=[];return true;}return false;
}
