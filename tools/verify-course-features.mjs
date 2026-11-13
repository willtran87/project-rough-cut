import fs from 'node:fs';
import assert from 'node:assert/strict';
import * as course from '../web/back-nine-course.js';
import {constrainFeatureMotion,hullOverlap} from '../web/vehicle-contact.js';
const fallback=await import('data:text/javascript;base64,'+Buffer.from(fs.readFileSync('web/back-nine-course.js','utf8').replace("import bakedNavigation from './assets/baked/course-navigation.js';","const bakedNavigation={signature:0,edges:[]};")).toString('base64'));
assert.equal(course.COURSE.features.length,9);assert(course.navigationStats().baked);
let contacts=0,routes=0;
for(const f of course.COURSE.features){
 assert(course.COURSE.obstacles.some(o=>o.id===f.id&&o.box));assert(course.blocked(f));
 const from={x:f.x-f.rx-8,y:f.y},to={x:f.x+f.rx+8,y:f.y};
 assert(!course.lineClear(from,to,1.65));
 assert.deepEqual(course.planMowerRoute(from,to),fallback.planMowerRoute(from,to));routes++;
 for(const kind of ['cart','mower','foot'])for(const [dx,dy]of [[1,0],[-1,0],[0,1],[0,-1]]){
  const radius=(dx?f.rx:f.ry)+7,yaw=Math.atan2(-dx,-dy),start={x:f.x+dx*radius,y:f.y+dy*radius,yaw};
  const v={x:f.x-dx*radius,y:f.y-dy*radius,yaw,speed:25};
  assert(constrainFeatureMotion(v,start,kind),`${f.id}: ${kind} must stop`);
  assert(!hullOverlap(v,kind,f,'feature'),`${f.id}: ${kind} penetrates`);
  const stopped={...v};v.x+=dx*2;v.y+=dy*2;v.speed=-4;
  constrainFeatureMotion(v,stopped,kind);assert(Math.hypot(v.x-stopped.x,v.y-stopped.y)>1.99,'Can reverse out');contacts++;
 }
}
assert.equal(course.navigationStats().edgeChecks,0);
const report={passed:true,features:9,contacts,routes,stats:course.navigationStats()};
fs.mkdirSync('output/course-features',{recursive:true});fs.writeFileSync('output/course-features/collision-navigation.json',JSON.stringify(report,null,2));console.log(JSON.stringify(report));
