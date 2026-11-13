// Metres: x across the hole, y towards the public road; yaw 0 faces +y.
import {ARRIVAL_WALLS,ARRIVAL_SPAWNS,ACCESS,OVERLOOK_ACCESS,ACCESS_FENCE,ACCESS_GATE} from './final-cut-arrival-layout.js';
import {ROUTE_WALLS,FORK_BASKET,FORK_SIGN} from './final-cut-route-layout.js';
import {rigHit,CUT_HALF_WIDTH,RIG_BODY,RIG_WHEELS} from './final-cut-rig.js';
import {refugeFurniture,refugeFurnitureSolids} from './final-cut-refuge-layout.js';
export const SAVE_KEY='rough-cut.final-cut.v1';
export const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
export const wrap=a=>Math.atan2(Math.sin(a),Math.cos(a));
export const distance=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y);
export const LANES=[26,50,66];
export const MOVEMENT={walk:3.84,sprint:6.08,crouch:2.4,listen:2.4};
export const BOUNDS={left:-25,right:25,start:-19,end:111};
export const REFUGES=[
 {id:'bunker',name:'Stone bunker',x:-10,y:15,w:9,d:8},
 {id:'pump',name:'Pump shelter',x:10,y:38,w:9,d:8},
 {id:'pavilion',name:'Starter’s pavilion',x:-16,y:86,w:10,d:9},
];
export const WALLS=[...ARRIVAL_WALLS,...ROUTE_WALLS,...REFUGES.flatMap(s=>[
 {id:s.id+'-front',x:s.x,y:s.y+s.d/2,w:s.w,d:.7,h:s.id==='bunker'?1.25:2.35},
 {id:s.id+'-back',x:s.x,y:s.y-s.d/2,w:s.w,d:.7,h:s.id==='pavilion'?1.25:2.35},
 {id:s.id+'-west',x:s.x-s.w/2,y:s.y,w:.7,d:s.d,h:2.35},
 // Openings are on the east, away from the machine's approach axis.
 {id:s.id+'-east-a',x:s.x+s.w/2,y:s.y-2.8,w:.7,d:1.8,h:2.35},
 {id:s.id+'-east-b',x:s.x+s.w/2,y:s.y+2.8,w:.7,d:1.8,h:2.35},
])];
// Corner timbers bear on the actual wall beneath them. The low bunker front
// and pavilion back need longer east posts; visual and sight/ball bounds share
// these extents instead of leaving short pieces suspended under the roof.
export const REFUGE_TIMBER_POSTS=REFUGES.flatMap(s=>[-1,1].flatMap(side=>[-1,1].map(end=>{
 const x=s.x+side*(s.w/2-.18),y=s.y-end*(s.d/2-.18);
 const base=Math.max(...WALLS.filter(w=>Math.abs(x-w.x)<=w.w/2&&Math.abs(y-w.y)<=w.d/2).map(w=>w.h));
 return {id:`timber-${s.id}-${side}-${end}`,refuge:s.id,side,end,x,y,w:.16,d:.16,h:2.895,base};
})));
export const REFUGE_FURNITURE=refugeFurniture(REFUGES);
export const REFUGE_FURNITURE_SOLIDS=refugeFurnitureSolids(REFUGE_FURNITURE);
const SIGHT_OBSTACLES=[...WALLS,...REFUGE_TIMBER_POSTS,...REFUGE_FURNITURE_SOLIDS];
export const PUMP={id:'pump',x:8,y:39,label:'Open the irrigation bypass'};
export const BELL={id:'bell',x:-9.6,y:85,label:'Ring the groundskeeping bell'};
export const NOTE={id:'record',x:11.5,y:36.5,label:'Take the load-limit record'};
export const BALL_BASKETS=[{id:'balls-bunker',x:-12,y:15},{id:'balls-pump',x:12.5,y:39.5},{id:'balls-pavilion',x:-18,y:86},FORK_BASKET].map(b=>({...b,label:'Refill golf balls'}));
export const SWALE={x:8,y:74,w:12,d:12};
export const GATE={x:0,y:94,w:4,d:.1,h:2.6};
export const FIXTURES=[...REFUGE_TIMBER_POSTS,...REFUGE_FURNITURE_SOLIDS,{id:'pump-machine',...PUMP,w:1,d:.6,h:1.6},{id:'record-stand',...NOTE,w:.9,d:.55,h:1.4},{...ACCESS,w:.4,d:.4,h:1.2},{...OVERLOOK_ACCESS,id:'overlook-control',w:.4,d:.4,h:.9},FORK_SIGN,...BALL_BASKETS.map(b=>({...b,w:.6,d:.6,h:.55}))];
export const ROAD_FENCE=[{x:-13.5,y:94,w:23,d:.1,h:2.6},{x:13.5,y:94,w:23,d:.1,h:2.6}];
export const BREAKABLES=[
 {id:'hospitality-table',kind:'table',x:8,y:26,w:2.4,d:1.6,h:1},
 {id:'bunker-bench',kind:'bench',x:-10,y:26,w:2.2,d:.8,h:1.1},
 {id:'review-board',kind:'board',x:-2,y:50,w:2.4,d:1.2,h:1.5},
 {id:'final-bench',kind:'bench',x:20,y:66,w:2.2,d:.8,h:1.1},
];
// The final central patch leaves a clear approach to the nursery's west edge.
// Art, crouch concealment and removal all use these same authored extents.
export const SECTORS=LANES.flatMap((y,i)=>[-17,0,17].map((x,j)=>({id:`rough-${i}-${j}`,lane:i,x:i===2&&j===1?-2:x,y,w:i===2&&j===1?8:13,d:9,h:1.9})));
export const CHECKPOINTS=[ARRIVAL_SPAWNS.direct,{x:10,y:38,yaw:0},{x:-16,y:85,yaw:0}];
export function inside(p,b,pad=0){return Math.abs(p.x-b.x)<b.w/2+pad&&Math.abs(p.y-b.y)<b.d/2+pad;}
export function gateContact(p,r,closure){const a=(1-closure)*Math.PI/2,dx=p.x+2,dy=p.y-94,along=dx*Math.cos(a)+dy*Math.sin(a),across=-dx*Math.sin(a)+dy*Math.cos(a);return along>-r&&along<4+r&&Math.abs(across)<.05+r;}
export function solid(p,r=.3,won=false,broken=[],gate=0,accessGate=1){return p.x<BOUNDS.left+r||p.x>BOUNDS.right-r||p.y<BOUNDS.start+r||p.y>BOUNDS.end-r||(!won&&p.y>94-r)||(won&&gateContact(p,r,gate))||[...WALLS,...FIXTURES,...ROAD_FENCE,...ACCESS_FENCE,{...ACCESS_GATE,x:ACCESS_GATE.x-4*accessGate},...BREAKABLES.filter(b=>!broken.includes(b.id))].some(b=>inside(p,b,r));}
export function move(p,dx,dy,won=false,broken=[],gate=0,accessGate=1){
 const count=Math.max(1,Math.ceil(Math.hypot(dx,dy)/.12)),start={x:p.x,y:p.y};
 for(let n=0;n<count;n++){
  if(!solid({x:p.x+dx/count,y:p.y},.3,won,broken,gate,accessGate))p.x+=dx/count;
  if(!solid({x:p.x,y:p.y+dy/count},.3,won,broken,gate,accessGate))p.y+=dy/count;
 }return distance(p,start);
}
export function segmentBox(a,b,box,pad=0){
 let lo=0,hi=1;
 for(const [axis,size]of [['x','w'],['y','d']]){
  const delta=b[axis]-a[axis],min=box[axis]-box[size]/2-pad,max=box[axis]+box[size]/2+pad;
  if(Math.abs(delta)<1e-9){if(a[axis]<min||a[axis]>max)return false;continue;}
  let t0=(min-a[axis])/delta,t1=(max-a[axis])/delta;if(t0>t1)[t0,t1]=[t1,t0];lo=Math.max(lo,t0);hi=Math.min(hi,t1);if(lo>hi)return false;
 }return true;
}
export const lineClear=(a,b,height=1.5)=>!SIGHT_OBSTACLES.some(w=>w.h>=height&&(w.bottom||0)<=height&&segmentBox(a,b,w));
export function isCut(r,p){return SECTORS.some(s=>r.cut.includes(s.id)&&inside(p,s))||(r.cutAreas||[]).some(a=>a.axis==='y'?p.y>=a.lo&&p.y<=a.hi&&Math.abs(p.x-a.x)<=RIG.halfWidth:p.x>=a.lo&&p.x<=a.hi&&Math.abs(p.y-a.y)<=RIG.halfWidth);}
export function concealed(r){return r.player.crouch&&SECTORS.some(s=>inside(r.player,s))&&!isCut(r,r.player);}
export function refuge(p){return REFUGES.find(s=>inside(p,{...s,w:s.w-.9,d:s.d-.9}));}
export function laneFor(p){return LANES.reduce((best,y,i)=>Math.abs(y-p.y)<Math.abs(LANES[best]-p.y)?i:best,0);}
export const RIG={halfWidth:CUT_HALF_WIDTH,halfLength:Math.max(...RIG_BODY.map(b=>Math.abs(b.forward)+b.d/2),...RIG_WHEELS.map(w=>Math.abs(w.forward)+w.treadRadius)),bodyHalfWidth:Math.max(...RIG_BODY.map(b=>Math.abs(b.side)+b.w/2),...RIG_WHEELS.map(w=>Math.abs(w.side)+w.width/2+.02)),speed:7.2,headland:30};
export function rigContact(p,j){
 return !!rigHit(p,j);
}
