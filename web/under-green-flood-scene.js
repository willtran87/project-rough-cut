import * as THREE from './vendor/three/three.module.js';
import {partitionDrainSurfaces} from './under-green-light-partitions.js';
import {floodState} from './under-green-flood.js';
import {onFloor} from './under-green-course.js';
export function createDrainFlood(scene,layout){
 const parts=layout.tiles.map(t=>{const g=new THREE.PlaneGeometry(t.w,t.d);g.rotateX(-Math.PI/2);g.translate(t.x,0,-t.y);return g;});
 const time={value:0},material=new THREE.MeshPhongMaterial({color:0x233020,specular:0x64715b,shininess:38,transparent:true,opacity:.82,depthWrite:false});
 material.onBeforeCompile=s=>{
  s.uniforms.floodTime=time;
  s.vertexShader='varying vec2 floodPoint;\n'+s.vertexShader;
  s.vertexShader=s.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\nfloodPoint=position.xz;');
  s.fragmentShader='varying vec2 floodPoint;uniform float floodTime;\n'+s.fragmentShader;
  s.fragmentShader=s.fragmentShader.replace('#include <color_fragment>',`#include <color_fragment>
   vec2 p=floor(floodPoint*80.)/80.;
   float silt=.5+.5*sin(p.x*2.1+sin(p.y*1.9-floodTime*.22));
   float ripple=smoothstep(.94,.995,sin((p.y+sin(p.x*1.7)*.19)*27.+sin(p.x*4.)*2.-floodTime*1.4))*smoothstep(.45,.87,sin(p.x*17.+p.y*4.1)*sin(p.y*7.3-p.x*3.7));
   diffuseColor.rgb*=.65+silt*.35;diffuseColor.rgb+=ripple*vec3(.008,.011,.006);`);
  s.fragmentShader=s.fragmentShader.replace('#include <specularmap_fragment>',`#include <specularmap_fragment>
   specularStrength*=.04+ripple*.5;`);
 };
 const floodParts=partitionDrainSurfaces(scene,parts,material,'Drain flood',.40),mesh=floodParts.root;let state=floodState();
 // A single batched, depth-tested film hugs the actual inner wall faces. The
 // top follows the water; during recession a diminishing damp band remains.
 const edgeParts=[];
 for(const w of layout.walls){
  const vertical=w.w<w.d,length=vertical?w.d:w.w,side=vertical?(onFloor(w.x+.3,w.y)?1:-1):(onFloor(w.x,w.y+.3)?1:-1);
  const g=new THREE.PlaneGeometry(length,.44);
  if(vertical){g.rotateY(side*Math.PI/2);g.translate(w.x+side*.114,.22,-w.y);}
  else{g.rotateY(side>0?Math.PI:0);g.translate(w.x,.22,-w.y-side*.114);}
  edgeParts.push(g);
 }
 const waterline={value:0},dampTop={value:0},wetFade={value:0};
 const edgeMaterial=new THREE.MeshPhongMaterial({color:0x222b1f,specular:0x5a6a54,shininess:38,transparent:true,opacity:.5,depthWrite:false});
 edgeMaterial.onBeforeCompile=s=>{
  s.uniforms.floodLine=waterline;s.uniforms.dampTop=dampTop;s.uniforms.wetFade=wetFade;s.uniforms.floodTime=time;
  s.vertexShader='varying vec3 floodEdgePoint;\n'+s.vertexShader;
  s.vertexShader=s.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\nfloodEdgePoint=position;');
  s.fragmentShader='varying vec3 floodEdgePoint;uniform float floodLine;uniform float dampTop;uniform float wetFade;uniform float floodTime;\n'+s.fragmentShader;
  s.fragmentShader=s.fragmentShader.replace('#include <color_fragment>',`#include <color_fragment>
   float along=floodEdgePoint.x+floodEdgePoint.z;
   float uneven=sin(along*11.)*.004+sin(along*29.)*.002;
   float margin=dampTop+uneven-floodEdgePoint.y;
   float wet=smoothstep(0.,.025,margin)*wetFade;
   float edge=1.-smoothstep(.003,.014,abs(floodEdgePoint.y-floodLine-uneven));
   edge*=step(.008,floodLine)*(.45+.25*sin(along*17.+floodTime*.7));
   diffuseColor.a*=max(wet,edge);
   diffuseColor.rgb+=vec3(.028,.031,.016)*edge;
  `);
 };
 edgeMaterial.customProgramCacheKey=()=> 'drain-flood-wall-film-v1';
 const filmParts=partitionDrainSurfaces(scene,edgeParts,edgeMaterial,'Drain flood contact film'),edges=filmParts.root;filmParts.setRenderOrder(1);
 return {update(r,reduced){
  state=floodState(r.elapsed);mesh.visible=state.depth>.006;mesh.position.y=state.depth;time.value=reduced?0:r.elapsed;
  material.opacity=.55+.41*THREE.MathUtils.smoothstep(state.depth,.015,.28);
  waterline.value=state.depth;
  const cycleAge=r.elapsed<32?0:(r.elapsed-32)%66;
  const residual=state.phase==='falling'||state.phase==='dry'&&cycleAge>=33;
  dampTop.value=residual?.39:state.depth+.012;
  wetFade.value=state.phase==='dry'?(cycleAge>=33?Math.max(0,1-(cycleAge-33)/24):0):state.depth>.006?1:0;
  edges.visible=wetFade.value>0;edges.renderOrder=1;
 },stats:()=>({...state,visible:mesh.visible,opacity:material.opacity,wallFilm:{segments:layout.walls.length,visible:edges.visible,waterline:waterline.value,dampHeight:dampTop.value,fade:wetFade.value}}),dispose(){floodParts.dispose();filmParts.dispose();material.dispose();edgeMaterial.dispose();}};
}
