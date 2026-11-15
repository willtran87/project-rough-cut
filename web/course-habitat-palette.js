import * as THREE from './vendor/three/three.module.js';
import {COURSE_LOOKS} from './course-atmosphere.js';

// Reflectance, baked once into the existing colour buffers. These palettes do
// not alter lighting, exposure, fog, textures or the camera's colour balance.
const tones={
  tee:[.94,1,.91],audit_row:[.85,.98,.78],water_hazard:[.65,.94,1],
  clubhouse_crossing:[1,.91,.72],maintenance_maze:[.83,.91,.72],
  dead_green:[1,.73,.49],night_range:[.72,.89,1],release_corridor:[.94,.82,.72]
};
const palettes=COURSE_LOOKS.map(({id,start})=>{
  const c=tones[id],luma=c[0]*.2126+c[1]*.7152+c[2]*.0722;
  return {id,start,color:c.map(v=>v/luma)};
});
const strengths={soil:.58,leaf:.82,conifer:.40,verge:1};
export function courseHabitatTint(x,z,family,target=new THREE.Color()){
  const progress=-z/.16+Math.sin(x*.19)*6,strength=strengths[family]??0;
  let a=palettes.at(-1),b=a,mix=0;
  for(let i=1;i<palettes.length;i++){
    const edge=palettes[i].start;
    if(progress<edge-20){a=b=palettes[i-1];break;}
    if(progress<edge+20){a=palettes[i-1];b=palettes[i];const t=(progress-edge+20)/40;mix=t*t*(3-2*t);break;}
  }
  return target.setRGB(...a.color.map((v,i)=>1+((v+(b.color[i]-v)*mix)-1)*strength));
}

// Shared cell-edge positions receive identical values. Large terrain pieces
// interpolate spatially; a plant/tree keeps one rooted hue across its branches.
export function tintCourseHabitatGeometry(geometry,matrix,family,anchor=null){
  const p=geometry.attributes.position,old=geometry.attributes.color;
  const colors=new Float32Array(p.count*3),point=new THREE.Vector3(),tint=new THREE.Color();
  if(anchor)courseHabitatTint(anchor.x,anchor.z,family,tint);
  for(let i=0;i<p.count;i++){
    if(!anchor){point.fromBufferAttribute(p,i);if(matrix)point.applyMatrix4(matrix);courseHabitatTint(point.x,point.z,family,tint);}
    colors[i*3]=(old?old.getX(i):1)*tint.r;colors[i*3+1]=(old?old.getY(i):1)*tint.g;colors[i*3+2]=(old?old.getZ(i):1)*tint.b;
  }
  geometry.setAttribute('color',new THREE.BufferAttribute(colors,3));
}

export function tintCourseHabitatGround(mesh){
  // Fixed-source lighting normally supplies this grid already. Keep the same
  // spatial palette on devices which cannot use that lighting specialization.
  if(mesh.geometry.type==='PlaneGeometry'){
    const {width,height}=mesh.geometry.parameters,previous=mesh.geometry;
    mesh.geometry=new THREE.PlaneGeometry(width,height,24,65);previous.dispose();
  }
  mesh.updateWorldMatrix(true,false);
  tintCourseHabitatGeometry(mesh.geometry,mesh.matrixWorld,'soil');
  mesh.material.vertexColors=true;mesh.material.needsUpdate=true;
}
