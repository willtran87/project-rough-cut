import * as THREE from './vendor/three/three.module.js';
import {COURSE_GREENS} from './back-nine-landscape.js';

// Authored wear follows dry rises, abandoned verges and former working areas.
// These are material changes only: surface speed and collision stay physical.
export const TURF_CONDITION_AREAS=Object.freeze([
 ['nursery-rise',24,67,11,23,.68,.06,.18],
 ['nursery-understory',-26,76,10,21,.54,.16,-.2],
 ['old-nursery-work',11,118,10,17,.22,.52,.4],
 ['west-cistern-verge',-31,249,8,17,.26,.48,-.1],
 ['pump-waterline',-13,242,12,19,.10,.45,.2],
 ['twelfth-rise',24,273,10,19,.78,.05,.2],
 ['range-west-rough',-28,400,10,25,.83,.10,-.23],
 ['range-approach-wear',20,430,12,18,.33,.48,.3],
 ['range-crossing-wear',-3,489,11,16,.22,.48,-.35],
 ['range-waterline',12,479,10,20,.08,.44,-.15],
 ['range-high-bank',25,521,12,25,.78,.06,.16],
 ['range-exit-rough',-27,572,10,22,.81,.12,-.25],
 ['clubhouse-east-rough',22,600,12,25,.69,.08,.3],
 ['staff-walk-verge',-31,653,8,24,.23,.51,-.15],
 ['clubhouse-hollow',-10,691,11,22,.22,.47,.3],
 ['clubhouse-rise',23,730,12,24,.74,.07,-.3],
 ['old-garage-work',13,771,10,18,.24,.51,.2]
].map(([id,x,y,rx,ry,dry,thin,angle])=>Object.freeze({id,x,y,rx,ry,dry,thin,sin:Math.sin(angle),cos:Math.cos(angle)})));

const smooth=(a,b,x)=>{const t=Math.max(0,Math.min(1,(x-a)/(b-a)));return t*t*(3-2*t);};
export function turfConditionAt(x,y,out={dry:0,thin:0}){
 let dry=0,thin=0;
 for(const p of TURF_CONDITION_AREAS){
  if(Math.abs(y-p.y)>p.ry+p.rx+2||Math.abs(x-p.x)>p.rx+p.ry+2)continue;
  const dx=x-p.x,dz=y-p.y;
  const u=(dx*p.cos-dz*p.sin+.9*Math.sin(y*.29)+.5*Math.sin(y*.71+x*.21))/p.rx;
  const v=(dx*p.sin+dz*p.cos+.7*Math.sin(x*.37+y*.11))/p.ry,d=Math.hypot(u,v);
  if(d>=1)continue;
  const islands=.72+.28*smooth(-.5,.8,.6*Math.sin(x*.53+Math.cos(y*.28))+.4*Math.cos(y*.43-x*.17));
  const weight=(1-smooth(.32,1,d))*islands;
  dry=Math.max(dry,p.dry*weight);thin=Math.max(thin,p.thin*weight);
 }
 // Keep the full irregular putting fringe healthy, on every overlapping
 // ground layer. The collar fades by world position rather than mesh seams.
 let kept=1;
 for(const g of COURSE_GREENS)kept=Math.min(kept,smooth(1.4,1.65,Math.hypot((x-g.x)/g.rx,(y-g.y)/g.ry)));
 const sum=dry+thin,scale=kept*(sum>.9?.9/sum:1);out.dry=dry*scale;out.thin=thin*scale;return out;
}

export const TURF_CONDITION_FIELD=Object.freeze({width:168,height:1676,xMin:-42,yMin:-1,texelsPerMeter:2});
export function createTurfConditionField(){
 const {width,height,xMin,yMin,texelsPerMeter}=TURF_CONDITION_FIELD,data=new Uint8Array(width*height*2),sample={dry:0,thin:0};
 for(let row=0;row<height;row++)for(let col=0;col<width;col++){
  const x=xMin+(col+.5)/texelsPerMeter,y=yMin+(row+.5)/texelsPerMeter;turfConditionAt(x,y,sample);
  const edge=Math.min(smooth(0,2,col),smooth(0,2,width-1-col),smooth(0,2,row),smooth(0,2,height-1-row));
  const i=(row*width+col)*2;data[i]=Math.round(sample.dry*edge*255);data[i+1]=Math.round(sample.thin*edge*255);
 }
 const map=new THREE.DataTexture(data,width,height,THREE.RGFormat,THREE.UnsignedByteType);
 map.name='Back Nine authored turf condition';map.magFilter=map.minFilter=THREE.LinearFilter;
 map.generateMipmaps=false;map.wrapS=map.wrapT=THREE.ClampToEdgeWrapping;map.needsUpdate=true;return map;
}

// All ground layers sample one fixed world field. Different triangulations
// of fairways, flood sheets and moving scars cannot produce blend seams.
// The two detail-map reads occur only where the field needs that material.
export function finishTurfCondition(material,dryMap,soilMap,field,expression='texture2D(map,vMapUv).rgb'){
 const previous=material.onBeforeCompile,key=material.customProgramCacheKey.bind(material);
 material.onBeforeCompile=shader=>{
  previous(shader);
  if(!shader.fragmentShader.includes(expression))throw new Error('Missing turf material sample for condition finish');
  shader.uniforms.dryTurfMap={value:dryMap};shader.uniforms.thinTurfSoilMap={value:soilMap};
  shader.uniforms.turfConditionField={value:field};
  shader.vertexShader='varying vec2 vTurfConditionMeters;\n'+shader.vertexShader;
  shader.vertexShader=shader.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\nvTurfConditionMeters=(modelMatrix*vec4(transformed,1.0)).xz;');
  shader.fragmentShader=shader.fragmentShader.replace(expression,`conditionedTurf(${expression})`);
  shader.fragmentShader=`uniform sampler2D dryTurfMap;uniform sampler2D thinTurfSoilMap;uniform sampler2D turfConditionField;
   varying vec2 vTurfConditionMeters;
   vec3 conditionedTurf(vec3 base){
    vec2 w=texture2D(turfConditionField,(vec2(vTurfConditionMeters.x,-vTurfConditionMeters.y)+vec2(42.0,1.0))/vec2(84.0,838.0)).rg;
    if(w.x+w.y<.001)return base;
    vec3 surface=base*(1.0-w.x-w.y);
    if(w.x>.001)surface+=texture2D(dryTurfMap,vTurfConditionMeters/4.4).rgb*w.x;
    if(w.y>.001)surface+=texture2D(thinTurfSoilMap,vTurfConditionMeters/4.0).rgb*w.y;
    return surface;
   }\n`+shader.fragmentShader;
 };
 material.customProgramCacheKey=()=>key()+'-authored-turf-condition-v1';
}
