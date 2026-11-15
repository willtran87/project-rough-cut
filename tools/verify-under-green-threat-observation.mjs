import assert from 'node:assert/strict';
import fs from 'node:fs';
import {createRun} from '../web/under-green-sim.js';
import {observeJoe} from '../web/under-green-senses.js';
import {pursuitCaption,soundDescription,urgentThreatCaption} from '../web/under-green-observation.js';
import {LEVER} from '../web/under-green-course.js';
const checks=[],out='output/under-green/threat-observation';fs.mkdirSync(out,{recursive:true});
const r=createRun(1);r.mode='playing';r.messageTime=0;
Object.assign(r.player,{x:0,y:54,yaw:Math.PI,pitch:0,eyeHeight:1.65});
Object.assign(r.joe,{x:0,y:59,age:2,seen:false,speed:0,closingRate:0});
const hidden=[];
for(const phase of ['walk','turn','search','water-wait','water-recovery','recover']){
 r.joe.phase=phase;const observed=observeJoe(r);assert(!observed.visible&&observed.audible);
 hidden.push({phase,text:pursuitCaption(r,'Y',observed)});
}
assert.equal(new Set(hidden.map(v=>v.text)).size,1);assert.match(hidden[0].text,/Y TO GLANCE BACK/);
r.player.rearAngle=Math.PI;r.joe.phase='search';assert(observeJoe(r).visible);assert.match(pursuitCaption(r,'Y'),/SEARCHING THE AREA/);
r.joe.phase='water-wait';assert.match(pursuitCaption(r,'Y'),/WATER/);r.player.rearAngle=0;
checks.push('Hidden idle/search/water/recovery states produce the same heard cue; a real rear glance permits visible-state descriptions');

r.joe.y=56;r.joe.phase='windup';assert(observeJoe(r).imminent);assert.match(urgentThreatCaption(r),/revs close by/);assert(!urgentThreatCaption(r).includes('raises'));
r.joe.phase='sweep';assert.match(urgentThreatCaption(r),/revs close by/);
r.player.yaw=0;assert.match(urgentThreatCaption(r),/blade is sweeping/);
Object.assign(r.player,{x:LEVER.x-1,y:LEVER.y,yaw:Math.PI/2});Object.assign(r.joe,{x:LEVER.x+1.3,y:LEVER.y,phase:'windup'});
assert(!observeJoe(r).imminent);assert.equal(urgentThreatCaption(r),'');
checks.push('Close unseen attacks retain audible counterplay; visible sweeps name the blade; solid control housing suppresses false imminent-contact warnings');

Object.assign(r.player,{x:-20,y:38,yaw:0,pitch:0});Object.assign(r.joe,{x:-17.5,y:42.5,phase:'search'});
assert(observeJoe(r,{fov:58,aspect:16/9}).visible);assert(!observeJoe(r,{fov:58,aspect:390/844}).visible);
r.player.pitch=.85;assert(!observeJoe(r,{fov:58,aspect:16/9}).visible);
Object.assign(r.player,{x:0,y:43,yaw:-Math.PI/2,pitch:0});Object.assign(r.joe,{x:-5.35,y:45.1,phase:'search'});assert(!observeJoe(r).visible);assert(observeJoe(r).audible);assert(!pursuitCaption(r,'R').includes('SEARCHING'));
checks.push('Aspect ratio, vertical look and real opaque walls constrain visible-state knowledge independently of Joe seeing the player');

Object.assign(r.player,{x:0,y:30,yaw:0});Object.assign(r.joe,{x:0,y:35,phase:'enter',age:.3});r.time=0;
assert.match(soundDescription(r),/door rattles/);assert(!soundDescription(r).includes('engine'));
r.joe.age=1;assert.match(soundDescription(r),/engine sputters/);
Object.assign(r.player,{x:0,y:58});Object.assign(r.joe,{x:0,y:50,phase:'walk'});r.time=1.2;
assert.match(soundDescription(r),/pipes knock/);
r.joe.phase='absent';r.player.y=5;r.time=0;assert.equal(pursuitCaption(r,'R'),'');assert.equal(soundDescription(r),'');
checks.push('Entrance captions separate the door from the later starter; real nearby pressure warnings outrank ordinary engine description; absent Joe supplies no threat');
fs.writeFileSync(out+'/rules.json',JSON.stringify({passed:true,checks,hidden},null,2));console.log(JSON.stringify({passed:true,checks}));
