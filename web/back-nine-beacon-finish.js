import * as THREE from './vendor/three/three.module.js';

// Art-directed near-field falloff for the roof beacon. A bare point source
// explodes at the adjacent roll cage and erases albedo. Spread that close
// contribution while preserving its pulse, hue, shadows and distant warning.
// A 12m close-field radius tapers out at 28m. The denominator is monotonic;
// correction and first derivative reach zero there. Headlights and
// ambient/moon illumination retain their own response.
export function finishBackNineBeacon(material){
 if(!material.isMeshLambertMaterial)return;
 const compile=material.onBeforeCompile,key=material.customProgramCacheKey();
 const marker='getPointLightInfo( pointLight, geometryPosition, directLight );';
 material.onBeforeCompile=function(shader,renderer){
  compile.call(this,shader,renderer);
  shader.fragmentShader=shader.fragmentShader.replace('#include <lights_fragment_begin>',THREE.ShaderChunk.lights_fragment_begin).replace(marker,marker+`
   #if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_POINT_LIGHT_SHADOWS )
    // Back Nine's only shadow-casting point light is Joe's roof beacon.
    vec3 beaconDelta = pointLight.position - geometryPosition;
    float beaconDistance2 = dot(beaconDelta, beaconDelta);
    float beaconNear = max(0.0, 1.0 - beaconDistance2 / 784.0);
    directLight.color *= max(0.01, beaconDistance2) / (beaconDistance2 + 144.0 * beaconNear * beaconNear);
   #endif
  `);
 };
 material.customProgramCacheKey=()=>key+'-back-nine-beacon-near-v1';
}
