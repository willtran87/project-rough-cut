import assert from 'node:assert/strict';
import * as THREE from '../web/vendor/three/three.module.js';
import {backNineGust,createBackNineWind} from '../web/back-nine-wind.js';
import {createMowerClippings,mowerCanCut} from '../web/chase-mower-clippings.js';
import {createRun} from '../web/back-nine-sim.js';
import {surfaceAt,COURSE} from '../web/back-nine-course.js';
let samples=0;for(let time=0;time<30;time+=.3)for(let y=0;y<820;y+=17)for(const x of [-35,0,35]){const g=backNineGust(time,x,-y);assert(g>=.36-1e-10&&g<=1+1e-10);samples++;}
const wind=createBackNineWind();wind.update({time:12},false);assert.equal(wind.stats().motion,1);wind.update({time:12},true);assert.equal(wind.stats().motion,0);
const scene=new THREE.Scene(),art=createMowerClippings(scene),r=createRun();r.mode='driving';r.time=20;Object.assign(r.joe,{speed:12,yaw:0});r.tactics.floodUntil.fill(100);
let point=null;for(const w of COURSE.wet)for(let dx=-w.r+3;dx<w.r-3;dx++)for(let dy=-w.r+3;dy<w.r-3;dy++){const p={x:w.x+dx,y:w.y+dy};if(surfaceAt(p,r)==='wet'&&mowerCanCut(p.x-2,p.y+1)&&mowerCanCut(p.x+2,p.y+1))point=p;}
assert(point);Object.assign(r.joe,point);art.update(r);let soilPeak=0;
for(let i=0;i<80;i++){r.time+=1/60;art.update(r);soilPeak=Math.max(soilPeak,art.stats().wetSoil);assert(art.stats().active<=96);}assert(soilPeak>0);
const frozen=art.stats();r.mode='paused';art.update(r);assert.deepEqual(art.stats(),frozen);art.update(r,true);assert.equal(art.stats().active,0);
art.update(createRun());assert.equal(art.stats().active,0);art.dispose();assert.equal(scene.children.length,0);
console.log(JSON.stringify({passed:true,gustSamples:samples,soilPeak,point,checks:['bounded coordinated gust','reduced motion','real wet turf emission','bounded distinct soil clods','pause and retry','disposal']}));
