import * as THREE from './vendor/three/three.module.js';
import {joeShadowBay,JOE_SHADOW_BAYS} from './under-green-cast-shadow.js';
import {dampLampLevel} from './under-green-atmosphere.js';

// The real animated skin and articulated tool are projected in the vertex
// shader. A stencil union prevents overlapping limbs from multiplying opacity.
// No additional animation, shadow camera, render target, textures or lights.
export function createJoeCastShadow({scene,joe,lamps}){
 const uniforms={castLight:{value:new THREE.Vector3()},castBounds:{value:new THREE.Vector4()},castFloor:{value:.007}};
 const material=new THREE.MeshBasicMaterial({color:0x000000,transparent:true,opacity:0,depthWrite:false,side:THREE.DoubleSide,forceSinglePass:true,fog:false,
  stencilWrite:true,stencilRef:1,stencilFunc:THREE.NotEqualStencilFunc,stencilZPass:THREE.ReplaceStencilOp});
 material.onBeforeCompile=s=>{
  Object.assign(s.uniforms,uniforms);
  s.vertexShader='uniform vec3 castLight;uniform float castFloor;varying vec2 castPoint;\n'+s.vertexShader;
  s.vertexShader=s.vertexShader.replace('#include <project_vertex>',`
   vec3 caster=(modelMatrix*vec4(transformed,1.0)).xyz;
   float amount=(castFloor-castLight.y)/min(-.1,caster.y-castLight.y);
   vec3 projected=castLight+(caster-castLight)*amount;
   projected.y=castFloor;castPoint=projected.xz;
   vec4 mvPosition=viewMatrix*vec4(projected,1.0);
   gl_Position=projectionMatrix*mvPosition;
  `);
  s.fragmentShader='uniform vec4 castBounds;varying vec2 castPoint;\n'+s.fragmentShader;
  s.fragmentShader=s.fragmentShader.replace('#include <color_fragment>',`#include <color_fragment>
   float edge=min(min(castPoint.x-castBounds.x,castBounds.y-castPoint.x),min(castPoint.y-castBounds.z,castBounds.w-castPoint.y));
   if(edge<=0.0)discard;
   diffuseColor.a*=smoothstep(0.0,.45,edge);
   if(diffuseColor.a<.003)discard;
  `);
 };
 material.customProgramCacheKey=()=> 'under-green-real-pose-floor-shadow-v1';
 const root=new THREE.Group();root.name='Joe practical-light floor silhouette';scene.add(root);
 const casters=joe.shadowCasters(),copies=casters.map(source=>{
  const mesh=source.isSkinnedMesh?new THREE.SkinnedMesh(source.geometry,material):new THREE.Mesh(source.geometry,material);
  if(source.isSkinnedMesh){mesh.skeleton=source.skeleton;mesh.bindMatrix.copy(source.bindMatrix);mesh.bindMatrixInverse.copy(source.bindMatrixInverse);}
  mesh.matrixAutoUpdate=false;mesh.frustumCulled=false;mesh.renderOrder=-2;root.add(mesh);return {source,mesh};
 });
 let owner=null,lastTime=0,exposure=0,active=null,opacity=0,enabled=true;
 return {
  update(run,reduced=false){
   if(owner!==run){owner=run;lastTime=run.time;exposure=0;}
   const dt=Math.max(0,Math.min(.1,run.time-lastTime));lastTime=run.time;
   const selected=joeShadowBay(run);active=selected?.bay.id||null;
   // Hidden movement is suppressed immediately, including pause-time camera
   // changes. Fade only the onset after Joe is already eligible to be seen.
   if(!selected){exposure=0;opacity=0;root.visible=false;return;}
   exposure=Math.min(1,exposure+dt*5);
   const {bay,weight}=selected,index=lamps.findIndex(l=>Math.abs(l.x-bay.lamp.x)<.001&&Math.abs(l.y-bay.lamp.y)<.001);
   if(index<0){root.visible=false;opacity=0;return;}
   const lamp=lamps[index],distance=Math.hypot(run.joe.x-lamp.x,run.joe.y-lamp.y);
   opacity=.48*weight*exposure*dampLampLevel(run.time,index,reduced)*Math.max(0,1-distance/10);
   material.opacity=opacity;root.visible=enabled&&opacity>.003&&joe.root.visible;
   uniforms.castLight.value.set(lamp.x,lamp.height??2.8,-lamp.y);
   uniforms.castBounds.value.set(bay.receiver.minX,bay.receiver.maxX,-bay.receiver.maxY,-bay.receiver.minY);
   joe.root.updateMatrixWorld(true);
   for(const {source,mesh}of copies){mesh.matrix.copy(source.matrixWorld);mesh.visible=source.visible;}
  },
  stats:()=>({active,opacity:root.visible?opacity:0,visible:root.visible,casters:copies.length,skinned:copies.filter(c=>c.source.isSkinnedMesh).length,receivers:JOE_SHADOW_BAYS.map(b=>b.id),textures:0,renderTargets:0,stencilUnion:true}),
  inspect(){
   root.updateMatrixWorld(true);const a=new THREE.Vector3(),b=new THREE.Vector3(),samples=[];let maxPoseError=0;
   for(const {source,mesh}of copies){
    const count=source.geometry.attributes.position.count;
    for(const i of [0,Math.floor(count*.25),Math.floor(count*.5),Math.floor(count*.75),count-1]){
     source.getVertexPosition(i,a).applyMatrix4(source.matrixWorld);mesh.getVertexPosition(i,b).applyMatrix4(mesh.matrixWorld);maxPoseError=Math.max(maxPoseError,a.distanceTo(b));
     const light=uniforms.castLight.value,t=(uniforms.castFloor.value-light.y)/Math.min(-.1,a.y-light.y),p=a.clone().sub(light).multiplyScalar(t).add(light);p.y=uniforms.castFloor.value;
     samples.push({source:source.name,vertex:i,world:a.toArray(),projected:p.toArray()});
    }
   }
   return {maxPoseError,samples,light:uniforms.castLight.value.toArray(),receiver:uniforms.castBounds.value.toArray()};
  },
  setEnabled(value){enabled=!!value;},
  dispose(){root.removeFromParent();material.dispose();}
 };
}
