import * as THREE from './vendor/three/three.module.js';
import {waitForGPU,waitForPreparationTurn,yieldCpuPreparation} from './render-preparation.js';

// Scheduler continuations can outrank ordinary timers/network completions for
// an entire build. Give those queues a turn regularly, while retaining cheap
// scheduler yields between construction slices. Each scene owns its deadline.
// The 32ms interval is a scheduling target, not a bound on an atomic builder.
export function createCourseConstructionYield(){
 let nextOrdinaryTurn=0;
 return async(cancelled=()=>false)=>{
  if(!await waitForPreparationTurn(cancelled))return false;
  if(performance.now()>=nextOrdinaryTurn){
   await new Promise(resolve=>setTimeout(resolve,0));
   nextOrdinaryTurn=performance.now()+32;
   return waitForPreparationTurn(cancelled);
  }
  await yieldCpuPreparation(cancelled);
  return !cancelled();
 };
}

// compileAsync leaves vertex/index buffers and driver draw pipelines cold.
// Warm the real layouts, in the real framebuffer format, using one triangle
// and a tiny scissor. Share buffers even for instancing; never flood the GPU.
export async function prepareCourseBuffers(renderer,scene,camera,cancelled=()=>false){
 const meshes=[];scene.traverse(o=>{if(o.isMesh)meshes.push(o);});
 const warm=new THREE.Scene();warm.fog=scene.fog;scene.traverseVisible(o=>{if(o.isLight)warm.add(o.clone());});
 const group=new THREE.Group();warm.add(group);
 const viewport=renderer.getViewport(new THREE.Vector4()),scissor=renderer.getScissor(new THREE.Vector4()),scissorTest=renderer.getScissorTest(),ranges=new Map();
 let batches=0,maxBytes=0;
 try{
  for(let i=0;i<meshes.length;){
   if(!await waitForPreparationTurn(cancelled))return {batches,maxBytes,cancelled:true};let bytes=0;
   while(i<meshes.length&&group.children.length<16){
    const source=meshes[i],g=source.geometry,size=Object.values(g.attributes).reduce((n,a)=>n+a.array.byteLength,g.index?.array.byteLength||0);
    if(bytes&&bytes+size>2*1024*1024)break;i++;bytes+=size;
    if(!ranges.has(g))ranges.set(g,{...g.drawRange});g.setDrawRange(0,3);
    const proxy=source.clone(false);proxy.visible=true;proxy.frustumCulled=false;proxy.layers.enable(0);
    proxy.customDepthMaterial=source.customDepthMaterial;proxy.customDistanceMaterial=source.customDistanceMaterial;
    if(source.isInstancedMesh){proxy.instanceMatrix=source.instanceMatrix;proxy.instanceColor=source.instanceColor;proxy.count=1;}
    group.add(proxy);
   }
   renderer.setViewport(0,0,8,8);renderer.setScissor(0,0,8,8);renderer.setScissorTest(true);
   renderer.render(warm,camera);batches++;maxBytes=Math.max(maxBytes,bytes);
   for(const[g,r]of ranges)g.setDrawRange(r.start,r.count);ranges.clear();group.clear();
   renderer.setViewport(viewport);renderer.setScissor(scissor);renderer.setScissorTest(scissorTest);
   await waitForGPU(renderer,cancelled);await new Promise(r=>setTimeout(r,8));
  }
 }finally{for(const[g,r]of ranges)g.setDrawRange(r.start,r.count);renderer.setViewport(viewport);renderer.setScissor(scissor);renderer.setScissorTest(scissorTest);warm.traverse(o=>{if(o.isLight)o.shadow?.dispose();});}
 return {batches,maxBytes};
}

// Small maps share a fence, but large atlases remain isolated. Bound both
// upload bytes (including mip levels) and count before yielding to other apps.
export async function prepareCourseTextures(renderer,maps,cancelled=()=>false){
 const limit=2*1024*1024;let bytes=0,count=0,batches=0,maxBytes=0,maxCount=0;
 async function drain(){if(!count)return;await waitForGPU(renderer,cancelled);batches++;maxBytes=Math.max(maxBytes,bytes);maxCount=Math.max(maxCount,count);bytes=count=0;await new Promise(r=>setTimeout(r,4));}
 for(const map of maps){
  if(!await waitForPreparationTurn(cancelled))return {batches,maxBytes,maxCount,cancelled:true};
  const image=map.image,size=Math.ceil((image?.width||1)*(image?.height||1)*4*(map.generateMipmaps?4/3:1));
  if(count&&(count>=4||bytes+size>limit))await drain();
  if(cancelled())return {batches,maxBytes,maxCount,cancelled:true};
  renderer.initTexture(map);bytes+=size;count++;
  if(bytes>=limit||count>=4)await drain();
 }
 await drain();return {batches,maxBytes,maxCount};
}
