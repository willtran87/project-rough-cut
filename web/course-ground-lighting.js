import * as THREE from './vendor/three/three.module.js';
import {prepareLanternGround} from './course-lantern-ground.js';
import {boundCourseSpotlights} from './course-bounded-spotlights.js';

// This specialization is for the fixed course floor and fixed, shadowless,
// inverse-square point sources. Unsupported lights retain the generic shader.
export function createCourseGroundLighting(mesh,anchors,pointLights,{range=3.25,power=2.8,maxVaryings=16}={}){
  if(!THREE.ShaderChunk.lights_fragment_begin.includes('#if ( NUM_POINT_LIGHTS > 0 ) && defined( RE_Direct )'))return null;
  if(!mesh?.material?.isMeshLambertMaterial||pointLights.some(l=>!l.isPointLight||l.castShadow||l.decay!==2||!Number.isFinite(l.distance)||l.distance<=0))return null;
  const cellSize=2,color=new THREE.Color(0xffcb82),sources=[...anchors.map(a=>({anchor:a,position:a.position,range,color})),...pointLights.map(light=>({light,position:light.getWorldPosition(new THREE.Vector3()),range:light.distance,color:light.color}))];
  if(!sources.length)return null;
  const cells=new Map();
  sources.forEach((source,id)=>{
    const p=source.position,r=source.range;
    for(let z=Math.floor((p.z-r)/cellSize);z<=Math.floor((p.z+r)/cellSize);z++)for(let x=Math.floor((p.x-r)/cellSize);x<=Math.floor((p.x+r)/cellSize);x++){
      const dx=Math.max(x*cellSize-p.x,0,p.x-(x+1)*cellSize),dz=Math.max(z*cellSize-p.z,0,p.z-(z+1)*cellSize);
      if(dx*dx+dz*dz>r*r)continue;const key=x+':'+z;if(!cells.has(key))cells.set(key,[]);cells.get(key).push(id);
    }
  });
  const maxPerCell=Math.max(1,...[...cells.values()].map(c=>c.length));
  // Reserve the normal, UV, view position, turf coordinates and moon shadow.
  if(maxPerCell*2+6>maxVaryings)return null;
  const candidates=(x,z)=>cells.get(Math.floor(x/cellSize)+':'+Math.floor(z/cellSize))||[];
  const prepared=prepareLanternGround(mesh,{cellSize,maxPerCell,candidates});if(!prepared)return null;
  const values=sources.map(()=>new THREE.Vector4()),metadata=sources.map(()=>new THREE.Vector4());
  const uniforms={courseGroundSources:{value:values},courseGroundMetadata:{value:metadata}};
  let varyings='',attributes='',vertex='vec3 courseGroundWorld=(modelMatrix*vec4(transformed,1.0)).xyz;\n',fragment='';
  for(let layer=0;layer<prepared.layers;layer++)attributes+='attribute vec4 courseLampIndices'+layer+';\n';
  for(let i=0;i<maxPerCell;i++){
    varyings+=`varying vec4 vGroundSource${i};varying vec4 vGroundMetadata${i};\n`;
    vertex+=`vGroundSource${i}=vec4(0.0);vGroundMetadata${i}=vec4(0.0);if(courseLampIndices${Math.floor(i/4)}.${'rgba'[i%4]}>0.0){int index=int(courseLampIndices${Math.floor(i/4)}.${'rgba'[i%4]})-1;vec4 source=courseGroundSources[index];vGroundSource${i}=vec4(mat3(viewMatrix)*(source.xyz-courseGroundWorld),source.w);vGroundMetadata${i}=courseGroundMetadata[index];}\n`;
    fragment+=`{vec4 source=vGroundSource${i};vec4 meta=vGroundMetadata${i};float d2=dot(source.xyz,source.xyz);float cutoff=max(1.0-d2*d2*meta.w,0.0);if(source.w>0.0&&cutoff>0.0){IncidentLight light;light.color=meta.rgb*source.w*cutoff*cutoff/max(d2,0.01);light.direction=normalize(source.xyz);light.visible=true;RE_Direct(light,geometryPosition,geometryNormal,geometryViewDir,geometryClearcoatNormal,material,reflectedLight);}}\n`;
  }
  const material=mesh.material,compile=material.onBeforeCompile,cacheKey=material.customProgramCacheKey,key=material.customProgramCacheKey();
  const pointMarker='#if ( NUM_POINT_LIGHTS > 0 ) && defined( RE_Direct )';
  const chunk=THREE.ShaderChunk.lights_fragment_begin.replace(pointMarker,'#if 0');
  material.onBeforeCompile=function(shader,renderer){
    compile.call(this,shader,renderer);Object.assign(shader.uniforms,uniforms);
    shader.vertexShader=`uniform vec4 courseGroundSources[${Math.max(1,sources.length)}];uniform vec4 courseGroundMetadata[${Math.max(1,sources.length)}];\n`+attributes+varyings+shader.vertexShader;
    shader.vertexShader=shader.vertexShader.replace('#include <worldpos_vertex>','#include <worldpos_vertex>\n'+vertex);
    shader.fragmentShader=varyings+shader.fragmentShader;
    shader.fragmentShader=shader.fragmentShader.replace('#include <lights_fragment_begin>',chunk).replace('#include <lights_fragment_end>',fragment+'\n#include <lights_fragment_end>');
    boundCourseSpotlights(shader);
  };
  const wrapper=material.onBeforeCompile;material.customProgramCacheKey=()=>key+'-course-ground-lighting-v1-bounded-spots-'+sources.length+':'+maxPerCell;material.needsUpdate=true;
  let disposed=false;
  function update(){if(disposed)return;sources.forEach((s,i)=>{const strength=s.light?(s.light.visible?s.light.intensity:0):power*s.anchor.intensity;values[i].set(s.position.x,s.position.y,s.position.z,strength);metadata[i].set(s.color.r,s.color.g,s.color.b,1/(s.range**4));});}
  update();
  return {update,candidates,dispose(){if(disposed)return;disposed=true;if(material.onBeforeCompile===wrapper){material.onBeforeCompile=compile;material.customProgramCacheKey=cacheKey;material.needsUpdate=true;}},stats:()=>({...prepared,sources:sources.length,normalPointSources:pointLights.length,maxPerCell,varyingVectors:maxPerCell*2+6,mode:'fixed-ground-sources'})};
}
