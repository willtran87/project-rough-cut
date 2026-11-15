import * as THREE from './vendor/three/three.module.js';
import {strikeDebrisSample,STRIKE_DEBRIS_COUNT} from './under-green-strike-debris.js';
import {organicContactStats} from './under-green-organic-contact.js';

export function createStrikeDebris(scene){
 const capacity=8*STRIKE_DEBRIS_COUNT,geometry=new THREE.IcosahedronGeometry(1,0),alphas=new THREE.InstancedBufferAttribute(new Float32Array(capacity),1);
 geometry.setAttribute('chipAlpha',alphas);alphas.setUsage(THREE.DynamicDrawUsage);
 const material=new THREE.MeshLambertMaterial({color:0xffffff,transparent:true,depthWrite:false});
 material.onBeforeCompile=s=>{
  s.vertexShader='attribute float chipAlpha;varying float chipFade;\n'+s.vertexShader;
  s.vertexShader=s.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\nchipFade=chipAlpha;');
  s.fragmentShader='varying float chipFade;\n'+s.fragmentShader;
  s.fragmentShader=s.fragmentShader.replace('#include <color_fragment>','#include <color_fragment>\ndiffuseColor.a*=chipFade;');
 };
 material.customProgramCacheKey=()=> 'drain-masonry-chips-v1';
 const mesh=new THREE.InstancedMesh(geometry,material,capacity),dummy=new THREE.Object3D();mesh.name='Scythe masonry contact flecks';mesh.count=0;mesh.visible=false;mesh.frustumCulled=false;mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);scene.add(mesh);
 const stone=new THREE.Color(0x827760),soil=new THREE.Color(0x827050);for(let i=0;i<capacity;i++)mesh.setColorAt(i,stone);mesh.instanceColor.setUsage(THREE.DynamicDrawUsage);
 let count=0,last=null;
 return {
  update(run,reduced=false){
   count=0;last=null;
   if(!reduced)for(const contact of run.sceneryContacts||[])for(let i=0;i<STRIKE_DEBRIS_COUNT;i++){
    const p=strikeDebrisSample(contact,i,run.time);if(!p)continue;
    dummy.position.set(p.x,p.height,-p.y);dummy.rotation.set(p.rotation,p.rotation*.7,p.rotation*.4);dummy.scale.set(p.size,p.size*.55,p.size*.8);dummy.updateMatrix();mesh.setMatrixAt(count,dummy.matrix);mesh.setColorAt(count,contact.material==='masonry'?stone:soil);alphas.setX(count++,p.alpha);last=contact;
   }
   mesh.count=count;mesh.visible=count>0;if(count){mesh.instanceMatrix.needsUpdate=true;mesh.instanceColor.needsUpdate=true;alphas.needsUpdate=true;}
  },
  stats:()=>({active:count,capacity,last,attributeBytes:capacity*20*4,organic:organicContactStats()}),
  dispose(){mesh.removeFromParent();geometry.dispose();material.dispose();}
 };
}
