import * as THREE from './vendor/three/three.module.js';

// All parts of one tree share a height field, so branches and needle sprays
// bend together. Padding covers the capped .25m lateral bend and crosswind.
export const TREE_WIND_PADDING=.27;

export function bindTreeWind(geometry,anchor,height){
 const p=geometry.attributes.position,shape=new Float32Array(p.count*4),phase=new Float32Array(p.count*2);
 const span=Math.max(.1,height-.6),amplitude=Math.min(.25,height*.028),angle=anchor.x*.16+anchor.z*.07;
 const primary=[Math.cos(angle),Math.sin(angle)],secondary=[Math.cos(angle*.4),Math.sin(angle*.4)];
 for(let i=0;i<p.count;i++){
  const t=THREE.MathUtils.clamp((p.getY(i)-anchor.y-.6)/span,0,1);
  shape.set([amplitude*t*t,2*amplitude*t/span,...primary],i*4);
  phase.set(secondary,i*2);
 }
 geometry.setAttribute('courseTreeShape',new THREE.BufferAttribute(shape,4));
 geometry.setAttribute('courseTreePhase',new THREE.BufferAttribute(phase,2));
}

export function treeWindShader(shader,{drive,waves,cross}){
 shader.uniforms.courseTreeDrive=drive;shader.uniforms.courseTreeWaves=waves;shader.uniforms.courseTreeCross=cross;
 shader.vertexShader=`attribute vec4 courseTreeShape;
 attribute vec2 courseTreePhase;
 uniform float courseTreeDrive;
 uniform vec4 courseTreeWaves;
 uniform vec2 courseTreeCross;
 float treeWindWave(){return courseTreeDrive*(.68+.22*(courseTreeWaves.x*courseTreeShape.z-courseTreeWaves.y*courseTreeShape.w)+.10*(courseTreeWaves.z*courseTreePhase.x-courseTreeWaves.w*courseTreePhase.y));}
 `+shader.vertexShader;
 // The merge stores world-space vertices with identity model transforms.
 // The analytic shear normal keeps highlights attached to the bending form.
 shader.vertexShader=shader.vertexShader.replace('#include <beginnormal_vertex>',`#include <beginnormal_vertex>
  float treeSlope=treeWindWave()*courseTreeShape.y;
  objectNormal.y-=treeSlope*(objectNormal.x+.18*courseTreeCross.x*objectNormal.z);`);
 shader.vertexShader=shader.vertexShader.replace('#include <begin_vertex>',`#include <begin_vertex>
  float treeBend=treeWindWave()*courseTreeShape.x;
  transformed.x+=treeBend;
  transformed.z+=treeBend*.18*courseTreeCross.x;`);
}
