import * as THREE from './vendor/three/three.module.js';

// Sample the shipped pixel art once during the ghost bake. The result is
// carried by vertices, so sightings need no new image atlas or texture fetch.
export function bakeShadowAppearance(nodes){
 const pixels=new Map(),appearances=new Map();
 function imagePixels(map){
  if(!map?.image)return null;if(pixels.has(map))return pixels.get(map);
  const image=map.image,c=document.createElement('canvas');c.width=image.width;c.height=image.height;
  const ctx=c.getContext('2d',{willReadFrequently:true});ctx.drawImage(image,0,0);
  const result={width:c.width,height:c.height,data:ctx.getImageData(0,0,c.width,c.height).data};pixels.set(map,result);return result;
 }
 const palette={Sweater:[.024,.035,.031],Collar:[.042,.047,.038],Skin:[.044,.053,.048],Face:[.044,.053,.048],Trousers:[.028,.032,.025],Leather:[.018,.022,.019],Hair:[.011,.015,.013],Rubber:[.014,.019,.016],Seam:[.019,.026,.022]};
 for(const node of nodes){
  const geometry=node.geometry,m=Array.isArray(node.material)?node.material[0]:node.material,source=imagePixels(m.map),uv=geometry.attributes.uv;
  const metal=node.name==='Scythe blade'||node.name==='Scythe edge';
  const base=palette[m.name]||(node.name==='Scythe edge'?[.10,.12,.104]:metal?[.062,.077,.066]:[.025,.031,.028]);
  const colors=new Float32Array(geometry.attributes.position.count*3),metals=new Float32Array(geometry.attributes.position.count);
  for(let i=0;i<metals.length;i++){
   let grain=1;
   if(source&&uv){
    const coordinate=(v,size,wrap)=>Math.max(0,Math.min(size-1,Math.floor((wrap===THREE.RepeatWrapping?((v%1)+1)%1:Math.max(0,Math.min(1,v)))*size)));
    const x=coordinate(uv.getX(i),source.width,m.map.wrapS),y=coordinate(m.map.flipY?1-uv.getY(i):uv.getY(i),source.height,m.map.wrapT),offset=(y*source.width+x)*4;
    const luminance=(.2126*source.data[offset]+.7152*source.data[offset+1]+.0722*source.data[offset+2])/255;
    grain=.65+luminance*.65;
   }
   colors.set(base.map(c=>c*grain),i*3);metals[i]=metal?1:0;
  }
  appearances.set(node,{color:new THREE.BufferAttribute(colors,3),ghostMetal:new THREE.BufferAttribute(metals,1)});
 }
 return appearances;
}

export function createShadowMaterial(){
 const material=new THREE.MeshPhongMaterial({color:0xffffff,vertexColors:true,emissive:0,shininess:64,specular:0x737d70,side:THREE.FrontSide,transparent:true,opacity:0,depthWrite:false,depthTest:true});
 material.onBeforeCompile=shader=>{
  shader.vertexShader='attribute float ghostMetal; varying float shadowMetal; varying vec3 shadowSurface;\n'+shader.vertexShader;
  shader.vertexShader=shader.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\nshadowMetal=ghostMetal; shadowSurface=position;');
  shader.fragmentShader='varying float shadowMetal; varying vec3 shadowSurface;\n'+shader.fragmentShader;
  shader.fragmentShader=shader.fragmentShader.replace('#include <color_fragment>',`#include <color_fragment>
   // Rest-pose coordinates travel with the morphing body. No screen noise,
   // clock-driven shimmer, hard alpha discard, or view-dependent fade.
   vec3 shadowPixel=floor(shadowSurface*128.0)/128.0;
   float shadowPatch=clamp(.5+.24*sin(shadowPixel.x*4.1+shadowPixel.y*5.7)+.16*cos(shadowPixel.z*6.3-shadowPixel.y*2.4),0.,1.);
   float shadowReveal=clamp(opacity/.46,0.,1.);
   float shadowDissolve=smoothstep(shadowPatch*.58,shadowPatch*.58+.34,shadowReveal);
   diffuseColor.a*=shadowDissolve;
   diffuseColor.rgb*=.58+.42*shadowPatch;
  `);
  shader.fragmentShader=shader.fragmentShader.replace('#include <specularmap_fragment>','#include <specularmap_fragment>\nspecularStrength*=shadowMetal;');
 };
 material.customProgramCacheKey=()=> 'ug-shadow-surface-fade-v1';
 return material;
}
