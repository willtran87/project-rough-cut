import {barrierFootprint} from './chase-barriers.js';
import {hullOverlap} from './vehicle-contact.js';
import {isDestructibleFeature,featureBroken,featurePose} from './course-destruction-state.js';
import {COURSE,blocked} from './back-nine-course.js';

const ejectionObstacles=[...COURSE.obstacles,...COURSE.features.filter(isDestructibleFeature).map(f=>({...f,box:true}))];
// Ejection crosses only a few metres, but coarse sight/navigation samples can
// step over a thin post. Test the whole ground corridor against the same
// expanded boxes/circles used by the runner. Runs only when choosing a landing.
export function ejectionPathClear(a,b,r=.32,run=null){
 if(blocked(a,r)||blocked(b,r))return false;
 // The airborne exit may clear a low rail, but its landing must not start
 // inside a closed or partly opened gate. Use the current leaf angle.
 if(run?.courseFX)for(let i=0;i<COURSE.hurdles.length;i++){
  const state=run.courseFX.breaks[i];if(state?.age<0&&hullOverlap(b,'foot',barrierFootprint(COURSE.hurdles[i],state),'feature'))return false;
 }

 const dx=b.x-a.x,dy=b.y-a.y,length2=dx*dx+dy*dy;
 if(length2===0)return true;
 const left=Math.min(a.x,b.x),right=Math.max(a.x,b.x),bottom=Math.min(a.y,b.y),top=Math.max(a.y,b.y);
 for(const source of ejectionObstacles){
  const o=featurePose(run,source);
  if(featureBroken(run,o))continue;
  const rx=(o.box?o.rx:o.r)+r,ry=(o.box?o.ry:o.r)+r;
  if(right<=o.x-rx||left>=o.x+rx||top<=o.y-ry||bottom>=o.y+ry)continue;
  if(!o.box){
   const t=Math.max(0,Math.min(1,((o.x-a.x)*dx+(o.y-a.y)*dy)/length2));
   if((a.x+dx*t-o.x)**2+(a.y+dy*t-o.y)**2<rx*rx)return false;
   continue;
  }
  let enter=0,exit=1;
  if(dx===0){if(a.x<=o.x-rx||a.x>=o.x+rx)continue;}
  else{const x0=(o.x-rx-a.x)/dx,x1=(o.x+rx-a.x)/dx;enter=Math.max(enter,Math.min(x0,x1));exit=Math.min(exit,Math.max(x0,x1));}
  if(dy===0){if(a.y<=o.y-ry||a.y>=o.y+ry)continue;}
  else{const y0=(o.y-ry-a.y)/dy,y1=(o.y+ry-a.y)/dy;enter=Math.max(enter,Math.min(y0,y1));exit=Math.min(exit,Math.max(y0,y1));}
  if(enter<exit)return false;
 }
 return true;
}
