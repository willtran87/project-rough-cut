import {ShaderChunk} from './vendor/three/three.module.js';
// Use only when bounds prove every fragment is outside all finite point lights.
// Ambient, moon, hemisphere, texture, alpha testing and fog are unchanged.
export function withoutPointLights(full){
 const marker='#if ( NUM_POINT_LIGHTS > 0 ) && defined( RE_Direct )';
 if(!ShaderChunk.lights_fragment_begin.includes(marker))throw Error('Unsupported point-light shader chunk');
 const lite=full.clone(),compile=full.onBeforeCompile,key=full.customProgramCacheKey();
 lite.onBeforeCompile=function(shader,renderer){compile.call(this,shader,renderer);shader.fragmentShader=shader.fragmentShader.replace('#include <lights_fragment_begin>',ShaderChunk.lights_fragment_begin.replace(marker,'#if 0'));};
 lite.customProgramCacheKey=()=>key+'-outside-point-lights-v1';return lite;
}
