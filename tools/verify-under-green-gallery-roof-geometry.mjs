import assert from 'node:assert/strict';
import fs from 'node:fs';
import * as T from '../web/vendor/three/three.module.js';
import {floorLayout} from '../web/under-green-course.js';
import {roofPanels} from '../web/under-green-overhead.js';
import {galleryRoofHeight,galleryRoofArc,galleryRoofPanelGeometry,isGalleryRoofPanel,galleryRoofFinishPut,galleryWallFinishHeight} from '../web/under-green-gallery-roof.js';
import {buildGalleryPlaster} from '../web/under-green-gallery-plaster.js';
import {buildGalleryDecay} from '../web/under-green-gallery-decay.js';
import {GALLERY_RENDER_PATCHES,galleryRenderGeometry} from '../web/under-green-gallery-render.js';
const tiles=roofPanels(floorLayout().tiles).filter(isGalleryRoofPanel),roofs=[],records=[],material=new T.MeshBasicMaterial({side:T.FrontSide});
assert.equal(tiles.reduce((a,t)=>a+t.w*t.d,0),160);
for(const t of tiles){
 const g=galleryRoofPanelGeometry(t),p=g.attributes.position,n=g.attributes.normal,uv=g.attributes.uv,ix=g.index,edges=new Map();let volume=0;
 for(let i=0;i<p.count;i++){assert(Number.isFinite(p.getX(i)+p.getY(i)+p.getZ(i)+uv.getX(i)+uv.getY(i)));assert(Math.abs(new T.Vector3().fromBufferAttribute(n,i).length()-1)<1e-5);assert(p.getY(i)>=3.04999&&p.getY(i)<=4.35001);if(n.getY(i)<-.01){assert(Math.abs(p.getY(i)-galleryRoofHeight(p.getX(i)))<1e-5);assert(Math.abs(uv.getX(i)*2-galleryRoofArc(p.getX(i)))<1e-5);assert(Math.abs(uv.getY(i)*2-p.getZ(i))<1e-5);}}
 for(let i=0;i<ix.count;i+=3){const vertices=[0,1,2].map(j=>new T.Vector3().fromBufferAttribute(p,ix.getX(i+j))),[a,b,c]=vertices;assert(b.clone().sub(a).cross(c.clone().sub(a)).length()>1e-10);volume+=a.dot(b.clone().cross(c))/6;const keys=vertices.map(v=>v.toArray().map(x=>Math.round(x*1e5)).join(','));for(let j=0;j<3;j++){const a=keys[j],b=keys[(j+1)%3],key=[a,b].sort().join('|'),e=edges.get(key)||{count:0,balance:0};e.count++;e.balance+=a<b?1:-1;edges.set(key,e);}}
 assert([...edges.values()].every(e=>e.count===2&&e.balance===0),'Open panel');assert(volume>0);const mesh=new T.Mesh(g,material);mesh.updateMatrixWorld();roofs.push(mesh);records.push({tile:t,triangles:ix.count/3,volume});
}
const ray=new T.Raycaster();let probes=0;
for(let x=-4.89;x<=4.89;x+=.13)for(let y=.01;y<16;y+=.17){ray.set(new T.Vector3(x,1.65,-y),new T.Vector3(0,1,0));const hit=ray.intersectObjects(roofs)[0];assert(hit,'Ceiling gap');assert(Math.abs(hit.point.y-galleryRoofHeight(x))<1e-5);probes++;}
// Verify a real deformed brick failure retains its constant offset everywhere,
// including triangle interiors, and ceiling seep UVs match the receiving roof.
const finished=[],put=(g,type,x,h,z,sx=1,sy=1,sz=1,rx=0,ry=0,rz=0)=>{const copy=g.clone();copy.applyMatrix4(new T.Matrix4().compose(new T.Vector3(x,h,z),new T.Quaternion().setFromEuler(new T.Euler(rx,ry,rz)),new T.Vector3(sx,sy,sz)));finished.push({type,g:copy});};
const curved=galleryRoofFinishPut(put),materials={ceiling:new T.MeshPhongMaterial(),rootStone:new T.MeshPhongMaterial()};buildGalleryPlaster({materials,put:curved});buildGalleryDecay({put:curved});let attachedSamples=0;
const beds=finished.filter(o=>o.type==='rootStone');assert.equal(beds.length,2);
for(const {g}of beds){const p=g.attributes.position;for(let i=0;i<p.count;i+=3){const vs=[0,1,2].map(j=>new T.Vector3().fromBufferAttribute(p,i+j));for(const weights of [[1,0,0],[0,1,0],[0,0,1],[1/3,1/3,1/3]]){const v=vs.reduce((v,p,i)=>v.addScaledVector(p,weights[i]),new T.Vector3());const offset=galleryRoofHeight(v.x)-v.y;assert(offset>=.00698&&offset<=.00802,'Brick bed floats off the curved roof');attachedSamples++;}}}
for(const {type,g}of finished){if(type!=='galleryCeilingDamp')continue;const p=g.attributes.position,uv=g.attributes.uv;for(let i=0;i<p.count;i++){assert(Math.abs(galleryRoofHeight(p.getX(i))-p.getY(i)-.002)<2e-5);assert(Math.abs(uv.getX(i)*2-galleryRoofArc(p.getX(i)))<1e-5);assert(Math.abs(uv.getY(i)*2-p.getZ(i))<1e-5);}}
let brickWindows=0;for(const patch of GALLERY_RENDER_PATCHES){const mesh=new T.Mesh(galleryRenderGeometry(patch),material);mesh.updateMatrixWorld();for(const [u,h]of patch.holes){ray.set(new T.Vector3(patch.boundary+patch.side*.8,galleryWallFinishHeight(h),-u),new T.Vector3(-patch.side,0,0));assert.equal(ray.intersectObject(mesh).length,0);brickWindows++;}mesh.geometry.dispose();}
assert(curved.stats.minimumHeight>3);const report={passed:true,panels:tiles.length,area:160,triangles:records.reduce((n,r)=>n+r.triangles,0),overheadProbes:probes,attachedSamples,brickWindows,finish:curved.stats,records};fs.mkdirSync('output/under-green/visual-pass77',{recursive:true});fs.writeFileSync('output/under-green/visual-pass77/geometry.json',JSON.stringify(report,null,2));console.log({...report,records:undefined});
