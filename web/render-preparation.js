import * as THREE from './vendor/three/three.module.js';

// Prepare the same targets and shadow variants used by the real render path.
// Merely compiling the default framebuffer shader leaves the offscreen variant cold.
const queues=new WeakMap(), uploaded=new WeakMap();
const reflected=new WeakSet();
const preparation=new WeakMap();
const reportFor=renderer=>{let report=preparation.get(renderer);if(!report){report={compileAndUploadMs:0,jobs:0,gpuBatches:0,gpuWaitMs:0,maxUploadBatchBytes:0};preparation.set(renderer,report);}return report;};
function enqueue(renderer,work){const job=(queues.get(renderer)||Promise.resolve()).catch(()=>{}).then(work);queues.set(renderer,job);return job;}
// Do not keep uploading into the shared GPU queue while this tab is hidden.
// Cancellation is polled even in a hidden tab, so replaced scenes can release work.
export async function waitForPreparationTurn(cancelled=()=>false){
  while(typeof document!=='undefined'&&document.hidden&&!cancelled())await new Promise(resolve=>setTimeout(resolve,50));
  return !cancelled();
}
async function drainPreparation(renderer,cancelled,bytes=0){
  const started=performance.now();await waitForGPU(renderer,cancelled);
  const report=reportFor(renderer);report.gpuBatches++;report.gpuWaitMs+=performance.now()-started;report.maxUploadBatchBytes=Math.max(report.maxUploadBatchBytes,bytes);
  // Leave a scheduling window for the compositor and other GPU clients.
  await new Promise(resolve=>setTimeout(resolve,8));await waitForPreparationTurn(cancelled);
}
export const preparationStats=renderer=>({...preparation.get(renderer)});
// Loading work must yield to input without waiting for a potentially backed-up
// compositor frame. A task boundary also allows paint and timer callbacks to run.
export const yieldCpuPreparation=async(cancelled=()=>false)=>{
  // CPU construction already limits each slice to 5–8 ms. A scheduler yield
  // gives input/paint a turn without accumulating nested-timer clamp delays.
  if(typeof globalThis.scheduler?.yield==='function')await globalThis.scheduler.yield();
  else await new Promise(resolve=>setTimeout(resolve,0));
  await waitForPreparationTurn(cancelled);
};
// Polling for another task (images, model readiness or driver programs) must
// leave ordinary task callbacks runnable; never use scheduler continuations.
export const yieldPreparation=async(cancelled=()=>false)=>{await new Promise(resolve=>setTimeout(resolve,0));await waitForPreparationTurn(cancelled);};
// Poll a GPU fence without blocking the main thread. Submitted work is not
// necessarily finished when WebGLRenderer.render returns, especially in software.
export async function waitForGPU(renderer,cancelled=()=>false){
  const gl=renderer.getContext(),sync=gl.fenceSync(gl.SYNC_GPU_COMMANDS_COMPLETE,0);
  if(!sync)return;
  gl.flush();
  try{while(!cancelled()){
    const status=gl.clientWaitSync(sync,0,0);
    if(status===gl.ALREADY_SIGNALED||status===gl.CONDITION_SATISFIED)return;
    if(status===gl.WAIT_FAILED)throw new Error('Rendering preparation GPU fence failed');
    // Keep GPU polling timed: a fast CPU continuation here would busy-spin.
    await new Promise(resolve=>setTimeout(resolve,4));await waitForPreparationTurn(cancelled);
  }}finally{gl.deleteSync(sync);}
}

