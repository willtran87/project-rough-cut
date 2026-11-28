import {drainShadowGLSL,drainShadowVertexGLSL} from './under-green-practical-shadows.js';
import {createDrainLightOcclusion} from './under-green-light-occlusion.js';
import * as THREE from './vendor/three/three.module.js';
import {dampLampLevel} from './under-green-atmosphere.js';
import {stableLightMaterialSort} from './local-light-culling.js';

// Practical lights are fixed in the world, not selected around the viewer.
// Static batches omit only sources proven outside their complete world bounds.
// Moving/morphing/instanced scenery keeps the full set, so no stale bounding
// box can make a walking actor or travelling gate lose its illumination.
export function createDrainPracticalLighting({scene,renderer,lamps,staticMeshes=[],staticLightBounds=new Map(),additionalMaterials=[],shadows=null,opaqueLightBlockers=[]}){
 const occlusion=shadows&&opaqueLightBlockers.length?createDrainLightOcclusion(opaqueLightBlockers,{tileSize:shadows.stats().tileSize}):null;
 const sources=lamps.map((lamp,index)=>({index,world:new THREE.Vector3(lamp.x,lamp.height??2.8,-lamp.y),
  base:new THREE.Color(lamp.color??(index%3===1?0x79c8c5:0xe9b575)),power:8*(lamp.power??1),
  beam:lamp.beam?{world:new THREE.Vector3(...lamp.beam.direction).normalize(),view:new THREE.Vector3(),
   outer:Math.cos(lamp.beam.outerDegrees*Math.PI/180),inner:Math.cos(lamp.beam.innerDegrees*Math.PI/180),spill:lamp.beam.spill}:null,
  uniform:{position:new THREE.Vector3(),color:new THREE.Color(),distance:lamp.reach??13,decay:1.4}}));
 const all=sources.map((_,i)=>i),variants=new Map(),bindings=[],owned=[],originalHooks=new Map(),stationary=new Set();
 const supported=m=>m?.isMeshLambertMaterial||m?.isMeshPhongMaterial||m?.isMeshStandardMaterial;
 let lastTime=0,lastReduced=false,enabled=true;
 // Every variant reads the same flat source arrays and selects its sources
 // with a small index list. A flat array uploads in one call per program when
 // it changes and Three's per-program cache skips unchanged values, instead of
 // one call per struct member on every draw. The shading arithmetic is unchanged.
 // Three does not cache array uniforms, so each shared array carries a
 // version and reports needsUpdate only to a GL program that has not yet
 // received that version (GL keeps uniform values per program).
 // The bound program is followed from this context's own useProgram calls;
 // querying CURRENT_PROGRAM on every upload is a costly driver round trip.
 const gl=renderer.getContext(),uploaded=new WeakMap();
 if(!('__drainBoundProgram' in gl)){gl.__drainBoundProgram=gl.getParameter(gl.CURRENT_PROGRAM);const use=gl.useProgram;gl.useProgram=function(program){this.__drainBoundProgram=program;return use.call(this,program);};}
 const versioned=value=>{
  const u={value,version:1};
  Object.defineProperty(u,'needsUpdate',{get(){
   const program=gl.__drainBoundProgram;if(!program)return true;
   let seen=uploaded.get(program);if(!seen)uploaded.set(program,seen=new Map());
   if(seen.get(u)===u.version)return false;seen.set(u,u.version);return true;
  }});
  return u;
 };
 // Identical source lists share one index uniform; a program that already
 // holds that list (the last one uploaded to it) skips the upload.
 const indexUniforms=new Map(),programIndex=new WeakMap();
 const indexUniform=indices=>{
  const key=indices.join(',');let u=indexUniforms.get(key);if(u)return u;
  u={value:new Int32Array(indices)};
  Object.defineProperty(u,'needsUpdate',{get(){
   const program=gl.__drainBoundProgram;if(!program)return true;
   if(programIndex.get(program)===u)return false;programIndex.set(program,u);return true;
  }});
  indexUniforms.set(key,u);return u;
 };
 // One extra slot is a dark source (zero colour, 1 m cutoff, far overhead,
 // outside its own shadow reach). Source lists are padded with it to a few
 // fixed lengths, so far fewer shader programs are compiled at load. A padded
 // slot adds exactly zero light.
 const count=sources.length,dark=count,slotCount=count+1,SIZES=[2,4,6,8,10],shared={
  drainLightPosition:versioned(new Float32Array([...Array(count*3).fill(0),0,1e4,0])),drainLightColor:versioned(new Float32Array(slotCount*3)),
  drainLightRange:versioned(new Float32Array([...sources.flatMap(s=>[s.uniform.distance,s.uniform.decay]),1,1])),
  drainShadowOrigins:versioned(new Float32Array([...sources.flatMap((s,i)=>[s.world.x,s.world.y,s.world.z,i]),0,1e4,0,dark])),
 };
 function prepare(material,indices,compile=material.onBeforeCompile,key=material.customProgramCacheKey()){
  if(!indices.length)return;
  const size=SIZES.find(n=>n>=indices.length)??indices.length,slots=[...indices,...Array(size-indices.length).fill(dark)];
  const lightIndex=indexUniform(slots);
  const beams=indices.map((source,local)=>({source:sources[source],local})).filter(s=>s.source.beam);
  const declarations=beams.map(({local})=>`uniform vec3 drainBeamDirection${local}; uniform vec3 drainBeamProfile${local};`).join('\n');
  // The local index is resolved at shader generation time. Unaffected static
  // batches have no beam uniforms or extra fragment work. Direct and specular
  // lighting share the same smooth source distribution, including actors.
  const distribution=beams.map(({local})=>`#if UNROLLED_LOOP_INDEX == ${local}
    directLight.color *= mix(drainBeamProfile${local}.z,1.,smoothstep(drainBeamProfile${local}.x,drainBeamProfile${local}.y,dot(-directLight.direction,drainBeamDirection${local})));
   #endif`).join('\n');
  material.onBeforeCompile=function(shader,render){
   compile.call(this,shader,render);
   shader.uniforms.drainLightPosition=shared.drainLightPosition;shader.uniforms.drainLightColor=shared.drainLightColor;shader.uniforms.drainLightRange=shared.drainLightRange;shader.uniforms.drainLightIndex=lightIndex;
   if(shadows){
    shader.uniforms.drainShadowDepth={value:shadows.depth};shader.uniforms.drainShadowAtlas=shadows.atlas;shader.uniforms.drainShadowStrength=shadows.strength;
    shader.uniforms.drainShadowOrigins=shared.drainShadowOrigins;
    shader.vertexShader='varying vec3 vDrainShadowWorld;\n'+shader.vertexShader;
    shader.vertexShader=shader.vertexShader.replace('#include <worldpos_vertex>','#include <worldpos_vertex>\n'+drainShadowVertexGLSL);
    shader.fragmentShader=drainShadowGLSL+'\nuniform vec4 drainShadowOrigins['+slotCount+'];\n'+shader.fragmentShader;
   }
   for(const {source,local}of beams){shader.uniforms['drainBeamDirection'+local]={value:source.beam.view};shader.uniforms['drainBeamProfile'+local]={value:new THREE.Vector3(source.beam.outer,source.beam.inner,source.beam.spill)};}
   shader.fragmentShader=shader.fragmentShader.replace('#include <lights_pars_begin>',`#include <lights_pars_begin>\nuniform vec3 drainLightPosition[${slotCount}];\nuniform vec3 drainLightColor[${slotCount}];\nuniform vec2 drainLightRange[${slotCount}];\nuniform int drainLightIndex[${slots.length}];\n${declarations}`);
   shader.fragmentShader=shader.fragmentShader.replace('#include <lights_fragment_begin>',`#include <lights_fragment_begin>
    #if defined( RE_Direct )
     #pragma unroll_loop_start
     for ( int i = 0; i < ${slots.length}; i ++ ) {
      {
      int drainSource = drainLightIndex[ i ];
      PointLight drainLight;
      drainLight.position = drainLightPosition[ drainSource ];
      drainLight.color = drainLightColor[ drainSource ];
      drainLight.distance = drainLightRange[ drainSource ].x;
      drainLight.decay = drainLightRange[ drainSource ].y;
      getPointLightInfo( drainLight, geometryPosition, directLight );
      ${distribution}
      ${shadows?'directLight.color *= drainStaticShadow(vDrainShadowWorld,drainShadowOrigins[ drainSource ],drainLight.distance);':''}
      RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
      }
     }
     #pragma unroll_loop_end
    #endif
   `);
  };
  material.customProgramCacheKey=()=>key+'-drain-practical-count-'+slots.length+'-beams-'+beams.map(b=>b.local).join(',')+'-static-shadow-'+Boolean(shadows)+'-indexed-sources-'+slotCount;
  material.needsUpdate=true;
 }
 scene.updateMatrixWorld(true);
 // Clone static materials before preparing their originals for moving meshes.
 // This preserves existing crafted-surface hooks and transparent effect state.
 for(const mesh of staticMeshes){
  if(!supported(mesh.material)||mesh.isSkinnedMesh||mesh.isInstancedMesh)continue;
  mesh.geometry.computeBoundingBox();const bounds=mesh.geometry.boundingBox.clone().applyMatrix4(mesh.matrixWorld).expandByScalar(mesh.userData.drainLightPadding??0);
  // A merged batch can surround empty space between separate walls/props.
  // Test its original closed part bounds too: a light reaching only that gap
  // contributes exactly zero. This does not split draws or change geometry.
  const parts=staticLightBounds.get(mesh)?.map(b=>b.clone().applyMatrix4(mesh.matrixWorld).expandByScalar(mesh.userData.drainLightPadding??0));
  const indices=all.filter(i=>bounds.distanceToPoint(sources[i].world)<=sources[i].uniform.distance+.01&&
   (parts??[bounds]).some(b=>b.distanceToPoint(sources[i].world)<=sources[i].uniform.distance+.01&&!occlusion?.hidden(sources[i].world,b,sources[i].uniform.distance)));
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
   const position=shared.drainLightPosition.value,color=shared.drainLightColor.value;let movedLights=false,changedColors=false;
   for(const source of sources){source.uniform.position.copy(source.world).applyMatrix4(camera.matrixWorldInverse);source.uniform.color.copy(source.base).multiplyScalar(enabled?source.power*dampLampLevel(time,source.index,reduced):0);if(source.beam)source.beam.view.copy(source.beam.world).transformDirection(camera.matrixWorldInverse);
    const o=source.index*3,p=source.uniform.position,c=source.uniform.color;
    if(position[o]!==Math.fround(p.x)||position[o+1]!==Math.fround(p.y)||position[o+2]!==Math.fround(p.z)){p.toArray(position,o);movedLights=true;}
    if(color[o]!==Math.fround(c.r)||color[o+1]!==Math.fround(c.g)||color[o+2]!==Math.fround(c.b)){c.toArray(color,o);changedColors=true;}}
   if(movedLights)shared.drainLightPosition.version++;if(changedColors)shared.drainLightColor.version++;
  },
  stats:()=>({kind:'fixed-world-practicals',shadows:shadows?.stats()??null,occlusion:occlusion?.stats()??null,sources:sources.length,staticBatches:bindings.length,materialVariants:owned.length,dynamicMaterials:dynamicMaterials.size,
   maximumStaticSources:Math.max(0,...bindings.map(b=>b.indices.length)),averageStaticSources:bindings.reduce((n,b)=>n+b.indices.length,0)/Math.max(1,bindings.length),
   lights:sources.map(s=>({index:s.index,id:lamps[s.index].id,role:lamps[s.index].role,color:lamps[s.index].color,x:s.world.x,y:-s.world.z,height:s.world.y,weight:1,power:s.power/8,reach:s.uniform.distance,beam:lamps[s.index].beam??null,level:dampLampLevel(lastTime,s.index,lastReduced)}))}),
  dispose(){
   for(const {mesh,original}of bindings)mesh.material=original;
   for(const [material,hooks]of originalHooks){[material.onBeforeCompile,material.customProgramCacheKey]=hooks;material.needsUpdate=true;}
   owned.forEach(m=>m.dispose());renderer.setOpaqueSort(null);variants.clear();bindings.length=owned.length=0;
  },
 };
}
