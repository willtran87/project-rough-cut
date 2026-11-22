import assert from 'node:assert/strict';
import fs from 'node:fs';
import {pathToFileURL} from 'node:url';
import * as T from '../web/vendor/three/three.module.js';
import {finishDrainLamps,DRAIN_LAMP_HOOD_WEAR,drainLampHoodGeometry} from '../web/under-green-fixture-finish.js';
const out='output/under-green/visual-upgrade-local/pass39-source';fs.mkdirSync(out,{recursive:true});
const lamps=Array.from({length:17},(_,i)=>({x:i*3,y:0,...(i===0?{height:3.22,lensOffset:-.02}:i===16?{height:2.65,lensOffset:-.18,facing:-1}:{})}));
function collect(build){const meshes=[],cyl=new T.CylinderGeometry(1,1,1,8),dummy=new T.Object3D();const put=(g,type,x,y,z,sx=1,sy=1,sz=1,rx=0,ry=0,rz=0)=>{dummy.position.set(x,y,z);dummy.scale.set(sx,sy,sz);dummy.rotation.set(rx,ry,rz);dummy.updateMatrix();const copy=g.clone().applyMatrix4(dummy.matrix);copy.computeBoundingBox();meshes.push({type,geometry:copy});};const stats=build({lamps,cyl,put,box(type,x,y,z,w,h,d){const g=new T.BoxGeometry(w,h,d);put(g,type,x,y,z);g.dispose();}});cyl.dispose();return {meshes,stats};}
const after=collect(finishDrainLamps),rows=[];let offset=0;
const tris=m=>(m.geometry.index?.count||m.geometry.attributes.position.count)/3;
for(let i=0;i<17;i++){
 const wear=DRAIN_LAMP_HOOD_WEAR[i],count=wear==='patched'?20:17,b=after.meshes.slice(offset,offset+count);offset+=count;
 if(wear==='patched'){
  const glassTop=(lamps[i].height||2.8)+(lamps[i].height?.25:.32)/2;
  for(const m of b.slice(17))assert(m.geometry.boundingBox.min.y>glassTop,'Repair obscures glass');
 }
 rows.push({index:i,wear:wear||'intact',triangles:b.reduce((n,m)=>n+tris(m),0)});
}
assert.equal(offset,after.meshes.length);assert.deepEqual(after.stats.hoodWear,{chipped:3,bent:3,patched:2});
for(const width of [.37,.56])for(const wear of [undefined,'chipped','bent','patched']){
 const g=drainLampHoodGeometry(width,wear),p=g.attributes.position,n=g.attributes.normal;for(let i=0;i<p.count;i++)assert(Number.isFinite(p.getX(i)+p.getY(i)+p.getZ(i)+n.getX(i)+n.getY(i)+n.getZ(i)));
 // Each undirected edge in the closed extruded solid must meet exactly twice.
 const edges=new Map(),indices=g.index?.array||Array.from({length:p.count},(_,i)=>i),key=i=>[p.getX(i),p.getY(i),p.getZ(i)].map(x=>x.toFixed(6)).join(',');
 for(let i=0;i<indices.length;i+=3)for(let j=0;j<3;j++){const e=[key(indices[i+j]),key(indices[i+(j+1)%3])].sort().join('|');edges.set(e,(edges.get(e)||0)+1);}
 assert([...edges.values()].every(n=>n===2),'Non-manifold hood '+wear);g.dispose();
}
const report={passed:true,rows,stats:after.stats};fs.writeFileSync(out+'/geometry-report.json',JSON.stringify(report,null,2));console.log(JSON.stringify(report));
