import assert from 'node:assert/strict';
import {createRun} from '../web/back-nine-sim.js';
import {COURSE} from '../web/back-nine-course.js';
import {COURSE_SOUND_SOURCES,courseAmbiencePlacement,courseAmbienceCaption} from '../web/chase-course-ambience.js';
import {chaseMessages} from '../web/back-nine-messages.js';
function runAt(x,y,checkpoint=0){const r=createRun(checkpoint,0,37161);r.mode='driving';r.grace=0;r.time=20;Object.assign(r.cart,{x,y,yaw:0,speed:0});Object.assign(r.joe,{x,y:y-85,speed:5});return r;}
assert.equal(COURSE_SOUND_SOURCES.length,7);
for(let i=0;i<COURSE.machinery.length;i++)assert.deepEqual([COURSE_SOUND_SOURCES[i].x,COURSE_SOUND_SOURCES[i].y],[COURSE.machinery[i].x,COURSE.machinery[i].y]);
let cases=0;
for(const source of COURSE_SOUND_SOURCES){
 const r=runAt(source.x-6,source.y,source.kind==='garage'?2:0),p=courseAmbiencePlacement(r);
 assert.equal(p.id,source.id);assert(p.mix>.6);assert(p.pan>0);assert(courseAmbienceCaption(r).includes('right'));cases++;
 for(const foot of [false,true])for(const rear of [false,true]){
  r.lookBack=rear;r.foot=foot?{...r.cart,onFoot:true,viewYaw:0,rearBlend:rear?1:0}:null;
  const q=courseAmbiencePlacement(r);assert.equal(Math.sign(q.pan),rear?-1:1);assert.equal(q.mix,p.mix);cases++;
 }
}
const r=runAt(28,190),before=JSON.stringify(r),scratch={};assert.equal(courseAmbiencePlacement(r,scratch),scratch);assert.equal(JSON.stringify(r),before,'Audio cannot mutate pursuit state');
assert.equal(chaseMessages(r).sound,'');assert.equal(chaseMessages(r).banner,'');assert(chaseMessages(r,{soundCaptions:true}).sound.includes('Irrigation pump'));
for(const owner of ['attack','intercept','gather','tension','finale']){r.encounter.owner=owner;assert.equal(courseAmbiencePlacement(r).mix,0);cases++;}r.encounter.owner='cruise';
r.joe.y=r.cart.y-8;assert.equal(courseAmbiencePlacement(r).mix,0);assert(chaseMessages(r,{soundCaptions:true}).sound.includes('Mower'));r.joe.y=r.cart.y-85;
for(const mode of ['briefing','paused','dying','caught','sealing','complete']){r.mode=mode;assert.equal(courseAmbiencePlacement(r).mix,0);cases++;}r.mode='driving';
for(const phase of ['lineup']){r.joe.ram.phase=phase;assert.equal(courseAmbiencePlacement(r).mix,0);}r.joe.ram.phase='none';
r.joe.ram.footCharge=1;assert.equal(courseAmbiencePlacement(r).mix,0);r.joe.ram.footCharge=0;r.panic.phase='reveal';assert.equal(courseAmbienceCaption(r),'');r.panic.phase='quiet';
const garage=COURSE_SOUND_SOURCES.at(-1),inside=runAt(garage.x+6,804,2),outside=runAt(garage.x-6,804,2),open=courseAmbiencePlacement(inside),closed=courseAmbiencePlacement(outside);
assert.equal(open.id,'garage');assert.equal(closed.id,'garage');assert.equal(open.occluded,false);assert.equal(closed.occluded,true);assert(Math.abs(closed.mix/open.mix-.4)<1e-9);assert(closed.cutoff<open.cutoff);assert(courseAmbienceCaption(outside).includes('muffled'));
inside.checkpoint=1;assert.equal(courseAmbiencePlacement(inside).id,'','Unpowered garage cannot advertise a powered circuit');
const shelter=COURSE_SOUND_SOURCES.find(s=>s.id==='shelter-0'),s=runAt(shelter.x-5,shelter.y);assert.equal(courseAmbiencePlacement(s).hz,60);s.checkpoint=1;assert.equal(courseAmbiencePlacement(s).hz,110);
for(const d of [22,23,40,70]){const far=runAt(34-d,190);assert.equal(courseAmbiencePlacement(far).id,'');cases++;}
const start=performance.now();for(let i=0;i<60000;i++){r.cart.x=28+Math.sin(i*.01);r.time=i/60;courseAmbiencePlacement(r,scratch);}const ms=performance.now()-start;
console.log(JSON.stringify({passed:true,cases:cases+14,samples:60000,ms,checks:['authored source locations','cart/foot rear glance','actual garage-wall muffling','powered garage only','priority and near-mower duck','optional captions','no simulation mutation','reused scratch output']}));
