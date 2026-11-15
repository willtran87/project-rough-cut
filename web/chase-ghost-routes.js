import {COURSE,blocked} from './back-nine-course.js';

export const COURSE_GHOSTS=[{x:20,y:76},{x:-23,y:181},{x:21,y:320},{x:-27,y:408},{x:24,y:554},{x:-19,y:696}];
const clear=p=>!blocked(p,.7)&&!COURSE.features.some(f=>Math.abs(p.x-f.x)<f.rx+.8&&Math.abs(p.y-f.y)<f.ry+.8);
// Choose a clear mowing loop once. Distance along the loop drives the boots
// and mower wheels; neither the camera nor rendering frequency moves a ghost.
export const GHOST_ROUTES=COURSE_GHOSTS.map((site,index)=>{
 for(const scale of [1,.8,.6])for(const [dx,dy]of [[0,0],[5,0],[-5,0],[0,7],[0,-7],[7,7],[-7,-7]]){
  const points=Array.from({length:129},(_,i)=>{const a=i/128*Math.PI*2;return {x:site.x+dx+Math.cos(a)*3.8*scale,y:site.y+dy+Math.sin(a)*8*scale};});
  if(!points.every(clear))continue;
  let length=0;points.forEach((p,i)=>{if(i)length+=Math.hypot(p.x-points[i-1].x,p.y-points[i-1].y);p.distance=length;});
  return {index,points,length,speed:1.1+index%3*.16};
 }
 throw new Error('No clear ghost mowing loop at '+index);
});
export function ghostRoutePose(index,time){
 const r=GHOST_ROUTES[index],travel=Math.max(0,time)*r.speed+index*6,d=travel%r.length;
 let i=1;while(i<r.points.length-1&&r.points[i].distance<d)i++;
 const a=r.points[i-1],b=r.points[i],t=(d-a.distance)/(b.distance-a.distance),dx=b.x-a.x,dy=b.y-a.y;
 // Ellipse tangent gives continuous turning instead of snapping at waypoints.
 const angle=((i-1+t)/128)*Math.PI*2;
 return {x:a.x+dx*t,y:a.y+dy*t,yaw:Math.atan2(-3.8*Math.sin(angle),8*Math.cos(angle)),travel,speed:r.speed,phase:(travel/1.18)%1};
}
