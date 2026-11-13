import * as THREE from './vendor/three/three.module.js';

// A zero-contribution shader is an optimization of the same material. Keep its
// place in Three's opaque order: changing variant must not change the winner
// where authored surfaces share a depth value. Other sort priorities match
// painterSortStable, including this Three build's materialVariant tie-breaker.
export function stableLightMaterialSort(a,b){
  const aId=a.material.userData.localLightSourceId??a.material.id;
  const bId=b.material.userData.localLightSourceId??b.material.id;
  return a.groupOrder-b.groupOrder||a.renderOrder-b.renderOrder||aId-bId||
    a.materialVariant-b.materialVariant||a.z-b.z||a.id-b.id;
}

// Optional visible-piece bounds describe static world-space geometry. They
// tighten the proof for disjoint fences/props without splitting draw calls.
// Static software-rendered batches outside every point light's finite reach
// have exactly zero point-light contribution. Keep their original ambient,
// hemisphere, moon, texture, alpha and fog shading; omit only that zero work.
export function createLocalLightCulling(){
  const entries=[],pairs=new Map(),lights=[],preparation=new THREE.Group();
  const marker='#if ( NUM_POINT_LIGHTS > 0 ) && defined( RE_Direct )';
  const chunk=THREE.ShaderChunk.lights_fragment_begin;
  let valid=false,updates=0,unlit=0;
  function register(mesh,pieces=null){
    const full=mesh.material;
    if(!full.isMeshLambertMaterial||!chunk.includes(marker))return;
    if(!pairs.has(full)){
      const lite=full.clone(),compile=full.onBeforeCompile,key=full.customProgramCacheKey();
      lite.userData.localLightSourceId=full.id;
      lite.onBeforeCompile=shader=>{
        compile.call(full,shader);
        shader.fragmentShader=shader.fragmentShader.replace('#include <lights_fragment_begin>',chunk.replace(marker,'#if 0'));
      };
      lite.customProgramCacheKey=()=>key+'-outside-point-lights-v1';
      pairs.set(full,lite);
      // These proxies are compiled and uploaded under the existing loading
      // gate, never added to the playable scene. Geometry/textures are shared.
      const proxy=new THREE.Mesh(mesh.geometry,lite);proxy.receiveShadow=mesh.receiveShadow;
      preparation.add(proxy);
    }
    mesh.updateWorldMatrix(true,false);
    entries.push({mesh,pieces,full,lite:pairs.get(full),bounds:mesh.geometry.boundingBox.clone().applyMatrix4(mesh.matrixWorld)});
    valid=false;
  }
  function update(pointLights){
    let changed=!valid||lights.length!==pointLights.length;
    lights.length=pointLights.length;
    for(let i=0;i<pointLights.length;i++){
      const light=pointLights[i],old=lights[i]||(lights[i]={position:new THREE.Vector3(),sample:new THREE.Vector3()});
      light.getWorldPosition(old.sample);
      const active=light.visible&&light.intensity!==0;
      if(old.active!==active||old.distance!==light.distance||!old.position.equals(old.sample))changed=true;
      old.active=active;old.distance=light.distance;old.position.copy(old.sample);
    }
    if(!changed&&!entries.some(entry=>entry.pieces))return;
    valid=true;updates++;unlit=0;
    for(const entry of entries){
      // Cache by light reach, including currently hidden batches. Camera-only
      // turns do not invalidate this cache: assigning lite merely because a
      // batch is hidden would leave it dark when it reappears near the lamp.
      const outside=lights.every(light=>!light.active||(Number.isFinite(light.distance)&&light.distance>0&&(entry.bounds.distanceToPoint(light.position)>light.distance+.01||entry.pieces?.every(piece=>!piece.visible||piece.bounds.distanceToPoint(light.position)>light.distance+.01))));
      entry.mesh.material=outside?entry.lite:entry.full;
      if(outside)unlit++;
    }
  }
  function dispose(){
    for(const entry of entries)entry.mesh.material=entry.full;
    for(const material of pairs.values())material.dispose();
    preparation.clear();entries.length=lights.length=0;pairs.clear();valid=false;
  }
  return {register,update,preparation,dispose,allMaterials:()=>[...pairs.values()],stats:()=>({batches:entries.length,outside:unlit,variants:pairs.size,updates})};
}
