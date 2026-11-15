import {isDestructibleFeature,featureBroken,featurePose} from './course-destruction-state.js';
import {COURSE,clamp} from './back-nine-course.js';
import {terrainHeight} from './course-terrain.js';
const cameraObstacles=[...COURSE.obstacles,...COURSE.features.filter(isDestructibleFeature).map(f=>({...f,box:true}))];
// Conservative visible heights for the course's solid models. The range basin
// has an awning; other basins are low. Planted beds can contain mature trees.
export function cameraObstacleHeight(o){
 if(o.kind==='trailer')return o.id==='reservoir-trailer'?2.15:3.45;
 if(o.kind==='cistern')return o.id==='range-irrigation'?3.7:1.85;
 if(o.kind==='fallen-tree')return o.id==='clubhouse-fall'?1.8:1.2;
 if(o.kind==='pump')return o.x===34&&o.y===190?6.9:2.6;
 return {clubhouse:13.8,garage:5.3,post:3.6,windbreak:3.15,hedge:9,
  'cart-gate':2.1,'garage-bollard':1.2,'service-fence':1.9,'parked-cart':2.2}[o.kind]??Infinity;
}
// Analytic sweep: preserve the on-foot horizontal contract. Cart views pass
// world heights so a low rail or basin cannot pull a high camera into the cart.
export function runnerCameraFraction(from,to,run=null,heights=null){
 const dx=to.x-from.x,dy=to.y-from.y,length=Math.hypot(dx,dy);if(length<.001)return 1;let fraction=1;
 const pad=heights ? .3 : .18;
 for(const source of cameraObstacles){
  const o=featurePose(run,source);
  if(featureBroken(run,o))continue;
  let entry=0,exit=1;
  if(o.box){
   for(const [p,d,center,r]of [[from.x,dx,o.x,o.rx+pad],[from.y,dy,o.y,o.ry+pad]]){
    if(Math.abs(d)<.000001){if(Math.abs(p-center)>r){exit=-1;break;}continue;}
    const a=(center-r-p)/d,b=(center+r-p)/d;entry=Math.max(entry,Math.min(a,b));exit=Math.min(exit,Math.max(a,b));
   }
  }else{
   const x=from.x-o.x,y=from.y-o.y,r=o.r+pad,a=dx*dx+dy*dy,b=2*(x*dx+y*dy),c=x*x+y*y-r*r,disc=b*b-4*a*c;
   if(disc<0)continue;const root=Math.sqrt(disc);entry=Math.max(0,(-b-root)/(2*a));exit=Math.min(1,(-b+root)/(2*a));
  }
  if(entry>exit||exit<0||entry>1)continue;
  if(heights){
   const base=terrainHeight(o.x,o.y)-pad,top=terrainHeight(o.x,o.y)+cameraObstacleHeight(o)+pad,d=heights.to-heights.from;
   if(Math.abs(d)<.000001){if(heights.from<base||heights.from>top)continue;}
   else{const a=(base-heights.from)/d,b=(top-heights.from)/d;entry=Math.max(entry,Math.min(a,b));exit=Math.min(exit,Math.max(a,b));}
  }
  if(entry<=exit&&exit>=0&&entry<=1)fraction=Math.min(fraction,Math.max(0,entry-.12/length));
 }
 return clamp(fraction,0,1);
}
