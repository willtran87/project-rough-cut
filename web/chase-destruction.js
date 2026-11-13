import {isDestructibleFeature} from './course-destruction-state.js';
import {COURSE,blocked,clamp,distance} from './back-nine-course.js';
import {constrainVehicleMotion,constrainFeatureMotion} from './vehicle-contact.js';
import {emitCourseCue} from './back-nine-course-fx.js';

// Movable maintenance supplies beside the alternate fairways. Every visible
// crate/trolley has the same footprint used by player contact and mower strikes.
export const BREAKABLE_PROPS=[
 {id:'tee-ten-bench',kind:'bench',x:10,y:40,rx:1.3,ry:.5},
 {id:'tee-twelve-washer',kind:'washer',x:-31,y:173,rx:.4,ry:.4},
 {id:'tee-thirteen-washer',kind:'washer',x:21,y:287,rx:.4,ry:.4},
 {id:'range-bench',kind:'bench',x:25,y:423,rx:1.3,ry:.5},
 {id:'tee-seventeen-bench',kind:'bench',x:19,y:593,rx:1.3,ry:.5},
 {id:'tee-eighteen-washer',kind:'washer',x:-28,y:628,rx:.4,ry:.4},
 {id:'nursery-crates',kind:'crates',x:-28.8,y:148,rx:1.05,ry:.8},
 {id:'nursery-trolley',kind:'trolley',x:-18.8,y:163,rx:.8,ry:1.15},
 {id:'pump-crates',kind:'crates',x:-31.4,y:437,rx:1.05,ry:.8},
 {id:'pump-trolley',kind:'trolley',x:-25.2,y:454,rx:.8,ry:1.15},
 {id:'range-crates',kind:'crates',x:29.6,y:681,rx:1.05,ry:.8},
 {id:'range-trolley',kind:'trolley',x:23.4,y:700,rx:.8,ry:1.15}
];
export const createDestruction=()=>({features:Object.fromEntries(COURSE.features.filter(isDestructibleFeature).map(f=>[f.id,{brokenAt:null,dx:0,dy:1,power:0}])),props:BREAKABLE_PROPS.map(()=>({brokenAt:null,dx:0,dy:1,power:0})),serial:0});
export const createWreck=()=>({crush:0,hits:0,vx:0,vy:0,spin:0,cooldown:0,lastHit:-99});
export function constrainMaintenanceProps(run,actor,from,kind){
 let hit=false;
 for(let i=0;i<BREAKABLE_PROPS.length;i++){
  if(run.destruction.props[i].brokenAt!==null)continue;
  const prop=BREAKABLE_PROPS[i];if(distance(from,prop)>8&&distance(actor,prop)>8)continue;
  if(kind!=='mower'){hit=constrainVehicleMotion(actor,from,prop,kind,'feature')||hit;continue;}
  const incoming=Math.abs(actor.speed),probe={...actor};
  if(!constrainVehicleMotion(probe,from,prop,'mower','feature'))continue;
  if(incoming<.4){Object.assign(actor,probe);hit=true;continue;}
  Object.assign(run.destruction.props[i],{brokenAt:run.time,dx:Math.sin(actor.yaw),dy:Math.cos(actor.yaw),power:clamp(incoming/15,.3,1)});
  run.destruction.serial++;run.events.push({type:'joe-destruction',id:prop.id,time:run.time});
  emitCourseCue(run.courseFX,'timber',prop,clamp(incoming/15,.4,1));
  actor.speed*=.91;
 }
 return hit;
}
export function strikeWreck(run,from){
 if(!run.foot||run.cart.health>0||run.wreck.crush>=1)return false;
 const j=run.joe,w=run.wreck,incoming=Math.abs(j.speed);
 if(distance(j,run.cart)>7&&distance(from,run.cart)>7)return false;
 if(!constrainVehicleMotion(j,from,run.cart,'mower','cart'))return false;
 if(w.cooldown>0||incoming<.4)return true;
 const dx=run.cart.x-j.x,dy=run.cart.y-j.y,d=Math.hypot(dx,dy)||1,power=clamp(incoming*.65,2.4,11);
 w.vx=dx/d*power;w.vy=dy/d*power;w.spin=clamp((dx*Math.cos(j.yaw)-dy*Math.sin(j.yaw))*.35,-.8,.8);
 w.crush=clamp(w.crush+.18+incoming*.018,0,1);w.hits++;w.lastHit=run.time;w.cooldown=.32;
 run.events.push({type:'wreck-struck',crush:w.crush,time:run.time});emitCourseCue(run.courseFX,'metal',run.cart,clamp(incoming/15,.4,1));
 j.repath=0;return true;
}
export function advanceWreck(run,dt){
 const w=run.wreck;if(!w)return;w.cooldown=Math.max(0,w.cooldown-dt);
 if(!run.foot||run.cart.health>0)return;
 const c=run.cart,steps=Math.max(1,Math.ceil(Math.hypot(w.vx,w.vy)*dt/.1));
 for(let i=0;i<steps;i++){
  const from={x:c.x,y:c.y,yaw:c.yaw},to={...c,x:c.x+w.vx*dt/steps,y:c.y+w.vy*dt/steps,yaw:c.yaw+w.spin*dt/steps};
  if(blocked(to,.85)){w.vx=w.vy=w.spin=0;break;}
  const hit=constrainFeatureMotion(to,from,'cart',run)|constrainVehicleMotion(to,from,run.foot,'cart','foot')|constrainMaintenanceProps(run,to,from,'cart');
  c.x=to.x;c.y=to.y;c.yaw=to.yaw;
  if(hit){w.vx=w.vy=w.spin=0;break;}
 }
 const drag=Math.exp(-dt*2.8);w.vx*=drag;w.vy*=drag;w.spin*=drag;c.speed=0;
}

export function mowerMouthTarget(run){
 const j=run.joe,cutting=run.mode==='driving'&&run.grace<=0&&j.speed>2&&
  !['patrol','starting','working','watching'].includes(j.mode)&&!['backoff','missed'].includes(j.ram.phase);
 return {cutting,height:cutting?.25:.68};
}
