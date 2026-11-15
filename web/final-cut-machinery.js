import * as THREE from './vendor/three/three.module.js';
import {RIG_BANK,RIG_WHEELS} from './final-cut-rig.js';
import {collapsePose} from './final-cut-ending.js';

// Indexed, colored mechanical geometry. All faces stay within the existing
// authoritative cylindrical reel envelope, including the fixed bearings.
function builder(){
 const positions=[],colors=[],indices=[];
 function quad(a,b,c,d,color){const n=positions.length/3;for(const p of [a,b,c,d]){positions.push(...p);colors.push(...color);}indices.push(n,n+1,n+2,n,n+2,n+3);}
 function append(g,color){const p=g.attributes.position,n=positions.length/3;for(let i=0;i<p.count;i++){positions.push(p.getX(i),p.getY(i),p.getZ(i));colors.push(...color);}for(const i of g.index.array)indices.push(n+i);g.dispose();}
 function finish(){const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));g.setAttribute('color',new THREE.Float32BufferAttribute(colors,3));g.setIndex(indices);g.computeVertexNormals();g.computeBoundingSphere();return g;}
 return {quad,append,finish};
}
const steel=[.31,.40,.38],edge=[.62,.69,.62],dark=[.055,.09,.075],paint=[.025,.17,.12],brass=[.45,.32,.11];
const point=(x,r,a)=>[x,Math.cos(a)*r,Math.sin(a)*r];
function cylinder(b,r,length,x,color){const g=new THREE.CylinderGeometry(r,r,length,12);g.rotateZ(Math.PI/2);g.translate(x,0,0);b.append(g,color);}
function block(b,x,y,z,w,h,d,color){const g=new THREE.BoxGeometry(w,h,d);g.translate(x,y,z);b.append(g,color);}
function arc(b,x0,x1,r0,r1,a0,a1,steps,color){
 for(let i=0;i<steps;i++){
  const a=a0+(a1-a0)*i/steps,c=a0+(a1-a0)*(i+1)/steps;
  b.quad(point(x0,r1,a),point(x1,r1,a),point(x1,r1,c),point(x0,r1,c),color);
  b.quad(point(x0,r0,c),point(x1,r0,c),point(x1,r0,a),point(x0,r0,a),color);
  for(const x of [x0,x1])b.quad(point(x,r0,a),point(x,r1,a),point(x,r1,c),point(x,r0,c),color);
 }
 for(const a of [a0,a1])b.quad(point(x0,r0,a),point(x1,r0,a),point(x1,r1,a),point(x0,r1,a),color);
}
function rotorGeometry(length){
 const b=builder(),half=length/2;
 cylinder(b,.055,length,0,steel);
 for(const x of [-half+.13,0,half-.13]){
  cylinder(b,.11,.08,x,dark);
  for(let k=0;k<3;k++){
   const a=k*Math.PI*2/3,g=new THREE.BoxGeometry(.055,.46,.035);g.rotateX(a);g.translate(x,0,0);b.append(g,steel);
  }
 }
 // Six solid twisted ribbons: their cutting edges describe a cylinder, but
 // the spaces between them expose the shaft, spiders and fixed bedknife.
 for(let blade=0;blade<6;blade++)for(let i=0;i<18;i++){
  const cross=t=>{const x=-half+.08+(length-.16)*t,a=blade*Math.PI/3+t*1.25;return [point(x,.235,a-.025),point(x,.296,a-.025),point(x,.296,a+.025),point(x,.235,a+.025)];};
  const a=cross(i/18),c=cross((i+1)/18);
  for(let k=0;k<4;k++)b.quad(a[k],c[k],c[(k+1)%4],a[(k+1)%4],k===1?edge:steel);
  if(i===0)b.quad(...a,steel);if(i===17)b.quad(...c,steel);
 }
 return b.finish();
}
function statorGeometry(length){
 const b=builder(),half=length/2,r=.32;
 // Upper shield, open below/front. The end bearings do not rotate with the
 // blades, and the narrow fixed knife meets their bottom-front sweep.
 arc(b,-half,half,r-.016,r,-.55,Math.PI/2,10,paint);
 for(const side of [-1,1]){
  const x=side*(half-.035);arc(b,x-.025,x+.025,.07,.305,0,Math.PI*2,12,dark);
  cylinder(b,.09,.055,x,brass);
  for(let k=0;k<6;k++){const a=k*Math.PI/3;block(b,x,Math.cos(a)*.22,Math.sin(a)*.22,.06,.026,.026,steel);}
 }
 arc(b,-half+.05,half-.05,.299,.317,-2.81,-2.62,2,edge);
 return b.finish();
}
export function machineryPose(r,reduced=false){
 const c=collapsePose(r.ending.age,reduced);
 return {wheel:r.won?r.ending.wheelBase-c.wheelSpin:-r.rig.distance/RIG_WHEELS[0].radius,
  wheels:RIG_WHEELS.map((w,k)=>r.won?(r.ending.wheelBases?.[k]??r.ending.wheelBase)-c.wheelSpin:-(r.rig.wheelTravel?.[k]??r.rig.distance)/w.radius),
  reel:r.won?r.ending.reelBase-c.reelSpin:r.rig.reelAngle||0,
  driven:!r.won&&r.rig.phase==='pass',stopped:r.won&&c.shutdown};
}
export function createFinalCutMachinery(audit){
 const material=new THREE.MeshLambertMaterial({vertexColors:true,side:THREE.DoubleSide}),cache=new Map(),reels=[];
 function addReel(id,parent,x,y,z,length){
  if(!cache.has(length)){const scale=RIG_BANK.reelRadius/.32;cache.set(length,{rotor:rotorGeometry(length).scale(1,scale,scale),stator:statorGeometry(length).scale(1,scale,scale)});}
  const geometry=cache.get(length),rotor=new THREE.Mesh(geometry.rotor,material),stator=new THREE.Mesh(geometry.stator,material);
  for(const mesh of [rotor,stator]){mesh.position.set(x,y,z);parent.add(mesh);audit(id,mesh);mesh.userData.dynamic=true;}
  reels.push({id,rotor,stator});return rotor;
 }
 return {addReel,stats(){return {reels:reels.map(({id,rotor,stator})=>({id,angle:rotor.rotation.x,bearingAngle:stator.rotation.x})),bladesPerReel:6,geometries:cache.size*2,triangles:[...cache.values()].reduce((n,g)=>n+(g.rotor.index.count+g.stator.index.count)/3,0),materials:1};},dispose(){material.dispose();}};
}
