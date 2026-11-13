import {isDestructibleFeature,featureBroken,featurePose} from './course-destruction-state.js';
import {COURSE,clamp} from './back-nine-course.js';
const cameraObstacles=[...COURSE.obstacles,...COURSE.features.filter(isDestructibleFeature).map(f=>({...f,box:true}))];
// Analytic camera sweep: discrete sight samples can skip a thin fence. Keep
// the camera on the player's side of solids without changing player movement.
export function runnerCameraFraction(from,to,run=null){
 const dx=to.x-from.x,dy=to.y-from.y,length=Math.hypot(dx,dy);if(length<.001)return 1;let fraction=1;
 for(const source of cameraObstacles){
  const o=featurePose(run,source);
  if(featureBroken(run,o))continue;
  let entry=0,exit=1;
  if(o.box){
   for(const [p,d,center,r]of [[from.x,dx,o.x,o.rx+.18],[from.y,dy,o.y,o.ry+.18]]){
    if(Math.abs(d)<.000001){if(Math.abs(p-center)>r){exit=-1;break;}continue;}
    const a=(center-r-p)/d,b=(center+r-p)/d;entry=Math.max(entry,Math.min(a,b));exit=Math.min(exit,Math.max(a,b));
   }
   if(entry<=exit&&exit>=0&&entry<=1)fraction=Math.min(fraction,Math.max(0,entry-.12/length));
  }else{
   const x=from.x-o.x,y=from.y-o.y,r=o.r+.18,a=dx*dx+dy*dy,b=2*(x*dx+y*dy),c=x*x+y*y-r*r,disc=b*b-4*a*c;
   if(disc<0)continue;const t=(-b-Math.sqrt(disc))/(2*a);if(t>=0&&t<=1)fraction=Math.min(fraction,Math.max(0,t-.12/length));
  }
 }
 return clamp(fraction,0,1);
}
