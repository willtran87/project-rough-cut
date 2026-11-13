// An actual working mower on the first fairway, not a spawned attack or a
// camera takeover. The same collision/pathing owners move it throughout.
export const DEPARTURE_SPAWN={x:22,y:94,yaw:-Math.PI/2};
const WORK_END={x:6,y:94};
export const createDeparture=checkpoint=>({phase:checkpoint?'finished':'working',age:0,observed:null,revealedAt:null,releasedAt:null});
const interrupted=run=>run.foot||run.checkpoint>0||run.cart.hits>0||run.cart.health<run.cart.maxHealth||run.cart.y>115||run.joe.ram.phase!=='none'||run.joe.ram.footCharge>0||run.joe.ram.release>0;
export const departureActive=run=>!!run.departure&&run.departure.phase!=='finished'&&!interrupted(run);
export function updateDeparture(run,dt,visible){
 const d=run.departure;if(!d||d.phase==='finished')return;
 d.age+=dt;
 // Recovery, real impacts and leaving the opening district take precedence.
 // A checkpoint retry never repeats the introductory performance.
 if(interrupted(run)){d.phase='finished';return;}
 if(d.phase==='working'&&visible&&(run.cart.y>=58||Math.hypot(run.cart.x-run.joe.x,run.cart.y-run.joe.y)<26||run.time>=11.5)){
  d.phase='notice';d.age=0;d.revealedAt=run.time;d.observed={x:run.cart.x,y:run.cart.y};run.joe.repath=0;
  run.events.push({type:'opening-notice',time:run.time});
 }else if(d.phase==='notice'&&d.age>=1.65){
  d.phase='finished';d.releasedAt=run.time;run.joe.repath=0;
  // Let the physical approach/ram warning own the next beat, rather than
  // immediately layering another generic surge or passing display over it.
  run.tension.cooldown=Math.max(run.tension.cooldown,3);
  run.hunt.cooldown=Math.max(run.hunt.cooldown,3);
  run.events.push({type:'opening-pursuit',time:run.time});
 }
}
export function departureTarget(run){const d=run.departure;return !departureActive(run)?null:d.phase==='working'?WORK_END:d.observed;}
export function departureSpeedLimit(run){return !departureActive(run)?Infinity:run.departure.phase==='working'?3.2:0;}
