import * as THREE from './vendor/three/three.module.js';
import {terrainHeight} from './course-terrain.js';

const RANGE=8,CELL=2;
export function practicalLightAnchors(lanterns,shelters){
 return [
  ...lanterns.map(({x,z})=>({kind:'lantern',position:new THREE.Vector3(x,terrainHeight(x,-z)+.35,z),power:5})),
  ...shelters.map(c=>({kind:'shelter',position:new THREE.Vector3(c.x,terrainHeight(c.x,c.y)+3.16,-c.y),power:38})),
  {kind:'garage',position:new THREE.Vector3(-23,terrainHeight(-23,799.78)+4.6,-799.78),power:55},
  ...[802,807,812].map(y=>({kind:'garage-interior',position:new THREE.Vector3(-23,4.42,-y),power:20})),
  {kind:'shed',position:new THREE.Vector3(0,terrainHeight(0,-1.9)+3.45,1.9),power:15}
 ];
}

// Every source remains attached to its actual fixture. A conservative spatial
// grid retains all intersecting lights; camera selection never changes them.
// Static packed values upload once. Circuit sag uses two scalar uniforms.
export function createBackNinePracticalLights(anchors){
 const minX=Math.floor((Math.min(...anchors.map(a=>a.position.x))-RANGE)/CELL)*CELL;
 const minZ=Math.floor((Math.min(...anchors.map(a=>a.position.z))-RANGE)/CELL)*CELL;
 const width=Math.ceil((Math.max(...anchors.map(a=>a.position.x))+RANGE-minX)/CELL);
 const height=Math.ceil((Math.max(...anchors.map(a=>a.position.z))+RANGE-minZ)/CELL);
 const cells=Array.from({length:width*height},()=>[]);
 for(let z=0;z<height;z++)for(let x=0;x<width;x++){
  const left=minX+x*CELL,top=minZ+z*CELL;
  anchors.forEach((a,i)=>{const dx=Math.max(left-a.position.x,0,a.position.x-left-CELL),dz=Math.max(top-a.position.z,0,a.position.z-top-CELL);if(dx*dx+dz*dz<=RANGE*RANGE)cells[z*width+x].push(i);});
 }
 const slots=Math.max(1,...cells.map(c=>c.length)),data=new Float32Array(width*height*slots*4);
 cells.forEach((ids,cell)=>ids.forEach((id,slot)=>{
  const a=anchors[id],offset=((Math.floor(cell/width)*slots+slot)*width+cell%width)*4;
  data.set([...a.position.toArray(),a.kind==='lantern'?a.power:-a.power],offset);
 }));
 const map=new THREE.DataTexture(data,width,height*slots,THREE.RGBAFormat,THREE.FloatType);map.magFilter=map.minFilter=THREE.NearestFilter;map.generateMipmaps=false;map.needsUpdate=true;
 const circuit={value:new THREE.Vector2()},strength={value:1},garageOpen={value:0},materials=new Map(),color=new THREE.Color(0xffce89);let disposed=false;
 const body=`
 vec3 practicalBefore=reflectedLight.directDiffuse;
 vec3 practicalWorld=(vec4(geometryPosition,1.0)-viewMatrix[3]).xyz*mat3(viewMatrix);
 vec2 practicalCell=floor((practicalWorld.xz-vec2(${minX.toFixed(1)},${minZ.toFixed(1)}))/${CELL.toFixed(1)});
 if(practicalStrength>0.0&&all(greaterThanEqual(practicalCell,vec2(0.0)))&&all(lessThan(practicalCell,vec2(${width.toFixed(1)},${height.toFixed(1)})))){
  for(int slot=0;slot<${slots};slot++){
   vec4 lamp=texture2D(practicalLamps,vec2((practicalCell.x+.5)/${width.toFixed(1)},(practicalCell.y*${slots.toFixed(1)}+float(slot)+.5)/${(height*slots).toFixed(1)}));
   if(lamp.w==0.0)break;
   vec3 delta=lamp.xyz-practicalWorld;float d2=dot(delta,delta);
   if(d2<${(RANGE*RANGE).toFixed(1)}){
    float cutoff=max(1.0-d2*d2/${(RANGE**4).toFixed(1)},0.0);
    float circuitY=floor(-lamp.z/48.0)*48.0+24.0;
    float behind=clamp((practicalCircuit.x-circuitY+30.0)/60.0,0.0,1.0);
    // Interior fixtures are contained by the masonry walls. Only the
    // open portion of the front shutter transmits their light outside.
    float bay=lamp.z< -800.0&&lamp.z> -814.0&&abs(lamp.x+23.0)<.1?1.0:0.0;
    float openingY=practicalWorld.y+(lamp.y-practicalWorld.y)*clamp((-800.0-practicalWorld.z)/(abs(lamp.z-practicalWorld.z)<.0001?.0001:lamp.z-practicalWorld.z),0.0,1.0);
    float bayMask=bay>0.0?(practicalWorld.x> -28.5&&practicalWorld.x< -17.5&&practicalWorld.z> -813.5&&practicalWorld.y<5.05?1.0:0.0):1.0;
    if(bay>0.0&&practicalWorld.z> -800.0)bayMask*=step(openingY,garageOpen*4.9);
    float power=bayMask*abs(lamp.w)*(lamp.w>0.0?max(.68,1.0-practicalCircuit.y*(.35+.6*behind)):1.0);
    // Hooded overhead fixtures direct their useful light down into the bay.
    // A little reflected spill reveals rafters without whitening the roof.
    float emission=lamp.w<0.0?mix(.10,1.0,smoothstep(-.1,.2,delta.y*inversesqrt(max(d2,.04)))):1.0;
    IncidentLight light;light.color=vec3(${color.toArray().map(v=>v.toFixed(9)).join(',')})*power*practicalStrength*emission*cutoff*cutoff/max(d2,.04);
    light.direction=normalize(mat3(viewMatrix)*delta);light.visible=true;
    RE_Direct(light,geometryPosition,geometryNormal,geometryViewDir,geometryClearcoatNormal,material,reflectedLight);
   }
  }
 }
 vec3 practicalDiffuse=reflectedLight.directDiffuse-practicalBefore;
 `;
 function apply(material){
  if(!material||materials.has(material)||(!material.isMeshLambertMaterial&&!material.isMeshPhongMaterial))return;
  const compile=material.onBeforeCompile,cacheKey=material.customProgramCacheKey,key=cacheKey.call(material);
  material.onBeforeCompile=function(shader,renderer){
   compile.call(this,shader,renderer);Object.assign(shader.uniforms,{practicalLamps:{value:map},practicalCircuit:circuit,practicalStrength:strength,garageOpen});
   shader.fragmentShader='uniform sampler2D practicalLamps;uniform vec2 practicalCircuit;uniform float practicalStrength;uniform float garageOpen;\n'+shader.fragmentShader;
   shader.fragmentShader=shader.fragmentShader.replace('#include <lights_fragment_end>',body+'\n#include <lights_fragment_end>');
   // Keep the existing turf visibility floor, but do not let it erase a
   // real source's contribution. Other headlight/moon response is unchanged.
   shader.fragmentShader=shader.fragmentShader.replace('outgoingLight=max(outgoingLight,diffuseColor.rgb*vec3(.34,.40,.43));','outgoingLight=max(outgoingLight-practicalDiffuse,diffuseColor.rgb*vec3(.34,.40,.43))+practicalDiffuse;');
  };
  material.customProgramCacheKey=()=>key+'-back-nine-practical-v2-'+[minX,minZ,width,height,slots].join(':');material.needsUpdate=true;
  materials.set(material,{compile,cacheKey,wrapper:material.onBeforeCompile});
 }
 return {apply,textures:[map],update(actor,dip,opening=0){circuit.value.set(actor.y,dip);garageOpen.value=opening;},setStrength(value){strength.value=value;},
  candidates(x,z){const cx=Math.floor((x-minX)/CELL),cz=Math.floor((z-minZ)/CELL);return cx<0||cz<0||cx>=width||cz>=height?[]:cells[cz*width+cx].slice();},
  stats:()=>({sources:anchors.length,range:RANGE,grid:[width,height],slots,bytes:data.byteLength,materials:materials.size,circuit:circuit.value.toArray(),strength:strength.value}),
  dispose(){if(disposed)return;disposed=true;for(const [m,p]of materials)if(m.onBeforeCompile===p.wrapper){m.onBeforeCompile=p.compile;m.customProgramCacheKey=p.cacheKey;m.needsUpdate=true;}materials.clear();map.dispose();}
 };
}
