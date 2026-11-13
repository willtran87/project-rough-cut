import * as THREE from './vendor/three/three.module.js';
import {joeExpression} from './final-cut-joe-expression.js';
import {JOE_GARMENT_VERTEX,JOE_GARMENT_POSITION,JOE_GARMENT_FRAGMENT,joeGarmentFinish} from './final-cut-joe-garments.js';

// The riding rig retains Level 1's body maps and face-mask vertex channel.
// Apply the same material language without changing its skinning or cab pose.
export async function finishFinalCutJoe(actor){
 const originals=new Set(),materials=new Set(),textures=new Set(),skeletons=new Set();
 let skinMap=null,faceMap=null,faceMeshes=0,expression={from:'search',to:'search',blend:1};
 actor.traverse(o=>{
  if(o.skeleton)skeletons.add(o.skeleton);
  for(const m of o.material?(Array.isArray(o.material)?o.material:[o.material]):[]){
   originals.add(m);if(m.map)textures.add(m.map);if(m.name==='Skin')skinMap=m.map;if(m.name==='Face')faceMap=m.map;
  }
 });
 const expressionMaps={scrutiny:faceMap},surfaceMaps={},loader=new THREE.TextureLoader();
 const expressionUrls={search:'./assets/optimized/joe-expressions-v1/search.webp',attack:'./assets/optimized/joe-expressions-v1/attack.webp',frustrated:'./assets/optimized/joe-expressions-v1/frustrated.webp',panic:'./assets/optimized/joe-expressions-v1/panic.webp'};
 const surfaceUrls={skin:'./assets/optimized/joe-garments-v1/skin.webp',collar:'./assets/optimized/joe-garments-v1/collar.webp'};
 const jobs=[...Object.entries(expressionUrls).map(([name,url])=>({name,url,target:expressionMaps})),...Object.entries(surfaceUrls).map(([name,url])=>({name,url,target:surfaceMaps}))];
 const loaded=await Promise.allSettled(jobs.map(async({name,url,target})=>{
  const map=await loader.loadAsync(new URL(url,import.meta.url).href);
  map.colorSpace=faceMap.colorSpace;map.flipY=faceMap.flipY;map.wrapS=faceMap.wrapS;map.wrapT=faceMap.wrapT;
  map.offset.copy(faceMap.offset);map.repeat.copy(faceMap.repeat);map.center.copy(faceMap.center);map.rotation=faceMap.rotation;
  if(target===surfaceMaps){map.wrapS=map.wrapT=THREE.RepeatWrapping;map.offset.set(0,0);map.repeat.set(1,1);map.center.set(0,0);map.rotation=0;}
  target[name]=map;textures.add(map);
 }));
 if(loaded.some(result=>result.status==='rejected')){for(const t of textures)t.dispose();throw new Error('Joe artwork failed to load',{cause:loaded.find(result=>result.status==='rejected').reason});}
 textures.delete(skinMap);skinMap.dispose();skinMap=surfaceMaps.skin;
 const expressionFrom={value:expressionMaps.search},expressionTo={value:expressionMaps.search},expressionBlend={value:1};
 for(const map of textures){map.magFilter=THREE.NearestFilter;map.minFilter=THREE.NearestMipmapLinearFilter;map.generateMipmaps=true;map.needsUpdate=true;}
 actor.traverse(o=>{
  if(!o.isMesh)return;
  const original=Array.isArray(o.material)?o.material:[o.material];
  const next=original.map(m=>{
   const face=m.name==='Face'&&!!o.geometry.attributes.color&&!!skinMap,skin=m.name==='Skin',collar=m.name==='Collar',garment=joeGarmentFinish(m.name);
   const material=new THREE.MeshLambertMaterial({name:m.name,color:m.color,map:skin?skinMap:collar?surfaceMaps.collar:m.map,side:THREE.DoubleSide});
   if(face)faceMeshes++;
   material.onBeforeCompile=shader=>{
    shader.vertexShader=JOE_GARMENT_VERTEX+shader.vertexShader;
    shader.vertexShader=shader.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\n'+JOE_GARMENT_POSITION);
    shader.fragmentShader=JOE_GARMENT_FRAGMENT+shader.fragmentShader;
    if(face){
     shader.uniforms.joeSkinMap={value:skinMap};
     shader.uniforms.joeExpressionFrom=expressionFrom;shader.uniforms.joeExpressionTo=expressionTo;shader.uniforms.joeExpressionBlend=expressionBlend;
     shader.vertexShader='attribute vec3 color; varying float joeFaceWeight;\n'+shader.vertexShader;
     shader.vertexShader=shader.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\njoeFaceWeight=color.r;');
     shader.fragmentShader='uniform sampler2D joeSkinMap; uniform sampler2D joeExpressionFrom; uniform sampler2D joeExpressionTo; uniform float joeExpressionBlend; varying float joeFaceWeight;\n'+shader.fragmentShader;
    }
    shader.fragmentShader=shader.fragmentShader.replace('#include <map_fragment>',`${face?'diffuseColor *= mix(texture2D(joeExpressionFrom,vMapUv),texture2D(joeExpressionTo,vMapUv),joeExpressionBlend);':skin?'diffuseColor.rgb *= joeSkinSample(map);':'#include <map_fragment>'}
     ${face?'diffuseColor.rgb=mix(joeSkinSample(joeSkinMap),diffuseColor.rgb,clamp(joeFaceWeight,0.0,1.0));':''}
     ${garment}
     diffuseColor.rgb=pow(max(diffuseColor.rgb,vec3(0.0)),vec3(.78));`);
    // The edge response uses actual direct light. It is not an emissive rim
    // and cannot light Joe through the reeds when the cab practical is off.
    shader.fragmentShader=shader.fragmentShader.replace('#include <opaque_fragment>',`float joeRim=pow(1.0-abs(dot(normal,normalize(vViewPosition))),3.0);
     outgoingLight+=min(vec3(.14),reflectedLight.directDiffuse*1.4)*joeRim;
     vec3 joeShade=floor(sqrt(max(outgoingLight,vec3(0.0)))*48.0+.5)/48.0;
     outgoingLight=joeShade*joeShade;
     #include <opaque_fragment>`);
   };
   material.customProgramCacheKey=()=>`final-cut-joe-finish-3-${face?'face':skin?'skin':garment?m.name:'body'}`;
   materials.add(material);return material;
  });
  o.material=Array.isArray(o.material)?next:next[0];
 });
 for(const m of originals)m.dispose();
 return {
  // Upload every variant during startup, avoiding allocation on first attack.
  prepare(renderer){for(const map of textures)renderer.initTexture(map);},
  update(run){expression=joeExpression(run);expressionFrom.value=expressionMaps[expression.from];expressionTo.value=expressionMaps[expression.to];expressionBlend.value=expression.blend;},
  stats:()=>({reference:'Level 1 palette / authored skin and checked cotton',materials:materials.size,textures:textures.size,faceMeshes,shadeSteps:48,emissive:false,expression:{...expression},expressionMaps:5,expressionSize:1254,garments:{surfaceSize:1254,skinTileMetres:.25,checkedCollar:true,wear:['elbows','ribbed cuffs','knit hem','knees','trouser hems','shoe toes','shoe heels']}}),
  dispose(){for(const m of materials)m.dispose();for(const t of textures)t.dispose();for(const s of skeletons)s.dispose();}
 };
}
