import * as THREE from './vendor/three/three.module.js';

// Candidate: seed depth from unchanged, opaque static batches before shading.
// Shared geometry preserves current index compaction, with no simplified hulls.
export function createDrainDepthPrepass(meshes){
 const scene=new THREE.Scene(),entries=[],materials=new Map();let enabled=true,draws=0,triangles=0;
 for(const source of meshes){
  const m=source.material;
  if(!m||Array.isArray(m)||m.transparent||m.opacity!==1||!m.depthWrite||!m.depthTest||m.alphaTest||m.alphaMap||m.alphaHash||m.displacementMap||m.clippingPlanes?.length||source.isSkinnedMesh||source.isInstancedMesh||source.morphTargetInfluences)continue;
  const key=[m.side,m.depthFunc,m.polygonOffset,m.polygonOffsetFactor,m.polygonOffsetUnits].join(':');
  let material=materials.get(key);
  if(!material){material=new THREE.MeshBasicMaterial({colorWrite:false,fog:false,side:m.side,depthFunc:m.depthFunc,polygonOffset:m.polygonOffset,polygonOffsetFactor:m.polygonOffsetFactor,polygonOffsetUnits:m.polygonOffsetUnits});materials.set(key,material);}
  const proxy=new THREE.Mesh(source.geometry,material);proxy.matrixAutoUpdate=false;proxy.frustumCulled=source.frustumCulled;scene.add(proxy);entries.push({source,proxy});
 }
 return {
  setEnabled(value){enabled=!!value;},
  draw(renderer,camera){
   draws=triangles=0;if(!enabled)return;
   for(const {source,proxy}of entries){proxy.visible=source.visible;proxy.matrix.copy(source.matrixWorld);}
   renderer.render(scene,camera);draws=renderer.info.render.calls;triangles=renderer.info.render.triangles;
  },
  stats:()=>({enabled,eligible:entries.length,draws,triangles}),
  dispose(){scene.clear();materials.forEach(m=>m.dispose());entries.length=0;materials.clear();},
 };
}
