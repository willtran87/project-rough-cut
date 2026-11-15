import {createCraftedCourseSurfaces} from './course-crafted-surfaces.js';
import * as THREE from './vendor/three/three.module.js';

export async function loadMowerSurfaceMaps(){
 const entries=await Promise.all(['paint','steel','rust'].map(async name=>{const t=await new THREE.TextureLoader().loadAsync('./assets/optimized/back-nine-mower-'+name+'-v1.png');t.colorSpace=THREE.SRGBColorSpace;t.wrapS=t.wrapT=THREE.RepeatWrapping;t.magFilter=THREE.NearestFilter;t.minFilter=THREE.NearestMipmapLinearFilter;t.repeat.setScalar(name==='paint'?.65:.4);return [name==='steel'?'iron':name,t];}));
 return Object.fromEntries(entries);
}

// Authored enamel/steel/rust, plus Level 1's quiet rubber and brass surfaces.
// The course, cart, Joe's skin and existing lights keep their own materials.
export function finishMowerMaterials(root,base,maps){
 const surfaces=createCraftedCourseSurfaces(),replacements=new Map();
 for(const [key,kind,tint]of [['mower','paint',0xb3c5ac],['iron','iron',0xd3d7cd],['rust','rust',0xd3b295],['rubber','rubber',0x87958b],['brass','brass',0xc4b381]]){
  const original=base[key],m=original.clone();m.name='BackNineMower:'+kind;m.map=maps[kind]||surfaces.texture(kind);m.color.setHex(tint);m.onBeforeCompile=original.onBeforeCompile;m.customProgramCacheKey=original.customProgramCacheKey;replacements.set(original,m);
 }
 root.traverse(o=>{if(o.isMesh&&replacements.has(o.material))o.material=replacements.get(o.material);});
 return {dispose(){for(const m of replacements.values())m.dispose();surfaces.dispose();for(const t of Object.values(maps))t.dispose();}};
}
