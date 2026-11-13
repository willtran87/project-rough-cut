import * as THREE from './vendor/three/three.module.js';

// The continuous opaque centre turf spans x[-42,42], z[-840,0], y=-.005.
// Clip an inset rectangle to the camera's depth range. A bottom screen band
// is safe to omit from the BACKGROUND only when both lower corners and the
// complete band lie within that convex projected ground polygon. Side views,
// near-boundary cameras and upward looks naturally keep more/all of the sky.
export function createCourseSkyCoverage(){
 const matrix=new THREE.Matrix4(),point=new THREE.Vector4();
 const corners=[[-41.99,-.005,-.01],[41.99,-.005,-.01],[41.99,-.005,-839.99],[-41.99,-.005,-839.99]];
 function clip(input,sign){
  const out=[];
  for(let i=0;i<input.length;i++){
   const a=input[i],b=input[(i+1)%input.length],da=a[3]+sign*a[2],db=b[3]+sign*b[2];
   if(da>=0)out.push(a);
   if((da>=0)!==(db>=0)){const t=da/(da-db);out.push(a.map((v,j)=>v+(b[j]-v)*t));}
  }
  return out;
 }
 function span(poly,x){
  let low=Infinity,high=-Infinity;
  for(let i=0;i<poly.length;i++){
   const a=poly[i],b=poly[(i+1)%poly.length];
   if(x<Math.min(a[0],b[0])||x>Math.max(a[0],b[0]))continue;
   if(Math.abs(a[0]-b[0])<1e-10){low=Math.min(low,a[1],b[1]);high=Math.max(high,a[1],b[1]);}
   else{const y=a[1]+(b[1]-a[1])*(x-a[0])/(b[0]-a[0]);low=Math.min(low,y);high=Math.max(high,y);}
  }
  return [low,high];
 }
 return {rows(camera,height){
  if(camera.position.y<=-.005||!Number.isFinite(height)||height<=0)return 0;
  camera.updateMatrixWorld();matrix.multiplyMatrices(camera.projectionMatrix,camera.matrixWorldInverse);
  let poly=corners.map(c=>{point.set(...c,1).applyMatrix4(matrix);return [point.x,point.y,point.z,point.w];});
  poly=clip(clip(poly,1),-1);if(poly.length<3||poly.some(p=>p[3]<=0))return 0;
  poly=poly.map(p=>[p[0]/p[3],p[1]/p[3]]);
  // Test slightly outside the viewport; leave two rows of rasterization margin.
  const left=span(poly,-1.00001),right=span(poly,1.00001);
  if(left[0]>-1.00001||right[0]>-1.00001)return 0;
  const top=Math.min(left[1],right[1],1);if(!Number.isFinite(top)||top<=-1)return 0;
  return Math.max(0,Math.min(height,Math.floor((top+1)*.5*height)-2));
 }};
}
