import * as THREE from './vendor/three/three.module.js';
import {roofPanels} from './under-green-overhead.js';
import {GATE_ROOF_SLOT,rangeY} from './under-green-layout.js';
import {structureEdges} from './under-green-structure.js';

// Real inspection wells keep the link to the golf course. The rest of the
// former upper void becomes a supported ceiling, with a different silhouette
// in each district. These shells stay well above body/camera/scythe space.
export const DISTRICT_WELLS=Object.freeze([
 {id:'bunker-inspection',x:-30,y:61.4,w:1.6,d:3.2,district:'bunker'},
 {id:'range-drainage',x:12,y:rangeY(29),w:1.55,d:2.2,district:'range'},
 {id:'range-service',x:21,y:rangeY(20),w:1.1,d:2.0,district:'range'}
]);

export function buildDistrictEnclosure({layout,materials,box,put}){
 materials.bankEarth=materials.mudBank.clone();materials.bankEarth.color.setHex(0x998b68);materials.bankEarth.userData.drainWorldUV=true;
 materials.shoringWood=materials.root.clone();materials.shoringWood.color.setHex(0x95896b);materials.shoringWood.userData.drainWorldUV=true;
 const open=layout.tiles.filter(t=>!t.covered).map(t=>({...t,covered:true}));
 const panels=roofPanels(open,[GATE_ROOF_SLOT,...DISTRICT_WELLS]);
 let bunkerPanels=0,rangePanels=0,supports=0;
 for(const p of panels){
  const bunker=p.x<-12;
  box(bunker?'bankEarth':'rangeStone',p.x,bunker?4.92:4.81,-p.y,p.w,.24,p.d);
  if(bunker)bunkerPanels++;else rangePanels++;
 }
 // Close the gap above existing retaining faces. The external bank cut is
 // intentionally visible underneath its shoring, rather than buried by a wall.
 for(const edge of structureEdges(layout.tiles)){
  if(edge.kind!=='retaining')continue;
  const {axis,line,start,end}=edge,length=end-start,x=axis==='x'?line:(start+end)/2,y=axis==='y'?line:(start+end)/2,bunker=x<-12;
  if(bunker&&axis==='x'&&Math.abs(line+32)<.01){
   // Strata continue above the original exposed turf lip, with an irregular
   // overhang tucked outside the walkable bank edge.
   box('bankEarth',line-.14,4.1,-y,.30,1.68,length);
  }else box(bunker?'bankEarth':'rangeStone',x,4.52,-y,axis==='x'?.22:length,.72,axis==='y'?.22:length);
 }
 // Beam runs are clipped to the actual floor union, so side corridors do not
 // borrow supports from imaginary walls or create open ends over the route.
 function spansAt(y,bunker){
  const spans=open.filter(t=>(t.x<-12)===bunker&&y>t.y-t.d/2&&y<t.y+t.d/2).map(t=>[t.x-t.w/2,t.x+t.w/2]).sort((a,b)=>a[0]-b[0]),joined=[];
  for(const s of spans){const last=joined.at(-1);if(last&&s[0]<=last[1]+.001)last[1]=Math.max(last[1],s[1]);else joined.push([...s]);}
  return joined;
 }
 const hitsWell=(x,y,w,d)=>[GATE_ROOF_SLOT,...DISTRICT_WELLS].some(s=>Math.abs(s.x-x)<(s.w+w)/2+.12&&Math.abs(s.y-y)<(s.d+d)/2+.12);
 for(const [bunker,ys]of [[true,[52.5,55.2,58.5,64,67.8,71.7,74.8]],[false,[18.2,22.1,26.9,30.6,35.1]]])for(const y of ys)for(const [left,right]of spansAt(y,bunker)){
  const width=right-left,x=(left+right)/2;if(hitsWell(x,y,width,.18))continue;
  const beamType=bunker?'shoringWood':'machineIron',height=bunker?4.56:4.46;
  box(beamType,x,height,-y,width,.26,bunker?.22:.18);supports++;
  if(!bunker){
   box('machineSteel',x,height-.14,-y,width,.035,.29);
   box('machineSteel',x,height+.14,-y,width,.035,.29);
  }
  for(const side of [-1,1]){
   const end=side<0?left:right;
   // Seats are entirely overhead; no new floor posts or collision obstacles.
   box(bunker?'rust':'machineRust',end,4.26,-y,.25,.32,.28);
   box('machineSteel',end,4.36,-y,.29,.04,.34);
  }
 }
 // The range ceiling has shallow raised metal seams; the bunker has long
 // irregular timber cleats, both following the actual roof panels.
 for(const p of panels){
  if(p.w<.45||p.d<.6)continue;
  const bunker=p.x<-12,count=Math.max(1,Math.floor(p.w/(bunker?1.1:.85)));
  for(let i=0;i<count;i++){
   const x=p.x-p.w/2+(i+.5)*p.w/count;
   box(bunker?'shoringWood':'machineIron',x,bunker?4.77:4.665,-p.y,bunker?.065:.035,bunker?.065:.035,p.d);
  }
 }
 for(const s of DISTRICT_WELLS){
  const bunker=s.district==='bunker',bottom=bunker?4.8:4.69,top=5.4;
  for(const side of [-1,1]){
   box(bunker?'sand':'pumpStone',s.x+side*(s.w/2+.09),(bottom+top)/2,-s.y,.18,top-bottom,s.d+.36);
   box(bunker?'sand':'pumpStone',s.x,(bottom+top)/2,-s.y+side*(s.d/2+.09),s.w,top-bottom,.18);
   box('grass',s.x+side*(s.w/2+.14),top+.06,-s.y,.28,.12,s.d+.56);
   box('grass',s.x,top+.06,-s.y+side*(s.d/2+.14),s.w,.12,.28);
  }
  for(let x=s.x-s.w/2+.16;x<s.x+s.w/2;x+=.26)box('machineIron',x,top,-s.y,.035,.065,s.d);
  for(const dy of [-s.d*.32,s.d*.32])box('machineSteel',s.x,top+.01,-s.y+dy,s.w,.04,.045);
  // Sparse roots on the soil side of the well, visible in upward/rear views.
  for(let i=0;i<5;i++){
   const x=s.x-s.w/2+.04,y=s.y-s.d*.35+i*s.d*.17;
   const curve=new THREE.CatmullRomCurve3([new THREE.Vector3(x-.04,top+.08,-y),new THREE.Vector3(x+.06,top-.23,-y+.03),new THREE.Vector3(x+.1,bottom+.03,-y-.08)]);
   const g=new THREE.TubeGeometry(curve,7,.016,4,false);
   // The fine well feeders share the sculpted roots' batch; neutral colors
   // retain their existing finish and keep the batch attribute layout valid.
   g.setAttribute('color',new THREE.Float32BufferAttribute(new Float32Array(g.attributes.position.count*3).fill(1),3));
   g.translate(-s.x,0,s.y);put(g,'root',s.x,0,-s.y);g.dispose();
  }
 }
 return {bunkerPanels,rangePanels,supports,wells:DISTRICT_WELLS.map(s=>({...s})),minimumHeight:4.1,opaque:true};
}
