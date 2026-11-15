import assert from 'node:assert/strict';
import * as THREE from '../web/vendor/three/three.module.js';
import {runoffLayout,runoffPose,createPondRunoff,buildPondRunoff,WATER_HEIGHT} from '../web/course-pond-runoff.js';
import {pondEdge,pondBankSeed} from '../web/course-pond-bank.js';

const x=70*.1152,z=-260*.16,rx=4,rz=1.76,layout=runoffLayout(rx,rz),seed=pondBankSeed(x,z);
let samples=0;
for(let t=0;t<120;t+=1/144){
  const p=runoffPose(t,layout);assert(p.drops.length<=1);assert(p.impacts.length<=3);
  for(const d of p.drops){assert(d.y>=WATER_HEIGHT);assert(d.y<=layout.lipY);}
  for(const c of p.impacts){
    const radius=Math.hypot(c.x/rx,c.z/rz),edge=pondEdge(Math.atan2(-c.z/rz,c.x/rx),seed);
    assert(radius<edge,'Impact inside actual irregular wet edge');assert(c.age>=0&&c.age<1.65);
  }samples++;
}
const flight=Math.sqrt(2*(layout.lipY-WATER_HEIGHT)/9.8),before=runoffPose(flight-1e-7,layout),after=runoffPose(flight+1e-7,layout);
assert.equal(before.drops.length,1);assert.equal(before.impacts.length,0);assert.equal(after.drops.length,0);assert.equal(after.impacts.length,1);
assert(Math.hypot(before.drops[0].x-after.impacts[0].x,before.drops[0].z-after.impacts[0].z)<1e-6);
const parent=new THREE.Group(),runoff=createPondRunoff(parent,x,z,rx,rz);
runoff.update({time:0});for(let i=1;i<=30;i++)runoff.update({time:i/60});const stable=runoff.stats();
runoff.update({time:.5});assert.deepEqual(runoff.stats(),stable,'Repeated draw does not advance');
runoff.update({time:.6,paused:true});assert.deepEqual(runoff.stats(),stable,'Pause freezes');
runoff.update({time:.7,reducedMotion:true});assert.equal(runoff.stats().drops.length,0);assert.equal(runoff.stats().contacts.length,0);
runoff.update({time:0});assert.equal(runoff.stats().time,0,'Rewind resets');
runoff.update({time:.1,fx:{density:0}});assert.equal(runoff.stats().extraDraws,0);
const root=new THREE.Group(),material=new THREE.MeshBasicMaterial();
const mesh=(r,g,type,color,a=0,b=0,c=0)=>{const m=new THREE.Mesh(g,material);m.position.set(a,b,c);r.add(m);return m;};
buildPondRunoff(root,rx,rz,{mesh,box:(r,type,a,b,c,w,h,d)=>mesh(r,new THREE.BoxGeometry(w,h,d),type,0,a,b,c)});root.updateMatrixWorld();
let vertices=0;root.traverse(o=>{if(!o.isMesh)return;const p=o.geometry.attributes.position;for(let i=0;i<p.count;i++){
 const v=new THREE.Vector3().fromBufferAttribute(p,i).applyMatrix4(o.matrixWorld);assert(Math.hypot(v.x/rx,v.z/rz)<1.015,'No added obstacle outside pond');assert(v.y>=-1e-6);vertices++;
}});
console.log(JSON.stringify({passed:true,samples,vertices,checks:['Physical flight/impact continuity','Wet-edge containment','Bounded lifetime and pool','Pause/repeat/reduced/density/reset','Fixture within original blocked pond']}));
