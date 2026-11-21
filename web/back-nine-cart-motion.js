// Presentation-only cart suspension and steering. The body squats under
// power, dives under braking and settles through one overshoot; the front
// wheels turn with the steering input and every wheel rides the rough.
// Reads the simulation, never writes to it. The cart-damage envelope still
// clamps the combined body pose afterwards, so the roof stays inside the hull.
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const turn=(a,b)=>{let d=(a-b)%(Math.PI*2);if(d>Math.PI)d-=Math.PI*2;if(d<-Math.PI)d+=Math.PI*2;return d;};
export const CART_STEER_LOCK=.42;
export function createCartMotionState(){return {run:null,speed:0,yaw:0,pitch:0,pitchV:0,roll:0,rollV:0,steer:0,travel:0,bounce:[0,0,0,0],accel:0};}
// Under-damped spring: stiffness 110, damping 8.5 gives about one visible
// overshoot and rest inside half a second. Stepped at a bounded dt.
function spring(value,velocity,target,dt){
 for(let left=dt;left>1e-5;){const h=Math.min(left,1/120);left-=h;velocity+=((target-value)*110-velocity*8.5)*h;value+=velocity*h;}
 return [value,velocity];
}
export function stepCartMotion(s,run,dt,{reducedMotion=false,rough=0}={}){
 const c=run.cart;
 if(s.run!==run||run.foot||!(dt>0)){
  if(s.run!==run||run.foot){s.pitch=s.pitchV=s.roll=s.rollV=s.accel=0;s.bounce.fill(0);if(run.foot)s.steer*=.9;else s.steer=0;}
  s.run=run;s.speed=c.speed||0;s.yaw=c.yaw||0;return s;
 }
 const accel=clamp(((c.speed||0)-s.speed)/dt,-16,16),yawRate=turn(c.yaw||0,s.yaw)/dt,lateral=clamp(yawRate*(c.speed||0),-14,14);
 s.speed=c.speed||0;s.yaw=c.yaw||0;s.accel+=(accel-s.accel)*Math.min(1,dt*14);
 s.steer+=((clamp(c.steer||0,-1,1)*CART_STEER_LOCK*(1-.45*clamp(Math.abs(s.speed)/12,0,1)))-s.steer)*Math.min(1,dt*11);
 if(reducedMotion){s.pitch=s.pitchV=s.roll=s.rollV=0;s.bounce.fill(0);return s;}
 // Positive pitch lifts the nose (the cart faces local -z).
 [s.pitch,s.pitchV]=spring(s.pitch,s.pitchV,clamp(s.accel*.0026,-.022,.016),dt);
 // The authored lean already follows steer*speed; this adds only the sway
 // around it, so releasing the wheel rocks the body back through level.
 [s.roll,s.rollV]=spring(s.roll,s.rollV,clamp(-lateral*.0011,-.012,.012),dt);
 s.travel+=Math.abs(s.speed)*dt;
 const amount=clamp(rough,0,1)*clamp(Math.abs(s.speed)/5,0,1);
 for(let i=0;i<4;i++)s.bounce[i]=amount*(.017*Math.sin(s.travel*(3.1+i*.83)+i*1.9)+.009*Math.sin(s.travel*(7.7+i*1.31)+i*.7));
 return s;
}
export function createBackNineCartMotion(cart){
 const s=createCartMotionState();
 // Front axle: wheels 0 and 2 (see vehicle()); yaw before spin.
 for(const i of [0,2])cart.wheels[i].rotation.order='YXZ';
 return {
  // Before cart-damage: add to the body pose so its envelope still applies.
  body(run,dt,options){stepCartMotion(s,run,dt,options);if(run.foot)return;cart.body.rotation.x+=s.pitch;cart.body.rotation.z+=s.roll;cart.body.position.y-=Math.abs(s.pitch)*.9;},
  // After cart-damage (which rests every wheel) and before instanced parts.
  wheels(run){if(run.foot||(run.cart.health??100)<=0)return;for(let i=0;i<4;i++){const w=cart.wheels[i];w.position.y+=s.bounce[i];if(i===0||i===2)w.rotation.y-=s.steer;}},
  stats:()=>({pitch:s.pitch,roll:s.roll,steer:s.steer,accel:s.accel,bounce:Math.max(...s.bounce.map(Math.abs))}),
 };
}
