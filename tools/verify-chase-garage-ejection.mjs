import assert from 'node:assert/strict';
import {createRun,updateRun} from '../web/back-nine-sim.js';
import {leaveBrokenCart} from '../web/chase-player.js';
import {EXIT_RELEASE} from '../web/chase-tactics.js';
import {distance} from '../web/back-nine-course.js';

// A cart broken against the still-jammed garage shutter must not throw the
// runner past it: the shutter only opens from the release outside, so landing
// inside used to leave a run that could be neither won nor lost.
const checks=[];
for(const yaw of [-.11,0,.2]){
 const r=createRun(2);r.mode='driving';r.grace=0;
 Object.assign(r.cart,{x:-22.56,y:798.13,yaw,speed:0});Object.assign(r.joe,{x:-15,y:760,yaw:0,speed:0});
 leaveBrokenCart(r);
 assert(r.foot,'runner ejected');assert(r.foot.y<800,`yaw ${yaw}: runner landed past the closed shutter at y=${r.foot.y.toFixed(2)}`);
 checks.push({yaw,landing:[+r.foot.x.toFixed(2),+r.foot.y.toFixed(2)]});
}

// Natural ram against the shutter: the runner must be able to walk back to
// the release and come within its 4.5 m reach.
const r=createRun(2,0,1);r.mode='driving';r.grace=0;r.departure.phase='finished';
Object.assign(r.cart,{x:-22.56,y:798.13,yaw:0,speed:0,health:10});Object.assign(r.joe,{x:-22.5,y:788,yaw:0,speed:14});r.joe.ram.armed=true;
for(let i=0;i<600&&!r.foot;i++)updateRun(r,{brake:true},1/60);
assert(r.foot,'ram breaks the cart');assert(r.foot.y<800,'rammed runner stays outside the closed shutter');
r.foot.invulnerable=99;let reach=Infinity;
for(let i=0;i<240&&r.mode==='driving';i++){
 r.foot.yaw=Math.atan2(EXIT_RELEASE.x-r.foot.x,EXIT_RELEASE.y-r.foot.y);
 updateRun(r,{throttle:1},1/60);reach=Math.min(reach,distance(r.foot,EXIT_RELEASE));
}
assert(reach<4.5,`release reachable on foot (closest ${reach.toFixed(2)} m)`);
checks.push({ram:true,closestToRelease:+reach.toFixed(2)});
console.log(JSON.stringify({passed:true,checks}));
