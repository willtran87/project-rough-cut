import assert from 'node:assert/strict';
import fs from 'node:fs';
import {performance} from 'node:perf_hooks';
import {rigWallHit,rigHit,sweptRigHit} from '../web/final-cut-rig.js';
import {WALLS} from '../web/final-cut-course.js';
import {createRun,step} from '../web/final-cut-sim.js';
const checks=[],runs=[],j={x:0,y:0,yaw:0,phase:'turn',deployment:0,steering:0};
const wall={id:'overhang',x:3.2,y:1.4,w:.2,d:.2,h:1.25};
assert.equal(rigWallHit(j,[wall]),null);assert.equal(rigWallHit(j,[{...wall,h:2.35}]),null);assert.equal(rigWallHit(j,[{...wall,h:4.2}])?.id,'reel-1');
assert.equal(rigHit({x:3.2,y:1.4},j),null);
assert(rigWallHit({...j,deployment:1},[{id:'deck-only',x:4,y:.4,w:.1,d:.1,h:1.25}]),'Inactive deck behind the reels must respect masonry');
checks.push('Folded tip clears low masonry, catches tall masonry; raised cutters remain nonlethal; inactive deck is solid to stone');
for(const hz of [30,60,120,144])for(const scenario of ['deploy','fold']){
 const r=createRun({checkpoint:1});r.mode='playing';Object.assign(r.rig,scenario==='deploy'?{x:10,y:47.5,yaw:Math.PI/2,phase:'announce',deployment:0,direction:1}:{x:20.13,y:38.75,yaw:0,phase:'disengage',deployment:1});
 assert.equal(rigWallHit(r.rig,WALLS),null);let reverse=0,minY=r.rig.y,firstPhase=null;
 for(let k=0;k<hz*10;k++){step(r,{},1/hz);assert.equal(rigWallHit(r.rig,WALLS),null,`${scenario} intersects masonry at ${hz}Hz`);if(r.rig.clearanceWarning){reverse++;minY=Math.min(minY,r.rig.y);}if(r.rig.phase!== (scenario==='deploy'?'announce':'disengage'))firstPhase??=r.rig.phase;}
 assert.equal(r.mode,'playing');assert.equal(r.rig.deployment,0);assert(['turn','align','announce'].includes(r.rig.phase));
 if(scenario==='deploy'){assert(r.events.some(e=>e.type==='blocked-pass'));assert.equal(r.rig.passSerial,0);}else{assert(reverse>0);assert(minY<38.3&&minY>37.9);}
 runs.push({hz,scenario,reverseFrames:reverse,minY,firstPhase,finalPhase:r.rig.phase});
}
checks.push('Eight actual 10-second recovery runs: deployment aborts before stone; folding heel backs clear, folds, and resumes; no penetration at four rates');
const pose={x:20.13,y:38.75,yaw:0,phase:'disengage',deployment:.92,steering:0},player={x:21,y:38};
const profile=(name,fn)=>{for(let k=0;k<500;k++)fn();const batches=[];for(let n=0;n<30;n++){const start=performance.now();for(let k=0;k<200;k++)fn();batches.push((performance.now()-start)/200);}batches.sort((a,b)=>a-b);return {name,meanMs:batches.reduce((a,b)=>a+b)/batches.length,p95BatchMeanMs:batches[28]};};
const timing=[profile('near masonry folding clearance',()=>rigWallHit(pose,WALLS)),profile('near player relative sweep',()=>sweptRigHit(player,{x:21.02,y:38},pose,{...pose,x:20.14,yaw:.005})),profile('ordinary distant masonry broad phase',()=>rigWallHit({...pose,x:0,y:50},WALLS))];
// Local CPU samples only: report the cost rather than certifying device FPS.
fs.mkdirSync('output/final-cut/folding',{recursive:true});fs.writeFileSync('output/final-cut/folding/rules.json',JSON.stringify({passed:true,checks,runs,timing},null,2));console.log(JSON.stringify({passed:true,checks,runs,timing}));
