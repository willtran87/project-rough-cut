import fs from 'node:fs';
import assert from 'node:assert/strict';
import {performance} from 'node:perf_hooks';
import * as THREE from '../web/vendor/three/three.module.js';
import {contourGround,terrainHeight} from '../web/course-terrain.js';
import {coursePatch,courseRibbon} from '../web/back-nine-landscape.js';
import {COURSE,navigationStats} from '../web/back-nine-course.js';
// Converted to today's code only: the saved old course-terrain.js comparison was dropped.
const out='output/back-nine-experience/terrain-cost';fs.mkdirSync(out,{recursive:true});
const fixtures=[];
for(const y of [12,72,144,240,372,444,660,804]){const g=new THREE.PlaneGeometry(84,24,42,12);g.rotateX(-Math.PI/2);g.translate(0,-.005,-y);fixtures.push({name:'turf-'+y,g,height:-.005});}
for(const [x,y]of [[55,60],[21,65],[0,300],[-10,373],[-23,790]]){const g=coursePatch(THREE,3);g.scale(20,1,12);g.translate(x,.025,-y);fixtures.push({name:`patch-${x}-${y}`,g,height:.025});}
courseRibbon(THREE,(g,type)=>fixtures.push({name:'road-'+fixtures.length,g:g.clone(),height:.018}),'road',COURSE.paths[0].slice(0,6),6,.018);
const border=new THREE.BoxGeometry(28,.35,24);border.translate(55,-.06,-72);fixtures.push({name:'raised-border',g:border});
const rows=[];let samples=0;
function area(g){let a=0;const p=g.attributes.position,i=g.index;for(let n=0;n<i.count;n+=3){const u=i.getX(n),v=i.getX(n+1),w=i.getX(n+2);a+=Math.abs((p.getX(v)-p.getX(u))*(p.getZ(w)-p.getZ(u))-(p.getZ(v)-p.getZ(u))*(p.getX(w)-p.getX(u)))*.5;}return a;}
for(const f of fixtures){
 const t1=performance.now(),b=contourGround(THREE,f.g),afterMs=performance.now()-t1;
 if(f.height!==undefined)assert(Math.abs(area(f.g)-area(b))<.002,'No surface coverage removed: '+f.name);
 if(f.height!==undefined){const p=b.attributes.position,idx=b.index;for(let n=0;n<idx.count;n+=3)for(const weights of [[1/3,1/3,1/3],[.8,.1,.1],[.1,.8,.1],[.1,.1,.8]]){
  let x=0,y=0,z=0;for(let j=0;j<3;j++){const v=idx.getX(n+j);x+=p.getX(v)*weights[j];y+=p.getY(v)*weights[j];z+=p.getZ(v)*weights[j];}
  assert(Math.abs(y-terrainHeight(x,-z)-f.height)<.00003,'Surface departs from original height field: '+f.name);samples++;
 }}
 rows.push({name:f.name,vertices:b.attributes.position.count,triangles:b.index.count/3,ms:afterMs});
 b.dispose();f.g.dispose();
}
let heights=0;for(let y=0;y<=835;y+=.7)for(let x=-42;x<=42;x+=1.3){assert(Number.isFinite(terrainHeight(x,y)));heights++;}
assert(navigationStats().baked);fs.writeFileSync(out+'/geometry.json',JSON.stringify({passed:true,rows,samples,heights,navigation:navigationStats()},null,2));console.log(JSON.stringify({passed:true,samples,heights,triangles:rows.reduce((a,r)=>a+r.triangles,0),milliseconds:rows.reduce((a,r)=>a+r.ms,0)}));
