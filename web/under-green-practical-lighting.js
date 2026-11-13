import * as THREE from './vendor/three/three.module.js';
import {dampLampLevel} from './under-green-atmosphere.js';
import {stableLightMaterialSort} from './local-light-culling.js';

// Practical lights are fixed in the world, not selected around the viewer.
// Static batches omit only sources proven outside their complete world bounds.
// Moving/morphing/instanced scenery keeps the full set, so no stale bounding
// box can make a walking actor or travelling gate lose its illumination.
export function createDrainPracticalLighting({scene,renderer,lamps,staticMeshes=[],additionalMaterials=[]}){
 const sources=lamps.map((lamp,index)=>({index,world:new THREE.Vector3(lamp.x,lamp.height??2.8,-lamp.y),
  base:new THREE.Color(lamp.color??(index%3===1?0x79c8c5:0xe9b575)),power:8*(lamp.power??1),
  uniform:{position:new THREE.Vector3(),color:new THREE.Color(),distance:lamp.reach??13,decay:1.4}}));
 const all=sources.map((_,i)=>i),variants=new Map(),bindings=[],owned=[],originalHooks=new Map(),stationary=new Set();
 const supported=m=>m?.isMeshLambertMaterial||m?.isMeshPhongMaterial||m?.isMeshStandardMaterial;
 let lastTime=0,lastReduced=false,enabled=true;
 function prepare(material,indices,compile=material.onBeforeCompile,key=material.customProgramCacheKey()){
  if(!indices.length)return;
  const uniforms=indices.map(i=>sources[i].uniform);
  material.onBeforeCompile=function(shader,render){
   compile.call(this,shader,render);
   shader.uniforms.drainPracticals={value:uniforms};
   shader.fragmentShader=shader.fragmentShader.replace('#include <lights_pars_begin>',`#include <lights_pars_begin>\nuniform PointLight drainPracticals[${indices.length}];`);
   shader.fragmentShader=shader.fragmentShader.replace('#include <lights_fragment_begin>',`#include <lights_fragment_begin>
    #if defined( RE_Direct )
     #pragma unroll_loop_start
     for ( int i = 0; i < ${indices.length}; i ++ ) {
      getPointLightInfo( drainPracticals[ i ], geometryPosition, directLight );
      RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
     }
     #pragma unroll_loop_end
    #endif
   `);
  };
  material.customProgramCacheKey=()=>key+'-drain-practical-count-'+indices.length;
  material.needsUpdate=true;
 }
 scene.updateMatrixWorld(true);
 // Clone static materials before preparing their originals for moving meshes.
 // This preserves existing crafted-surface hooks and transparent effect state.
 for(const mesh of staticMeshes){
  if(!supported(mesh.material)||mesh.isSkinnedMesh||mesh.isInstancedMesh)continue;
  mesh.geometry.computeBoundingBox();const bounds=mesh.geometry.boundingBox.clone().applyMatrix4(mesh.matrixWorld).expandByScalar(mesh.userData.drainLightPadding??0);
  const indices=all.filter(i=>bounds.distanceToPoint(sources[i].world)<=sources[i].uniform.distance+.01);
  const original=mesh.material,key=original.uuid+':'+indices.join(',');
  let material=variants.get(key);
  if(!material){
   material=original.clone();material.userData.localLightSourceId=original.id;
   material.onBeforeRender=function(...args){original.onBeforeRender?.(...args);this.opacity=original.opacity;this.color.copy(original.color);};
   // clone() does not copy onBeforeCompile/customProgramCacheKey.
   material.onBeforeCompile=original.onBeforeCompile;material.customProgramCacheKey=original.customProgramCacheKey;
   prepare(material,indices,original.onBeforeCompile,original.customProgramCacheKey());
   variants.set(key,material);owned.push(material);
  }
  mesh.material=material;stationary.add(mesh);bindings.push({mesh,original,indices,bounds});
 }
 // Signals and the sluice witness swap materials after construction. Include
 // that material bank even when a particular inactive state is not yet drawn.
 const dynamicMaterials=new Set(additionalMaterials.filter(supported));
 scene.traverse(mesh=>{if(!mesh.isMesh||stationary.has(mesh))return;for(const material of(Array.isArray(mesh.material)?mesh.material:[mesh.material]))if(supported(material))dynamicMaterials.add(material);});
 for(const material of dynamicMaterials){
  originalHooks.set(material,[material.onBeforeCompile,material.customProgramCacheKey]);prepare(material,all);
 }
 renderer.setOpaqueSort(stableLightMaterialSort);
 return {
  // Allows a stock-light reference to validate the culling without destroying
  // material programs (whose uniform objects Three caches across recompiles).
  setEnabled(value){enabled=!!value;},
  update(camera,time,reduced){
   lastTime=time;lastReduced=reduced;camera.updateMatrixWorld();
   for(const source of sources){source.uniform.position.copy(source.world).applyMatrix4(camera.matrixWorldInverse);source.uniform.color.copy(source.base).multiplyScalar(enabled?source.power*dampLampLevel(time,source.index,reduced):0);}
  },
  stats:()=>({kind:'fixed-world-practicals',sources:sources.length,staticBatches:bindings.length,materialVariants:owned.length,dynamicMaterials:dynamicMaterials.size,
   maximumStaticSources:Math.max(0,...bindings.map(b=>b.indices.length)),averageStaticSources:bindings.reduce((n,b)=>n+b.indices.length,0)/Math.max(1,bindings.length),
   lights:sources.map(s=>({index:s.index,x:s.world.x,y:-s.world.z,height:s.world.y,weight:1,power:s.power/8,reach:s.uniform.distance,level:dampLampLevel(lastTime,s.index,lastReduced)}))}),
  dispose(){
   for(const {mesh,original}of bindings)mesh.material=original;
   for(const [material,hooks]of originalHooks){[material.onBeforeCompile,material.customProgramCacheKey]=hooks;material.needsUpdate=true;}
   owned.forEach(m=>m.dispose());renderer.setOpaqueSort(null);variants.clear();bindings.length=owned.length=0;
  },
 };
}
