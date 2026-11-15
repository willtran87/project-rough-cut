import * as THREE from './vendor/three/three.module.js';
import {boundCourseSpotlights} from './course-bounded-spotlights.js';

const RANGE=3.25,CELL=2,POWER=2.8;

// Store each cell's actual source values, avoiding a dependent dynamic lookup
// into a large uniform array. Every intersecting source is still retained.
// Course source positions are fixed for the lifetime of this field. Flicker
// changes power; rebuilding the course rebuilds its conservative cell grid.
export function createCourseLanternLightField(anchors){
 const minX=Math.floor((Math.min(0,...anchors.map(a=>a.position.x))-RANGE)/CELL)*CELL;
 const minZ=Math.floor((Math.min(0,...anchors.map(a=>a.position.z))-RANGE)/CELL)*CELL;
 const width=Math.ceil((Math.max(0,...anchors.map(a=>a.position.x))+RANGE-minX)/CELL);
 const height=Math.ceil((Math.max(0,...anchors.map(a=>a.position.z))+RANGE-minZ)/CELL);
 const cells=Array.from({length:width*height},()=>[]);
 for(let z=0;z<height;z++)for(let x=0;x<width;x++){
  const left=minX+x*CELL,top=minZ+z*CELL;
  anchors.forEach((a,i)=>{const dx=Math.max(left-a.position.x,0,a.position.x-left-CELL),dz=Math.max(top-a.position.z,0,a.position.z-top-CELL);if(dx*dx+dz*dz<=RANGE*RANGE)cells[z*width+x].push(i);});
 }
 const maxPerCell=Math.max(1,...cells.map(c=>c.length)),data=new Float32Array(width*height*maxPerCell*4),sources=new Float32Array(Math.max(1,anchors.length)*4),copies=anchors.map(()=>[]);
 cells.forEach((ids,cell)=>ids.forEach((id,slot)=>copies[id].push(((Math.floor(cell/width)*maxPerCell+slot)*width+cell%width)*4)));
 const map=new THREE.DataTexture(data,width,height*maxPerCell,THREE.RGBAFormat,THREE.FloatType);map.magFilter=map.minFilter=THREE.NearestFilter;map.generateMipmaps=false;map.needsUpdate=true;
 const uniforms={coursePackedLamps:{value:map}},color=new THREE.Color(0xffcb82),materials=new Map();let disposed=false,uploads=0;
 let body=`vec3 courseLampWorld=(vec4(geometryPosition,1.0)-viewMatrix[3]).xyz*mat3(viewMatrix);
vec2 courseLampCell=floor((courseLampWorld.xz-vec2(${minX.toFixed(6)},${minZ.toFixed(6)}))/${CELL.toFixed(1)});
if(all(greaterThanEqual(courseLampCell,vec2(0.0)))&&all(lessThan(courseLampCell,vec2(${width.toFixed(1)},${height.toFixed(1)})))){`;
 for(let slot=0;slot<maxPerCell;slot++)body+=`{
vec4 courseLamp=texture2D(coursePackedLamps,vec2((courseLampCell.x+0.5)/${width.toFixed(1)},(courseLampCell.y*${maxPerCell.toFixed(1)}+${(slot+.5).toFixed(1)})/${(height*maxPerCell).toFixed(1)}));
if(courseLamp.w!=0.0){vec3 courseLampDelta=courseLamp.xyz-courseLampWorld;float courseLampDistance2=dot(courseLampDelta,courseLampDelta);
if(courseLampDistance2<${(RANGE*RANGE).toFixed(6)}){
float courseLampCutoff=max(1.0-courseLampDistance2*courseLampDistance2/${(RANGE**4).toFixed(9)},0.0);
IncidentLight courseLampLight;courseLampLight.color=vec3(${color.toArray().map(v=>v.toFixed(9)).join(',')})*courseLamp.w*courseLampCutoff*courseLampCutoff/max(courseLampDistance2,0.01);
courseLampLight.direction=normalize(mat3(viewMatrix)*courseLampDelta);courseLampLight.visible=true;
RE_Direct(courseLampLight,geometryPosition,geometryNormal,geometryViewDir,geometryClearcoatNormal,material,reflectedLight);
}}}\n`;
 body+='}';
 function apply(material){
  if(!material||materials.has(material)||(!material.isMeshLambertMaterial&&!material.isMeshPhongMaterial))return;
  const compile=material.onBeforeCompile,cacheKey=material.customProgramCacheKey,key=material.customProgramCacheKey();
  material.onBeforeCompile=function(shader,renderer){compile.call(this,shader,renderer);Object.assign(shader.uniforms,uniforms);shader.fragmentShader='uniform sampler2D coursePackedLamps;\n'+shader.fragmentShader;shader.fragmentShader=shader.fragmentShader.replace('#include <lights_fragment_end>',body+'\n#include <lights_fragment_end>');boundCourseSpotlights(shader);};
  material.customProgramCacheKey=()=>key+'-course-packed-lanterns-v1-'+[minX,minZ,width,height,maxPerCell,anchors.length].join(':');material.needsUpdate=true;
  materials.set(material,{compile,cacheKey,wrapper:material.onBeforeCompile});
 }
 function update(){
  if(disposed)return;let changed=false;
  anchors.forEach((a,i)=>{
   const values=[a.position.x,a.position.y,a.position.z,POWER*a.intensity].map(Math.fround);let dirty=false;
   for(let j=0;j<4;j++)if(sources[i*4+j]!==values[j]){sources[i*4+j]=values[j];dirty=true;}
   if(dirty){for(const offset of copies[i])data.set(values,offset);changed=true;}
  });
  if(changed){map.needsUpdate=true;uploads++;}
 }
 update();
 return {apply,update,textures:[map],dispose(){
  if(disposed)return;disposed=true;
  for(const [m,p]of materials)if(m.onBeforeCompile===p.wrapper){m.onBeforeCompile=p.compile;m.customProgramCacheKey=p.cacheKey;m.needsUpdate=true;}
  map.dispose();materials.clear();
 },candidates(x,z){const cx=Math.floor((x-minX)/CELL),cz=Math.floor((z-minZ)/CELL);return cx<0||cz<0||cx>=width||cz>=height?[]:cells[cz*width+cx].slice();},
 stats:()=>({mode:'packed-world-field',count:anchors.length,range:RANGE,power:POWER,cellSize:CELL,grid:[width,height],maxPerCell,bytes:data.byteLength+sources.byteLength,uploads,materials:materials.size,sources:anchors.map((a,i)=>({index:i,position:a.position.toArray(),power:sources[i*4+3]}))})};
}
