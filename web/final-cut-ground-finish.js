import * as THREE from './vendor/three/three.module.js';
import * as Art from './pixel-art.js';
import {GROUND_SLABS} from './final-cut-ground-layout.js';
import {REFUGES} from './final-cut-course.js';
import {foundationBedWeight} from './final-cut-foundation-layout.js';
import {TURF_RANGE,TURF_CONDITION_PATCHES,turfConditionAt} from './final-cut-turf-layout.js';

const clamp=v=>Math.max(0,Math.min(1,v));
const fade=(distance,width)=>{const t=clamp(1-distance/width);return t*t*(3-2*t);};
const paths=GROUND_SLABS.filter(s=>['path','gravel'].includes(s.material));
const range={left:-46,bottom:-20,width:92,depth:136};
function distanceToSlab(x,y,s){
 const c=Math.cos(s.yaw||0),sn=Math.sin(s.yaw||0),dx=x-s.x,dy=y-s.y;
 const a=Math.abs(dx*c-dy*sn)-s.w/2,b=Math.abs(dx*sn+dy*c)-s.d/2;
 return Math.hypot(Math.max(a,0),Math.max(b,0))+Math.min(Math.max(a,b),0);
}
// Static maintenance wear, not evidence of a live mower pass. The material
// masks describe existing slab margins, planted beds and refuge foundations.
export function groundFinishAt(x,y){
 let gravel=0,soil=0,litter=0,curb=0;
 const edge=.05*Math.sin(x*7.1+y*3.7)+.035*Math.sin(y*8.3-x*2.3);
 for(const s of paths){
  if(s.id.startsWith('service-')&&Math.abs(y-s.y)<s.d/2-.3){
   // Flush buried edging lives on the existing gravel slab, with narrow
   // gravel-filled joints. It creates no additional step or collision.
   const across=(x-s.x)*Math.sign(s.x),joint=(y+20)% .93;
   if(joint<.895)curb=Math.max(curb,fade(Math.abs(across-1.08),.095)*.94);
  }
  const d=distanceToSlab(x,y,s),width=s.material==='gravel'?.62:.38;
  if(d<-.13||d>width+.1)continue;
  const border=fade(Math.max(0,d+edge),width)*clamp((d+.13)/.13);
  if(s.material==='gravel')gravel=Math.max(gravel,border*.9);
  else soil=Math.max(soil,border*.65);
 }
 for(const s of REFUGES){
  const dx=x-s.x,dy=y-s.y;
  // The east doorway keeps its worn apron; closed-wall beds are authored
  // separately and share their exact centres with the planted crowns.
  const apron=fade(Math.hypot((dx-s.w/2-.4)/1.2,dy/1.45),1);
  soil=Math.max(soil,apron*.6);
 }
 litter=Math.max(litter,foundationBedWeight(x,y));
 if(y>3&&y<96){
  const bed=fade(Math.abs(Math.abs(x)-25.25)+edge,1.0);
  litter=Math.max(litter,bed*(.58+.32*Math.sin(y*.63)**2));
 }
 return [gravel,soil,litter,curb];
}

