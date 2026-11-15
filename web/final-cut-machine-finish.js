import * as THREE from './vendor/three/three.module.js';
import * as Art from './pixel-art.js';

// One shared authored atlas, projected in physical metres on each manufactured
// part. Coordinates travel with the chassis, wheel or cutting unit. No screen
// noise or tiled lettering is used as material detail.
export function tagMachineSurface(g,finish=0,seed=0,offset=[0,0,0]){
 g.computeBoundingBox();const bounds=g.boundingBox,size=new THREE.Vector3();bounds.getSize(size);
 const p=g.attributes.position,n=g.attributes.normal,existing=g.attributes.machineClass,uv=[],face=[],point=[];
 for(let i=0;i<p.count;i++){
  const a=[Math.abs(n.getX(i)),Math.abs(n.getY(i)),Math.abs(n.getZ(i))],axis=a[1]>=Math.max(a[0],a[2])?1:a[0]>a[2]?0:2;
  const coords=axis===1?['x','z']:axis===0?['z','y']:['x','y'];
  const pos=[p.getX(i),p.getY(i),p.getZ(i)];
  for(const key of coords){const j='xyz'.indexOf(key);uv.push((pos[j]-bounds.min[key])/Math.max(size[key],.0001));}
  face.push(Math.max(size[coords[0]],.001),Math.max(size[coords[1]],.001),existing?existing.getX(i):finish,seed);
  point.push(...pos.map((value,j)=>value+offset[j]));
 }
 g.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));g.setAttribute('machineFace',new THREE.Float32BufferAttribute(face,4));g.setAttribute('machinePoint',new THREE.Float32BufferAttribute(point,3));return g;
}

export function createMachineFinishMaterial(tireFilm=null){
 const map=Art.texture('final-cut-industrial-materials-v1',null,null,true);
 const m=new THREE.MeshLambertMaterial({map,side:THREE.DoubleSide});
 m.onBeforeCompile=shader=>{
  if(tireFilm)shader.uniforms.tireFilm={value:tireFilm};
  shader.vertexShader='attribute vec4 machineFace;\nattribute vec3 machinePoint;\nvarying vec4 vMachineFace;\nvarying vec2 vMachineUv;\nvarying vec3 vMachinePoint;\n'+shader.vertexShader;
  shader.vertexShader=shader.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\nvMachineFace=machineFace;vMachineUv=uv;vMachinePoint=machinePoint;');
  shader.fragmentShader='varying vec4 vMachineFace;\nvarying vec2 vMachineUv;\nvarying vec3 vMachinePoint;\n'+shader.fragmentShader;
  shader.fragmentShader=shader.fragmentShader.replace('#include <map_fragment>',`
   vec2 metres=vMachineUv*vMachineFace.xy;
   float kind=vMachineFace.z,phase=vMachineFace.w;
   vec2 tile=vec2(0.0,1.0);
   if(kind>.5&&kind<1.5)tile=vec2(1.0,1.0);
   else if(kind>1.5&&kind<3.5)tile=vec2(1.0,0.0);
   else if(kind>3.5&&kind<4.5)tile=vec2(2.0,1.0);
   else if(kind>4.5)tile=vec2(3.0,1.0);
   vec2 local=clamp(fract(metres/1.6+vec2(phase,phase*.731)),.003,.997);
   vec3 pigment=texture2D(map,(tile+local)/vec2(4.0,2.0)).rgb;
   if(kind>3.5&&kind<4.5)pigment*=.38;
   // Paint loss is clustered at physical panel edges, with restrained dirt
   // along lower seams. Fine pixel clusters follow the part's local surface.
   vec2 pixel=floor(metres/.004)*.004;
   vec2 edgeDistance=min(vMachineUv,1.0-vMachineUv)*vMachineFace.xy;
   float edge=min(edgeDistance.x,edgeDistance.y);
   float cluster=smoothstep(.15,.65,sin(pixel.x*23.0+phase*9.0)*.35+sin(pixel.y*31.0-phase*5.0)*.3+.35);
   float wear=(1.0-smoothstep(.002,.023,edge))*cluster;
   vec3 steel=texture2D(map,(vec2(1.0,1.0)+local)/vec2(4.0,2.0)).rgb;
   if(kind<.5||(kind>1.5&&kind<3.5))pigment=mix(pigment,steel,wear*.64);
   else if(kind<1.5)pigment*=1.0+wear*.18;
   float seam=(1.0-smoothstep(.004,.035,edgeDistance.y))*.16;
   pigment*=1.0-seam;
   if(kind>2.5&&kind<3.5){
    float stripe=step(.5,fract((pixel.x+pixel.y)/.18));
    pigment=mix(vec3(.035,.045,.033),pigment*vec3(.92,.69,.28),stripe);
   }
   // Oil sits beneath the real rear filler caps and trails down the nearby
   // rear casing. It is tied to chassis coordinates, not scattered uniformly.
   float filler=min(length(vMachinePoint.xz-vec2(1.25,2.17)),length(vMachinePoint.xz-vec2(-1.25,2.17)));
   float oil=(1.0-smoothstep(.07,.19,filler))*step(2.325,vMachinePoint.y);
   float runWidth=abs(abs(vMachinePoint.x)-1.25+.008*sin(vMachinePoint.y*16.0));
   float run=(1.0-smoothstep(.014,.045,runWidth))*smoothstep(1.25,1.9,vMachinePoint.y)*(1.0-smoothstep(2.25,2.4,vMachinePoint.y))*step(2.55,vMachinePoint.z);
   pigment=mix(pigment,pigment*.28,clamp(max(oil,run),0.0,.8));
   diffuseColor.rgb*=pow(max(pigment,vec3(0.0)),vec3(.8));
  `);
  shader.fragmentShader=shader.fragmentShader.replace('#include <opaque_fragment>','vec3 machineShade=floor(sqrt(max(outgoingLight,vec3(0.0)))*48.0+.5)/48.0;outgoingLight=machineShade*machineShade;\n#include <opaque_fragment>');
  if(tireFilm){
   shader.fragmentShader='uniform vec4 tireFilm;\n'+shader.fragmentShader;
   shader.fragmentShader=shader.fragmentShader.replace('diffuseColor.rgb*=pow',`
    vec3 rubberPixel=floor(vMachinePoint/.006)*.006;
    float tread=smoothstep(.60,.79,length(vMachinePoint.yz));
    float deposit=smoothstep(-.5,.65,sin(rubberPixel.y*43.0+rubberPixel.x*25.0)*.55+sin(rubberPixel.z*29.0)*.45);
    float depositMask=(.18+.82*deposit)*(.25+.75*tread);
    pigment=mix(pigment,vec3(.19,.165,.105),tireFilm.y*depositMask*.65);
    pigment=mix(pigment,vec3(.065,.09,.028),tireFilm.z*depositMask*.55);
    pigment=mix(pigment,vec3(.105,.073,.038),tireFilm.x*depositMask*.85);
    pigment*=1.0-tireFilm.w*.32;
    diffuseColor.rgb*=pow`);
  }
 };
 m.customProgramCacheKey=()=> 'final-cut-authored-machine-1'+(tireFilm?'-tire':'');return m;
}

