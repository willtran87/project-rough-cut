import assert from 'node:assert/strict';
import fs from 'node:fs';
import {createRun,updateRun} from '../web/back-nine-sim.js';
import {leaveBrokenCart,moveRunner} from '../web/chase-player.js';
import {beginRamWindup} from '../web/mower-ram.js';
import {runnerCameraFraction} from '../web/runner-camera.js';
import {mowerBeacon} from '../web/mower-beacon.js';
import {listenerYaw} from '../web/runner-look.js';
import {blocked,distance} from '../web/back-nine-course.js';
const checks=[],tick=(r,input,n=1)=>{for(let i=0;i<n;i++)updateRun(r,input,1/60);};
function runner(){const r=createRun(1);r.mode='driving';Object.assign(r.cart,{x:0,y:305});Object.assign(r.joe,{x:0,y:290});leaveBrokenCart(r);r.time+=2;r.grace=0;r.foot.invulnerable=0;Object.assign(r.foot,{x:0,y:330,viewYaw:0,yaw:0});return r;}
const r=runner();r.grace=999;const p={...r.foot};tick(r,{throttle:1,lookX:1,lookY:1},20);assert.equal(r.foot.viewYaw,0);assert.equal(r.foot.x,p.x);assert(r.foot.y>p.y);const beforeTurn={...r.foot};tick(r,{steer:1},20);assert(r.foot.viewYaw>.8);assert.equal(r.foot.x,beforeTurn.x);assert.equal(r.foot.y,beforeTurn.y);const yaw=r.foot.viewYaw;tick(r,{rear:true,lookX:1,throttle:1},30);assert.equal(r.foot.viewYaw,yaw);assert(r.foot.rearBlend>.99);assert(Math.abs(listenerYaw(r)-yaw-Math.PI)<.01);tick(r,{},30);assert(r.foot.rearBlend<.01);checks.push('Mouse ignored; cart-style steering can turn in place; rear glance preserves heading');
// Parallel pressure against the fence still permits motion along it.
Object.assign(r.foot,{x:-31,y:349.1,viewYaw:Math.PI/4,yaw:Math.PI/4});const x=r.foot.x;for(let i=0;i<30;i++)moveRunner(r,{throttle:1},1/60);assert(r.foot.x>x+1);assert(r.foot.y<349.5);assert(!blocked(r.foot,.32));checks.push('Diagonal input slides along thin solid fencing without snagging or crossing');
assert(runnerCameraFraction({x:-31,y:351},{x:-31,y:346})<.2);assert.equal(runnerCameraFraction({x:-36.5,y:351},{x:-36.5,y:346}),1);checks.push('Analytic camera sweep detects thin boards but leaves foot gaps open');
const charge=runner();Object.assign(charge.joe,{x:0,y:318,yaw:0,lastSeen:{x:0,y:330},speed:5});beginRamWindup(charge);tick(charge,{},109);assert(charge.joe.ram.footCharge>1);const locked=charge.joe.ram.chargeYaw;let recovered=false,maxStep=0;
for(let i=0;i<240&&charge.mode==='driving';i++){const old={...charge.joe};tick(charge,{steer:i<24?-1:0,throttle:1});maxStep=Math.max(maxStep,distance(old,charge.joe));if(charge.joe.ram.footCharge>0)assert.equal(charge.joe.yaw,locked);if(charge.joe.ram.phase==='missed')recovered=true;}
assert.equal(charge.mode,'driving');assert(recovered);assert(maxStep<14.8/60+.001);checks.push('Warned foot charge locks its heading, can be dodged and enters recovery without teleporting');
const steady=mowerBeacon(0,0),reduced=mowerBeacon(1,1,true);assert.equal(steady.red,mowerBeacon(5,0).red);assert.equal(reduced.red,steady.red);assert(mowerBeacon(0,1).power>mowerBeacon(.8,1).power+90);checks.push('Slow beacon pulses have a steady warning at zero intensity or Reduced Motion');
fs.writeFileSync('output/back-nine-on-foot/controls.json',JSON.stringify({passed:true,checks,charge:{mode:charge.mode,maxStep,launches:charge.joe.ram.launches}},null,2));console.log(JSON.stringify({passed:true,checks}));
