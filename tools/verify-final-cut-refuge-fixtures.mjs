import assert from 'node:assert/strict';
import fs from 'node:fs';
import * as THREE from '../web/vendor/three/three.module.js';
import {REFUGES} from '../web/final-cut-course.js';
import {createRefugeLighting} from '../web/final-cut-refuge-lighting.js';
import {createRun} from '../web/final-cut-sim.js';

const scene=new THREE.Scene(),parts=[];
const lighting=createRefugeLighting(scene,{box:(mat,x,y,z,w,h,d)=>parts.push({mat,x,y,z,w,h,d})});
const intersects=(a,b)=>['x','y','z'].every((axis,i)=>Math.abs(a[axis]-b[axis])<=(a[['w','h','d'][i]]+b[['w','h','d'][i]])/2+1e-6);
const results=[];
for(const s of REFUGES){
 const own=parts.filter(p=>Math.abs(p.z+s.y)<1),plate={x:s.x,y:2.9,z:-s.y,w:s.w+.7,h:.3,d:s.d+.7};
 assert(own.every(p=>p.y-p.h/2>2.1),'Every fitting remains above standing clearance');
 const reached=[plate],pending=own.slice();
 while(pending.length){const i=pending.findIndex(p=>reached.some(r=>intersects(p,r)));assert(i>=0,`${s.id}: every piece must connect to the existing roof through actual fittings`);reached.push(...pending.splice(i,1));}
 const light=lighting.lights.find(l=>l.name.endsWith(s.id));assert(light.position.y<Math.min(...own.map(p=>p.y-p.h/2)));
 assert(own.some(p=>p.mat==='lamp'&&Math.abs(p.x-light.position.x)<1e-8&&Math.abs(p.z-light.position.z)<1e-8),'Light originates below its actual lens');
 results.push({id:s.id,parts:own.length,minimumHeight:Math.min(...own.map(p=>p.y-p.h/2)),origin:light.position.toArray()});
}
const run=createRun({checkpoint:1});Object.assign(run.rig,{x:39,y:50});lighting.update(run);
let count=lighting.stats().lights[0].updates;run.time++;lighting.update(run);assert.equal(lighting.stats().lights[0].updates,count,'Static bunker shadow is cached');
Object.assign(run.rig,{x:-4,y:15});lighting.update(run);assert(lighting.stats().lights[0].updates>count);count=lighting.stats().lights[0].updates;
run.time++;lighting.update(run);assert(lighting.stats().lights[0].updates>count,'Nearby moving machinery refreshes shadows');
Object.assign(run.rig,{x:39,y:50});lighting.update(run);count=lighting.stats().lights[0].updates;run.time++;lighting.update(run);assert.equal(lighting.stats().lights[0].updates,count,'Departure restores a static shadow');
// Dispose actual allocated render targets, including their shadow-depth maps.
let disposed=0;for(const light of lighting.lights){light.shadow.map=new THREE.WebGLRenderTarget(16,16);light.shadow.map.addEventListener('dispose',()=>disposed++);}
lighting.dispose();assert.equal(disposed,3);assert.equal(scene.children.length,0);
fs.mkdirSync('output/final-cut/refuge-lighting',{recursive:true});fs.writeFileSync('output/final-cut/refuge-lighting/fixtures.json',JSON.stringify({passed:true,results,disposed},null,2));console.log(JSON.stringify({passed:true,results,disposed}));
