import * as T from '../web/vendor/three/three.module.js';
import fs from 'node:fs';
import {floorLayout} from '../web/under-green-course.js';
import {structureEdges,buildUnderGreenStructure} from '../web/under-green-structure.js';
import {buildDistrictEnclosure} from '../web/under-green-district-enclosure.js';
const layout=floorLayout(),meshes=[],mat=new T.MeshBasicMaterial({side:T.DoubleSide}),materials={mudBank:new T.MeshPhongMaterial(),root:new T.MeshPhongMaterial(),machineIron:new T.MeshPhongMaterial()};
function box(type,x,y,z,w,h,d){const m=new T.Mesh(new T.BoxGeometry(w,h,d),mat);m.position.set(x,y,z);m.updateMatrixWorld(true);meshes.push(m);}
function put(g,type,x,y,z){const m=new T.Mesh(g.clone(),mat);m.position.set(x,y,z);m.updateMatrixWorld(true);meshes.push(m);}
buildUnderGreenStructure({layout,box});buildDistrictEnclosure({layout,materials,box,put});
const ray=new T.Raycaster(),misses=[],hits=[];
for(const edge of structureEdges(layout.tiles).filter(e=>e.kind==='retaining')){
 if(edge.axis==='x'&&Math.abs(edge.line+32)<.001)continue;
 const n=Math.max(1,Math.ceil((edge.end-edge.start)/.47));
 for(let i=0;i<n;i++){
  const along=edge.start+(i+.5)*(edge.end-edge.start)/n,x=edge.axis==='x'?edge.line:along,y=edge.axis==='y'?edge.line:along,dx=edge.axis==='x'?edge.side:0,dz=edge.axis==='y'?-edge.side:0;
  ray.set(new T.Vector3(x-dx*.38,4.13,-y-dz*.38),new T.Vector3(dx,0,dz));ray.near=0;ray.far=.76;
  const intersect=ray.intersectObjects(meshes,false);(intersect.length?hits:misses).push({axis:edge.axis,line:edge.line,along,x,y,height:4.13});
 }
}
const report={sampled:hits.length+misses.length,hits:hits.length,misses:misses.length,examples:misses.slice(0,12),allMisses:misses};fs.writeFileSync('output/under-green/visual-upgrade/pass32-source/gap-probe.json',JSON.stringify(report,null,2));console.log(JSON.stringify({...report,allMisses:undefined}));
