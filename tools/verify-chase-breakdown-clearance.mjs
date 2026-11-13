import fs from 'node:fs';
import assert from 'node:assert/strict';
import {createRun,updateRun} from '../web/back-nine-sim.js';
import {leaveBrokenCart,moveRunner} from '../web/chase-player.js';
import {COURSE,blocked,distance} from '../web/back-nine-course.js';
import {hullOverlap,vehicleOverlap} from '../web/vehicle-contact.js';
const out='output/back-nine-experience/ejection';fs.mkdirSync(out,{recursive:true});
const results={route:0,feature:0,minimumOptions:99,minimumReach:99},timings=[];
function check(cart,joe,kind){
 if(blocked(cart,.85)||blocked(joe,1.65)||COURSE.features.some(f=>hullOverlap(cart,'cart',f,'feature')||hullOverlap(joe,'mower',f,'feature')))return;
 const r=createRun();r.mode='driving';Object.assign(r.cart,cart);Object.assign(r.joe,joe);
 const begin=performance.now();assert(leaveBrokenCart(r),'Legal cart placement has a landing');timings.push(performance.now()-begin);
 assert(!blocked(r.foot,.32));assert(!vehicleOverlap(r.foot,r.joe));assert(!hullOverlap(r.foot,'foot',r.cart,'cart'));assert(!COURSE.features.some(f=>hullOverlap(r.foot,'foot',f,'feature')));
 const start={...r.foot};r.time=2;let reach=0,options=0;
 // Actual swept player movement, not merely an empty destination point.
 for(let i=0;i<12;i++){r.foot={...start,yaw:i*Math.PI/6};for(let n=0;n<45;n++)moveRunner(r,{throttle:1},1/60);const d=distance(start,r.foot);reach=Math.max(reach,d);if(d>2)options++;}
 assert(reach>2&&options>=2,JSON.stringify({cart,joe,start,reach,options}));results[kind]++;results.minimumReach=Math.min(results.minimumReach,reach);results.minimumOptions=Math.min(results.minimumOptions,options);
}
for(const route of COURSE.paths)for(let k=1;k<route.length;k++){
 const a=route[k-1],b=route[k],len=Math.hypot(b[0]-a[0],b[1]-a[1]),yaw=Math.atan2(b[0]-a[0],b[1]-a[1]);
 for(let t=0;t<len;t+=7)for(const side of [-1,0,1]){const cart={x:a[0]+(b[0]-a[0])*t/len,y:a[1]+(b[1]-a[1])*t/len,yaw};check(cart,{x:cart.x-Math.sin(yaw)*6+Math.cos(yaw)*side*4,y:cart.y-Math.cos(yaw)*6-Math.sin(yaw)*side*4,yaw},'route');}
}
for(const f of COURSE.features)for(let i=0;i<12;i++)for(let h=0;h<4;h++){
 const angle=i*Math.PI/6,cart={x:f.x+Math.sin(angle)*(f.rx+2.1),y:f.y+Math.cos(angle)*(f.ry+2.1),yaw:h*Math.PI/4};check(cart,{x:cart.x-Math.sin(cart.yaw)*6,y:cart.y-Math.cos(cart.yaw)*6,yaw:cart.yaw},'feature');
}
function cover(wreck){const r=createRun();r.mode='driving';Object.assign(r.cart,{x:0,y:40});Object.assign(r.joe,{x:0,y:32,yaw:0,speed:0});leaveBrokenCart(r);r.time=2;r.grace=0;Object.assign(r.foot,{x:0,y:43,yaw:0,invulnerable:0});if(!wreck)Object.assign(r.cart,{x:25,y:25});let maxSide=0;
 while(r.time<40&&r.mode==='driving'){updateRun(r,{},1/60);maxSide=Math.max(maxSide,Math.abs(r.joe.x));assert(!vehicleOverlap(r.cart,r.joe),'Mower respects the wreck');}
 assert.equal(r.mode,'dying','Wreck is temporary cover, not permanent immunity');assert(r.joe.plans<80);return {seconds:r.time-2,maxSide,plans:r.joe.plans};
}
const wreck=cover(true),exposed=cover(false);assert(wreck.seconds>exposed.seconds+1.5);assert(wreck.maxSide>4);
const fatal=[];
for(const [x,y]of [[0,40],[-10,200],[0,325],[-24,749]]){const r=createRun(y>580?2:y>300?1:0);r.mode='driving';r.grace=0;Object.assign(r.cart,{x,y,health:10});Object.assign(r.joe,{x,y:y-5,speed:20,yaw:0});r.joe.ram.armed=true;
 for(let i=0;i<180&&!r.foot;i++)updateRun(r,{},1/60);
 assert(r.foot,'Physical ram destroys the cart');assert(r.foot.invulnerable>4.9);assert.equal(r.events.filter(e=>e.type==='abandon-cart').length,1);const from={...r.foot};
 for(let i=0;i<51;i++)updateRun(r,{throttle:1},1/60);assert.equal(distance(from,r.foot),0,'Validated landing is held through recovery');
 for(let i=0;i<24;i++)updateRun(r,{throttle:1},1/60);assert(distance(from,r.foot)>1,'Control returns promptly');assert.equal(r.mode,'driving');fatal.push({x,y,elapsed:r.time,moved:distance(from,r.foot)});
}
timings.sort((a,b)=>a-b);const report={passed:true,results,wreck,exposed,fatal,ejectionCpuMs:{median:timings[Math.floor(timings.length*.5)],p95:timings[Math.floor(timings.length*.95)],max:timings.at(-1)}};
fs.writeFileSync(out+'/clearance.json',JSON.stringify(report,null,2));console.log(JSON.stringify(report));
