import * as THREE from './vendor/three/three.module.js';
import { exitCueState } from './objective-cues.js?v=20261108-clue-refinement';
import { practiceStatus } from './station-feedback.js';
import {stationFacing} from './station-facing.js';

// Small physical details, all opaque and depth tested. One batch, no texture,
// point light, transparency, timer or navigation/AI input. Only state changes
// upload colors/positions; ordinary frames do no geometry work.
export function createEnvironmentGuidance(parent,data,{scale,xScale}){
 const positions=[],colors=[],pieces=[],unit=new THREE.BoxGeometry(1,1,1).toNonIndexed(),tint=new THREE.Color();
 function box(x,y,z,w,h,d,hex,role='scenery'){
  const start=positions.length/3;tint.setHex(hex);
  for(let i=0;i<unit.attributes.position.count;i++){
   const p=unit.attributes.position,n=unit.attributes.normal,shade=n.getY(i)>.5?1:n.getZ(i)>.5?.83:.61;
   positions.push(x+p.getX(i)*w,y+p.getY(i)*h,z+p.getZ(i)*d);colors.push(tint.r*shade,tint.g*shade,tint.b*shade);
  }
  pieces.push({start,end:positions.length/3,role});
 }
 function scuff(x,z,w,d,hex,seed){
  const start=positions.length/3;tint.setHex(hex);
  for(let i=0;i<7;i++){
   const shade=.92+(i%3)*.025;
   for(const j of [-1,i+1,i]){
    const a=j/7*Math.PI*2,r=.72+.23*Math.sin((j%7+seed)*3.7);
    positions.push(x+(j<0?0:Math.cos(a)*w*r),.033,z+(j<0?0:Math.sin(a)*d*r));colors.push(tint.r*shade,tint.g*shade,tint.b*shade);
   }
  }
  pieces.push({start,end:positions.length/3,role:'scenery'});
 }
 // Irregular scuffed stone and exposed earth connect the final few steps to
 // the actual objects. They stop short of paths and are never arrow shaped.
 for(const [index,a] of [...data.actions,data.key,data.valve,data.shed,data.drain].entries()){
  const x=a.x*xScale,z=-a.y*scale,angle=index<5?stationFacing(a):0,sn=Math.sin(angle),cs=Math.cos(angle);
  for(let i=0;i<9;i++){
   const reach=.8+i*.27,jitter=Math.sin(i*4.7+index)*.36;
   scuff(x+reach*sn+jitter*cs,z+reach*cs-jitter*sn,.08+(i%3)*.03,.13+(i%2)*.03,index===2?0x625b49:0x292f26,i+index);
  }
 }
 // Dropped forms belong to the paperwork stations. Place two small clusters
 // on each existing approach, following bends rather than a line through cover.
 // Folded silhouettes and tiny ruled ink reuse this single opaque batch.
 const paperClues=[];
 function paper(x,z,angle,seed){
  const start=positions.length,cs=Math.cos(angle),sn=Math.sin(angle);
  const corners=[[-.13,.038,-.18],[.10,.038,-.18],[.13,.065,.09],[.06,.087,.18],[-.13,.038,.15]];
  for(let i=1;i<4;i++)for(const n of [0,i+1,i]){
   const [px,py,pz]=corners[n];positions.push(x+px*cs+pz*sn,py,z+pz*cs-px*sn);
   tint.setHex(i===3?0x6b6c53:0x8d8970);colors.push(tint.r,tint.g,tint.b);
  }
  // Four broken ink rules; they sit on the flat end of the sheet.
  for(let i=0;i<4;i++){
   const from=positions.length;
   box(x-.015,.043+i*.0025,z-.14+i*.025,.11+(i%2)*.025,.003,.004,0x444e42);
   for(let j=from;j<positions.length;j+=3){const px=positions[j]-x,pz=positions[j+2]-z;positions[j]=x+px*cs+pz*sn;positions[j+2]=z+pz*cs-px*sn;}
  }
  paperClues.push({x,z,route:seed,vertices:(positions.length-start)/3});
 }
 for(const route of [5,6,8,9]){
  const path=data.paths[route];if(!path)continue;
  const points=path.map(p=>({x:p.x*xScale,z:-p.y*scale})),segments=[];let length=0;
  for(let i=1;i<points.length;i++){const a=points[i-1],b=points[i],n=Math.hypot(b.x-a.x,b.z-a.z);if(n){segments.push({a,b,n,start:length});length+=n;}}
  for(const distance of [Math.min(2.6,length*.2),Math.max(3.4,length-2.4)]){
   const segment=segments.find(s=>distance<=s.start+s.n);if(!segment)continue;
   const {a,b,n,start}=segment,t=(distance-start)/n,nx=(b.z-a.z)/n,nz=-(b.x-a.x)/n;
   // Within the existing walking surface, not beyond an obstacle edge.
   const x=a.x+(b.x-a.x)*t+nx*.42,z=a.z+(b.z-a.z)*t+nz*.42;
   if(paperClues.every(p=>Math.hypot(p.x-x,p.z-z)>.8))paper(x,z,route*.47+distance,route);
  }
 }
 const sx=data.shed.x*xScale,sz=-data.shed.y*scale;
 // Light leaks through the existing door sill, not through walls. The small
 // filing-box lens changes amber -> pale green; a bolt also slides clear so
 // readiness is readable without relying exclusively on color.
 box(sx,.105,sz+1.46,1.53,.035,.018,0x8e7044,'shed-light');
 box(sx+1.48,1.43,sz+1.53,.10,.065,.025,0x8d693c,'shed-lens');
 box(sx+1.48,.99,sz+1.54,.36,.09,.025,0x26372f);
 box(sx+1.43,.99,sz+1.56,.17,.035,.035,0x6e6c53,'shed-bolt');
 const dx=data.drain.x*xScale,dz=-data.drain.y*scale-.6;
 box(dx+1.37,.89,dz+.29,.14,.075,.025,0x8d693c,'drain-lens');
 box(dx+1.37,.68,dz+.29,.36,.09,.025,0x26372f);
 box(dx+1.32,.68,dz+.32,.17,.035,.04,0x6e6c53,'drain-bolt');
 // Cool broken reflections among the damp stones below the real lifting grate.
 for(let i=0;i<17;i++)box(dx+Math.sin(i*2.7)*(.28+i*.018),.135,dz+.24+i*.13,.05+(i%3)*.04,.009,.035, i%4?0x344b49:0x667a70);
 // A chalk landing circle belongs to the golf lesson even with signs disabled.
 // Worn, muted segments preserve its actual gameplay radius, then fade when done.
 const px=data.practice.x*xScale,pz=-data.practice.y*scale,r=data.practice.radius*scale;
 for(let i=0;i<48;i++){const a=i*Math.PI/24;box(px+Math.cos(a)*r,.034,pz+Math.sin(a)*r,.07,.012,.07,i%4?0x7f8169:0x626a55,'practice');}
 unit.dispose();const geometry=new THREE.BufferGeometry();
 geometry.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));geometry.setAttribute('color',new THREE.Float32BufferAttribute(colors,3));geometry.computeBoundingSphere();
 const mesh=new THREE.Mesh(geometry,new THREE.MeshBasicMaterial({vertexColors:true}));mesh.name='EnvironmentalGuidance';parent.add(mesh);
 let signature='',updates=0,exits=[],practice='ready';
 function update(frame){
  const nextPractice=practiceStatus(frame),key=[(frame.completed||[]).join(','),!!frame.hasKey,!!frame.valveOpen,!!frame.exitFiling,!!frame.sealing,frame.exitRoute,nextPractice].join(':');
  if(key===signature)return;signature=key;updates++;exits=exitCueState(frame);practice=nextPractice;
  for(const p of pieces){
   const exit=exits.find(e=>p.role.startsWith(e.route));
   if(!exit&&p.role!=='practice')continue;
   const hex=p.role==='practice'?(practice==='ready'?0x7f8169:0x3a4436):p.role.endsWith('light')?(exit.ready?0xbc995a:0x8e7044):p.role.endsWith('lens')?(exit.ready?0x96a87e:0x8d693c):0x6e6c53;
   tint.setHex(hex);
   for(let i=p.start;i<p.end;i++){
    geometry.attributes.color.setXYZ(i,tint.r,tint.g,tint.b);
    if(p.role.endsWith('bolt'))geometry.attributes.position.setX(i,positions[i*3]+(exit.ready?.18:0));
   }
  }
  geometry.attributes.color.needsUpdate=true;geometry.attributes.position.needsUpdate=true;
 }
 update({completed:[]});
 return {update,stats:()=>({batches:1,triangles:positions.length/9,paperClues,updates,exits,practice,depthTest:mesh.material.depthTest,depthWrite:mesh.material.depthWrite})};
}
