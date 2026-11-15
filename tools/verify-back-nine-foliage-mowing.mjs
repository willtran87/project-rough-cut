import assert from 'node:assert/strict';
import {createFoliageMowingMemory} from '../web/back-nine-foliage-mowing.js';
import {createRun} from '../web/back-nine-sim.js';
import {DETAIL_PLANTS} from '../web/back-nine-planting.js';
function run(){const r=createRun(0,0,713);r.mode='driving';r.grace=0;r.time=20;Object.assign(r.joe,{x:0,y:0,yaw:0,speed:10,mode:'pursuing'});return r;}
const memory=createFoliageMowingMemory(),r=run();
const center=memory.register({group:'verge',x:0,y:1.45}),edge=memory.register({group:'verge',x:2.1,y:1.45}),ahead=memory.register({group:'verge',x:0,y:5});
assert.equal(memory.register({x:0,y:1.45}),0,'raised/woody plants excluded');
memory.update(r);assert(memory.sample(center).cut);assert(!memory.sample(edge).cut);assert(!memory.sample(ahead).cut);
r.time+=.1;memory.update(r);const partial=memory.sample(center).amount;assert(partial>0&&partial<1);
r.mode='paused';r.time+=1;memory.update(r);assert.equal(memory.sample(center).amount,partial);assert.equal(memory.stats().uploads,0);
r.mode='driving';r.joe.y=4;r.time+=.1;memory.update(r);assert(memory.sample(ahead).cut);
for(let i=0;i<5;i++){r.time+=.1;memory.update(r);}
assert.equal(memory.stats().active,0);assert.equal(memory.sample(center).amount,1);
assert(Math.abs(memory.sample(center).direction[0])<.005);assert.equal(memory.sample(center).direction[1],-1);
r.joe.speed=0;r.time+=50;memory.update(r);assert.equal(memory.stats().uploads,0);assert.equal(memory.sample(center).amount,1);
r.time=0;memory.update(r);assert.equal(memory.stats().cut,0,'time rewind clears cut history');
const fresh=run();fresh.joe.mode='patrol';memory.update(fresh);assert.equal(memory.stats().cut,0);
fresh.joe.mode='pursuing';memory.update(fresh,true);assert.equal(memory.sample(center).amount,1,'reduced motion settles directly');
const far=memory.register({group:'verge',x:0,y:20});fresh.time+=.1;fresh.joe.y=40;memory.update(fresh);assert(!memory.sample(far).cut,'teleport does not cut a bridge');
memory.dispose();
// Sweeping must find the same plants across a turn at ordinary frame rates.
function sweep(hz){const m=createFoliageMowingMemory(),r=run();for(let y=1;y<20;y+=.3)for(let x=-3;x<=3;x+=.4)m.register({group:'verge',x,y});for(let i=0;i<=hz*2;i++){const t=i/hz;r.time=20+t;r.joe.y=t*9;r.joe.x=Math.sin(t)*.5;r.joe.yaw=Math.atan2(Math.cos(t)*.5,9);m.update(r);}r.joe.speed=0;r.time+=1;m.update(r,true);const cuts=Array.from({length:m.stats().registered},(_,i)=>m.sample(i+1).cut);m.dispose();return cuts;}
const slow=sweep(30),fast=sweep(120),difference=slow.filter((v,i)=>v!==fast[i]).length;assert(difference<=2,`frame-rate edge disagreement ${difference}`);
const course=createFoliageMowingMemory();DETAIL_PLANTS.forEach(p=>course.register(p));assert.equal(course.stats().registered,DETAIL_PLANTS.length);assert(course.stats().registered<course.stats().capacity);assert.equal(course.stats().bytes,32768);
const wholeRun=run();for(const p of DETAIL_PLANTS){wholeRun.joe.x=p.x;wholeRun.joe.y=p.y-1.45;for(let i=0;i<2;i++){wholeRun.time+=.05;course.update(wholeRun,true);}}
assert.equal(course.stats().settled,DETAIL_PLANTS.length,'full course retains every authored cut');assert.equal(course.stats().bytes,32768);
const resetRun=run();resetRun.mode='briefing';course.update(resetRun);assert.equal(course.stats().cut,0);let disposed=false;course.texture.addEventListener('dispose',()=>disposed=true);course.dispose();assert(disposed);
console.log(JSON.stringify({passed:true,registered:DETAIL_PLANTS.length,frameRateEdgeDifference:difference,textureBytes:32768}));
