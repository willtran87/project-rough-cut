import assert from 'node:assert/strict';
import * as T from '../web/vendor/three/three.module.js';
import {drainRootGeometry} from '../web/under-green-root-geometry.js';
import {buildDrainRootCompositions} from '../web/under-green-root-compositions.js';
let roots=0,vertices=0,collars=0,seams=0,pillarVertices=0;
for(const lowDetail of [false,true]){
 const materials={mudBank:new T.MeshPhongMaterial()},owned=[];
 buildDrainRootCompositions({materials,lowDetail,put(){},root(points,radius,wall,options={}){
  const curve=new T.CatmullRomCurve3(points),a=drainRootGeometry(curve,radius,wall,{...options,lowDetail}),b=drainRootGeometry(curve,radius,wall,{...options,lowDetail});
  const g=a.geometry,p=g.attributes.position,n=g.attributes.normal,c=g.attributes.color,{segments,sides}=g.userData.rootProfile;
  assert.deepEqual(p.array,b.geometry.attributes.position.array,'Geometry must be deterministic');assert.equal(g.index.count,segments*sides*6,'No extra topology');
  for(let i=0;i<p.count;i++){
   for(const attribute of [p,n,c,g.attributes.uv])for(let j=0;j<attribute.itemSize;j++)assert(Number.isFinite(attribute.array[i*attribute.itemSize+j]));
   assert(Math.abs(Math.hypot(n.getX(i),n.getY(i),n.getZ(i))-1)<.00001);
   assert(c.getX(i)>=.68&&c.getX(i)<=1.00001);
   if(wall){const intrusion=((wall.vertical?p.getX(i):-p.getZ(i))-wall.boundary)*wall.side,limit=.2+.12*T.MathUtils.smoothstep(p.getY(i),2.3,3.1);assert(intrusion<=limit+.00001&&intrusion>=-.15001);}
   else if(p.getY(i)<2.3){assert(Math.abs(p.getX(i)+1.8)<.5&&Math.abs(p.getZ(i)+15)<.5,'Pillar escaped collider');pillarVertices++;}
   vertices++;
  }
  for(let ring=0;ring<=segments;ring++){
   const i=ring*(sides+1),j=i+sides;for(const attribute of [p,n,c])for(let k=0;k<3;k++)assert(Math.abs(attribute.array[i*3+k]-attribute.array[j*3+k])<.00001,'Bark seam discontinuity');seams++;
  }
  for(let i=0;i<(options.branchPoints||[]).length;i++){assert(curve.getPointAt(a.profile.collars[i]).distanceTo(options.branchPoints[i])<.08,'Collar detached from branch');collars++;}
  roots++;g.dispose();b.geometry.dispose();
 }});
 for(const material of Object.values(materials))material.dispose();
}
assert(collars>=32);assert(pillarVertices>0);console.log(JSON.stringify({passed:true,roots,vertices,collars,seams,pillarVertices}));
