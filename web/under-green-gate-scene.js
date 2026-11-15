import * as THREE from './vendor/three/three.module.js';
import {GATE,SLUICE,gateClearance} from './under-green-course.js';
import {mergeIndexedGeometries} from './indexed-geometry.js';
import {GATE_ROOF_SLOT} from './under-green-layout.js';

// Closed, low slumps, with a quiet centre and irregular deposited edge.
// UVs remain local to the gate so its dried deposits travel with the panel.
export function gateSedimentLump(width,depth,height,seed=0){
 const vertices=[0,height,0],indices=[],segments=12;
 for(let ring=1;ring<=3;ring++)for(let j=0;j<segments;j++){
  const r=ring/3,a=j/segments*Math.PI*2,edge=1+.12*Math.sin(j*2.3+seed)+.07*Math.cos(j*3.7-seed);
  vertices.push(Math.cos(a)*width*.5*r*edge,ring===3?0:height*Math.sqrt(1-r*r)*(1+.08*Math.sin(j+seed)),Math.sin(a)*depth*.5*r*edge);
 }
 const bottom=vertices.length/3;vertices.push(0,0,0);
 for(let j=0;j<segments;j++){
  const next=(j+1)%segments;indices.push(0,1+next,1+j);
  for(let r=0;r<2;r++){const a=1+r*segments+j,b=1+r*segments+next,c=a+segments,d=b+segments;indices.push(a,b,c,b,d,c);}
  indices.push(bottom,25+j,25+next);
 }
 const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(vertices,3));g.setIndex(indices);g.computeVertexNormals();
 g.setAttribute('uv',new THREE.Float32BufferAttribute(vertices.flatMap((_,i)=>i%3===0?[vertices[i]/2,vertices[i+2]/2]:[]),2));return g;
}

