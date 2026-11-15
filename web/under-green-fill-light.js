import * as THREE from './vendor/three/three.module.js';

const luminance=color=>color.r*.2126+color.g*.7152+color.b*.0722;
// Practical lamps retain their warm/cold identity. Broad fill is less cyan so
// brown soil, blue wool and green water keep their own pigment in the dark.
// Match each old light's linear luminance: this is a spectral rebalance, not
// a brighter camera light, extra source, exposure lift or screen-space filter.
const chroma={sky:0x858987,ground:0x29251e,distant:0x82929c,near:0xb6b1a5};
const legacy={sky:0x708f91,ground:0x202116,distant:0x688c9e,near:0x759797};
export function createDrainFillLights(scene){
 const balanced=name=>{
  const color=new THREE.Color(chroma[name]),reference=new THREE.Color(legacy[name]);
  return color.multiplyScalar(luminance(reference)/luminance(color));
 };
 const sky=balanced('sky'),ground=balanced('ground'),distant=balanced('distant'),near=balanced('near');
 const hemisphere=new THREE.HemisphereLight(sky,ground,.34);
 const moon=new THREE.DirectionalLight(distant,.26);moon.position.set(-8,15,5);
 const playerLight=new THREE.PointLight(near,.65,6.5,1.3);
 scene.add(hemisphere,moon,playerLight);
 return {playerLight,stats:()=>({kind:'luminance-matched-neutral-fill',sources:3,
  palette:Object.fromEntries(Object.entries({sky,ground,distant,near}).map(([name,color])=>[name,{linear:color.toArray(),luminance:luminance(color),referenceLuminance:luminance(new THREE.Color(legacy[name]))}]))})};
}
