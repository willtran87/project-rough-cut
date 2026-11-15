import * as THREE from './vendor/three/three.module.js';
import {mergeGeometries} from './vendor/three/addons/utils/BufferGeometryUtils.js';
import {createMachineFinishMaterial,tagMachineSurface} from './final-cut-machine-finish.js';

// Service openings expose real depth. All static and rotating parts stay
// inside the unchanged frame, radiator and power-unit contact envelopes.
export function createFinalCutEngine(body,audit){
 const material=createMachineFinishMaterial(),meshes=[],fans=[],geometry=[];
 function build(parent,id){const parts=[];
  function add(g,kind,x,y,z,rx=0,ry=0,rz=0){if(!g.index)g.setIndex(Array.from({length:g.attributes.position.count},(_,i)=>i));g.rotateX(rx);g.rotateY(ry);g.rotateZ(rz);g.translate(x,y,z);tagMachineSurface(g,kind,.41);parts.push(g);}
  const box=(kind,x,y,z,w,h,d)=>add(new THREE.BoxGeometry(w,h,d),kind,x,y,z);
  const cylinder=(kind,x,y,z,r,length,axis='y')=>add(new THREE.CylinderGeometry(r,r,length,16),kind,x,y,z,axis==='z'?Math.PI/2:0,0,axis==='x'?Math.PI/2:0);
  const ring=(kind,x,y,z,r,tube,axis='z')=>add(new THREE.TorusGeometry(r,tube,4,24),kind,x,y,z,axis==='y'?Math.PI/2:0,axis==='x'?Math.PI/2:0,0);
  function finish(){const g=mergeGeometries(parts,false);parts.forEach(p=>p.dispose());g.computeBoundingSphere();const mesh=new THREE.Mesh(g,material);mesh.name=`FinaleEngine-${id}`;parent.add(mesh);audit(id,mesh);meshes.push(mesh);geometry.push(g);return mesh;}
  return {box,cylinder,ring,add,finish};
 }
 function frame(){const b=build(body,'frame');
  for(const s of [-1,1]){
   b.box(4,s*1.16,.80,0,.08,.32,4.9);for(const y of [.65,.95])b.box(1,s*1.10,y,0,.24,.035,4.9);
   for(const z of [-2.2,-1.55,0,1.6,2.2]){b.box(1,s*1.06,1.02,z,.26,.12,.20);for(const dz of [-.06,.06])b.cylinder(5,s*1.06,1.095,z+dz,.024,.025);}
  }
  for(const z of [-2.2,0,2.2])b.box(4,0,.78,z,2.6,.22,.18);
  for(const z of [-1.55,2.05]){b.cylinder(1,0,.82,z,.095,2.6,'x');b.add(new THREE.IcosahedronGeometry(.25,1),4,0,.82,z);for(const x of [-.28,.28])b.cylinder(1,x,.82,z,.15,.055,'x');}
  b.box(4,0,.79,1.38,.72,.55,.79);for(let k=0;k<6;k++)b.box(1,0,.58+k*.08,1.39,.76,.022,.82);
  b.cylinder(1,0,.79,-.1,.062,2.25,'z');for(const z of [-1.15,.95]){b.cylinder(4,0,.79,z,.13,.13,'z');for(const x of [-.085,.085])b.box(1,x,.79,z,.038,.20,.06);}
  // Paired coolant runs join the front tanks to the rear power unit,
  // inside the channel rails and below the supported cab floor.
  for(const s of [-1,1]){b.cylinder(4,s*.87,.98,-.4,.045,3.18,'z');for(const z of [-1.78,-.75,.25,1.1])b.cylinder(1,s*.87,.98,z,.059,.045,'z');}
  b.finish();
 }
 function radiator(){const b=build(body,'radiator');
  // Perimeter tanks and a deeply recessed core leave the front fans visible.
  for(const x of [-1.49,1.49])b.box(1,x,1.28,-2.25,.20,1.14,.68);
  for(const y of [.765,1.795])b.box(0,0,y,-2.25,2.8,.11,.70);
  b.box(4,0,1.28,-1.94,2.78,.9,.08);
  for(let k=0;k<39;k++)b.box(1,-1.33+k*.07,1.28,-2.015,.018,.86,.06);
  for(const y of [.99,1.28,1.57])b.box(5,0,y,-2.05,2.72,.024,.025);
  for(const x of [-.72,.72]){b.ring(4,x,1.28,-2.43,.425,.025);b.ring(1,x,1.28,-2.40,.405,.012);for(const s of [-1,1])b.box(1,x+s*.35,1.28,-2.31,.055,.65,.08);}
  for(const x of [-1.49,1.49])for(const y of [.83,1.73])b.cylinder(5,x,y,-2.595,.025,.01,'z');
  for(const s of [-1,1])b.cylinder(4,s*.87,1.11,-1.97,.04,.40);
  b.finish();
  for(const x of [-.72,.72]){const root=new THREE.Group();root.position.set(x,1.28,-2.43);body.add(root);const f=build(root,'radiator');f.cylinder(1,0,0,0,.115,.11,'z');
   for(let k=0;k<7;k++){const a=k*Math.PI*2/7;f.add(new THREE.BoxGeometry(.13,.29,.035),k%2?1:4,Math.sin(a)*.245,Math.cos(a)*.245,0,0,.22,-a+.18);}
   f.finish();fans.push(root);
  }
 }
 const p=build(body,'power-unit');
 p.box(4,0,1.46,1.72,2.42,.63,1.12);p.box(1,0,1.83,1.72,2.45,.12,1.10);
 for(const s of [-1,1]){
  for(const z of [1.6,2.2])p.box(1,s*.92,1.07,z,.16,.24,.20);
  p.cylinder(4,s*.87,1.15,1.16,.045,.40);
  for(let k=0;k<4;k++){
   const z=1.28+k*.29;p.box(1,s*1.26,1.50,z,.16,.48,.23);p.box(0,s*1.36,1.72,z,.08,.13,.25);
   for(const y of [1.32,1.40,1.48,1.56])p.box(4,s*1.355,y,z,.045,.024,.25);
   p.cylinder(5,s*1.40,1.72,z,.024,.035,'x');
  }
  p.cylinder(4,s*1.26,1.12,1.85,.13,.28);p.ring(1,s*1.26,1.12,1.85,.135,.012,'y');
  p.cylinder(1,s*.83,1.95,1.75,.065,1.16,'z');
  p.cylinder(5,s*1.45,1.54,1.78,.038,1.02,'z');for(const z of [1.3,2.27])p.cylinder(1,s*1.45,1.54,z,.059,.045,'z');
 }
 // Rear heat exchanger sits behind the open grille, with separate tubes
 // and fins instead of a painted dark rectangle on the back of a box.
 p.box(4,0,1.47,2.32,2.83,.64,.13);for(let k=0;k<35;k++)p.box(1,-1.36+k*.08,1.47,2.405,.018,.61,.035);
 for(const y of [1.26,1.47,1.68])p.box(5,0,y,2.43,2.78,.022,.025);
 p.finish();
 return {meshes,fans,addPart(spec){if(spec.id==='frame'){frame();return true;}if(spec.id==='radiator'){radiator();return true;}return false;},update(r){fans.forEach((fan,i)=>fan.rotation.z=(i?1:-1)*(r.engine?.angle||0));},stats:()=>({meshes:meshes.length,fans:fans.length,triangles:geometry.reduce((n,g)=>n+g.index.count/3,0),materials:1,newTextures:0,fanAngles:fans.map(f=>f.rotation.z)}),dispose(){material.dispose();geometry.forEach(g=>g.dispose());}};
}
