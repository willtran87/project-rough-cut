import assert from 'node:assert/strict';
import fs from 'node:fs';
import {createHedgeGrowth} from '../web/course-hedge-growth.js';
import {HEDGE_PROFILE,coverRadiusAtHeight} from '../web/course-cover-profile.js';
const inventory=JSON.parse(fs.readFileSync('output/level-one-sky-hierarchy/after-native/report.json'));
const hedges=inventory.inventory.objects.filter(o=>o.kind==='hedge');
let vertices=0,triangles=0,leaves=0,shoots=0;
for(const hedge of hedges){
 const {rx,rz}=hedge.hull,seed=-hedge.position[2]/.16;
 const a=createHedgeGrowth(rx,rz,seed),b=createHedgeGrowth(rx,rz,seed);
 shoots+=a.shoots;leaves+=a.leaves;
 for(let i=0;i<a.parts.length;i++){
  const g=a.parts[i],p=g.attributes.position,n=g.attributes.normal,ix=g.index;
  assert.deepEqual(p.array,b.parts[i].attributes.position.array);
  assert.deepEqual(ix.array,b.parts[i].index.array);
  for(let j=0;j<p.count;j++){
   assert(Number.isFinite(p.getX(j)+p.getY(j)+p.getZ(j)));
   assert(Math.hypot(p.getX(j)/rx,p.getZ(j)/rz)<=.997001,'Horizontal collision footprint preserved');
   assert(p.getY(j)>=.29999&&p.getY(j)<=2.22001,'Restrained above-ground growth');
   const length=Math.hypot(n.getX(j),n.getY(j),n.getZ(j));assert(length>.999&&length<1.001,'Finite normalized surfaces');
  }
  for(let j=0;j<p.count;j+=54){
   const x=(p.getX(j)+p.getX(j+1)+p.getX(j+2))/3,y=(p.getY(j)+p.getY(j+1)+p.getY(j+2))/3,z=(p.getZ(j)+p.getZ(j+1)+p.getZ(j+2))/3;
   const angle=Math.atan2(x/rx,z/rz),sector=Math.PI/16;
   const offset=((angle%sector)+sector)%sector-sector/2;
   const polygon=coverRadiusAtHeight(HEDGE_PROFILE,y)*Math.cos(sector/2)/Math.cos(offset);
   assert(Math.hypot(x/rx,z/rz)<polygon,'Every shoot is rooted inside the actual 32-sided hedge');
  }
  const edges=new Map(),directions=new Map();for(let j=0;j<ix.count;j+=3){const ids=[ix.getX(j),ix.getX(j+1),ix.getX(j+2)];for(let k=0;k<3;k++){const a=ids[k],b=ids[(k+1)%3];assert(a>=0&&a<p.count&&a!==b);const key=[Math.min(a,b),Math.max(a,b)].join(':');edges.set(key,(edges.get(key)||0)+1);directions.set(key,(directions.get(key)||0)+(a<b?1:-1));}}
  assert([...edges.values()].every(n=>n===2),'Every stem and leaf has a closed back');assert([...directions.values()].every(n=>n===0),'Consistent winding around every shared edge');
  for(let j=0;j<ix.count;j+=240){
   for(const [offset,count]of [[0,24],...[0,1,2,3,4,5].map(n=>[24+n*36,36])]){
    let volume=0;for(let k=j+offset;k<j+offset+count;k+=3){const a=ix.getX(k),b=ix.getX(k+1),c=ix.getX(k+2);volume+=p.getX(a)*(p.getY(b)*p.getZ(c)-p.getZ(b)*p.getY(c))+p.getY(a)*(p.getZ(b)*p.getX(c)-p.getX(b)*p.getZ(c))+p.getZ(a)*(p.getX(b)*p.getY(c)-p.getY(b)*p.getX(c));}
    assert(volume>1e-10,`Closed leaves and stems face outward: seed=${seed} bucket=${i} offset=${j+offset} component=${offset} volume=${volume}`);
   }
  }
  vertices+=p.count;triangles+=ix.count/3;g.dispose();b.parts[i].dispose();
 }
}
const result={passed:true,hedges:hedges.length,shoots,leaves,vertices,triangles,footprintPreserved:true,closedSurfaces:true,deterministic:true};
fs.writeFileSync('output/level-one-hedge-growth/geometry.json',JSON.stringify(result,null,2));console.log(JSON.stringify(result));
