import * as THREE from './vendor/three/three.module.js';

// Bind before practical-light variants are built. Clones isolate this finish
// from shared actor materials; world position follows the real receiver.
export function createFloodWetness(meshes,state){
 const variants=new Map(),receivers=[],owned=[],bounds=new THREE.Box3();
 for(const mesh of new Set(meshes)){
  const original=mesh.material;
  if(!original?.isMeshPhongMaterial||original.transparent||original.opacity!==1||mesh.isSkinnedMesh||mesh.isInstancedMesh||original.userData.drainColorRole==='water')continue;
  mesh.updateWorldMatrix(true,false);mesh.geometry.computeBoundingBox();bounds.copy(mesh.geometry.boundingBox).applyMatrix4(mesh.matrixWorld);
  if(bounds.min.y>.41||bounds.max.y<-.01)continue;
  let material=variants.get(original);
  if(!material){
   material=original.clone();const compile=original.onBeforeCompile,key=original.customProgramCacheKey();
   material.onBeforeCompile=function(shader,renderer){
    compile.call(this,shader,renderer);shader.uniforms.floodReceiverState=state;
    shader.defines={...shader.defines,DRAIN_FLOOD_RECEIVER:1};
    shader.vertexShader='varying vec3 floodReceiverPoint;\n'+shader.vertexShader;
    shader.vertexShader=shader.vertexShader.replace('#include <project_vertex>','#include <project_vertex>\nfloodReceiverPoint=(modelMatrix*vec4(transformed,1.)).xyz;');
    shader.fragmentShader='varying vec3 floodReceiverPoint;uniform vec3 floodReceiverState;\n'+shader.fragmentShader;
    // Run after texture authorship, preserving the underlying pixel clusters.
    shader.fragmentShader=shader.fragmentShader.replace('#include <alphatest_fragment>',`#include <alphatest_fragment>
     float receiverWet=0.;float receiverContact=0.;
     if(floodReceiverState.z>.001&&floodReceiverPoint.y<floodReceiverState.y+.01){
      vec2 grain=floor(floodReceiverPoint.xz*96.)/96.;
      float uneven=sin(grain.x*11.+grain.y*7.)*.003+sin(grain.y*29.-grain.x*13.)*.002;
      receiverWet=smoothstep(0.,.018,floodReceiverState.y+uneven-floodReceiverPoint.y)*floodReceiverState.z;
      receiverContact=(1.-smoothstep(.003,.012,abs(floodReceiverPoint.y-floodReceiverState.x-uneven)))*step(.006,floodReceiverState.x);
      #ifdef DRAIN_GROUND_FINISH
       // Existing seepage and a new flood saturate the same paving. Apply
       // only the remaining color change, rather than darkening it twice.
       diffuseColor.rgb*=mix(vec3(1.),groundSaturationTint,max(groundWet,receiverWet))
         /mix(vec3(1.),groundSaturationTint,groundWet);
       diffuseColor.rgb*=1.-receiverContact*.055;
      #else
       diffuseColor.rgb*=1.-receiverWet*.22-receiverContact*.055;
      #endif
     }
    `);
    shader.fragmentShader=shader.fragmentShader.replace('#include <lights_fragment_begin>',`
     material.specularStrength=mix(material.specularStrength,max(material.specularStrength,.38),receiverWet*.55);
     material.specularStrength=max(material.specularStrength,receiverContact*.4);
     material.specularShininess=mix(material.specularShininess,max(material.specularShininess,42.),receiverWet);
     #include <lights_fragment_begin>
    `);
   };
   material.customProgramCacheKey=()=>key+'-flood-receiver-v2-ground';owned.push(material);variants.set(original,material);
  }
  mesh.material=material;receivers.push({mesh,original});
 }
 return {stats:()=>({meshes:receivers.length,materials:owned.length,worldAnchored:true,extraDraws:0}),inspect:()=>receivers.map(({mesh})=>({name:mesh.name,uuid:mesh.uuid})),dispose(){for(const {mesh,original}of receivers)mesh.material=original;owned.forEach(m=>m.dispose());}};
}
