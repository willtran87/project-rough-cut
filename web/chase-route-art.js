import {courseRibbon} from './back-nine-landscape.js';
import {FOOTPATH_WIDTH} from './chase-footpath-layout.js';
import {createJunctionEdges} from './chase-junction-layout.js';

// Flush, opaque surfaces make the route width readable. They join existing
// spatial/material batches and introduce no obstacle, texture or update loop.
export function buildRouteClues({THREE,COURSE,put,box}){
 const slab=new THREE.PlaneGeometry(1,1);slab.rotateX(-Math.PI/2);let pavers=0;
 const junctionEdges=createJunctionEdges(COURSE);
 for(const e of junctionEdges)put(slab,'stone',e.x,.039,-e.y,e.width,1,e.length,e.yaw);
 for(const {route:rounded} of COURSE.footways){
  courseRibbon(THREE,put,'track',rounded,FOOTPATH_WIDTH,.037);
  let traveled=0,next=.35;
  for(let i=1;i<rounded.length;i++){
   const a=rounded[i-1],b=rounded[i],dx=b[0]-a[0],dy=b[1]-a[1],length=Math.hypot(dx,dy);
   while(next<traveled+length){const t=(next-traveled)/length,x=a[0]+dx*t,y=a[1]+dy*t;
    const wear=Math.sin(pavers*7.13);put(slab,'road',x+.035*wear,.042,-y,.44+.025*wear,1,.57+.045*wear,-Math.atan2(dx,dy)+wear*.025);pavers++;next+=.91+.06*Math.sin(pavers*3.71);
   }traveled+=length;
  }
 }
 for(const d of COURSE.decisions){
  // Two worn wheel bands enter the actual cart aperture; no painted arrows.
  const lane=[[d.gate.x,d.gate.y-6],[d.gate.x,d.gate.y+6]];
  for(const side of [-1,1])courseRibbon(THREE,put,'track',lane,.28,.043,false,side*.72);
  // Scraped sleeves sit on the existing jambs, clear of the physical opening.
  for(const side of [-1,1]){
   box('iron',d.gate.x+side*1.92,.48,-d.gate.y,.09,.55,.29);
   for(let n=0;n<3;n++)box('rust',d.gate.x+side*1.915,.33+n*.13,-d.gate.y+.153,.075,.035,.012);
  }
 }
 slab.dispose();return {pavers,cartGaps:COURSE.decisions.length,footRoutes:COURSE.footPaths.length,junctionEdges:junctionEdges.length};
}
