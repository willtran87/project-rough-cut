import assert from 'node:assert/strict';
import {createRun} from '../web/back-nine-sim.js';
import {COURSE} from '../web/back-nine-course.js';
import {routeHint} from '../web/chase-route-guidance.js';
import {chaseMessages} from '../web/back-nine-messages.js';
import {updateDecoys,decoyCaption} from '../web/back-nine-decoys.js';

for(const d of COURSE.decisions){
 const r=createRun();r.mode='driving';r.grace=0;r.impact.age=9;r.messageTime=0;
 Object.assign(r.cart,d.entry);Object.assign(r.joe,{x:0,y:1});
 const cart=routeHint(r);assert(cart.length>20,d.id);assert(!/foot|run|wreck/i.test(cart),'Driving hints must preserve the breakdown surprise');
 assert.equal(chaseMessages(r).banner,'','Hints default off');assert.equal(chaseMessages(r,{routeHints:true}).banner,cart);
 r.foot={...r.cart,onFoot:true,invulnerable:0};const foot=routeHint(r);assert.notEqual(foot,cart);
 r.joe.ram.phase='lineup';assert.equal(routeHint(r),'');r.joe.ram.phase='none';r.hunt.phase='signal';assert.equal(routeHint(r),'');r.hunt.phase='follow';
 r.message='Maintenance relay online · checkpoint held.';r.messageTime=2;assert.match(chaseMessages(r,{routeHints:true}).banner,/Maintenance relay online/);
 r.foot.y=d.gate.y+3;assert.notEqual(routeHint(r),foot,'No stale instructions after passing this junction; a following fork may become eligible');
}
// Bell treadles were removed from Back Nine (dfbb6e5): no alarm stations, and
// the decoy stub never offers availability or a caption.
assert.equal(COURSE.alarms.length,0);
{const r=createRun();r.mode='driving';r.grace=0;for(const [visible,heard] of [[true,false],[false,true],[false,false]]){updateDecoys(r,{use:true},.35,visible,heard);assert.equal(r.decoys.availability,'away');assert.equal(r.decoys.hold,0);assert.equal(decoyCaption(r),'');}}
console.log('Route guidance passed: five forks, cart/foot context, default off, warning priority, no driving spoiler, no bell treadles.');