// The raised gate occupies a real pocket through the keeper-room roof.
// The opening changes overhead construction only, never walkable geometry.
export function createKeeperGate({scene,box,put,cyl,sediment,registerFixture=()=>{}}){
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
  const g=mesh.geometry.clone().applyMatrix4(mesh.matrix),p=g.attributes.position,n=g.attributes.normal,uv=g.attributes.uv,span=mesh.material.userData.drainUVMetres||2;
  for(let i=0;i<p.count;i++){const xx=Math.abs(n.getX(i)),yy=Math.abs(n.getY(i)),zz=Math.abs(n.getZ(i));uv.setXY(i,(xx>yy&&xx>zz?p.getZ(i):p.getX(i))/span,(yy>xx&&yy>zz?p.getZ(i):p.getY(i))/span);}
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
 const deposits={panel:0,guides:0};let sedimentMaterial=null;
 if(sediment){
  sedimentMaterial=new THREE.MeshPhongMaterial({map:sediment.map,specularMap:sediment.wet,color:0xa2977d,specular:0x4a5140,shininess:18});
  // Keep both pigment and wetness in the deposited surface's local UVs.
  // World-anchored wall staining would slide over the moving panel.
  const attach=(pieces,parent,name)=>{const geometry=mergeIndexedGeometries(pieces),mesh=new THREE.Mesh(geometry,sedimentMaterial);mesh.name=name;parent.add(mesh);pieces.forEach(g=>g.dispose());if(parent===scene)registerFixture(mesh);};
  const panel=[];
  for(const [i,x] of [-4.42,-4.24,-3.35,-1.62,-1.42,-1.19,.72,2.62,2.83,4.12].entries()){
   const g=gateSedimentLump(.17+i%3*.035,.095,.025+i%4*.007,i*.87);g.translate(x,.247,0);
   const uv=g.attributes.uv,p=g.attributes.position;for(let k=0;k<p.count;k++)uv.setXY(k,p.getX(k)/2,p.getZ(k)/2);panel.push(g);deposits.panel++;
  }
  attach(panel,root,'keeper-gate-sediment');
  const bases=[];
  for(const side of [-1,1])for(const [i,z]of [-.225,-.165,.225].entries()){
   // Embed the back edge in the wall, not the entire deposit in the old base.
   // Leave the gate's central travel channel clear; these slumps rest on floor.
   const g=gateSedimentLump(.135,.12,.057+i*.009,side*4+i);g.translate(GATE.x+side*(GATE.width/2-.15),.002,-GATE.y+z);
   const uv=g.attributes.uv,p=g.attributes.position;for(let k=0;k<p.count;k++)uv.setXY(k,p.getX(k)/2,p.getZ(k)/2);bases.push(g);deposits.guides++;
  }
  attach(bases,scene,'keeper-guide-sediment');
 }
 // Two lifting cables follow the same authoritative travel as the gate.
 const anchor=6.42,cables=[-3.5,3.5].map(x=>put(cyl,'steel',x,0,0,.018,1,.018,0,0,0,root));
 // The release has a visible wall/ceiling conduit into the hoist enclosure.
 const conduitX=SLUICE.x+.2,conduitSide=SLUICE.x+1.05,conduitStart=SLUICE.y+.22;
 const conduitEnd=GATE.y-GATE_ROOF_SLOT.d/2+.02;
 // Leave the console's connection intact, then route around the enamel plate.
 // The old straight riser crossed its lettering from the approach bank.
 // Rounded elbows form one continuous conduit, with the jog above headroom.
 const path=new THREE.CurvePath(),v=(x,h,y=conduitStart)=>new THREE.Vector3(x,h,-y);
 const line=(a,b)=>path.add(new THREE.LineCurve3(a,b));
 const bend=(a,b,c)=>path.add(new THREE.QuadraticBezierCurve3(a,b,c));
 line(v(conduitX,1.47),v(conduitX,2.34));
 bend(v(conduitX,2.34),v(conduitX,2.42),v(conduitX+.08,2.42));
 line(v(conduitX+.08,2.42),v(conduitSide-.08,2.42));
 bend(v(conduitSide-.08,2.42),v(conduitSide,2.42),v(conduitSide,2.50));
 line(v(conduitSide,2.50),v(conduitSide,3.73));
 bend(v(conduitSide,3.73),v(conduitSide,3.81),v(conduitSide,3.81,conduitStart+.08));
 line(v(conduitSide,3.81,conduitStart+.08),v(conduitSide,3.81,conduitEnd));
 const conduit=new THREE.TubeGeometry(path,64,.0175,8,false),uv=conduit.attributes.uv,length=path.getLength();
 for(let i=0;i<uv.count;i++)uv.setXY(i,uv.getX(i)*length/2,uv.getY(i)*Math.PI*.035/2);
 // Keep its static batch in the release's spatial cell, not the origin cell.
 conduit.translate(-conduitX,0,conduitStart);
 conduit.userData.preserveDrainUV=true;put(conduit,'iron',conduitX,0,-conduitStart);conduit.dispose();
 for(const y of [conduitStart,(conduitStart+GATE.y)/2])box('steel',conduitSide,4,-y,.045,.34,.045);

 function update(fraction){
  const lift=gateClearance(fraction);root.position.y=lift;
  for(const cable of cables){const length=anchor-lift-2.8;cable.position.y=2.8+length/2;cable.scale.y=length;}
 }
 update(0);
 return {root,update,dispose(){sedimentMaterial?.dispose();},stats:()=>({lift:root.position.y,pocket:GATE_ROOF_SLOT,cables:cables.map(c=>({bottom:root.position.y+c.position.y-c.scale.y/2,top:root.position.y+c.position.y+c.scale.y/2})),panelDraws:parts.size+(sedimentMaterial?1:0),detail:{guideRollerHousings:16,seals:4,recessedBolts:true,sediment:deposits,panelTextureMetres:[...parts.keys()].map(m=>m.userData.drainUVMetres||2)}})};
}
