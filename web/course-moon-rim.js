import * as THREE from './vendor/three/three.module.js';
import {COURSE_MOON_OFFSET} from './course-moon-direction.js';

// A moonlit edge for the night course. The moon hangs ahead of the walker, so
// plain diffuse light leaves every surface that faces the eye in shadow and
// hedge, turf and tree merge into one dark mass. This adds the sheen such a
// low back light really gives: surfaces seen at a glancing angle that also
// lean toward the moon pick up a cool edge. It follows the moon's own colour
// and strength (cloud cover, nightfall), adds no light and no texture, and is
// compiled into each material once, before the first frame.
// Course materials are shared and survive a world rebuild, and each build makes
// a new rim. The shader wrapper is installed once per material; a later rim
// only rebinds its uniforms, so the declarations are never injected twice.
const SLOTS=new WeakMap();
export function createCourseMoonRim(moon,{strength=4.4}={}){
 const direction={value:new THREE.Vector3().fromArray(COURSE_MOON_OFFSET).normalize()},color={value:new THREE.Color()},materials=new Set();
 function apply(material){
  if(!material||materials.has(material)||!material.isMeshLambertMaterial)return;
  let slot=SLOTS.get(material);
  if(slot){slot.direction=direction;slot.color=color;material.needsUpdate=true;materials.add(material);return;}
  slot={direction,color};SLOTS.set(material,slot);
  const compile=material.onBeforeCompile,key=material.customProgramCacheKey();
  material.onBeforeCompile=function(shader,renderer){
   compile.call(this,shader,renderer);shader.uniforms.courseMoonRimDirection=slot.direction;shader.uniforms.courseMoonRimColor=slot.color;
   if(!shader.fragmentShader.includes('#include <lights_fragment_end>'))return;
   shader.fragmentShader='uniform vec3 courseMoonRimDirection;\nuniform vec3 courseMoonRimColor;\n'+shader.fragmentShader;
   shader.fragmentShader=shader.fragmentShader.replace('#include <lights_fragment_end>',`{
    vec3 moonRimToward=normalize(mat3(viewMatrix)*courseMoonRimDirection);
    float moonRimEdge=1.0-saturate(dot(geometryNormal,geometryViewDir));
    float moonRimLit=saturate(dot(geometryNormal,moonRimToward)*.75+.4);
    float moonRimBehind=saturate(dot(-geometryViewDir,moonRimToward)*.6+.55);
    reflectedLight.directDiffuse+=courseMoonRimColor*(moonRimEdge*moonRimEdge*moonRimEdge)*moonRimLit*moonRimBehind*(diffuseColor.rgb*.75+.012);
   }
   #include <lights_fragment_end>`);
  };
  material.customProgramCacheKey=()=>key+'-course-moon-rim-v1';material.needsUpdate=true;materials.add(material);
 }
 function update(){color.value.copy(moon.color).multiplyScalar(moon.intensity*strength);}
 update();
 return {apply,update,stats:()=>({materials:materials.size,color:color.value.getHex()})};
}
