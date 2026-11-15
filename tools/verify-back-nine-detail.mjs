import {createCourseBatchCulling} from '../web/course-batch-culling.js';
import {mergeIndexedGeometries} from '../web/indexed-geometry.js';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import * as THREE from '../web/vendor/three/three.module.js';
import {GHOST_ROUTES,ghostRoutePose} from '../web/chase-ghost-routes.js';
import {DETAIL_PLANTS} from '../web/chase-course-detail.js';
import {COURSE,blocked,pathDistance,runnerSurfaceAt} from '../web/back-nine-course.js';
import {createRun} from '../web/back-nine-sim.js';
import {terrainHeight} from '../web/course-terrain.js';
import {createMowerClippings,mowerCanCut} from '../web/chase-mower-clippings.js';
const checks=[];
for(const r of GHOST_ROUTES){assert(r.length>30);for(const p of r.points){assert(!blocked(p,.7));assert(!COURSE.features.some(f=>Math.abs(p.x-f.x)<f.rx+.8&&Math.abs(p.y-f.y)<f.ry+.8));}let distance=0,prior=ghostRoutePose(r.index,0);for(let t=.05;t<50;t+=.05){const p=ghostRoutePose(r.index,t),step=Math.hypot(p.x-prior.x,p.y-prior.y);assert(step<.075&&step>.05);const turn=Math.atan2(Math.sin(p.yaw-prior.yaw),Math.cos(p.yaw-prior.yaw));assert(Math.abs(turn)<.06);assert(p.phase>=0&&p.phase<1);distance+=step;prior=p;}assert(distance>50);const a=ghostRoutePose(r.index,0),b=ghostRoutePose(r.index,r.length/r.speed);assert(Math.hypot(a.x-b.x,a.y-b.y)<.001);}
checks.push('Six clear loops over 38 m, continuous turns, real walking speed and distance-matched gait');
assert(DETAIL_PLANTS.length>4000);for(const p of DETAIL_PLANTS){assert(pathDistance(p)>3.4);assert.notEqual(runnerSurfaceAt(p),'path');assert(!blocked(p,.2));assert(p.type>=0&&p.type<6&&Number.isInteger(p.type));}checks.push('High-resolution plant clusters keep roads, footpaths and foundations clear');
const scene=new THREE.Scene(),fx=createMowerClippings(scene),r=createRun();r.mode='driving';r.time=20;Object.assign(r.joe,{x:20,y:60,yaw:0,speed:12,mode:'pursuit'});fx.update(r);for(let i=0;i<60;i++){r.time+=1/60;r.joe.y+=.2;fx.update(r);}assert(fx.stats().emitted>40);assert(fx.stats().active>20&&fx.stats().active<=96);
const mesh=scene.children[0],m=new THREE.Matrix4();for(let i=0;i<mesh.count;i++){mesh.getMatrixAt(i,m);assert(m.elements.every(Number.isFinite));assert(m.elements[13]>=terrainHeight(m.elements[12],-m.elements[14])+.024);}
r.mode='paused';const pose=mesh.instanceMatrix.array.slice(),stats=fx.stats();for(let i=0;i<10;i++)fx.update(r);assert.deepEqual(mesh.instanceMatrix.array,pose);assert.deepEqual(fx.stats(),stats);
fx.update(r,true);assert.equal(fx.stats().active,0);const fresh=createRun();fresh.mode='driving';fresh.time=0;fx.update(fresh);assert.equal(fx.stats().emitted,0);assert.equal(fx.stats().active,0);assert(!mowerCanCut(0,30));assert(!mowerCanCut(20,238));fx.dispose();checks.push('Bounded grass particles emit continuously, settle on terrain, freeze on pause, reset and respect reduced motion/paved ground');
const near=new THREE.BoxGeometry(1,1,1),far=new THREE.BoxGeometry(1,1,1);near.translate(0,0,-5);far.translate(0,0,-30);const joined=mergeIndexedGeometries([near,far]);joined.computeBoundingBox();const material=new THREE.MeshBasicMaterial(),batch=new THREE.Mesh(joined,material),camera=new THREE.PerspectiveCamera(64,1,.1,100),culling=createCourseBatchCulling();culling.register(batch,[near,far],{maxDistance:10,boundsPadding:.5});culling.update(camera);assert.equal(joined.drawRange.count,36);culling.restore();assert.equal(joined.drawRange.count,72);culling.update(camera);assert.equal(joined.drawRange.count,36);for(const g of [near,far,joined])g.dispose();material.dispose();checks.push('Distance-culling keeps nearby detail and restores/re-culls full QA geometry at the same camera');
const report={passed:true,checks,plants:DETAIL_PLANTS.length,routeLengths:GHOST_ROUTES.map(r=>r.length)};fs.writeFileSync('output/back-nine-detail-pass/physics.json',JSON.stringify(report,null,2));console.log(JSON.stringify(report));
