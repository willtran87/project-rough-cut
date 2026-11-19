import assert from 'node:assert/strict';
import fs from 'node:fs';
import * as T from '../web/vendor/three/three.module.js';
import {shoringTimberGeometry} from '../web/under-green-bunker-shoring.js';
import {buildDistrictEnclosure,DISTRICT_WELLS} from '../web/under-green-district-enclosure.js';
import {buildUnderGreenStructure} from '../web/under-green-structure.js';
import {floorLayout} from '../web/under-green-course.js';
const root='output/under-green/visual-pass67',layout=floorLayout();
// Pass 67 bunker shoring. The original audit diffed the whole enclosure against
// an untracked pre-pass source snapshot, which later range/enclosure passes made
// stale; the shoring envelope is now asserted directly on the current build.
function collect(enclosure,structure){const meshes=[],materials={mudBank:new T.MeshPhongMaterial(),wood:new T.MeshPhongMaterial(),machineIron:new T.MeshPhongMaterial()};materials.wood.userData.drainUVMetres=4;
 const put=(g,type,x,y,z)=>{const copy=g.clone().translate(x,y,z);copy.computeBoundingBox();meshes.push({g:copy,type,bounds:copy.boundingBox});};
 const box=(type,x,y,z,w,h,d)=>{const g=new T.BoxGeometry(w,h,d);put(g,type,x,y,z);g.dispose();};
 const stats=enclosure({layout,materials,box,put});structure({layout,box});return {meshes,stats};
}
const after=collect(buildDistrictEnclosure,buildUnderGreenStructure);
const shoring=after.meshes.filter(m=>['shoringWood','rust'].includes(m.type));assert(shoring.length>100,'Shoring timbers and straps present');
let min=Infinity,max=0;
for(const m of shoring){const {min:a,max:b}=m.bounds;assert(a.x>=-32.2&&b.x<=-12.8&&a.z>=-76.2&&b.z<=-50.8&&a.y>=3.30&&b.y<=4.81,'Shoring exceeded upper bunker dressing '+JSON.stringify({type:m.type,a,b}));min=Math.min(min,a.y);max=Math.max(max,b.y);
 for(const hole of DISTRICT_WELLS)assert(!(a.x<hole.x+hole.w/2&&b.x>hole.x-hole.w/2&&a.z< -hole.y+hole.d/2&&b.z> -hole.y-hole.d/2),'Shoring crosses an inspection opening');
 for(const name of ['position','normal','uv'])assert([...m.g.attributes[name].array].every(Number.isFinite));
}
// Opaque enclosure earth never drops into the shored bunker dressing band.
for(const m of after.meshes.filter(m=>m.type==='bankEarth'))assert(m.bounds.min.y>=3.25);
for(const [w,l,d]of [[.26,4,.22],[.19,1.4,.22],[.20,1.63,.10]]){
 const g=shoringTimberGeometry(w,l,d),p=g.attributes.position,n=g.attributes.normal,uv=g.attributes.uv,edges=new Map();let volume=0;
 const k=i=>[p.getX(i),p.getY(i),p.getZ(i)].map(v=>v.toFixed(6)).join(',');
 for(let i=0;i<p.count;i+=3){for(const [a,b]of [[i,i+1],[i+1,i+2],[i+2,i]]){const key=[k(a),k(b)].sort().join('|');edges.set(key,(edges.get(key)||0)+1);}const a=new T.Vector3().fromBufferAttribute(p,i),b=new T.Vector3().fromBufferAttribute(p,i+1),c=new T.Vector3().fromBufferAttribute(p,i+2);volume+=a.dot(b.cross(c))/6;}
 assert([...edges.values()].every(v=>v===2),'Timber member is open');assert(volume>0,'Timber faces point inward');
 for(let i=0;i<p.count;i++)if(Math.abs(n.getY(i))<.9)assert(Math.abs(uv.getY(i)*4-p.getY(i))<1e-6,'Longitudinal grain scale drift');g.dispose();
 const shifted=shoringTimberGeometry(w,l,d,4,.63,.27);assert.deepEqual(shifted.attributes.position.array,p.array);assert.deepEqual(shifted.attributes.normal.array,n.array);for(let i=0;i<uv.count;i++){assert(Math.abs(shifted.attributes.uv.getX(i)-uv.getX(i)-.63)<1e-6);assert(Math.abs(shifted.attributes.uv.getY(i)-uv.getY(i)-.27)<1e-6);}shifted.dispose();
}
const frames=after.stats.bunkerShoring;assert(frames.length>7);assert.equal(frames.filter(f=>f.repaired).length,1);assert(new Set(frames.map(f=>f.members[0].a[1])).size>=6);
const tris=ms=>ms.reduce((s,m)=>s+(m.g.index?.count||m.g.attributes.position.count)/3,0);
const report={passed:true,frames:frames.length,repaired:frames.filter(f=>f.repaired),shoringMeshes:shoring.length,shoringTriangles:tris(shoring),minimumShoringHeight:min,maximumShoringHeight:max,after:after.stats};
fs.mkdirSync(root,{recursive:true});fs.writeFileSync(root+'/geometry.json',JSON.stringify(report,null,2));console.log(JSON.stringify({...report,after:undefined,repaired:report.repaired.map(f=>({y:f.y,left:f.left,right:f.right}))}));
