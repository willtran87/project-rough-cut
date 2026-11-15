import * as THREE from './vendor/three/three.module.js';
import {rootMasonryFragment} from './under-green-root-entry.js';

// Root pressure has shed plaster around the east shoulder. The brick bed is
// seated against the real roof; the opening never exposes sky or empty space.
// These are course coordinates (+y forward), independent of floor partitions.
export const GALLERY_EAST_FAILURE=Object.freeze([
 [4.89,9.58],[4.34,9.72],[4.16,9.43],[3.73,9.63],[3.52,9.94],
 [3.08,9.89],[2.75,10.30],[2.91,10.64],[2.52,11.12],[2.68,11.43],
 [2.46,11.89],[2.83,12.18],[3.02,12.12],[3.19,12.67],[3.72,12.87],
 [3.94,13.25],[4.43,13.12],[4.89,13.43]
].map(Object.freeze));

// Broad deposits connect the wall root, its fallen plaster and the existing
// drainage direction. Their small wet cores leave a matte drying shoulder.
export const GALLERY_RUNOFF_FANS=Object.freeze([
 {id:'east-root',center:[4.20,11.8],mud:238,wet:165,points:[
  [4.89,9.32],[4.25,9.45],[4.06,10.02],[3.43,10.27],[3.11,10.81],
  [3.28,11.34],[2.65,12.02],[2.38,12.29],[2.65,12.68],[2.49,13.14],
  [3.01,13.54],[3.37,14.05],[4.12,14.23],[4.89,13.90]]},
 {id:'pillar-wash',center:[-2.40,15.03],mud:212,wet:125,points:[
  [-3.42,13.46],[-2.81,13.14],[-2.13,13.69],[-1.45,13.89],[-1.10,14.47],
  [-1.32,15.08],[-.71,15.62],[-.48,16.30],[-1.10,16.63],[-1.34,17.23],
  [-2.18,17.51],[-2.64,16.95],[-2.92,16.77],[-2.92,15.95],[-3.62,15.78]]}
]);

export function galleryFailureContour(){
 return GALLERY_EAST_FAILURE.flatMap(([x,y],i)=>{
  const [nx,ny]=GALLERY_EAST_FAILURE[(i+1)%GALLERY_EAST_FAILURE.length],dx=nx-x,dy=ny-y,length=Math.hypot(dx,dy),steps=Math.max(1,Math.ceil(length/.15));
  return Array.from({length:steps},(_,j)=>{
   const t=j/steps,chip=j===0||x===nx?0:Math.round(Math.sin(i*3.1+j*2.7)*9)/313.5;
   return [Math.min(4.89,x+dx*t-dy/length*chip),y+dy*t+dx/length*chip];
  });
 });
}

export function paintGalleryRunoff(polygon){
 let patches=0;
 for(const fan of GALLERY_RUNOFF_FANS){
  const inset=scale=>fan.points.map(([x,y])=>[fan.center[0]+(x-fan.center[0])*scale,fan.center[1]+(y-fan.center[1])*scale]);
  // These masks share the existing packed deposit texture. No new sampler,
  // extra surface layer or bright route stripe is introduced.
  for(const [layer,scale,strength]of [[0,1,95],[0,.89,155],[0,.72,fan.mud],[2,.59,fan.wet],[2,.34,fan.wet+30]]){
   polygon(layer,inset(scale),strength);patches++;
  }
 }
 return {fans:GALLERY_RUNOFF_FANS.map(f=>f.id),patches,newTextures:0,walkGeometry:0};
}

export function buildGalleryDecay({put}){
 const contour=galleryFailureContour(),center=[3.85,11.45];let triangles=0,fragments=0;
 const local=([x,y])=>[x-center[0],center[1]-y];
 const path=(points,Type=THREE.Shape)=>{const s=new Type();points.map(local).forEach(([x,y],i)=>i?s.lineTo(x,y):s.moveTo(x,y));s.closePath();return s;};
 const submit=(g,type,x,h,y,rx=0,ry=0,rz=0)=>{triangles+=(g.index?.count||g.attributes.position.count)/3;put(g,type,x,h,-y,1,1,1,rx,ry,rz);g.dispose();};
 // The uninterrupted original roof is 4.15m high underneath. This thin bed
 // sits below it and behind the broken plaster lip, with no coplanar faces.
 submit(new THREE.ShapeGeometry(path(contour)),'rootStone',center[0],4.143,center[1],Math.PI/2);
 const outer=contour.map(([x,y],i)=>{
  const dx=x-center[0],dy=y-center[1],length=Math.hypot(dx,dy),width=.035+.026*(.5+.5*Math.sin(i*1.31));
  return [Math.min(4.895,x+dx/length*width),y+dy/length*width];
 });
 const lip=path(outer);lip.holes.push(path(contour,THREE.Path));
 const rim=new THREE.ExtrudeGeometry(lip,{depth:.033,steps:1,bevelEnabled:true,bevelSize:.003,bevelThickness:.002,bevelSegments:1});
 const rimPosition=rim.attributes.position;
 // Unequal surviving plaster thickness interrupts the bright fracture edge.
 // Scale the extrusion, including its bevel, while retaining its seated back.
 for(let i=0;i<rimPosition.count;i++){
  const x=rimPosition.getX(i),y=rimPosition.getY(i),thickness=.72+.19*Math.sin(x*4.1+y*2.2)+.09*Math.cos(y*5.7-x);
  rimPosition.setZ(i,rimPosition.getZ(i)*thickness);
 }
 rim.computeVertexNormals();
 submit(rim,'ceiling',center[0],4.164,center[1],Math.PI/2);
 // Several thicker remnants break the otherwise continuous lip. Their backs
 // remain embedded in plaster; their visible edges face the player below.
 for(const i of [2,5,8,11,14]){
  const [x,y]=GALLERY_EAST_FAILURE[i],g=rootMasonryFragment(.16+(i%3)*.035,.10+(i%2)*.04,.037+(i%3)*.005,i);
  submit(g,'ceiling',x,4.162,y,Math.PI/2,0,i*.37);fragments++;
 }
 // Fallen plaster is partly buried beside the root, beyond the walkable
 // player-center limit. Nothing raised is scattered across the escape lane.
 for(const [i,[x,y,w,h,angle]]of [[4.84,10.02,.12,.23,.21],[4.86,10.25,.08,.13,-.34],
  [4.83,10.87,.11,.19,.13],[4.86,11.38,.10,.26,-.19],[4.82,11.61,.08,.12,.48],
  [4.86,12.27,.11,.21,-.30],[4.82,12.42,.07,.11,.61]].entries()){
  const g=rootMasonryFragment(w,h,.014+(i%2)*.005,i+21);
  submit(g,'ceiling',x,-.003,y,-Math.PI/2,0,angle);fragments++;
 }
 return {roofFailure:1,contourPoints:contour.length,plasterFragments:fragments,triangles,roofBacking:4.15,lowestOverhead:4.11,newTextures:0,newMaterials:0,newLights:0,newColliders:0};
}
