import * as THREE from './vendor/three/three.module.js';

// Three's finite-source attenuation is exactly zero outside distance. Reject
// those fragments before cone, shadow and BRDF work; infinite sources retain
// their original path. No source selection, reduced range or light truncation.
const chunk=THREE.ShaderChunk.lights_fragment_begin;
const start=chunk.indexOf('#if ( NUM_SPOT_LIGHTS > 0 ) && defined( RE_Direct )');
const end=start<0?-1:chunk.indexOf('\n#endif',start)+7;
const original=start>=0&&end>start?chunk.slice(start,end):'';
const info='getSpotLightInfo( spotLight, geometryPosition, directLight );';
const direct='RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );';
const supported=original.includes(info)&&original.includes(direct);
const bounded=supported?original.replace(info,`{
 vec3 courseSpotDelta=spotLight.position-geometryPosition;
 if(spotLight.distance<=0.0||dot(courseSpotDelta,courseSpotDelta)<spotLight.distance*spotLight.distance){
 ${info}`).replace(direct,direct+'\n}}'):original;

export function boundCourseSpotlights(shader){
 if(!supported)return;
 const marker='#include <lights_fragment_begin>';
 if(shader.fragmentShader.includes(marker))shader.fragmentShader=shader.fragmentShader.replace(marker,chunk.replace(original,bounded));
 else shader.fragmentShader=shader.fragmentShader.replace(original,bounded);
}
