import * as THREE from './vendor/three/three.module.js';
import {createActorWetness} from './under-green-actor-wetness.js';

const finishes={
 Sweater:{shine:7,specular:0x404838,dry:.12,wet:.48,darken:.62},
 Collar:{shine:8,specular:0x444b3c,dry:.13,wet:.5,darken:.70},
 Trousers:{shine:9,specular:0x434c3c,dry:.16,wet:.6,darken:.64},
 Skin:{shine:22,specular:0x596454,dry:.20,wet:.65,darken:.88},
 Face:{shine:22,specular:0x596454,dry:.20,wet:.65,darken:.88},
 Leather:{shine:32,specular:0x4c584a,dry:.25,wet:.8,darken:.72},
 Rubber:{shine:8,specular:0x354236,dry:.1,wet:.5,darken:.85},
 Hair:{shine:12,specular:0x434b3d,dry:.2,wet:.6,darken:.78},
 Seam:{shine:6,specular:0x303a2c,dry:.1,wet:.45,darken:.68},
};
export function createJoeSurfaceFinish(){
 const owned=[],wetness=createActorWetness(),film={value:new THREE.Vector4(-1,-1,0,0)},residue={value:new THREE.Vector4(0,0,.13,.13)},armsWet={value:0};let bound=false,attributeBytes=0;
 return {
  material(source){const finish=finishes[source.name]||finishes.Sweater;const m=new THREE.MeshPhongMaterial({name:source.name,map:source.map,color:source.color,side:THREE.DoubleSide,shininess:finish.shine,specular:finish.specular});owned.push(m);return m;},
  decorate(material){
   const base=material.onBeforeCompile,key=material.customProgramCacheKey(),finish=finishes[material.name]||finishes.Sweater;
   const response={value:new THREE.Vector4(finish.dry,finish.wet,finish.darken,Math.max(14,finish.shine*1.5))},collarTint={value:material.name==='Collar'?1:0};
   material.onBeforeCompile=s=>{
    base(s);s.uniforms.joeFilm=film;s.uniforms.joeResidue=residue;s.uniforms.joeArmsWet=armsWet;s.uniforms.joeFinish=response;s.uniforms.joeCollarTint=collarTint;
    s.vertexShader='attribute vec4 joeWear; varying vec4 joeWearPoint; varying vec3 joeRest;\n'+s.vertexShader;
    s.vertexShader=s.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\njoeWearPoint=joeWear; joeRest=position;');
    s.fragmentShader='varying vec4 joeWearPoint; varying vec3 joeRest; uniform vec4 joeFilm; uniform vec4 joeResidue; uniform float joeArmsWet; uniform vec4 joeFinish; uniform float joeCollarTint;\n'+s.fragmentShader;
    // Match Level 1's established collar tint and 48-step light palette.
    // Preserve underground practical lighting without adding a luminous rim.
    s.fragmentShader=s.fragmentShader.replace('#include <map_fragment>','#include <map_fragment>\nfloat joeClothLuma=dot(diffuseColor.rgb,vec3(.299,.587,.114)); diffuseColor.rgb=mix(diffuseColor.rgb,vec3(.24,.34,.43)*(.62+joeClothLuma*.85),joeCollarTint);');
    s.fragmentShader=s.fragmentShader.replace('#include <opaque_fragment>','vec3 joePixelShade=floor(sqrt(max(outgoingLight,vec3(0.)))*48.+.5)/48.; outgoingLight=joePixelShade*joePixelShade;\n#include <opaque_fragment>');
    s.fragmentShader=s.fragmentShader.replace('#include <color_fragment>',`#include <color_fragment>
     vec3 wearPixel=floor(joeRest*192.)/192.;
     float wearPatch=clamp(.5+.26*sin(wearPixel.x*31.+wearPixel.z*15.)+.20*cos(wearPixel.y*43.),0.,1.);
     float wearHeight=joeWearPoint.x+(wearPatch-.5)*.065;
     vec2 legWeight=joeWearPoint.yz;
     vec2 immersed=1.-smoothstep(joeFilm.xy-vec2(.015),joeFilm.xy+vec2(.02),vec2(wearHeight));
     vec2 damp=(1.-smoothstep(joeFilm.zw-vec2(.035),joeFilm.zw+vec2(.035),vec2(wearHeight)))*joeResidue.xy;
     float joeSurfaceWet=clamp(dot(max(immersed,damp),legWeight)+joeWearPoint.w*joeArmsWet,0.,1.);
     vec2 dirt=1.-smoothstep(joeResidue.zw-vec2(.06),joeResidue.zw+vec2(.015),vec2(wearHeight));
     float soil=clamp(dot(dirt,legWeight)*(.25+.42*wearPatch)+joeWearPoint.w*.24*wearPatch,0.,.72);
     vec3 soilColor=mix(vec3(.042,.035,.021),vec3(.10,.075,.040),wearPatch);
     diffuseColor.rgb=mix(diffuseColor.rgb,soilColor,soil);
     diffuseColor.rgb*=mix(1.,joeFinish.z,joeSurfaceWet);
    `);
    s.fragmentShader=s.fragmentShader.replace('#include <specularmap_fragment>',`#include <specularmap_fragment>\nspecularStrength*=mix(joeFinish.x,joeFinish.y,joeSurfaceWet)*(1.-soil*.65);`);
    s.fragmentShader=s.fragmentShader.replace('#include <lights_phong_fragment>',`#include <lights_phong_fragment>\nmaterial.specularShininess=mix(shininess,joeFinish.w,joeSurfaceWet);`);
   };
   material.customProgramCacheKey=()=>key+'-contact-wear-v1';
  },
  bind(actor,root,arms){
   if(bound)return;bound=true;root.updateMatrixWorld(true);const point=new THREE.Vector3(),hands=arms.map(a=>root.worldToLocal(a.hand.getWorldPosition(new THREE.Vector3())));
   actor.traverse(mesh=>{
    if(!mesh.isMesh)return;const g=mesh.geometry,skin=g.attributes.skinIndex,weights=g.attributes.skinWeight,wear=new Float32Array(g.attributes.position.count*4),name=mesh.material.name;
    for(let i=0;i<g.attributes.position.count;i++){
     mesh.getVertexPosition(i,point).applyMatrix4(mesh.matrixWorld);root.worldToLocal(point);let left=0,right=0,grip=0;
     if(skin&&weights)for(let c=0;c<4;c++){
      const bone=mesh.skeleton.bones[skin.getComponent(i,c)]?.name||'',weight=weights.getComponent(i,c);
      if(/^(Thigh|Shin|Foot)L$/.test(bone))left+=weight;
      if(/^(Thigh|Shin|Foot)R$/.test(bone))right+=weight;
      if((name==='Skin'||name==='Collar')&&/^Hand[LR]$/.test(bone))grip+=weight;
      if((name==='Sweater'||name==='Skin'||name==='Collar')&&/^Forearm[LR]$/.test(bone))grip+=weight*Math.max(0,1-point.distanceTo(hands[bone.endsWith('L')?0:1])/.19);
     }
     wear.set([Math.max(0,point.y),left,right,Math.min(1,grip)],i*4);
    }
    g.setAttribute('joeWear',new THREE.BufferAttribute(wear,4));attributeBytes+=wear.byteLength;
   });
  },
  update(r,contacts){wetness.update(r,contacts);const state=wetness.stats(),[l,rgt]=state.feet;if(l&&rgt){film.value.set(l.current,rgt.current,l.top,rgt.top);residue.value.set(l.fade,rgt.fade,l.mudTop,rgt.mudTop);}armsWet.value=state.arms;},
  stats:()=>({kind:'contact-worn-pixel-clothing',materials:owned.map(m=>({name:m.name,shininess:m.shininess})),attributeBytes,...wetness.stats()}),
  dispose(){owned.forEach(m=>m.dispose());},
 };
}
