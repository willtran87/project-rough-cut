import assert from 'node:assert/strict';
import * as T from '../web/vendor/three/three.module.js';
import {floorLayout} from '../web/under-green-course.js';
import {structureEdges,buildUnderGreenStructure} from '../web/under-green-structure.js';
import {buildDistrictEnclosure} from '../web/under-green-district-enclosure.js';
// The pass-32 before/after snapshot diff (untracked output/) is retired; the
// lasting contract is that every retaining boundary is closed from the floor
// through the raised 4.08-4.90 m cap band.
const layout=floorLayout();
function collect(structure,enclosure){const boxes=[],members=[],meshes=[],mat=new T.MeshBasicMaterial({side:T.DoubleSide}),materials={mudBank:new T.MeshPhongMaterial(),wood:new T.MeshPhongMaterial(),root:new T.MeshPhongMaterial(),machineIron:new T.MeshPhongMaterial()};
 function mesh(g,x,y,z){const m=new T.Mesh(g,mat);m.position.set(x,y,z);m.updateMatrixWorld(true);meshes.push(m);}
 function box(...a){boxes.push(a);const [,x,y,z,w,h,d]=a;mesh(new T.BoxGeometry(w,h,d),x,y,z);}
 structure({layout,box});const stats=enclosure({layout,materials,box,put(g,type,x,y,z){members.push({type,x,y,z});mesh(g.clone(),x,y,z);}});return {boxes,members,meshes,stats};}
const b=collect(buildUnderGreenStructure,buildDistrictEnclosure);
// Raised upper faces span exactly 4.08..4.90 m.
const caps=b.boxes.filter(v=>Math.abs(v[2]-v[5]/2-4.08)<1e-10&&Math.abs(v[2]+v[5]/2-4.90)<1e-10);assert(caps.length>0,'No raised retaining caps');
const ray=new T.Raycaster();let samples=0;
for(const edge of structureEdges(layout.tiles).filter(e=>e.kind==='retaining')){
 if(edge.axis==='x'&&Math.abs(edge.line+32)<.001)continue;
 const count=Math.ceil((edge.end-edge.start)/.47);
 for(let i=0;i<count;i++)for(const h of [2,2.8,3.93,4.05,4.085,4.099,4.101,4.13,4.159,4.17,4.5,4.75]){
  const along=edge.start+(i+.5)*(edge.end-edge.start)/count,x=edge.axis==='x'?edge.line:along,y=edge.axis==='y'?edge.line:along,dx=edge.axis==='x'?edge.side:0,dz=edge.axis==='y'?-edge.side:0;
  ray.set(new T.Vector3(x-dx*.38,h,-y-dz*.38),new T.Vector3(dx,0,dz));ray.near=0;ray.far=.76;
  assert(ray.intersectObjects(b.meshes,false).length>0,JSON.stringify({edge,along,h}));samples++;
 }
}
assert(samples>0);
console.log(JSON.stringify({passed:true,raisedCaps:caps.length,wallSamples:samples,boxCount:b.boxes.length,memberCount:b.members.length,stats:b.stats}));
