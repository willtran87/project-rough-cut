import fs from 'node:fs';
import {traverse} from './probe-under-green-folded.mjs';
import {nearbyAction,snapshot} from '../web/under-green-sim.js';
import {keeperInside,GATE,SLUICE} from '../web/under-green-course.js';
let final;
const samples=[];
const result=traverse({cp:2,crouch:true,wet:false,timedKeeper:true,timeOffset:8.5,dodge:true,inspect:r=>{
 final=r;
 if(r.steps%60===0)samples.push({time:r.time,player:{...r.player},joe:{x:r.joe.x,y:r.joe.y,yaw:r.joe.yaw,phase:r.joe.phase,age:r.joe.age},closing:r.closing,gate:r.gate,action:nearbyAction(r)});
}});
const out='output/under-green/range-cadence/advised';fs.mkdirSync(out,{recursive:true});
fs.writeFileSync(out+'/keeper-stall.json',JSON.stringify({initial:structuredClone(final),result,samples},null,2));
console.log(JSON.stringify({mode:result.mode,goal:result.goal,player:final.player,joe:final.joe,gate:final.gate,closing:final.closing,action:nearbyAction(final),playerInside:keeperInside(final.player),joeInside:keeperInside(final.joe),save:snapshot(final),GATE,SLUICE},null,2));
