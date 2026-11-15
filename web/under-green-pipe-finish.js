import * as THREE from './vendor/three/three.module.js';
import {LEVER} from './under-green-layout.js';
import {DRAIN_DRIPS} from './under-green-water-contacts.js';
const PIPE_DRIPS=DRAIN_DRIPS.filter(d=>!d.surface||d.surface==='pipe');

// Coordinates of the actual fittings in the four service runs. A piece carries
// only its three nearest seams, avoiding a whole-network loop per fragment.
export const PIPE_JOINTS=Object.freeze([
 Object.freeze([8,16,23,24,32,40,48,56,64,72]),
 Object.freeze([-23.5,-20,-14,-8,0,5.4]),
 Object.freeze([40.35,44,48.65,49]),
 Object.freeze([]),
 Object.freeze([38,39.35]),
]);
export function pipeJointFrame(profile,start,end){
 const lo=Math.min(start,end),hi=Math.max(start,end),mid=(lo+hi)/2;
 const near=[...PIPE_JOINTS[profile]].sort((a,b)=>{
  const distance=v=>Math.max(lo-v,0,v-hi);return distance(a)-distance(b)||Math.abs(a-mid)-Math.abs(b-mid);
 }).slice(0,3);while(near.length<3)near.push(near.at(-1));return [...near,profile];
}
export function setPipeJointFrame(geometry,frame){
 const values=new Float32Array(geometry.attributes.position.count*4);for(let i=0;i<values.length;i+=4)values.set(frame,i);
 geometry.setAttribute('pipeJointFrame',new THREE.BufferAttribute(values,4));return values.byteLength;
}

export function prepareDrainPipeFinish(materials,surfaces){
 const material=materials.machineIron.clone();material.color.setHex(0xb2b6a8);material.specular.setHex(0x616e62);
 material.specularMap=null;material.userData.drainUVMetres=1;material.userData.drainWorldUV=true;
 const leaks=PIPE_DRIPS.map(d=>new THREE.Vector3(d.x,d.height,-d.y));
 material.onBeforeCompile=shader=>{
  shader.uniforms.pipePumpEnd={value:new THREE.Vector3(LEVER.x+.2,3.55,-LEVER.y+.25)};shader.uniforms.pipeRustMap={value:surfaces.sets.rust.map};shader.uniforms.pipeLeaks={value:leaks};
  shader.vertexShader='attribute vec4 pipeJointFrame; varying vec4 vPipeJoints; varying vec3 vPipeWorld;\n'+shader.vertexShader;
  shader.vertexShader=shader.vertexShader.replace('#include <worldpos_vertex>','#include <worldpos_vertex>\nvPipeWorld=(modelMatrix*vec4(transformed,1.)).xyz; vPipeJoints=pipeJointFrame;');
  shader.fragmentShader=`uniform sampler2D pipeRustMap; uniform vec3 pipePumpEnd; uniform vec3 pipeLeaks[${leaks.length}]; varying vec4 vPipeJoints; varying vec3 vPipeWorld;\n`+shader.fragmentShader;
  shader.fragmentShader=shader.fragmentShader.replace('#include <map_fragment>',`
   vec3 pipeQ=floor(vPipeWorld*128.)/128.;
   float pipeAxial=vPipeJoints.w>.5&&vPipeJoints.w<1.5?pipeQ.x:-pipeQ.z;
   float pipeSeam=min(abs(pipeAxial-vPipeJoints.x),min(abs(pipeAxial-vPipeJoints.y),abs(pipeAxial-vPipeJoints.z)));
   if(vPipeJoints.w>2.5&&vPipeJoints.w<3.5)pipeSeam=min(length(pipeQ.xz-vec2(vPipeJoints.x,-40.)),length(pipeQ.xz-vec2(vPipeJoints.z,-vPipeJoints.y)));
   if(vPipeJoints.w>4.5&&vPipeJoints.w<5.5)pipeSeam=min(distance(pipeQ,vec3(vPipeJoints.x,1.65,vPipeJoints.y)),min(distance(pipeQ,vec3(vPipeJoints.x,2.55,vPipeJoints.y)),distance(pipeQ,pipePumpEnd)));
   if(vPipeJoints.w>5.5)pipeSeam=min(abs(pipeQ.x+2.65),min(abs(abs(pipeQ.x)-1.8),abs(abs(pipeQ.x)-3.)));
   // Uneven seam margins are anchored in the metal, with quieter spans between.
   float pipeEdge=.17+.035*sin(pipeQ.x*23.+pipeQ.y*29.+pipeQ.z*17.)+.025*sin(pipeQ.y*61.+pipeQ.z*11.);
   float pipeRust=.045+.91*(1.-smoothstep(.045,pipeEdge,pipeSeam));
   float pipeWet=0.;
   #pragma unroll_loop_start
   for ( int i = 0; i < ${leaks.length}; i ++ ) {
    pipeWet=max(pipeWet,1.-smoothstep(.025,.42,length(pipeQ-pipeLeaks[i])));
   }
   #pragma unroll_loop_end
   pipeRust=max(pipeRust,pipeWet*.7);
   vec4 sampledDiffuseColor=texture2D(map,vMapUv);
   sampledDiffuseColor.rgb=mix(sampledDiffuseColor.rgb,texture2D(pipeRustMap,vMapUv).rgb*vec3(.87,.75,.64),pipeRust);
   diffuseColor*=sampledDiffuseColor;
   diffuseColor.rgb*=mix(1.,.69,pipeWet);
  `);
  shader.fragmentShader=shader.fragmentShader.replace('#include <lights_phong_fragment>',`#include <lights_phong_fragment>
   material.specularShininess=mix(12.,58.,pipeWet);
   material.specularStrength=mix(.13,.68,pipeWet)*(1.-pipeRust*.28);
  `);
 };
 material.customProgramCacheKey=()=> 'drain-joint-corrosion-v2-'+leaks.length;materials.pipeSurface=material;
 return {stats:()=>({kind:'joint-corrosion-and-weep-wetness',sourceMaps:['metal','rust'],newTextures:0,geometryRelief:false,seamFrames:3,leaks:PIPE_DRIPS.map(d=>({x:d.x,y:d.y,height:d.height})),texelsPerMetre:surfaces.stats().tilePixels,wetnessIndependentOfPigment:true}),dispose:()=>material.dispose()};
}
