import {ShaderChunk} from './vendor/three/three.module.js';

// Only for a scene whose point/spot lights retain inverse-square falloff.
// The chase's two lights vary position, color, intensity and range, not decay.
const expression='pow( lightDistance, decayExponent )';
const source=ShaderChunk.lights_pars_begin;
const squared=source.replace(expression,'( lightDistance * lightDistance )');
export function specializeQuadraticLights(material,lights){
 if(!material.isMeshLambertMaterial||squared===source||!lights.length||lights.some(l=>l.decay!==2))return;
 const compile=material.onBeforeCompile,key=material.customProgramCacheKey();
 material.onBeforeCompile=function(shader,renderer){compile.call(this,shader,renderer);shader.fragmentShader=shader.fragmentShader.replace('#include <lights_pars_begin>',squared);};
 material.customProgramCacheKey=()=>key+'-quadratic-light-v1';
}
