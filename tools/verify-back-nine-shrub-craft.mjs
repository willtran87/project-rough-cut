import assert from 'node:assert/strict';
import fs from 'node:fs';
import * as THREE from '../web/vendor/three/three.module.js';
import {COURSE} from '../web/back-nine-course.js';
import {BORDER_SHRUBS,borderShrubPlants,windbreakPlants,windbreakCoreGeometry,planterPlants} from '../web/back-nine-shrub-craft.js';
let coreVertices=0;
for(const s of COURSE.sightbreaks){
 const g=windbreakCoreGeometry(THREE,s),p=g.attributes.position;
 assert(p.array.every(Number.isFinite));assert(g.attributes.normal.array.every(Number.isFinite));
 for(let i=0;i<p.count;i++){assert(Math.abs(p.getX(i))<s.rx);assert(Math.abs(p.getZ(i))<s.ry);assert(p.getY(i)>.1&&p.getY(i)<3.5);}
 // An unbroken opaque centre remains above the runner's eye line. Foliage
 // never replaces the functional cover with an alpha-tested visual gap.
 const upper=Array.from({length:p.count},(_,i)=>p.getY(i)).filter(y=>y>1);assert(Math.max(...upper)>2.4);assert(Math.max(...upper)-Math.min(...upper)>.2);
 assert(g.userData.windbreak.coreIndices>0,'Closed core is audited by verify-windbreak-growth.mjs');
 coreVertices+=p.count;g.dispose();
 for(const p of windbreakPlants(s)){assert(Math.abs(p.y-s.y)<s.ry);assert(p.single||Math.abs(p.x-s.x)+p.width*.5<s.rx);}
}
const planters=COURSE.features.filter(f=>planterPlants(f).length);
for(const f of planters)for(const p of planterPlants(f)){
 assert(Math.abs(p.x-f.x)+p.width*.5<f.rx);assert(Math.abs(p.y-f.y)+p.width*.5<f.ry);assert(p.base>=.5);
}
for(const s of BORDER_SHRUBS)for(const p of borderShrubPlants(s)){assert(Math.abs(p.x)-p.width*.5>40);assert(Math.abs(p.y-s.y)<4);}
const report={passed:true,coreVertices,windbreaks:COURSE.sightbreaks.length,borders:BORDER_SHRUBS.length,planters:planters.length,checks:['Opaque cover remains within existing sight-break footprint and above eye height','Planted strips remain inside their original destructible footprint','Border foliage remains beyond the playable fence','All core positions and normals finite; upper profiles vary']};
const out=process.argv[2]||'output/back-nine-visual-upgrade/shrubs';
fs.mkdirSync(out,{recursive:true});fs.writeFileSync(out+'/contracts.json',JSON.stringify(report,null,2));console.log(JSON.stringify(report));
