// Exact authored canvas bake. Unknown/edited layouts keep the procedural builder.
import { decodeBitmapOffThread } from './bitmap-decoder.js';
const version='terrain-v1';
let manifest;
const images=new Map();
export async function terrainBakeKey(data,scale,xScale){
  const paint={version,scale,xScale,zones:data.zones,paths:data.paths,sand:data.sand,footing:data.footing,obstacles:data.obstacles.filter(o=>o.blocks),actions:data.actions,reviews:data.reviews,practice:data.practice,key:data.key,valve:data.valve};
  const digest=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(JSON.stringify(paint)));
  return [...new Uint8Array(digest)].map(n=>n.toString(16).padStart(2,'0')).join('');
}
export async function loadBakedTerrain(data,scale,xScale){
  try{
    const key=await terrainBakeKey(data,scale,xScale);
    manifest??=fetch(new URL('./assets/baked/terrain.json',import.meta.url)).then(r=>r.ok?r.json():{}).catch(()=>({}));
    const entry=(await manifest)[key];if(!entry)return null;
    if(!images.has(key))images.set(key,(async()=>{
      const url=new URL('./assets/baked/'+entry,import.meta.url).href;
      try{const bitmap=await decodeBitmapOffThread(url,{imageOrientation:'flipY',premultiplyAlpha:'none',colorSpaceConversion:'none'});if(bitmap.width===1536&&bitmap.height===4096)return bitmap;bitmap.close();return null;}catch{/* Use the proven image path if workers/bitmap transfer are unavailable. */}
      return new Promise(resolve=>{const image=new Image();image.onload=async()=>{
      if(image.width!==1536||image.height!==4096){resolve(null);return;}
      // Prepare orientation off the render submission path. Three.js ignores
      // texture.flipY for ImageBitmap, so bake the same canvas orientation here.
      try{resolve(await createImageBitmap(image,{imageOrientation:'flipY',premultiplyAlpha:'none',colorSpaceConversion:'none'}));}catch{resolve(image);}
    };image.onerror=()=>resolve(null);image.src=url;});
    })());
    return await images.get(key);
  }catch{return null;}
}
