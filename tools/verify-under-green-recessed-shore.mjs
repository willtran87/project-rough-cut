import assert from 'node:assert/strict';
import fs from 'node:fs';
import {WATERS} from '../web/under-green-layout.js';
import {waterPoint} from '../web/under-green-course.js';
import {waterContactHeight} from '../web/under-green-water-contacts.js';
import {shallowWaterHeight} from '../web/under-green-wet-ground.js';
import {CHANNEL_TOE_HEIGHT,channelShoreProfile,channelShoreSample,channelSurfaceHeight,channelShoreMeshData} from '../web/under-green-channel-shore.js';
let vertices=0,triangles=0,samples=0,maxInterpolationError=0,maxSlopeError=0,maxEdgeError=0;
for(const w of WATERS){
 const d=channelShoreMeshData(w),half=(w.depth-.4)/2;
 assert.equal(d.positions.length/3,d.weights.length);assert.equal(d.distances.length,d.weights.length);assert.equal(d.gradients.length,d.weights.length*2);
 for(let i=0;i<d.weights.length;i++){
  const [x,h,z]=d.positions.slice(i*3,i*3+3);assert(h===0&&Math.abs(x)<=w.width/2+1e-9&&Math.abs(z)<=half+1e-9);
  assert(d.weights[i]>=0&&d.weights[i]<=1);assert(d.gradients.slice(i*2,i*2+2).every(Number.isFinite));
  for(const level of [.02,.04,.08,.3,.5,1])assert(channelSurfaceHeight(w,x,-z,level)>=CHANNEL_TOE_HEIGHT-1e-10);
  if(i%d.rows===0||i%d.rows===d.rows-1){assert(d.weights[i]<1e-12);assert(d.distances[i]<1e-12);assert(half-Math.abs(z)>=.035-1e-9&&half-Math.abs(z)<=.145+1e-9);}
 }
 for(let c=0;c<d.across;c++)for(const r of [0,d.rows-1]){
  const a=c*d.rows+r,b=(c+1)*d.rows+r;
  for(const t of [.1,.25,.5,.75,.9]){
   const x=d.positions[a*3]*(1-t)+d.positions[b*3]*t;
   const y=-(d.positions[a*3+2]*(1-t)+d.positions[b*3+2]*t);
   maxEdgeError=Math.max(maxEdgeError,Math.abs(channelShoreSample(w,x,y).distance));
  }
 }
 for(let i=0;i<d.indices.length;i+=3){
  const [a,b,c]=d.indices.slice(i,i+3).map(n=>({x:d.positions[n*3],y:-d.positions[n*3+2],weight:d.weights[n]}));
  assert((b.x-a.x)*(c.y-a.y)-(b.y-a.y)*(c.x-a.x)>0,'Upward winding');
  for(const [u,v]of [[1/3,1/3],[.1,.1],[.8,.1],[.1,.8]]){
   const x=a.x*(1-u-v)+b.x*u+c.x*v,y=a.y*(1-u-v)+b.y*u+c.y*v;
   const analytic=channelShoreSample(w,x,y),linear=a.weight*(1-u-v)+b.weight*u+c.weight*v;
   maxInterpolationError=Math.max(maxInterpolationError,Math.abs(analytic.weight-linear)*(.105-CHANNEL_TOE_HEIGHT));samples++;
  }
 }
 for(let x=-2.8;x<=2.8;x+=.17)for(const side of [-1,1])for(const t of [.13,.43,.77]){
  const {width,inset}=channelShoreProfile(w,x,side),y=side*(half-inset-width*t),s=channelShoreSample(w,x,y),e=1e-5;
  const dx=(channelShoreSample(w,x+e,y).weight-channelShoreSample(w,x-e,y).weight)/(2*e);
  const dy=(channelShoreSample(w,x,y+e).weight-channelShoreSample(w,x,y-e).weight)/(2*e);
  maxSlopeError=Math.max(maxSlopeError,Math.abs(dx+s.normalX),Math.abs(dy-s.normalZ));
  const p=waterPoint(w,x,y),contact=waterContactHeight(p,[w],[{level:1}],0);
  if(contact!==null&&Math.abs(y)<w.depth/2-.22){
   assert(Math.abs(contact-Math.max(shallowWaterHeight(p)??0,channelSurfaceHeight(w,x,y,1)))<1e-10,'Contact disagrees with highest actual surface');
   assert.equal(waterContactHeight(p,[w],[{level:1}],.3),.3,'Flood remains dominant');
  }
 }
 for(let x=-w.width/2+.3;x<w.width/2-.3;x+=.19)for(const side of [-1,1]){
  const {inset}=channelShoreProfile(w,x,side),y=side*(half-inset+.012),p=waterPoint(w,x,y);
  const actual=waterContactHeight(p,[w],[{level:1}],0);
  // Outside the recessed contour, only an independently authored puddle
  // may produce a water contact. Flood coverage still overrides it.
  if(actual!==null)assert.equal(actual,shallowWaterHeight(p));
  const flooded=waterContactHeight(p,[w],[{level:1}],.3);
  if(flooded!==null)assert.equal(flooded,.3);
 }
 assert(Math.abs(channelSurfaceHeight(w,0,0,1)-.105)<1e-12);vertices+=d.weights.length;triangles+=d.indices.length/3;
}
assert(maxInterpolationError<.0025,'Contact surface must stay within 2.5 mm of interpolated mesh, excluding existing wave motion');
assert(maxEdgeError<.002,'Contact exclusion margin must cover the triangulated shore');
assert(maxSlopeError<1e-5,'Reflection slope must match height profile');
const report={passed:true,channels:WATERS.length,vertices,triangles,addedTriangles:triangles-WATERS.length*1152,samples,maxInterpolationError,maxSlopeError,maxEdgeError};
fs.mkdirSync('output/under-green/visual-pass94',{recursive:true});fs.writeFileSync('output/under-green/visual-pass94/geometry.json',JSON.stringify(report,null,2));console.log(report);
