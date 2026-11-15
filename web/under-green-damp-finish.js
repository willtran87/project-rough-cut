// Calibrate the existing independent wetness masks for thin water films.
// Pigment is untouched: highlights come only from actual scene lights and
// surface normals. Dry areas retain a weak, broad response between wet seams.
const profiles={
 masonry:{threshold:[.045,.26],strength:[.018,.40],shine:48},
 bark:{threshold:[.045,.26],strength:[.018,.66],shine:42},
 sediment:{threshold:[.055,.34],strength:[.012,.48],shine:38},
 enamel:{threshold:[.11,.32],strength:[.06,.70],shine:58},
 iron:{threshold:[.11,.32],strength:[.055,.53],shine:48},
 steel:{threshold:[.11,.32],strength:[.17,.76],shine:72},
 rust:{threshold:[.11,.32],strength:[.018,.24],shine:30},
};
export const DRAIN_DAMP_PROFILES=Object.freeze(profiles);

export function finishDrainDampResponse(materials){
 const hooks=[],entries=[];
 const groups={masonry:['stone','rootStone','bunkerStone','pumpStone','rangeStone','keeperStone','ceiling','galleryCeilingDamp','galleryWallDamp','galleryRender'],bark:['root'],sediment:['mudBank','bankEarth'],enamel:['machinePaint','machineRed'],iron:['machineIron'],steel:['machineSteel'],rust:['machineRust']};
 for(const [kind,names]of Object.entries(groups))for(const name of names){
  const material=materials[name];if(!material?.isMeshPhongMaterial||!material.specularMap)continue;
  const profile=profiles[kind],compile=material.onBeforeCompile,key=material.customProgramCacheKey();
  hooks.push([material,compile,material.customProgramCacheKey]);
  material.onBeforeCompile=function(shader,renderer){
   compile.call(this,shader,renderer);
   shader.uniforms.drainDampThreshold={value:profile.threshold};
   shader.uniforms.drainDampStrength={value:profile.strength};
   shader.uniforms.drainDampShine={value:profile.shine};
   // Crafted walls already have a world-anchored seep field in their pigment
   // treatment. Concentrate the thin films there, leaving quiet dry intervals
   // instead of repeating the same reflection pattern over every wall face.
   const placement=shader.fragmentShader.includes('float seep=')?'drainFilm*=mix(.05,1.,smoothstep(.18,.72,seep));':'';
   shader.fragmentShader='uniform vec2 drainDampThreshold;uniform vec2 drainDampStrength;uniform float drainDampShine;\n'+shader.fragmentShader;
   shader.fragmentShader=shader.fragmentShader.replace('#include <lights_phong_fragment>',`#include <lights_phong_fragment>
    float drainFilm=smoothstep(drainDampThreshold.x,drainDampThreshold.y,material.specularStrength);
    ${placement}
    ${name==='root'?`
    // Roof seepage follows the first canopy's shoulders into its living
    // pillar. Keep these wet areas fixed to that construction, independent
    // of the repeating pigment stain. Fine breaks use the separate wet map.
    vec3 galleryPoint=vec3(drainWorld.x,drainWorld.y,-drainWorld.z);
    float shoulderLine=13.2-.45*galleryPoint.x;
    float shoulderWet=(1.-smoothstep(.30,.90,abs(galleryPoint.z-shoulderLine)))
      *smoothstep(2.9,3.55,galleryPoint.y)*(1.-smoothstep(4.1,4.3,galleryPoint.y))
      *(1.-smoothstep(4.6,5.05,abs(galleryPoint.x)));
    vec2 pillarOffset=(galleryPoint.xz-vec2(-1.8,15.))/vec2(.65,.72);
    float pillarWet=(1.-smoothstep(.45,1.,dot(pillarOffset,pillarOffset)))
      *(1.-smoothstep(3.45,3.95,galleryPoint.y));
    float galleryWet=max(shoulderWet,pillarWet*.74);
    drainFilm=max(drainFilm,galleryWet*smoothstep(.035,.20,material.specularStrength));
    material.specularColor=mix(material.specularColor,vec3(.40,.43,.36),galleryWet*drainFilm);
    material.diffuseColor*=1.-galleryWet*drainFilm*.08;
    `:''}
    material.specularStrength=mix(drainDampStrength.x,drainDampStrength.y,drainFilm);
    material.specularShininess=mix(material.specularShininess,max(material.specularShininess,drainDampShine),drainFilm);
   `);
  };
  material.customProgramCacheKey=()=>key+'-drain-damp-film-'+(name==='root'?'v2-gallery-seep':'v1');material.needsUpdate=true;
  entries.push({name,kind,...profile});
 }
 return {stats:()=>({materials:entries,existingMasks:true,newTextures:0,newLights:0,newGeometry:0,emissive:false}),dispose(){for(const [m,compile,key]of hooks){m.onBeforeCompile=compile;m.customProgramCacheKey=key;}}};
}
