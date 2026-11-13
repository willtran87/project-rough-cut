import {roundedCourseRoute,routeDistanceXY} from './back-nine-landscape.js';

// Flush stone edge courses make the mouths of maintained alternatives readable
// before the turn. They follow real routes, never span another lane, and stop
// after the junction instead of lining the entire course with bright markers.
export function createJunctionEdges(course){
 const edges=[];
 for(let index=1;index<course.paths.length;index++){
  const route=roundedCourseRoute(course.paths[index],2.3),others=course.paths.filter((_,i)=>i!==index);
  const length=route.slice(1).reduce((sum,b,i)=>sum+Math.hypot(b[0]-route[i][0],b[1]-route[i][1]),0);
  let traveled=0;
  for(let i=1;i<route.length;i++){
   const a=route[i-1],b=route[i],dx=b[0]-a[0],dy=b[1]-a[1],segment=Math.hypot(dx,dy),steps=Math.ceil(segment/1.4);
   if(!segment)continue;
   for(let n=0;n<steps;n++){
    const t=(n+.5)/steps,along=traveled+segment*t;
    if(Math.min(along,length-along)>18)continue;
    for(const side of [-1,1]){
     const x=a[0]+dx*t+dy/segment*1.84*side,y=a[1]+dy*t-dx/segment*1.84*side,span=segment/steps-.055;
     if(span<.06||course.wet.some(w=>Math.hypot(x-w.x,y-w.y)<w.r+span*.5+.1))continue;
     // Check the full stone, not just its centre, at merging/crossing lanes.
     if([-1,0,1].some(end=>routeDistanceXY(x+dx/segment*span*.5*end,y+dy/segment*span*.5*end,others)<2.2))continue;
     edges.push({route:index,x,y,yaw:-Math.atan2(dx,dy),length:span,width:.18});
    }
   }
   traveled+=segment;
  }
 }
 return edges;
}
