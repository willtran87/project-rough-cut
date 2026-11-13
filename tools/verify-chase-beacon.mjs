import assert from 'node:assert/strict';
import fs from 'node:fs';
import * as THREE from '../web/vendor/three/three.module.js';
import {createChaseBeaconShadows} from '../web/chase-beacon-shadows.js';

const scene=new THREE.Scene(),cover=createChaseBeaconShadows(scene),material=new THREE.MeshLambertMaterial(),original=[];
for(const z of [0,-100,-200]){
 const g=new THREE.BoxGeometry(3,3.1,40);g.translate(-19,1.55,z);cover.collect(g,material);original.push(new THREE.Mesh(g,new THREE.MeshBasicMaterial({side:THREE.DoubleSide})));
}
const light=new THREE.PointLight(0xff2010,600,40,2);light.position.set(-25,3.45,0);scene.add(light);cover.build(light);
const proxies=scene.children.filter(o=>o.name==='BeaconCover'),ray=new THREE.Raycaster();ray.layers.enable(29);scene.updateMatrixWorld(true);
// Source-to-ground rays are compared against the visible wall geometry,
// including its ends. A proxy may not seal the open route around the hedge.
let checks=0;
for(const z of [0,-100,-200])for(const x of [-25,-13]){
 light.position.set(x,3.45,z);cover.update(checks);scene.updateMatrixWorld(true);
 for(let n=-25;n<=25;n++){
  const destination=new THREE.Vector3(x===-25?-10:-28,.025,z+n),direction=destination.clone().sub(light.position),length=direction.length();ray.set(light.position,direction.normalize());ray.far=length;
  const d=ray.ray.direction,axis=Math.abs(d.x)>=Math.abs(d.z)?new THREE.Vector3(Math.sign(d.x),0,0):new THREE.Vector3(0,0,Math.sign(d.z));
  light.shadow.camera.position.copy(light.position);light.shadow.camera.lookAt(light.position.clone().add(axis));light.shadow.camera.updateMatrixWorld(true);
  const selected=proxies.filter(m=>m.intersectsFrustum());assert(selected.length<=1);
  const actual=original.some(m=>ray.intersectObject(m).length),shadow=ray.intersectObjects(selected).length>0;assert.equal(shadow,actual,`occlusion mismatch ${x}/${z}/${n}`);checks++;
 }
}
const before=cover.stats().updates;
for(let i=0;i<600;i++){light.intensity=i%2?315:600;cover.update(checks+i/60);}
assert.equal(cover.stats().updates,before);
const shutter=new THREE.Group(),panel=new THREE.Mesh(new THREE.BoxGeometry(11,4.8,.14),material);shutter.add(panel);scene.add(shutter);cover.addCaster(shutter);cover.update(1000);const stationary=cover.stats().updates;shutter.position.y=-2;cover.update(1000);assert.equal(cover.stats().updates,stationary+1);assert(panel.castShadow&&panel.layers.isEnabled(29));
cover.update(0);assert(cover.stats().updates>stationary+1,'Retry must invalidate the old shadow pose');
const active=cover.stats().updates;light.intensity=0;light.position.z=0;cover.update(1);assert.equal(cover.stats().updates,active);assert.equal(light.shadow.needsUpdate,false);light.intensity=315;cover.update(2);assert.equal(cover.stats().updates,active+1);
const stats=cover.stats();cover.dispose();assert(!scene.getObjectByName('BeaconCover'));
const result={passed:true,checks,stats,claims:['Rendered proxy rays match visible cover and open ends','Finite light selection follows relocations across the course','Stationary pulses do not rebuild shadows','Moving garage shutter and retry invalidate cached shadow']};
fs.mkdirSync('output/back-nine-experience/beacon',{recursive:true});fs.writeFileSync('output/back-nine-experience/beacon/rules.json',JSON.stringify(result,null,2));console.log(JSON.stringify(result));
