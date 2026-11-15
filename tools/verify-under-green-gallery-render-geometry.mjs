import assert from 'node:assert/strict';
import fs from 'node:fs';
import * as T from '../web/vendor/three/three.module.js';
import {GALLERY_RENDER_PATCHES,galleryRenderGeometry} from '../web/under-green-gallery-render.js';
import {galleryWallFinishHeight} from '../web/under-green-gallery-roof.js';
import {floorLayout} from '../web/under-green-course.js';

// Probe the actual rendered shells from both sides and through the authored
// missing-plaster windows. The real brick wall must be the receiving surface.
const records=[];
for(const patch of GALLERY_RENDER_PATCHES){
 const g=galleryRenderGeometry(patch),p=g.attributes.position,n=g.attributes.normal,indices=g.index;
 const edgeUses=new Map(),material=new T.MeshBasicMaterial({side:T.FrontSide}),mesh=new T.Mesh(g,material);
 const backing=new T.Group();
 for(const w of floorLayout().walls){const wall=new T.Mesh(new T.BoxGeometry(w.w,4.3,w.d),material);wall.position.set(w.x,2.15,-w.y);backing.add(wall);}
 backing.updateMatrixWorld(true);mesh.updateMatrixWorld();
 let front=0,back=0,degenerate=0;
 for(let i=0;i<p.count;i++){
  for(const attr of Object.values(g.attributes))for(let k=0;k<attr.itemSize;k++)assert(Number.isFinite(attr.array[i*attr.itemSize+k]));
  const d=(p.getX(i)-patch.boundary)*patch.side;
  assert(d>=.10399&&d<=.12601,'Render protrudes beyond wall margin');
  assert(p.getY(i)>0&&p.getY(i)<4.15,'Render enters floor or roof');
  if(patch.id==='east-drain-repair'){
   const ray=new T.Raycaster(new T.Vector3(patch.boundary+patch.side*.8,p.getY(i),p.getZ(i)),new T.Vector3(-patch.side,0,0));
   const hits=ray.intersectObject(backing,true);
   assert(hits.length&&Math.abs(hits[0].point.x-(patch.boundary+patch.side*.11))<1e-5,'Repair has no real masonry backing');
  }
  if(Math.abs(n.getX(i))>.999){if(n.getX(i)*patch.side>0)front++;else back++;}
 }
 for(let i=0;i<(indices?.count||p.count);i+=3){
  const vertices=[0,1,2].map(j=>new T.Vector3().fromBufferAttribute(p,indices?indices.getX(i+j):i+j));
  if(new T.Vector3().subVectors(vertices[1],vertices[0]).cross(new T.Vector3().subVectors(vertices[2],vertices[0])).length()<1e-10)degenerate++;
  const keys=vertices.map(v=>v.toArray().map(x=>Math.round(x*1e5)).join(','));
  for(let j=0;j<3;j++){const a=keys[j],b=keys[(j+1)%3],key=[a,b].sort().join('|'),entry=edgeUses.get(key)||{count:0,balance:0};entry.count++;entry.balance+=a<b?1:-1;edgeUses.set(key,entry);}
 }
 // Earcut can emit a zero-area cap triangle between three collinear chips.
 // It has no coverage; closed, oppositely directed seams are the surface test.
 assert(front>0&&back>0);
 assert([...edgeUses.values()].every(e=>e.count===2&&e.balance===0),'Shell is open or winding is inconsistent');
 const holes=[];
 for(const [u,h]of patch.holes){
  const ray=new T.Raycaster(new T.Vector3(patch.boundary+patch.side*.8,galleryWallFinishHeight(h),-u),new T.Vector3(-patch.side,0,0));
  assert.equal(ray.intersectObject(mesh).length,0,'Brick window filled by plaster');
  const hits=ray.intersectObject(backing,true);assert(hits.length>0);assert(Math.abs(hits[0].point.x-(patch.boundary+patch.side*.11))<1e-5);
  holes.push({u,h:galleryWallFinishHeight(h),backingDistance:hits[0].distance});
 }
 records.push({id:patch.id,vertices:p.count,triangles:(indices?.count||p.count)/3,degenerateCapTriangles:degenerate,front,back,holes,bounds:{min:g.boundingBox.min.toArray(),max:g.boundingBox.max.toArray()}});
 g.dispose();backing.traverse(o=>o.geometry?.dispose());material.dispose();
}
const result={passed:true,parts:records.length,triangles:records.reduce((sum,r)=>sum+r.triangles,0),brickWindows:records.reduce((sum,r)=>sum+r.holes.length,0),records};
const out=process.argv.find(a=>a.startsWith('--output='))?.slice(9)||'output/under-green/gallery-render-geometry';fs.mkdirSync(out,{recursive:true});fs.writeFileSync(out+'/geometry.json',JSON.stringify(result,null,2));console.log({...result,records:undefined});
