import assert from 'node:assert/strict';
import * as THREE from '../web/vendor/three/three.module.js';
import {courseExitRelease} from '../web/course-exit-release.js';
import {createCourseExitMechanisms} from '../web/course-exit-mechanisms.js';
const completed=['audit-bell','field-log','release-review'];
const frame={completed,hasKey:true,valveOpen:true,exitRoute:'shed',sealing:true};
for(const missing of completed)assert.equal(courseExitRelease({...frame,completed:completed.filter(id=>id!==missing),exitProgress:1}).shedDoor,0);
assert.equal(courseExitRelease({...frame,hasKey:false,exitProgress:1}).shedDoor,0);
assert.equal(courseExitRelease({...frame,exitRoute:'drain',valveOpen:false,exitProgress:1}).drainLift,0);
assert.equal(courseExitRelease({...frame,sealing:false}).drainLift,0);
const root=new THREE.Group(),door=new THREE.Group(),gate=new THREE.Group();door.position.set(-2,0,-10);gate.position.set(-10,0,-12);root.add(door,gate);
const mechanism=createCourseExitMechanisms(root,door,gate);let last=0;
for(let i=0;i<=100;i++){
 const f={...frame,exitRoute:'drain',exitProgress:i/100};mechanism.update(f);root.updateMatrixWorld(true);const s=mechanism.stats();
 assert(s.pose.drainLift>=last);last=s.pose.drainLift;assert.equal(s.pose.shedDoor,0);
 for(const c of s.cables){assert(Math.abs(c.top-2.52)<1e-10);assert(Math.abs(c.bottom-(.90+s.pose.drainLift))<1e-10);assert(c.top>c.bottom);}
 const positions=[];root.traverse(o=>{if(o.isMesh)positions.push(...o.matrixWorld.elements);});mechanism.update(f);root.updateMatrixWorld(true);const repeated=[];root.traverse(o=>{if(o.isMesh)repeated.push(...o.matrixWorld.elements);});assert.deepEqual(repeated,positions);
}
assert.equal(last,1.3);assert.equal(courseExitRelease({...frame,exitProgress:.15}).shedDoor,0);assert(courseExitRelease({...frame,exitProgress:.15}).shedBolt>.5);
assert.equal(courseExitRelease({...frame,sealing:false,exitComplete:true}).shedDoor,1.3);
const owned=[];root.traverse(o=>{if(o.isMesh)owned.push(o.geometry);});let disposed=0;for(const g of owned)g.addEventListener('dispose',()=>disposed++);mechanism.dispose();mechanism.dispose();assert.equal(disposed,owned.length);assert.equal(door.children.length,0);assert.equal(gate.children.length,0);assert.equal(root.children.length,2);
console.log(JSON.stringify({passed:true,checks:['Prerequisites and selected route own release','Bolt withdraws before the door swings','101 gate poses keep cables attached below their fixed drum','Repeated frozen poses do not drift','Completed release persists; owned resources dispose exactly once'],meshes:owned.length}));
