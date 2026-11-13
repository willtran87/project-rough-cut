import * as THREE from './vendor/three/three.module.js';
import {decodeBitmapBatchOffThread} from './bitmap-decoder.js';
import {createCourseSurfaces} from './course-surfaces.js';
import {courseSurfaceArchive} from './assets/baked/course-surfaces.js';

// Exact native-size canvas output, decoded on the existing serial worker while
// the larger illustrated assets load. GPU uploads still use the paced queue.
export async function loadBakedCourseSurfaces(){
 const cache=new Map();
 let bitmaps=[];
 try{
  bitmaps=await decodeBitmapBatchOffThread(courseSurfaceArchive.url,courseSurfaceArchive.slices,{imageOrientation:'flipY',premultiplyAlpha:'none',colorSpaceConversion:'none'});
  if(bitmaps.length!==courseSurfaceArchive.types.length)throw Error('Incomplete course surface archive');
  for(const [i,bitmap] of bitmaps.entries()){
   const type=courseSurfaceArchive.types[i];
   if(bitmap.width!==128||bitmap.height!==128)throw Error('Invalid course surface dimensions');
   const texture=new THREE.Texture(bitmap);texture.colorSpace=THREE.SRGBColorSpace;
   texture.wrapS=texture.wrapT=THREE.RepeatWrapping;texture.magFilter=THREE.NearestFilter;texture.minFilter=THREE.NearestMipmapLinearFilter;
   texture.userData.bakedCourseSurface=type;texture.needsUpdate=true;
   const close=()=>{bitmap.close();texture.removeEventListener('dispose',close);};texture.addEventListener('dispose',close);
   cache.set(type,texture);
  }
 }catch{
  for(const texture of cache.values())texture.dispose();cache.clear();
  for(const bitmap of bitmaps)bitmap.close();
 } // Original painter remains the fallback if archive loading is unavailable.
 const baked=cache.size,surfaces=createCourseSurfaces(cache);
 return {...surfaces,stats:()=>({baked,fallback:cache.size-baked,width:128,height:128})};
}
