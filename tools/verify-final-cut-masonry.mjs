import assert from 'node:assert/strict';
import fs from 'node:fs';
import {buildFinalCutEstateDetail} from '../web/final-cut-estate-detail.js';
import {WALLS} from '../web/final-cut-course.js';
import {OVERLOOK} from '../web/final-cut-arrival-layout.js';
const walls=[...WALLS,{...OVERLOOK,id:'overlook-body'}],pieces=[],geometries=new Set();
// Exercise the actual scene builder, including its real style choices and wall
// selection, so a duplicate route wall cannot hide behind a synthetic fixture.
const result=buildFinalCutEstateDetail({box(){},cyl(){},sign(){},unit:null,cylinder:null,
 mesh(material,geometry,x,y,z,sx,sy,sz){if(geometry)geometries.add(geometry);if(material.startsWith('ashlar')||material==='coping')pieces.push({material,geometry,x,y,z,sx,sy,sz});}});
assert.equal(result.masonry.walls,walls.length);assert.equal(result.masonry.blocks,pieces.length);
for(const p of pieces){
 assert(p.sx>0&&p.sy>0&&p.sz>0,'Positive geometry');
 const a=p.geometry.attributes.position,points=[];
 for(let i=0;i<a.count;i++)points.push([p.x+a.getX(i)*p.sx,p.y+a.getY(i)*p.sy,p.z+a.getZ(i)*p.sz]);
 assert(walls.some(w=>points.every(([x,y,z])=>Math.abs(x-w.x)<=w.w/2+1e-6&&Math.abs(z+w.y)<=w.d/2+1e-6&&y>=-1e-6&&y<=w.h+1e-6)),`Block outside physical stone at ${p.x},${p.y},${p.z}`);
}
for(const g of geometries)g.dispose();
fs.mkdirSync('output/final-cut/visual-rough-stone',{recursive:true});
const report={passed:true,...result.masonry,method:'Actual estate builder: each transformed bevel vertex of each face, short-end header and coping piece is contained by one authoritative wall envelope; each physical wall is dressed once.'};
fs.writeFileSync('output/final-cut/visual-rough-stone/masonry-bounds.json',JSON.stringify(report,null,2));console.log(JSON.stringify(report));
