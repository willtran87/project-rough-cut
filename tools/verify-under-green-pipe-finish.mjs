import assert from 'node:assert/strict';
import * as T from '../web/vendor/three/three.module.js';
import {buildDrainPump} from '../web/under-green-machinery-detail.js';
import {buildDrainPipeNetwork} from '../web/under-green-pipe-network.js';
import {pipeJointFrame,PIPE_JOINTS,prepareDrainPipeFinish} from '../web/under-green-pipe-finish.js';
// The original pass-43 before/after snapshot comparison (output/, untracked) is
// gone; this keeps the durable finish invariants.
function build(fn){const meshes=[];const put=(g,type,x,y,z,sx=1,sy=1,sz=1,rx=0,ry=0,rz=0)=>{const m=new T.Mesh(g.clone(),new T.MeshBasicMaterial());m.position.set(x,y,z);m.scale.set(sx,sy,sz);m.rotation.set(rx,ry,rz);m.updateMatrixWorld();m.userData.type=type;meshes.push(m);};const box=(t,x,y,z,w,h,d)=>{const g=new T.BoxGeometry(w,h,d);put(g,t,x,y,z);g.dispose();};const stats=fn({put,box});return {meshes,stats};}
const after=build(buildDrainPipeNetwork);let bytes=0,treated=0;
for(const b of after.meshes){
 for(const name of ['position','normal','uv'])for(const v of b.geometry.attributes[name].array)assert(Number.isFinite(v),'Non-finite '+name);
 if(b.userData.type==='pipeSurface'){const f=b.geometry.attributes.pipeJointFrame;assert(f,'pipeSurface without joint frame');assert.equal(f.count,b.geometry.attributes.position.count);bytes+=f.array.byteLength;treated++;for(let j=0;j<f.array.length;j++)assert(Number.isFinite(f.array[j]));}
 else assert(!b.geometry.attributes.pipeJointFrame,'Joint frame leaked onto '+b.userData.type);
}
assert(treated>0);assert.equal(bytes,after.stats.finishAttributeBytes);
const pumpAfter=build(buildDrainPump);assert(pumpAfter.meshes.length>0);
for(const b of pumpAfter.meshes)for(const name of ['position','normal','uv'])for(const v of b.geometry.attributes[name].array)assert(Number.isFinite(v));

// Every seam capable of affecting a piece must remain in that piece's compact
// frame; compare against all authored fittings, including the adjacent repair.
let samples=0;
for(const profile of [0,1,2,4])for(let start=-30;start<80;start+=.37){
 const end=start+8,frame=pipeJointFrame(profile,start,end);
 for(let j=0;j<=80;j++){
  const t=start+(end-start)*j/80,all=Math.min(...PIPE_JOINTS[profile].map(c=>Math.abs(c-t))),local=Math.min(...frame.slice(0,3).map(c=>Math.abs(c-t)));
  if(all<.24)assert(Math.abs(local-all)<1e-9,'Seam lost from compact frame');samples++;
 }
}
const metal=new T.Texture(),rust=new T.Texture(),materials={machineIron:new T.MeshPhongMaterial({map:metal})};
const finish=prepareDrainPipeFinish(materials,{sets:{rust:{map:rust}},stats:()=>({tilePixels:627})});const shader={uniforms:{},vertexShader:T.ShaderLib.phong.vertexShader,fragmentShader:T.ShaderLib.phong.fragmentShader};materials.pipeSurface.onBeforeCompile(shader);
assert.equal(shader.uniforms.pipeRustMap.value,rust);assert.equal(materials.pipeSurface.map,metal);assert.equal(materials.pipeSurface.specularMap,null);assert.equal(shader.uniforms.pipeLeaks.value.length,after.stats.leaks.length);assert(after.stats.leaks.length>=4);assert(shader.fragmentShader.includes('material.specularShininess=mix(12.,58.,pipeWet)'));assert(shader.vertexShader.includes('vPipeJoints=pipeJointFrame'));
console.log(JSON.stringify({passed:true,meshes:after.meshes.length,pumpMeshes:pumpAfter.meshes.length,treated,attributeBytes:bytes,seamSamples:samples,stats:finish.stats()}));
