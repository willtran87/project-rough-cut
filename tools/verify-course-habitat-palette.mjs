import assert from 'node:assert/strict';
import * as THREE from '../web/vendor/three/three.module.js';
import {COURSE_LOOKS} from '../web/course-atmosphere.js';
import {courseHabitatTint,tintCourseHabitatGeometry,tintCourseHabitatGround} from '../web/course-habitat-palette.js';

let samples=0,maxStep=0;
for(const family of ['soil','leaf','conifer','verge'])for(const x of [-25,-12,0,12,25]){
  let previous;
  for(let progress=-20;progress<=760;progress+=.25){
    const c=courseHabitatTint(x,-progress*.16,family),values=c.toArray();
    assert(values.every(v=>Number.isFinite(v)&&v>.5&&v<1.5));
    assert(Math.abs(c.r*.2126+c.g*.7152+c.b*.0722-1)<1e-12,'Neutral-reflector luminance is preserved');
    assert.deepEqual(values,courseHabitatTint(x,-progress*.16,family).toArray(),'No camera, time or mutable state');
    if(previous)maxStep=Math.max(maxStep,...values.map((v,i)=>Math.abs(v-previous[i])));
    previous=values;samples++;
  }
}
assert(maxStep<.005,'No abrupt colour boundary across quarter-unit steps');
const wet=courseHabitatTint(0,-230*.16,'verge'),dry=courseHabitatTint(0,-495*.16,'verge');
assert(wet.b>wet.r&&dry.r>dry.b,'Wetland and dry grass have different hue directions');
assert.deepEqual(courseHabitatTint(0,-230*.16,'metal').toArray(),[1,1,1],'Unselected materials retain their identity');

const g=new THREE.PlaneGeometry(48,130,24,65),original=g.clone();
g.setAttribute('color',new THREE.Float32BufferAttribute(new Float32Array(g.attributes.position.count*3).fill(.5),3));
const matrix=new THREE.Matrix4().makeRotationX(-Math.PI/2);matrix.setPosition(0,0,-55);
tintCourseHabitatGeometry(g,matrix,'soil');
for(const key of ['position','normal','uv'])assert.deepEqual(g.attributes[key].array,original.attributes[key].array);
assert.deepEqual(g.index.array,original.index.array);
const black=new THREE.BoxGeometry(1,1,1);black.setAttribute('color',new THREE.Float32BufferAttribute(new Float32Array(black.attributes.position.count*3),3));
tintCourseHabitatGeometry(black,null,'verge',{x:0,z:-80});assert(black.attributes.color.array.every(v=>v===0),'Black stays black; this is reflectance, not added illumination');

const mesh=new THREE.Mesh(new THREE.PlaneGeometry(48,130),new THREE.MeshLambertMaterial());mesh.rotation.x=-Math.PI/2;mesh.position.z=-55;
tintCourseHabitatGround(mesh);assert.equal(mesh.geometry.index.count/3,3120);assert(mesh.material.vertexColors);
mesh.geometry.computeBoundingBox();assert.deepEqual(mesh.geometry.boundingBox.min.toArray(),[-24,-65,0]);assert.deepEqual(mesh.geometry.boundingBox.max.toArray(),[24,65,0]);
const p=mesh.geometry.attributes.position,c=mesh.geometry.attributes.color,v=new THREE.Vector3();
for(let i=0;i<p.count;i++){v.fromBufferAttribute(p,i).applyMatrix4(mesh.matrixWorld);const expected=courseHabitatTint(v.x,v.z,'soil');assert(Math.abs(c.getX(i)-expected.r)<1e-7&&Math.abs(c.getY(i)-expected.g)<1e-7&&Math.abs(c.getZ(i)-expected.b)<1e-7);}
for(const geom of [g,original,black,mesh.geometry])geom.dispose();mesh.material.dispose();
console.log(JSON.stringify({passed:true,districts:COURSE_LOOKS.length,samples,maxStep,geometryUnchanged:true,blackPreserved:true,fallbackGround:true}));
