import assert from 'node:assert/strict';
import * as T from '../web/vendor/three/three.module.js';
import {createAuditBellGeometry,AUDIT_BELL_PROFILE} from '../web/course-audit-bell.js';
const g=createAuditBellGeometry(),p=g.attributes.position,n=g.attributes.normal,uv=g.attributes.uv;
let outer=0,inner=0;
for(let i=0;i<p.count;i++){
 const row=i%AUDIT_BELL_PROFILE.length,dot=p.getX(i)*n.getX(i)+p.getZ(i)*n.getZ(i);
 if(row>=5&&row<=8){assert(dot>0,'Exterior must face outward');outer++;}
 if(row===1||row===2){assert(dot<0,'Cavity must face inward');inner++;}
 for(const a of [p,n,uv])for(let j=0;j<a.itemSize;j++)assert(Number.isFinite(a.array[i*a.itemSize+j]));
 assert(uv.getY(i)>0&&uv.getY(i)<1);
}
const body=new T.Mesh(g,new T.MeshBasicMaterial()),ray=new T.Raycaster();body.updateMatrixWorld();
const hits=[];
for(let i=0;i<32;i++){
 const a=i/32*Math.PI*2,origin=new T.Vector3(Math.sin(a),-.30,Math.cos(a)),direction=new T.Vector3(-Math.sin(a),0,-Math.cos(a));ray.set(origin,direction);
 const hit=ray.intersectObject(body)[0];assert(hit,'Closed shell from every approach');assert(Math.hypot(hit.point.x,hit.point.z)>.16,'First hit must be exterior, not rear cavity');hits.push(hit.distance);
}
ray.set(new T.Vector3(0,-1,0),new T.Vector3(.1,1,0).normalize());assert(ray.intersectObject(body).length,'Cavity visible from below');
assert(Math.abs(g.boundingBox.min.y+.55)<1e-6);assert(Math.abs(g.boundingBox.max.x-.34)<1e-6);
console.log(JSON.stringify({passed:true,outer,inner,radialRays:hits.length,triangles:g.index.count/3,vertices:p.count,checks:['Correct exterior/cavity normals','Exterior occludes rear cavity','Open mouth visible below','Finite geometry/UVs','Original bell footprint retained']}));g.dispose();body.material.dispose();
