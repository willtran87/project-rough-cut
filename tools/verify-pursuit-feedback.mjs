import assert from 'node:assert/strict';
import {createRun} from '../web/back-nine-sim.js';
import {createPursuitFeedback} from '../web/pursuit-feedback.js';
const make=()=>{const r=createRun();r.mode='driving';r.grace=0;r.cart.y=60;r.cart.speed=14;r.joe.y=48;r.joe.speed=24;r.joe.seenAge=0;r.tension.phase='stalk';return r;};
function settle(r,reduced=false){const f=createPursuitFeedback();for(let i=0;i<60;i++){r.time=i/60;f.update(r,reduced);}return f;}
const near=make(),a=settle(near),before=JSON.stringify(near),pose={...a.stats()};assert(pose.level>.8);assert(pose.fov>2.5&&pose.fov<=3.2);assert(Math.abs(pose.roll)<=.01);assert(Math.abs(pose.heave)<=.033);a.update(near);assert.equal(JSON.stringify(near),before,'Presentation cannot mutate gameplay');
const far=make();far.joe.y=5;assert.equal(settle(far).stats().level,0);
const slow=make();slow.joe.speed=14;assert(settle(slow).stats().level<pose.level*.3,'Closing velocity is distinguishable from proximity alone');
for(const kind of ['grace','invulnerable','backoff','lineup','opening','gather','breather','alarm','reveal','sealing','caught','death']){const r=make(),f=settle(r);if(kind==='grace')r.grace=1;else if(kind==='invulnerable')r.cart.invulnerable=1;else if(['backoff','lineup'].includes(kind))r.joe.ram.phase=kind;else if(['opening','gather'].includes(kind))r.pressure.phase=kind;else if(kind==='breather')r.tension.phase=kind;else if(kind==='alarm')r.decoys.active=0;else if(kind==='reveal')r.panic.phase=kind;else if(kind==='death')r.death={age:0};else r.mode=kind;assert.equal(f.update(r).level,0,kind);}
near.mode='paused';assert.deepEqual(a.update(near),pose,'Paused frame freezes the envelope and tremor');
const reduced=settle(make(),true).stats();assert(reduced.level>.8);assert.equal(reduced.roll,0);assert.equal(reduced.heave,0);assert.equal(reduced.fov,0);
const hidden=make(),h=settle(hidden);hidden.hunt.occluded=true;for(let i=0;i<60;i++){hidden.time+=1/60;h.update(hidden);}assert(h.stats().level<.001,'Lost sight fades the added approach layer');
console.log('PASS: real closing-speed intensity, bounded camera, pure presentation, pause, Reduced Motion, hidden fade and all escape gates');
