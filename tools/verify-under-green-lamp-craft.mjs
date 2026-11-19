import assert from 'node:assert/strict';
import fs from 'node:fs';
import * as T from '../web/vendor/three/three.module.js';
import {drainLampLensGeometry} from '../web/under-green-lamp-glass.js';
import {finishDrainLamps} from '../web/under-green-fixture-finish.js';
import {dampLampLevel} from '../web/under-green-atmosphere.js';
const out='output/under-green/visual-upgrade-local/pass38-source';
// The pass-38 slack lamp lead is the last three rubber meshes after the
// ceramic fitting; it must sit inside the envelope of the rest of the fixture.
// (Formerly compared against an untracked pre-pass snapshot of this module.)
function collect(build,lamp){const meshes=[],cyl=new T.CylinderGeometry(1,1,1,8),dummy=new T.Object3D();const put=(g,type,x,y,z,sx=1,sy=1,sz=1,rx=0,ry=0,rz=0)=>{dummy.position.set(x,y,z);dummy.scale.set(sx,sy,sz);dummy.rotation.set(rx,ry,rz);dummy.updateMatrix();const copy=g.clone().applyMatrix4(dummy.matrix);copy.computeBoundingBox();meshes.push({type,geometry:copy});};build({lamps:[lamp],cyl,put,box(type,x,y,z,w,h,d){const g=new T.BoxGeometry(w,h,d);put(g,type,x,y,z);g.dispose();}});cyl.dispose();return meshes;}
const rows=[];for(const lamp of [{x:0,y:0},{x:0,y:0,height:2.65,lensOffset:-.18,facing:-1},{x:0,y:0,height:3.22,lensOffset:-.02}]){
 const b=collect(finishDrainLamps,lamp),fitting=b.findIndex(m=>m.type==='white');assert(fitting>0,'Ceramic fitting present');
 const a=b.slice(0,fitting+1),bounds=new T.Box3();a.forEach(m=>bounds.union(m.geometry.boundingBox));
 for(const m of b)assert(m.geometry.attributes.position.array.every(Number.isFinite));
 const extra=b.slice(fitting+1);assert.equal(extra[2].geometry.type,'TubeGeometry','Slack lead is a tube');assert.equal(extra.length,3);assert(extra.every(m=>m.type==='rubber'));for(const m of extra)assert(bounds.clone().expandByScalar(1e-6).containsBox(m.geometry.boundingBox),'Cable exceeds existing fitting envelope');
 rows.push({lamp,existingMeshes:a.length,addedTriangles:extra.reduce((n,m)=>n+m.geometry.index.count/3,0),bounds:bounds.toArray?.()||{min:bounds.min.toArray(),max:bounds.max.toArray()}});for(const m of b)m.geometry.dispose();
}
const lens=drainLampLensGeometry(),p=lens.attributes.position,n=lens.attributes.normal;let edgeSamples=0,crown=0;
for(let i=0;i<p.count;i++){assert(Number.isFinite(n.getX(i)+n.getY(i)+n.getZ(i)));assert(Math.abs(p.getX(i))<=.5&&Math.abs(p.getY(i))<=.5);crown=Math.max(crown,Math.abs(p.getZ(i))-.5);if(Math.abs(p.getX(i))===.5||Math.abs(p.getY(i))===.5){assert(Math.abs(p.getZ(i))<=.5);edgeSamples++;}}
assert(Math.abs(crown-.08)<1e-6);assert(.15*(.5+crown)<.13-.0075,'Crown touches cage');
let maxStep=0;for(let i=0;i<17;i++)for(let t=0;t<100;t+=1/120){assert.equal(dampLampLevel(t,i,true),.72);maxStep=Math.max(maxStep,Math.abs(dampLampLevel(t+1/120,i)-dampLampLevel(t,i)));}assert(maxStep<.02);
const report={passed:true,rows,lensTriangles:lens.index.count/3,edgeSamples,crown,maxFlickerStep120Hz:maxStep};fs.mkdirSync(out,{recursive:true});fs.writeFileSync(out+'/geometry-report.json',JSON.stringify(report,null,2));console.log(JSON.stringify(report));lens.dispose();
