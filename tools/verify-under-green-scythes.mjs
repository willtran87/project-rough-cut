import assert from 'node:assert/strict';
import {panicCameraMotion} from '../web/under-green-camera-motion.js';
import {SCYTHE_BLADE,SCYTHE_CONTACT} from '../web/under-green-scythe.js';
import {TRIMMER} from '../web/under-green-trimmer.js';
const joe={x:0,y:6,phase:'walk'},player={x:0,y:0,speed:6,walk:1.3,sprinting:true};
assert.deepEqual(panicCameraMotion(player,joe,.6,true),{height:0,pitch:0,roll:0});
assert.deepEqual(panicCameraMotion(player,joe,0),{height:0,pitch:0,roll:0});
assert.deepEqual(panicCameraMotion({...player,speed:0},joe,.6),{height:0,pitch:0,roll:0});
for(let i=0;i<1000;i++){const v=panicCameraMotion({...player,walk:i*.03},joe,.6);assert(Math.abs(v.height)<=.04);assert(Math.abs(v.pitch)<.008);assert(Math.abs(v.roll)<.011);}
const {near:a,far:b,radius}=SCYTHE_CONTACT,dx=b[0]-a[0],df=b[1]-a[1];
for(const [x,f]of SCYTHE_BLADE){const t=Math.max(0,Math.min(1,((x-a[0])*dx+(f-a[1])*df)/(dx*dx+df*df)));assert(Math.hypot(x-a[0]-t*dx,f-a[1]-t*df)<=radius);}
assert(Math.max(...SCYTHE_BLADE.map(p=>p[0]))-Math.min(...SCYTHE_BLADE.map(p=>p[0]))>1,'Scythe extends visibly sideways');
console.log(JSON.stringify({passed:true,maxBobMetres:.04,bladeWithinScytheHitCapsule:true}));
