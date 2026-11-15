import {createRun,updateRun} from '../web/back-nine-sim.js';
import {COURSE,angleDelta,clamp,distance} from '../web/back-nine-course.js';
const r=createRun();r.mode='driving';let i=1;let min=1000;let blocked=0;
for(let f=0;f<180*60&&r.mode==='driving';f++){
 const route=COURSE.paths[0];while(i<route.length-1&& (distance(r.cart,{x:route[i][0],y:route[i][1]})<7||r.cart.y>route[i][1]+2))i++;
 let target={x:route[i][0],y:route[i][1]};if(r.cart.y>788)target=COURSE.finish;
 const delta=angleDelta(Math.atan2(target.x-r.cart.x,target.y-r.cart.y),r.cart.yaw),near=distance(r.cart,COURSE.finish)<4.5;
 updateRun(r,{throttle:near?0:1,steer:clamp(delta*2,-1,1),brake:near||Math.abs(delta)>.7&&r.cart.speed>8},1/60);
 min=Math.min(min,distance(r.cart,r.joe));if(r.lastImpact>0)blocked++;
 if(f%600===0)console.log(Math.round(r.time),Math.round(r.cart.y),Math.round(r.joe.y),r.joe.mode,r.cart.hits,r.checkpoint);
}
console.log(JSON.stringify({mode:r.mode,time:r.time,cart:r.cart,joe:r.joe,min,blocked,events:r.events},null,2));
