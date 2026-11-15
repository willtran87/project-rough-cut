import * as THREE from './vendor/three/three.module.js';

// The pale sand is exposed in lenses, with soil mixed into their broken edges.
// Blend albedo in the opaque surface; no decal, alpha sorting or extra draw.
export function finishBunkerSandEdges(sand,soil){
 const base=sand.onBeforeCompile,key=sand.customProgramCacheKey.bind(sand);
 sand.onBeforeCompile=shader=>{
  base(shader);
  shader.uniforms.bankSoilMap={value:soil.map};
  shader.uniforms.bankSoilTint={value:soil.color};
  shader.vertexShader='attribute float drainBankEdge; varying float bankEdge;\n'+shader.vertexShader;
  shader.vertexShader=shader.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\nbankEdge=drainBankEdge;');
  shader.fragmentShader='uniform sampler2D bankSoilMap; uniform vec3 bankSoilTint; varying float bankEdge;\n'+shader.fragmentShader;
  shader.fragmentShader=shader.fragmentShader.replace('#include <map_fragment>',`#include <map_fragment>
   vec2 grain=floor(drainWorld.xz*157.+drainWorld.y*vec2(79.,113.));
   float breakup=fract(sin(dot(grain,vec2(12.9898,78.233)))*43758.5453);
   float exposed=smoothstep(.025,.105,bankEdge+(breakup-.5)*.045);
   diffuseColor.rgb=mix(texture2D(bankSoilMap,vMapUv).rgb*bankSoilTint,diffuseColor.rgb,exposed);
  `);
 };
 sand.customProgramCacheKey=()=>key()+'-bunker-sand-edge-v1';sand.needsUpdate=true;
}

export function ensureBankEdgeAttribute(geometry){
 if(!geometry.hasAttribute('drainBankEdge'))geometry.setAttribute('drainBankEdge',new THREE.Float32BufferAttribute(new Float32Array(geometry.attributes.position.count).fill(1),1));
}
