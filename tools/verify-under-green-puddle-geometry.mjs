import assert from 'node:assert/strict';
import fs from 'node:fs';
import {shallowPoolGeometry} from '../web/under-green-puddle-geometry.js';
import {DRAIN_SHALLOW_PATCHES,SHALLOW_WATER_HEIGHT,insideWetPolygon} from '../web/under-green-wet-ground.js';
const rows=[];
for(const patch of DRAIN_SHALLOW_PATCHES){
 const g=shallowPoolGeometry(patch,SHALLOW_WATER_HEIGHT),p=g.attributes.position,a=g.attributes.puddleInterior,n=g.attributes.normal,ix=g.index.array,triangles=[];
 let area=0;
 for(let i=0;i<p.count;i++){assert(Math.abs(p.getY(i)-SHALLOW_WATER_HEIGHT)<1e-8);assert(n.getY(i)>.999);assert(Number.isFinite(a.getX(i))&&a.getX(i)>=0);}
 const cross=(a,b,c)=>(b[0]-a[0])*(c[1]-a[1])-(b[1]-a[1])*(c[0]-a[0]);
 for(let i=0;i<ix.length;i+=3){const tri=Array.from(ix.slice(i,i+3),k=>[p.getX(k),-p.getZ(k)]);const ar=cross(...tri);assert(ar>=-1e-8,'Reversed or folded shoreline '+patch.id);area+=ar*.5;triangles.push(tri);}
 const expected=Math.abs(patch.points.reduce((s,v,i)=>{const q=patch.points[(i+1)%patch.points.length];return s+v[0]*q[1]-v[1]*q[0];},0))*.5;
 assert(Math.abs(area-expected)<.0001,'Coverage area changed '+patch.id);
 for(const [x,y]of patch.points)assert(Array.from({length:p.count},(_,i)=>i).some(i=>Math.hypot(p.getX(i)-x,p.getZ(i)+y)<.00001),'Authored edge moved');
 const xs=patch.points.map(p=>p[0]),ys=patch.points.map(p=>p[1]),minX=Math.min(...xs)-.01,maxX=Math.max(...xs)+.01,minY=Math.min(...ys)-.01,maxY=Math.max(...ys)+.01;
 let sampled=0;
 for(let j=0;j<63;j++)for(let i=0;i<67;i++){
  const point=[minX+(i+.31)/67*(maxX-minX),minY+(j+.47)/63*(maxY-minY)];
  const hits=triangles.filter(t=>t.every((v,k)=>cross(v,t[(k+1)%3],point)>1e-9)).length;
  assert(hits<=1,'Overlapping water triangles '+patch.id);
  assert.equal(hits>0,insideWetPolygon({x:point[0],y:point[1]},patch.points),'Hole or extended water footprint '+patch.id);sampled++;
 }
 rows.push({id:patch.id,vertices:p.count,triangles:ix.length/3,area,expected,sampled});g.dispose();
}
const out='output/under-green/visual-upgrade-local/pass45-geometry';fs.mkdirSync(out,{recursive:true});fs.writeFileSync(out+'/report.json',JSON.stringify({passed:true,rows},null,2));console.log(JSON.stringify({passed:true,patches:rows.length,samples:rows.reduce((s,r)=>s+r.sampled,0),triangles:rows.reduce((s,r)=>s+r.triangles,0)}));
