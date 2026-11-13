import assert from 'node:assert/strict';
import fs from 'node:fs';
import {createRun,step,snapshot,readSave,nearbyAction} from '../web/under-green-sim.js';
import {interactionFeedback} from '../web/under-green-interactions.js';
import {LEVER,NOTE,SLUICE,GATE} from '../web/under-green-course.js';
const checks=[],out='output/under-green/interactions';fs.mkdirSync(out,{recursive:true});
function fixture(target=LEVER,cp=1,range=2.1){
 const r=createRun(cp);r.mode='playing';r.messageTime=0;
 Object.assign(r.player,{x:target.x-range,y:target.y,yaw:Math.PI/2});
 Object.assign(r.joe,{phase:'search',x:0,y:5,last:{x:0,y:5}});return r;
}
let r=fixture();assert.equal(nearbyAction(r),null);assert.equal(interactionFeedback(r),null);
step(r,{use:true});assert(!r.bypass);assert.match(interactionFeedback(r).text,/closer to the pump lever/);
for(let i=0;i<12;i++)step(r,{forward:1});assert.equal(nearbyAction(r)?.id,'bypass');assert.match(interactionFeedback(r).text,/Drain the onward channel/);
step(r,{use:true});const saves=r.saveSerial;assert(r.bypass);assert.equal(r.events.filter(e=>e.type==='bypass').length,1);
step(r,{use:true});assert.equal(r.saveSerial,saves);assert.equal(r.events.filter(e=>e.type==='bypass').length,1);assert.match(interactionFeedback(r).text,/already open/);
const saved=readSave(JSON.stringify(snapshot(r))),loaded=createRun(saved.checkpoint,saved.evidence,saved.difficulty,saved);assert(loaded.bypass);assert(!('useFeedbackUntil' in snapshot(r)));assert.equal(interactionFeedback(loaded),null);
checks.push('Out-of-reach Use explains the visible pump; ordinary approach immediately replaces stale advice; accepted/repeated Use stays irreversible and saves without transient feedback');

for(const pose of [{yaw:-Math.PI/2},{pitch:.85},{x:LEVER.x+20}]){
 const denied=fixture(LEVER,1,1.7);Object.assign(denied.player,pose);step(denied,{use:true});assert(!denied.bypass);assert.equal(nearbyAction(denied),null);assert.equal(interactionFeedback(denied).text,'Face a control and move within reach.');
}
r=fixture(LEVER,1,1.7);r.player.yaw=-Math.PI/2;r.player.rearAngle=Math.PI;assert.equal(nearbyAction(r)?.id,'bypass');
checks.push('Facing, pitch and distance reject activation without naming unseen controls; rear-visible selection keeps the existing camera contract');

r=fixture(NOTE,1,-1);r.player.yaw=-Math.PI/2;assert.match(interactionFeedback(r).text,/safely in Pause/);step(r,{use:true});assert(r.evidence);step(r,{use:true});assert.match(interactionFeedback(r).text,/already kept/);assert.equal(r.events.filter(e=>e.type==='evidence').length,1);
r=fixture(SLUICE,3,1);assert.equal(nearbyAction(r)?.id,'gate');assert.match(interactionFeedback(r).text,/Stay inside/);step(r,{use:true});assert(r.closing);assert.match(r.message,/Stay inside/);
r=fixture(SLUICE,3,1);r.bypass=false;step(r,{use:true});assert(!r.closing);assert.match(interactionFeedback(r).text,/pump-house bypass/);
r=fixture(SLUICE,3,1);r.player.y=GATE.y+.1;r.player.x=SLUICE.x;r.player.yaw=Math.PI;step(r,{use:true});assert(!r.closing);
checks.push('Record explains safe reading and duplicate ownership; gate explains prerequisite and closure commitment without allowing an invalid seal');

r=fixture();step(r,{use:true});const until=r.useFeedbackUntil;r.mode='paused';for(let i=0;i<180;i++)step(r);assert.equal(r.useFeedbackUntil,until);assert.equal(interactionFeedback(r),null);r.mode='playing';assert(interactionFeedback(r));for(let i=0;i<121;i++)step(r);assert.equal(interactionFeedback(r),null);
checks.push('Requested guidance pauses with simulation, expires without a queue and does not persist into a retry');
fs.writeFileSync(out+'/rules.json',JSON.stringify({passed:true,checks},null,2));console.log(JSON.stringify({passed:true,checks}));
