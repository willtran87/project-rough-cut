import assert from 'node:assert/strict';
import fs from 'node:fs';
import {createRun,updateRun} from '../web/back-nine-sim.js';
import {updateEncounter,encounterAllows,encounterQuiet} from '../web/chase-encounter.js';
import {scoreStage} from '../web/chase-score.js';
import {updateTension} from '../web/back-nine-tension.js';
import {updatePanic} from '../web/chase-panic.js';
import {updatePressure} from '../web/chase-pressure.js';
import {updateHunt} from '../web/back-nine-hunt.js';
import {distance} from '../web/back-nine-course.js';
const out='output/back-nine-experience/director-priority';fs.mkdirSync(out,{recursive:true});
const make=()=>{const r=createRun(0,0,37161);r.mode='driving';r.departure.phase='finished';r.grace=0;r.time=20;r.tension.phase='stalk';r.tension.cooldown=100;r.hunt.cooldown=100;r.panic.serial=1;r.encounter.nextReliefAt=100;Object.assign(r.cart,{x:0,y:95,speed:8});Object.assign(r.joe,{x:0,y:77,speed:16,yaw:0});return r;};
// Ordered contracts: physics and earned protection precede optional beats.
// Mutually exclusive state fields are not combined into impossible fixtures.
const cases=[
 ['finale','mode',r=>r.mode='sealing'],
 ['recovery','foot',r=>r.foot={...r.cart,onFoot:true,invulnerable:2}],
 ['checkpoint','grace',r=>r.grace=2],
 ['attack','ram.phase',r=>r.joe.ram.phase='lineup'],
 ['attack','ram.footCharge',r=>r.joe.ram.footCharge=1],
 ['recovery','ram.phase',r=>r.joe.ram.phase='backoff'],
 ['diversion','utility.active',r=>r.utility.active=0],
 ['diversion','decoys.active',r=>r.decoys.active=0],
 ['relief','reliefUntil',r=>r.encounter.reliefUntil=25],
 ['recovery','ram.phase',r=>r.joe.ram.phase='missed'],
 ['intercept','hunt.phase',r=>r.hunt.phase='commit_warning'],
 ['opening','pressure.phase',r=>Object.assign(r.pressure,{phase:'opening',remaining:2,seenPanic:1})],
 ['gather','pressure.phase',r=>Object.assign(r.pressure,{phase:'gather',remaining:.7,seenPanic:1})],
 ['tension','tension.phase',r=>Object.assign(r.tension,{phase:'windup',remaining:1})],
 ['departure','departure.phase',r=>r.departure.phase='working'],
 ['search','sight',r=>{r.joe.seenAge=3;r.joe.senses.observation={x:0,y:95};r.joe.senses.heard=false;}],
 ['cruise','none',()=>{}]
];
const channels={ram:['cruise','search'],hunt:['cruise','search','intercept'],tension:['cruise','tension'],pressure:['cruise','opening','gather'],reveal:['cruise','search','attack'],dialogue:['cruise'],'dialogue-start':['cruise'],omen:['cruise']};
const quiet=['relief','checkpoint','recovery','diversion','search','opening'];let pairs=0;
for(let a=0;a<cases.length;a++)for(let b=a;b<cases.length;b++){
 if(a!==b&&cases[a][1]===cases[b][1])continue;
 const r=make();cases[a][2](r);cases[b][2](r);const visible=cases[a][1]!=='sight'&&cases[b][1]!=='sight';updateEncounter(r,0,visible);r.encounter.age=1;
 const owner=cases[a][0];assert.equal(r.encounter.owner,owner,`${a}/${b}`);
 for(const[channel,allowed]of Object.entries(channels))assert.equal(encounterAllows(r,channel),allowed.includes(owner),`${a}/${b}/${channel}`);
 assert.equal(encounterQuiet(r),quiet.includes(owner));pairs++;
}
const timelines=[];
for(const fps of [15,30,60])for(const phase of ['opening','gather']){
 const r=make();r.panic.phase='panic';Object.assign(r.pressure,{phase,remaining:phase==='gather'?.8:3.4,seenPanic:1,choice:{kind:'cover'}});
 let samples=[],firstRam=null,transition=null;
 for(let i=0;i<fps*5&&r.mode==='driving';i++){
  const prior=r.pressure.phase,remaining=r.pressure.remaining;
  // Runtime caps physics steps at30Hz; a15Hz presentation advances two steps.
  const substeps=Math.ceil(30/fps);for(let step=0;step<substeps;step++)updateRun(r,{throttle:1},1/fps/substeps);
  if(prior===phase&&remaining>1/fps+.00001){assert.equal(r.joe.ram.phase,'none',`${phase}/${fps} was interrupted`);assert.equal(r.pressure.phase,phase);assert(!['windup','surge'].includes(r.tension.phase));assert.notEqual(r.panic.phase,'reveal');assert.equal(encounterAllows(r,'dialogue'),false);assert.equal(encounterAllows(r,'omen'),false);if(phase==='opening')assert.equal(scoreStage(r),'relief');}
  if(prior===phase&&r.pressure.phase!==phase)transition??=r.time-20;
  if(r.joe.ram.phase==='lineup')firstRam??=r.time-20;
  samples.push({time:r.time-20,owner:r.encounter.owner,pressure:r.pressure.phase,ram:r.joe.ram.phase,gap:distance(r.cart,r.joe),speed:r.joe.speed});
 }
 assert(transition!==null&&transition<4,`${phase} timer stalled: ${JSON.stringify({fps,transition,last:samples.at(-1),pressure:r.pressure,mode:r.mode})}`);assert(firstRam===null||firstRam>=transition);timelines.push({fps,phase,transition,firstRam,mode:r.mode,health:r.cart.health,samples});
}
// Independent consumers use the policy: no cross-channel beat may start in a
// gather/opening window, while the pressure owner's own countdown continues.
for(const phase of ['opening','gather']){
 const r=make();r.tension.cooldown=r.hunt.cooldown=0;Object.assign(r.pressure,{phase,remaining:.7,seenPanic:1});r.panic.armed=true;r.panic.phase='quiet';updateEncounter(r,0,true);const before=r.pressure.remaining;
 updateHunt(r,.1,true);updateTension(r,.1,true);updatePanic(r,.1,true);updatePressure(r,.1,true);
 assert.equal(r.hunt.phase,'follow');assert.equal(r.tension.phase,'stalk');assert.equal(r.panic.phase,'quiet');assert.equal(r.pressure.phase,phase);assert(r.pressure.remaining<before&&r.pressure.remaining>0);
 r.mode='paused';const frozen=JSON.stringify(r);updateRun(r,{throttle:1},1);assert.equal(JSON.stringify(r),frozen);
}
fs.writeFileSync(out+'/policy.json',JSON.stringify({passed:true,pairs,channels,timelines},null,2));console.log(JSON.stringify({passed:true,pairs,timelines:timelines.map(({samples,...r})=>r),checks:['priority pairs','channel ownership','live 15/30/60Hz windows','consumer agreement','music relief','pause']}));
