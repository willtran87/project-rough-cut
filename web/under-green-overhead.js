import * as THREE from './vendor/three/three.module.js';
import {GATE_ROOF_SLOT} from './under-green-layout.js';

// A course-side maintenance grate, authored in physical metres. The aperture
// removes roof geometry only; movement, cover and enemy navigation stay planar.
export const COURSE_SHAFTS=Object.freeze([
 Object.freeze({id:'root-maintenance',x:.6,y:18.5,w:2.2,d:2.4,bottom:4.15,top:5.25})
]);

// Subtract each aperture from the actual covered floor tiles. Disjoint strips
// preserve roof area outside the opening even when it crosses tile boundaries.
export const ROOF_OPENINGS=Object.freeze([...COURSE_SHAFTS,GATE_ROOF_SLOT]);
export function roofPanels(tiles,shafts=ROOF_OPENINGS){
 let panels=tiles.filter(t=>t.covered).map(({x,y,w,d})=>({x,y,w,d}));
 for(const shaft of shafts){
  const cut={left:shaft.x-shaft.w/2,right:shaft.x+shaft.w/2,near:shaft.y-shaft.d/2,far:shaft.y+shaft.d/2};
  panels=panels.flatMap(p=>{
   const left=p.x-p.w/2,right=p.x+p.w/2,near=p.y-p.d/2,far=p.y+p.d/2;
   const a=Math.max(left,cut.left),b=Math.min(right,cut.right),c=Math.max(near,cut.near),d=Math.min(far,cut.far);
   if(a>=b||c>=d)return [p];
   const pieces=[];
   const add=(x1,x2,y1,y2)=>{if(x2-x1>1e-6&&y2-y1>1e-6)pieces.push({x:(x1+x2)/2,y:(y1+y2)/2,w:x2-x1,d:y2-y1});};
   add(left,a,near,far);add(b,right,near,far);add(a,b,near,c);add(a,b,d,far);
   return pieces;
  });
 }
 return panels;
}

export function buildCourseOverhead({box,put,cyl,ball}){
 for(const s of COURSE_SHAFTS){
  const ring=(type,height,tall,thickness,inset=0)=>{
   const w=s.w+inset*2,d=s.d+inset*2;
   for(const side of [-1,1]){
    box(type,s.x+side*(w+thickness)/2,height,-s.y,thickness,tall,d+thickness*2);
    box(type,s.x,height,-s.y+side*(d+thickness)/2,w,tall,thickness);
   }
  };
  ring('rootStone',4.4,.5,.22);
  ring('sand',4.8,.3,.22);
  ring('soil',5.1,.3,.22);
  ring('iron',s.bottom+.04,.12,.12,-.04);
  ring('soil',4.8,.9,.7,.22);
  ring('grass',5.31,.12,.7,.22);
  ring('grass',5.31,.12,.15,-.045);
  ring('steel',s.top,.1,.1,-.02);
  // Grate bars and cross-braces leave real sightlines through to the night sky.
  for(let x=s.x-s.w/2+.22;x<s.x+s.w/2;x+=.44)box('iron',x,s.top,-s.y,.045,.07,s.d);
  for(const offset of [-.65,.65])box('iron',s.x,s.top+.02,-s.y-offset,s.w,.06,.055);
  // Turf roots emerge from the exposed shaft wall, with branches attached to
  // their parent segment. Their lowest tip remains above the gallery roof edge.
  for(const side of [-1,1])for(const offset of [-.72,.48]){
   const x=s.x+side*(s.w/2-.015),y=s.y+offset;
   const points=[new THREE.Vector3(x+side*.035,5.26,-y),new THREE.Vector3(x-side*.025,5.02,-y+.06),new THREE.Vector3(x-side*.11,4.82,-y-.02),new THREE.Vector3(x-side*.08,4.58,-y+.04)];
   const root=new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points),9,.025,5,false);put(root,'wood',0,0,0);root.dispose();
   const branch=new THREE.TubeGeometry(new THREE.CatmullRomCurve3([points[2],new THREE.Vector3(x-side*.19,4.75,-y-.08),new THREE.Vector3(x-side*.22,4.64,-y-.14)]),5,.01,4,false);put(branch,'wood',0,0,0);branch.dispose();
  }
  // A trapped range ball rests on the grate, a small literal link to the course.
  put(ball,'white',s.x+.44,s.top+.097,-s.y-.65,.047,.047,.047);
  // A flag on the green beyond the far rim is visible through the opening.
  // Its base is on the outer turf shelf, never suspended inside the shaft.
  const flagX=s.x-.45,flagY=s.y+s.d/2+.35,ground=5.37;
  put(cyl,'white',flagX,ground+.925,-flagY,.018,1.85,.018);
  box('red',flagX+.28,ground+1.68,-flagY,.56,.3,.018);
 }
 return {shafts:COURSE_SHAFTS.map(s=>({...s})),minimumDetailHeight:4.13};
}
