import {COURSE,distance} from './back-nine-course.js';
import {repairCart} from './chase-player.js';
import {utilityPad,reserveRepair} from './chase-utility.js';

export const SERVICE_CAPACITY=25,SERVICE_SECONDS=3.5;
export function createService(collected=0,choices=[]){return {near:-1,active:-1,credit:0,remaining:[0,1].map(i=>collected&(1<<i)||choices[i]?0:SERVICE_CAPACITY),applied:[0,0],transfers:0};}
function transfer(run,index){
 const s=run.service;if(index<0||run.foot||run.cart.health<=0)return;
 const amount=Math.min(s.remaining[index],Math.floor(s.credit+1e-7),100-run.cart.health);
 if(amount<=0||!repairCart(run,amount))return;
 reserveRepair(run,index);
 s.credit=Math.max(0,s.credit-amount);s.remaining[index]-=amount;s.applied[index]+=amount;s.transfers++;
 if(s.remaining[index]===0)run.events.push({type:'service-empty',index,time:run.time});
}
export function updateService(run,input,dt){
 if(run.mode==='paused')return;
 const s=run.service||(run.service=createService(run.story?.collected)),c=run.cart;
 s.near=run.mode==='driving'&&!run.foot&&c.health>0&&c.health<100&&utilityPad(c)<0?COURSE.checkpoints.findIndex((p,i)=>s.remaining[i]>0&&distance(c,p)<4.5):-1;
 const next=s.near>=0&&input.brake&&Math.abs(c.speed)<.7?s.near:-1;
 if(next!==s.active){transfer(run,s.active);s.credit=0;s.active=next;}
 if(s.active<0)return;
 s.credit+=dt*SERVICE_CAPACITY/SERVICE_SECONDS;
 // Five transfers over a full stop. Avoid deforming/uploading the detailed
 // cart mesh every simulation tick. Releasing early keeps whole earned HP.
 if(s.credit+1e-7>=Math.min(5,s.remaining[s.active],100-c.health))transfer(run,s.active);
}
export function serviceCaption(run){
 const s=run.service;if(!s||s.near<0)return '';
 const remaining=Math.ceil(s.remaining[s.near]);
 return s.active>=0?`CHARGER · ${remaining} repair left · release brake to leave`:`Hold the brake for up to ${remaining} repair. Joe keeps moving while you charge.`;
}
