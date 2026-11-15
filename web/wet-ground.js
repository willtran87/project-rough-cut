import * as THREE from './vendor/three/three.module.js';

// Bake the eight gameplay zones once. One small lookup in the existing ground
// draw replaces per-fragment zone searches, extra puddle meshes and scene copies.
export function createWetGround(material,data,scale,xScale){
 const width=256,height=512,pixels=new Uint8Array(width*height*4);
 const clamp=THREE.MathUtils.clamp;
 for(const zone of data.soakZones||[]){
  const cx=zone.x*xScale,cz=-zone.y*scale,rx=zone.radius*scale,rz=zone.radius*scale;
  const x0=clamp(Math.floor((cx-rx+24)/48*width),0,width-1),x1=clamp(Math.ceil((cx+rx+24)/48*width),0,width-1);
  const z0=clamp(Math.floor((cz-rz+120)/130*height),0,height-1),z1=clamp(Math.ceil((cz+rz+120)/130*height),0,height-1);
  for(let j=z0;j<=z1;j++)for(let i=x0;i<=x1;i++){
   const x=(i+.5)/width*48-24,z=(j+.5)/height*130-120,d=Math.hypot((x-cx)/rx,(z-cz)/rz);
   if(d>=1)continue;
   const pools=.5+.25*Math.sin(x*3.1+Math.sin(z*1.7))+.25*Math.cos(z*4.3+x*.9);
   const grain=(Math.sin(i*127.1+j*311.7)*43758.5453)%1;
   const edge=clamp((1-d-.12*(1-pools))/.24,0,1),k=(j*width+i)*4;
   pixels[k]=Math.max(pixels[k],Math.round(255*edge*(.72+pools*.28)));
   pixels[k+1]=Math.round(pools*255);
   pixels[k+2]=Math.round(Math.abs(grain)*255);pixels[k+3]=255;
  }
 }
 const mask=new THREE.DataTexture(pixels,width,height,THREE.RGBAFormat);
 mask.minFilter=mask.magFilter=THREE.NearestFilter;mask.generateMipmaps=false;mask.needsUpdate=true;
 const wet={value:0},clock={value:0},detail={value:1};
 const uniforms={irrigationMask:{value:mask},irrigationWet:wet,irrigationClock:clock,irrigationDetail:detail};
 const compile=material.onBeforeCompile,cacheKey=material.customProgramCacheKey();
 material.onBeforeCompile=shader=>{
  compile(shader);
  Object.assign(shader.uniforms,uniforms);
  shader.fragmentShader='uniform sampler2D irrigationMask;\nuniform float irrigationWet;\nuniform float irrigationClock;\nuniform float irrigationDetail;\n'+shader.fragmentShader;
  // Reuse the source-art ground coordinates and retain all turf/path detail.
  shader.fragmentShader=shader.fragmentShader.replace('#include <color_fragment>',`#include <color_fragment>
   vec3 soak=texture2D(irrigationMask,(vGroundMeters+vec2(24.0,120.0))/vec2(48.0,130.0)).rgb;
   float wetness=soak.r*(.22+.78*irrigationWet);
  `);
  shader.fragmentShader=shader.fragmentShader.replace('#include <opaque_fragment>',`
   // Broken horizontal moon sheen, anchored to world pixels. No bloom or
   // reflection buffer; shadowed original ground still supplies its own light.
   vec2 wetPixel=floor(vGroundMeters*24.0);
   float streak=step(.90,fract(wetPixel.y*.173+soak.b*.37))*step(.58,soak.g)*step(.45,fract(wetPixel.x*.137+soak.b));
   float shimmer=.72+.28*abs(fract(irrigationClock*.18+soak.b)*2.0-1.0);
   float glancing=1.0-clamp(abs(cameraPosition.y)/max(length(cameraPosition.xz-vGroundMeters),1.0),0.0,1.0);
   outgoingLight*=mix(vec3(1.0),vec3(.32,.48,.51),wetness*(.65+soak.g*.35));
   vec3 sourceSheen=min(vec3(.12),outgoingLight*1.8+vec3(.004,.008,.012));
   outgoingLight+=wetness*irrigationDetail*streak*shimmer*(.15+.85*pow(glancing,3.0))*sourceSheen;
   #include <opaque_fragment>
  `);
 };
 material.customProgramCacheKey=()=>cacheKey+'-irrigation-wet-v2';
 return {
  applyToLightPool(pool){
   // The existing broad floodlight overlay would otherwise paint dry amber
   // over the soaked terrain. Share this mask; add no light, texture or pass.
   const m=pool.material,oldCompile=m.onBeforeCompile,oldKey=m.customProgramCacheKey();
   m.onBeforeCompile=shader=>{
    oldCompile.call(m,shader);Object.assign(shader.uniforms,uniforms);
    shader.vertexShader='varying vec2 vWetPoolMeters;\n'+shader.vertexShader;
    shader.vertexShader=shader.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\nvWetPoolMeters=(modelMatrix*vec4(transformed,1.0)).xz;');
    shader.fragmentShader='uniform sampler2D irrigationMask;\nuniform float irrigationWet;\nvarying vec2 vWetPoolMeters;\n'+shader.fragmentShader;
    shader.fragmentShader=shader.fragmentShader.replace('#include <color_fragment>',`#include <color_fragment>
     float soaked=texture2D(irrigationMask,(vWetPoolMeters+vec2(24.0,120.0))/vec2(48.0,130.0)).r*irrigationWet;
     diffuseColor.a*=1.0-soaked*.62;
     diffuseColor.rgb*=mix(vec3(1.0),vec3(.66,.85,.90),soaked);
    `);
   };
   m.customProgramCacheKey=()=>oldKey+'-wet-flood-pool-v1';
  },
  update(frame){wet.value=frame.soakSeconds>0?1:0;detail.value=(frame.fx?.density??1)>0?1:0;clock.value=frame.reducedMotion?0:Math.floor(frame.time*8)/8;},
  stats:()=>({active:wet.value>0,clock:clock.value,detail:detail.value,maskBytes:pixels.byteLength,extraDraws:0,zones:(data.soakZones||[]).length}),
  dispose(){mask.dispose();}
 };
}
