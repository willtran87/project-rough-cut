import * as THREE from './vendor/three/three.module.js';
import {putSecondaryRoot} from './under-green-secondary-roots.js';

// Reach into the landing's upper silhouette while keeping the old clear
// underside height. Geometry and its physical UVs expand together.
export const RANGE_LINING_REACH=2.15;
const reachX=x=>7.10+(x-7.10)*RANGE_LINING_REACH;

// A failed lining panel at the real west wall of the middle range landing.
// The structural roof remains intact above it. Damage has a single load path:
// wet soil and roots at the old seam, a folded sheet, and a retained repair strap.
export function rangeLiningGeometry(){
 const us=[0,.48,1],vs=[0,.19,.46,.73,1],widths=[2.13,2.34,1.99,2.43,2.16],sags=[.16,.67,1.02,.71,.22];
 const positions=[],uv=[],indices=[],rows=vs.length,cols=us.length;
 for(const back of [false,true])for(let j=0;j<rows;j++)for(let i=0;i<cols;i++){
  const u=us[i],x=7.10+u*widths[j]*RANGE_LINING_REACH,y=27.20+vs[j]*2.72;
  const height=4.66-u*sags[j]-Math.max(0,u-.48)*.22+(back?.032:0);
  positions.push(x,height,-y);uv.push(x/2,y/2);
 }
 const face=rows*cols;
 for(let j=0;j<rows-1;j++)for(let i=0;i<cols-1;i++){
  const a=j*cols+i,b=a+1,c=a+cols,d=c+1;
  indices.push(a,b,c,b,d,c,a+face,c+face,b+face,b+face,c+face,d+face);
 }
 const perimeter=[0,1,2,5,8,11,14,13,12,9,6,3];
 for(let i=0;i<perimeter.length;i++){const a=perimeter[i],b=perimeter[(i+1)%perimeter.length];indices.push(a,a+face,b,b,a+face,b+face);}
 for(let i=0;i<indices.length;i+=3)[indices[i+1],indices[i+2]]=[indices[i+2],indices[i+1]];
 const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));g.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));g.setIndex(indices);g.computeVertexNormals();g.userData.preserveDrainUV=true;return g;
}

export function rangeLiningAttachment(g,x,y){
 const ray=new THREE.Ray(new THREE.Vector3(x,0,-y),new THREE.Vector3(0,1,0)),p=g.attributes.position;
 const a=new THREE.Vector3(),b=new THREE.Vector3(),c=new THREE.Vector3(),hit=new THREE.Vector3();let result=null;
 for(let i=0;i<g.index.count;i+=3){
  a.fromBufferAttribute(p,g.index.getX(i));b.fromBufferAttribute(p,g.index.getX(i+1));c.fromBufferAttribute(p,g.index.getX(i+2));
  if(ray.intersectTriangle(a,b,c,false,hit)&&(!result||hit.y<result.point.y))result={point:hit.clone(),normal:new THREE.Triangle(a,b,c).getNormal(new THREE.Vector3())};
 }
 if(!result)throw new Error('Range lamp attachment misses its lining');
 return result;
}

export function buildRangeLining({box,put}){
 const g=rangeLiningGeometry();g.computeBoundingBox();const bounds={min:g.boundingBox.min.toArray(),max:g.boundingBox.max.toArray()};
 const attachment=rangeLiningAttachment(g,10.7,28.575);
 const anchor=new THREE.Vector3(7.1,0,-28.56);g.translate(-anchor.x,0,-anchor.z);put(g,'rangeStone',anchor.x,0,anchor.z);g.dispose();
 // Thin folded seams carry across the underside, showing that the sagging
 // form is a damaged metal sheet rather than cloth or a loose earth mound.
 for(const j of [1,3]){
  const width=[2.34,2.43][j===1?0:1]*RANGE_LINING_REACH,sag=[.67,.71][j===1?0:1],y=27.2+[.19,.73][j===1?0:1]*2.72;
  const points=[0,.48,1].map(u=>new THREE.Vector3(7.1+u*width,4.64-u*sag-Math.max(0,u-.48)*.22,-y));
  for(let i=1;i<points.length;i++){
   const a=points[i-1],b=points[i],delta=b.clone().sub(a),rib=new THREE.BoxGeometry(delta.length(),.026,.035);
   rib.rotateZ(Math.atan2(delta.y,delta.x));const centre=a.clone().add(b).multiplyScalar(.5);put(rib,'machineRust',centre.x,centre.y,centre.z);rib.dispose();
  }
 }
 // Soil is trapped against the solid slab, visible above the peeled lining.
 box('bankEarth',reachX(8.04),4.62,-28.58,1.91*RANGE_LINING_REACH,.11,2.55);
 // Old fixed seam and two purlins explain how the lining was attached.
 box('machineRust',reachX(7.13),4.59,-28.56,.09,.12,2.82);
 for(const y of [27.33,29.79]){
  box('machineIron',reachX(8.29),4.52,-y,2.34*RANGE_LINING_REACH,.09,.07);
  for(const x of [7.25,9.25])box('machineSteel',reachX(x),4.462,-y,.06,.025,.06);
 }
 // One retained strap catches the hanging edge, instead of a floating panel.
 box('machineIron',reachX(9.43),4.285,-29.18,.055,.81,.07);
 box('machineSteel',reachX(9.43),3.855,-29.18,.24,.055,.16);
 box('machineRust',reachX(9.43),4.65,-29.18,.23,.08,.21);
 const rootPoints=points=>points.map(([x,h,z])=>new THREE.Vector3(reachX(x),h,z));
 putSecondaryRoot(put,rootPoints([[7.04,4.74,-28.34],[7.61,4.57,-28.48],[8.25,4.35,-28.75],[9.57,4.14,-29.05],[10.02,3.96,-29.2]]),.16);
 putSecondaryRoot(put,rootPoints([[9.57,4.14,-29.05],[9.85,4.02,-28.85],[10.04,3.89,-28.54]]),.068);
 // The existing lamp stem now passes through the folded sheet. A retaining
 // collar and underside plate make this a fitted attachment, not a bare
 // rod clipping through the lining; the lamp/source remain in their place.
 box('machineIron',10.7,3.805,-28.575,.078,.14,.078);
 // Fit the plate to the actual triangle, including its slope along the
 // corridor. A horizontal plate would cut through one edge and float at the other.
 const rotation=new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0,1,0),attachment.normal.clone().negate());
 function attached(type,x,h,w,t,d){
  const geometry=new THREE.BoxGeometry(w,t,d);geometry.applyQuaternion(rotation);
  const centre=new THREE.Vector3(x,h,0).applyQuaternion(rotation).add(attachment.point);put(geometry,type,centre.x,centre.y,centre.z);geometry.dispose();
 }
 attached('machineSteel',0,-.0125,.23,.025,.21);
 for(const dx of [-.075,.075])attached('machineRust',dx,-.0375,.026,.025,.026);
 return {kind:'buckled-range-lining',panels:1,roots:2,foldedSeams:2,reach:RANGE_LINING_REACH,lampCollar:true,minimumHeight:bounds.min[1],bounds,solidRoofRetained:true};
}
