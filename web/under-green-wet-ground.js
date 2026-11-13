// Authored in course metres (+y north). These centimetre-deep cosmetic pools
// are separate from the timed channel hazards and never change movement.
export const SHALLOW_WATER_HEIGHT=.012;
function poolOutline(points){
 const outline=[];
 for(let i=0;i<points.length;i++)for(let k=0;k<8;k++){
  const t=k/8,p0=points[(i+points.length-1)%points.length],p1=points[i],p2=points[(i+1)%points.length],p3=points[(i+2)%points.length];
  // Smooth the hand-authored lobes, then keep millimetre-scale irregularity
  // on the same physical pixel grid used by the surface shader.
  const p=[0,1].map(axis=>.5*(2*p1[axis]+(-p0[axis]+p2[axis])*t+(2*p0[axis]-5*p1[axis]+4*p2[axis]-p3[axis])*t*t+(-p0[axis]+3*p1[axis]-3*p2[axis]+p3[axis])*t*t*t));
  outline.push(p.map((v,axis)=>Math.round((v+Math.sin(i*8+k*1.7+axis*2)*.008)*128)/128));
 }
 return outline;
}
export const DRAIN_PUDDLES=[
 {id:'gallery-leak',clumps:3,points:[[-2.77,11.53],[-2.36,11.17],[-1.91,11.36],[-1.68,11.78],[-1.83,12.12],[-1.71,12.39],[-2.07,12.68],[-2.45,12.72],[-2.78,12.47],[-2.87,12.04]]},
 {id:'crossing-runoff',clumps:1,points:[[.99,19.83],[1.22,19.55],[1.69,19.51],[2.13,19.75],[2.16,20.02],[1.83,20.21],[1.51,20.14],[1.26,20.24],[1.04,20.08]]},
 {id:'bunker-seep',clumps:4,points:[[-31.39,60.01],[-31.06,59.83],[-30.67,60.12],[-30.57,60.48],[-30.71,60.83],[-30.59,61.21],[-30.9,61.51],[-31.31,61.29],[-31.52,60.91],[-31.43,60.47]]},
 {id:'pump-spill',clumps:2,points:[[-24.88,44.71],[-24.53,44.48],[-24.12,44.6],[-23.72,44.63],[-23.64,44.93],[-23.99,45.12],[-24.3,45.2],[-24.69,45.09]]},
 {id:'range-seep',clumps:2,points:[[21.76,29.03],[22.12,29.18],[22.31,29.62],[22.23,30.01],[22.36,30.35],[22.11,30.73],[21.8,30.8],[21.54,30.45],[21.62,30.11],[21.48,29.77],[21.57,29.36]]},
 {id:'keeper-seep',clumps:1,points:[[7.81,12.03],[8.14,11.87],[8.54,11.99],[8.77,12.27],[8.55,12.51],[8.22,12.69],[7.92,12.49],[7.73,12.29]]},
].map(p=>({...p,points:poolOutline(p.points)}));
export const DRAIN_RUNNELS=[
 {id:'gallery-drainage',width:.075,points:[[-2.45,12.7],[-2.44,15.8],[-2.3,19.4],[-2.3,21.3]]},
 {id:'pump-drainage',width:.09,points:[[-24.3,45.17],[-23.3,45.3],[-22.8,46.8],[-20.8,47.7]]},
];

export function insideWetPolygon(point,points){
 let inside=false;
 for(let i=0,j=points.length-1;i<points.length;j=i++){
  const [xi,yi]=points[i],[xj,yj]=points[j];
  if(((yi>point.y)!==(yj>point.y))&&point.x<(xj-xi)*(point.y-yi)/(yj-yi)+xi)inside=!inside;
 }
 return inside;
}

// Mitered continuous strips avoid overlapping transparent segment rectangles.
export function runnelPolygon(runnel,scale=1){
 const sides=[[],[]],p=runnel.points;
 for(let i=0;i<p.length;i++){
  const a=p[Math.max(0,i-1)],b=p[i],c=p[Math.min(p.length-1,i+1)];
  const normal=(from,to)=>{const dx=to[0]-from[0],dy=to[1]-from[1],l=Math.hypot(dx,dy)||1;return [-dy/l,dx/l];};
  const before=i?normal(a,b):normal(b,c),after=i<p.length-1?normal(b,c):before;
  let nx=before[0]+after[0],ny=before[1]+after[1],length=Math.hypot(nx,ny)||1;nx/=length;ny/=length;
  const reach=runnel.width*.5*scale/Math.max(.5,nx*after[0]+ny*after[1]);
  for(const [index,sign]of [[0,1],[1,-1]])sides[index].push([b[0]+nx*reach*sign,b[1]+ny*reach*sign]);
 }
 return [...sides[0],...sides[1].reverse()];
}
export const DRAIN_SHALLOW_PATCHES=[...DRAIN_PUDDLES,...DRAIN_RUNNELS.map(r=>({id:r.id,points:runnelPolygon(r)}))];
export function shallowWaterHeight(point){return DRAIN_SHALLOW_PATCHES.some(p=>insideWetPolygon(point,p.points))?SHALLOW_WATER_HEIGHT:null;}

// Faded historical traces, not route guidance. The service door is Joe's
// physical entrance; short, incomplete trails never mark a safe crossing.
export const DRAIN_BOOT_TRACES=[
 ...Array.from({length:5},(_,i)=>({x:-5.35+(i%2?-.12:.12)+i*.07,y:43.5-i*.43,yaw:-.1,fade:.31-i*.032})),
 {x:-24.8,y:56.88,yaw:.7,fade:.24},{x:-24.65,y:57.22,yaw:.9,fade:.16},
 {x:8.9,y:13.3,yaw:2.7,fade:.2},{x:9.19,y:13.57,yaw:2.8,fade:.12},
];
export const DRAIN_SCYTHE_SCORES=[
 {x:-4.65,y:41.25,radius:.69,start:.2,end:2.35},
 {x:-23.75,y:38.79,radius:.51,start:.12,end:2.2},
];
