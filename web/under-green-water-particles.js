import * as THREE from './vendor/three/three.module.js';

// Tiny lit droplets and fragmented ripple crests. These are effect masks,
// retaining pixel clusters at close range without solid faceted silhouettes.
export function waterEffectTexture(kind){
 const canvas=document.createElement('canvas');canvas.width=canvas.height=64;const c=canvas.getContext('2d');
 for(let y=0;y<64;y++)for(let x=0;x<64;x++){
  const px=(x-31.5)/31.5,py=(y-31.5)/31.5,r=Math.hypot(px,py),angle=Math.atan2(py,px);
  let alpha;
  if(kind==='drop'){
   // A slightly blunt leading head and a tapering tail follow the billboard's
   // velocity axis. Four quiet coverage bands describe a small pixel cluster,
   // avoiding the soft circular 'bokeh' disc of the previous mask.
   const width=.60-py*.17,offset=px+Math.sin(py*3.)*.035;
   const body=1-offset*offset/(width*width)-(py+.08)*(py+.08)/.78;
   alpha=body>.76?.94:body>.44?.72:body>.18?.38:body>.035?.12:0;
  }else if(kind==='spray'){
   const lobe=.76+.12*Math.sin(angle*3+.7)+.07*Math.cos(angle*5);
   alpha=Math.max(0,1-r/lobe)**2*(.65+.35*Math.sin(px*8+py*4)**2);
  }else{
   const crest=.76+Math.sin(angle*5)*.018+Math.cos(angle*9)*.012;
   const broken=.25+.75*Math.max(0,Math.sin(angle*3+1)*Math.cos(angle*7-.6));
   alpha=Math.max(0,1-Math.abs(r-crest)/.045)*broken*.8;
  }
  if(alpha>.015){c.fillStyle=`rgba(225,221,207,${alpha})`;c.fillRect(x,y,1,1);}
 }
 const texture=new THREE.CanvasTexture(canvas);texture.colorSpace=THREE.SRGBColorSpace;texture.magFilter=THREE.NearestFilter;texture.minFilter=THREE.LinearMipmapLinearFilter;return texture;
}

export function fadingWaterInstances(scene,capacity,texture,{color=0x99988d,opacity=.5,shininess=48,diffuseOnly=false,scatter=0}={}){
 const geometry=new THREE.PlaneGeometry(1,1),alphas=new THREE.InstancedBufferAttribute(new Float32Array(capacity),1);alphas.setUsage(THREE.DynamicDrawUsage);geometry.setAttribute('waterAlpha',alphas);
 const options={map:texture,color,transparent:true,opacity,depthWrite:false,side:THREE.DoubleSide};
 const material=diffuseOnly?new THREE.MeshLambertMaterial(options):new THREE.MeshPhongMaterial({...options,specular:0xaaa99e,shininess});
 material.onBeforeCompile=s=>{
  s.vertexShader='attribute float waterAlpha;varying float particleAlpha;\n'+s.vertexShader;
  s.vertexShader=s.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\nparticleAlpha=waterAlpha;');
  s.fragmentShader='varying float particleAlpha;\n'+s.fragmentShader;
  s.fragmentShader=s.fragmentShader.replace('#include <color_fragment>','#include <color_fragment>\ndiffuseColor.a*=particleAlpha;');
  if(scatter>0){
   // Water droplets transmit a little light from behind. A flat billboard's
   // front-face diffuse term alone incorrectly makes a backlit jet disappear.
   const chunk=diffuseOnly?'lights_lambert_pars_fragment':'lights_phong_pars_fragment';
   const source=THREE.ShaderChunk[chunk].replace('reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );',
    `reflectedLight.directDiffuse += (irradiance + ${scatter.toFixed(3)} * saturate(dot(-geometryNormal,directLight.direction)) * directLight.color) * BRDF_Lambert( material.diffuseColor );`);
   s.fragmentShader=s.fragmentShader.replace('#include <'+chunk+'>',source);
  }
  // Silty spray scatters the full practical-light intensity with subdued tint.
  // Keep a little lamp color, avoiding saturated turquoise spark-like streaks.
  s.fragmentShader=s.fragmentShader.replace('#include <opaque_fragment>',
   'outgoingLight=mix(vec3(dot(outgoingLight,vec3(.2126,.7152,.0722))),outgoingLight,.28);\n#include <opaque_fragment>');
 };
 material.customProgramCacheKey=()=> 'drain-fading-particle-v3-'+scatter;
 const mesh=new THREE.InstancedMesh(geometry,material,capacity);mesh.count=0;mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);mesh.frustumCulled=false;
 // Their instances sit on/above the water, but the root is at the origin.
 // Explicit layering prevents a large transparent flood plane from sorting
 // over contact ripples. Opaque walls and actors still depth-test normally.
 mesh.renderOrder=2;material.forceSinglePass=true;scene.add(mesh);
 // Callers fill instances contiguously from zero, so only the live prefix is
 // uploaded; the remainder of the pool is never drawn while count excludes it.
 return {mesh,alphas,finish(count){mesh.count=count;mesh.visible=count>0;if(count){const matrices=mesh.instanceMatrix;matrices.clearUpdateRanges();matrices.addUpdateRange(0,count*16);matrices.needsUpdate=true;alphas.clearUpdateRanges();alphas.addUpdateRange(0,count);alphas.needsUpdate=true;}},dispose(){geometry.dispose();material.dispose();mesh.removeFromParent();}};
}
