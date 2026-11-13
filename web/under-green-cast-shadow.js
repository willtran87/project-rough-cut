import {clamp,sightClear} from './under-green-course.js';
import {joeCouldBeSeen} from './under-green-unseen.js';

// Authored open floor receivers, clear of the root pillar, consoles, channels
// and buttresses. Their edges fade inside the enclosing masonry footprint.
export const JOE_SHADOW_BAYS=Object.freeze([
 {id:'entrance',lamp:{x:-2.6,y:8},receiver:{minX:-4.55,maxX:4.55,minY:1.1,maxY:13.4},centre:{x:0,y:8},extent:{x:2,y:3.2}},
 {id:'spillway-landing',lamp:{x:2.6,y:56},receiver:{minX:-4.55,maxX:4.55,minY:53.35,maxY:59.65},centre:{x:0,y:56.8},extent:{x:2,y:2.5}},
 {id:'bunker-bank',lamp:{x:-22.6,y:54},receiver:{minX:-23.55,maxX:-15.45,minY:50.85,maxY:55.05},centre:{x:-21.1,y:53.6},extent:{x:1.4,y:1.2}},
]);
const smooth=x=>{x=clamp(x,0,1);return x*x*(3-2*x);};
export function joeShadowBay(run){
 const j=run.joe;
 if(j.phase==='absent'||j.phase==='enter'||(j.paceScale||1)>1.001||j.speed>2.101||!joeCouldBeSeen(run))return null;
 for(const bay of JOE_SHADOW_BAYS){
  const x=Math.abs(j.x-bay.centre.x)/bay.extent.x,y=Math.abs(j.y-bay.centre.y)/bay.extent.y;
  const weight=smooth((1-x)/.3)*smooth((1-y)/.3);
  if(weight>0&&sightClear({...bay.lamp,eyeHeight:2.8},{...j,eyeHeight:1.2},run.gate))return {bay,weight};
 }
 return null;
}
export function projectJoeShadow(point,light,height=.007){
 const t=(height-light.height)/(point.height-light.height);
 return {x:light.x+(point.x-light.x)*t,y:light.y+(point.y-light.y)*t,height};
}
