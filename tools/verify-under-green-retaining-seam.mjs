import assert from 'node:assert/strict';
import fs from 'node:fs';
import {pathToFileURL} from 'node:url';
import * as T from '../web/vendor/three/three.module.js';
import {floorLayout} from '../web/under-green-course.js';
import {structureEdges,buildUnderGreenStructure} from '../web/under-green-structure.js';
import {buildDistrictEnclosure} from '../web/under-green-district-enclosure.js';
const out='output/under-green/visual-upgrade/pass32-source',layout=floorLayout();
async function previous(file,name){const src=fs.readFileSync(`${out}/${file}-before.js`,'utf8').replace(/from '\.\/([^']+)'/g,(_,f)=>`from '${pathToFileURL(process.cwd()+'/web/'+f).href}'`);return (await import('data:text/javascript;base64,'+Buffer.from(src).toString('base64')))[name];}
function collect(structure,enclosure){const boxes=[],members=[],meshes=[],mat=new T.MeshBasicMaterial({side:T.DoubleSide}),materials={mudBank:new T.MeshPhongMaterial(),root:new T.MeshPhongMaterial(),machineIron:new T.MeshPhongMaterial()};
 function mesh(g,x,y,z){const m=new T.Mesh(g,mat);m.position.set(x,y,z);m.updateMatrixWorld(true);meshes.push(m);}
 function box(...a){boxes.push(a);const [,x,y,z,w,h,d]=a;mesh(new T.BoxGeometry(w,h,d),x,y,z);}
 structure({layout,box});const stats=enclosure({layout,materials,box,put(g,type,x,y,z){members.push({type,x,y,z,position:Array.from(g.attributes.position.array),uv:Array.from(g.attributes.uv.array)});mesh(g.clone(),x,y,z);}});return {boxes,members,meshes,stats};}
const a=collect(await previous('under-green-structure','buildUnderGreenStructure'),await previous('under-green-district-enclosure','buildDistrictEnclosure')),b=collect(buildUnderGreenStructure,buildDistrictEnclosure);
assert.equal(a.boxes.length,b.boxes.length);assert.deepEqual(a.members,b.members);assert.deepEqual(a.stats,b.stats);
let changed=0;
for(let i=0;i<a.boxes.length;i++){const old=a.boxes[i],now=b.boxes[i];if(JSON.stringify(old)===JSON.stringify(now))continue;
 // The shared cap constant is physically identical, allowing FP roundoff.
 if(old.every((v,j)=>typeof v==='number'?Math.abs(v-now[j])<1e-12:v===now[j]))continue;
 changed++;assert.equal(old[2],4.52);assert.equal(old[5],.72);assert(Math.abs(now[2]-now[5]/2-4.08)<1e-10);assert(Math.abs(now[2]+now[5]/2-4.90)<1e-10);
 for(const j of [0,1,3,4,6])assert.equal(now[j],old[j]);
}
assert(changed>0);
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
const report={passed:true,changedUpperFaces:changed,wallSamples:samples,boxCount:b.boxes.length,memberCount:b.members.length,stats:b.stats,scope:'Retaining boundaries except unchanged exposed western bunker bank; same topology, materials and footprints; all changes above 4.08m.'};fs.writeFileSync(out+'/seam-audit.json',JSON.stringify(report,null,2));console.log(JSON.stringify(report));
