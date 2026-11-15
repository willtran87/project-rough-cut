import * as THREE from './vendor/three/three.module.js';
import {treeWindShader} from './course-tree-wind.js';

const clamp=(v,a=0,b=1)=>Math.max(a,Math.min(b,v));
const gust=(time,x,z)=>.68+.22*Math.sin(time*.82-x*.16-z*.07)+.10*Math.sin(time*1.67-(x*.16+z*.07)*.4);
export const courseWindGLSL=`
uniform float courseWindClock;
uniform float courseWindDrive;
float courseGust(vec2 p){float phase=dot(p,vec2(.16,.07));return .68+.22*sin(courseWindClock*.82-phase)+.10*sin(courseWindClock*1.67-phase*.4);}
`;

// A cosmetic wind field driven by the existing gameplay wind. Shelter is baked
// from every solid footprint; this never changes hearing, cover or navigation.
export function createCourseWind(data,{scale=.16,xScale=.1152}={}){
 const blockers=(data.obstacles||[]).filter(o=>o.blocks).map(o=>({x:o.x*xScale,z:-o.y*scale,rx:(o.radiusX??o.radius??0)*scale,rz:(o.radiusY??o.radius??0)*scale,box:o.shape==='box'})).filter(o=>o.rx>0&&o.rz>0);
 const clock={value:0},drive={value:0},waves={value:new THREE.Vector4(0,1,0,1)},cross={value:new THREE.Vector2(0,1)};let last=null;
 function exposure(x,z,direction){
  let amount=1;
  for(const o of blockers){
   const side=Math.abs(z-o.z)/o.rz;if(side>=1)continue;
   const half=o.rx*(o.box?1:Math.sqrt(1-side*side));
   const distance=(x-o.x)*direction-half;
   if(distance< -2*half||distance>4)continue;
   const edge=clamp((1-side)*5),wake=distance<0?1:1-distance/4;
   amount=Math.min(amount,1-.84*edge*wake);
  }
  return amount;
 }
 function update(frame){
  if(last!==null&&frame.time<last){clock.value=0;drive.value=0;waves.value.set(0,1,0,1);cross.value.set(0,1);last=null;}
  const dt=last===null?0:clamp(frame.time-last,0,.1);last=frame.time;
  if(frame.reducedMotion||frame.fx?.enabled===false){drive.value=0;return;}
  if(frame.paused)return;
  clock.value+=dt;
  waves.value.set(Math.sin(clock.value*.82),Math.cos(clock.value*.82),Math.sin(clock.value*1.67),Math.cos(clock.value*1.67));cross.value.set(Math.sin(clock.value*.63),Math.cos(clock.value*.63));
  const target=(.10+.90*clamp(frame.fx?.wind?.strength||0))*(frame.fx?.wind?.direction<0?-1:1);
  drive.value+=(target-drive.value)*(1-Math.exp(-dt*4));
 }
 function uniforms(shader){shader.uniforms.courseWindClock=clock;shader.uniforms.courseWindDrive=drive;shader.vertexShader=courseWindGLSL+shader.vertexShader;}
 function vegetationShader(shader,amplitude=.10){
  uniforms(shader);shader.uniforms.courseWindWaves=waves;shader.uniforms.courseWindCross=cross;
  shader.vertexShader='attribute vec2 courseWindShelter;attribute vec4 courseWindPhase;attribute vec2 courseWindSide;uniform vec4 courseWindWaves;uniform vec2 courseWindCross;\n'+shader.vertexShader;
  // Contact already supplies the complete instance/world transform. Append
  // wind after it: roots (uv.y=0) remain fixed under either deformation.
  shader.vertexShader=shader.vertexShader.replace('#include <project_vertex>',`
   if(abs(courseWindDrive)>.00001){
   float courseExposure=courseWindDrive>=0.0?courseWindShelter.x:courseWindShelter.y;
   float courseWave=.68+.22*(courseWindWaves.x*courseWindPhase.x-courseWindWaves.y*courseWindPhase.y)+.10*(courseWindWaves.z*courseWindPhase.z-courseWindWaves.w*courseWindPhase.w);
   float courseBend=courseWindDrive*courseExposure*courseWave*${amplitude.toFixed(3)}*min(1.0,max(0.0,vegetationWorld.y))*uv.y*uv.y;
   vec3 courseDelta=vec3(courseBend,-abs(courseBend)*.12,courseBend*.18*dot(courseWindCross,courseWindSide));
   transformed+=vec3(dot(courseDelta,vegetationTransform[0].xyz)/dot(vegetationTransform[0].xyz,vegetationTransform[0].xyz),dot(courseDelta,vegetationTransform[1].xyz)/dot(vegetationTransform[1].xyz,vegetationTransform[1].xyz),dot(courseDelta,vegetationTransform[2].xyz)/dot(vegetationTransform[2].xyz,vegetationTransform[2].xyz));
   }
   #include <project_vertex>`);
 }
 function bindGeometry(geometry,placements=null){
  const count=placements?placements.length:geometry.attributes.position.count,values=new Float32Array(count*2),phases=new Float32Array(count*4),sides=new Float32Array(count*2);
  // Instance translations are Float32 on the GPU. Bake from those same
  // coordinates, particularly at narrow windbreak edges.
  for(let i=0;i<count;i++){const x=placements?Math.fround(placements[i].x):geometry.attributes.position.getX(i),z=placements?Math.fround(placements[i].z):geometry.attributes.position.getZ(i),phase=x*.16+z*.07;values[i*2]=exposure(x,z,1);values[i*2+1]=exposure(x,z,-1);phases.set([Math.cos(phase),Math.sin(phase),Math.cos(phase*.4),Math.sin(phase*.4)],i*4);sides.set([Math.cos(z*.17),Math.sin(z*.17)],i*2);}
  const Attribute=placements?THREE.InstancedBufferAttribute:THREE.BufferAttribute;
  geometry.setAttribute('courseWindShelter',new Attribute(values,2));geometry.setAttribute('courseWindPhase',new Attribute(phases,4));geometry.setAttribute('courseWindSide',new Attribute(sides,2));
 }
 function attach(material,amplitude=.10){const previous=material.onBeforeCompile,key=material.customProgramCacheKey();material.onBeforeCompile=function(s,r){previous.call(this,s,r);vegetationShader(s,amplitude);};material.customProgramCacheKey=()=>key+'-course-wind-v1-'+amplitude;}
 function flagShader(shader,anchor={x:14.8,z:-89}){uniforms(shader);shader.uniforms.courseFlagAnchor={value:new THREE.Vector2(anchor.x,anchor.z)};shader.vertexShader='uniform vec2 courseFlagAnchor;\n'+shader.vertexShader;shader.vertexShader=shader.vertexShader.replace('#include <begin_vertex>',`#include <begin_vertex>
   float cloth=position.x*position.x;
   transformed.y-=cloth*.12*(1.0-abs(courseWindDrive));
   transformed.z+=position.x*.025*sin(position.x*5.0)+cloth*.11*courseWindDrive*courseGust(courseFlagAnchor)*sin(courseWindClock*2.1-position.x*4.0);`);}
 return {update,exposure,bindGeometry,vegetationShader,attach,flagShader,treeShader:shader=>treeWindShader(shader,{drive,waves,cross}),
  signAngle:(x,z)=>drive.value*exposure(x,z,drive.value<0?-1:1)*(.045*gust(clock.value,x,z)+.015*Math.sin(clock.value*.71-x*.1)),
  stats:()=>({time:clock.value,drive:drive.value,blockers:blockers.length,maxVegetationBend:.16})};
}
