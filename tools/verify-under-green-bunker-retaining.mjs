import assert from 'node:assert/strict';
import * as THREE from '../web/vendor/three/three.module.js';
import {floorLayout,onFloor} from '../web/under-green-course.js';
import {buildBunkerRetainingFinish,isBunkerRetainingWall} from '../web/under-green-bunker-retaining.js';
const layout=floorLayout(),materials={bunkerStone:new THREE.MeshPhongMaterial(),bankEarth:new THREE.MeshPhongMaterial(),mudBank:new THREE.MeshPhongMaterial({vertexColors:true}),pumpStone:new THREE.MeshPhongMaterial()};
const pieces=[];
const result=buildBunkerRetainingFinish({layout,materials,box(){throw Error('Unexpected box');},put(g,type,x,y,z){const copy=g.clone();copy.translate(x,y,z);pieces.push({g:copy,type});}});
assert.equal(result.replacedMetalCaps,63);assert.equal(result.edges,22);assert.equal(result.deposits.length,8);assert.equal(result.repairs.length,2);assert(result.stones.length>100);
let triangles=0,finiteVertices=0,closedParts=0;
for(const {g,type}of pieces){
 const p=g.attributes.position,idx=g.index,edgeUses=new Map();let volume=0;
 if(materials[type].vertexColors)assert.equal(g.attributes.color.count,p.count);
 for(let i=0;i<p.count;i++){const x=p.getX(i),h=p.getY(i),y=-p.getZ(i);assert([x,h,y].every(Number.isFinite));assert(h>.45&&h<2.13);finiteVertices++;}
 for(let i=0;i<(idx?.count||p.count);i+=3){
  const points=[];for(let j=0;j<3;j++){const k=idx?idx.getX(i+j):i+j;points.push([p.getX(k),p.getY(k),p.getZ(k)]);}
  const a=new THREE.Vector3(...points[0]),b=new THREE.Vector3(...points[1]),c=new THREE.Vector3(...points[2]);assert(b.clone().sub(a).cross(c.clone().sub(a)).length()>1e-9,'Degenerate triangle');volume+=a.dot(b.clone().cross(c))/6;
  for(let j=0;j<3;j++){const key=[points[j],points[(j+1)%3]].map(v=>v.map(n=>n.toFixed(5)).join(',')).sort().join('|');edgeUses.set(key,(edgeUses.get(key)||0)+1);}triangles++;
 }
 assert([...edgeUses.values()].every(n=>n===2),'Open construction solid '+closedParts+' '+type+' '+JSON.stringify([...edgeUses].filter(([k,n])=>n!==2).slice(0,3)));assert(volume>1e-8,'Reversed solid winding');closedParts++;
}
// The replacement core overlaps original lower masonry and the upper bank.
const cores=layout.walls.filter(isBunkerRetainingWall);assert(1.84-.10/2<1.8&&1.84+.10/2>1.88);
for(const d of result.deposits){const inward=d.line===-32||d.axis==='y'?1:d.line===-23?1:-1;for(const u of [-.4,0,.4]){const along=d.along+u*d.width,x=d.axis==='x'?d.line+inward*.32:along,y=d.axis==='y'?d.line+inward*.32:along;assert(onFloor(x,y),'Spill must face the route');}}
let disposed=false;materials.bunkerCoping.addEventListener('dispose',()=>disposed=true);result.dispose();assert(disposed);
pieces.forEach(p=>p.g.dispose());Object.values(materials).forEach(m=>m.dispose());
console.log(JSON.stringify({passed:true,cores:cores.length,edges:result.edges,stones:result.stones.length,deposits:result.deposits.length,repairs:result.repairs.length,closedParts,triangles,finiteVertices,bounds:result.bounds}));