export function finishFinalCutGround(materials){
 const width=512,height=768,data=new Uint8Array(width*height*4);
 let covered=0;
 for(let row=0;row<height;row++)for(let col=0;col<width;col++){
  const values=groundFinishAt(range.left+(col+.5)/width*range.width,range.bottom+(row+.5)/height*range.depth),offset=(row*width+col)*4;
  values.forEach((v,i)=>data[offset+i]=Math.round(v*255));if(values.some(v=>v>.05))covered++;
 }
 const mask=new THREE.DataTexture(data,width,height,THREE.RGBAFormat);mask.minFilter=mask.magFilter=THREE.LinearFilter;mask.needsUpdate=true;
 const turfWidth=256,turfHeight=512,turfData=new Uint8Array(turfWidth*turfHeight*4);let conditioned=0;
 for(let row=0;row<turfHeight;row++)for(let col=0;col<turfWidth;col++){
  const values=turfConditionAt(TURF_RANGE.left+(col+.5)/turfWidth*TURF_RANGE.width,TURF_RANGE.bottom+(row+.5)/turfHeight*TURF_RANGE.depth),offset=(row*turfWidth+col)*4;
  values.forEach((v,i)=>turfData[offset+i]=Math.round(v*255));turfData[offset+3]=255;if(values.some(v=>v>.05))conditioned++;
 }
 const turfMask=new THREE.DataTexture(turfData,turfWidth,turfHeight,THREE.RGBAFormat);turfMask.minFilter=turfMask.magFilter=THREE.LinearFilter;turfMask.needsUpdate=true;
 const gravel=Art.texture('final-cut-ground-materials-v1',[0,512,512,512],null,true);
 const litter=Art.texture('final-cut-ground-materials-v1',[1024,512,512,512],null,true);
 const soil=Art.texture('final-cut-ground-materials-v1',[1024,0,512,512],null,true);
 for(const name of ['grass','stripe','rough','path','gravel']){
  const material=materials[name],prior=material.onBeforeCompile,key=material.customProgramCacheKey(),turf=['grass','stripe','rough'].includes(name);
  material.onBeforeCompile=shader=>{
   prior(shader);Object.assign(shader.uniforms,{finalGroundMask:{value:mask},finalGroundGravel:{value:gravel},finalGroundLitter:{value:litter},finalGroundSoil:{value:soil},finalTurfMask:{value:turfMask}});
   shader.vertexShader='varying vec3 vFinalGround;\n'+shader.vertexShader;
   shader.vertexShader=shader.vertexShader.replace('#include <begin_vertex>',`#include <begin_vertex>
    vec4 groundPoint=vec4(position,1.0);
    #ifdef USE_INSTANCING
     groundPoint=instanceMatrix*groundPoint;
    #endif
    vFinalGround=(modelMatrix*groundPoint).xyz;`);
   shader.fragmentShader='varying vec3 vFinalGround; uniform sampler2D finalGroundMask, finalGroundGravel, finalGroundLitter, finalGroundSoil;\n'+(turf?'uniform sampler2D finalTurfMask;\n':'')+shader.fragmentShader;
   // Apply after the chapter's material correction, before light evaluation.
   // Elevated roofs/decks using the same path material never inherit bed dirt.
   shader.fragmentShader=shader.fragmentShader.replace('#include <alphamap_fragment>',`
    if(vFinalGround.y<.18){
     vec2 groundXY=vec2(vFinalGround.x,-vFinalGround.z);
     ${turf?`if(groundXY.x>=-24.0&&groundXY.x<=24.0&&groundXY.y>=4.0&&groundXY.y<=100.0){
      vec3 condition=texture2D(finalTurfMask,(groundXY-vec2(-24.0,4.0))/vec2(48.0,96.0)).rgb;
      diffuseColor.rgb*=mix(vec3(1.0),vec3(1.65,1.12,.65),condition.r);
      diffuseColor.rgb*=mix(vec3(1.0),vec3(.59,.79,.83),condition.g);
      if(condition.b>.004){
       vec3 wornEarth=pow(texture2D(finalGroundSoil,vFinalGround.xz/1.35).rgb*vec3(.80,.83,.78),vec3(.7));
       diffuseColor.rgb=mix(diffuseColor.rgb,wornEarth,condition.b);
      }
     }`:''}
     vec2 maskUv=(groundXY-vec2(-46.0,-20.0))/vec2(92.0,136.0);
     vec4 weights=texture2D(finalGroundMask,maskUv);
     if(max(max(weights.r,weights.a),max(weights.g,weights.b))>.004){
      vec3 gravelTex=pow(texture2D(finalGroundGravel,vFinalGround.xz/3.2).rgb*vec3(.59,.57,.49),vec3(.7));
      vec3 dirtTex=pow(texture2D(finalGroundSoil,vFinalGround.xz/1.35).rgb*vec3(.80,.83,.78),vec3(.7));
      vec3 leafTex=pow(texture2D(finalGroundLitter,vFinalGround.xz/1.9).rgb*vec3(.57,.61,.48),vec3(.7));
      diffuseColor.rgb=mix(diffuseColor.rgb,gravelTex,weights.r);
      diffuseColor.rgb=mix(diffuseColor.rgb,dirtTex,weights.g);
      diffuseColor.rgb=mix(diffuseColor.rgb,leafTex,weights.b);
      vec3 curbTex=vec3(dot(gravelTex,vec3(.2126,.7152,.0722)))*vec3(1.08,1.06,.98);
      diffuseColor.rgb=mix(diffuseColor.rgb,curbTex,weights.a);
     }
    }
    #include <alphamap_fragment>`);
  };
  material.customProgramCacheKey=()=>key+'-ground-margins-turf-3';
 }
 return {stats:()=>({mask:[width,height],maskBytes:data.byteLength,paths:paths.length,refuges:REFUGES.length,coveredTexels:covered,turfMask:[turfWidth,turfHeight],turfMaskBytes:turfData.byteLength,turfPatches:TURF_CONDITION_PATCHES.length,turfConditionedTexels:conditioned,soilSource:'ground-earth',physicalHeightChange:0,liveTireMarks:false}),dispose(){mask.dispose();turfMask.dispose();}};
}
