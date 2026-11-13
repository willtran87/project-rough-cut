import {cartMechanics} from './cart-mechanics.js';
const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));

// Shared simulation-time rhythm for the chassis and its motor. Presentation
// only: no steering, camera, vehicle root or collision state is modified.
export function cartRumble(run){
 const c=run.cart,j=run.joe,t=run.tension||{},time=run.time||0;
 const active=!run.foot&&(run.mode==='driving'||run.mode==='paused'),speed=Math.abs(c.speed);
 const roadFeel={path:1,rough:1.2,wet:1.1,sand:1.3}[c.surface]||1;
 // Driving itself feels strained, even with Joe distant or during start grace.
 // Protection removes the extra threat layer, not the moving suspension.
 const rolling=clamp(speed/6,0,1)*.64*roadFeel;
 const proximity=clamp((48-Math.hypot(c.x-j.x,c.y-j.y))/35,0,1);
 const threat=run.grace>0||t.phase==='breather'?0:proximity*clamp(.45+(t.intensity||0)*.55+(t.windup||0)*.2+(t.surge||0)*.2,0,1)*(.2+.8*clamp(speed/8,0,1))*.4;
 const panic=run.grace>0||t.phase==='breather'?0:(run.panic?.intensity||0)*.14*clamp(speed/8,0,1);
 const intensity=active?clamp(rolling+threat+panic,0,1):0;
 const mechanics=cartMechanics(run);
 const chatter=.5+.5*Math.sin(time*52);
 const strain=active?threat+panic:0;
 return {intensity,chatter,mechanics,heave:mechanics.heave+strain*Math.sin(time*12.8)*.018,pitch:mechanics.pitch+strain*Math.sin(time*9.7)*.009,roll:mechanics.roll+strain*Math.sin(time*8.2)*.014,detune:intensity*(Math.sin(time*35)*5+Math.sin(time*61)*2)+mechanics.engineDetune};
}
