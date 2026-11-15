import assert from 'node:assert/strict';
import fs from 'node:fs';
import {DRAIN_PUDDLES,insideWetPolygon,SHALLOW_WATER_HEIGHT} from '../web/under-green-wet-ground.js';
import {GALLERY_RUNOFF_DRIPS} from '../web/under-green-gallery-runoff.js';
import {shallowPoolGeometry} from '../web/under-green-puddle-geometry.js';
import {onFloor,solid} from '../web/under-green-course.js';
import {waterContactHeight,createDrainWaterContacts,drainDripSample} from '../web/under-green-water-contacts.js';

const pools=DRAIN_PUDDLES.filter(p=>GALLERY_RUNOFF_DRIPS.some(d=>d.pool===p.id)),rows=[];
for(const pool of pools){
 const g=shallowPoolGeometry(pool,SHALLOW_WATER_HEIGHT),p=g.attributes.position,idx=g.index;let area=0;
 for(const a of Object.values(g.attributes))for(const v of a.array)assert(Number.isFinite(v));
 for(let i=0;i<p.count;i++){assert(onFloor(p.getX(i),-p.getZ(i)));assert(!solid({x:p.getX(i),y:-p.getZ(i)},.001));assert(Math.abs(p.getY(i)-SHALLOW_WATER_HEIGHT)<1e-8);}
 for(let i=0;i<idx.count;i+=3){const [a,b,c]=[0,1,2].map(j=>idx.getX(i+j));const cross=(p.getZ(b)-p.getZ(a))*(p.getX(c)-p.getX(a))-(p.getX(b)-p.getX(a))*(p.getZ(c)-p.getZ(a));assert(cross>=-1e-7,'downward water triangle');area+=cross*.5;}
 const signed=Math.abs(pool.points.reduce((n,a,i)=>{const b=pool.points[(i+1)%pool.points.length];return n+a[0]*b[1]-b[0]*a[1];},0))*.5;
 assert(Math.abs(area-signed)<1e-5,'overlapping/missing triangulation');
 for(const d of GALLERY_RUNOFF_DRIPS.filter(d=>d.pool===pool.id)){assert(insideWetPolygon(d,pool.points));assert.equal(waterContactHeight(d,[],[],0),SHALLOW_WATER_HEIGHT);assert.equal(waterContactHeight(d,[],[],.3),.3);const s=drainDripSample(d,0,SHALLOW_WATER_HEIGHT);assert(s.fall>0&&s.fall<d.period);}
 rows.push({id:pool.id,vertices:p.count,triangles:idx.count/3,area});g.dispose();
}
// The rendered contact sampler receives continuous time and actual water
// height. Every new source must produce its own ripple, with bounded storage.
const contacts=createDrainWaterContacts([]),r={time:0,elapsed:0,mode:'playing',player:{walk:0,speed:0,x:0,y:8,yaw:0},joe:{phase:'absent'}};
const seen=new Set();for(let i=0;i<=1500;i++){r.time=i/60;contacts.update(r,[],null);const e=contacts.stats().last;if(e?.kind==='drip')seen.add(`${e.x},${e.y}`);}
for(const d of GALLERY_RUNOFF_DRIPS)assert(seen.has(`${d.x},${d.y}`),'missing source contact');
const before=contacts.stats();contacts.update(r,[],null);assert.deepEqual(contacts.stats(),before);
const report={passed:true,rows,drips:GALLERY_RUNOFF_DRIPS.length,contacts:contacts.stats()};fs.mkdirSync('output/under-green/visual-pass78',{recursive:true});fs.writeFileSync('output/under-green/visual-pass78/geometry.json',JSON.stringify(report,null,2));console.log(JSON.stringify(report));
