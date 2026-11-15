import assert from 'node:assert/strict';
import fs from 'node:fs';
import {rigHit,sweptRigHit,rigWallHit,rigParts,worldPart,RIG_BANK} from '../web/final-cut-rig.js';
import {createRun,step} from '../web/final-cut-sim.js';
import {mow} from '../web/final-cut-mowing.js';
import {WALLS} from '../web/final-cut-course.js';
const checks=[],base={x:0,y:0,yaw:0,phase:'pass',deployment:1,steering:0,distance:0};
for(const yaw of [0,Math.PI/2,-Math.PI/2,Math.PI,.71]){
 const j={...base,yaw},point=(side,forward)=>({x:side*Math.cos(yaw)+forward*Math.sin(yaw),y:-side*Math.sin(yaw)+forward*Math.cos(yaw)});
 assert.equal(rigHit(point(4,-2),j),null,'Empty wake must not inherit full-width chassis rectangle');
 assert.equal(rigHit(point(5.56,1.4),j),null);assert.equal(rigHit(point(5.54,1.4),j)?.kind,'cutting-bank');
 assert(rigHit(point(2,1.55),{...j,phase:'turn',deployment:0})?.id.startsWith('fender-'),'Fixed fender owns its actual chassis footprint');
 assert.equal(rigHit(point(2.15,2.39),{...j,phase:'turn',deployment:0},.005)?.kind,'wheel','Tread projects ahead of the fender');
 assert.equal(rigHit(point(4,1.4),{...j,phase:'turn',deployment:0}),null);
 assert.equal(rigHit(point(0,0),j)?.kind,'chassis');
}
checks.push('Five headings: empty wake, exact bank edge, outer wheel, raised-reel clearance and central chassis');
const rearWheel=rigParts(base).find(p=>p.kind==='wheel'&&p.side>0&&p.forward<0);
assert.equal(rigHit({x:rearWheel.side+rearWheel.w/2+.24,y:rearWheel.forward-rearWheel.d/2-.24},base),null,'Circular player must not inherit inflated square corners');
checks.push('Rounded player clearance rejects an expanded-box corner false positive');
let seed=731;const random=()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296;};
for(let k=0;k<2000;k++){const pose={...base,x:random()*6-3,y:random()*6-3,yaw:random()*Math.PI*2-Math.PI,steering:random()*1.3-.65,phase:k%2?'pass':'turn'},p={x:random()*16-8,y:random()*16-8};
 const expected=rigParts(pose).some(part=>{const b=worldPart(pose,part),dx=p.x-b.x,dy=p.y-b.y,side=dx*Math.cos(b.yaw)-dy*Math.sin(b.yaw),forward=dx*Math.sin(b.yaw)+dy*Math.cos(b.yaw);return Math.hypot(Math.max(0,Math.abs(side)-part.w/2),Math.max(0,Math.abs(forward)-part.d/2))<=.3;});assert.equal(!!rigHit(p,pose),expected);
}
checks.push('2,000 seeded arbitrary headings/steering samples agree with an independent world-space circle/OBB distance calculation');
let hit=sweptRigHit({x:4,y:-5},{x:4,y:5},base,base);assert.equal(hit.kind,'cutting-bank');assert(hit.t>0&&hit.t<1);
assert.equal(rigHit({x:4,y:-5},base),null);assert.equal(rigHit({x:4,y:5},base),null);
hit=sweptRigHit({x:4,y:0},{x:4,y:0},{...base,y:-8},{...base,y:8});assert.equal(hit.kind,'cutting-bank');
const activation=sweptRigHit({x:4,y:1.4},{x:10,y:1.4},{...base,phase:'announce'},base);assert.equal(activation,null,'New activation cannot damage an earlier position');
checks.push('Continuous relative sweeps catch between-endpoint contact; activation does not rewrite the past');
for(const yaw of [0,.7,Math.PI/2]){
 const j={...base,yaw},bank=worldPart(j,rigParts(j).find(p=>p.id==='reel-1'));
 assert(rigWallHit(j,[{id:'masonry',x:bank.x,y:bank.y,w:.6,d:.6,h:2}]));
 assert(!rigWallHit(j,[{id:'far',x:20,y:20,w:.6,d:.6,h:2}]));
}
checks.push('Oriented part/masonry overlap at three headings');
const turnRun=createRun({checkpoint:1});turnRun.mode='playing';Object.assign(turnRun.rig,{x:20,y:43.5,yaw:-Math.PI/2,phase:'turn',deployment:0,path:[{x:10,y:43.5}]});for(let k=0;k<90;k++)step(turnRun,{},1/60);assert(turnRun.events.some(e=>e.type==='blocked-pass'));assert(!rigWallHit(turnRun.rig,WALLS));assert.equal(turnRun.mode,'playing');checks.push('A real raised-reel turn stops its wheels before shelter masonry');
const captures=[];for(const hz of [30,60,120,144]){const r=createRun({checkpoint:1});r.mode='playing';Object.assign(r.player,{x:0,y:54});Object.assign(r.rig,{x:6,y:50,yaw:-Math.PI/2,direction:-1,phase:'pass',deployment:1});for(let i=0;i<hz*2&&r.mode==='playing';i++)step(r,{},1/hz);assert.equal(r.mode,'caught');assert.equal(r.failure.kind,'cutting-bank');assert(r.failure.part.startsWith('reel-')||r.failure.part.startsWith('comb-'));captures.push({hz,time:r.time,part:r.failure.part});}
assert(Math.max(...captures.map(c=>c.time))-Math.min(...captures.map(c=>c.time))<1/120+.0001);
checks.push('Real contact and factual responsible part agree at 30/60/120/144 Hz within one fixed step');
const r=createRun();Object.assign(r.rig,{x:1,y:26,direction:1});mow(r,0);assert.equal(r.cutAreas[0].lo,RIG_BANK.reelForward-RIG_BANK.reelRadius);assert.equal(r.cutAreas[0].hi,1+RIG_BANK.reelForward+RIG_BANK.reelRadius);
checks.push('Concealment sweep uses the shared reel front/back extents');
fs.mkdirSync('output/final-cut/rig-contact',{recursive:true});fs.writeFileSync('output/final-cut/rig-contact/rules.json',JSON.stringify({passed:true,checks,captures},null,2));console.log(JSON.stringify({passed:true,checks,captures}));
