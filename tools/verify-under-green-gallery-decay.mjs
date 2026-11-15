import assert from 'node:assert/strict';
import fs from 'node:fs';
import * as THREE from '../web/vendor/three/three.module.js';
import {buildGalleryDecay,paintGalleryRunoff,GALLERY_RUNOFF_FANS} from '../web/under-green-gallery-decay.js';
import {floorLayout,onFloor} from '../web/under-green-course.js';
import {roofPanels} from '../web/under-green-overhead.js';

const meshes=[],stats=buildGalleryDecay({put(g,type,x,y,z,sx=1,sy=1,sz=1,rx=0,ry=0,rz=0){
 const o=new THREE.Object3D();o.position.set(x,y,z);o.scale.set(sx,sy,sz);o.rotation.set(rx,ry,rz);o.updateMatrix();meshes.push({type,g:g.clone().applyMatrix4(o.matrix)});
}}),roof=roofPanels(floorLayout().tiles);
let vertices=0,triangles=0,closedBodies=0;const bounds=new THREE.Box3();
for(const {type,g}of meshes){
 const p=g.attributes.position,n=g.attributes.normal,ix=g.index,count=ix?.count||p.count;
 vertices+=p.count;triangles+=count/3;g.computeBoundingBox();bounds.union(g.boundingBox);
 const overhead=g.boundingBox.min.y>4;
 for(let i=0;i<p.count;i++){
  const x=p.getX(i),h=p.getY(i),y=-p.getZ(i);assert([x,h,y].every(Number.isFinite));
  assert(x>2.2&&x<5.01&&y>9.1&&y<13.8);
  if(overhead){assert(h>4.10&&h<4.18);assert(roof.some(r=>x>=r.x-r.w/2&&x<=r.x+r.w/2&&y>=r.y-r.d/2&&y<=r.y+r.d/2),'Roof finish lacks opaque backing');}
  else {assert(h>=-.00301&&h<.02);assert(x>4.74,'Fallen fragment enters the walking lane');assert(onFloor(x,y),'Fragment lacks a floor');}
  if(type==='rootStone')assert(n.getY(i)<-.999,'Masonry bed must face downward');
 }
 if(type==='ceiling'){
  const edges=new Map();let volume=0;
  const index=i=>ix?ix.getX(i):i,key=i=>[p.getX(i),p.getY(i),p.getZ(i)].map(v=>v.toFixed(5)).join(',');
  for(let t=0;t<count;t+=3){const ids=[index(t),index(t+1),index(t+2)],a=new THREE.Vector3().fromBufferAttribute(p,ids[0]),b=new THREE.Vector3().fromBufferAttribute(p,ids[1]),c=new THREE.Vector3().fromBufferAttribute(p,ids[2]);
   if(b.clone().sub(a).cross(c.clone().sub(a)).length()<1e-10)continue;
   for(let i=0;i<3;i++){const k=[key(ids[i]),key(ids[(i+1)%3])].sort().join('|');edges.set(k,(edges.get(k)||0)+1);}volume+=a.dot(b.cross(c))/6;
  }
  assert([...edges.values()].every(v=>v===2),'Open plaster body');assert(volume>0,'Inward plaster body');closedBodies++;
 }
 g.dispose();
}
const masks=[],runoff=paintGalleryRunoff((layer,points,strength)=>masks.push({layer,points,strength}));
assert.equal(masks.length,10);assert.equal(runoff.fans.length,2);
for(const {layer,points,strength}of masks){assert([0,2].includes(layer));assert(strength>0&&strength<=255);for(const [i,[x,y]]of points.entries()){
 assert(onFloor(x,y));assert((x>2.2&&x<5&&y>9.1&&y<14.4)||(x> -3.8&&x<-.3&&y>13&&y<17.7));
 const next=points[(i+1)%points.length];for(let t=0;t<=1;t+=.05)assert(onFloor(x+(next[0]-x)*t,y+(next[1]-y)*t),'Runoff crosses the narrowing outside the floor');
}}
assert.equal(stats.triangles,triangles);assert.equal(stats.plasterFragments,12);assert.equal(closedBodies,13);
const report={passed:true,vertices,triangles,closedBodies,bounds:{min:bounds.min.toArray(),max:bounds.max.toArray()},stats,runoff};
fs.mkdirSync('output/under-green/visual-pass70',{recursive:true});fs.writeFileSync('output/under-green/visual-pass70/geometry.json',JSON.stringify(report,null,2));console.log(JSON.stringify(report));
