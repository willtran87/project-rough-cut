import assert from 'node:assert/strict';
import * as T from '../web/vendor/three/three.module.js';
import {createDrainFogMaterials} from '../web/under-green-fog-materials.js';
const scene=new T.Scene();scene.fog=new T.Fog('#050d0f',8,43);
const camera=new T.PerspectiveCamera(58,1.6,.06,200),meshes=[],originals=[];
for(let i=0;i<40;i++){
 const material=new T.MeshPhongMaterial(),mesh=new T.Mesh(new T.BoxGeometry(1+i%4,2+i%3,1+i%7),material);
 mesh.position.set(Math.sin(i*2.31)*65,(i%6)-2,-i*2);mesh.rotation.set(i*.07,i*.13,i*.02);scene.add(mesh);meshes.push(mesh);originals.push(material);
}
const rejected=[];
for(const [key,value]of [['transparent',true],['opacity',.5],['fog',false],['alphaTest',.2],['depthWrite',false],['blending',T.AdditiveBlending]]){
 const m=new T.MeshBasicMaterial();m[key]=value;const mesh=new T.Mesh(new T.BoxGeometry(2,2,2),m);mesh.position.z=-70;scene.add(mesh);meshes.push(mesh);rejected.push({mesh,material:m});
}
const radial=new T.Mesh(new T.BoxGeometry(2,2,2),new T.MeshBasicMaterial());radial.position.set(100,0,-20);scene.add(radial);meshes.push(radial);
const audit=createDrainFogMaterials(scene,meshes);let vertexSamples=0,replacements=0;
for(let pose=0;pose<180;pose++){
 camera.position.set(Math.sin(pose*.3)*7,1.05+pose%3*.3,-pose%9);camera.rotation.set(Math.sin(pose*.21)*.8,pose*Math.PI/90,0,'YXZ');camera.updateMatrixWorld();audit.apply(camera);
 meshes.slice(0,40).forEach((mesh,i)=>{
  if(mesh.material===originals[i])return;replacements++;
  const matrix=new T.Matrix4().multiplyMatrices(camera.matrixWorldInverse,mesh.matrixWorld),p=mesh.geometry.attributes.position;
  for(let j=0;j<p.count;j++){const point=new T.Vector3().fromBufferAttribute(p,j).applyMatrix4(matrix);assert(-point.z>=43.01-1e-8);vertexSamples++;}
 });
 rejected.forEach(({mesh,material})=>assert.equal(mesh.material,material));audit.restore();originals.forEach((m,i)=>assert.equal(meshes[i].material,m));
}
camera.position.set(0,0,0);camera.rotation.set(0,0,0);const radialMaterial=radial.material;audit.apply(camera);assert.equal(radial.material,radialMaterial,'Radial distance must not substitute incompletely fogged peripheral geometry');audit.restore();
audit.setEnabled(false);audit.apply(camera);assert.equal(audit.stats().replaced,0);audit.dispose();assert(replacements>0);assert.equal(camera.far,200);
meshes.forEach(mesh=>{mesh.geometry.dispose();mesh.material.dispose();});
console.log(JSON.stringify({passed:true,poses:180,replacements,vertexSamples,excludedMaterials:rejected.length,radialCase:true}));
