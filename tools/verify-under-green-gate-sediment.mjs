import assert from 'node:assert/strict';import fs from 'node:fs';import {pathToFileURL} from 'node:url';
import * as T from '../web/vendor/three/three.module.js';import {createKeeperGate,gateSedimentLump} from '../web/under-green-gate-scene.js';import {GATE} from '../web/under-green-course.js';
const out='output/under-green/visual-upgrade-local/pass41-source';
const source=fs.readFileSync(out+'/under-green-gate-scene-before.js','utf8').replace(/from '\.\/([^']+)'/g,(_,f)=>`from '${pathToFileURL(process.cwd()+'/web/'+f).href}'`),old=await import('data:text/javascript;base64,'+Buffer.from(source).toString('base64'));
function build(fn){const scene=new T.Scene(),materials={},registered=[],cyl=new T.CylinderGeometry(1,1,1,8);const put=(g,type,x,y,z,sx=1,sy=1,sz=1,rx=0,ry=0,rz=0,parent=null)=>{materials[type]??=new T.MeshPhongMaterial();materials[type].userData.drainUVMetres=type.startsWith('machine')?1:2;const m=new T.Mesh(g.clone(),materials[type]);m.position.set(x,y,z);m.scale.set(sx,sy,sz);m.rotation.set(rx,ry,rz);(parent||scene).add(m);return m;};const box=(type,x,y,z,w,h,d,parent=null)=>{const g=new T.BoxGeometry(1,1,1);const m=put(g,type,x,y,z,w,h,d,0,0,0,parent);g.dispose();return m;};const gate=fn({scene,box,put,cyl,sediment:{map:null,wet:null},registerFixture:m=>registered.push(m)});return {gate,scene,registered};}
const a=build(old.createKeeperGate),b=build(createKeeperGate),panels=r=>r.gate.root.children.filter(m=>m.name==='keeper-gate-panel');
for(let i=0;i<2;i++){
 const ga=panels(a)[i].geometry,gb=panels(b)[i].geometry;assert.deepEqual(ga.attributes.position.array,gb.attributes.position.array);assert.deepEqual(ga.index.array,gb.index.array);
 for(let j=0;j<ga.attributes.uv.array.length;j++)assert(Math.abs(gb.attributes.uv.array[j]-ga.attributes.uv.array[j]*2)<1e-6,'Panel loses machinery texture scale');
}
const mud=b.gate.root.getObjectByName('keeper-gate-sediment');mud.geometry.computeBoundingBox();const bounds=mud.geometry.boundingBox;assert(bounds.min.x>-4.8&&bounds.max.x<4.8&&bounds.min.y>.24&&bounds.max.y<.31&&bounds.min.z>-.07&&bounds.max.z<.07);
const deposited=b.registered[0].geometry.attributes.position;let exposed=0;
for(let i=0;i<deposited.count;i++){const x=deposited.getX(i),y=deposited.getY(i),z=deposited.getZ(i)+GATE.y;if(x>GATE.x-4.89&&x<GATE.x+4.89)exposed++;assert(Math.abs(z)>.08,'Guide muck intrudes in panel travel channel');assert(y>=.0019&&y<.09,'Guide muck must rest at floor');}
assert(exposed>deposited.count*.4,'Guide deposits hidden inside wall');
assert.equal(b.registered.length,1);assert.equal(b.registered[0].name,'keeper-guide-sediment');
for(let i=0;i<=100;i++){a.gate.update(i/100);b.gate.update(i/100);assert.equal(a.gate.stats().lift,b.gate.stats().lift);assert.deepEqual(a.gate.stats().cables,b.gate.stats().cables);assert.equal(mud.position.y,0);}
for(let seed=0;seed<16;seed++){
 const g=gateSedimentLump(.2,.1,.04,seed),p=g.attributes.position,n=g.attributes.normal,edges=new Map();for(let i=0;i<p.count;i++)assert(Number.isFinite(p.getX(i)+p.getY(i)+p.getZ(i)+n.getY(i)));for(let i=0;i<g.index.count;i+=3)for(let j=0;j<3;j++){const e=[g.index.array[i+j],g.index.array[i+(j+1)%3]].sort((a,b)=>a-b).join(',');edges.set(e,(edges.get(e)||0)+1);}assert([...edges.values()].every(n=>n===2));assert(n.getY(0)>0);g.dispose();
}
const report={passed:true,panelGeometryUnchanged:true,panelUvScale:2,travelSamples:101,panelDeposits:10,guideDeposits:6,triangles:mud.geometry.index.count/3+b.registered[0].geometry.index.count/3,movingBounds:{min:bounds.min.toArray(),max:bounds.max.toArray()},stats:b.gate.stats()};fs.writeFileSync(out+'/geometry.json',JSON.stringify(report,null,2));console.log(JSON.stringify(report));
