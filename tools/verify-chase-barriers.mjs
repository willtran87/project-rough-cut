import assert from 'node:assert/strict';
import fs from 'node:fs';
import {createRun,updateRun} from '../web/back-nine-sim.js';
import {COURSE,blocked} from '../web/back-nine-course.js';
import {leaveBrokenCart} from '../web/chase-player.js';
import {updateCourseFX} from '../web/back-nine-course-fx.js';
import {barrierBreakDirection,barrierHalfWidth,barrierFootprint} from '../web/chase-barriers.js';
import {hullOverlap} from '../web/vehicle-contact.js';
import {chaseMessages} from '../web/back-nine-messages.js';
import {beginRamWindup} from '../web/mower-ram.js';
import {distance} from '../web/back-nine-course.js';
import {createMowerTracks} from '../web/mower-tracks.js';
import {canMarkMownGround} from '../web/mower-track-ground.js';
import * as THREE from '../web/vendor/three/three.module.js';
const out='output/back-nine-experience/barriers';fs.mkdirSync(out,{recursive:true});const crossings=[];
for(const [index,g]of COURSE.hurdles.entries())for(const foot of [false,true])for(const direction of [-1,1]){
 const r=createRun();r.mode='driving';r.grace=999;r.time=5;r.joe.x=38;r.joe.y=4;if(foot){leaveBrokenCart(r);r.time+=2;r.cart.x=38;r.cart.y=820;}
 const c=foot?r.foot:r.cart,yaw=(g.yaw||0)+(direction<0?Math.PI:0),f={x:Math.sin(yaw),y:Math.cos(yaw)};
 Object.assign(c,{x:g.x-f.x*3,y:g.y-f.y*3,yaw,viewYaw:yaw,speed:0});assert(!blocked(c,foot?.32:.85),'Fixture must be clear');
 let wait=0,brokenAt=null;for(let i=0;i<600;i++){updateRun(r,{throttle:1,brake:!foot},1/60);if(r.courseFX.breaks[index].press>0&&r.courseFX.breaks[index].age<0)wait+=1/60;if(r.courseFX.breaks[index].age>=0){brokenAt??=r.time;if((c.x-g.x)*f.x+(c.y-g.y)*f.y>2)break;}}
 assert(brokenAt!==null,`Barrier ${index} foot=${foot} dir=${direction} cannot be pushed`);assert(wait>=.65&&wait<.8);assert((c.x-g.x)*f.x+(c.y-g.y)*f.y>2,JSON.stringify({index,foot,direction,actor:c,gate:g}));
 const type=g.shortcut===undefined?'barrier':'shortcut';assert.equal(r.events.filter(e=>e.type===type&&(e.index===(g.shortcut??index))).length,1);crossings.push({index,foot,direction,wait,seconds:r.time-5});
}
// A cutting deck clips the end even though the center is outside the old point test.
const gate=COURSE.hurdles.find(g=>g.x===-9&&g.y===70),index=COURSE.hurdles.indexOf(gate),r=createRun();r.mode='driving';r.grace=0;Object.assign(r.cart,{x:-9,y:61});Object.assign(r.joe,{x:gate.x+3.4,y:gate.y-1.4,yaw:0,speed:14});assert(hullOverlap(r.joe,'mower',barrierFootprint(gate),'feature'));updateCourseFX(r,1/60);assert.equal(r.courseFX.breaks[index].age,0);const serial=r.courseFX.cue.serial;updateCourseFX(r,1/60);assert.equal(r.courseFX.cue.serial,serial);assert.equal(chaseMessages(r).sound,'');assert(chaseMessages(r,{soundCaptions:true}).sound.includes('Timber'));assert(!chaseMessages(r).banner.includes('Timber'));
const near=createRun();near.mode='driving';Object.assign(near.joe,{x:gate.x+barrierHalfWidth(gate)+2.6,y:gate.y-1.4,yaw:0,speed:14});updateCourseFX(near,1/60);assert(near.courseFX.breaks[index].age<0,'Near miss must not shatter wood');
for(const yaw of [0,.4,1.5,Math.PI])for(const sign of [-1,1])assert.equal(barrierBreakDirection({yaw},{yaw,speed:sign*5}),sign);
const paused=JSON.stringify(r);r.mode='paused';const frozen=JSON.stringify(r);updateRun(r,{throttle:1},1);assert.equal(JSON.stringify(r),frozen);assert.notEqual(paused,frozen);assert(createRun().courseFX.breaks.every(b=>b.age===-1));
// Actual windup -> locked charge -> timber contact -> miss -> usable relief.
// The runner dodges; this is not an injected broken-barrier or missed state.
const chase=createRun();chase.mode='driving';chase.grace=0;chase.time=20;chase.tension.phase='stalk';
chase.foot={x:-22,y:65,yaw:0,viewYaw:0,speed:0,invulnerable:0,onFoot:true,surface:'rough'};
Object.assign(chase.cart,{x:25,y:20,health:0,failedAt:0});Object.assign(chase.joe,{x:-22,y:35,yaw:0,speed:6,seenAge:0});chase.joe.lastSeen={x:-22,y:65};beginRamWindup(chase);
const scene=new THREE.Scene(),material=new THREE.MeshBasicMaterial(),tracks=createMowerTracks(scene,material);tracks.warm();tracks.finishWarm();
let escaped=false,miss=null,broken=null,travel=0,enter=null,exit=null,heading=null,maxSegments=0;
for(let i=0;i<600;i++){
 escaped ||= chase.joe.ram.phase==='missed';const old={...chase.joe};updateRun(chase,{throttle:1,steer:i<38?.9:escaped?Math.max(-1,Math.min(1,(.3-chase.foot.yaw)*1.8)):0},1/60);tracks.update(chase);
 if(chase.joe.mode==='charging'){heading??=chase.joe.yaw;assert.equal(chase.joe.yaw,heading);travel+=distance(old,chase.joe);}
 if(chase.joe.ram.phase==='missed')miss??={frame:i,x:chase.joe.x,y:chase.joe.y};
 if(chase.courseFX.breaks[6].age>=0)broken??={frame:i,x:chase.joe.x,y:chase.joe.y};
 if(chase.encounter.owner==='relief'){enter??=distance(chase.foot,chase.joe);exit=distance(chase.foot,chase.joe);}
 maxSegments=Math.max(maxSegments,tracks.stats().segments);assert.equal(chase.mode,'driving');assert.equal(chase.cart.hits,0);
}
assert(broken&&miss&&broken.frame<miss.frame);assert(travel>30&&exit>enter+5);assert(maxSegments>0&&maxSegments<=24);assert.equal(chase.events.filter(e=>e.type==='barrier').length,0,'Joe, not the runner, broke the rail');
const matrix=Array.from(tracks.mesh.instanceMatrix.array);tracks.update(chase);assert.equal(tracks.stats().uploads,0);assert.deepEqual(Array.from(tracks.mesh.instanceMatrix.array),matrix);
chase.mode='paused';chase.joe.y+=5;tracks.update(chase);assert.equal(tracks.stats().uploads,0);chase.mode='driving';
for(const [name,x,y,expected]of [['turf',20,60,true],['dry-path',0,25,false],['wet-path',-12,238,false],['wet-turf',-5,238,true],['bunker',20,238,false],['relay',0,300,false],['garage',-23,807,false],['boundary',40,200,false]])assert.equal(canMarkMownGround(x,y,0),expected,name);
// Long travel remains bounded; retry discards the previous run's footprints.
for(let i=0;i<80;i++){Object.assign(chase.joe,{x:20,y:38+i%14*2,yaw:0,speed:10});tracks.update(chase);}assert.equal(tracks.stats().segments,24);const trackStats=tracks.stats();tracks.update(createRun());assert.equal(tracks.stats().segments,0);tracks.dispose();material.dispose();assert.equal(scene.children.length,0);
const actualMiss={travel,broken,miss,enter,exit,maxSegments,trackStats};
fs.writeFileSync(out+'/rules.json',JSON.stringify({passed:true,crossings,endClip:true,nearMiss:true,caption:true,actualMiss},null,2));console.log(JSON.stringify({passed:true,crossings:crossings.length,endClip:true,nearMiss:true,caption:true,actualMiss}));
