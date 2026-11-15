import fs from 'node:fs';
import {createRun,updateRun} from '../web/back-nine-sim.js';
import {COURSE,distance,angleDelta,clamp} from '../web/back-nine-course.js';
const rows=[],intercept=process.argv.includes('--intercept'),missed=process.argv.includes('--missed'),live=process.argv.includes('--live-windup');
for(let index=0;index<3;index++)for(const foot of [false,true])for(const gap of [25,40,60])for(const choice of ['gate','bend']){
 if(live&&(!foot||gap!==25))continue;
 const g=COURSE.shortcuts[index],gi=COURSE.hurdles.findIndex(h=>h.shortcut===index),r=createRun(index===2?2:index===1?1:0,0,37161);r.mode='driving';r.time=20;r.grace=0;r.departure.phase='finished';r.tension.cooldown=r.hunt.cooldown=100;r.tension.phase='stalk';r.tension.zoneMask=7;r.story.seen=7;r.story.choiceSeen=0xffff;
 const actor={x:g.from.x,y:g.from.y,yaw:g.yaw,speed:foot?7:14,viewYaw:g.yaw,onFoot:foot,invulnerable:0};if(foot){r.foot=actor;Object.assign(r.cart,{x:38,y:20,health:0,failedAt:0});}else Object.assign(r.cart,actor);
 Object.assign(r.joe,{x:g.from.x-Math.sin(g.yaw)*gap,y:Math.max(3,g.from.y-Math.cos(g.yaw)*gap),yaw:g.yaw,speed:foot?9:16});
 if(intercept){const p=COURSE.paths[0].find(p=>p[1]>g.from.y+10&&p[1]<g.to.y);Object.assign(r.joe,{x:p[0],y:p[1],yaw:g.yaw,speed:14});}
 if(missed){Object.assign(r.joe,{x:g.x-8,y:g.y+8,yaw:-1.2,speed:14});r.joe.ram.phase='missed';r.joe.ram.age=0;}
 if(live){Object.assign(r.foot,{x:g.x-13,y:g.y-8,speed:0,yaw:Math.atan2(13,5)});Object.assign(r.joe,{x:g.x-13,y:g.y-37.5,yaw:0,speed:6});}
 const route=choice==='gate'?[{x:g.x-Math.sin(g.yaw)*3,y:g.y-Math.cos(g.yaw)*3},g.to]:[...COURSE.paths[0].filter(p=>p[1]>g.from.y+1&&p[1]<g.to.y-2).map(([x,y])=>({x,y})),g.to];let cursor=0,finished=false,openAt=null,brokenAt=null,healthAtOpen=null,minGap=Infinity,maxPlans=0,windup=false,missAt=null;
 for(let n=0;n<2400&&r.mode==='driving';n++){
  const a=r.foot||r.cart,s=r.courseFX.breaks[gi],p=route[cursor];
  if(choice==='gate'&&cursor===0&&(s.open>.95||s.age>=0))cursor++;
  else if(!(choice==='gate'&&cursor===0)&&distance(a,p)<(foot?1.4:3.5)){if(cursor===route.length-1){finished=true;break;}cursor++;}
  const target=route[cursor],d=distance(a,target),turn=angleDelta(Math.atan2(target.x-a.x,target.y-a.y),a.yaw),waiting=choice==='gate'&&cursor===0,desired=waiting?clamp(d*2,0,14):14;
  const near=waiting&&d<1,steer=near?0:clamp(turn*2,-1,1),throttle=near?0:foot?(Math.abs(turn)<1.15?1:0):a.speed>desired||Math.abs(turn)>.9?0:1,brake=near||!foot&&(a.speed>desired+.2||Math.abs(turn)>.8&&a.speed>5);
  windup ||=r.joe.ram.phase==='lineup'&&r.joe.ram.age>=1.1;updateRun(r,live&&!windup?{}:{steer,throttle,brake},1/60);if(r.joe.ram.phase==='missed')missAt??=r.time-20;minGap=Math.min(minGap,distance(r.foot||r.cart,r.joe));maxPlans=Math.max(maxPlans,r.joe.plans);if(s.open===1&&openAt===null){openAt=r.time-20;healthAtOpen=r.cart.health;}if(s.age>=0)brokenAt??=r.time-20;
 }
 rows.push({index,foot,gap,choice,windup,missAt,finished,mode:r.mode,time:r.time-20,health:r.cart.health,hits:r.cart.hits,travel:r.foot?'foot':'cart',open:r.courseFX.breaks[gi].open,openAt,brokenAt,healthAtOpen,minGap,endGap:distance(r.foot||r.cart,r.joe),plans:maxPlans,player:r.foot||r.cart,joe:{x:r.joe.x,y:r.joe.y,phase:r.joe.ram.phase}});
}
fs.writeFileSync('output/back-nine-experience/manual-gates/'+(live?'live-windup-probe':intercept?'intercept-probe':missed?'missed-probe':'route-probe')+'.json',JSON.stringify(rows,null,2));console.log(JSON.stringify(rows.map(({player,joe,...r})=>r)));
