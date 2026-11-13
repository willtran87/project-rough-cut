import * as THREE from './vendor/three/three.module.js';
import {mergeIndexedGeometries} from './indexed-geometry.js';
import {compactVisibleIndices} from './visible-indices.js';

const LAYER=29;
// A Lambert surface receives no direct light on its back side. This avoids
// sampling the cube for zero-contribution fragments without changing shading.
export function skipUnlitBeaconLookups(material){
 if(!material.isMeshLambertMaterial)return;
 const compile=material.onBeforeCompile,key=material.customProgramCacheKey();
 material.onBeforeCompile=function(shader,renderer){compile.call(this,shader,renderer);shader.fragmentShader=shader.fragmentShader.replace('#include <lights_fragment_begin>',THREE.ShaderChunk.lights_fragment_begin).replace('( directLight.visible && receiveShadow ) ? getPointShadow','( directLight.visible && receiveShadow && dot( geometryNormal, directLight.direction ) > 0.0 ) ? getPointShadow');};
 material.customProgramCacheKey=()=>key+'-beacon-facing-v1';
}
// Shadow-only copies retain the actual authored opaque geometry, independent
// of camera culling. No detailed needle cards, skinned meshes or shadow maps
// for the moon/headlights. Six 128px depth faces use one nearest lookup.
export function createChaseBeaconShadows(scene){
 const cells=new Map(),meshes=[],moving=[],covers=[],faces=[],material=new THREE.MeshBasicMaterial({side:THREE.DoubleSide});
 // This Three renderer samples a native cube depth texture. Its default point
 // caster still calculates and packs radial distance into an unused colour
 // attachment. Projection depth is identical with a depth-only material.
 const depthMaterial=new THREE.ShaderMaterial({colorWrite:false,
  vertexShader:'void main(){gl_Position=projectionMatrix*(modelViewMatrix*vec4(position,1.0));}',
  fragmentShader:'void main(){}'});
 const faceCamera=new THREE.PerspectiveCamera(90,1,.5,40),matrix=new THREE.Matrix4(),target=new THREE.Vector3();let sourceIndices=null,uploaded=0;
 let light=null,parts=0,triangles=0,updates=0,faceTests=0,faceDraws=0,lastX=Infinity,lastY=Infinity,lastZ=Infinity,lastTime=-Infinity;
 function collect(g,source){
  if(!source?.isMeshLambertMaterial||source.transparent||source.alphaTest>0)return;
  g.computeBoundingBox();const b=g.boundingBox;
  const width=b.max.x-b.min.x,height=b.max.y-b.min.y,depth=b.max.z-b.min.z;
  if(b.max.y<.55||height<.12||width*height*depth<.035)return;
  // The numerous small mouldings, tubes and bevels do not form navigational
  // cover. Keep simple authored solids; dense rounded crowns use an interior
  // octahedron, never an oversized box that shadows an open passage.
  let copy;
  if(g.attributes.position.count>96){
   if(g.type!=='IcosahedronGeometry')return;
   copy=new THREE.OctahedronGeometry(1,0);copy.scale(width*.43,height*.43,depth*.43);copy.translate((b.min.x+b.max.x)*.5,(b.min.y+b.max.y)*.5,(b.min.z+b.max.z)*.5);
  }else copy=g.clone();
  // Group immutable world-space shapes by position before merging, so nearby
  // cover occupies contiguous index runs for the finite-volume compactor.
  const key=Math.floor((b.min.z+b.max.z)*.5/32);
  if(!cells.has(key))cells.set(key,[]);cells.get(key).push(copy);parts++;
 }
 function build(source){
  light=source;light.castShadow=true;light.shadow.mapSize.set(128,128);
  light.shadow.camera.near=.5;light.shadow.camera.far=40;light.shadow.camera.layers.set(LAYER);
  light.shadow.bias=-.00005;light.shadow.normalBias=.035;
  light.shadow.autoUpdate=false;light.shadow.needsUpdate=true;
  const pieces=[...cells.values()].flat();let offset=0;
  for(const g of pieces){g.computeBoundingBox();const count=g.index?.count??g.attributes.position.count;covers.push({bounds:g.boundingBox.clone(),offset,count,visible:true,drawOffset:offset});offset+=count;}
  const geometry=mergeIndexedGeometries(pieces);for(const g of pieces)g.dispose();
  sourceIndices=geometry.index.array.slice();triangles=geometry.index.count/3;
  for(const [direction,up]of [ [[1,0,0],[0,-1,0]],[[-1,0,0],[0,-1,0]],[[0,1,0],[0,0,1]],[[0,-1,0],[0,0,-1]],[[0,0,1],[0,-1,0]],[[0,0,-1],[0,-1,0]] ]){
   // Opaque depth needs positions only. Share that one immutable buffer;
   // normals/UVs remain on the visible scene, not six hidden shadow copies.
   const g=new THREE.BufferGeometry();g.setAttribute('position',geometry.getAttribute('position'));
   g.setIndex(new THREE.BufferAttribute(sourceIndices.slice(),1).setUsage(THREE.DynamicDrawUsage));
   const face={direction:new THREE.Vector3(...direction),up:new THREE.Vector3(...up),frustum:new THREE.Frustum(),parts:covers.map(p=>({...p,source:p})),geometry:g};
   const mesh=new THREE.Mesh(g,material);mesh.name='BeaconCover';mesh.layers.set(LAYER);mesh.castShadow=true;mesh.customDistanceMaterial=depthMaterial;
   // Three sets this shadow camera before each cube-face traversal. Select
   // only the matching precomputed list; never rewrite an already submitted
   // index buffer inside onBeforeShadow.
   mesh.intersectsFrustum=()=>{faceTests++;const e=light.shadow.camera.matrixWorld.elements,d=face.direction,match=-(e[8]*d.x+e[9]*d.y+e[10]*d.z)>.999;
    if(match&&g.drawRange.count>0){faceDraws++;return true;}return false;};
   scene.add(mesh);meshes.push(mesh);faces.push(face);
  }
  cells.clear();clip();
 }
 function clip(){
  for(const p of covers)p.near=p.bounds.distanceToPoint(light.position)<=42;
  faceCamera.position.copy(light.position);
  for(const face of faces){
   faceCamera.up.copy(face.up);faceCamera.lookAt(target.copy(light.position).add(face.direction));faceCamera.updateMatrixWorld(true);
   face.frustum.setFromProjectionMatrix(matrix.multiplyMatrices(faceCamera.projectionMatrix,faceCamera.matrixWorldInverse));
   for(const p of face.parts)p.visible=p.source.near&&face.frustum.intersectsBox(p.bounds);
   uploaded+=compactVisibleIndices(face.geometry,face.parts,sourceIndices);
  }
 }
 function update(time){
  if(light.intensity<=0){light.shadow.needsUpdate=false;return;}
  const p=light.position;
  let moved=false;
  for(const caster of moving){caster.object.updateWorldMatrix(true,false);if(!caster.matrix.equals(caster.object.matrixWorld)){caster.matrix.copy(caster.object.matrixWorld);moved=true;}}
  // Light intensity/comfort pulses do not change occlusion. Refresh on real
  // source movement, including reverse time/retry, with sub-texel hysteresis.
  if(moved||time<lastTime||Math.hypot(p.x-lastX,p.y-lastY,p.z-lastZ)>.12){
   clip();light.shadow.needsUpdate=true;lastX=p.x;lastY=p.y;lastZ=p.z;updates++;
  }
  lastTime=time;
 }
 function warm(renderer,camera){
  const viewport=renderer.getViewport(new THREE.Vector4()),scissor=renderer.getScissor(new THREE.Vector4()),test=renderer.getScissorTest();
  try{renderer.setViewport(0,0,1,1);renderer.setScissor(0,0,1,1);renderer.setScissorTest(true);light.shadow.needsUpdate=true;renderer.render(scene,camera);}finally{renderer.setViewport(viewport);renderer.setScissor(scissor);renderer.setScissorTest(test);}
 }
 function addCaster(object){object.traverse(o=>{if(o.isMesh){o.layers.enable(LAYER);o.castShadow=true;o.customDistanceMaterial=depthMaterial;}});moving.push({object,matrix:new THREE.Matrix4()});}
 return {collect,build,update,warm,addCaster,stats:()=>({parts,triangles,submittedTriangles:faces.reduce((n,f)=>n+f.geometry.drawRange.count/3,0),indexValuesUploaded:uploaded,batches:meshes.length,size:128,updates,faceTests,faceDraws,moving:moving.length}),dispose(){for(const m of meshes){m.geometry.dispose();m.removeFromParent();}for(const pieces of cells.values())for(const g of pieces)g.dispose();cells.clear();material.dispose();depthMaterial.dispose();light?.shadow.dispose();}};
}
