import assert from 'node:assert/strict';
import fs from 'node:fs';
import {createDroppedPaperGeometry,DROPPED_PAPER_CORNERS} from '../web/course-dropped-paper.js';

const regions=[{x:0,y:0,w:256,h:320},{x:288,y:32,w:192,h:256}];
const originalCorners=[[-.13,.038,-.18],[.10,.038,-.18],[.13,.065,.09],[.06,.087,.18],[-.13,.038,.15]];
assert.deepEqual(DROPPED_PAPER_CORNERS,originalCorners,'Match the pre-change authored fold');
const cases=Array.from({length:16},(_,i)=>({x:i*.32-2,z:i*.93-7,angle:i*.47,route:i%2?9:5}));
let triangles=0;
for(const placement of cases){
 const g=createDroppedPaperGeometry([placement],regions),p=g.attributes.position,n=g.attributes.normal,uv=g.attributes.uv,edges=new Map();
 const vertices=Array.from({length:p.count},(_,i)=>[p.getX(i),p.getY(i),p.getZ(i)]);
 const key=v=>v.map(x=>x.toFixed(6)).join(',');let volume=0;
 for(let i=0;i<p.count;i+=3){
  const [a,b,c]=vertices.slice(i,i+3),ab=b.map((x,j)=>x-a[j]),ac=c.map((x,j)=>x-a[j]);
  const normal=[ab[1]*ac[2]-ab[2]*ac[1],ab[2]*ac[0]-ab[0]*ac[2],ab[0]*ac[1]-ab[1]*ac[0]];
  assert(Math.hypot(...normal)>1e-9,'No degenerate stock triangles');
  assert(normal[0]*n.getX(i)+normal[1]*n.getY(i)+normal[2]*n.getZ(i)>0,'Normals follow winding');
  volume+=(a[0]*(b[1]*c[2]-b[2]*c[1])+a[1]*(b[2]*c[0]-b[0]*c[2])+a[2]*(b[0]*c[1]-b[1]*c[0]))/6;
  for(const [v,w]of [[a,b],[b,c],[c,a]]){const va=key(v),vb=key(w),k=[va,vb].sort().join('|'),e=edges.get(k)||[];e.push(va<vb?1:-1);edges.set(k,e);}
  triangles++;
 }
 assert(volume>0,'Closed paper has outward winding and positive volume');
 for(const e of edges.values())assert(e.length===2&&e[0]+e[1]===0,'Every stock edge joins exactly two opposing faces');
 const cs=Math.cos(placement.angle),sn=Math.sin(placement.angle);
 for(const v of vertices){
  const dx=v[0]-placement.x,dz=v[2]-placement.z,local=[dx*cs-dz*sn,v[1],dx*sn+dz*cs];
  assert(originalCorners.some(c=>Math.abs(c[0]-local[0])<1e-5&&Math.abs(c[2]-local[2])<1e-5&&Math.min(Math.abs(c[1]-local[1]),Math.abs(c[1]-.0006-local[1]))<1e-7),'Preserve original folded footprint and top height');
 }
 const r=regions[placement.route<8?0:1];
 for(let i=0;i<uv.count;i++){
  assert(uv.getX(i)>=r.x/512-1e-7&&uv.getX(i)<=(r.x+r.w)/512+1e-7);
  assert(uv.getY(i)>=1-(r.y+r.h)/320-1e-7&&uv.getY(i)<=1-r.y/320+1e-7);
 }
 g.dispose();
}
const result={passed:true,placements:cases.length,triangles,closedOutwardStock:true,originalFootprint:true,uvsWithinForm:true};
fs.mkdirSync('output/level-one-dropped-paper',{recursive:true});fs.writeFileSync('output/level-one-dropped-paper/geometry.json',JSON.stringify(result,null,2));console.log(result);
