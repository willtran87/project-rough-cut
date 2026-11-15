import assert from 'node:assert/strict';
import {COURSE,navigationStats} from '../web/back-nine-course.js';
import {createRouteMargins} from '../web/back-nine-route-margins.js';
import {contourGround,terrainHeight} from '../web/course-terrain.js';
import * as THREE from '../web/vendor/three/three.module.js';
const before=JSON.stringify(COURSE),nav=navigationStats(),margins=createRouteMargins(COURSE);
let parts=0,vertices=0,triangles=0,minClearance=Infinity,maxClearance=-Infinity,featherVertices=0;
function inspect(g,type,role=null){
 const original=g.attributes.color;assert.equal(original.itemSize,4);const n=g.attributes.normal;for(let i=0;i<g.index.count;i++)assert(n.getY(g.index.getX(i))>.99,'top-facing border winding');
 const ground=contourGround(THREE,g),p=ground.attributes.position,c=ground.attributes.color,expected=type==='soilMargin'?(role==='footpath'?.036:.041):.03;
 assert.equal(c.itemSize,4,'terrain clipping retains vertex alpha');
 for(let i=0;i<p.count;i++){const delta=p.getY(i)-terrainHeight(p.getX(i),-p.getZ(i));minClearance=Math.min(minClearance,delta);maxClearance=Math.max(maxClearance,delta);assert(Math.abs(delta-expected)<.0001,'same terrain field');assert(c.getW(i)>=0&&c.getW(i)<=1);if(c.getW(i)>0&&c.getW(i)<.9)featherVertices++;}
 // Terrain-cell clipping must retain contact throughout triangle interiors.
 const idx=ground.index;for(let i=0;i<idx.count;i+=3){const ids=[idx.getX(i),idx.getX(i+1),idx.getX(i+2)],x=ids.reduce((s,id)=>s+p.getX(id),0)/3,y=ids.reduce((s,id)=>s+p.getY(id),0)/3,z=ids.reduce((s,id)=>s+p.getZ(id),0)/3;assert(Math.abs(y-terrainHeight(x,-z)-expected)<.0001);}
 parts++;vertices+=p.count;triangles+=ground.index.count/3;ground.dispose();
}
for(let i=0;i<COURSE.paths.length;i++){const option=COURSE.routeOptions.find(r=>r.path===i),width=option?.width||(i?4.6:5.8);for(const {geometry,type}of margins.route(i,Math.max(6,width+.5))){inspect(geometry,type);geometry.dispose();}}
for(const {geometry,type}of margins.courts()){inspect(geometry,type);geometry.dispose();}
for(const {geometry,type,role}of margins.minorRoutes()){inspect(geometry,type,role);geometry.dispose();}
assert.equal(margins.stats().footpaths,COURSE.footways.length);assert.equal(margins.stats().shortcuts,COURSE.shortcuts.length);assert.equal(margins.stats().apertures,COURSE.decisions.length);
assert.equal(margins.stats().courts,4);assert(featherVertices>1000);assert.equal(JSON.stringify(COURSE),before);assert.deepEqual(navigationStats(),nav);
console.log(JSON.stringify({passed:true,parts,vertices,triangles,minClearance,maxClearance,featherVertices,margins:margins.stats()}));
