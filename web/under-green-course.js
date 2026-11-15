import {waterState} from './under-green-water-state.js';
export {waterState} from './under-green-water-state.js';
// Physical metres: +y north, +x east; the escape route folds through the junction.
export const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
export const distance=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y);
export const wrap=a=>Math.atan2(Math.sin(a),Math.cos(a));
import {FLOORS,OBSTACLES,WATERS,LEVER,NOTE,EXIT,SLUICE,GATE,BOUNDS,roofAt,districtAt,rangeY} from './under-green-layout.js';
export {FLOORS,OBSTACLES,WATERS,LEVER,NOTE,EXIT,SLUICE,GATE,BOUNDS};
export const SAVE_KEY='rough-cut.under-green.v1';
// Gate geometry descends from 3.3m. Collision uses each actor's body height.
export const gateClearance=fraction=>3.3*(1-clamp(fraction,0,1));
export const gateBlocks=(fraction,height=1.8)=>gateClearance(fraction)<height+.08;
export function waterLocal(p,w){return w.axis==='x'?{x:w.y-p.y,y:p.x-w.x}:{x:p.x-w.x,y:p.y-w.y};}
export function waterPoint(w,x,y){return w.axis==='x'?{x:w.x+y,y:w.y-x}:{x:w.x+x,y:w.y+y};}
export function inWater(p,w,padding=0){const local=waterLocal(p,w);return Math.abs(local.x)<w.width/2+padding&&Math.abs(local.y)<w.depth/2+padding;}
export const gateSide=p=>(p.y-GATE.y)*GATE.direction;
export const keeperInside=p=>gateSide(p)>.65&&Math.abs(p.x-GATE.x)<GATE.width/2;
export const gateOccupied=p=>gateSide(p)>-.7&&Math.abs(p.x-GATE.x)<GATE.width/2+.4;
export function onFloor(x,y){return FLOORS.some(r=>Math.abs(x-r.x)<=r.w/2&&Math.abs(y-r.y)<=r.d/2);}
export const covered=(y,x=0)=>roofAt(x,y);
// Partition the exact rectangle union. Rendered boundaries use the same half-
// metre coordinates as collision, without overlapping floors or rounded walls.
export function floorLayout(){
 const xs=[...new Set(FLOORS.flatMap(r=>[r.x-r.w/2,r.x+r.w/2]))].sort((a,b)=>a-b),ys=[...new Set([...FLOORS.flatMap(r=>[r.y-r.d/2,r.y+r.d/2]),rangeY(6),rangeY(35),35,51])].sort((a,b)=>a-b),tiles=[],walls=[];
 for(let i=0;i<xs.length-1;i++)for(let j=0;j<ys.length-1;j++){
  const x=(xs[i]+xs[i+1])/2,y=(ys[j]+ys[j+1])/2,w=xs[i+1]-xs[i],d=ys[j+1]-ys[j];if(!onFloor(x,y))continue;tiles.push({x,y,w,d,covered:covered(y,x)});
  for(const sign of [-1,1]){if(!onFloor(x+sign*(w/2+.001),y))walls.push({x:x+sign*w/2,y,w:.22,d,covered:covered(y,x)});if(!onFloor(x,y+sign*(d/2+.001)))walls.push({x,y:y+sign*d/2,w,d:.22,covered:covered(y,x)});}
 }return {tiles,walls};
}
export function solid(p,r=.3,gate=false,sightHeight=0){
 for(const [dx,dy]of [[0,0],[r,0],[-r,0],[0,r],[0,-r],[r*.707,r*.707],[-r*.707,r*.707],[r*.707,-r*.707],[-r*.707,-r*.707]])if(!onFloor(p.x+dx,p.y+dy))return true;
 if(OBSTACLES.some(o=>(o.sightHeight??Infinity)>=sightHeight&&Math.abs(p.x-o.x)<o.w/2+r&&Math.abs(p.y-o.y)<o.d/2+r))return true;
 return gate&&Math.abs(p.y-GATE.y)<.3+r&&Math.abs(p.x-GATE.x)<GATE.width/2+.1+r;
}
export function lineClear(a,b,r=0,gate=false){const d=distance(a,b),n=Math.max(1,Math.ceil(d/.25));for(let i=0;i<=n;i++){const t=i/n;if(solid({x:a.x+(b.x-a.x)*t,y:a.y+(b.y-a.y)*t},r,gate))return false;}return true;}
// Perception samples an eye-to-eye segment. Keep path, interaction and blade
// obstruction on their existing body-clearance rules; a visible target does
// not imply that Joe can walk or strike through the control between them.
export function sightClear(a,b,gate=0){
 const n=Math.max(1,Math.ceil(distance(a,b)/.2)),ah=a.eyeHeight??1.75,bh=b.eyeHeight??1.65;
 for(let i=0;i<=n;i++){
  const t=i/n,height=ah+(bh-ah)*t;
  if(solid({x:a.x+(b.x-a.x)*t,y:a.y+(b.y-a.y)*t},.05,gateBlocks(gate,height),height))return false;
 }return true;
}
export function move(p,dx,dy,r=.3,gate=false,blocked=()=>false){const steps=Math.max(1,Math.ceil(Math.hypot(dx,dy)/.15));let moved=0;for(let i=0;i<steps;i++){const x=p.x,y=p.y,nextX={x:p.x+dx/steps,y:p.y};if(!solid(nextX,r,gate)&&!blocked(nextX))p.x=nextX.x;const nextY={x:p.x,y:p.y+dy/steps};if(!solid(nextY,r,gate)&&!blocked(nextY))p.y=nextY.y;moved+=Math.hypot(p.x-x,p.y-y);}return moved;}
// A small authored grid is shared by search and collision; water is a real
// temporary obstacle. No hidden-player position is used by path selection.
const {minX:MIN_X,maxX:MAX_X,minY:MIN_Y,maxY:MAX_Y}=BOUNDS,STRIDE=MAX_X-MIN_X+1;
const key=(x,y)=>y*STRIDE+x-MIN_X;
const navigationCells=new Map();
function cellsFor(radius){if(!navigationCells.has(radius)){const cells=new Map();for(let y=MIN_Y+1;y<MAX_Y;y++)for(let x=MIN_X;x<=MAX_X;x++)if(!solid({x,y},radius))cells.set(key(x,y),{x,y});navigationCells.set(radius,cells);}return navigationCells.get(radius);}
export function navigationPoints(radius=.8){return [...cellsFor(radius).values()];}
export function pathTo(from,to,time,bypass,gate=false,bypassAt=-99,radius=.4){
 const cells=cellsFor(radius);
 const nearest=p=>{let best=null,d=Infinity;for(const [k,c]of cells){const n=distance(p,c);if(n<d){d=n;best=k;}}return best;};
 const start=nearest(from),goal=nearest(to),queue=[start],prev=new Map([[start,null]]);let head=0,best=start,bestDistance=distance(cells.get(start),cells.get(goal));
 const bad=p=>solid(p,radius,gate)||WATERS.some(w=>waterState(w,time,bypass,bypassAt).danger&&inWater(p,w,.5));
 while(head<queue.length){const k=queue[head++],p=cells.get(k),d=distance(p,cells.get(goal));if(d<bestDistance){best=k;bestDistance=d;}if(k===goal)break;for(const [dx,dy]of [[0,1],[1,0],[-1,0],[0,-1]]){const nk=key(p.x+dx,p.y+dy),n=cells.get(nk);if(!n||prev.has(nk)||bad(n))continue;prev.set(nk,k);queue.push(nk);}}
 // An unavailable crossing stops Joe at its bank, not at the far end of a
 // corridor just because no complete route exists yet.
 const path=[];for(let k=prev.has(goal)?goal:best;k!==start;k=prev.get(k))path.push(cells.get(k));return path.reverse();
}
export const district=p=>districtAt(typeof p==='number'?{x:0,y:p}:p);
