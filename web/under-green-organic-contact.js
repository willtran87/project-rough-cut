import * as THREE from './vendor/three/three.module.js';
import {floorLayout} from './under-green-course.js';
import {buildDrainOrganicGeometry} from './under-green-organic-geometry.js';
import {drainRootGeometry} from './under-green-root-geometry.js';

// Physical roots and deposits come from the same authoring function as their
// artwork. A small spatial grid avoids searching the whole underground mesh
// for each point of a fast cut. No render objects or textures are retained.
const cell=.4,buckets=new Map(),point=new THREE.Vector3(),closest=new THREE.Vector3(),dummy=new THREE.Object3D();
const vertices=[],kinds=[],kindNames=['root','soil','masonry'],triangle=new THREE.Triangle();
let triangles=0;
const key=(x,y,z)=>`${x},${y},${z}`;
function addGeometry(geometry,material,matrix=null){
 const positions=geometry.attributes.position,index=geometry.index,count=index?index.count:positions.count;
 for(let i=0;i<count;i+=3){
  const vertices=[0,1,2].map(n=>new THREE.Vector3().fromBufferAttribute(positions,index?index.getX(i+n):i+n));
  if(matrix)vertices.forEach(v=>v.applyMatrix4(matrix));
  if(Math.min(...vertices.map(v=>v.y))>2.91||Math.max(...vertices.map(v=>v.y))<0)continue;
  const bounds=new THREE.Box3().setFromPoints(vertices).expandByScalar(.055);
  const entry=triangles++;appendTriangle(vertices,material);
  for(let x=Math.floor(bounds.min.x/cell);x<=Math.floor(bounds.max.x/cell);x++)for(let y=Math.floor(bounds.min.y/cell);y<=Math.floor(bounds.max.y/cell);y++)for(let z=Math.floor(bounds.min.z/cell);z<=Math.floor(bounds.max.z/cell);z++){
   const k=key(x,y,z);if(!buckets.has(k))buckets.set(k,[]);buckets.get(k).push(entry);
  }
 }
}
function appendTriangle(points,material){for(const p of points)vertices.push(p.x,p.y,p.z);kinds.push(kindNames.indexOf(material));}
const materials={};
buildDrainOrganicGeometry({layout:floorLayout(),materials,
 root(points,radius=.16,wall=null,options={}){
  const {geometry}=drainRootGeometry(new THREE.CatmullRomCurve3(points),radius,wall,options);addGeometry(geometry,'root');geometry.dispose();
 },
 put(geometry,type,x,y,z,sx=1,sy=1,sz=1,rx=0,ry=0,rz=0){
  if(type==='rootCrevice')return;
  dummy.position.set(x,y,z);dummy.scale.set(sx,sy,sz);dummy.rotation.set(rx,ry,rz);dummy.updateMatrix();addGeometry(geometry,type==='mudBank'?'soil':'masonry',dummy.matrix);
 }
});
for(const m of Object.values(materials))m.dispose?.();
const positions=new Float32Array(vertices),materialsByTriangle=new Uint8Array(kinds);vertices.length=0;kinds.length=0;
let bucketBytes=0;for(const [key,values]of buckets){const ids=new Uint32Array(values);buckets.set(key,ids);bucketBytes+=ids.byteLength;}

export function organicContact(p){
 const entries=buckets.get(key(Math.floor(p.x/cell),Math.floor(p.height/cell),Math.floor(-p.y/cell)));if(!entries)return null;
 point.set(p.x,p.height,-p.y);let best=null,min=Infinity;
 for(const entry of entries){
  triangle.a.fromArray(positions,entry*9);triangle.b.fromArray(positions,entry*9+3);triangle.c.fromArray(positions,entry*9+6);
  triangle.closestPointToPoint(point,closest);const d=point.distanceTo(closest);
  if(d>p.radius+.002||d>=min)continue;min=d;
  const normal=d>1e-8?point.clone().sub(closest).multiplyScalar(1/d):triangle.getNormal(new THREE.Vector3());
  best={blocked:true,point:{x:closest.x,y:-closest.z,height:closest.y},normal:{x:normal.x,y:-normal.z,height:normal.y},material:kindNames[materialsByTriangle[entry]],surface:'organic-geometry',part:p.kind,gap:d-p.radius};
 }
 return best;
}
export function organicBoundsOverlap(b){
 for(let x=Math.floor(b.minX/cell);x<=Math.floor(b.maxX/cell);x++)for(let y=Math.floor(b.minH/cell);y<=Math.floor(b.maxH/cell);y++)for(let z=Math.floor(-b.maxY/cell);z<=Math.floor(-b.minY/cell);z++)if(buckets.has(key(x,y,z)))return true;
 return false;
}
export const organicContactStats=()=>({triangles,cells:buckets.size,typedBytes:positions.byteLength+materialsByTriangle.byteLength+bucketBytes});
