// Rejected diagnostic candidate. The profiling tools serve this fixture at
// /finite-light-material.js so its vendored browser import resolves normally.
// It is not imported by the playable game.
import {ShaderChunk} from './vendor/three/three.module.js';

// The stock falloff is exactly zero at/beyond a finite light's cutoff.
// Avoid evaluating its general exponent there, preserving the original
// expression for every illuminated fragment and for unlimited lights.
const signature='float getDistanceAttenuation( const in float lightDistance, const in float cutoffDistance, const in float decayExponent ) {';
const original=ShaderChunk.lights_pars_begin;
const specialized=original.replace(signature,signature+'\n\tif ( cutoffDistance > 0.0 && lightDistance >= cutoffDistance ) return 0.0;');
const prepared=new WeakSet();
export function specializeFiniteLights(material){
  if(!material.isMeshLambertMaterial || specialized===original)return false;
  if(prepared.has(material))return true;
  const compile=material.onBeforeCompile,key=material.customProgramCacheKey();
  material.onBeforeCompile=function(shader,renderer){
    compile.call(this,shader,renderer);
    shader.fragmentShader=shader.fragmentShader.replace('#include <lights_pars_begin>',specialized);
  };
  material.customProgramCacheKey=()=>key+'-finite-cutoff-v1';
  prepared.add(material);
  return true;
}
