import {gustGLSL} from './back-nine-wind.js';
import {DETAIL_PLANTS,PLANTING_COUNTS,PLANTING_POCKETS,PLANTING_SWEEPS} from './back-nine-planting.js';
import {BED_FOLIAGE} from './back-nine-bed-craft.js';
export {DETAIL_PLANTS} from './back-nine-planting.js';
import * as THREE from './vendor/three/three.module.js';
import * as Art from './pixel-art.js';
import {COURSE} from './back-nine-course.js';
import {terrainHeight} from './course-terrain.js';
import {createFoliageMowingMemory} from './back-nine-foliage-mowing.js';

// Level 1's original six high-resolution verge illustrations, on fixed crossed
// geometry. One atlas/material, no billboards or new navigation obstacles.
export async function buildCourseDetail({put,box,cylinder,mat,yieldCpuPreparation,software=false}){
 const mowing=createFoliageMowingMemory();
 const source=await Art.source('rough-cut-verge-atlas-v1'),map=Art.texture('rough-cut-verge-atlas-v1');
 const material=mat('plantCourse',0xb8c9af,map,software),time={value:0},wind={value:1},range={value:new THREE.Vector2(software?24:48,software?32:60)},contact={value:new THREE.Vector3(1000,0,1000)};
 material.side=THREE.DoubleSide;material.alphaTest=.28;material.vertexColors=true;material.emissive?.setHex(0x060b05);
 const headLight={value:new THREE.Vector4(0,0,0,0)},mowerLight={value:new THREE.Vector4(0,0,0,0)};
 const headDirection={value:new THREE.Vector4(0,0,-1,0)},headShape={value:new THREE.Vector2(16,1)},joeHead={value:new THREE.Vector4()},joeDirection={value:new THREE.Vector4(0,0,-1,0)},joeShape={value:new THREE.Vector2(32,1)},direction=new THREE.Vector3();
 const baseCompile=material.onBeforeCompile;
 material.onBeforeCompile=s=>{baseCompile(s);s.uniforms.vergeRange=range;s.uniforms.vergeTime=time;s.uniforms.vergeWind=wind;s.uniforms.vergeContact=contact;
  s.uniforms.vergeMowing={value:mowing.texture};
  s.vertexShader='uniform float vergeTime;\n'+gustGLSL('vergeTime')+'\n'+'attribute vec2 vergeCutData;attribute vec3 vergeCutGround;uniform sampler2D vergeMowing;varying float vergeDistance;attribute float vergeTip;attribute float vergeFlex;uniform float vergeWind;uniform vec3 vergeContact;\n'+s.vertexShader;
  s.vertexShader=s.vertexShader.replace('#include <uv_vertex>',`#include <uv_vertex>
   vec2 mowingUV=vec2((mod(vergeCutData.x,128.0)+.5)/128.0,(floor(vergeCutData.x/128.0)+.5)/64.0);
   vec4 mowingState=texture2D(vergeMowing,mowingUV);
   float mowingAmount=mowingState.r;
  `);
  s.vertexShader=s.vertexShader.replace('#include <beginnormal_vertex>',`#include <beginnormal_vertex>
   objectNormal=normalize(mix(objectNormal,normalize(vec3(-vergeCutGround.y,1.0,-vergeCutGround.z)),mowingAmount));
  `);
  if(software){
   s.uniforms.vergeHead=headLight;s.uniforms.vergeMower=mowerLight;
   s.uniforms.vergeHeadDirection=headDirection;s.uniforms.vergeHeadShape=headShape;s.uniforms.vergeJoeHead=joeHead;s.uniforms.vergeJoeDirection=joeDirection;s.uniforms.vergeJoeShape=joeShape;
   s.vertexShader=`uniform vec4 vergeHead;uniform vec4 vergeMower;uniform vec4 vergeHeadDirection;uniform vec2 vergeHeadShape;uniform vec4 vergeJoeHead;uniform vec4 vergeJoeDirection;uniform vec2 vergeJoeShape;varying vec3 vergeLight;
   float vergeBeam(vec3 point,vec4 lamp,vec4 direction,vec2 shape){
    vec3 delta=point-lamp.xyz;float d2=max(.01,dot(delta,delta));
    float cone=smoothstep(direction.w,shape.y,dot(delta*inversesqrt(d2),direction.xyz));
    float edge=max(0.0,1.0-d2*d2/(shape.x*shape.x*shape.x*shape.x));
    return lamp.w*cone*edge*edge/d2;
   }
   `+s.vertexShader;
   s.vertexShader=s.vertexShader.replace('#include <project_vertex>',`#include <project_vertex>
    vec3 vergeLitPosition=(modelMatrix*vec4(transformed,1.0)).xyz;
    float dh=length(vergeLitPosition-vergeHead.xyz),dm=length(vergeLitPosition-vergeMower.xyz);
    float lh=vergeBeam(vergeLitPosition,vergeHead,vergeHeadDirection,vergeHeadShape);
    float lj=vergeBeam(vergeLitPosition,vergeJoeHead,vergeJoeDirection,vergeJoeShape);
    float lm=vergeMower.w*pow(max(0.0,1.0-pow(dm/40.0,4.0)),2.0)/max(1.0,dm*dm);
    vergeLight=min(vec3(1.6),vec3(.19,.23,.22)+vec3(.7,.7,.4)*lh+vec3(1.0,.5,.17)*lj+vec3(1.0,.015,.006)*lm);`);
   s.fragmentShader='varying vec3 vergeLight;\n'+s.fragmentShader;
   s.fragmentShader=s.fragmentShader.replace('#include <map_fragment>','#include <map_fragment>\ndiffuseColor.rgb*=vergeLight;');
  }
  s.vertexShader=s.vertexShader.replace('#include <project_vertex>','#include <project_vertex>\nvergeDistance=length(mvPosition.xyz);');
  s.fragmentShader='varying float vergeDistance;uniform vec2 vergeRange;\n'+s.fragmentShader;s.fragmentShader=s.fragmentShader.replace('#include <alphatest_fragment>','diffuseColor.a*=1.0-smoothstep(vergeRange.x,vergeRange.y,vergeDistance);\n#include <alphatest_fragment>');
  s.vertexShader=s.vertexShader.replace('#include <begin_vertex>',`#include <begin_vertex>
   float bend=vergeTip*vergeTip*vergeWind*vergeFlex*(1.0-mowingAmount*.95);
   vec3 vergeWorld=(modelMatrix*vec4(position,1.0)).xyz;
   transformed.x+=bend*backNineGust(vergeWorld.xz)*(.055*sin(vergeTime*1.2+vergeWorld.x*.8+vergeWorld.z*.37)+.025*sin(vergeTime*2.1+vergeWorld.z));
   vec2 away=vergeWorld.xz-vergeContact.xz;float push=(1.0-smoothstep(.7,3.0,length(away)))*vergeContact.y*(1.0-mowingAmount);
   transformed.xz+=normalize(away+vec2(.001))*push*vergeTip*.35;
   transformed.y-=push*vergeTip*.22;
   vec2 laidOffset=(mowingState.gb*2.0-1.0)*vergeTip*vergeCutData.y*.62;
   transformed.xz+=laidOffset*mowingAmount;
   float laidHeight=vergeCutGround.x+.025+vergeTip*vergeCutData.y*.12+dot(laidOffset,vergeCutGround.yz);
   transformed.y=mix(transformed.y,laidHeight,mowingAmount);
  `);
  if(!software)s.fragmentShader=s.fragmentShader.replace('#include <opaque_fragment>',`
   // Preserve the illustrated leaf detail on the unlit side of crossed
   // cards. A material-coloured moon fill avoids black cut-out silhouettes.
   outgoingLight=max(outgoingLight,diffuseColor.rgb*vec3(.22,.28,.30));
   #include <opaque_fragment>`);
 };
 material.customProgramCacheKey=()=> 'back-nine-habitat-verge-v5-mowing'+(software?'-vertex-lit':'');
 const crops=[[0,100,420,475],[420,90,415,485],[835,100,419,475],[0,665,420,480],[420,665,415,480],[835,665,419,480]];
 const contactPlants=[];let stones=0,shrubPlants=0,cards=0;
 const foliage=[...DETAIL_PLANTS,...BED_FOLIAGE];
 const sweeps=PLANTING_SWEEPS.map(s=>({id:s.id,plants:DETAIL_PLANTS.filter(p=>p.cluster===s.id).length}));
 function addPlant(p,place=put){
  if(place===put)contactPlants.push(p);
  const mowingId=mowing.register(p);
  for(const turn of (p.single?[0]:[0,Math.PI/2])){
   cards++;
   const h=p.h*(turn?.82:1),g=new THREE.PlaneGeometry(p.width||h*.8,h,1,3),pos=g.attributes.position,uv=g.attributes.uv,tip=[],flex=[],colors=[],cutData=[],cutGround=[];
   const crop=crops[p.type];for(let v=0;v<pos.count;v++){const t=uv.getY(v);tip.push(t);flex.push(p.flex);colors.push(...p.tint.map(c=>c*(.68+.32*Math.sqrt(t))));pos.setZ(v,Math.sin(t*Math.PI*.7)*h*.12);uv.setXY(v,(crop[0]+uv.getX(v)*crop[2])/source.width,1-(crop[1]+(1-t)*crop[3])/source.height);}
   const cosine=Math.cos(p.turn+turn),sine=Math.sin(p.turn+turn),rootHeight=terrainHeight(p.x,p.y);
   for(let v=0;v<pos.count;v++){
    const x=p.x+pos.getX(v)*cosine+pos.getZ(v)*sine,y=p.y+pos.getX(v)*sine-pos.getZ(v)*cosine;
    const ground=terrainHeight(x,y);
    // Ground-grown leaves follow the slope across their base instead of
    // hovering on one side of a wide card. Raised planter foliage keeps its
    // authored base. Fade the correction upward to retain upright silhouettes.
    if(p.group)pos.setY(v,pos.getY(v)+(ground-rootHeight)*(1-tip[v])**2);
    cutData.push(mowingId,h);
    cutGround.push(ground,terrainHeight(x+.5,y)-terrainHeight(x-.5,y),terrainHeight(x,y-.5)-terrainHeight(x,y+.5));
   }
   g.setAttribute('vergeCutData',new THREE.Float32BufferAttribute(cutData,2));g.setAttribute('vergeCutGround',new THREE.Float32BufferAttribute(cutGround,3));
   g.setAttribute('vergeTip',new THREE.Float32BufferAttribute(tip,1));g.setAttribute('vergeFlex',new THREE.Float32BufferAttribute(flex,1));g.setAttribute('color',new THREE.Float32BufferAttribute(colors,3));g.computeVertexNormals();place(g,'plantCourse',p.x,h*.5+(p.base||0),-p.y,1,1,1,p.turn+turn);g.dispose();
  }
 }
 for(const [i,p]of foliage.entries()){
  addPlant(p);
  if(i<DETAIL_PLANTS.length&&i%31===0){const g=new THREE.IcosahedronGeometry(1,0);put(g,'stone',p.x,.045,-p.y,.16,.09,.12,p.turn);g.dispose();stones++;}
  if(i%100===0)await yieldCpuPreparation();
 }
 // Flush drainage grates and worn stone joints give maintained lanes a scale.
 let drains=0;
 for(const w of COURSE.wet){const x=w.x-w.r*.72,y=w.y+2;
  box('stone',x,.045,-y,.8,.07,.42);for(let k=0;k<6;k++)box('iron',x-.3+k*.12,.085,-y,.065,.015,.31);drains++;
 }
 // Existing pump cabinets gain service fittings rather than unrelated clutter.
 for(const p of COURSE.machinery){
  const x=p.x,z=-p.y;for(let n=0;n<3;n++){const ring=new THREE.TorusGeometry(.28+n*.035,.025,5,18);put(ring,'rubber',x-.65,1.05,z+.66);ring.dispose();}
  box('iron',x-.65,1.05,z+.72,.13,.13,.05);box('paint',x+.44,1.34,z+.59,.32,.38,.05);
  for(const a of [-1,1])box('brass',x+.44+a*.1,1.34,z+.63,.025,.23,.02);
  for(const a of [-1,1])for(const h of [.35,1.7])put(cylinder,'rust',x+a*.7,h,z+.59,.035,.04,.035);
 }
 return {contactPlants,mowing,textures:[mowing.texture],dispose(){mowing.dispose();},addPlant(p,place){addPlant(p,place);shrubPlants++;},update(run,reduced,actor,head,mower,joeLamp){mowing.update(run,reduced);for(const [light,pose,shape,power]of [[head,headDirection,headShape,headLight],[joeLamp,joeDirection,joeShape,joeHead]])if(light){direction.subVectors(light.target.position,light.position).normalize();pose.value.set(direction.x,direction.y,direction.z,Math.cos(light.angle));shape.value.set(light.distance,Math.cos(light.angle*(1-light.penumbra)));power.value.set(light.position.x,light.position.y,light.position.z,light.intensity);}if(head)headLight.value.set(head.position.x,head.position.y,head.position.z,head.intensity);if(mower)mowerLight.value.set(mower.position.x,mower.position.y,mower.position.z,mower.intensity);time.value=run.time;wind.value=1;contact.value.set(actor.x,Math.min(1,Math.abs(actor.speed)/5),-actor.y);},stats:()=>({mowing:mowing.stats(),plants:foliage.length+shrubPlants,vergePlants:DETAIL_PLANTS.length,bedPlants:BED_FOLIAGE.length,shrubPlants,cards,stones,drains,atlas:'level-one-verge',habitats:PLANTING_COUNTS,pockets:PLANTING_POCKETS.length,sweeps,wind:wind.value,windTime:time.value})};
}
