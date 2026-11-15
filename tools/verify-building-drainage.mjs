import assert from 'node:assert/strict';
import * as T from '../web/vendor/three/three.module.js';
import {gutterGeometry,downpipeGeometry,buildBuildingDrainage,splashStoneGeometry,splashStainGeometry,drainageFootprints,clearDrainageFootprints} from '../web/course-building-drainage.js';
const material=new T.MeshBasicMaterial(),g=gutterGeometry(6.82,3.15),gutter=new T.Mesh(g,material),ray=new T.Raycaster();gutter.updateMatrixWorld();
ray.set(new T.Vector3(0,.2,0),new T.Vector3(0,-1,0));let hit=ray.intersectObject(gutter)[0];assert(hit&&Math.abs(hit.point.y+.062)<1e-6,'Open top exposes inward-facing channel floor');
ray.set(new T.Vector3(0,-.3,0),new T.Vector3(0,1,0));hit=ray.intersectObject(gutter)[0];assert(hit&&Math.abs(hit.point.y+.075)<1e-6,'Underside faces outward');
ray.set(new T.Vector3(3.15,.2,0),new T.Vector3(0,-1,0));assert.equal(ray.intersectObject(gutter).length,0,'Outlet has an actual opening through the gutter floor');
for(const side of [-1,1]){ray.set(new T.Vector3(side*4,-.068,0),new T.Vector3(-side,0,0));hit=ray.intersectObject(gutter)[0];assert(hit&&Math.abs(hit.point.x-side*3.41)<1e-6,'Closed end cheeks face out');}
const pipe=downpipeGeometry(),body=new T.Mesh(pipe.geometry,material);body.updateMatrixWorld();
ray.set(new T.Vector3(0,2.7,0),new T.Vector3(0,-1,0));hit=ray.intersectObject(body)[0];assert(hit&&hit.distance>2,'Inlet bore remains open through straight drop');
ray.set(pipe.outlet.clone().addScaledVector(pipe.direction,.2),pipe.direction.clone().negate());hit=ray.intersectObject(body)[0];assert(hit&&hit.distance>.25,'Outlet bore is recessed beyond the open lip');
for(let i=0;i<12;i++){const a=i/12*Math.PI*2;ray.set(new T.Vector3(Math.cos(a),1.4,Math.sin(a)),new T.Vector3(-Math.cos(a),0,-Math.sin(a)));hit=ray.intersectObject(body)[0];assert(hit&&Math.hypot(hit.point.x,hit.point.z)>.049,'Outer pipe hides inner wall');}
for(const geometry of [g,pipe.geometry])for(const name of ['position','normal','uv'])for(const value of geometry.attributes[name].array)assert(Number.isFinite(value));
const slab=new T.Mesh(splashStoneGeometry(),material),stain=splashStainGeometry();slab.updateMatrixWorld();
for(let i=0;i<stain.attributes.position.count;i++){
 const p=new T.Vector3().fromBufferAttribute(stain.attributes.position,i);ray.set(p.clone().add(new T.Vector3(0,.1,0)),new T.Vector3(0,-1,0));const hit=ray.intersectObject(slab)[0];assert(hit&&Math.abs(hit.distance-.101)<1e-6,'Every stain vertex lies 1 mm above the sloping stone');
}
assert.equal(slab.geometry.index.count/3,24);assert.equal(stain.index.count/3,36);slab.geometry.dispose();stain.dispose();
for(const [width,front]of [[6.5,1.8],[8.23,1.28]]){
 const pads=drainageFootprints(width,front);for(const p of pads){assert(!clearDrainageFootprints(pads,p.x,p.z));assert(!clearDrainageFootprints(pads,p.x+p.rx+.1,p.z,.11));assert(clearDrainageFootprints(pads,p.x+p.rx+.2,p.z,.11));}assert(clearDrainageFootprints(pads,0,front+.5,.5),'Doorway planting rule unchanged');
 const root=new T.Group(),mesh=(r,g,type,color,x=0,y=0,z=0)=>{const m=new T.Mesh(g,material);m.position.set(x,y,z);r.add(m);return m;};
 const helpers={mesh,box:(r,t,x,y,z,w,h,d,c)=>mesh(r,new T.BoxGeometry(w,h,d),t,c,x,y,z),cylinder:(r,t,x,y,z,radius,h,c)=>mesh(r,new T.CylinderGeometry(radius,radius,h,12),t,c,x,y,z)};
 buildBuildingDrainage(root,width,front,helpers);root.updateMatrixWorld(true);let mouths=0;
 root.traverse(o=>{if(!o.isMesh)return;const bounds=new T.Box3().setFromObject(o);if(bounds.min.y<2.4)assert(bounds.max.x<-1.2||bounds.min.x>1.2,'Drainage must clear central doorway and headroom');if(o.name==='HollowDownpipe')mouths++;o.geometry.dispose();});assert.equal(mouths,2);
}
console.log(JSON.stringify({passed:true,gutterTriangles:g.index.count/3,pipeTriangles:pipe.geometry.index.count/3,checks:['Open channel and real outlet hole','Exterior/inner/end-cheek winding','Hollow inlet/outlet','12 exterior occlusion rays','Finite geometry and UVs','Both buildings retain clear central doorway/headroom']}));g.dispose();pipe.geometry.dispose();material.dispose();
