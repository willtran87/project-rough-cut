import assert from 'node:assert/strict';
import fs from 'node:fs';
import * as THREE from '../web/vendor/three/three.module.js';
import {buildGalleryPlaster,GALLERY_PLASTER_CONTOUR} from '../web/under-green-gallery-plaster.js';
import {roofPanels} from '../web/under-green-overhead.js';
import {floorLayout} from '../web/under-green-course.js';
const source=new THREE.MeshPhongMaterial(),materials={ceiling:source,rootStone:source},meshes=[];
const stats=buildGalleryPlaster({materials,put(g,type,x,y,z,sx=1,sy=1,sz=1,rx=0,ry=0,rz=0){const o=new THREE.Object3D();o.position.set(x,y,z);o.scale.set(sx,sy,sz);o.rotation.set(rx,ry,rz);o.updateMatrix();meshes.push({type,g:g.clone().applyMatrix4(o.matrix)});}});
const layout=floorLayout(),roof=roofPanels(layout.tiles);let vertices=0,triangles=0,minimum=Infinity;
for(const {type,g}of meshes){const p=g.attributes.position,n=g.attributes.normal;vertices+=p.count;triangles+=(g.index?.count||p.count)/3;
 for(let i=0;i<p.count;i++){const x=p.getX(i),h=p.getY(i),y=-p.getZ(i);assert([x,h,y].every(Number.isFinite));minimum=Math.min(minimum,h);
  assert(x>=-4.9&&x< -2.3&&y>13&&y<17.3&&h>1.8&&h<4.16,'Decoration exceeded its wall/roof footprint '+JSON.stringify({type,x,y,h}));
  if(type==='galleryWallDamp'){assert(Math.abs(x+4.888)<1e-6);assert(n.getX(i)>.999,'Wall stain must face inside');assert(layout.walls.some(w=>w.covered&&Math.abs(x-(w.x+w.w/2))<.003&&y>=w.y-w.d/2&&y<=w.y+w.d/2&&h<4.2),'Wall stain lacks an opaque receiver');}
  else {assert(h>4.12);assert(roof.some(r=>x>=r.x-r.w/2&&x<=r.x+r.w/2&&y>=r.y-r.d/2&&y<=r.y+r.d/2),'Missing solid roof backing');if(type!=='ceiling')assert(n.getY(i)<-.999,'Roof finish must face down');}
 }
 if(type==='ceiling'){
  const edges=new Map();let volume=0;
  const key=i=>[p.getX(i),p.getY(i),p.getZ(i)].map(x=>x.toFixed(6)).join(',');
  for(let i=0;i<p.count;i+=3){for(const [a,b]of [[i,i+1],[i+1,i+2],[i+2,i]]){const k=[key(a),key(b)].sort().join('|');edges.set(k,(edges.get(k)||0)+1);}const a=new THREE.Vector3().fromBufferAttribute(p,i),b=new THREE.Vector3().fromBufferAttribute(p,i+1),c=new THREE.Vector3().fromBufferAttribute(p,i+2);volume+=a.dot(b.cross(c))/6;}
  assert([...edges.values()].every(x=>x===2),'Plaster fragment is open');assert(volume>0,'Fragment normals are inward');
 }
 g.dispose();
}
assert(Math.abs(minimum-stats.minimumHeight)<1e-6);assert.equal(triangles,stats.triangles);
let disposed=0;materials.galleryCeilingDamp.addEventListener('dispose',()=>disposed++);materials.galleryWallDamp.addEventListener('dispose',()=>disposed++);stats.dispose();assert.equal(disposed,2);
const report={passed:true,vertices,triangles,contourPoints:GALLERY_PLASTER_CONTOUR.length,minimum,stats,disposed};fs.mkdirSync('output/under-green/visual-pass66',{recursive:true});fs.writeFileSync('output/under-green/visual-pass66/geometry.json',JSON.stringify(report,null,2));console.log(JSON.stringify(report));
