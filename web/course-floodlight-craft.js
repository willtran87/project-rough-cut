import * as THREE from './vendor/three/three.module.js';

// Fixed functional parts share the course's material/chunk batches. Only the
// emitting lens stays independent, so each real fixture follows its own circuit.
export function buildCourseFloodlight(root,{mesh,box}){
  const part=(parent,type,x,y,z,w,h,d,color)=>mesh(parent,new THREE.BoxGeometry(w,h,d),type,color,x,y,z);
  const round=(parent,type,x,y,z,r,h,color,sides=10)=>mesh(parent,new THREE.CylinderGeometry(r,r,h,sides),type,color,x,y,z);
  const metal=0x919f98,dark=0x52645f;
  box(root,'stone',0,.15,0,.48,.30,.48,0xa2aca2);
  part(root,'iron',0,.318,0,.34,.036,.34,dark);
  for(const x of [-.135,.135])for(const z of [-.135,.135]){
    round(root,'iron',x,.344,z,.026,.012,metal);
    round(root,'iron',x,.360,z,.018,.022,0xb1b5a0,6);
  }
  round(root,'iron',0,1.68,0,.055,2.70,0xa1ac98,12);
  // Welded collar, service cable and a closed weatherproof junction box.
  for(const y of [.39,2.68])round(root,'iron',0,y,0,.071,.05,dark,12);
  part(root,'paint',.12,1.03,.015,.14,.25,.13,0x8c9c8d);
  part(root,'iron',.12,1.03,.087,.15,.26,.018,dark);
  for(const y of [.95,1.11]){
    const screw=round(root,'iron',.12,y,.103,.009,.012,0xaeb5a1,6);screw.rotation.x=Math.PI/2;
  }
  const cablePoints=[[.10,.90,.035],[.075,.75,.04],[.061,.48,.04],[.053,.38,.04]].map(p=>new THREE.Vector3(...p));
  mesh(root,new THREE.TubeGeometry(new THREE.CatmullRomCurve3(cablePoints),7,.012,5,false),'rubber',0x52605b);
  round(root,'iron',0,1.90,-.078,.014,1.58,dark,8);
  for(const y of [1.26,2.16,2.61])part(root,'iron',0,y,-.057,.13,.025,.065,metal);
  // A short rear loop feeds the lamp through the yoke; no dangling loose wire.
  const feed=[[0,2.69,-.078],[0,2.85,-.17],[0,3.07,-.19]].map(p=>new THREE.Vector3(...p));
  mesh(root,new THREE.TubeGeometry(new THREE.CatmullRomCurve3(feed),8,.013,5,false),'rubber',0x52605b);
  part(root,'iron',0,2.965,0,.70,.045,.10,dark);
  for(const x of [-.342,.342]){
    part(root,'iron',x,3.055,0,.035,.22,.10,metal);
    const pivot=round(root,'iron',x,3.13,0,.037,.06,0xaab3a0,8);pivot.rotation.z=Math.PI/2;
  }
  const head=new THREE.Group();head.name='CourseFloodlightHead';head.position.set(0,3.13,0);head.rotation.x=.18;root.add(head);
  part(head,'iron',0,0,-.045,.64,.36,.18,dark);
  for(let i=0;i<9;i++)part(head,'iron',-.272+i*.068,0,-.16,.018,.28,.09,metal);
  // Narrow bezel and a shallow rain hood define the glass aperture in profile.
  for(const side of [-1,1]){
    part(head,'iron',side*.297,0,.074,.035,.34,.065,metal);
    part(head,'iron',0,side*.157,.074,.63,.035,.065,metal);
  }
  part(head,'iron',0,.19,.065,.68,.025,.27,metal);
  for(const x of [-.295,.295])for(const y of [-.151,.151]){
    const screw=round(head,'iron',x,y,.113,.012,.01,0xb6b9a6,6);screw.rotation.x=Math.PI/2;
  }
  const lens=part(head,'glass',0,0,.077,.54,.28,.025,0xe7d09b);
  lens.name='CourseFloodlightLens';
  return lens;
}

export function detailFloodlightLens(material){
  const compile=material.onBeforeCompile,key=material.customProgramCacheKey();
  material.onBeforeCompile=shader=>{
    compile(shader);
    // Reflector divisions sit in lens-local coordinates; camera movement and
    // power changes cannot slide or regenerate the pixel pattern.
    shader.fragmentShader=shader.fragmentShader.replace('#include <emissivemap_fragment>',`#include <emissivemap_fragment>
      vec2 lensUv=vSurfacePosition.xy/vec2(.54,.28)+.5;
      vec2 cell=fract(lensUv*vec2(6.,3.));
      float edge=min(min(cell.x,1.-cell.x),min(cell.y,1.-cell.y));
      float reflector=mix(.40,1.,step(.075,edge));
      float flute=mix(.88,1.,step(.5,fract(floor(lensUv.x*108.)*.5)));
      totalEmissiveRadiance*=reflector*flute;
    `);
  };
  material.customProgramCacheKey=()=>key+'-flood-reflector-v1';
}
