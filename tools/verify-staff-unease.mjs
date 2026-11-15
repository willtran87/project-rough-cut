import assert from 'node:assert/strict';
import fs from 'node:fs';
import {createRun} from '../web/back-nine-sim.js';
import {createUnease,updateUnease,sightingSafe} from '../web/chase-unease.js';
const make=()=>{const r=createRun();r.mode='driving';r.time=20;r.grace=0;r.cart.x=-23;r.cart.y=74;r.joe.x=0;r.joe.y=3;r.encounter.updated=true;r.encounter.owner='cruise';r.hunt.phase='follow';return r;};
function tick(s,r,observed,seconds){for(let i=0;i<Math.round(seconds*60);i++){r.time+=1/60;updateUnease(s,r,observed);}return s;}
let cases=0;
{
 const r=createRun(),s=createUnease(r);assert.equal(s.site,0,'fresh opening is dressed before the first frame');assert(s.opening);
 r.mode='driving';tick(s,r,[true,false],1);assert.equal(s.site,0,'initial protection does not remove existing scene dressing');
 r.mode='paused';const before={...s};tick(s,r,[false,false],2);assert.equal(s.site,before.site);assert.equal(s.seen,before.seen);
 r.mode='driving';r.departure.phase='notice';tick(s,r,[true,false],1);assert.equal(s.site,0,'first real reveal cannot blink out an already watched figure');
 tick(s,r,[false,false],.1);assert.equal(s.site,-1);assert.equal(s.used,1);assert(!s.opening);
 const fresh=createRun();for(const mutate of [r=>r.checkpoint=1,r=>r.time=1,r=>r.departure.phase='finished',r=>r.foot={...r.cart},r=>r.cart.health=60,r=>r.cart.hits=1,r=>r.mode='caught']){const r=structuredClone(fresh);mutate(r);assert.equal(createUnease(r).site,-1,'never insert opening dressing into a resumed or interrupted run');}
 cases+=9;
}
for(const mutate of [r=>r.mode='paused',r=>r.mode='briefing',r=>r.foot={...r.cart},r=>r.grace=1,r=>r.cart.invulnerable=1,r=>r.cart.speed=12,r=>r.joe.y=65,r=>r.joe.ram.phase='lineup',r=>r.joe.ram.footCharge=1,r=>r.hunt.phase='intercept',r=>r.tension.phase='windup',r=>r.lastImpact=.2,r=>r.finishHold=.1,...['search','attack','diversion','relief','checkpoint','recovery','finale','tension'].map(owner=>r=>r.encounter.owner=owner)]){
 const r=make(),s=createUnease();mutate(r);assert(!sightingSafe(r));tick(s,r,[false,false],2);assert.equal(s.site,-1);cases++;
}
{
 const r=make(),s=createUnease();tick(s,r,[true,true],2);assert.equal(s.site,-1,'never pop into a watched seat');
 tick(s,r,[false,false],1);assert.equal(s.site,0);assert.equal(s.phase,'staged');
 tick(s,r,[true,false],1);assert.equal(s.phase,'observed');
 const snapshot=JSON.stringify(s);for(let i=0;i<120;i++)updateUnease(s,r,[false,false]);assert.equal(JSON.stringify(s),snapshot,'duplicate renders cannot spend the look-away timer');
 r.mode='paused';tick(s,r,[false,false],10);assert.equal(s.site,0,'paused simulation does not remove an observed figure');r.mode='driving';
 r.joe.ram.phase='lineup';r.encounter.owner='attack';tick(s,r,[true,false],8);assert.equal(s.site,0,'no disappearance in view when a real attack starts');
 tick(s,r,[false,false],.3);assert.equal(s.site,-1,'attack suppresses an optional figure once off screen');assert.equal(s.used,1);
 r.joe.ram.phase='none';r.encounter.owner='cruise';tick(s,r,[false,false],60);assert.equal(s.site,-1,'one observed sighting per run');cases+=6;
}
{
 const r=make(),s=createUnease();tick(s,r,[false,false],1);tick(s,r,[true,false],.4);tick(s,r,[false,false],.4);assert.equal(s.site,0);tick(s,r,[true,false],.2);tick(s,r,[false,false],.4);assert.equal(s.site,0,'brief glances do not accumulate disappearance time');tick(s,r,[false,false],.3);assert.equal(s.site,-1);cases++;
}
{
 const r=make(),s=createUnease(),copy=JSON.stringify(r);updateUnease(s,r,[false,false]);assert.equal(JSON.stringify(r),copy,'visual controller never mutates movement, damage, AI or event/banner state');
 tick(s,r,[false,false],1);r.mode='caught';tick(s,r,[true,false],.1);assert.equal(s.site,-1);cases++;
}
fs.mkdirSync('output/back-nine-experience/staff-story',{recursive:true});fs.writeFileSync('output/back-nine-experience/staff-story/logic.json',JSON.stringify({passed:true,cases},null,2));console.log({passed:true,cases});
