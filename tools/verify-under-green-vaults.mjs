import assert from 'node:assert/strict';
import fs from 'node:fs';
import * as T from '../web/vendor/three/three.module.js';
import {buildDrainVaults,buildGalleryMasonryRibs,vaultShellGeometry,VAULT_SPANS} from '../web/under-green-vaults.js';
const out='output/under-green/visual-upgrade-local/pass47-source';fs.mkdirSync(out,{recursive:true});
const meshes=[],materials={rootStone:new T.MeshPhongMaterial()},hook=()=>{},key=()=>'authored-wall';materials.rootStone.onBeforeCompile=hook;materials.rootStone.customProgramCacheKey=key;
const put=(g,type,x,y,z)=>{const m=new T.Mesh(g.clone(),materials[type]);m.position.set(x,y,z);m.updateMatrixWorld();meshes.push(m);};
const box=(type,x,y,z,w,h,d)=>{const g=new T.BoxGeometry(w,h,d);put(g,type,x,y,z);g.dispose();};
const stats=buildDrainVaults({materials,put,box});assert.equal(materials.vaultStone.onBeforeCompile,hook);assert.equal(materials.vaultStone.customProgramCacheKey,key);
const gallery=buildGalleryMasonryRibs(put);
let triangles=0,minHeight=Infinity,closed=0;
for(const mesh of meshes){
 const g=mesh.geometry,p=g.attributes.position,n=g.attributes.normal,uv=g.attributes.uv,ix=g.index.array,edges=new Map();triangles+=ix.length/3;
 const point=i=>new T.Vector3().fromBufferAttribute(p,i),id=i=>point(i).toArray().map(v=>Math.round(v*1e5)).join(',');let volume=0;
 for(let i=0;i<p.count;i++){assert(Number.isFinite(p.getX(i)+p.getY(i)+p.getZ(i)+uv.getX(i)+uv.getY(i)));assert(Math.abs(new T.Vector3().fromBufferAttribute(n,i).length()-1)<1e-5);minHeight=Math.min(minHeight,p.getY(i)+mesh.position.y);}
 for(let i=0;i<ix.length;i+=3){const a=point(ix[i]),b=point(ix[i+1]),c=point(ix[i+2]);assert(b.clone().sub(a).cross(c.clone().sub(a)).length()>1e-8,'Degenerate triangle');volume+=a.dot(b.clone().cross(c))/6;
  for(let j=0;j<3;j++){const a=id(ix[i+j]),b=id(ix[i+(j+1)%3]),key=[a,b].sort().join('|'),entry=edges.get(key)||{count:0,balance:0};entry.count++;entry.balance+=a<b?1:-1;edges.set(key,entry);}
 }
 assert([...edges.values()].every(e=>e.count===2&&e.balance===0),'Non-manifold or reversed shell');assert(volume>0,'Inward shell');closed++;
}
// Actual soffit edge lengths must equal UV lengths in physical metres;
// this catches the former circular-length mapping on the elliptical arch.
for(const [near,far]of VAULT_SPANS){const g=vaultShellGeometry({near,far}),p=g.attributes.position,uv=g.attributes.uv;for(let i=0;i<32*4;i+=4){const physical=new T.Vector3().fromBufferAttribute(p,i).distanceTo(new T.Vector3().fromBufferAttribute(p,i+1));assert(Math.abs(physical-Math.abs(uv.getX(i+1)-uv.getX(i))*2)<2e-6);assert(Math.abs((far-near)-Math.abs(uv.getY(i+3)-uv.getY(i))*2)<1e-5);}g.dispose();}
assert(minHeight>2.88);assert.equal(stats.fittedStones,108);assert.equal(stats.closedShells,3);assert.equal(meshes.length,179);assert.equal(gallery.stones,62);
const ray=new T.Raycaster(),hits=[];
// All span centres have an upward-facing solid overhead from either side of
// the rib. One-sided materials deliberately test the real face winding.
for(const [near,far]of VAULT_SPANS)for(const y of [near+.04,near+.4,(near+far)/2,far-.4,far-.04])for(const x of [-2.8,-1.5,0,1.5,2.8]){ray.set(new T.Vector3(x,1.65,-y),new T.Vector3(0,1,0));const hit=ray.intersectObjects(meshes)[0];assert(hit&&hit.point.y>2.88,'Missing solid soffit');hits.push({x,y,height:hit.point.y});}
const report={passed:true,stats,gallery,triangles,minHeight,closedMeshes:closed,overheadRays:hits};fs.writeFileSync(out+'/geometry.json',JSON.stringify(report,null,2));console.log(JSON.stringify({passed:true,triangles,minHeight,closedMeshes:closed,rays:hits.length}));
