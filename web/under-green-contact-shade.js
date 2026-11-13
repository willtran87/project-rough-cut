import * as THREE from './vendor/three/three.module.js';
import {onFloor,OBSTACLES} from './under-green-course.js';
import {keeperWallPieces} from './under-green-keeper-layout.js';
import {mergeIndexedGeometries} from './indexed-geometry.js';

// Small surface-bound occlusion masks, not projected actor shadows. Alpha is
// carried by vertices: no textures, screen-space halos or light shader work.
export function featheredContactGeometry(segments=24){
 const positions=[0,0,0],colors=[1,1,1,1],indices=[];
 const rings=[[.38,.72],[.72,.22],[1,0]];
 for(const [radius,alpha]of rings)for(let i=0;i<segments;i++){
  const a=i/segments*Math.PI*2;positions.push(Math.cos(a)*radius,Math.sin(a)*radius,0);colors.push(1,1,1,alpha);
 }
 for(let i=0;i<segments;i++){const j=(i+1)%segments;indices.push(0,1+i,1+j);}
 for(let ring=0;ring<2;ring++)for(let i=0;i<segments;i++){const a=1+ring*segments+i,b=1+ring*segments+(i+1)%segments,c=a+segments,d=b+segments;indices.push(a,c,b,b,c,d);}
 const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));g.setAttribute('color',new THREE.Float32BufferAttribute(colors,4));g.setIndex(indices);g.computeVertexNormals();return g;
}
export function contactShadeMaterial(opacity=.35){return new THREE.MeshBasicMaterial({color:0x000000,vertexColors:true,transparent:true,opacity,depthWrite:false,side:THREE.DoubleSide,forceSinglePass:true});}

