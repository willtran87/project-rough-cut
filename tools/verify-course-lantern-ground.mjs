import assert from 'node:assert/strict';
import * as THREE from '../web/vendor/three/three.module.js';
import {createCourseGroundLighting} from '../web/course-ground-lighting.js';

const anchors=Array.from({length:40},(_,i)=>({position:new THREE.Vector3(Math.sin(i*1.7)*12,.28+i%3,-i*2.7),intensity:1}));
const lamps=[new THREE.PointLight(0xffedbb,18,14,2),new THREE.PointLight(0xffbb69,3,7,2),new THREE.PointLight(0xffbb76,5,2.5,2)];lamps[0].position.set(5,3,-20);lamps[1].position.set(-8,2,-65);lamps[2].position.set(4,2,-105);
const parent=new THREE.Group();parent.position.x=2;parent.add(lamps[1]);
const allSources=[...anchors.map(a=>({position:a.position,range:3.25})),...lamps.map(l=>({position:l.getWorldPosition(new THREE.Vector3()),range:l.distance}))];
const mesh=new THREE.Mesh(new THREE.PlaneGeometry(48,130),new THREE.MeshLambertMaterial());mesh.rotation.x=-Math.PI/2;mesh.position.z=-55;
const originalCompile=mesh.material.onBeforeCompile,originalKey=mesh.material.customProgramCacheKey;
let oldDisposals=0;mesh.geometry.addEventListener('dispose',()=>oldDisposals++);
const field=createCourseGroundLighting(mesh,anchors,lamps,{maxVaryings:64});assert(field);assert.equal(oldDisposals,1);assert(!createCourseGroundLighting(mesh,anchors,lamps,{maxVaryings:64}),'Do not re-tessellate an existing ground');
const g=mesh.geometry,p=g.attributes.position,uv=g.attributes.uv,n=g.attributes.normal,normal=new THREE.Vector3(),a=new THREE.Vector3(),b=new THREE.Vector3(),c=new THREE.Vector3();let area=0,samples=0;
for(let i=0;i<p.count;i++){
 assert.equal(p.getZ(i),0);assert.deepEqual([n.getX(i),n.getY(i),n.getZ(i)],[0,0,1]);
 assert(Math.abs(uv.getX(i)-(p.getX(i)+24)/48)<1e-7);assert(Math.abs(uv.getY(i)-(p.getY(i)+65)/130)<1e-7);
}
for(let i=0;i<g.index.count;i+=3){
 const indices=[g.index.getX(i),g.index.getX(i+1),g.index.getX(i+2)];a.fromBufferAttribute(p,indices[0]);b.fromBufferAttribute(p,indices[1]);c.fromBufferAttribute(p,indices[2]);normal.crossVectors(b.clone().sub(a),c.clone().sub(a));assert(normal.z>0);area+=normal.length()/2;
 const ids=[];for(const [name,attribute]of Object.entries(g.attributes))if(name.startsWith('courseLampIndices')){
  for(let j=0;j<4;j++){const value=attribute.array[indices[0]*4+j];assert(indices.every(index=>attribute.array[index*4+j]===value),'Candidate IDs must be constant across each triangle');if(value)ids.push(value-1);}
 }
 assert.equal(ids.length,new Set(ids).size);
 for(const [u,v]of [[0,0],[.999,0],[0,.999],[.2,.3],[.1,.7],[.65,.2]]){
  const q=a.clone().multiplyScalar(1-u-v).addScaledVector(b,u).addScaledVector(c,v).applyMatrix4(mesh.matrixWorld);
  allSources.forEach((source,id)=>{if(source.position.distanceTo(q)<source.range-1e-7)assert(ids.includes(id),'Every source reaching a triangle point is retained');});samples++;
 }
}
assert(Math.abs(area-48*130)<1e-5);assert.equal(p.count,6240);assert.equal(g.index.count/3,3120);
const tilted=new THREE.Mesh(new THREE.PlaneGeometry(8,8),new THREE.MeshLambertMaterial());tilted.rotation.x=-1;const original=tilted.geometry;assert(!createCourseGroundLighting(tilted,anchors,[],{maxVaryings:64}));assert.equal(tilted.geometry,original);
const shader={uniforms:{},vertexShader:'#include <worldpos_vertex>',fragmentShader:'#include <lights_fragment_begin>\n#include <lights_fragment_end>'};mesh.material.onBeforeCompile(shader);assert.equal(shader.uniforms.courseGroundSources.value.length,43);lamps[0].intensity=0;lamps[1].visible=false;anchors[0].intensity=.5;field.update();assert.equal(shader.uniforms.courseGroundSources.value[40].w,0);assert.equal(shader.uniforms.courseGroundSources.value[41].w,0);assert.equal(shader.uniforms.courseGroundSources.value[0].w,1.4);
const fallback=new THREE.Mesh(new THREE.PlaneGeometry(8,8),new THREE.MeshLambertMaterial());fallback.rotation.x=-Math.PI/2;const fallbackGeometry=fallback.geometry;
assert(!createCourseGroundLighting(fallback,anchors,lamps,{maxVaryings:1}));lamps[0].castShadow=true;assert(!createCourseGroundLighting(fallback,anchors,lamps,{maxVaryings:64}));assert.equal(fallback.geometry,fallbackGeometry);
field.dispose();field.dispose();assert.equal(mesh.material.onBeforeCompile,originalCompile);assert.equal(mesh.material.customProgramCacheKey,originalKey);g.dispose();original.dispose();fallbackGeometry.dispose();
console.log(JSON.stringify({passed:true,samples,vertices:p.count,triangles:g.index.count/3,area,checks:['Original planar surface, UVs, normals and winding','Constant conservative lamp IDs','No duplicate or missing sources','Unsupported transforms preserve generic lighting','Old geometry disposed once']}));
