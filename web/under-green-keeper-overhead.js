import * as THREE from './vendor/three/three.module.js';
import {EXIT,GATE_ROOF_SLOT} from './under-green-layout.js';
import {KEEPER_TIMBER_SPAN} from './under-green-keeper-timber.js';

// A former occupied room has a timber lining under the structural slab.
// The separate hoist pocket stays entirely open for the moving sluice.
export function buildKeeperOverhead({box,put}){
 const left=EXIT.x-5,right=EXIT.x+5,near=EXIT.y-3.25,far=GATE_ROOF_SLOT.y-GATE_ROOF_SLOT.d/2-.12;
 let timbers=0,hardware=0;const members=[];
 function timber(x,y,height,w,h,d,axis){
  const g=new THREE.BoxGeometry(w,h,d),p=g.attributes.position,n=g.attributes.normal,uv=g.attributes.uv;
  const phaseU=((x*.754877+y*.56984)%1+1)%1,phaseV=((x*.43871+y*.31837)%1+1)%1;
  // Grain runs along the member at its declared physical span, including the
  // underside. World-projected UVs would turn it across these crossbeams.
  for(let i=0;i<p.count;i++){
   const end=axis==='x'?Math.abs(n.getX(i))>.5:Math.abs(n.getZ(i))>.5;
   const across=Math.abs(n.getY(i))>.5?(axis==='x'?p.getZ(i):p.getX(i)):p.getY(i);
   // Individual lengths select different planks and grain phases, rather
   // than repeating the same knot at the same point on all twenty boards.
   uv.setXY(i,(end?p.getX(i)+p.getZ(i):across)/KEEPER_TIMBER_SPAN+phaseU,(end?p.getY(i):axis==='x'?p.getX(i):p.getZ(i))/KEEPER_TIMBER_SPAN+phaseV);
  }
  g.userData.preserveDrainUV=true;put(g,'keeperWood',x,height,-y);g.dispose();timbers++;members.push({x,y,height,w,h,d,axis});
 }
 const boardCount=20,boardWidth=(right-left)/boardCount;
 for(let i=0;i<boardCount;i++){
  // Fine joints expose the solid slab, never an unbounded black hole.
  timber(left+(i+.5)*boardWidth,(near+far)/2,4.127,boardWidth-.012,.046,far-near,'y');
 }
 const bays=[near+.7,(near+far)/2,far-.52];
 const metal=(type,x,h,y,w,t,d)=>{box(type,x,h,-y,w,t,d);hardware++;};
 for(const y of bays){
  timber(EXIT.x,y,3.985,right-left,.29,.27,'x');
  for(const side of [-1,1]){
   const wall=side<0?left:right;
   timber(wall-side*.055,y,3.78,.22,.46,.34,'y');
   metal('machineRust',wall-side*.08,3.83,y,.32,.045,.39);
   // Paired flat straps and heads show how old joists were retained after
   // damp damaged their pockets. All wear stays local to these connections.
   for(const face of [-1,1]){
    metal('machineIron',wall-side*.12,3.91,y+face*.18,.24,.34,.025);
    for(const h of [3.8,4.02])metal('machineSteel',wall-side*.12,h,y+face*.202,.035,.035,.025);
   }
  }
 }
 return {kind:'timber-lined-keeper',boards:boardCount,beams:bays.length,timbers,hardware,triangles:(timbers+hardware)*12,minimumHeight:3.55,bounds:{left,right,near,far},members};
}
