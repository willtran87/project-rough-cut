import {LANES,SWALE,SECTORS,RIG,clamp,isCut} from './final-cut-course.js';
import {RIG_BANK} from './final-cut-rig.js';
import {AMBUSH_CORRIDOR_X} from './final-cut-route-layout.js';

const bands=[...LANES,SWALE.y];
export function restoreCutAreas(value){
 if(!Array.isArray(value))return [];
 let result=[];
 for(const a of value.slice(0,24))if(a&&(a.axis==='y'?a.x===AMBUSH_CORRIDOR_X:bands.includes(a.y))&&Number.isFinite(a.lo)&&Number.isFinite(a.hi)&&a.lo<a.hi){
  result=mergeArea(result,a.axis==='y'?{axis:'y',x:a.x,lo:clamp(a.lo,20,94),hi:clamp(a.hi,20,94)}:{y:a.y,lo:clamp(a.lo,-34,34),hi:clamp(a.hi,-34,34)});
 }return result;
}
function mergeArea(areas,next){
 const out=[];
 for(const a of areas){
  if(a.axis===next.axis&&a.x===next.x&&a.y===next.y&&a.lo<=next.hi+.0001&&a.hi>=next.lo-.0001){next={...next,lo:Math.min(a.lo,next.lo),hi:Math.max(a.hi,next.hi)};}else out.push({...a});
 }
 out.push(next);return out.sort((a,b)=>(a.y??a.x)-(b.y??b.x)||a.lo-b.lo);
}
// Preserve the actual reels' swept interval, including the central reel, so
// even a low render rate cannot leave uncut gaps.
export function mow(r,previousX,previousY=r.rig.y){
 const j=r.rig,vertical=j.attack?.axis==='y',previous=vertical?previousY:previousX,current=vertical?j.y:j.x,near=RIG_BANK.reelForward-RIG_BANK.reelRadius,far=RIG_BANK.reelForward+RIG_BANK.reelRadius,points=[previous+j.direction*near,previous+j.direction*far,current+j.direction*near,current+j.direction*far];
 r.cutAreas=mergeArea(r.cutAreas||[],{...(vertical?{axis:'y',x:j.x}:{y:j.y}),lo:Math.min(...points),hi:Math.max(...points)});r.cutRevision=(r.cutRevision||0)+1;
 const completed=[];
 for(const s of SECTORS)if(!r.cut.includes(s.id)&&r.cutAreas.some(a=>Math.abs(a.y-s.y)+s.d/2<=RIG.halfWidth&&a.lo<=s.x-s.w/2&&a.hi>=s.x+s.w/2)){r.cut.push(s.id);completed.push(s.id);}
 return completed;
}
export function roughRemaining(r){
 return SECTORS.map(s=>({id:s.id,standing:!r.cut.includes(s.id),cutAtCenter:isCut(r,s)}));
}
