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
 let x,y,height,vx,vy,vh,width,length,alpha;
 if(!splash){
  const p=jetPoint(jet,t),spread=(.008+Math.pow(t,1.8)*.34)*seed.spread;
  x=p.x+Math.cos(seed.angle)*spread;y=p.y+Math.sin(seed.angle)*spread;
  height=p.height+(impactHeight-.12)*t*t+Math.sin(seed.angle*1.7)*spread*.16*Math.sin(Math.PI*t);
  vx=2*((1-t)*(jet.control.x-jet.start.x)+t*(jet.end.x-jet.control.x));
  vy=2*((1-t)*(jet.control.y-jet.start.y)+t*(jet.end.y-jet.control.y));
  vh=2*((1-t)*(jet.control.height-jet.start.height)+t*(jet.end.height-jet.control.height))+2*t*(impactHeight-.12);
  // A few short ligaments at the lip become rounded droplets downstream.
  // Low-frequency pressure variation groups the stream without rigid beads.
  const ligament=seed.spread>.72?(1-t)*(1-t):0;
  width=seed.size*(.015+seed.spread*.007);
  length=seed.size*(.018+ligament*.036+(1-t)*.009);
  const emitted=time-t/seed.rate,pulse=.72+.28*Math.sin(emitted*8.7+jet.start.y*1.9+jet.start.x)**2;
  alpha=fade*pulse*(.66+seed.spread*.24);
 }else{
  // Gravity-driven fan at the actual jet landing; follows incoming momentum.
  const dx=jet.end.x-jet.control.x,dy=jet.end.y-jet.control.y,d=Math.hypot(dx,dy)||1;
  vx=dx/d*(.35+seed.spread*.65)+Math.cos(seed.angle)*.55;
  vy=dy/d*(.35+seed.spread*.65)+Math.sin(seed.angle)*.55;
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
