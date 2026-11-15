import assert from 'node:assert/strict';
import fs from 'node:fs';
import * as THREE from '../web/vendor/three/three.module.js';
import {createNightShadows} from '../web/chase-night.js';

const scene=new THREE.Scene(),moon=new THREE.DirectionalLight(0xffffff,.62);
moon.position.set(-30,55,10);scene.add(moon);
const trees=Array.from({length:16},(_,i)=>({x:i<8?-40:40,z:-100+(i%8)*3,h:6+i*.3,w:.85+i*.02}));
const shadows=createNightShadows(scene,trees,moon),mesh=scene.getObjectByName('CourseMoonShadows');
shadows.update({x:-35,y:100},0,false);
const matrix=new THREE.Matrix4(),base=new THREE.Vector3(),tip=new THREE.Vector3();
function checkProjection(side){
 assert.equal(mesh.count,8);
 for(let i=0;i<mesh.count;i++){
  mesh.getMatrixAt(i,matrix);base.set(0,0,0).applyMatrix4(matrix);tip.set(0,0,12).applyMatrix4(matrix);
  assert.equal(Math.sign(base.x),side);
  const tree=trees.find(t=>Math.abs(t.x-base.x)<1e-5&&Math.abs(t.z-base.z)<1e-5);
  assert(tree);assert(Math.abs(tip.y-base.y)<1e-5);
  // Independent line/ground intersection: a ray from the tree top in the
  // direction opposite the light reaches the ground after height / light.y.
  assert(Math.abs(tip.x-base.x+moon.position.x*tree.h/moon.position.y)<1e-5);
  assert(Math.abs(tip.z-base.z+moon.position.z*tree.h/moon.position.y)<1e-5);
 }
}
checkProjection(-1);const before=mesh.instanceMatrix.array.slice(),uploads=shadows.stats().uploads;
for(let n=0;n<3600;n++)shadows.update({x:-35,y:100},n/60,n%2===0);
assert.deepEqual(mesh.instanceMatrix.array,before);assert.equal(shadows.stats().uploads,uploads);
// Sideways relocation must invalidate selection even with time frozen and
// reduced motion enabled; the old y-only cache left the wrong trees selected.
shadows.update({x:35,y:100},0,true);checkProjection(1);
moon.intensity=.1;shadows.update({x:35,y:100},0,true);
assert(Math.abs(shadows.stats().opacity-.23*.1/.62)<1e-9);
moon.position.set(20,30,-10);shadows.update({x:35,y:100},0,true);checkProjection(1);
moon.position.y=-10;shadows.update({x:35,y:100},0,true);assert.equal(mesh.count,0);
shadows.dispose();assert(!scene.getObjectByName('CourseMoonShadows'));
const result={passed:true,checks:['Moon-direction projection for 24 rendered instances','No time-only uploads over 3600 updates','Lateral relocation works with frozen time and reduced motion','Cloud attenuation changes contrast, not geometry','Light motion invalidates projection; below-ground light casts no ground silhouette','Resources removed on dispose'],capacity:8,triangles:mesh.geometry.attributes.position.count/3};
fs.mkdirSync('output/back-nine-experience/landmarks',{recursive:true});fs.writeFileSync('output/back-nine-experience/landmarks/moon-shadows.json',JSON.stringify(result,null,2));console.log(JSON.stringify(result));
