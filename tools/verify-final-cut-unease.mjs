import assert from 'node:assert/strict';
import fs from 'node:fs';
import {createRun,step,snapshot,nearbyAction} from '../web/final-cut-sim.js';
import {advanceUnease,uneaseFrame,createUnease} from '../web/final-cut-unease.js';
const checks=[],run=()=>{const r=createRun({checkpoint:1});r.mode='playing';r.player.yaw=1.1;r.drama.phase='refuge';Object.assign(r.rig,{x:-30,y:66,phase:'turn',path:[{x:30,y:66}]});return r;};
const wait=(r,seconds)=>{for(let i=0;i<seconds*120;i++)advanceUnease(r,1/120,!!nearbyAction(r));};
let r=run();assert.equal(nearbyAction(r),null);wait(r,2.1);assert(r.unease.seen);assert(r.unease.age!==null);assert.equal(uneaseFrame(r).fold,0);assert.equal(uneaseFrame(r).wind,.003);wait(r,3.4);assert(uneaseFrame(r).fold>.9);assert.equal(uneaseFrame(r,true).fold,0);assert.equal(uneaseFrame(r,true).wind,null);wait(r,3);assert.equal(r.unease.age,null);wait(r,15);assert.equal(r.unease.age,null);checks.push('One six-second optional beat follows two settled seconds: wind drops before cloth moves; reduced motion stays static; no repeat');
const restored=createRun(snapshot(r));assert(restored.unease.seen);assert.equal(restored.unease.age,null);assert.deepEqual(createUnease(null),{seen:false,settled:0,age:null});checks.push('Only the consumed flag survives retry/reload; legacy and malformed optional state default safely');
const blockers={teaching:r=>r.arrival.open=false,unprepared:r=>r.pump=false,filling:r=>r.water=.5,exposed:r=>r.player.x=18,moving:r=>r.player.speed=1,listening:r=>r.player.focus=true,aiming:r=>r.ballAim.active=true,message:r=>r.messageTime=2,dialogue:r=>r.drama.active={id:'opening'},queuedSpeech:r=>r.drama.pending={id:'blocked'},danger:r=>Object.assign(r.rig,{x:12,y:50,phase:'pass',deployment:1,yaw:Math.PI}),release:r=>r.drama.phase='release',offscreen:r=>r.player.yaw=-Math.PI/2,interaction:r=>r.player.yaw=Math.PI*.75,won:r=>r.won=true};
for(const [name,block]of Object.entries(blockers)){r=run();block(r);wait(r,4);assert.equal(r.unease.seen,false,name);}
checks.push('Fifteen teaching/danger/movement/interaction/sight/dialogue conditions suppress the optional event');
r=run();for(let k=0;k<600;k++)advanceUnease(r,1/120,false,{viewHalfFov:.25});assert.equal(r.unease.seen,false);r.player.yaw=1.44;
for(let k=0;k<300;k++)advanceUnease(r,1/120,false,{viewHalfFov:.25});assert(r.unease.seen);
r=run();for(let k=0;k<600;k++)advanceUnease(r,1/120,false,{reducedMotion:true});assert.equal(r.unease.seen,false);
checks.push('Narrow field of view keeps an offscreen beat unconsumed; reduced motion suppresses scheduling');
r=run();wait(r,2.1);r.messageTime=3;wait(r,.02);assert.equal(r.unease.age,null);r.messageTime=0;wait(r,10);assert.equal(r.unease.age,null);checks.push('New guidance cancels rather than queues or replays an interrupted beat');
r=run();wait(r,2.1);r.mode='paused';const before=JSON.stringify(r.unease);step(r,{},3);assert.equal(JSON.stringify(r.unease),before);checks.push('Ordinary simulation pause freezes the event');
for(const hz of [30,60,120,144]){r=run();for(let i=0;i<hz*8;i++)step(r,{},1/hz);assert(r.unease.seen,`ordinary integration ${hz}`);assert(r.unease.age!==null);}
checks.push('Real simulation integration triggers from settled shelter at 30/60/120/144 Hz without manual event injection');
fs.mkdirSync('output/final-cut/unease',{recursive:true});fs.writeFileSync('output/final-cut/unease/rules.json',JSON.stringify({passed:true,checks},null,2));console.log(JSON.stringify({passed:true,checks}));
