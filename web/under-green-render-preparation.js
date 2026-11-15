import * as THREE from './vendor/three/three.module.js';
import {prepareRendering,waitForGPU,yieldPreparation} from './render-preparation.js';

// Compile/reflection alone leaves buffers, bones and morph textures cold. Submit
// the actual objects in bounded one-triangle batches, including hidden effects.
// A one-pixel viewport also warms drivers that defer pipeline creation until a
// nonempty draw; zero-index uploads alone leave that work for Joe's entrance.
// Instanced buffers are keyed by object identity, so clones cannot warm them.
export async function prepareDrainRendering(renderer,scene,camera){
 const started=performance.now();
 await prepareRendering(renderer,scene,camera,scene);
 scene.updateMatrixWorld(true);
 const meshes=[];scene.traverse(o=>{if(o.isMesh)meshes.push(o);});
 const warm=new THREE.Scene();warm.fog=scene.fog;warm.matrixWorldAutoUpdate=false;
 scene.traverseVisible(o=>{if(o.isLight){const light=o.clone();light.matrixWorld.copy(o.matrixWorld);warm.add(light);}});
 const lights=warm.children.length,autoClear=renderer.autoClear;
 const viewport=renderer.getViewport(new THREE.Vector4()),scissor=renderer.getScissor(new THREE.Vector4()),scissorTest=renderer.getScissorTest();
 let batches=0,maxBatchMs=0;
 try{
  // Viewport clipping already bounds raster work. Preserve the real scissor
  // state as well, since drivers can specialize pipelines on raster state.
  renderer.autoClear=false;renderer.setViewport(0,0,1,1);
  for(let start=0;start<meshes.length;){
   const ranges=new Map(),states=[];let bytes=0;
   while(start<meshes.length&&states.length<24){
    const mesh=meshes[start],g=mesh.geometry;
    const size=Object.values(g.attributes).reduce((n,a)=>n+(a.data?.array||a.array).byteLength,g.index?.array.byteLength||0);
    if(states.length&&bytes+size>2*1024*1024)break;
    start++;bytes+=size;states.push([mesh,mesh.visible,mesh.frustumCulled,mesh.children,mesh.count]);mesh.children=[];
    if(!ranges.has(g)){
     ranges.set(g,{...g.drawRange,groups:g.groups});
     g.groups=g.groups.map(group=>({...group,start:0,count:3}));
    }
    g.setDrawRange(0,3);mesh.visible=true;mesh.frustumCulled=false;
    if(mesh.isInstancedMesh)mesh.count=Math.min(1,mesh.instanceMatrix.count);
    // Borrow traversal references only. Do not reparent or reorder the real
    // scene, change its transforms, or replace a skinned/instanced object.
    warm.children.push(mesh);
   }
   const slice=performance.now();
   try{renderer.render(warm,camera);}
   finally{
    for(const [g,r]of ranges){g.setDrawRange(r.start,r.count);g.groups=r.groups;}
    for(const [mesh,visible,culled,children,count]of states){mesh.visible=visible;mesh.frustumCulled=culled;mesh.children=children;if(mesh.isInstancedMesh)mesh.count=count;}
    warm.children.length=lights;
   }
   maxBatchMs=Math.max(maxBatchMs,performance.now()-slice);batches++;
   await waitForGPU(renderer);await yieldPreparation();
  }

 }finally{renderer.autoClear=autoClear;renderer.setViewport(viewport);renderer.setScissor(scissor);renderer.setScissorTest(scissorTest);warm.children.length=lights;}
 return {meshes:meshes.length,batches,maxBatchMs,milliseconds:performance.now()-started};
}
