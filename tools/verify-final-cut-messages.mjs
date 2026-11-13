import assert from 'node:assert/strict';
import fs from 'node:fs';
import {createRun,step} from '../web/final-cut-sim.js';
import {RIG} from '../web/final-cut-course.js';
import {approachingCut,finalCutMessages} from '../web/final-cut-messages.js';

const fixture=()=>{
 const r=createRun();r.mode='playing';r.elapsed=20;
 Object.assign(r.player,{x:0,y:26,yaw:0});
 Object.assign(r.rig,{x:15,y:26,yaw:-Math.PI/2,phase:'pass',deployment:1,direction:-1});
 r.message='Record secured';r.messageTime=4;r.dialogue='One final pass.';r.dialogueTime=4;return r;
};
const preferences={subtitles:true,threatCaptions:false,muted:true},checks=[];
let r=fixture();const initial=structuredClone(r),m=finalCutMessages(r,preferences);
assert(m.urgent);assert.equal(m.kind,'danger');assert.match(m.caption,/Move off the cutting strip/);assert.equal(m.dialogue,'');assert.deepEqual(r,initial);
r.player.crouch=true;assert(approachingCut(r),'Concealment does not stop an active cutting pass');
for(const [name,change]of [
 ['receding',r=>r.rig.x=-15],['outside strip',r=>r.player.y=32],
 ['distant',r=>r.rig.x=24],['preparation',r=>r.rig.phase='announce'],
 ['lifted reels',r=>r.rig.deployment=.5],['paused',r=>r.mode='paused'],
 ['secured victory',r=>{r.won=true;r.mode='aftermath';}],
 ['solid shelter',r=>{Object.assign(r.player,{x:10,y:38});Object.assign(r.rig,{x:-4,y:38,yaw:Math.PI/2,direction:1});}],
]){r=fixture();change(r);assert.equal(approachingCut(r),false,name);}
checks.push('Approaching committed strip only; no warnings for receding, adjacent, distant, lifted, paused, secured or occluded states');

// Both approach directions use the actual rig heading, not world/camera left.
for(const direction of [-1,1]){
 r=fixture();r.rig.x=-direction*15;r.rig.direction=direction;r.rig.yaw=direction*Math.PI/2;
 for(const yaw of [0,Math.PI/2,Math.PI,-Math.PI/2]){r.player.yaw=yaw;assert(approachingCut(r));}
}
checks.push('Direction-independent essential warning survives mute/optional caption preferences; presentation never mutates the run');

// At the outer warning boundary, ordinary lateral travel can clear the widest
// deployed strip before contact. Also prove the same pass captures an idle body.
const outcomes=[];
for(const direction of [-1,1])for(const fps of [30,60,120])for(const evade of [false,true]){
 r=fixture();r.rig.x=-direction*(RIG.halfLength+.3+RIG.speed*2-.01);r.rig.direction=direction;r.rig.yaw=direction*Math.PI/2;
 assert(approachingCut(r));
 for(let k=0;k<fps*3&&r.mode==='playing';k++)step(r,evade&&k>=fps*.25?{forward:1}:{},1/fps);
 assert.equal(r.mode,evade?'playing':'caught');outcomes.push({direction,fps,evade,mode:r.mode,y:r.player.y});
}
checks.push('Actual simulation: 250ms reaction then ordinary walking evades at both headings and 30/60/120Hz; ignoring the same pass is captured');
r=fixture();r.won=true;r.mode='aftermath';const safe=finalCutMessages(r,preferences);assert.equal(safe.caption,r.message);assert.equal(safe.dialogue,r.dialogue);
assert.equal(finalCutMessages(r,{subtitles:false}).dialogue,'');
checks.push('Safe aftermath retains event and dialogue; subtitle preference remains effective');
fs.mkdirSync('output/campaign-message-priority',{recursive:true});
fs.writeFileSync('output/campaign-message-priority/finale-rules.json',JSON.stringify({passed:true,checks,outcomes},null,2));
console.log(JSON.stringify({passed:true,checks,cases:outcomes.length}));
