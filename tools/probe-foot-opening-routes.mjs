import {createRun,updateRun} from '../web/back-nine-sim.js';
import {leaveBrokenCart} from '../web/chase-player.js';
import {COURSE,angleDelta,clamp,distance} from '../web/back-nine-course.js';
const nursery=[...COURSE.paths[1],...COURSE.paths[0].filter(p=>p[1]>190)],main=COURSE.paths[0];
const routes=[['old',[[0,45],...nursery]],['main',main],['cut',[[0,45],[0,60],[0,108],...nursery]],['east',[[0,45],[20,65],[30,105],[30,135],[18,155],...COURSE.paths[7].slice(1),...main.filter(p=>p[1]>280)]] ,['west',[[0,45],[-28,62],[-34,85],...nursery.slice(1)]],['early-west',[[0,24],[-22,35],[-30,65],...nursery.slice(1)]]];
for(const [name,route]of routes){const r=createRun(0,0,42);r.mode='driving';leaveBrokenCart(r);let i=0;
for(let f=0;f<240*60&&['driving','sealing'].includes(r.mode);f++){const c=r.foot;while(i<route.length-1&&(distance(c,{x:route[i][0],y:route[i][1]})<2||c.y>route[i][1]+2))i++;const t=c.y>796?COURSE.finish:{x:route[i][0],y:route[i][1]},near=distance(c,COURSE.finish)<1,turn=angleDelta(Math.atan2(t.x-c.x,t.y-c.y),c.yaw);updateRun(r,{throttle:near||Math.abs(turn)>1.1?0:1,steer:near?0:clamp(turn*2,-1,1),brake:near},1/60);}
console.log(JSON.stringify({name,mode:r.mode,seconds:r.time,x:r.foot.x,y:r.foot.y,joe:[r.joe.x,r.joe.y],ram:r.joe.ram.phase,checkpoints:r.checkpoint}));}