export function prepareRendering(renderer, object, camera, scene, target=null, cancelled=()=>false) {
  return enqueue(renderer,async()=>{
    if(!await waitForPreparationTurn(cancelled))return;
    const started=performance.now();
    const textures=new Set(),shadowGroup=new THREE.Group(),depthMaterials=new Map();
    object.traverse(o=>{
      if(!o.isMesh&&!o.isLine&&!o.isPoints&&!o.isSprite)return;
      const materials=Array.isArray(o.material)?o.material:[o.material];
      for(const m of materials)for(const key of ['map','alphaMap','normalMap','roughnessMap','metalnessMap','emissiveMap','displacementMap'])if(m?.[key])textures.add(m[key]);
      if(o.isMesh&&o.castShadow&&renderer.shadowMap.enabled){
        const source=materials[0];
        let depth=o.customDepthMaterial||depthMaterials.get(source);
        if(!depth){
          depth=new THREE.MeshDepthMaterial({map:source.map,alphaMap:source.alphaMap,alphaTest:source.alphaToCoverage?.5:source.alphaTest,side:source.shadowSide??(source.side===THREE.DoubleSide?THREE.DoubleSide:source.side===THREE.FrontSide?THREE.BackSide:THREE.FrontSide)});
          depth.displacementMap=source.displacementMap;depth.displacementScale=source.displacementScale;depth.displacementBias=source.displacementBias;
          depthMaterials.set(source,depth);
        }
        o.customDepthMaterial=depth;
        const proxy=o.clone(false);proxy.material=depth;proxy.castShadow=false;shadowGroup.add(proxy);
      }
    });
    async function compile(group,compileScene,renderTarget){
      const objects=[],seen=new Set();let visited=0;
      group.traverse(o=>{
        if(!o.isMesh&&!o.isLine&&!o.isPoints&&!o.isSprite)return;
        visited++;const g=o.geometry,materials=Array.isArray(o.material)?o.material:[o.material];
        // Same material and shader inputs need only one representative. Keep
        // rigid/skinned, instanced, morph and vertex-layout variants distinct.
        // Custom shader/node materials retain per-object preparation.
        if(g&&materials.every(m=>m?.isMeshBasicMaterial||m?.isMeshLambertMaterial||m?.isMeshDepthMaterial)){
          const attributes=Object.entries(g.attributes).map(([name,a])=>[name,a.itemSize,!!a.normalized,!!a.isInstancedBufferAttribute,a.meshPerAttribute||0]);
          const morph=Object.entries(g.morphAttributes).map(([name,a])=>[name,a.length,a[0]?.itemSize]);
          const key=JSON.stringify([o.type,materials.map(m=>[m.id,m.version]),attributes,morph,!!g.morphTargetsRelative,!!g.isInstancedBufferGeometry,!!o.receiveShadow,!!o.instanceColor,!!o.morphTexture,!!o._colorsTexture,o.skeleton?.bones.length||0]);
          if(seen.has(key))return;seen.add(key);
        }
        objects.push(o);
      });
      const report=reportFor(renderer);report.compileObjects=(report.compileObjects||0)+objects.length;report.compileDuplicatesSkipped=(report.compileDuplicatesSkipped||0)+visited-objects.length;
      const batch=new THREE.Group();
      for(let start=0;start<objects.length;start+=64){
        if(!await waitForPreparationTurn(cancelled))return;
        for(const o of objects.slice(start,start+64))batch.add(o.clone(false));
        const old=renderer.getRenderTarget();let ready;renderer.setRenderTarget(renderTarget);
        try{ready=renderer.compileAsync(batch,camera,compileScene);}finally{renderer.setRenderTarget(old);}
        await ready;await finishPrograms();batch.clear();
        // compileAsync has already waited for this shader batch. An additional
        // GPU fence here forces redundant driver round trips without uploads.
        await new Promise(resolve=>setTimeout(resolve,8));
      }
    }
    async function finishPrograms(){
      // compileAsync waits for only the current variant of a shared material.
      // Also prepare its skin/rigid, front/back and shadow variants, and spread
      // driver uniform reflection across frames instead of the first draw.
      let slice=performance.now();
      for(const program of [...renderer.info.programs]){
        while(!program.isReady()){if(cancelled())return;await yieldPreparation(cancelled);}
        if(cancelled())return;
        if(!reflected.has(program)){
          program.getUniforms();program.getAttributes();reflected.add(program);
          if(performance.now()-slice>5){await yieldPreparation(cancelled);slice=performance.now();}
        }
      }
    }
    let versions=uploaded.get(renderer);if(!versions){versions=new WeakMap();uploaded.set(renderer,versions);}
    // Byte and time budgets bound queued uploads; completion gates the next batch.
    let slice=performance.now(),bytes=0;
    for(const texture of textures){
      if(!await waitForPreparationTurn(cancelled))return;
      if(versions.get(texture)!==texture.version){
        const size=(texture.image?.width||1)*(texture.image?.height||1)*4*(texture.generateMipmaps?4/3:1);
        if(bytes&&bytes+size>16*1024*1024){await drainPreparation(renderer,cancelled,bytes);bytes=0;slice=performance.now();}
        if(cancelled())return;renderer.initTexture(texture);versions.set(texture,texture.version);bytes+=size;
      }
      if(bytes>=16*1024*1024){await drainPreparation(renderer,cancelled,bytes);bytes=0;slice=performance.now();}
      else if(performance.now()-slice>4){await yieldPreparation(cancelled);slice=performance.now();}
    }
    if(bytes)await drainPreparation(renderer,cancelled,bytes);
    await compile(object,scene,target);if(cancelled())return;
    if(shadowGroup.children.length){
      const shadowScene=new THREE.Scene(),shadowTarget=new THREE.WebGLRenderTarget(1,1);
      scene.traverseVisible(o=>{if(o.isLight)shadowScene.add(o.clone());});
      try{await compile(shadowGroup,shadowScene,shadowTarget);await finishPrograms();}finally{shadowTarget.dispose();}
    }
    if(cancelled())return;
    const report=reportFor(renderer);report.compileAndUploadMs+=performance.now()-started;report.jobs++;
    await yieldPreparation(cancelled);
  });
}

