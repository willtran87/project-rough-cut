import * as THREE from './vendor/three/three.module.js';
export async function loadRunnerCloth(){
 const t=await new THREE.TextureLoader().loadAsync('./assets/optimized/back-nine-work-cloth-v1.webp');
 t.colorSpace=THREE.SRGBColorSpace;t.magFilter=THREE.NearestFilter;t.minFilter=THREE.NearestMipmapLinearFilter;
 return t;
}
export async function loadRunnerFace(){
 const t=await new THREE.TextureLoader().loadAsync('./assets/optimized/back-nine-face-v1.webp');
 t.colorSpace=THREE.SRGBColorSpace;t.magFilter=THREE.NearestFilter;t.minFilter=THREE.NearestMipmapLinearFilter;
 return t;
}
export async function loadRunnerHair(){
 const t=await new THREE.TextureLoader().loadAsync('./assets/optimized/back-nine-hair-v1.webp');
 t.colorSpace=THREE.SRGBColorSpace;t.magFilter=THREE.NearestFilter;t.minFilter=THREE.NearestMipmapLinearFilter;t.wrapS=THREE.RepeatWrapping;
 return t;
}
export async function loadRunnerGear(){
 const t=await new THREE.TextureLoader().loadAsync('./assets/optimized/back-nine-work-gear-v1.webp');
 t.colorSpace=THREE.SRGBColorSpace;t.magFilter=THREE.NearestFilter;t.minFilter=THREE.NearestMipmapLinearFilter;
 return t;
}
// Authored material maps decode concurrently during course preparation.
export function runnerMaterials(base,clothMap,faceMap,hairMap,gearMap){
 const weave=clothMap,portrait=faceMap;
 const shirt=base.cloth.clone();shirt.color.setHex(0xffffff);shirt.map=weave;
 const trousers=shirt.clone();trousers.color.setHex(0x626b63);
 const hair=shirt.clone();hair.color.setHex(0xffffff);hair.map=hairMap;
 const skin=base.skin.clone();skin.map=portrait;skin.color.setHex(0xffffff);
 // Ears, neck and hands use the portrait's feature-free edge strip, keeping
 // their skin hue consistent with the face without a separate texture.
 const skinBody=base.skin.clone();skinBody.map=portrait;skinBody.color.setHex(0xffffff);
 const gear=base.cloth.clone();gear.name='RunnerWorkGear';gear.map=gearMap;gear.color.setHex(0xffffff);
 // Material.clone does not copy shader callbacks. Keep the course's pixel
 // quantization and reuse its prepared textured Lambert program.
 for(const m of [shirt,trousers,hair,skin,skinBody,gear]){m.onBeforeCompile=base.cloth.onBeforeCompile;m.customProgramCacheKey=base.cloth.customProgramCacheKey;}
 return {materials:{...base,cloth:shirt,trousers,face:skin,hair,skin:skinBody,gear},dispose(){shirt.dispose();trousers.dispose();hair.dispose();skin.dispose();skinBody.dispose();gear.dispose();weave.dispose();portrait.dispose();hairMap.dispose();gearMap?.dispose();}};
}
