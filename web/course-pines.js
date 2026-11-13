import {withoutPointLights} from './zero-point-light-material.js';
import * as THREE from './vendor/three/three.module.js';
import * as Art from './pixel-art.js';

// Authored Level 1 branches/needle UVs, baked once and instanced only where
// visible. Four small templates replace whole-course procedural construction.
export async function loadCoursePineGeometry(){
 const [manifest,response]=await Promise.all([fetch('./assets/baked/course-pines.json').then(r=>r.json()),fetch('./assets/baked/course-pines.bin.gz')]);
 if(!response.ok)throw Error('Course pine geometry could not load');
 const data=await new Response(response.body.pipeThrough(new DecompressionStream('gzip'))).arrayBuffer();
 if(data.byteLength!==manifest.bytes)throw Error('Incomplete course pine geometry');
 return {manifest,data};
}
export async function createCoursePines(scene,woodMaterial,placements,software=false,geometryAsset=null){
 const {manifest,data}=await (geometryAsset||loadCoursePineGeometry());
 // Four original needle crops share one padded atlas: two draws per tree form,
 // rather than five, without replacing the painted foliage with solid blobs.
 const source=await Art.source('rough-cut-needle-sprays-v1');if(!source)throw Error('Course foliage could not load');
 const canvas=document.createElement('canvas');canvas.width=1216;canvas.height=796;const ctx=canvas.getContext('2d',{willReadFrequently:true});ctx.imageSmoothingEnabled=false;
 [[24,170,600,380],[650,180,600,340],[24,790,600,330],[650,740,600,390]].forEach((crop,i)=>ctx.drawImage(source,...crop,(i%2)*608+4,Math.floor(i/2)*398+4,600,390));
 const map=new THREE.CanvasTexture(canvas);map.colorSpace=THREE.SRGBColorSpace;map.magFilter=THREE.NearestFilter;map.minFilter=THREE.NearestMipmapLinearFilter;
 const needles=new THREE.MeshLambertMaterial({map,alphaTest:.32,side:THREE.DoubleSide,color:0xc3d0bc});
 needles.onBeforeCompile=s=>{s.fragmentShader=s.fragmentShader.replace('#include <alphatest_fragment>','#include <alphatest_fragment>\ndiffuseColor.rgb=pow(max(diffuseColor.rgb,vec3(0.0)),vec3(.72));');};needles.customProgramCacheKey=()=> 'rough-cut-needle-sprays-v1';
 const groups=manifest.templates.map(t=>t.parts.map(part=>{const g=new THREE.BufferGeometry();for(const [name,a] of Object.entries(part.attributes))g.setAttribute(name,new THREE.BufferAttribute(new Float32Array(data,a.offset,a.length),a.itemSize));if(part.index){const a=part.index,Index=a.type==='uint16'?Uint16Array:Uint32Array;g.setIndex(new THREE.BufferAttribute(new Index(data,a.offset,a.length),1));}g.computeBoundingSphere();const m=new THREE.InstancedMesh(g,part.kind==='wood'?woodMaterial:needles,24);m.instanceMatrix.setUsage(THREE.DynamicDrawUsage);m.frustumCulled=false;m.count=0;scene.add(m);return m;}));
 const lite=software?new Map([[woodMaterial,withoutPointLights(woodMaterial)],[needles,withoutPointLights(needles)]]):null,full=groups.map(group=>group.map(m=>m.material)),warmGroup=new THREE.Group();let outsideGroups=0;
 // Per-form bounds include the actual branch and needle geometry, transformed
 // for each tree. Testing every selected tree avoids a loose cross-course union.
 const treeBounds=placements.map(p=>{const bounds=new THREE.Sphere(new THREE.Vector3(),-1);for(const m of groups[p.variant])bounds.union(m.geometry.boundingSphere);return bounds;});
 const frustum=new THREE.Frustum(),matrix=new THREE.Matrix4(),sphere=new THREE.Sphere(),dummy=new THREE.Object3D();let visible=0,uploadedMatrices=0;
 const transforms=placements.map(p=>{dummy.position.set(p.x,p.y||0,p.z);dummy.rotation.set(0,p.turn,0);dummy.scale.set(p.w,p.h/8,p.w);dummy.updateMatrix();return dummy.matrix.clone();}),previous=groups.map(()=>[]);
 for(let i=0;i<treeBounds.length;i++)treeBounds[i].applyMatrix4(transforms[i]);
 const lightPosition=new THREE.Vector3();let currentLights=[],selected=groups.map(()=>[]);
 function update(camera,pointLights=currentLights){currentLights=pointLights;outsideGroups=0;camera.updateMatrixWorld();frustum.setFromProjectionMatrix(matrix.multiplyMatrices(camera.projectionMatrix,camera.matrixWorldInverse));for(const ids of selected)ids.length=0;visible=uploadedMatrices=0;
  for(let id=0;id<placements.length;id++){const p=placements[id];if(Math.abs(p.z-camera.position.z)>92)continue;sphere.center.set(p.x,p.h*.5,p.z);sphere.radius=p.h*.7;if(!frustum.intersectsSphere(sphere)||selected[p.variant].length>=24)continue;selected[p.variant].push(id);visible++;}
  groups.forEach((group,i)=>{const ids=selected[i],old=previous[i];
   const outside=software&&ids.length>0&&pointLights.length>0&&pointLights.every(light=>{if(!light.visible||light.intensity===0)return true;if(!(light.distance>0&&Number.isFinite(light.distance)))return false;light.getWorldPosition(lightPosition);return ids.every(id=>treeBounds[id].distanceToPoint(lightPosition)>light.distance+.01);});
   if(outside)outsideGroups+=group.length;group.forEach((m,j)=>{m.material=outside?lite.get(full[i][j]):full[i][j];});
   let first=Infinity,last=0;
   for(let slot=0;slot<ids.length;slot++)if(ids[slot]!==old[slot]){for(const m of group)m.setMatrixAt(slot,transforms[ids[slot]]);first=Math.min(first,slot);last=slot+1;}
   for(const m of group){m.count=ids.length;if(last>first){m.instanceMatrix.addUpdateRange(first*16,(last-first)*16);m.instanceMatrix.needsUpdate=true;uploadedMatrices+=last-first;}}
   previous[i]=ids;selected[i]=old;
  });
 }
 return {update,allMaterials:()=>[...full.flat(),...(lite?.values()||[])],stats:()=>({forms:manifest.templates.map(t=>t.form),placed:placements.length,visible,uploadedMatrices,outsideGroups,drawGroups:groups.flat().length}),finishWarm(){scene.remove(warmGroup);warmGroup.clear();},warm(){if(software){groups.forEach((group,i)=>group.forEach((m,j)=>{m.material=full[i][j];}));const layouts=new Set();groups.forEach((group,i)=>group.forEach((m,j)=>{const key=full[i][j].uuid+':'+m.geometry.index.array.constructor.name+':'+Object.entries(m.geometry.attributes).map(([name,a])=>name+':'+a.itemSize+':'+a.array.constructor.name).join(',');if(layouts.has(key))return;layouts.add(key);const proxy=m.clone(false);proxy.material=lite.get(full[i][j]);proxy.instanceMatrix=m.instanceMatrix;proxy.count=1;proxy.frustumCulled=false;warmGroup.add(proxy);}));scene.add(warmGroup);}previous.forEach(ids=>ids.length=0);groups.forEach(g=>g.forEach(m=>{m.count=1;m.setMatrixAt(0,new THREE.Matrix4());m.instanceMatrix.needsUpdate=true;}));},dispose(){for(const g of groups)for(const m of g){m.geometry.dispose();m.dispose();scene.remove(m);}scene.remove(warmGroup);for(const m of lite?.values()||[])m.dispose();needles.dispose();map.dispose();}};
}
