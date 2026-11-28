import * as THREE from './vendor/three/three.module.js';
import {boundCourseSpotlights} from './course-bounded-spotlights.js';

const RANGE=3.25,CELL=2,POWER=2.8;
// One shader wrapper per material, shared by every field built over its life.
const FIELD_SLOTS=new WeakMap();

// Fixed world-space sources. A cell contains every source whose sphere can
// reach it, including corners. Nothing is selected by the player's camera.
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
  const maxPerCell=Math.max(1,...cells.map(c=>c.length)),layers=Math.ceil(maxPerCell/4);
  const indices=new Float32Array(width*height*layers*4),sources=new Float32Array(Math.max(1,anchors.length)*4);
  cells.forEach((ids,cell)=>ids.forEach((id,i)=>{const x=cell%width,z=Math.floor(cell/width),layer=Math.floor(i/4);indices[((z*layers+layer)*width+x)*4+i%4]=id+1;}));
  const texture=(data,w,h)=>{const t=new THREE.DataTexture(data,w,h,THREE.RGBAFormat,THREE.FloatType);t.magFilter=t.minFilter=THREE.NearestFilter;t.generateMipmaps=false;t.needsUpdate=true;return t;};
  // The vec4 array uniform reads this Float32Array directly. An array of
  // Vector4 would be flattened again on every program upload.
  const indexMap=texture(indices,width,height*layers),sourceValues=sources;
  const color=new THREE.Color(0xffcb82),uniforms={courseLampCells:{value:indexMap},courseLampSources:{value:sourceValues}};
  const materials=new Map();let disposed=false;
  let body=`vec3 courseLampWorld=(vec4(geometryPosition,1.0)-viewMatrix[3]).xyz*mat3(viewMatrix);
vec2 courseLampCell=floor((courseLampWorld.xz-vec2(${minX.toFixed(6)},${minZ.toFixed(6)}))/${CELL.toFixed(1)});
if(all(greaterThanEqual(courseLampCell,vec2(0.0)))&&all(lessThan(courseLampCell,vec2(${width.toFixed(1)},${height.toFixed(1)})))){`;
  for(let layer=0;layer<layers;layer++){
    body+=`vec4 courseLampIds${layer}=texture2D(courseLampCells,vec2((courseLampCell.x+0.5)/${width.toFixed(1)},(courseLampCell.y*${layers.toFixed(1)}+${(layer+.5).toFixed(1)})/${(height*layers).toFixed(1)}));\n`;
    for(let channel=0;channel<4;channel++){
      if(layer*4+channel>=maxPerCell)break;
      body+=`{float courseLampId=courseLampIds${layer}.${'rgba'[channel]};if(courseLampId>0.0){
vec4 courseLamp=courseLampSources[int(courseLampId)-1];
vec3 courseLampDelta=courseLamp.xyz-courseLampWorld;float courseLampDistance2=dot(courseLampDelta,courseLampDelta);
if(courseLampDistance2<${(RANGE*RANGE).toFixed(6)}){
float courseLampCutoff=max(1.0-courseLampDistance2*courseLampDistance2/${(RANGE**4).toFixed(9)},0.0);
IncidentLight courseLampLight;courseLampLight.color=vec3(${color.toArray().map(v=>v.toFixed(9)).join(',')})*courseLamp.w*courseLampCutoff*courseLampCutoff/max(courseLampDistance2,0.01);
courseLampLight.direction=normalize(mat3(viewMatrix)*courseLampDelta);courseLampLight.visible=true;
RE_Direct(courseLampLight,geometryPosition,geometryNormal,geometryViewDir,geometryClearcoatNormal,material,reflectedLight);
}}}\n`;
    }
  }
  body+='}';
  const owner={},patch={uniforms,body,count:Math.max(1,anchors.length),key:'-course-lantern-field-v2-bounded-spots-'+[minX,minZ,width,height,layers,maxPerCell,anchors.length].join(':')};
  function apply(material){
    if(!material||materials.has(material)||(!material.isMeshLambertMaterial&&!material.isMeshPhongMaterial))return;
    // Materials survive rebuilds and other patches may wrap them too, so the
    // wrapper is installed once and each field only swaps the active patch.
    let slot=FIELD_SLOTS.get(material);
    if(!slot){
      slot={patch:null,owner:null};FIELD_SLOTS.set(material,slot);
      const compile=material.onBeforeCompile,key=material.customProgramCacheKey();
      material.onBeforeCompile=function(shader,renderer){compile.call(this,shader,renderer);const p=slot.patch;if(!p)return;Object.assign(shader.uniforms,p.uniforms);shader.fragmentShader='uniform sampler2D courseLampCells;\nuniform vec4 courseLampSources['+p.count+'];\n'+shader.fragmentShader;shader.fragmentShader=shader.fragmentShader.replace('#include <lights_fragment_end>',p.body+'\n#include <lights_fragment_end>');boundCourseSpotlights(shader);};
      material.customProgramCacheKey=()=>key+(slot.patch?slot.patch.key:'');
    }
    slot.patch=patch;slot.owner=owner;material.needsUpdate=true;materials.set(material,slot);
  }
  function update(){
    if(disposed)return;
    for(let i=0;i<anchors.length;i++){const a=anchors[i],p=a.position,o=i*4;sources[o]=p.x;sources[o+1]=p.y;sources[o+2]=p.z;sources[o+3]=POWER*a.intensity;}
  }
  update();
  return {apply,update,textures:[indexMap],dispose(){
    if(disposed)return;disposed=true;
    // Some course materials survive a rebuild. Remove this scene's shader
    // wrapper before its textures disappear, so the next field cannot stack.
    for(const [m,slot]of materials)if(slot.owner===owner){slot.patch=null;slot.owner=null;m.needsUpdate=true;}
    indexMap.dispose();materials.clear();
  },
    candidates(x,z){const cx=Math.floor((x-minX)/CELL),cz=Math.floor((z-minZ)/CELL);return cx<0||cz<0||cx>=width||cz>=height?[]:cells[cz*width+cx].slice();},
    stats:()=>({mode:'fixed-world-field',count:anchors.length,range:RANGE,power:POWER,cellSize:CELL,grid:[width,height],maxPerCell,bytes:indices.byteLength+sources.byteLength,materials:materials.size,sources:anchors.map((a,i)=>({index:i,position:a.position.toArray(),power:sources[i*4+3]}))})};
}
