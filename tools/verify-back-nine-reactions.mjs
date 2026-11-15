import assert from 'node:assert/strict';
import {createRun} from '../web/back-nine-sim.js';
import {leaveBrokenCart} from '../web/chase-player.js';
import {updateShortcuts} from '../web/chase-shortcuts.js';
import {COURSE} from '../web/back-nine-course.js';
import {createJoeReactions} from '../web/back-nine-reactions.js';

let calls=0;
const make=()=>createJoeReactions((token,kind)=>`${kind} reaction ${++calls}`);
const run=()=>{const r=createRun();r.mode='driving';r.grace=0;r.time=20;return r;};
const event=(r,type,extra={})=>r.events.push({type,time:r.time,...extra});
for(const [type,kind,extra]of [['contact','damage',{damage:12}],['shortcut','shortcut',{}]]){
 const r=run(),c=make();event(r,type,extra);const before=JSON.stringify(r);c.observe(r);
 assert.equal(c.caption(r,true),'','Urgent warnings suppress reaction');
 const text=c.caption(r);assert.match(text,new RegExp(kind));
 for(let i=0;i<100;i++){c.observe(r);assert.equal(c.caption(r),text);}
 assert.equal(JSON.stringify(r),before,'Presentation never mutates run');
 r.mode='paused';c.observe(r);assert.equal(c.caption(r),'');r.mode='driving';assert.equal(c.caption(r),text);
 r.time+=5;c.observe(r);assert.equal(c.caption(r),'','Finite display lifetime');
}
{
 const r=run(),c=make();event(r,'contact',{damage:0});c.observe(r);assert.equal(c.caption(r),'','Glancing undamaged contact is not damage');
 r.hunt.occluded=true;r.hunt.hiddenTime=2.1;c.observe(r);assert.equal(c.caption(r),'','No flicker-triggered hiding');
 r.hunt.hiddenTime=2.3;c.observe(r);assert.match(c.caption(r),/hiding/);
 r.hunt.occluded=false;c.observe(r);assert.equal(c.caption(r),'','Reacquisition ends hiding remark');
}
{
 const r=run(),c=make();c.observe(r);r.hunt.choiceMask=2;c.observe(r);assert.match(c.caption(r),/shortcut/,'Observed fork qualifies');
}
{
 const r=run(),c=make();event(r,'contact',{damage:100});assert(leaveBrokenCart(r));c.observe(r);
 assert.match(c.caption(r),/foot/,'Actual cart abandonment beats damage in the same tick');
}
{
 const r=run(),c=make(),g=COURSE.hurdles.find(h=>h.shortcut!==undefined);
 Object.assign(r.cart,{x:g.x,y:g.y,yaw:g.yaw,speed:5});
 updateShortcuts(r,{throttle:1},1/60,{x:g.x-Math.sin(g.yaw)*.4,y:g.y-Math.cos(g.yaw)*.4,yaw:g.yaw});
 assert(r.events.some(e=>e.type==='shortcut'));c.observe(r);assert.match(c.caption(r),/shortcut/,'Actual gate opening qualifies');
}
{
 const r=run(),c=make();event(r,'shortcut');c.observe(r);const first=c.caption(r);
 r.time+=6;event(r,'contact',{damage:10});c.observe(r);assert.equal(c.caption(r),'','Global cooldown');
 r.time+=29;c.observe(r);assert.equal(c.caption(r),'','Stale event is not queued for the next quiet slot');
 event(r,'contact',{damage:10});c.observe(r);assert.match(c.caption(r),/damage/);
 r.time+=35;event(r,'shortcut');c.observe(r);assert.notEqual(c.caption(r),first,'Later same-kind event gets a fresh selection token');
}
{
 const r=run(),c=make();event(r,'shortcut');c.observe(r);r.time+=13;c.observe(r);assert.equal(c.caption(r),'','No stale delayed reaction');
 event(r,'contact',{damage:12});c.observe(r);r.mode='dying';c.observe(r);r.mode='driving';assert.equal(c.caption(r),'','Death clears pending reactions');
 const fresh=run();c.observe(fresh);assert.equal(c.caption(fresh),'','Retry does not replay another run');
}
console.log(JSON.stringify({passed:true,checks:['four contexts','real gate/ejection events','observed forks','hiding threshold/reacquisition','priority','cooldowns','expiry','pause','death/retry cleanup','no simulation mutation']}));
