import * as THREE from './vendor/three/three.module.js';
import {GATE,SLUICE,gateClearance} from './under-green-course.js';
import {mergeIndexedGeometries} from './indexed-geometry.js';
import {GATE_ROOF_SLOT} from './under-green-layout.js';

// The raised gate occupies a real pocket through the keeper-room roof.
// The opening changes overhead construction only, never walkable geometry.
export function createKeeperGate({scene,box,put,cyl}){
 const root=new THREE.Group();root.position.set(GATE.x,3.3,-GATE.y);scene.add(root);
 for(let x=-4.8;x<5;x+=.35)box('machineIron',x,1.5,0,.1,3,.12,root);
 for(const height of [.2,1.5,2.8]){
  box('machineSteel',0,height,0,GATE.width,.1,.14,root);
  // Recessed bolt heads remain inside the audited .14m crossbar depth.
  for(let x=-4.45;x<4.8;x+=.7)for(const face of [-1,1])put(cyl,'machineIron',x,height,face*.067,.026,.006,.026,Math.PI/2,0,0,root);
 }
 // Rigid pieces share two material draws; no independent bar animation exists.
 root.updateMatrixWorld(true);const parts=new Map(),old=[...root.children];
 for(const mesh of old){
  if(!parts.has(mesh.material))parts.set(mesh.material,[]);
  const g=mesh.geometry.clone().applyMatrix4(mesh.matrix),p=g.attributes.position,n=g.attributes.normal,uv=g.attributes.uv;
  for(let i=0;i<p.count;i++){const xx=Math.abs(n.getX(i)),yy=Math.abs(n.getY(i)),zz=Math.abs(n.getZ(i));uv.setXY(i,(xx>yy&&xx>zz?p.getZ(i):p.getX(i))/2,(yy>xx&&yy>zz?p.getZ(i):p.getY(i))/2);}
  parts.get(mesh.material).push(g);root.remove(mesh);
 }
 for(const [material,pieces]of parts){const mesh=new THREE.Mesh(mergeIndexedGeometries(pieces),material);mesh.name='keeper-gate-panel';root.add(mesh);pieces.forEach(g=>g.dispose());}

 // Guides anchor in the existing side walls. Their open center receives the
 // blade; a solid header across this slot would reproduce the old clipping.
 for(const side of [-1,1]){
  const x=GATE.x+side*(GATE.width/2+.035);
  box('iron',x,3.25,-GATE.y,.16,6.5,.62);
  for(const face of [-1,1]){
   box('steel',x-side*.07,1.65,-GATE.y+face*.22,.12,3.3,.1);
   box('brass',x-side*.075,.1,-GATE.y+face*.22,.15,.2,.16);
   // Polished guide tracks, compressed seals and substantial bearing seats.
   box('machineSteel',x-side*.055,3.2,-GATE.y+face*.165,.08,6.25,.018);
   box('rubber',x-side*.04,3.2,-GATE.y+face*.135,.04,6.25,.025);
   for(const height of [.7,2.45,4.25,5.85]){
    // External bearing covers sit on the face of each guide, where the player
    // can see them. The rollers themselves are enclosed beside the rail.
    const bearingX=GATE.x+side*4.86;
    box('machineIron',bearingX+side*.025,height,-GATE.y+face*.23,.035,.32,.24);
    const cover=new THREE.CylinderGeometry(.105,.105,.035,20);
    put(cover,'machineSteel',bearingX,height,-GATE.y+face*.23,1,1,1,0,0,Math.PI/2);cover.dispose();
    put(cyl,'brass',bearingX-side*.022,height,-GATE.y+face*.23,.028,.014,.028,0,0,Math.PI/2);
   }
  }
  for(const height of [.28,1.65,3.05,4.5,6.2])for(const face of [-1,1])put(cyl,'machineSteel',x,height,-GATE.y+face*.33,.037,.025,.037,Math.PI/2);
  box('machineRust',x,.045,-GATE.y,.18,.09,.61);
 }
 // Enclosed pocket, roof cap and split lower header. It is visible from the
 // open range and conceals raised machinery above the keeper-room ceiling.
 for(const face of [-1,1]){
  box('iron',GATE.x,4.95,-GATE.y+face*.27,GATE.width+.16,3.1,.12);
  box('steel',GATE.x,3.4,-GATE.y+face*.27,GATE.width+.28,.18,.15);
  box('brass',GATE.x,3.34,-GATE.y+face*.28,GATE.width,.045,.15);
  for(const x of [-3.5,0,3.5])box('steel',GATE.x+x,4.95,-GATE.y+face*.34,.08,3.1,.035);
 }
 box('iron',GATE.x,6.56,-GATE.y,GATE.width+.32,.12,.66);
 // Two lifting cables follow the same authoritative travel as the gate.
 const anchor=6.42,cables=[-3.5,3.5].map(x=>put(cyl,'steel',x,0,0,.018,1,.018,0,0,0,root));
 // The release has a visible wall/ceiling conduit into the hoist enclosure.
 const conduitX=SLUICE.x+.2,conduitStart=SLUICE.y+.22;
 box('iron',conduitX,2.64,-conduitStart,.035,2.34,.035);
 const conduitEnd=GATE.y-GATE_ROOF_SLOT.d/2+.02;
 box('iron',conduitX,3.81,-(conduitStart+conduitEnd)/2,.035,.035,conduitEnd-conduitStart);
 for(const y of [conduitStart,(conduitStart+GATE.y)/2])box('steel',conduitX,4,-y,.045,.34,.045);

 function update(fraction){
  const lift=gateClearance(fraction);root.position.y=lift;
  for(const cable of cables){const length=anchor-lift-2.8;cable.position.y=2.8+length/2;cable.scale.y=length;}
 }
 update(0);
 return {root,update,stats:()=>({lift:root.position.y,pocket:GATE_ROOF_SLOT,cables:cables.map(c=>({bottom:root.position.y+c.position.y-c.scale.y/2,top:root.position.y+c.position.y+c.scale.y/2})),panelDraws:parts.size,detail:{guideRollerHousings:16,seals:4,recessedBolts:true}})};
}
