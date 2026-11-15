import * as THREE from './vendor/three/three.module.js';
import * as Art from './pixel-art.js';
import {createDistantEstateStructures} from './back-nine-estate-distance.js';

// The illustrated boundary belongs to the distant scene, never to collision
// or cover. Different radii, drift and silhouettes give the estate depth.
export const BACK_NINE_HORIZON=Object.freeze([
 Object.freeze({name:'far-estate-ridge',source:'rough-cut-far-ridge-v1',crop:[0,620,1672,321],radius:660,height:150,bottom:-23,influence:.045,repeat:2,phase:.14,turn:.3,shadow:0x18232b,light:0x35434a}),
 Object.freeze({name:'wooded-slope',source:'rough-cut-far-ridge-v1',crop:[0,620,1672,321],radius:365,height:79,bottom:-22,influence:.16,repeat:4,phase:.62,turn:-.8,shadow:0x0c151b,light:0x223137}),
 Object.freeze({name:'estate-woodland',source:'rough-cut-distant-treeline-v1',crop:[0,350,1672,385],radius:175,height:33,bottom:-10,influence:.38,repeat:4,phase:.27,turn:.18,shadow:0x050c0d,light:0x182620})
]);

export function createHorizonGeometry(spec){
 const geometry=new THREE.CylinderGeometry(spec.radius,spec.radius,spec.height,192,1,true);
 const p=geometry.attributes.position,uv=geometry.attributes.uv;
 for(let i=0;i<p.count;i++){
  const a=Math.atan2(p.getX(i),p.getZ(i)),t=uv.getY(i);
  // Continuous around the seam. Variation changes the ridge's broad profile,
  // while the original art supplies every branch and pixel-scale edge.
  const rise=1+.11*Math.sin(a*3+spec.turn)+.065*Math.cos(a*5-spec.turn*2);
  p.setY(i,spec.bottom+t*spec.height*rise);
  uv.setXY(i,uv.getX(i)*spec.repeat+spec.phase,t);
 }
 geometry.computeVertexNormals();geometry.computeBoundingBox();geometry.computeBoundingSphere();return geometry;
}

export function finishHorizonMaterial(material,spec){
 material.onBeforeCompile=shader=>{
  shader.uniforms.horizonShadow={value:new THREE.Color(spec.shadow)};
  shader.uniforms.horizonLight={value:new THREE.Color(spec.light)};
  shader.vertexShader='varying float vHorizonHeight;\n'+shader.vertexShader;
  shader.vertexShader=shader.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\nvHorizonHeight=position.y;');
  shader.fragmentShader='uniform vec3 horizonShadow;uniform vec3 horizonLight;varying float vHorizonHeight;\n'+shader.fragmentShader;
  shader.fragmentShader=shader.fragmentShader.replace('#include <map_fragment>',`#include <map_fragment>
   float ink=pow(clamp(dot(diffuseColor.rgb,vec3(.2126,.7152,.0722))*4.0,0.0,1.0),.6);
   ink=floor(ink*32.0+.5)/32.0;
   vec3 distantColor=mix(horizonShadow,horizonLight,ink);
   diffuseColor.rgb=mix(horizonShadow*.6,distantColor,smoothstep(-15.0,12.0,vHorizonHeight));`);
 };
 material.customProgramCacheKey=()=> 'back-nine-horizon-v1';
}

export function createBackNineHorizon(layer){
 const meshes=[];
 for(const spec of BACK_NINE_HORIZON){
  // A distinct cache key keeps Level 1's map transforms untouched. Layers
  // sharing this crop share one texture; repeats live in the geometry UVs.
  const map=Art.texture(spec.source,spec.crop,[spec.crop[2],spec.crop[3]]);
  // The illustrated strips are not seamless. Mirror their edges and use an
  // even repeat count so the full ring also closes without an alpha jump.
  map.wrapS=THREE.MirroredRepeatWrapping;
  const material=new THREE.MeshBasicMaterial({map,side:THREE.BackSide,alphaTest:.12,fog:false});
  finishHorizonMaterial(material,spec);
  const mesh=new THREE.Mesh(createHorizonGeometry(spec),material);mesh.name=spec.name;mesh.rotation.y=spec.turn;
  const entry=layer(spec.name,spec.influence);entry.root.add(mesh);entry.anchor.set(0,spec.bottom+spec.height,-spec.radius);meshes.push(mesh);
 }
 const structures=createDistantEstateStructures(),estate=layer('estate-outbuildings',.26);estate.root.add(structures.group);estate.anchor.set(75,35,-250);
 return {stats:()=>({layers:meshes.length,triangles:meshes.reduce((sum,m)=>sum+m.geometry.index.count/3,0),radii:BACK_NINE_HORIZON.map(s=>s.radius),palette:'cool-ridge-to-muted-woodland',architecture:structures.stats()})};
}
