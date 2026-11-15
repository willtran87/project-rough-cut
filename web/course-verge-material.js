import * as THREE from './vendor/three/three.module.js';

// Crossed cards describe a rounded clump, not two flat vertical sheets. Their
// upward normals catch overhead practical light on both sides; no emissive fill.
export function shapeVergeNormals(geometry,width=1){
  const p=geometry.attributes.position,n=geometry.attributes.normal;
  const normal=new THREE.Vector3();
  for(let i=0;i<n.count;i++){normal.set(p.getX(i)/width*.5,.85,.4).normalize();n.setXYZ(i,normal.x,normal.y,normal.z);}return geometry;
}
export function shadeVergeNormals(shader){
    shader.fragmentShader=shader.fragmentShader.replace('#include <normal_fragment_begin>',`#include <normal_fragment_begin>
      vec3 clumpUp=normalize(mat3(viewMatrix)*vec3(0.0,1.0,0.0));
      float clumpVertical=dot(normal,clumpUp);
      normal=normalize(normal+clumpUp*(abs(clumpVertical)-clumpVertical));
    `);
}
export function createCourseVergeSurface(map){
  const geometry=shapeVergeNormals(new THREE.PlaneGeometry(1,1,1,2));
  const material=new THREE.MeshLambertMaterial({map,color:0x9eaba0,alphaTest:.2,side:THREE.DoubleSide});
  material.onBeforeCompile=shadeVergeNormals;
  material.customProgramCacheKey=()=> 'course-verge-lit-v1';
  return {geometry,material};
}
