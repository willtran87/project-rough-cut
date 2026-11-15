import {ShaderChunk} from './vendor/three/three.module.js';

// Keep the authored weights and arithmetic order. Only omit lanes proven zero
// across the entire mesh, avoiding unused bone-texture fetches on software GPUs.
export function skinInfluenceMask(geometry){
 const weights=geometry.getAttribute('skinWeight');
 if(!weights||weights.itemSize!==4)return 15;
 let mask=0;
 for(let i=0;i<weights.count;i++)for(let lane=0;lane<4;lane++)if(weights.getComponent(i,lane)!==0)mask|=1<<lane;
 return mask||15;
}

export function specializeSkinning(shader,mask){
 for(const name of ['skinbase_vertex','skinnormal_vertex','skinning_vertex']){
  let source=ShaderChunk[name];
  for(let lane=0;lane<4;lane++)if(!(mask&(1<<lane))){
   const bone='boneMat'+'XYZW'[lane];
   source=source.split('\n').filter(line=>!line.includes(bone)).join('\n');
  }
  shader.vertexShader=shader.vertexShader.replace('#include <'+name+'>',source);
 }
}
