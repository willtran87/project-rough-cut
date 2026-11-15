import assert from 'node:assert/strict';
import fs from 'node:fs';
import {createRun,updateRun} from '../web/back-nine-sim.js';
import {updateHunt} from '../web/back-nine-hunt.js';
import {updateCourseFX} from '../web/back-nine-course-fx.js';
import {updateTension,pursuitMultiplier} from '../web/back-nine-tension.js';
import {COURSE,lineClear,surfaceAt,distance,angleDelta,clamp} from '../web/back-nine-course.js';
import {vehicleOverlap} from '../web/vehicle-contact.js';
const checks=[];function test(name,fn){fn();checks.push(name);}
test('Cart gate admits the cart but not the mower; service lane is visibly wet',()=>{
 const g=COURSE.cartGates[0],a={x:g.x-Math.sin(g.yaw)*4,y:g.y-Math.cos(g.yaw)*4},b={x:g.x+Math.sin(g.yaw)*4,y:g.y+Math.cos(g.yaw)*4};
 assert(lineClear(a,b,.85));assert(!lineClear(a,b,1.65));assert.equal(surfaceAt({x:-29,y:449}),'wet');
});
test('Alongside attack warns, freezes prediction, cannot stack with surge, and recovers',()=>{
 const r=createRun(1);r.mode='driving';r.grace=0;Object.assign(r.cart,{x:0,y:325,speed:12});Object.assign(r.joe,{x:0,y:304,speed:12});r.hunt.cooldown=0;r.tension.phase='stalk';
 updateHunt(r,1/60,true);assert.equal(r.hunt.kind,'alongside');assert.equal(r.hunt.phase,'signal');const points=JSON.stringify(r.hunt.waypoints);r.cart.x+=7;
 for(let i=0;i<120;i++)updateHunt(r,1/60,false);assert.equal(r.hunt.phase,'signal');for(let i=0;i<15;i++)updateHunt(r,1/60,false);
 assert.equal(r.hunt.phase,'alongside');assert.equal(JSON.stringify(r.hunt.waypoints),points);assert.equal(r.hunt.alongside,1);
 r.tension.phase='surge';updateTension(r,1/60,true);assert.equal(r.tension.phase,'recover');assert.equal(r.tension.surge,0);
 for(let i=0;i<280;i++)updateHunt(r,1/60,true);assert.equal(r.hunt.phase,'recover');assert(r.hunt.cooldown>10);
 r.cart.invulnerable=1;updateHunt(r,1/60,true);assert.equal(r.hunt.phase,'follow');
});
test('Three acts and actual checkpoint respite; hidden atmosphere quiets without false position cues',()=>{
 const r=createRun();r.mode='driving';r.grace=0;for(const[y,act]of [[30,1],[330,2],[620,3]]){r.cart.y=y;updateTension(r,.1,true);assert.equal(r.tension.act,act);}
 r.checkpoint=1;r.joe.y=r.cart.y-30;updateTension(r,.1,true);assert.equal(r.tension.phase,'breather');assert(pursuitMultiplier(r,'path',0,30)<1);
 r.hunt.occluded=true;r.hunt.hiddenTime=3;updateTension(r,.1,false);assert.equal(r.tension.silence,1);
});
test('Breakage is caused by physical proximity, bounded, directional, and never repeats',()=>{
 const r=createRun();r.mode='driving';r.grace=0;const p=COURSE.hurdles[0];Object.assign(r.joe,{x:p.x,y:p.y-2,speed:10});updateCourseFX(r,1/60);
 assert.equal(r.courseFX.breaks[0].age,0);assert.equal(r.courseFX.cue.kind,'timber');assert.equal(r.courseFX.cue.x,p.x);const serial=r.courseFX.cue.serial;
 for(let i=0;i<600;i++)updateCourseFX(r,1/60);assert.equal(r.courseFX.cue.serial,serial);assert.equal(r.courseFX.breaks[0].age,3);assert.equal(r.courseFX.breaks.length,6);
 const frozen=JSON.stringify(r);r.mode='paused';const paused=JSON.stringify(r);updateRun(r,{},1);assert.equal(JSON.stringify(r),paused);r.mode='driving';assert.equal(JSON.stringify(r),frozen);
});
test('Brush rustle uses the hidden mower position once, with checkpoint and cooldown protection',()=>{
 const r=createRun();r.mode='driving';r.grace=0;r.tension.phase='stalk';Object.assign(r.joe,{x:-19,y:130,speed:8});r.hunt.occluded=true;r.hunt.hiddenTime=2;
 updateCourseFX(r,.1);assert.equal(r.courseFX.cue.kind,'brush');assert.equal(r.courseFX.cue.x,r.joe.x);assert.equal(r.courseFX.cue.y,r.joe.y);assert.equal(r.courseFX.cue.serial,1);
 for(let i=0;i<200;i++)updateCourseFX(r,.1);assert.equal(r.courseFX.cue.serial,1);
 r.hunt.occluded=false;updateCourseFX(r,.1);r.hunt.occluded=true;r.tension.phase='breather';updateCourseFX(r,.1);assert.equal(r.courseFX.cue.serial,1);
});
let cautious;
test('A cautious actual drive encounters the new attack without overlapping either vehicle',()=>{
 const r=createRun(1);r.mode='driving';let i=1,maxStep=0,last={...r.joe};
 for(let f=0;f<80*60&&r.mode==='driving';f++){
  const route=COURSE.paths[0];while(i<route.length-1&&(distance(r.cart,{x:route[i][0],y:route[i][1]})<7||r.cart.y>route[i][1]+2))i++;
  const delta=angleDelta(Math.atan2(route[i][0]-r.cart.x,route[i][1]-r.cart.y),r.cart.yaw);
  updateRun(r,{throttle:r.cart.speed<10.5?1:0,steer:clamp(delta*2,-1,1),brake:Math.abs(delta)>.7&&r.cart.speed>8},1/60);
  assert(!vehicleOverlap(r.cart,r.joe));maxStep=Math.max(maxStep,distance(last,r.joe));last={...r.joe};if(r.hunt.alongside>0&&r.hunt.phase==='recover')break;
 }
 assert(r.hunt.alongside>0,JSON.stringify(r.hunt));assert(maxStep<.28);cautious={seconds:r.time,alongside:r.hunt.alongside,hits:r.cart.hits,maxStep};
});
fs.mkdirSync('output/back-nine-escalation',{recursive:true});fs.writeFileSync('output/back-nine-escalation/simulation.json',JSON.stringify({passed:true,checks,cautious},null,2));console.log(JSON.stringify({passed:true,checks,cautious}));