// Compile does not allocate vertex/index buffers. Warm every static chunk under
// the loading gate, including chunks outside the initial camera. Zero-length
// draws upload the real buffers without rasterizing the whole course.
export function prepareStaticBuffers(renderer,root,camera,scene,target,cancelled=()=>false){return enqueue(renderer,async()=>{
  if(!await waitForPreparationTurn(cancelled))return;
  const meshes=[];root.traverse(o=>{if(o.isMesh&&!o.isSkinnedMesh&&!o.isInstancedMesh)meshes.push(o);});
  const warmScene=new THREE.Scene();warmScene.fog=scene.fog;
  scene.traverseVisible(o=>{if(o.isLight)warmScene.add(o.clone());});
  const previous=renderer.getRenderTarget(),shadowUpdate=renderer.shadowMap.needsUpdate;
  const ranges=new Map(),group=new THREE.Group();warmScene.add(group);
  const started=performance.now();let prepared=0,maxSliceMs=0;
  try{
    renderer.shadowMap.needsUpdate=false;renderer.setRenderTarget(target);
    for(let start=0;start<meshes.length;){
      if(!await waitForPreparationTurn(cancelled))return;
      const sliceStart=performance.now();
      let bytes=0;
      while(start<meshes.length&&group.children.length<24){
        const original=meshes[start];
        const geometry=original.geometry;
        const size=Object.values(geometry.attributes).reduce((sum,a)=>sum+(a.data?.array||a.array).byteLength,geometry.index?.array.byteLength||0);
        if(group.children.length&&bytes+size>2*1024*1024)break;
        start++;bytes+=size;
        if(!ranges.has(geometry))ranges.set(geometry,{...geometry.drawRange});
        geometry.setDrawRange(0,0);
        const proxy=new THREE.Mesh(geometry,original.material);proxy.matrix.copy(original.matrixWorld);proxy.matrixAutoUpdate=false;proxy.frustumCulled=false;group.add(proxy);
      }
      renderer.render(warmScene,camera);prepared+=group.children.length;
      for(const [geometry,range]of ranges)geometry.setDrawRange(range.start,range.count);
      ranges.clear();group.clear();maxSliceMs=Math.max(maxSliceMs,performance.now()-sliceStart);
      // Restore shared renderer state before allowing another preparation job.
      renderer.setRenderTarget(previous);renderer.shadowMap.needsUpdate=shadowUpdate;
      await drainPreparation(renderer,cancelled,bytes);
      if(cancelled())return;
      renderer.setRenderTarget(target);renderer.shadowMap.needsUpdate=false;
    }
  }finally{
    for(const [geometry,range]of ranges)geometry.setDrawRange(range.start,range.count);
    renderer.setRenderTarget(previous);renderer.shadowMap.needsUpdate=shadowUpdate;
  }
  const report=reportFor(renderer);
  report.staticBuffers=prepared;report.staticBufferMaxSliceMs=maxSliceMs;report.staticBufferMs=performance.now()-started;preparation.set(renderer,report);
});}
