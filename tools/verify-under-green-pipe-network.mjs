import assert from 'node:assert/strict';
import * as T from '../web/vendor/three/three.module.js';
import {buildDrainPipeNetwork,pipeInsulationGeometry} from '../web/under-green-pipe-network.js';
import {DRAIN_DRIPS,drainDripSample} from '../web/under-green-water-contacts.js';
const meshes=[],put=(g,type,x,y,z,sx=1,sy=1,sz=1,rx=0,ry=0,rz=0)=>{const m=new T.Mesh(g.clone(),new T.MeshBasicMaterial());m.position.set(x,y,z);m.scale.set(sx,sy,sz);m.rotation.set(rx,ry,rz);m.updateMatrixWorld();m.userData.type=type;meshes.push(m);return m;},box=(type,x,y,z,w,h,d)=>{const g=new T.BoxGeometry(w,h,d);put(g,type,x,y,z);g.dispose();};
const stats=buildDrainPipeNetwork({put,box});let minHeight=Infinity,triangles=0;
for(const m of meshes){const p=m.geometry.attributes.position,n=m.geometry.attributes.normal,uv=m.geometry.attributes.uv;triangles+=m.geometry.index.count/3;for(let i=0;i<p.count;i++){const v=new T.Vector3().fromBufferAttribute(p,i).applyMatrix4(m.matrixWorld);assert(Number.isFinite(v.x+v.y+v.z+n.getX(i)+n.getY(i)+n.getZ(i)+uv.getX(i)+uv.getY(i)));minHeight=Math.min(minHeight,v.y);}}
assert(minHeight>3.09,'New pipe geometry below its supported overhead envelope');
assert.equal(stats.runs.length,4);assert.equal(stats.repairs.length,3);assert.equal(stats.insulation.length,3);
// Every branch endpoint has a physical pipe/collar receiver, and the swept
// elbow has both tangent-matched joins. Query real triangles, not just stats.
for(const p of [[-20,3.65,-40],[5.45,3.65,-40],[6,3.65,-39.45]]){
 const ray=new T.Raycaster(new T.Vector3(p[0],p[1]-.5,p[2]),new T.Vector3(0,1,0),0,.51);assert(ray.intersectObjects(meshes).length,'Unconnected branch/elbow at '+p);
}
// Only pipe weeps hang from pipe metal; gallery runoff drips on roof/root surfaces
// are owned by verify-under-green-gallery-runoff-geometry.
const pipeDrips=DRAIN_DRIPS.filter(d=>!d.surface||d.surface==='pipe');assert(pipeDrips.length>=4);
assert.equal(stats.leaks.length,pipeDrips.length);
for(const d of pipeDrips){
 const ray=new T.Raycaster(new T.Vector3(d.x,d.height-.02,-d.y),new T.Vector3(0,1,0),0,.045);assert(ray.intersectObjects(meshes).length,'Floating drip origin');
 const a=drainDripSample(d,-d.offset,0);assert.equal(a.height,d.height);assert(a.falling);
}
for(let seed=0;seed<12;seed++){
 const g=pipeInsulationGeometry(.123,.82,seed),edges=new Map();for(let i=0;i<g.index.count;i+=3)for(let j=0;j<3;j++){const e=[g.index.array[i+j],g.index.array[i+(j+1)%3]].sort((a,b)=>a-b).join(',');edges.set(e,(edges.get(e)||0)+1);}assert([...edges.values()].every(n=>n===2),'Open insulation shell');
 const p=g.attributes.position;for(let i=0;i<p.count;i++)assert(Math.hypot(p.getX(i),p.getY(i))>.1229,'Wrap penetrates pipe');
}
const report={passed:true,meshes:meshes.length,triangles,minHeight,stats};console.log(JSON.stringify(report));
