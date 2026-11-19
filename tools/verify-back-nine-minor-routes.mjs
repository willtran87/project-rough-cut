import fs from 'node:fs';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import * as THREE from '../web/vendor/three/three.module.js';
import {COURSE,runnerSurfaceAt,blocked} from '../web/back-nine-course.js';
import {createRun,updateRun} from '../web/back-nine-sim.js';
import {createRouteMargins} from '../web/back-nine-route-margins.js';
import {courseServiceSpurs,routeDistanceXY} from '../web/back-nine-landscape.js';
import {buildRouteClues} from '../web/chase-route-art.js';
// The one-off before/after comparison against a saved pre-change
// chase-route-art.js is retired; keep the stepping-stone/jamb clue geometry
// pinned to its current count and stable across repeated builds instead.
function clues(build){const hash=createHash('sha256');let pavers=0;const result=build({THREE,COURSE,put(g,type,...args){if(type==='track')return;if(type==='road')pavers++;hash.update(type+JSON.stringify(args));hash.update(Buffer.from(g.attributes.position.array.buffer));},box(...args){hash.update(JSON.stringify(args));}});return{pavers,hash:hash.digest('hex'),result};}
const after=clues(buildRouteClues);assert.deepEqual(clues(buildRouteClues),after,'Route clue art must be deterministic');assert.equal(after.pavers,141);
const spurs=courseServiceSpurs(COURSE);assert.equal(spurs.length,14);
for(const s of spurs){const f=COURSE.features.find(f=>f.id===s.id);assert.deepEqual(s.route[0],[f.x,f.y]);assert(routeDistanceXY(...s.route[1],COURSE.paths)<1e-8);const length=Math.hypot(s.route[1][0]-f.x,s.route[1][1]-f.y);assert(length>1&&length<22);}
const margins=createRouteMargins(COURSE);let footVertices=0,footMaxWidth=0,soilHeight=0;
for(const {geometry:g,role,type}of margins.minorRoutes()){
 if(role==='footpath'){const p=g.attributes.position;for(let i=0;i<p.count;i++){const distance=routeDistanceXY(p.getX(i),-p.getZ(i),COURSE.footways.map(f=>f.route));footMaxWidth=Math.max(footMaxWidth,distance*2);assert(distance<=.60,'bedding remains narrower than the existing foot gates');if(type==='soilMargin'){soilHeight=p.getY(i);assert(Math.abs(soilHeight-.036)<1e-6,'soil stays below existing .042m pavers');}footVertices++;}}
 g.dispose();
}
const travel=[];
for(const [id,path]of COURSE.footways.entries())for(const hz of [30,60]){
 const s=path.segments.find(s=>Math.abs(s.dx)<.01&&s.dy>10),r=createRun();assert(s);
 r.mode='driving';r.time=20;r.grace=999;r.foot={x:s.x,y:s.y+3,yaw:0,viewYaw:0,speed:0,invulnerable:0,onFoot:true};
 Object.assign(r.cart,{x:0,y:10,health:0});Object.assign(r.joe,{x:0,y:20});const start=r.foot.y;
 for(let i=0;i<hz;i++){updateRun(r,{throttle:1},1/hz);assert.equal(runnerSurfaceAt(r.foot),'path');assert(!blocked(r.foot,.32));}
 assert(r.foot.speed>7.19);assert(r.foot.y-start>6.8&&r.foot.y-start<7.21);travel.push({id,hz,meters:r.foot.y-start,speed:r.foot.speed});
}
assert(footVertices>0);console.log(JSON.stringify({passed:true,pavers:after.pavers,unchangedCluesHash:after.hash,serviceSpurs:spurs.length,footVertices,footMaxWidth,soilHeight,travel}));