export function createDrainContactShade({scene,layout}){
 const floorParts=[],rootPositions=[],rootColors=[],rootIndices=[],receivers=new Map();let wallSeams=0,rootStrips=0,rejectedRootQuads=0,machineContacts=0,meshes=[];
 const key=(vertical,boundary)=>`${vertical}:${boundary.toFixed(3)}`;
 for(const w of layout.walls){
  const vertical=w.w<w.d,boundary=vertical?w.x:w.y,k=key(vertical,boundary),side=vertical?(onFloor(w.x+.3,w.y)?1:-1):(onFloor(w.x,w.y+.3)?1:-1);
  if(!receivers.has(k))receivers.set(k,[]);
  for(const p of keeperWallPieces(w,w.covered?4.2:1.8))receivers.get(k).push({lo:(vertical?p.y:p.x)-(vertical?p.d:p.w)/2,hi:(vertical?p.y:p.x)+(vertical?p.d:p.w)/2,bottom:p.base,top:p.base+p.height});
  // A narrow soft seam lies on the floor inside the real wall face. Most of
  // the strongest part is naturally covered by the physical mud bank.
  const along=vertical?w.y:w.x,length=vertical?w.d:w.w,positions=[],colors=[],indices=[];
  for(const end of [-1,1])for(const [offset,alpha]of [[.112,.52],[.18,.24],[.31,0]]){
   const t=along+end*length/2;positions.push(vertical?boundary+side*offset:t,.003,-(vertical?t:boundary+side*offset));colors.push(1,1,1,alpha);
  }
  indices.push(0,3,1,1,3,4,1,4,2,2,4,5);const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));g.setAttribute('color',new THREE.Float32BufferAttribute(colors,4));g.setIndex(indices);g.computeVertexNormals();floorParts.push(g);wallSeams++;
 }
 function floorContact(x,y,width,depth,opacity=.8){
  const g=featheredContactGeometry();g.scale(width/2,depth/2,1);g.rotateX(-Math.PI/2);g.translate(x,.004,-y);
  const c=g.attributes.color;for(let i=0;i<c.count;i++)c.setW(i,c.getW(i)*opacity);floorParts.push(g);machineContacts++;
 }
 // Machine skids, cabinet feet and the actual root-pillar footprint.
 const pump=OBSTACLES.find(o=>o.id==='pump-machine');for(const side of [-1,1])floorContact(pump.x+side*.71,pump.y,.48,3.08,.9);
 for(const id of ['pump-control','record-stand','sluice-console','root-pillar','bunker-buttress','pump-buttress','range-island']){
  const o=OBSTACLES.find(v=>v.id===id);floorContact(o.x,o.y,o.w+.28,o.d+.28,id==='root-pillar'?.7:.85);
 }
 function root(curve,radius,wall,{taper=.83,widthAt=null}={}){
  if(!wall||radius<.035||!Number.isFinite(wall.boundary)||!wall.side)return;
  const surfaces=receivers.get(key(wall.vertical,wall.boundary));if(!surfaces)return;
  const steps=Math.max(6,Math.min(48,Math.ceil(curve.getLength()/.18))),rows=[];
  const projected=(point)=>new THREE.Vector2(wall.vertical?-point.z:point.x,point.y);
  for(let i=0;i<=steps;i++){
   const t=i/steps,p=projected(curve.getPointAt(t)),tangent=projected(curve.getPointAt(Math.min(1,t+.003))).sub(projected(curve.getPointAt(Math.max(0,t-.003)))).normalize(),normal=new THREE.Vector2(-tangent.y,tangent.x);
   const knot=Math.exp(-(((t-.32)/.09)**2))*.16+Math.exp(-(((t-.71)/.065)**2))*.10,width=(widthAt?widthAt(t):radius*(1-t*taper)*(.84+knot+Math.sin(t*19+radius*50)*.06))*1.13;
   rows.push([-1,-.63,0,.63,1].map((n,j)=>{const q=p.clone().addScaledVector(normal,n*width);return {along:q.x,height:q.y,alpha:[0,.22,.34,.22,0][j]*Math.min(1,t*24,(1-t)*24)};}));
  }
  const supported=p=>surfaces.some(s=>p.along>=s.lo&&p.along<=s.hi&&p.height>=s.bottom+.003&&p.height<=s.top-.003);
  for(let i=0;i<steps;i++)for(let j=0;j<4;j++){
   const quad=[rows[i][j],rows[i+1][j],rows[i][j+1],rows[i+1][j+1]];
   if(!quad.every(supported)){rejectedRootQuads++;continue;}
   const start=rootPositions.length/3,face=wall.boundary+wall.side*.1115;
   for(const p of quad){rootPositions.push(wall.vertical?face:p.along,p.height,-(wall.vertical?p.along:face));rootColors.push(1,1,1,p.alpha);}
   rootIndices.push(start,start+1,start+2,start+2,start+1,start+3);
  }
  rootStrips++;
 }
 function finish(){
  const ground=mergeIndexedGeometries(floorParts);floorParts.forEach(g=>g.dispose());floorParts.length=0;
  const roots=new THREE.BufferGeometry();roots.setAttribute('position',new THREE.Float32BufferAttribute(rootPositions,3));roots.setAttribute('color',new THREE.Float32BufferAttribute(rootColors,4));roots.setIndex(rootIndices);roots.computeVertexNormals();
  meshes=[ground,roots].map((g,i)=>{const m=new THREE.Mesh(g,contactShadeMaterial(i?.9:.65));m.name=i?'Root masonry contact shade':'Wall and machinery contact shade';m.renderOrder=-3;scene.add(m);return m;});
  rootPositions.length=rootColors.length=rootIndices.length=0;receivers.clear();
 }
 return {root,finish,setEnabled(value){meshes.forEach(m=>m.visible=!!value);},stats:()=>({wallSeams,rootStrips,rejectedRootQuads,machineContacts,draws:meshes.length,triangles:meshes.reduce((n,m)=>n+m.geometry.index.count/3,0),worldAnchored:true}),dispose(){meshes.forEach(m=>{m.removeFromParent();m.geometry.dispose();m.material.dispose();});meshes=[];}};
}
