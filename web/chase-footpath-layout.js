import {roundedCourseRoute} from './back-nine-landscape.js';

// A maintained bed under the inset slabs: narrow enough for every foot gate.
// Build once and share the centreline between art, runner footing and audio.
export const FOOTPATH_WIDTH=.82;
export function createFootpathLayout(paths){
 return paths.map(points=>{
  const route=roundedCourseRoute(points,.35),segments=[];
  let minX=Infinity,maxX=-Infinity,minY=Infinity,maxY=-Infinity;
  for(const [x,y]of route){minX=Math.min(minX,x);maxX=Math.max(maxX,x);minY=Math.min(minY,y);maxY=Math.max(maxY,y);}
  for(let i=1;i<route.length;i++){const [x,y]=route[i-1],dx=route[i][0]-x,dy=route[i][1]-y;segments.push({x,y,dx,dy,length2:dx*dx+dy*dy});}
  const r=FOOTPATH_WIDTH/2;return {route,segments,minX:minX-r,maxX:maxX+r,minY:minY-r,maxY:maxY+r};
 });
}
export function onFootpath(point,paths){
 const radius2=(FOOTPATH_WIDTH/2)**2;
 for(const path of paths){
  if(point.x<path.minX||point.x>path.maxX||point.y<path.minY||point.y>path.maxY)continue;
  for(const s of path.segments){
   const x=point.x-s.x,y=point.y-s.y,t=Math.max(0,Math.min(1,(x*s.dx+y*s.dy)/s.length2));
   if((x-s.dx*t)**2+(y-s.dy*t)**2<=radius2)return true;
  }
 }return false;
}
