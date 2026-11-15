import assert from 'node:assert/strict';
import {createRun} from '../web/back-nine-sim.js';
import {dialogueApproachClear} from '../web/back-nine-reactions.js';
import {encounterAllows} from '../web/chase-encounter.js';
import {createChatterGate} from '../web/message-presentation.js';
const checks=[];
const make=()=>{const r=createRun();r.mode='driving';r.time=20;r.grace=0;Object.assign(r.cart,{x:0,y:90,speed:14,yaw:0});Object.assign(r.joe,{x:0,y:50,speed:14,yaw:0});return r;};
for(const [name,gap,playerSpeed,joeSpeed,expected] of [
 ['equal pace',40,14,14,true],['fast approach',40,14,24,false],['near cutoff',19,14,21,false],['moving away',30,14,8,true],['leaving earshot',70,14,8,false],['stationary safe',40,0,0,true],['stationary near',21,0,0,false]
]){const r=make();r.joe.y=90-gap;r.cart.speed=playerSpeed;r.joe.speed=joeSpeed;const before=JSON.stringify(r);assert.equal(dialogueApproachClear(r),expected,name);assert.equal(JSON.stringify(r),before);checks.push(name);}
for(const angle of [0,.4,1.2,Math.PI,5.8]){const r=make();Object.assign(r.cart,{x:Math.sin(angle)*90,y:Math.cos(angle)*90,yaw:angle});Object.assign(r.joe,{x:Math.sin(angle)*50,y:Math.cos(angle)*50,yaw:angle,speed:24});assert(!dialogueApproachClear(r));r.joe.speed=14;assert(dialogueApproachClear(r));}
checks.push('rotation invariant ground velocities');
{
 const r=make();r.foot={...r.cart,onFoot:true,speed:7,viewYaw:Math.PI};r.joe.speed=16;assert(!dialogueApproachClear(r),'Actual runner velocity, not abandoned cart or Q view direction');r.foot.yaw=Math.PI/2;r.joe.speed=3;assert(dialogueApproachClear(r));checks.push('on-foot heading and look-back independent');
}
{
 const r=make();Object.assign(r.joe,{x:-40,y:90,yaw:Math.PI/2,speed:20});r.cart.speed=0;assert(!dialogueApproachClear(r),'Passing beyond the player must test closest approach, not just end distance');checks.push('crossing charge');
}
{
 const r=make(),gate=createChatterGate();let selected=0;const choose=()=>{selected++;return 'JOE: The grass keeps your delivery receipt.';};r.joe.speed=24;
 for(let i=0;i<120;i++)assert.equal(gate(r,choose,{canStart:dialogueApproachClear(r)}),'');assert.equal(selected,0,'No consumed line or cooldown for an unsafe approach');
 r.joe.speed=14;const line=gate(r,choose,{canStart:dialogueApproachClear(r)});assert(line);assert.equal(selected,1);
 r.time+=1;r.joe.speed=24;assert.equal(gate(r,choose,{canStart:dialogueApproachClear(r)}),line,'Admission prediction does not erase an active readable line');
 assert.equal(gate(r,choose,{blocked:true}),'','Actual attack still interrupts immediately');assert.equal(selected,1);checks.push('lazy budget, admission versus interruption');
}
{
 const r=make();Object.assign(r.encounter,{updated:true,owner:'cruise',age:2,wasHidden:false});
 for(const phase of ['signal','flank','intercept','alongside','commit_warning','lane_commit','close_pass']){r.hunt.phase=phase;assert(!encounterAllows(r,'dialogue'));assert(!encounterAllows(r,'dialogue-start'));assert(encounterAllows(r,'ram'),'Presentation guard does not alter ram policy');}
 r.hunt.phase='follow';for(const phase of ['opening','gather']){r.pressure.phase=phase;assert(!encounterAllows(r,'dialogue'));assert(!encounterAllows(r,'dialogue-start'));}
 r.pressure.phase='dormant';assert(encounterAllows(r,'dialogue-start'));checks.push('same-step hunt/pressure changes override stale cruise ownership only for dialogue');
}
console.log(JSON.stringify({passed:true,checks}));
