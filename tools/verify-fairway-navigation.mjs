import fs from 'node:fs';
import assert from 'node:assert/strict';
import * as current from '../web/back-nine-course.js';

// Check the rebuilt bake against live clearance queries on the revised layout.
const source=fs.readFileSync('web/back-nine-course.js','utf8')
 .replace("import bakedNavigation from './assets/baked/course-navigation.js';","const bakedNavigation={signature:0,edges:[]};")
 .replace(/from '([^']+)'/g,(_,p)=>`from '${new URL('../web/'+p,import.meta.url).href}'`);
const fallback=await import('data:text/javascript;base64,'+Buffer.from(source).toString('base64'));
assert(current.navigationStats().baked);
assert(!fallback.navigationStats().baked);
const pairs=[[{x:2,y:420},{x:-29,y:449}],[{x:4,y:770},{x:4,y:820}],[{x:5,y:144},{x:5,y:123}],[{x:39,y:30},{x:32,y:30}]];
for(let i=0;i<64;i++)pairs.push([{x:Math.sin(i*7.1)*34,y:40+(i*71)%735},{x:Math.cos(i*3.8)*34,y:40+(i*71)%735+(i%3-1)*36}]);
for(const [from,to]of pairs)assert.deepEqual(current.planMowerRoute(from,to),fallback.planMowerRoute(from,to));
assert.equal(current.navigationStats().edgeChecks,0);
assert(fallback.navigationStats().edgeChecks>0);
const beds=current.COURSE.obstacles.filter(o=>o.kind==='hedge');
for(const b of beds)assert(current.pathDistance(b)>=b.r+4,'Planted borders must clear the driving routes');
const report={passed:true,exactRoutes:pairs.length,plantingBeds:beds.length,stats:current.navigationStats()};
fs.writeFileSync('output/fairway-design/navigation.json',JSON.stringify(report,null,2));
console.log(JSON.stringify(report));
