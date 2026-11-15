import * as THREE from './vendor/three/three.module.js';
import {applyHorizontalWaterNormal} from './under-green-water-normal.js';
import {partitionDrainSurfaces} from './under-green-light-partitions.js';
import {floodState} from './under-green-flood.js';
import {createFloodWetness} from './under-green-flood-wetness.js';
import {floodShoreField} from './under-green-flood-shore.js';
export function createDrainFlood(scene,layout){
 const parts=layout.tiles.map(t=>{const g=new THREE.PlaneGeometry(t.w,t.d);g.rotateX(-Math.PI/2);g.translate(t.x,0,-t.y);return g;});
 const shore=floodShoreField(layout),shoreMap=new THREE.DataTexture(shore.data,shore.width,shore.height,THREE.RedFormat);
 shoreMap.minFilter=shoreMap.magFilter=THREE.LinearFilter;shoreMap.generateMipmaps=false;shoreMap.needsUpdate=true;
 const time={value:0},material=new THREE.MeshPhongMaterial({color:0xffffff,specular:0x697367,shininess:64,transparent:true,opacity:.82,depthWrite:false});
 material.onBeforeCompile=s=>{
  s.uniforms.floodTime=time;s.uniforms.floodShoreMap={value:shoreMap};
  s.uniforms.floodShoreDomain={value:new THREE.Vector4(shore.minX,shore.minY,shore.spanX,shore.spanY)};
  s.vertexShader='varying vec2 floodPoint;varying vec3 floodWorld;\n'+s.vertexShader;
  s.vertexShader=s.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\nfloodPoint=position.xz;');
  s.vertexShader=s.vertexShader.replace('#include <project_vertex>','#include <project_vertex>\nfloodWorld=(modelMatrix*vec4(transformed,1.)).xyz;');
  s.fragmentShader='varying vec2 floodPoint;varying vec3 floodWorld;uniform float floodTime;uniform sampler2D floodShoreMap;uniform vec4 floodShoreDomain;\n'+s.fragmentShader;
  s.fragmentShader=s.fragmentShader.replace('#include <color_fragment>',`#include <color_fragment>
   vec2 p=floor(floodPoint*160.)/160.;
   float shoreDistance=texture2D(floodShoreMap,(vec2(floodWorld.x,-floodWorld.z)-floodShoreDomain.xy)/floodShoreDomain.zw).r;
   float bank=1.-smoothstep(.035,.38,shoreDistance);
   float contact=1.-smoothstep(.025,.085,shoreDistance);
   float silt=.5+.5*sin(p.x*2.1+sin(p.y*1.9-floodTime*.22));
   float ripple=smoothstep(.94,.995,sin((p.y+sin(p.x*1.7)*.19)*27.+sin(p.x*4.)*2.-floodTime*1.4))*smoothstep(.45,.87,sin(p.x*17.+p.y*4.1)*sin(p.y*7.3-p.x*3.7));
   float swellA=cos(floodPoint.x*3.1+floodPoint.y*1.2-floodTime*.42);
   float swellB=cos(floodPoint.y*2.7-floodPoint.x*.9-floodTime*.36);
   float fineWave=cos(p.y*13.7+p.x*4.3-floodTime*.81);
   float grazing=pow(1.-max(0.,normalize(cameraPosition-floodWorld).y),5.);
   vec3 murk=mix(vec3(.009,.014,.011),vec3(.018,.020,.012),silt);
   murk=mix(murk,vec3(.020,.017,.010),bank*(.3+silt*.35));
   diffuseColor.rgb=murk*(1.-contact*.42);
   // A small grazing-angle opacity lift keeps distant water silty. Reflected
   // light remains in the physical lighting pass, never in emissive pigment.
   diffuseColor.a=mix(diffuseColor.a,1.,grazing*.7);`);
  applyHorizontalWaterNormal(s,'(-.0403*swellA+.0054*swellB-.0129*fineWave)*(1.-contact*.75)','(-.0156*swellA-.0162*swellB-.0411*fineWave)*(1.-contact*.75)');
  s.fragmentShader=s.fragmentShader.replace('#include <specularmap_fragment>',`#include <specularmap_fragment>
   specularStrength*=(.05+grazing*.08+ripple*.55)*(1.-bank*.6);`);
 };
 material.customProgramCacheKey=()=> 'drain-flood-silt-shore-v3';
 const floodParts=partitionDrainSurfaces(scene,parts,material,'Drain flood',.40),mesh=floodParts.root;let state=floodState();
 const receiverState={value:new THREE.Vector3()},waterline={value:0},dampTop={value:0},wetFade={value:0};let wetness=null;
 return {bindReceivers(meshes){wetness?.dispose();wetness=createFloodWetness(meshes,receiverState);},inspectReceivers:()=>wetness?.inspect()||[],update(r,reduced){
  state=floodState(r.elapsed);mesh.visible=state.depth>.006;mesh.position.y=state.depth;time.value=reduced?0:r.elapsed;
  material.opacity=.55+.41*THREE.MathUtils.smoothstep(state.depth,.015,.28);
  waterline.value=state.depth;
  const cycleAge=r.elapsed<32?0:(r.elapsed-32)%66;
  const residual=state.phase==='falling'||state.phase==='dry'&&cycleAge>=33;
  dampTop.value=residual?.39:state.depth+.012;
  wetFade.value=state.phase==='dry'?(cycleAge>=33?Math.max(0,1-(cycleAge-33)/24):0):state.depth>.006?1:0;
  receiverState.value.set(waterline.value,dampTop.value,wetFade.value);
 },stats:()=>({...state,visible:mesh.visible,opacity:material.opacity,animationTime:time.value,shoreField:{size:[shore.width,shore.height],bytes:shore.data.byteLength,worldAnchored:true},surfaceWetness:wetness?.stats(),wallFilm:{kind:'surface-material',segments:layout.walls.length,visible:wetFade.value>0,waterline:waterline.value,dampHeight:dampTop.value,fade:wetFade.value}}),dispose(){wetness?.dispose();floodParts.dispose();shoreMap.dispose();material.dispose();}};
}
