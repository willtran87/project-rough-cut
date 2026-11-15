import {jetPoint} from './under-green-flow.js';

// World-clock samples: turning away never restarts a jet or impact cloud.
const random=n=>{const v=Math.sin(n*127.1+71.7)*43758.5453;return v-Math.floor(v);};
const fract=n=>n-Math.floor(n);
export function spraySeed(i){return {phase:random(i+1),angle:random(i+53)*Math.PI*2,size:.55+random(i+9)*.85,rate:1.15+random(i+27)*.8,spread:random(i+90),lod:random(i+114)};}

// Keep the shaded core from disappearing below a pixel at small render targets.
// This changes only the billboard footprint, with strict world-size caps.
// It adds neither emissive light nor a brightness compensation that shimmers.
export function sprayFootprint(width,length,depth,projectionY,renderHeight){
 const pixelWorld=2*Math.max(0,depth)/Math.max(1,projectionY*renderHeight);
 return Math.max(1,Math.min(2.8,.065/width,.10/length,Math.max(1,2.5*pixelWorld/width)));
}

export function sprayDrop(jet,seed,time,impactHeight,splash=false){
 const t=fract(time*seed.rate+seed.phase),fade=Math.min(1,t*16,(1-t)*10);
 // A packet keeps its launch direction for its entire flight. Only a hidden
 // lifetime wrap changes the next packet; camera turns cannot reseed it.
 const emitted=time-t/seed.rate,packet=emitted*2.17+jet.start.y*1.9+jet.start.x*.73;
 const angle=seed.angle+Math.sin(packet)*.85;
 let x,y,height,vx,vy,vh,width,length,alpha;
 if(!splash){
  const p=jetPoint(jet,t),dx=jet.end.x-jet.start.x,dy=jet.end.y-jet.start.y,d=Math.hypot(dx,dy)||1;
  const axisX=dx/d,axisY=dy/d;
  // Narrow at the real nozzle, then a broad, uneven breakup envelope. The
  // central jet remains readable; satellite drops do not line up as beads.
  const spread=(.008+t*t*.46)*seed.spread,spreadRate=.92*t*seed.spread;
  const sway=Math.sin(packet*1.37)*.12,arch=Math.sin(Math.PI*t),archRate=Math.PI*Math.cos(Math.PI*t);
  const across=Math.sin(angle)*spread+sway*arch;
  const acrossRate=Math.sin(angle)*spreadRate+sway*archRate;
  const along=Math.cos(angle)*spread*.26,alongRate=Math.cos(angle)*spreadRate*.26;
  const lift=Math.sin(angle*1.7)*.065*seed.spread;
  x=p.x-axisY*across+axisX*along;y=p.y+axisX*across+axisY*along;
  height=p.height+(impactHeight-.12)*t*t+lift*arch;
  vx=2*((1-t)*(jet.control.x-jet.start.x)+t*(jet.end.x-jet.control.x))-axisY*acrossRate+axisX*alongRate;
  vy=2*((1-t)*(jet.control.y-jet.start.y)+t*(jet.end.y-jet.control.y))+axisX*acrossRate+axisY*alongRate;
  vh=2*((1-t)*(jet.control.height-jet.start.height)+t*(jet.end.height-jet.control.height))+2*t*(impactHeight-.12)+lift*archRate;
  // Intermittent short filaments tear into smaller round drops, rather than
  // giving every particle the same pale circular silhouette.
  const ligament=seed.spread>.68?(1-t)*(1-t):0;
  width=seed.size*(.011+seed.spread*.011);
  length=seed.size*(.017+ligament*.039+(1-t)*.008);
  const pulse=.68+.32*Math.sin(packet*2.1)**2;
  alpha=fade*pulse*(.48+seed.spread*.42);
 }else{
  // Gravity-driven fan at the actual jet landing; follows incoming momentum.
  const dx=jet.end.x-jet.control.x,dy=jet.end.y-jet.control.y,d=Math.hypot(dx,dy)||1;
  vx=dx/d*(.35+seed.spread*.65)+Math.cos(angle)*.55;
  vy=dy/d*(.35+seed.spread*.65)+Math.sin(angle)*.55;
  const launch=.85+seed.spread*1.25,age=t*2*launch/9.8;
  x=jet.end.x+vx*age;y=jet.end.y+vy*age;
  height=impactHeight+launch*age-4.9*age*age;vh=launch-9.8*age;
  width=seed.size*.018;length=seed.size*(.017+Math.abs(vh)*.009);
  alpha=fade*(1-t*.35)*.86;
 }
 return {x,y,height,vx,vy,vh,width,length,alpha,t};
}

export function impactCloud(jet,index,time,impactHeight){
 const phase=fract(time*(.56+random(index+17)*.18)+random(index+4));
 const direction=Math.sign(jet.end.x-jet.control.x),travel=phase*.24;
 return {x:jet.end.x+direction*travel,y:jet.end.y+Math.sin(index*2.399)*travel*.6,
  height:impactHeight+.09+phase*.13,width:.23+phase*.43,tall:.12+phase*.20,
  alpha:Math.sin(Math.PI*phase)**2*.65,phase};
}
