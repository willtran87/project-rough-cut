import assert from 'node:assert/strict';
import {listeningPoint,courseListeningRead} from '../web/course-listening.js';
const player={x:0,y:0},joe={x:0,y:100};
for(const [yaw,bearing]of [[0,'AHEAD'],[Math.PI/2,'LEFT'],[-Math.PI/2,'RIGHT'],[Math.PI,'BEHIND'],[Math.PI*2,'AHEAD']]){const p=listeningPoint(player,joe,yaw);assert.equal(p.bearing,bearing);assert.equal(p.metres,16);}
assert.equal(listeningPoint(player,{x:100,y:0},0).metres,11.5);
const source={player,yaw:0,joe,search:{active:true,locus:{x:-20,y:0},locusKind:'trail_check',trend:'closing',secondsRemaining:2.1},cadence:{active:true,progress:.625},clues:[{id:'ball',label:'Ball',point:{x:0,y:-10}}]};
const copy=structuredClone(source),read=courseListeningRead(source);assert.equal(read.cadence.progress,.5);assert.equal(read.entries[0].bearing,'LEFT');assert.equal(read.entries[1].bearing,'BEHIND');assert.equal(read.joe.trend,'closing');assert.deepEqual(source,copy);
source.cadence={forecast:{target:{x:20,y:0},timer:2,duration:4}};const forecast=courseListeningRead(source);assert.equal(forecast.entries[0].id,'forecast');assert.equal(forecast.cadence.progress,.5);assert.equal(forecast.entries[0].bearing,'RIGHT');
source.search.active=false;source.cadence={blockedReason:'movement'};const clear=courseListeningRead(source);assert.equal(clear.joe.trend,null);assert.equal(clear.entries.length,1);assert.match(clear.cadence.text,/Stay still/);
console.log(JSON.stringify({passed:true,checks:['View-relative bearing at five headings and physical distance','Search and forecast evidence, cadence progress and blocked guidance','Expired evidence removed and inputs unmodified']}));
