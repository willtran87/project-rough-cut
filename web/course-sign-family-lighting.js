import * as THREE from './vendor/three/three.module.js';

// Board-local reading fixtures: illumination is evaluated only on their own
// static panels/hardware. This is intentionally not another set of world lights.
// Existing world lighting/shadows still reach these Lambert materials normally.
export function createCourseSignFamilyLighting(){
 const lensPositions=[],sources=[],power={value:1.2},color=new THREE.Color(0xffdda2);
 function fixtures(box,{x,y,z,size=1,yaw=0,twoSided=false}){
  const cosine=Math.cos(yaw),sine=Math.sin(yaw);
  for(const side of twoSided?[1,-1]:[1]){
   const parts=[
    [0,.525,.10,.055,.19,.055,0x657367],
    [0,.625,.24,.055,.055,.40,0x657367],
    [0,.57,.37,.62,.025,.34,0x536153],
    [0,.515,.53,.62,.09,.025,0x3f5046],
    [0,.515,.21,.62,.09,.025,0x3f5046],
    [-.297,.515,.37,.025,.09,.30,0x3f5046],
    [.297,.515,.37,.025,.09,.30,0x3f5046],
    [-.18,.585,.37,.035,.012,.035,0xa49e7c],
    [.18,.585,.37,.035,.012,.035,0xa49e7c]
   ];
   for(const [px,py,pz,w,h,d,tint]of parts)box(x+px*size,y+py*size,z+pz*size*side,w*size,h*size,d*size,tint);
   // Lamp lenses are recessed in the hood. Fixed guards share the body batch.
   for(const px of [-.16,0,.16])box(x+px*size,y+.471*size,z+.37*size*side,.012*size,.012*size,.22*size,0x415147);
   const corners=[[-.24,.475,.275],[.24,.475,.275],[.24,.475,.465],[-.24,.475,.465]];
   for(const index of side===1?[0,1,2,0,2,3]:[0,2,1,0,3,2]){
    const [cx,cy,cz]=corners[index],dx=cx*size,dz=cz*size*side;
    lensPositions.push(x+dx*cosine+dz*sine,y+cy*size,z-dx*sine+dz*cosine);
   }
   sources.push({position:[x+.37*size*side*sine,y+.457*size,z+.37*size*side*cosine],range:1.85*size});
  }
 }
 function attributes(geometry,entries,{scale,xScale,faces=false}){
  const count=geometry.attributes.position.count,centers=new Float32Array(count*4),axes=new Float32Array(count*4);
  for(const e of entries){
   const center=[e.x*xScale,e.y,-e.z*scale,e.boardScale||1],axis=[Math.sin(e.yaw||0),0,Math.cos(e.yaw||0),e.junction?0:1];
   const start=faces?e.start:e.bodyStart,length=faces?e.vertices:e.bodyCount;
   for(let i=start;i<start+length;i++){centers.set(center,i*4);axes.set(axis,i*4);}
  }
  geometry.setAttribute('courseSignCenter',new THREE.BufferAttribute(centers,4));
  geometry.setAttribute('courseSignAxis',new THREE.BufferAttribute(axes,4));
 }
 function material(options){
  const m=new THREE.MeshLambertMaterial(options);
  m.onBeforeCompile=shader=>{
   shader.uniforms.courseSignReadingPower=power;
   shader.vertexShader='attribute vec4 courseSignCenter;\nattribute vec4 courseSignAxis;\nvarying vec4 vCourseSignCenter;\nvarying vec4 vCourseSignAxis;\n'+shader.vertexShader;
   shader.vertexShader=shader.vertexShader.replace('#include <begin_vertex>',`#include <begin_vertex>
vCourseSignCenter=vec4((modelMatrix*vec4(courseSignCenter.xyz,1.0)).xyz,courseSignCenter.w);
vCourseSignAxis=vec4(normalize(mat3(modelMatrix)*courseSignAxis.xyz),courseSignAxis.w);`);
   shader.fragmentShader='uniform float courseSignReadingPower;\nvarying vec4 vCourseSignCenter;\nvarying vec4 vCourseSignAxis;\n'+shader.fragmentShader;
   shader.fragmentShader=shader.fragmentShader.replace('#include <lights_fragment_end>',`
vec3 signWorld=(vec4(geometryPosition,1.0)-viewMatrix[3]).xyz*mat3(viewMatrix);
float signScale=vCourseSignCenter.w;
for(int signSide=0;signSide<2;signSide++){
 if(signSide==0||vCourseSignAxis.w>.5){
  float signFacing=signSide==0?1.0:-1.0;
  vec3 signForward=vCourseSignAxis.xyz*signFacing;
  vec3 signSource=vCourseSignCenter.xyz+vec3(0.0,.457*signScale,0.0)+signForward*(.37*signScale);
  vec3 signDelta=signSource-signWorld;
  float signD2=dot(signDelta,signDelta),signRange2=3.4225*signScale*signScale;
  if(signD2<signRange2){
   float signCutoff=max(1.0-signD2*signD2/(signRange2*signRange2),0.0);
   vec3 signAim=normalize(vec3(0.0,-.497,0.0)-signForward*.315);
   float signCone=smoothstep(${Math.cos(1.4).toFixed(9)},${Math.cos(1.4*(1-.22)).toFixed(9)},dot(-normalize(signDelta),signAim));
   IncidentLight signLight;
   signLight.color=vec3(${color.toArray().map(v=>v.toFixed(9)).join(',')})*courseSignReadingPower*signScale*signScale*signCutoff*signCutoff*signCone/max(signD2,.01);
   signLight.direction=normalize(mat3(viewMatrix)*signDelta);signLight.visible=true;
   RE_Direct(signLight,geometryPosition,geometryNormal,geometryViewDir,geometryClearcoatNormal,material,reflectedLight);
  }
 }
}
#include <lights_fragment_end>`);
  };
  m.customProgramCacheKey=()=> 'course-sign-local-reading-v1';return m;
 }
 function lenses(parent){
  const geometry=new THREE.BufferGeometry();geometry.setAttribute('position',new THREE.Float32BufferAttribute(lensPositions,3));geometry.computeBoundingSphere();
  const mesh=new THREE.Mesh(geometry,new THREE.MeshBasicMaterial({color:0xffdda2,side:THREE.DoubleSide}));mesh.name='CourseNavigationReadingLenses';parent.add(mesh);return mesh;
 }
 return {fixtures,attributes,material,lenses,power,stats:()=>({fixtures:sources.length,worldLights:0,power:power.value,sources})};
}
