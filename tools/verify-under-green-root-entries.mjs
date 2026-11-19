import assert from 'node:assert/strict';

import * as T from '../web/vendor/three/three.module.js';
import {buildDrainRootCompositions} from '../web/under-green-root-compositions.js';
import {drainRootGeometry} from '../web/under-green-root-geometry.js';
const report={fragments:0,fragmentTriangles:0,buriedRoots:0,buriedVertices:0,unchangedVertices:0,entries:[]};
for(const lowDetail of [false,true]){
 const materials={};
 const stats=buildDrainRootCompositions({materials,lowDetail,put(g,type,x,y,z,sx=1,sy=1,sz=1,rx=0,ry=0,rz=0){
  if(!g.userData.rootEntrySurface)return;
  const p=g.attributes.position,n=g.attributes.normal,edges=new Map(),a=new T.Vector3(),b=new T.Vector3(),c=new T.Vector3();let volume=0;
  const key=i=>[p.getX(i),p.getY(i),p.getZ(i)].map(v=>Math.round(v*1e7)).join(',');
  for(let i=0;i<p.count;i+=3){
   a.fromBufferAttribute(p,i);b.fromBufferAttribute(p,i+1);c.fromBufferAttribute(p,i+2);assert(new T.Triangle(a,b,c).getArea()>1e-10);volume+=a.dot(b.clone().cross(c))/6;
   for(const [j,k]of [[i,i+1],[i+1,i+2],[i+2,i]]){const u=key(j),v=key(k),name=u<v?u+'|'+v:v+'|'+u;if(!edges.has(name))edges.set(name,[]);edges.get(name).push(u<v?1:-1);}
  }
  assert(volume>0);for(const values of edges.values())assert.deepEqual([...values].sort(),[-1,1],'Fragment must be closed with outward winding');
  for(let i=0;i<p.count;i++){assert(Number.isFinite(p.getX(i)+p.getY(i)+p.getZ(i)));assert(Math.abs(Math.hypot(n.getX(i),n.getY(i),n.getZ(i))-1)<1e-5);}
  if(!lowDetail){report.fragments++;report.fragmentTriangles+=p.count/3;}
 },root(points,radius,wall,options={}){
  if(!options.buriedStart)return;
  const curve=new T.CatmullRomCurve3(points),current=drainRootGeometry(curve,radius,wall,{...options,lowDetail}),original=drainRootGeometry(curve,radius,wall,{...options,buriedStart:false,lowDetail});
  const p=current.geometry.attributes.position,old=original.geometry.attributes.position,{segments,sides}=current.geometry.userData.rootProfile;
  assert.equal(p.count,old.count);assert.equal(current.geometry.index.count,original.geometry.index.count);
  for(let i=0;i<=sides;i++){const depth=((wall.vertical?p.getX(i):-p.getZ(i))-wall.boundary)*wall.side;assert(depth>-.11&&depth<.01,'Upper end must be inside even the recessed earth receiver');report.buriedVertices++;}
  for(let ring=Math.ceil(segments*.16);ring<=segments;ring++)for(let side=0;side<=sides;side++){
   const i=ring*(sides+1)+side;assert.equal(p.getX(i),old.getX(i));assert.equal(p.getY(i),old.getY(i));assert.equal(p.getZ(i),old.getZ(i));report.unchangedVertices++;
  }report.buriedRoots++;current.geometry.dispose();original.geometry.dispose();
 }});
 if(!lowDetail){report.entries=stats.entries;report.canopyEntries=stats.galleryCanopy.entries;}for(const m of Object.values(materials))m.dispose();
}
// Seven masonry fragments surround each of the six wall entries and the two
// gallery-canopy entries (under-green-gallery-canopy.js).
assert.equal(report.entries.length,6);assert.equal(report.canopyEntries.length,2);assert.equal(report.fragments,7*(report.entries.length+report.canopyEntries.length));assert.equal(report.buriedRoots,22);
console.log(JSON.stringify({passed:true,...report}));
