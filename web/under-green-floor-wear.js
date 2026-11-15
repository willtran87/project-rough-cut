import {rangeY} from './under-green-layout.js';

// Historical use, not a route hint: both timed channels and their maintenance
// bypasses are worn. These interrupted, broad patches describe traffic without
// adding bright lines or changing movement. Coordinates are course metres.
export const DRAIN_FLOOR_WEAR=Object.freeze([
 {id:'gallery',width:.85,points:[[.35,2],[-.2,10],[.45,18],[-.3,30],[.3,38],[0,54],[.1,73]]},
 {id:'north-service',width:.72,points:[[0,57],[9.7,57],[10.1,71.7],[0,72.7],[-19.6,73]]},
 {id:'bunker-channel',width:.8,points:[[-19.6,73],[-20.2,65],[-19.8,54],[-20.2,46],[-20,41.5],[-23.1,40]]},
 {id:'bunker-walk',width:.65,points:[[-20,70],[-29.7,70],[-30.1,63],[-29.8,54],[-20,54]]},
 {id:'pump-service',width:.9,points:[[-23.1,40],[-20,40],[-11,40],[-1,40],[11.8,38]]},
 {id:'door',width:.54,points:[[-5.35,45],[-5.1,41.5],[-2,40]]},
 {id:'range-channel',width:.8,points:[[12,38],[11.8,rangeY(29)],[12.15,rangeY(18)],[12,rangeY(2)]]},
 {id:'range-walk',width:.65,points:[[12,38],[21,38],[21,rangeY(13)],[12,rangeY(13)]]},
 {id:'range-landing',width:.6,points:[[12,rangeY(23.5)],[21,rangeY(23.5)]]},
]);

export function paintDrainFloorWear(polygon){
 let patches=0;
 for(const [index,path]of DRAIN_FLOOR_WEAR.entries()){
  let distance=0;
  for(let segment=1;segment<path.points.length;segment++){
   const a=path.points[segment-1],b=path.points[segment],dx=b[0]-a[0],dy=b[1]-a[1],length=Math.hypot(dx,dy),nx=-dy/length,ny=dx/length;
   const steps=Math.ceil(length/.3);
   for(let i=0;i<steps;i++){
    const t0=i/steps,t1=(i+1)/steps,d=distance+(t0+t1)*length/2;
    const fade=.28+.72*Math.pow(.5+.5*Math.sin(d*1.27+index*1.83),2);
    const radius=path.width*(.8+.2*Math.sin(d*.73+index));
    // Nested low-contrast margins avoid a sharp stripe. Individual sections
    // share endpoints, so a bend cannot leave a repeated chain of discs.
    for(const [scale,power]of [[1.45,32],[1,72],[.52,105]]){
     const points=[[t0,-1],[t1,-1],[t1,1],[t0,1]].map(([t,side])=>[a[0]+dx*t+nx*radius*scale*side,a[1]+dy*t+ny*radius*scale*side]);
     polygon(3,points,Math.round(power*fade));
    }
    patches++;
   }
   distance+=length;
  }
 }
 return {paths:DRAIN_FLOOR_WEAR.length,patches,maximumStrength:105/255};
}
